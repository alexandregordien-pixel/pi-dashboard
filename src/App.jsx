import { useState, useRef, useEffect } from "react";

const FONT = "'Inter', sans-serif";

// ─── THÈME ────────────────────────────────────────────────────────────────────
const T = {
  bg:          "#eef0f5",
  surface:     "#ffffff",
  surfaceAlt:  "#f4f5f9",
  border:      "#e2e4ed",
  borderFocus: "#c8cbda",
  text:        "#1e1e30",
  textSec:     "#6b7280",
  textMuted:   "#9ca3af",
};

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
    timeline: [
      { date: "Jan 2025", label: "Démarrage du projet" },
      { date: "Mar 2025", label: "Architecture v2 conçue" },
      { date: "Mai 2025", label: "Présentation CSIRMT" },
    ],
    color: "#00b4cc", createdAt: "2025-01",
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
    timeline: [
      { date: "Mar 2025", label: "Démarrage" },
      { date: "Avr 2025", label: "Génération RIFC complet" },
      { date: "Avr 2025", label: "Livraison finale" },
    ],
    color: "#22a855", createdAt: "2025-03",
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
    timeline: [
      { date: "Fév 2025", label: "Démarrage" },
      { date: "Sep 2025", label: "CV & compétences 2026" },
      { date: "Jan 2026", label: "Stratégie TOEIC + M1 ERCE" },
    ],
    color: "#d4a017", createdAt: "2025-02",
  },
  {
    id: 4, code: "AFGM", name: "AFGSU-Manager",
    description: "Gestion formations AFGSU — Grist / numerique.gouv.fr",
    status: "pending", tags: ["Grist", "Formation", "BDD"],
    links: { github: "", docs: "https://grist.numerique.gouv.fr" },
    conversations: [{ label: "Audit structurel Grist", url: "https://claude.ai" }],
    timeline: [
      { date: "Avr 2025", label: "Démarrage" },
      { date: "Juin 2025", label: "Audit structurel Grist" },
    ],
    color: "#e05a00", createdAt: "2025-04",
  },
  {
    id: 5, code: "DASH", name: "Pi Dashboard",
    description: "Dashboard projets self-hosted — React / Vite / Raspberry Pi 3B+",
    status: "active", tags: ["React", "Vite", "Raspberry Pi", "Nginx"],
    links: { github: "", docs: "" },
    conversations: [{ label: "Construction dashboard + déploiement", url: "https://claude.ai" }],
    timeline: [
      { date: "Mai 2026", label: "Démarrage" },
      { date: "Mai 2026", label: "v1 déployée" },
    ],
    color: "#9c27b0", createdAt: "2026-05",
  },
];

const STATUS = {
  active:   { label: "En cours",   color: "#0369a1", bg: "#e0f2fe" },
  complete: { label: "Terminé",    color: "#15803d", bg: "#dcfce7" },
  pending:  { label: "En attente", color: "#b45309", bg: "#fef3c7" },
  archived: { label: "Archivé",    color: "#6b7280", bg: "#f3f4f6" },
};

