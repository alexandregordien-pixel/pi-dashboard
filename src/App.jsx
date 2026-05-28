import { useState, useRef, useEffect } from "react";

// ─── DONNÉES INITIALES ───────────────────────────────────────────────────────
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
    color: "#00e5ff", createdAt: "2025-01",
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
    color: "#69ff47", createdAt: "2025-03",
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
    color: "#ffd600", createdAt: "2025-02",
  },
  {
    id: 4, code: "AFGM", name: "AFGSU-Manager",
    description: "Gestion formations AFGSU — Grist / numerique.gouv.fr",
    status: "pending", tags: ["Grist", "Formation", "BDD"],
    links: { github: "", docs: "https://grist.numerique.gouv.fr" },
    conversations: [{ label: "Audit structurel Grist", url: "https://claude.ai" }],
    color: "#ff6d00", createdAt: "2025-04",
  },
  {
    id: 5, code: "DASH", name: "Pi Dashboard",
    description: "Dashboard projets self-hosted — React / Vite / Raspberry Pi 3B+",
    status: "active", tags: ["React", "Vite", "Raspberry Pi", "Nginx"],
    links: { github: "", docs: "" },
    conversations: [{ label: "Construction dashboard + déploiement", url: "https://claude.ai" }],
    color: "#e040fb", createdAt: "2026-05",
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
Tu gères un dashboard de projets. Voici l'état actuel des projets en JSON :
${JSON.stringify(projects, null, 2)}

Tu peux répondre de deux façons :
1. Si l'utilisateur veut MODIFIER les projets (créer, modifier, supprimer, ajouter une conversation, changer un statut, etc.) :
   Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans texte avant/après) :
   { "action": "update", "projects": [...liste complète mise à jour...], "message": "Ce que tu as fait en une phrase" }

2. Si l'utilisateur pose une QUESTION ou veut un RÉSUMÉ (sans modification) :
   Réponds UNIQUEMENT avec :
   { "action": "info", "message": "Ta réponse ici" }

