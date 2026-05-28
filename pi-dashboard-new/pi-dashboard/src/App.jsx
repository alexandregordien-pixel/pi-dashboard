import { useState, useRef, useEffect } from "react";

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const AUTH_HASH = "4d013ab6b7f57a5b84172aa0afb2f7d3125863c31c056df6f211471d722d4e90";

async function hashPassword(pw) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function LoginScreen({ onAuth }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async () => {
    const h = await hashPassword(pw);
    if (h === AUTH_HASH) {
      onAuth();
    } else {
      setErr(true);
      setShake(true);
      setPw("");
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#080808", display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "'Rajdhani', sans-serif",
    }}>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)}
        }
        @keyframes fadein { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div style={{
        animation: "fadein 0.4s ease",
        width: "340px", padding: "40px",
        background: "#0d0d0d", border: "1px solid #1e1e1e",
        borderTop: "2px solid #00e5ff",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "11px", color: "#00e5ff", letterSpacing: "4px", marginBottom: "8px" }}>
            DASHBOARD
          </div>
          <div style={{ fontSize: "13px", color: "#444", letterSpacing: "2px", fontFamily: "'Share Tech Mono', monospace" }}>
            ACCÈS RESTREINT
          </div>
        </div>
        <div style={{ animation: shake ? "shake 0.5s ease" : "none" }}>
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setErr(false); }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="Mot de passe"
            autoFocus
            style={{
              width: "100%", boxSizing: "border-box", background: "#0a0a0a",
              border: `1px solid ${err ? "#ff4444" : "#1e1e1e"}`,
              color: "#fff", fontFamily: "'Share Tech Mono', monospace",
              fontSize: "13px", padding: "12px 14px", outline: "none",
              borderRadius: "1px", marginBottom: "12px", letterSpacing: "3px",
            }}
          />
          {err && <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: "#ff4444", marginBottom: "10px", letterSpacing: "1px" }}>
            MOT DE PASSE INCORRECT
          </div>}
          <button onClick={handleSubmit} style={{
            width: "100%", background: "#00e5ff18", border: "1px solid #00e5ff44",
            color: "#00e5ff", fontFamily: "'Share Tech Mono', monospace", fontSize: "11px",
            padding: "11px", cursor: "pointer", letterSpacing: "2px", transition: "all 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#00e5ff28"}
            onMouseLeave={e => e.currentTarget.style.background = "#00e5ff18"}>
            ACCÉDER
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DONNÉES ──────────────────────────────────────────────────────────────────
const INITIAL_PROJECTS = [
  {
    id: 1, code: "AZM", name: "AZIMUT",
    description: "Cartographie des compétences AFGSU — Python / Streamlit / SQLite / LLM",
    status: "active", tags: ["Python", "Streamlit", "SQLite", "OpenAI"],
    links: { github: "https://github.com/alexandregordien-pixel/azimut", docs: "" },
    conversations: [
      { label: "Architecture AZIMUT v2", url: "https://claude.ai" },
      { label: "Article RSI — corrections", url: "https://claude.ai" },
      { label: "Présentation CSIRMT", url: "https://claude.ai" },
    ],
    notes: "",
    timeline: [
      { id: 1, date: "2025-01", label: "Démarrage du projet", done: true },
      { id: 2, date: "2025-03", label: "Collecte des données (23 soignants)", done: true },
      { id: 3, date: "2025-05", label: "Présentation CSIRMT", done: true },
    ],
    color: "#00e5ff",
  },
  {
    id: 2, code: "RIFC", name: "RIFC AFGSU",
    description: "Référentiel Interne de Formation et Certification — Word / Node.js / docx",
    status: "complete", tags: ["Node.js", "docx", "Word"],
    links: { github: "", docs: "" },
    conversations: [
      { label: "Génération RIFC complet", url: "https://claude.ai" },
      { label: "Charte graphique militaire", url: "https://claude.ai" },
    ],
    notes: "",
    timeline: [
      { id: 1, date: "2025-03", label: "Démarrage rédaction", done: true },
      { id: 2, date: "2025-04", label: "Livraison document final", done: true },
    ],
    color: "#69ff47",
  },
  {
    id: 3, code: "CCS", name: "Concours Cadre de Santé",
    description: "Préparation concours — CV, compétences, TOEIC, parcours doctoral",
    status: "active", tags: ["Concours", "Formation", "TOEIC"],
    links: { github: "", docs: "" },
    conversations: [
      { label: "CV & compétences 2026", url: "https://claude.ai" },
      { label: "Stratégie TOEIC + M1 ERCE", url: "https://claude.ai" },
    ],
    notes: "",
    timeline: [
      { id: 1, date: "2025-02", label: "Constitution dossier", done: true },
      { id: 2, date: "2026-06", label: "Certification TOEIC", done: false },
      { id: 3, date: "2026-09", label: "Inscription M1 ERCE", done: false },
    ],
    color: "#ffd600",
  },
  {
    id: 4, code: "AFGM", name: "AFGSU-Manager",
    description: "Gestion formations AFGSU — Grist / numerique.gouv.fr",
    status: "pending", tags: ["Grist", "Formation", "BDD"],
    links: { github: "", docs: "https://grist.numerique.gouv.fr" },
    conversations: [{ label: "Audit structurel Grist", url: "https://claude.ai" }],
    notes: "",
    timeline: [],
    color: "#ff6d00",
  },
  {
    id: 5, code: "DASH", name: "Pi Dashboard",
    description: "Dashboard projets self-hosted — React / Vite / Raspberry Pi 3B+",
    status: "active", tags: ["React", "Vite", "Raspberry Pi"],
    links: { github: "", docs: "" },
    conversations: [{ label: "Construction dashboard + déploiement", url: "https://claude.ai" }],
    notes: "",
    timeline: [
      { id: 1, date: "2026-05", label: "Développement dashboard", done: true },
      { id: 2, date: "2026-06", label: "Réception Raspberry Pi 3B+", done: false },
      { id: 3, date: "2026-06", label: "Migration + Pi-hole", done: false },
    ],
    color: "#e040fb",
  },
];

const STATUS = {
  active:   { label: "EN COURS",   color: "#00e5ff" },
  complete: { label: "TERMINÉ",    color: "#69ff47" },
  pending:  { label: "EN ATTENTE", color: "#ff6d00" },
  archived: { label: "ARCHIVÉ",    color: "#444" },
};

// ─── CLAUDE API ───────────────────────────────────────────────────────────────
async function askClaude(userMessage, projects, apiKey) {
  const systemPrompt = `Tu es l'assistant de gestion de projets d'Alexandre Gordien.
Voici l'état actuel des projets en JSON :
${JSON.stringify(projects, null, 2)}

Réponds UNIQUEMENT avec un objet JSON valide (sans markdown) :
- Si modification : { "action": "update", "projects": [...liste complète...], "message": "Ce que tu as fait" }
- Si question : { "action": "info", "message": "Ta réponse" }

Règles : IDs existants inchangés, nouveaux IDs = Date.now(), statuts : active/complete/pending/archived, timeline items ont id/date(YYYY-MM)/label/done.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

// ─── COMPOSANTS ───────────────────────────────────────────────────────────────
function ProjectCard({ project, selected, onSelect, onEdit }) {
  const s = STATUS[project.status];
  return (
    <div onClick={() => onSelect(project.id)} style={{
      borderLeft: `3px solid ${project.color}`,
      border: `1px solid ${selected ? project.color + "66" : "#1a1a1a"}`,
      borderLeft: `3px solid ${project.color}`,
      background: selected ? "#111" : "#0a0a0a",
      borderRadius: "2px", padding: "14px 16px", marginBottom: "8px",
      cursor: "pointer", transition: "all 0.15s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: project.color,
            background: project.color + "18", padding: "2px 7px", letterSpacing: "2px" }}>
            {project.code}
          </span>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "15px", color: "#e8e8e8" }}>
            {project.name}
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: s.color,
            border: `1px solid ${s.color}44`, padding: "2px 7px", letterSpacing: "1px" }}>
            {s.label}
          </span>
          <button onClick={e => { e.stopPropagation(); onEdit(project); }}
            style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "14px" }}
            onMouseEnter={e => e.target.style.color = "#888"}
            onMouseLeave={e => e.target.style.color = "#444"}>✎</button>
        </div>
      </div>
      <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "13px", color: "#777", margin: "0 0 10px", lineHeight: 1.5 }}>
        {project.description}
      </p>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {project.tags.map(t => (
          <span key={t} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#555",
            border: "1px solid #222", padding: "1px 7px" }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function Timeline({ project, onUpdate }) {
  const [newItem, setNewItem] = useState({ date: "", label: "" });

  const addItem = () => {
    if (!newItem.label || !newItem.date) return;
    const updated = {
      ...project,
      timeline: [...project.timeline, { id: Date.now(), date: newItem.date, label: newItem.label, done: false }]
    };
    onUpdate(updated);
    setNewItem({ date: "", label: "" });
  };

  const toggleDone = (id) => {
    const updated = {
      ...project,
      timeline: project.timeline.map(t => t.id === id ? { ...t, done: !t.done } : t)
    };
    onUpdate(updated);
  };

  const removeItem = (id) => {
    const updated = { ...project, timeline: project.timeline.filter(t => t.id !== id) };
    onUpdate(updated);
  };

  const sorted = [...project.timeline].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#444",
        letterSpacing: "2px", marginBottom: "12px" }}>TIMELINE</div>
      {sorted.length === 0
        ? <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "13px", color: "#333" }}>Aucun événement.</p>
        : sorted.map((t, i) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", position: "relative" }}>
            {i < sorted.length - 1 && (
              <div style={{ position: "absolute", left: "7px", top: "18px", width: "1px", height: "calc(100% + 2px)", background: "#1e1e1e" }} />
            )}
            <div onClick={() => toggleDone(t.id)} style={{
              width: "14px", height: "14px", borderRadius: "50%", cursor: "pointer", flexShrink: 0, zIndex: 1,
              background: t.done ? project.color : "transparent",
              border: `2px solid ${t.done ? project.color : "#333"}`,
              transition: "all 0.2s",
            }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#555", marginRight: "8px" }}>
                {t.date}
              </span>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "13px",
                color: t.done ? "#666" : "#ccc", textDecoration: t.done ? "line-through" : "none" }}>
                {t.label}
              </span>
            </div>
            <button onClick={() => removeItem(t.id)} style={{ background: "none", border: "none",
              color: "#333", cursor: "pointer", fontSize: "11px" }}
              onMouseEnter={e => e.target.style.color = "#ff4444"}
              onMouseLeave={e => e.target.style.color = "#333"}>✕</button>
          </div>
        ))}
      <div style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
        <input value={newItem.date} onChange={e => setNewItem(n => ({ ...n, date: e.target.value }))}
          placeholder="YYYY-MM" style={{
            width: "80px", background: "#0d0d0d", border: "1px solid #1e1e1e", color: "#ccc",
            fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", padding: "6px 8px", outline: "none",
          }} />
        <input value={newItem.label} onChange={e => setNewItem(n => ({ ...n, label: e.target.value }))}
          onKeyDown={e => e.key === "Enter" && addItem()}
          placeholder="Événement..." style={{
            flex: 1, background: "#0d0d0d", border: "1px solid #1e1e1e", color: "#ccc",
            fontFamily: "'Rajdhani', sans-serif", fontSize: "13px", padding: "6px 8px", outline: "none",
          }} />
        <button onClick={addItem} style={{ background: "#111", border: "1px solid #2a2a2a",
          color: "#888", fontFamily: "'Share Tech Mono', monospace", fontSize: "10px",
          padding: "6px 10px", cursor: "pointer" }}>+</button>
      </div>
    </div>
  );
}

function Notes({ project, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(project.notes || "");

  const save = () => {
    onUpdate({ ...project, notes: val });
    setEditing(false);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#444",
        letterSpacing: "2px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>NOTES</span>
        {!editing
          ? <button onClick={() => setEditing(true)} style={{ background: "none", border: "none",
              color: "#555", cursor: "pointer", fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", letterSpacing: "1px" }}
              onMouseEnter={e => e.target.style.color = "#00e5ff"}
              onMouseLeave={e => e.target.style.color = "#555"}>ÉDITER</button>
          : <button onClick={save} style={{ background: "none", border: "none",
              color: "#69ff47", cursor: "pointer", fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", letterSpacing: "1px" }}>
              SAUVEGARDER</button>}
      </div>
      {editing
        ? <textarea value={val} onChange={e => setVal(e.target.value)} autoFocus
            style={{ width: "100%", boxSizing: "border-box", minHeight: "100px",
              background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#ccc",
              fontFamily: "'Rajdhani', sans-serif", fontSize: "14px", padding: "10px",
              outline: "none", resize: "vertical", lineHeight: 1.6 }} />
        : <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "14px", color: val ? "#999" : "#333",
            lineHeight: 1.7, padding: "8px 10px", background: "#0d0d0d", border: "1px solid #111",
            minHeight: "50px", whiteSpace: "pre-wrap" }}>
            {val || "Aucune note. Clique sur ÉDITER pour ajouter."}
          </div>}
    </div>
  );
}

function DetailPanel({ project, onUpdate }) {
  const [tab, setTab] = useState("convs");
  if (!project) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%",
      fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: "#2a2a2a", letterSpacing: "3px" }}>
      ← SÉLECTIONNER
    </div>
  );

  return (
    <div style={{ padding: "16px 18px", height: "100%", boxSizing: "border-box", overflowY: "auto" }}>
      <div style={{ borderBottom: "1px solid #1a1a1a", paddingBottom: "12px", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: project.color,
            background: project.color + "18", padding: "2px 8px", letterSpacing: "2px" }}>{project.code}</span>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "16px", color: "#fff" }}>{project.name}</span>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: "0", marginBottom: "16px", borderBottom: "1px solid #111" }}>
        {[["convs", "LIENS"], ["timeline", "TIMELINE"], ["notes", "NOTES"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            background: "none", border: "none", borderBottom: tab === k ? `2px solid ${project.color}` : "2px solid transparent",
            color: tab === k ? "#e0e0e0" : "#444", fontFamily: "'Share Tech Mono', monospace",
            fontSize: "9px", padding: "6px 12px", cursor: "pointer", letterSpacing: "1.5px",
          }}>{l}</button>
        ))}
      </div>

      {tab === "convs" && (
        <div>
          {project.conversations.length === 0
            ? <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "13px", color: "#333" }}>Aucune conversation.</p>
            : project.conversations.map((c, i) => (
              <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" style={{
                display: "block", fontFamily: "'Rajdhani', sans-serif", fontSize: "13px", color: "#aaa",
                textDecoration: "none", padding: "9px 12px", marginBottom: "5px",
                borderLeft: `2px solid ${project.color}`, border: `1px solid #1a1a1a`,
                borderLeft: `2px solid ${project.color}`, background: "#0d0d0d", transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "#141414"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#aaa"; e.currentTarget.style.background = "#0d0d0d"; }}>
                <span style={{ color: "#444", marginRight: "8px", fontFamily: "'Share Tech Mono', monospace", fontSize: "10px" }}>↗</span>{c.label}
              </a>
            ))}
          {project.links.github && (
            <a href={project.links.github} target="_blank" rel="noopener noreferrer" style={{
              display: "block", fontFamily: "'Rajdhani', sans-serif", fontSize: "13px", color: "#aaa",
              textDecoration: "none", padding: "9px 12px", marginTop: "10px",
              border: "1px solid #1a1a1a", borderLeft: "2px solid #444",
              background: "#0d0d0d", wordBreak: "break-all", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "#141414"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#aaa"; e.currentTarget.style.background = "#0d0d0d"; }}>
              <span style={{ color: "#444", marginRight: "8px", fontFamily: "'Share Tech Mono', monospace", fontSize: "10px" }}>⌥</span>
              {project.links.github.replace("https://", "")}
            </a>
          )}
        </div>
      )}

      {tab === "timeline" && <Timeline project={project} onUpdate={onUpdate} />}
      {tab === "notes" && <Notes project={project} onUpdate={onUpdate} />}
    </div>
  );
}