// ─── CLAUDE API ───────────────────────────────────────────────────────────────
async function askClaude(userMessage, projects, apiKey) {
  const systemPrompt = `Tu es l'assistant de gestion de projets d'Alexandre Gordien.
Tu gères un dashboard de projets. Voici l'état actuel des projets en JSON :
${JSON.stringify(projects, null, 2)}

Tu peux répondre de deux façons :
1. Si l'utilisateur veut MODIFIER les projets :
   Réponds UNIQUEMENT avec un objet JSON valide :
   { "action": "update", "projects": [...liste complète mise à jour...], "message": "Ce que tu as fait en une phrase" }

2. Si l'utilisateur pose une QUESTION ou veut un RÉSUMÉ :
   Réponds UNIQUEMENT avec :
   { "action": "info", "message": "Ta réponse ici" }

Règles :
- Les IDs existants ne changent pas. Les nouveaux projets ont un ID = Date.now()
- Les statuts possibles : active, complete, pending, archived
- Chaque projet a un champ timeline : tableau d'objets { date: "Mois YYYY", label: "Description" }
- JAMAIS de texte hors du JSON`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

// ─── MINI TIMELINE ────────────────────────────────────────────────────────────
function MiniTimeline({ events, color }) {
  const [tip, setTip] = useState(null);
  if (!events || events.length === 0) return null;

  return (
    <div style={{ position: "relative", marginTop: "14px" }}>
      {/* Track */}
      <div style={{
        position: "absolute",
        left: "5px", right: "5px", top: "5px",
        height: "2px",
        background: `${color}25`,
        borderRadius: "1px",
      }} />

      {/* Dots + labels */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {events.map((e, i) => (
          <div key={i}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", cursor: "default" }}
            onMouseEnter={() => setTip(i)}
            onMouseLeave={() => setTip(null)}
          >
            {/* Tooltip */}
            {tip === i && (
              <div style={{
                position: "absolute", bottom: "30px",
                left: "50%", transform: "translateX(-50%)",
                background: T.text, color: "#fff",
                padding: "5px 10px", borderRadius: "5px",
                fontSize: "11px", fontFamily: FONT, whiteSpace: "nowrap",
                boxShadow: "0 3px 12px rgba(0,0,0,0.18)",
                zIndex: 20,
                pointerEvents: "none",
              }}>
                {e.label}
                <div style={{
                  position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                  width: 0, height: 0,
                  borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
                  borderTop: `5px solid ${T.text}`,
                }} />
              </div>
            )}

            {/* Dot */}
            <div style={{
              width: "11px", height: "11px", borderRadius: "50%",
              background: tip === i ? color : T.surface,
              border: `2px solid ${color}`,
              transition: "background 0.15s",
              zIndex: 1,
              boxShadow: tip === i ? `0 0 0 3px ${color}22` : "none",
            }} />

            {/* Date label */}
            <span style={{
              fontSize: "10px", color: T.textMuted, marginTop: "5px",
              fontFamily: FONT, whiteSpace: "nowrap",
            }}>
              {e.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROJECT CARD ─────────────────────────────────────────────────────────────
function ProjectCard({ project, selected, onSelect, onEdit }) {
  const s = STATUS[project.status];
  return (
    <div
      onClick={() => onSelect(project.id)}
      style={{
        background: selected ? T.surfaceAlt : T.surface,
        border: `1px solid ${selected ? project.color + "55" : T.border}`,
        borderLeft: `4px solid ${project.color}`,
        borderRadius: "8px",
        padding: "16px 18px",
        marginBottom: "10px",
        cursor: "pointer",
        transition: "all 0.15s",
        boxShadow: selected ? `0 2px 12px ${project.color}18` : "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            fontFamily: FONT, fontSize: "10px", fontWeight: 700,
            color: project.color, background: `${project.color}18`,
            padding: "2px 8px", borderRadius: "4px", letterSpacing: "0.5px",
          }}>
            {project.code}
          </span>
          <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: "15px", color: T.text }}>
            {project.name}
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{
            fontFamily: FONT, fontSize: "11px", fontWeight: 500,
            color: s.color, background: s.bg,
            padding: "2px 9px", borderRadius: "20px",
          }}>
            {s.label}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onEdit(project); }}
            style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: "2px" }}
            onMouseEnter={e => e.target.style.color = T.textSec}
            onMouseLeave={e => e.target.style.color = T.textMuted}
          >✎</button>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontFamily: FONT, fontSize: "13px", color: T.textSec, margin: "0 0 10px", lineHeight: 1.6 }}>
        {project.description}
      </p>

      {/* Tags */}
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        {project.tags.map(t => (
          <span key={t} style={{
            fontFamily: FONT, fontSize: "11px", color: T.textSec,
            background: T.surfaceAlt, border: `1px solid ${T.border}`,
            padding: "1px 8px", borderRadius: "4px",
          }}>{t}</span>
        ))}
      </div>

      {/* Timeline */}
      <MiniTimeline events={project.timeline} color={project.color} />
    </div>
  );
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────
function DetailPanel({ project }) {
  if (!project) return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "100%", gap: "10px",
    }}>
      <span style={{ fontSize: "28px", opacity: 0.15 }}>←</span>
      <span style={{ fontFamily: FONT, fontSize: "13px", color: T.textMuted }}>Sélectionner un projet</span>
    </div>
  );

  const s = STATUS[project.status];

  return (
    <div style={{ padding: "28px 32px" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <span style={{
            fontFamily: FONT, fontSize: "11px", fontWeight: 700,
            color: project.color, background: `${project.color}18`,
            padding: "3px 10px", borderRadius: "4px", letterSpacing: "0.5px",
          }}>{project.code}</span>
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: "20px", color: T.text }}>{project.name}</span>
          <span style={{
            marginLeft: "auto", fontFamily: FONT, fontSize: "11px", fontWeight: 500,
            color: s.color, background: s.bg, padding: "3px 10px", borderRadius: "20px",
          }}>{s.label}</span>
        </div>
        <p style={{ fontFamily: FONT, fontSize: "13px", color: T.textSec, margin: 0, lineHeight: 1.7 }}>
          {project.description}
        </p>
      </div>

      {/* Timeline complète */}
      {project.timeline && project.timeline.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 600, color: T.textMuted,
            textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
            Chronologie
          </div>
          <div style={{ position: "relative", paddingLeft: "16px" }}>
            {/* Ligne verticale */}
            <div style={{
              position: "absolute", left: "4px", top: "6px", bottom: "6px",
              width: "2px", background: `${project.color}25`, borderRadius: "1px",
            }} />
            {project.timeline.map((e, i) => (
              <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "14px", position: "relative" }}>
                <div style={{
                  position: "absolute", left: "-20px", top: "4px",
                  width: "10px", height: "10px", borderRadius: "50%",
                  background: T.surface, border: `2px solid ${project.color}`,
                }} />
                <div>
                  <span style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 600, color: project.color }}>{e.date}</span>
                  <span style={{ fontFamily: FONT, fontSize: "13px", color: T.textSec, marginLeft: "10px" }}>{e.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversations */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 600, color: T.textMuted,
          textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
          Conversations Claude
        </div>
        {project.conversations.length === 0
          ? <p style={{ fontFamily: FONT, fontSize: "13px", color: T.textMuted }}>Aucune conversation.</p>
          : project.conversations.map((c, i) => (
            <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" style={{
              display: "flex", alignItems: "center", gap: "10px",
              fontFamily: FONT, fontSize: "13px", color: T.textSec,
              textDecoration: "none", padding: "10px 14px", marginBottom: "6px",
              background: T.surfaceAlt, border: `1px solid ${T.border}`,
              borderLeft: `3px solid ${project.color}`,
              borderRadius: "0 6px 6px 0", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#eef6ff"; e.currentTarget.style.color = T.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.surfaceAlt; e.currentTarget.style.color = T.textSec; }}>
              <span style={{ color: project.color, fontSize: "12px" }}>↗</span>
              {c.label}
            </a>
          ))}
      </div>

      {/* Liens */}
      {project.links.github && (
        <div style={{ marginBottom: "18px" }}>
          <div style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 600, color: T.textMuted,
            textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>
            GitHub
          </div>
          <a href={project.links.github} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", gap: "10px",
            fontFamily: FONT, fontSize: "13px", color: T.textSec,
            textDecoration: "none", padding: "10px 14px",
            background: T.surfaceAlt, border: `1px solid ${T.border}`,
            borderRadius: "6px", wordBreak: "break-all",
          }}>
            <span>⌥</span>
            {project.links.github.replace("https://", "")}
          </a>
        </div>
      )}

      {project.links.docs && (
        <div>
          <div style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 600, color: T.textMuted,
            textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>
            Documentation
          </div>
          <a href={project.links.docs} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", gap: "10px",
            fontFamily: FONT, fontSize: "13px", color: T.textSec,
            textDecoration: "none", padding: "10px 14px",
            background: T.surfaceAlt, border: `1px solid ${T.border}`,
            borderRadius: "6px",
          }}>
            <span>⊞</span>
            {project.links.docs.replace("https://", "")}
          </a>
        </div>
      )}
    </div>
  );
}

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────
function EditModal({ project, onSave, onClose }) {
  const [form, setForm] = useState({ ...project, links: { ...project.links }, timeline: [...(project.timeline || [])] });
  const [newConv, setNewConv] = useState({ label: "", url: "" });
  const [newEvent, setNewEvent] = useState({ date: "", label: "" });
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const ul = (k, v) => setForm(f => ({ ...f, links: { ...f.links, [k]: v } }));

  const addConv = () => {
    if (!newConv.label) return;
    setForm(f => ({ ...f, conversations: [...f.conversations, { ...newConv, url: newConv.url || "https://claude.ai" }] }));
    setNewConv({ label: "", url: "" });
  };
  const addEvent = () => {
    if (!newEvent.label) return;
    setForm(f => ({ ...f, timeline: [...f.timeline, { ...newEvent }] }));
    setNewEvent({ date: "", label: "" });
  };

  const inp = (val, onChange, ph, flex) => (
    <input value={val} onChange={e => onChange(e.target.value)} placeholder={ph} style={{
      flex: flex || "none", width: flex ? undefined : "100%", boxSizing: "border-box",
      background: T.surfaceAlt, border: `1px solid ${T.border}`,
      color: T.text, fontFamily: FONT, fontSize: "13px",
      padding: "8px 12px", outline: "none", borderRadius: "6px",
    }} />
  );

  const label = (txt) => (
    <div style={{ fontSize: "11px", fontWeight: 600, color: T.textMuted,
      textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>{txt}</div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(30,30,48,0.5)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`,
        borderTop: `3px solid ${form.color}`, padding: "28px", width: "520px",
        maxHeight: "88vh", overflowY: "auto", fontFamily: FONT, borderRadius: "8px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <span style={{ fontSize: "15px", fontWeight: 600, color: T.text }}>Édition du projet</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: "18px" }}>✕</button>
        </div>

        {[["Code", "code", "AZM"], ["Nom", "name", "Nom du projet"], ["Description", "description", "Description courte"]].map(([l, k, p]) => (
          <div key={k} style={{ marginBottom: "14px" }}>
            {label(l)}
            {inp(form[k], v => u(k, v), p)}
          </div>
        ))}

        <div style={{ marginBottom: "14px" }}>
          {label("Statut")}
          <select value={form.status} onChange={e => u("status", e.target.value)} style={{
            background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text,
            fontFamily: FONT, fontSize: "13px", padding: "8px 12px", outline: "none", borderRadius: "6px",
          }}>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: "14px" }}>
          {label("Couleur accent")}
          <input type="color" value={form.color} onChange={e => u("color", e.target.value)}
            style={{ border: `1px solid ${T.border}`, background: "none", padding: "2px", width: "44px", height: "32px", cursor: "pointer", borderRadius: "6px" }} />
        </div>

        <div style={{ marginBottom: "14px" }}>
          {label("GitHub URL")}
          {inp(form.links.github, v => ul("github", v), "https://github.com/...")}
        </div>

        <div style={{ marginBottom: "20px" }}>
          {label("Conversations")}
          {form.conversations.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 12px", marginBottom: "5px", background: T.surfaceAlt,
              border: `1px solid ${T.border}`, borderRadius: "6px" }}>
              <span style={{ fontSize: "13px", color: T.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "85%" }}>{c.label}</span>
              <button onClick={() => setForm(f => ({ ...f, conversations: f.conversations.filter((_, j) => j !== i) }))}
                style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: "13px" }}>✕</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            {inp(newConv.label, v => setNewConv(n => ({ ...n, label: v })), "Libellé", "1")}
            {inp(newConv.url, v => setNewConv(n => ({ ...n, url: v })), "URL", "2")}
            <button onClick={addConv} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`,
              color: T.textSec, fontFamily: FONT, fontSize: "13px", padding: "8px 14px",
              cursor: "pointer", borderRadius: "6px" }}>+</button>
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          {label("Chronologie")}
          {form.timeline.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 12px", marginBottom: "5px", background: T.surfaceAlt,
              border: `1px solid ${T.border}`, borderRadius: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: form.color, marginRight: "10px" }}>{e.date}</span>
              <span style={{ fontSize: "13px", color: T.textSec, flex: 1 }}>{e.label}</span>
              <button onClick={() => setForm(f => ({ ...f, timeline: f.timeline.filter((_, j) => j !== i) }))}
                style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: "13px" }}>✕</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            {inp(newEvent.date, v => setNewEvent(n => ({ ...n, date: v })), "Mois YYYY", "none")}
            {inp(newEvent.label, v => setNewEvent(n => ({ ...n, label: v })), "Événement", "2")}
            <button onClick={addEvent} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`,
              color: T.textSec, fontFamily: FONT, fontSize: "13px", padding: "8px 14px",
              cursor: "pointer", borderRadius: "6px" }}>+</button>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${T.border}`, color: T.textSec,
            fontFamily: FONT, fontSize: "13px", padding: "9px 20px", cursor: "pointer", borderRadius: "6px" }}>
            Annuler
          </button>
          <button onClick={() => onSave(form)} style={{
            background: form.color, border: "none",
            color: "#fff", fontFamily: FONT, fontSize: "13px", fontWeight: 600,
            padding: "9px 20px", cursor: "pointer", borderRadius: "6px" }}>
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── API KEY MODAL ────────────────────────────────────────────────────────────
function ApiKeyModal({ onSave, onClose }) {
  const [key, setKey] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(30,30,48,0.5)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 2000 }} onClick={onClose}>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`,
        borderTop: "3px solid #0369a1", padding: "32px", width: "440px",
        fontFamily: FONT, borderRadius: "8px", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: "15px", fontWeight: 600, color: T.text, marginBottom: "12px" }}>
          Clé API Anthropic
        </div>
        <p style={{ fontSize: "13px", color: T.textSec, lineHeight: 1.7, marginBottom: "20px" }}>
          Pour activer l'assistant Claude dans le dashboard, entre ta clé API Anthropic.
          Elle sera stockée uniquement en mémoire de session (non persistée).
        </p>
        <input value={key} onChange={e => setKey(e.target.value)}
          type="password" placeholder="sk-ant-api03-..."
          style={{ width: "100%", boxSizing: "border-box", background: T.surfaceAlt,
            border: `1px solid ${T.border}`, color: T.text, fontFamily: FONT, fontSize: "13px",
            padding: "10px 14px", outline: "none", marginBottom: "20px", borderRadius: "6px" }} />
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${T.border}`,
            color: T.textSec, fontFamily: FONT, fontSize: "13px", padding: "9px 20px",
            cursor: "pointer", borderRadius: "6px" }}>
            Annuler
          </button>
          <button onClick={() => key.trim() && onSave(key.trim())} style={{
            background: "#0369a1", border: "none", color: "#fff",
            fontFamily: FONT, fontSize: "13px", fontWeight: 600,
            padding: "9px 20px", cursor: "pointer", borderRadius: "6px" }}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── APP PRINCIPALE ───────────────────────────────────────────────────────────