Règles :
- Les IDs existants ne changent pas. Les nouveaux projets ont un ID = Date.now()
- Les statuts possibles : active, complete, pending, archived
- Sois concis et militaire dans le ton
- Pour les nouvelles conversations, utilise l'URL https://claude.ai par défaut
- JAMAIS de texte hors du JSON`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── COMPOSANTS ───────────────────────────────────────────────────────────────
function ProjectCard({ project, selected, onSelect, onEdit }) {
  const s = STATUS[project.status];
  return (
    <div onClick={() => onSelect(project.id)} style={{
      borderLeft: `3px solid ${project.color}`,
      border: `1px solid ${selected ? project.color + "88" : "#1e1e1e"}`,
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
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "14px", color: "#e0e0e0", letterSpacing: "0.5px" }}>
            {project.name}
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: s.color,
            border: `1px solid ${s.color}44`, padding: "1px 6px", letterSpacing: "1px" }}>
            {s.label}
          </span>
          <button onClick={e => { e.stopPropagation(); onEdit(project); }}
            style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "13px", lineHeight: 1 }}
            onMouseEnter={e => e.target.style.color = "#888"}
            onMouseLeave={e => e.target.style.color = "#444"}>✎</button>
        </div>
      </div>
      <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: "#666", margin: "0 0 10px", lineHeight: 1.6 }}>
        {project.description}
      </p>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {project.tags.map(t => (
          <span key={t} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#555",
            border: "1px solid #222", padding: "1px 6px" }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function DetailPanel({ project }) {
  if (!project) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%",
      fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: "#2a2a2a", letterSpacing: "3px" }}>
      ← SÉLECTIONNER UN PROJET
    </div>
  );
  return (
    <div style={{ padding: "20px" }}>
      <div style={{ borderBottom: "1px solid #1a1a1a", paddingBottom: "14px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: project.color,
            background: project.color + "18", padding: "2px 8px", letterSpacing: "2px" }}>{project.code}</span>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "16px", color: "#fff" }}>{project.name}</span>
        </div>
        <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: "#666", margin: 0, lineHeight: 1.6 }}>
          {project.description}
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#444", letterSpacing: "2px", marginBottom: "10px" }}>
          CONVERSATIONS CLAUDE
        </div>
        {project.conversations.length === 0
          ? <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: "#333" }}>Aucune conversation.</p>
          : project.conversations.map((c, i) => (
            <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" style={{
              display: "block", fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: "#aaa",
              textDecoration: "none", padding: "9px 12px", marginBottom: "5px",
              borderLeft: `2px solid ${project.color}`, border: `1px solid #1a1a1a`,
              borderLeft: `2px solid ${project.color}`, background: "#0d0d0d", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "#141414"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#aaa"; e.currentTarget.style.background = "#0d0d0d"; }}>
              <span style={{ color: "#444", marginRight: "8px" }}>↗</span>{c.label}
            </a>
          ))}
      </div>

      {project.links.github && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#444", letterSpacing: "2px", marginBottom: "10px" }}>
            GITHUB
          </div>
          <a href={project.links.github} target="_blank" rel="noopener noreferrer" style={{
            display: "block", fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: "#aaa",
            textDecoration: "none", padding: "9px 12px", border: "1px solid #1a1a1a",
            borderLeft: "2px solid #444", background: "#0d0d0d", wordBreak: "break-all",
          }}>
            <span style={{ color: "#444", marginRight: "8px" }}>⌥</span>
            {project.links.github.replace("https://", "")}
          </a>
        </div>
      )}

      {project.links.docs && (
        <div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#444", letterSpacing: "2px", marginBottom: "10px" }}>
            DOCUMENTATION
          </div>
          <a href={project.links.docs} target="_blank" rel="noopener noreferrer" style={{
            display: "block", fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: "#aaa",
            textDecoration: "none", padding: "9px 12px", border: "1px solid #1a1a1a",
            borderLeft: "2px solid #444", background: "#0d0d0d",
          }}>
            <span style={{ color: "#444", marginRight: "8px" }}>⊞</span>
            {project.links.docs.replace("https://", "")}
          </a>
        </div>
      )}
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
  const inp = (val, onChange, ph) => (
    <input value={val} onChange={e => onChange(e.target.value)} placeholder={ph} style={{
      width: "100%", boxSizing: "border-box", background: "#0d0d0d",
      border: "1px solid #222", color: "#ccc", fontFamily: "'Share Tech Mono', monospace",
      fontSize: "11px", padding: "7px 10px", outline: "none", borderRadius: "1px",
    }} />
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "#0a0a0a", border: `1px solid ${form.color}44`,
        borderTop: `2px solid ${form.color}`, padding: "24px", width: "480px",
        maxHeight: "85vh", overflowY: "auto", fontFamily: "'Share Tech Mono', monospace" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "18px" }}>
          <span style={{ fontSize: "10px", color: "#666", letterSpacing: "2px" }}>ÉDITION PROJET</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer" }}>✕</button>
        </div>
        {[["CODE", "code", "AZM"], ["NOM", "name", "Nom"], ["DESCRIPTION", "description", "Description"]].map(([l, k, p]) => (
          <div key={k} style={{ marginBottom: "10px" }}>
            <div style={{ fontSize: "9px", color: "#444", letterSpacing: "2px", marginBottom: "4px" }}>{l}</div>
            {inp(form[k], v => u(k, v), p)}
          </div>
        ))}
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
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "9px", color: "#444", letterSpacing: "2px", marginBottom: "8px" }}>CONVERSATIONS</div>
          {form.conversations.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "5px 8px", marginBottom: "4px", background: "#0d0d0d", border: "1px solid #1a1a1a" }}>
              <span style={{ fontSize: "10px", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "85%" }}>{c.label}</span>
              <button onClick={() => setForm(f => ({ ...f, conversations: f.conversations.filter((_, j) => j !== i) }))}
                style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "11px" }}>✕</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
            <input value={newConv.label} onChange={e => setNewConv(n => ({ ...n, label: e.target.value }))}
              placeholder="Libellé" style={{ flex: 1, background: "#0d0d0d", border: "1px solid #222",
                color: "#ccc", fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", padding: "6px 8px", outline: "none" }} />
            <input value={newConv.url} onChange={e => setNewConv(n => ({ ...n, url: e.target.value }))}
              placeholder="URL (optionnel)" style={{ flex: 2, background: "#0d0d0d", border: "1px solid #222",
                color: "#ccc", fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", padding: "6px 8px", outline: "none" }} />
            <button onClick={addConv} style={{ background: "#111", border: "1px solid #2a2a2a", color: "#888",
              fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", padding: "6px 10px", cursor: "pointer" }}>+</button>
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
        <div style={{ fontSize: "10px", color: "#00e5ff", letterSpacing: "2px", marginBottom: "16px" }}>
          CLÉ API ANTHROPIC
        </div>
        <p style={{ fontSize: "10px", color: "#666", lineHeight: 1.7, marginBottom: "16px" }}>
          Pour activer l'assistant Claude dans le dashboard, entre ta clé API Anthropic.
          Elle sera stockée uniquement en mémoire de session (non persistée).
        </p>
        <input value={key} onChange={e => setKey(e.target.value)}
          type="password" placeholder="sk-ant-api03-..."
          style={{ width: "100%", boxSizing: "border-box", background: "#0d0d0d", border: "1px solid #222",
            color: "#ccc", fontFamily: "'Share Tech Mono', monospace", fontSize: "11px",
            padding: "9px 12px", outline: "none", marginBottom: "16px" }} />
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #2a2a2a", color: "#666",
            fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", padding: "7px 14px", cursor: "pointer" }}>
            ANNULER
          </button>
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
  const cmdRef = useRef(null);
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
      if (result.action === "update") {
        setProjects(result.projects);
      }
      setCmdHistory(h => [...h, { role: "assistant", text: result.message }]);
    } catch (e) {
      setCmdHistory(h => [...h, { role: "error", text: `Erreur : ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = projects.filter(p => p.status === "active").length;

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#ccc",
      fontFamily: "'Share Tech Mono', monospace", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #141414", padding: "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", background: "#090909" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "9px", color: "#00e5ff", letterSpacing: "4px", fontWeight: "bold" }}>
            ALEXANDRE GORDIEN
          </span>
          <span style={{ color: "#1a1a1a" }}>|</span>
          <span style={{ fontSize: "9px", color: "#444", letterSpacing: "2px" }}>TABLEAU DE BORD PROJETS</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "9px", color: "#333", letterSpacing: "1px" }}>
            {activeCount} ACTIFS · {projects.length} TOTAL
          </span>
          <button onClick={() => setShowApiModal(true)} style={{
            background: apiKey ? "#00e5ff15" : "none",
            border: `1px solid ${apiKey ? "#00e5ff44" : "#1e1e1e"}`,
            color: apiKey ? "#00e5ff" : "#444", fontFamily: "'Share Tech Mono', monospace",
            fontSize: "9px", padding: "4px 10px", cursor: "pointer", letterSpacing: "1px",
          }}>
            {apiKey ? "● API OK" : "○ API KEY"}
          </button>
          <button onClick={() => {
            const newP = { id: Date.now(), code: "NEW", name: "Nouveau Projet",
              description: "Description", status: "pending", tags: [],
              links: { github: "", docs: "" }, conversations: [], color: "#888", createdAt: new Date().toISOString().slice(0,7) };
            setProjects(p => [newP, ...p]); setEditing(newP);
          }} style={{ background: "none", border: "1px solid #1e1e1e", color: "#666",
            fontFamily: "'Share Tech Mono', monospace", fontSize: "9px",
            padding: "4px 10px", cursor: "pointer", letterSpacing: "1px",
            transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#444"; e.currentTarget.style.color = "#ccc"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.color = "#666"; }}>
            + NOUVEAU
          </button>
        </div>
      </div>

      {/* FILTRES */}
      <div style={{ display: "flex", borderBottom: "1px solid #0e0e0e", background: "#090909" }}>
        {[["all", "TOUS"], ...Object.entries(STATUS).map(([k, v]) => [k, v.label])].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            background: "none", border: "none", borderBottom: filter === k ? "2px solid #00e5ff" : "2px solid transparent",
            color: filter === k ? "#e0e0e0" : "#444", fontFamily: "'Share Tech Mono', monospace",
            fontSize: "9px", padding: "8px 14px", cursor: "pointer", letterSpacing: "1.5px",
          }}>{l}</button>
        ))}
      </div>

      {/* LAYOUT PRINCIPAL */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", flex: 1, overflow: "hidden" }}>

        {/* LISTE PROJETS */}
        <div style={{ overflowY: "auto", padding: "16px 20px", borderRight: "1px solid #0e0e0e" }}>
          {filtered.length === 0
            ? <div style={{ color: "#2a2a2a", fontSize: "10px", letterSpacing: "2px", textAlign: "center", marginTop: "40px" }}>AUCUN PROJET</div>
            : filtered.map(p => (
              <ProjectCard key={p.id} project={p} selected={selected === p.id}
                onSelect={id => setSelected(s => s === id ? null : id)}
                onEdit={setEditing} />
            ))}
        </div>

        {/* PANEL DÉTAIL */}
        <div style={{ overflowY: "auto", background: "#090909" }}>
          <DetailPanel project={selectedProject} />
        </div>
      </div>

      {/* BARRE COMMANDE CLAUDE */}
      <div style={{ borderTop: "1px solid #141414", background: "#090909" }}>
        {cmdHistory.length > 0 && (
          <div ref={historyRef} style={{ maxHeight: "120px", overflowY: "auto", padding: "10px 20px",
            borderBottom: "1px solid #0e0e0e" }}>
            {cmdHistory.map((m, i) => (
              <div key={i} style={{ marginBottom: "5px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "9px", color: m.role === "user" ? "#00e5ff" : m.role === "error" ? "#ff4444" : "#69ff47",
                  letterSpacing: "1px", minWidth: "60px", marginTop: "1px" }}>
                  {m.role === "user" ? "YOU >" : m.role === "error" ? "ERR >" : "CLD >"}
                </span>
                <span style={{ fontSize: "10px", color: m.role === "error" ? "#ff4444" : "#888", lineHeight: 1.5 }}>{m.text}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", padding: "10px 20px", gap: "12px" }}>
          <span style={{ fontSize: "9px", color: "#00e5ff", letterSpacing: "2px" }}>CLAUDE &gt;</span>
          <input
            ref={cmdRef}
            value={cmd}
            onChange={e => setCmd(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !loading && handleCmd()}
            placeholder={apiKey ? "Crée un projet... / Ajoute une conv... / Résume les projets actifs..." : "Configure la clé API pour activer l'assistant →"}
            disabled={loading}
            style={{ flex: 1, background: "none", border: "none", color: "#ccc",
              fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", outline: "none",
              opacity: loading ? 0.5 : 1 }}
          />
          {loading
            ? <span style={{ fontSize: "9px", color: "#444", letterSpacing: "2px" }}>TRAITEMENT...</span>
            : <button onClick={handleCmd} style={{ background: "none", border: "1px solid #1e1e1e",
                color: "#444", fontFamily: "'Share Tech Mono', monospace", fontSize: "9px",
                padding: "4px 10px", cursor: "pointer", letterSpacing: "1px" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#00e5ff44"; e.currentTarget.style.color = "#00e5ff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.color = "#444"; }}>
                ENVOYER
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