function EditModal({ project, onSave, onClose }) {
  const [form, setForm] = useState({ ...project, links: { ...project.links } });
  const [newConv, setNewConv] = useState({ label: "", url: "" });
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const ul = (k, v) => setForm(f => ({ ...f, links: { ...f.links, [k]: v } }));
  const addConv = () => {
    if (!newConv.label) return;
    setForm(f => ({ ...f, conversations: [...f.conversations, { ...newConv, url: newConv.url || "https://claude.ai" }] }));
    setNewConv({ label: "", url: "" });
  };
  const inp = (val, onChange, ph, mono = true) => (
    <input value={val} onChange={e => onChange(e.target.value)} placeholder={ph} style={{
      width: "100%", boxSizing: "border-box", background: "#0d0d0d", border: "1px solid #222",
      color: "#ccc", fontFamily: mono ? "'Share Tech Mono', monospace" : "'Rajdhani', sans-serif",
      fontSize: mono ? "11px" : "14px", padding: "7px 10px", outline: "none",
    }} />
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "#0a0a0a", border: `1px solid ${form.color}44`,
        borderTop: `2px solid ${form.color}`, padding: "24px", width: "480px",
        maxHeight: "85vh", overflowY: "auto", fontFamily: "'Share Tech Mono', monospace" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "18px" }}>
          <span style={{ fontSize: "10px", color: "#666", letterSpacing: "2px" }}>ÉDITION PROJET</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer" }}>✕</button>
        </div>
        {[["CODE", "code", "AZM"], ["NOM", "name", "Nom"]].map(([l, k, p]) => (
          <div key={k} style={{ marginBottom: "10px" }}>
            <div style={{ fontSize: "9px", color: "#444", letterSpacing: "2px", marginBottom: "4px" }}>{l}</div>
            {inp(form[k], v => u(k, v), p)}
          </div>
        ))}
        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "9px", color: "#444", letterSpacing: "2px", marginBottom: "4px" }}>DESCRIPTION</div>
          {inp(form.description, v => u("description", v), "Description", false)}
        </div>
        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "9px", color: "#444", letterSpacing: "2px", marginBottom: "4px" }}>STATUT</div>
          <select value={form.status} onChange={e => u("status", e.target.value)} style={{
            background: "#0d0d0d", border: "1px solid #222", color: "#ccc",
            fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", padding: "7px 10px", outline: "none",
          }}>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "9px", color: "#444", letterSpacing: "2px", marginBottom: "4px" }}>COULEUR</div>
          <input type="color" value={form.color} onChange={e => u("color", e.target.value)}
            style={{ border: "1px solid #222", background: "none", padding: "2px", width: "40px", height: "26px", cursor: "pointer" }} />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "9px", color: "#444", letterSpacing: "2px", marginBottom: "4px" }}>GITHUB URL</div>
          {inp(form.links.github, v => ul("github", v), "https://github.com/...")}
        </div>
        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "9px", color: "#444", letterSpacing: "2px", marginBottom: "4px" }}>TAGS (séparés par virgule)</div>
          <input value={form.tags.join(", ")} onChange={e => u("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
            placeholder="Python, React, Node.js" style={{
              width: "100%", boxSizing: "border-box", background: "#0d0d0d", border: "1px solid #222",
              color: "#ccc", fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", padding: "7px 10px", outline: "none",
            }} />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "9px", color: "#444", letterSpacing: "2px", marginBottom: "8px" }}>CONVERSATIONS</div>
          {form.conversations.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "5px 8px", marginBottom: "4px", background: "#0d0d0d", border: "1px solid #1a1a1a" }}>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "13px", color: "#888",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "85%" }}>{c.label}</span>
              <button onClick={() => setForm(f => ({ ...f, conversations: f.conversations.filter((_, j) => j !== i) }))}
                style={{ background: "none", border: "none", color: "#444", cursor: "pointer" }}>✕</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
            <input value={newConv.label} onChange={e => setNewConv(n => ({ ...n, label: e.target.value }))}
              placeholder="Libellé" style={{ flex: 1, background: "#0d0d0d", border: "1px solid #222",
                color: "#ccc", fontFamily: "'Rajdhani', sans-serif", fontSize: "13px", padding: "6px 8px", outline: "none" }} />
            <input value={newConv.url} onChange={e => setNewConv(n => ({ ...n, url: e.target.value }))}
              placeholder="URL" style={{ flex: 2, background: "#0d0d0d", border: "1px solid #222",
                color: "#ccc", fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", padding: "6px 8px", outline: "none" }} />
            <button onClick={addConv} style={{ background: "#111", border: "1px solid #2a2a2a",
              color: "#888", fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", padding: "6px 10px", cursor: "pointer" }}>+</button>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #2a2a2a", color: "#666",
            fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", padding: "7px 16px", cursor: "pointer", letterSpacing: "1px" }}>
            ANNULER
          </button>
          <button onClick={() => onSave(form)} style={{ background: form.color + "15", border: `1px solid ${form.color}44`,
            color: form.color, fontFamily: "'Share Tech Mono', monospace", fontSize: "10px",
            padding: "7px 16px", cursor: "pointer", letterSpacing: "1px" }}>
            SAUVEGARDER
          </button>
        </div>
      </div>
    </div>
  );
}

function ApiKeyModal({ onSave, onClose }) {
  const [key, setKey] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 2000 }} onClick={onClose}>
      <div style={{ background: "#0a0a0a", border: "1px solid #00e5ff44", borderTop: "2px solid #00e5ff",
        padding: "28px", width: "420px", fontFamily: "'Share Tech Mono', monospace" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: "10px", color: "#00e5ff", letterSpacing: "2px", marginBottom: "12px" }}>CLÉ API ANTHROPIC</div>
        <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "13px", color: "#666", lineHeight: 1.7, marginBottom: "16px" }}>
          Entre ta clé API Anthropic pour activer l'assistant. Stockée en mémoire de session uniquement.
        </p>
        <input value={key} onChange={e => setKey(e.target.value)} type="password" placeholder="sk-ant-api03-..."
          style={{ width: "100%", boxSizing: "border-box", background: "#0d0d0d", border: "1px solid #222",
            color: "#ccc", fontFamily: "'Share Tech Mono', monospace", fontSize: "11px",
            padding: "9px 12px", outline: "none", marginBottom: "16px" }} />
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #2a2a2a", color: "#666",
            fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", padding: "7px 14px", cursor: "pointer" }}>ANNULER</button>
          <button onClick={() => key.trim() && onSave(key.trim())} style={{
            background: "#00e5ff15", border: "1px solid #00e5ff44", color: "#00e5ff",
            fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", padding: "7px 14px", cursor: "pointer", letterSpacing: "1px" }}>
            CONFIRMER
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [auth, setAuth] = useState(false);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("all");
  const [apiKey, setApiKey] = useState("");
  const [showApiModal, setShowApiModal] = useState(false);
  const [cmd, setCmd] = useState("");
  const [cmdHistory, setCmdHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const historyRef = useRef(null);

  useEffect(() => {
    if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [cmdHistory]);

  if (!auth) return <LoginScreen onAuth={() => setAuth(true)} />;

  const filtered = filter === "all" ? projects : projects.filter(p => p.status === filter);
  const selectedProject = projects.find(p => p.id === selected);
  const activeCount = projects.filter(p => p.status === "active").length;

  const updateProject = (updated) => {
    setProjects(ps => ps.map(p => p.id === updated.id ? updated : p));
  };

  const handleCmd = async () => {
    if (!cmd.trim()) return;
    if (!apiKey) { setShowApiModal(true); return; }
    const userMsg = cmd.trim();
    setCmd("");
    setCmdHistory(h => [...h, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const result = await askClaude(userMsg, projects, apiKey);
      if (result.action === "update") setProjects(result.projects);
      setCmdHistory(h => [...h, { role: "assistant", text: result.message }]);
    } catch (e) {
      setCmdHistory(h => [...h, { role: "error", text: `Erreur : ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#ccc",
      fontFamily: "'Rajdhani', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #141414", padding: "10px 22px",
        display: "flex", alignItems: "center", justifyContent: "space-between", background: "#090909" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#00e5ff", letterSpacing: "4px" }}>
            ALEXANDRE GORDIEN
          </span>
          <span style={{ color: "#1a1a1a" }}>|</span>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#333", letterSpacing: "2px" }}>
            PROJETS
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#2a2a2a" }}>
            {activeCount} ACTIFS · {projects.length} TOTAL
          </span>
          <button onClick={() => setShowApiModal(true)} style={{
            background: apiKey ? "#00e5ff15" : "none", border: `1px solid ${apiKey ? "#00e5ff44" : "#1e1e1e"}`,
            color: apiKey ? "#00e5ff" : "#333", fontFamily: "'Share Tech Mono', monospace",
            fontSize: "9px", padding: "4px 10px", cursor: "pointer", letterSpacing: "1px",
          }}>{apiKey ? "● API OK" : "○ API"}</button>
          <button onClick={() => {
            const newP = { id: Date.now(), code: "NEW", name: "Nouveau Projet", description: "Description",
              status: "pending", tags: [], links: { github: "", docs: "" },
              conversations: [], notes: "", timeline: [], color: "#888" };
            setProjects(p => [newP, ...p]); setEditing(newP);
          }} style={{ background: "none", border: "1px solid #1e1e1e", color: "#555",
            fontFamily: "'Share Tech Mono', monospace", fontSize: "9px",
            padding: "4px 10px", cursor: "pointer", letterSpacing: "1px", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#ccc"; e.currentTarget.style.borderColor = "#444"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#555"; e.currentTarget.style.borderColor = "#1e1e1e"; }}>
            + NOUVEAU
          </button>
        </div>
      </div>

      {/* FILTRES */}
      <div style={{ display: "flex", borderBottom: "1px solid #0e0e0e", background: "#090909" }}>
        {[["all", "TOUS"], ...Object.entries(STATUS).map(([k, v]) => [k, v.label])].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            background: "none", border: "none",
            borderBottom: filter === k ? "2px solid #00e5ff" : "2px solid transparent",
            color: filter === k ? "#e0e0e0" : "#3a3a3a",
            fontFamily: "'Share Tech Mono', monospace", fontSize: "9px",
            padding: "8px 14px", cursor: "pointer", letterSpacing: "1.5px",
          }}>{l}</button>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", flex: 1, overflow: "hidden", minHeight: 0 }}>
        <div style={{ overflowY: "auto", padding: "14px 18px", borderRight: "1px solid #0e0e0e" }}>
          {filtered.length === 0
            ? <div style={{ fontFamily: "'Share Tech Mono', monospace", color: "#2a2a2a", fontSize: "10px",
                letterSpacing: "2px", textAlign: "center", marginTop: "40px" }}>AUCUN PROJET</div>
            : filtered.map(p => (
              <ProjectCard key={p.id} project={p} selected={selected === p.id}
                onSelect={id => setSelected(s => s === id ? null : id)} onEdit={setEditing} />
            ))}
        </div>
        <div style={{ background: "#090909", overflow: "hidden" }}>
          <DetailPanel project={selectedProject} onUpdate={updateProject} />
        </div>
      </div>

      {/* BARRE CLAUDE */}
      <div style={{ borderTop: "1px solid #111", background: "#090909" }}>
        {cmdHistory.length > 0 && (
          <div ref={historyRef} style={{ maxHeight: "100px", overflowY: "auto", padding: "8px 20px", borderBottom: "1px solid #0e0e0e" }}>
            {cmdHistory.map((m, i) => (
              <div key={i} style={{ marginBottom: "4px", display: "flex", gap: "10px" }}>
                <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", minWidth: "50px",
                  color: m.role === "user" ? "#00e5ff" : m.role === "error" ? "#ff4444" : "#69ff47", letterSpacing: "1px" }}>
                  {m.role === "user" ? "YOU >" : m.role === "error" ? "ERR >" : "CLD >"}
                </span>
                <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "13px",
                  color: m.role === "error" ? "#ff4444" : "#777" }}>{m.text}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", padding: "8px 20px", gap: "12px" }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#00e5ff", letterSpacing: "2px" }}>CLD &gt;</span>
          <input ref={historyRef} value={cmd} onChange={e => setCmd(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !loading && handleCmd()}
            placeholder={apiKey ? "Crée un projet... / Ajoute une conv... / Résume les actifs..." : "Configure la clé API →"}
            disabled={loading} style={{ flex: 1, background: "none", border: "none",
              color: "#ccc", fontFamily: "'Rajdhani', sans-serif", fontSize: "14px",
              outline: "none", opacity: loading ? 0.5 : 1 }} />
          {loading
            ? <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#333", letterSpacing: "2px" }}>...</span>
            : <button onClick={handleCmd} style={{ background: "none", border: "1px solid #1a1a1a",
                color: "#333", fontFamily: "'Share Tech Mono', monospace", fontSize: "9px",
                padding: "4px 10px", cursor: "pointer", letterSpacing: "1px", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#00e5ff44"; e.currentTarget.style.color = "#00e5ff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.color = "#333"; }}>
                ↵
              </button>}
        </div>
      </div>

      {editing && <EditModal project={editing}
        onSave={u => { setProjects(ps => ps.map(p => p.id === u.id ? u : p)); setEditing(null); }}
        onClose={() => setEditing(null)} />}
      {showApiModal && <ApiKeyModal onSave={k => { setApiKey(k); setShowApiModal(false); }} onClose={() => setShowApiModal(false)} />}
    </div>
  );
}
