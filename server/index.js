// Requiert Node.js >= 22.10 (node:sqlite intégré, sans flag)
const { DatabaseSync } = require("node:sqlite");
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "mante.db");

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ─── BASE DE DONNÉES ──────────────────────────────────────────────────────────
const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id          INTEGER PRIMARY KEY,
    code        TEXT    DEFAULT '',
    name        TEXT    NOT NULL,
    description TEXT    DEFAULT '',
    status      TEXT    DEFAULT 'active',
    color       TEXT    DEFAULT '#6b7280',
    created_at  TEXT,
    notes       TEXT    DEFAULT '',
    tags          TEXT  DEFAULT '[]',
    links         TEXT  DEFAULT '{}',
    conversations TEXT  DEFAULT '[]',
    timeline      TEXT  DEFAULT '[]',
    updated_at  TEXT    DEFAULT (datetime('now'))
  )
`);

// ─── SÉRIALISATION ────────────────────────────────────────────────────────────
function rowToProject(row) {
  return {
    id:            row.id,
    code:          row.code,
    name:          row.name,
    description:   row.description,
    status:        row.status,
    color:         row.color,
    createdAt:     row.created_at,
    notes:         row.notes,
    tags:          JSON.parse(row.tags          || "[]"),
    links:         JSON.parse(row.links         || "{}"),
    conversations: JSON.parse(row.conversations || "[]"),
    timeline:      JSON.parse(row.timeline      || "[]"),
  };
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, version: "1.0.0", db: DB_PATH });
});

app.get("/api/projects", (_req, res) => {
  try {
    const rows = db.prepare(
      "SELECT * FROM projects ORDER BY created_at ASC"
    ).all();
    res.json(rows.map(rowToProject));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remplace toute la liste : upsert chaque projet + supprime les retirés
app.put("/api/projects", (req, res) => {
  const projects = req.body;
  if (!Array.isArray(projects)) {
    return res.status(400).json({ error: "Expected array" });
  }

  const upsert = db.prepare(`
    INSERT INTO projects
      (id, code, name, description, status, color, created_at, notes,
       tags, links, conversations, timeline, updated_at)
    VALUES
      (:id, :code, :name, :description, :status, :color, :created_at, :notes,
       :tags, :links, :conversations, :timeline, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      code          = excluded.code,
      name          = excluded.name,
      description   = excluded.description,
      status        = excluded.status,
      color         = excluded.color,
      notes         = excluded.notes,
      tags          = excluded.tags,
      links         = excluded.links,
      conversations = excluded.conversations,
      timeline      = excluded.timeline,
      updated_at    = datetime('now')
  `);

  try {
    db.exec("BEGIN");

    // Supprimer les projets qui ne sont plus dans la liste
    const ids = projects.map((p) => p.id);
    db.prepare(
      `DELETE FROM projects WHERE id NOT IN (${ids.map(() => "?").join(",")})`
    ).run(...ids);

    for (const p of projects) {
      upsert.run({
        id:            p.id,
        code:          p.code          || "",
        name:          p.name,
        description:   p.description   || "",
        status:        p.status        || "active",
        color:         p.color         || "#6b7280",
        created_at:    p.createdAt     || new Date().toISOString().slice(0, 7),
        notes:         p.notes         || "",
        tags:          JSON.stringify(p.tags          || []),
        links:         JSON.stringify(p.links         || {}),
        conversations: JSON.stringify(p.conversations || []),
        timeline:      JSON.stringify(p.timeline      || []),
      });
    }

    db.exec("COMMIT");
    res.json({ ok: true, count: projects.length });
  } catch (err) {
    db.exec("ROLLBACK");
    res.status(500).json({ error: err.message });
  }
});

// ─── SETTINGS (clé API) ───────────────────────────────────────────────────────
app.get("/api/settings", (_req, res) => {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'api_key'").get();
  res.json({ hasApiKey: !!row });
});

app.put("/api/settings", (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== "string") {
    return res.status(400).json({ error: "apiKey requis" });
  }
  db.prepare(
    "INSERT OR REPLACE INTO settings (key, value) VALUES ('api_key', ?)"
  ).run(apiKey.trim());
  res.json({ ok: true });
});

// ─── PROXY CLAUDE ─────────────────────────────────────────────────────────────
app.post("/api/claude", async (req, res) => {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'api_key'").get();
  if (!row) return res.status(401).json({ error: "Clé API non configurée sur le serveur" });

  const { message, systemPrompt } = req.body;
  if (!message) return res.status(400).json({ error: "message requis" });

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         row.value,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 4096,
        system:     systemPrompt,
        messages:   [{ role: "user", content: message }],
      }),
    });

    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json(data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`MANTE API   → http://localhost:${PORT}/api/health`);
  console.log(`SQLite      → ${DB_PATH}`);
});