export default function App() {
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

  const filtered = filter === "all" ? projects : projects.filter(p => p.status === filter);
  const selectedProject = projects.find(p => p.id === selected);

  useEffect(() => {
    if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [cmdHistory]);

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

  const activeCount = projects.filter(p => p.status === "active").length;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: FONT, display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: T.text }}>Alexandre Gordien</span>
          <span style={{ color: T.border }}>|</span>
          <span style={{ fontSize: "13px", color: T.textSec }}>Tableau de bord projets</span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: T.textMuted }}>
            {activeCount} actifs · {projects.length} total
          </span>
          <button onClick={() => setShowApiModal(true)} style={{
            background: apiKey ? "#e0f2fe" : T.surfaceAlt,
            border: `1px solid ${apiKey ? "#bae6fd" : T.border}`,
            color: apiKey ? "#0369a1" : T.textSec,
            fontFamily: FONT, fontSize: "12px", fontWeight: 500,
            padding: "5px 12px", cursor: "pointer", borderRadius: "6px",
          }}>
            {apiKey ? "● API connectée" : "○ API Key"}
          </button>
          <button onClick={() => {
            const newP = {
              id: Date.now(), code: "NEW", name: "Nouveau Projet",
              description: "Description", status: "pending", tags: [],
              links: { github: "", docs: "" }, conversations: [], timeline: [],
              color: "#6b7280", createdAt: new Date().toISOString().slice(0, 7),
            };
            setProjects(p => [newP, ...p]); setEditing(newP);
          }} style={{
            background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.textSec,
            fontFamily: FONT, fontSize: "12px", fontWeight: 500,
            padding: "5px 12px", cursor: "pointer", borderRadius: "6px", transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = T.border; e.currentTarget.style.color = T.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.surfaceAlt; e.currentTarget.style.color = T.textSec; }}>
            + Nouveau
          </button>
        </div>
      </div>

      {/* FILTRES */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, display: "flex", paddingLeft: "16px" }}>
        {[["all", "Tous"], ...Object.entries(STATUS).map(([k, v]) => [k, v.label])].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            background: "none", border: "none",
            borderBottom: filter === k ? "2px solid #0369a1" : "2px solid transparent",
            color: filter === k ? "#0369a1" : T.textSec,
            fontFamily: FONT, fontSize: "12px", fontWeight: filter === k ? 600 : 400,
            padding: "10px 16px", cursor: "pointer", transition: "color 0.1s",
          }}>{l}</button>
        ))}
      </div>

      {/* LAYOUT 50/50 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", flex: 1, overflow: "hidden" }}>

        {/* LISTE */}
        <div style={{ overflowY: "auto", padding: "20px 24px", borderRight: `1px solid ${T.border}` }}>
          {filtered.length === 0
            ? <div style={{ color: T.textMuted, fontSize: "13px", textAlign: "center", marginTop: "48px" }}>Aucun projet</div>
            : filtered.map(p => (
              <ProjectCard key={p.id} project={p} selected={selected === p.id}
                onSelect={id => setSelected(s => s === id ? null : id)}
                onEdit={setEditing} />
            ))}
        </div>

        {/* DÉTAIL */}
        <div style={{ overflowY: "auto", background: T.surface }}>
          <DetailPanel project={selectedProject} />
        </div>
      </div>

      {/* BARRE CLAUDE */}
      <div style={{ borderTop: `1px solid ${T.border}`, background: T.surface, boxShadow: "0 -1px 4px rgba(0,0,0,0.04)" }}>
        {cmdHistory.length > 0 && (
          <div ref={historyRef} style={{ maxHeight: "120px", overflowY: "auto", padding: "10px 24px",
            borderBottom: `1px solid ${T.border}` }}>
            {cmdHistory.map((m, i) => (
              <div key={i} style={{ marginBottom: "6px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{
                  fontSize: "11px", fontWeight: 600, minWidth: "55px", marginTop: "2px",
                  color: m.role === "user" ? "#0369a1" : m.role === "error" ? "#dc2626" : "#15803d",
                }}>
                  {m.role === "user" ? "Vous" : m.role === "error" ? "Erreur" : "Claude"}
                </span>
                <span style={{ fontSize: "13px", color: m.role === "error" ? "#dc2626" : T.textSec, lineHeight: 1.5 }}>
                  {m.text}
                </span>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", padding: "12px 24px", gap: "12px" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#0369a1" }}>Claude</span>
          <span style={{ color: T.border }}>›</span>
          <input
            value={cmd}
            onChange={e => setCmd(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !loading && handleCmd()}
            placeholder={apiKey ? "Crée un projet... / Ajoute un événement... / Résume les projets actifs..." : "Configure la clé API pour activer l'assistant →"}
            disabled={loading}
            style={{ flex: 1, background: "none", border: "none", color: T.text,
              fontFamily: FONT, fontSize: "13px", outline: "none", opacity: loading ? 0.5 : 1 }}
          />
          {loading
            ? <span style={{ fontSize: "12px", color: T.textMuted }}>Traitement…</span>
            : <button onClick={handleCmd} style={{
                background: T.surfaceAlt, border: `1px solid ${T.border}`,
                color: T.textSec, fontFamily: FONT, fontSize: "12px", fontWeight: 500,
                padding: "5px 14px", cursor: "pointer", borderRadius: "6px" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#e0f2fe"; e.currentTarget.style.color = "#0369a1"; e.currentTarget.style.borderColor = "#bae6fd"; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.surfaceAlt; e.currentTarget.style.color = T.textSec; e.currentTarget.style.borderColor = T.border; }}>
                Envoyer
              </button>}
        </div>
      </div>

      {/* MODALS */}
      {editing && <EditModal project={editing}
        onSave={updated => { setProjects(ps => ps.map(p => p.id === updated.id ? updated : p)); setEditing(null); }}
        onClose={() => setEditing(null)} />}
      {showApiModal && <ApiKeyModal onSave={k => { setApiKey(k); setShowApiModal(false); }} onClose={() => setShowApiModal(false)} />}
    </div>
  );
}
