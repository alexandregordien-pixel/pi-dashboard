import { useState, useRef, useEffect } from "react";

const FONT = "'Inter', sans-serif";

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const PASS_HASH = "4d013ab6b7f57a5b84172aa0afb2f7d3125863c31c056df6f211471d722d4e90";

// SHA-256 pur JS — fonctionne sans HTTPS (pas de crypto.subtle)
function sha256(str) {
  const K = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
  ];
  let H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) { bytes.push((c >> 6) | 0xC0); bytes.push((c & 0x3F) | 0x80); }
    else { bytes.push((c >> 12) | 0xE0); bytes.push(((c >> 6) & 0x3F) | 0x80); bytes.push((c & 0x3F) | 0x80); }
  }
  const L = bytes.length;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const bl = L * 8;
  bytes.push(0, 0, 0, 0, (bl >>> 24) & 0xFF, (bl >>> 16) & 0xFF, (bl >>> 8) & 0xFF, bl & 0xFF);
  for (let i = 0; i < bytes.length; i += 64) {
    const W = Array(64);
    for (let t = 0; t < 16; t++)
      W[t] = (bytes[i+t*4] << 24) | (bytes[i+t*4+1] << 16) | (bytes[i+t*4+2] << 8) | bytes[i+t*4+3];
    for (let t = 16; t < 64; t++) {
      const s0 = ((W[t-15]>>>7)|(W[t-15]<<25))^((W[t-15]>>>18)|(W[t-15]<<14))^(W[t-15]>>>3);
      const s1 = ((W[t-2]>>>17)|(W[t-2]<<15))^((W[t-2]>>>19)|(W[t-2]<<13))^(W[t-2]>>>10);
      W[t] = (W[t-16]+s0+W[t-7]+s1) >>> 0;
    }
    let [a,b,c,d,e,f,g,h] = H;
    for (let t = 0; t < 64; t++) {
      const S1 = ((e>>>6)|(e<<26))^((e>>>11)|(e<<21))^((e>>>25)|(e<<7));
      const T1 = (h + S1 + ((e&f)^(~e&g)) + K[t] + W[t]) >>> 0;
      const S0 = ((a>>>2)|(a<<30))^((a>>>13)|(a<<19))^((a>>>22)|(a<<10));
      const T2 = (S0 + ((a&b)^(a&c)^(b&c))) >>> 0;
      h=g; g=f; f=e; e=(d+T1)>>>0; d=c; c=b; b=a; a=(T1+T2)>>>0;
    }
    H = H.map((v, i) => (v + [a,b,c,d,e,f,g,h][i]) >>> 0);
  }
  return H.map(n => n.toString(16).padStart(8, "0")).join("");
}

function hashPassword(pw) {
  return sha256(pw);
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
function sortTimeline(events) {
  return [...events].sort((a, b) => {
    const parse = d => {
      const [m, y] = (d || "").split(" ");
      return (parseInt(y) || 0) * 12 + (MONTHS.indexOf(m) === -1 ? 0 : MONTHS.indexOf(m));
    };
    return parse(a.date) - parse(b.date);
  });
}

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
    color: "#00b4cc", createdAt: "2025-01", notes: "",
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
    color: "#22a855", createdAt: "2025-03", notes: "",
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
    color: "#d4a017", createdAt: "2025-02", notes: "",
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
    color: "#e05a00", createdAt: "2025-04", notes: "",
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
    color: "#9c27b0", createdAt: "2026-05", notes: "",
  },
];

const STATUS = {
  active:   { label: "En cours",   color: "#0369a1", bg: "#e0f2fe" },
  complete: { label: "Terminé",    color: "#15803d", bg: "#dcfce7" },
  pending:  { label: "En attente", color: "#b45309", bg: "#fef3c7" },
  archived: { label: "Archivé",    color: "#6b7280", bg: "#f3f4f6" },
};

// ─── CLAUDE API (proxy via serveur berry) ────────────────────────────────────
async function askClaude(userMessage, projects) {
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

  const response = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage, systemPrompt }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Erreur ${response.status}`);
  const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onAuth }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async () => {
    const h = await hashPassword(pw);
    if (h === PASS_HASH) {
      sessionStorage.setItem("mante_auth", "1");
      onAuth();
    } else {
      setErr(true); setShake(true); setPw("");
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-7px)} 40%,80%{transform:translateX(7px)} }
        @keyframes fadein { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div style={{ animation: "fadein 0.35s ease", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <img src="./mante_logo_v5.svg" alt="MANTE" style={{ width: "min(520px, 80vw)", marginBottom: "36px" }} />
        <div style={{
          animation: shake ? "shake 0.45s ease" : "none",
          background: T.surface, border: `1px solid ${err ? "#fca5a5" : T.border}`,
          borderTop: "3px solid #22a855", borderRadius: "10px", padding: "32px",
          width: "320px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}>
          <div style={{ fontSize: "13px", color: T.textSec, marginBottom: "20px" }}>Accès restreint — identifiez-vous</div>
          <input type="password" value={pw} autoFocus
            onChange={e => { setPw(e.target.value); setErr(false); }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="Mot de passe"
            style={{ width: "100%", boxSizing: "border-box", background: T.surfaceAlt,
              border: `1px solid ${err ? "#fca5a5" : T.border}`, color: T.text,
              fontFamily: FONT, fontSize: "14px", padding: "10px 14px", outline: "none",
              borderRadius: "6px", marginBottom: err ? "10px" : "14px" }} />
          {err && <div style={{ fontSize: "12px", color: "#dc2626", marginBottom: "12px" }}>Mot de passe incorrect</div>}
          <button onClick={handleSubmit} style={{ width: "100%", background: "#22a855", border: "none",
            color: "#fff", fontFamily: FONT, fontSize: "14px", fontWeight: 600,
            padding: "10px", cursor: "pointer", borderRadius: "6px" }}>
            Accéder
          </button>
        </div>
      </div>
    </div>
  );
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
function DetailPanel({ project, onUpdateNotes }) {
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
  const sectionLabel = (txt) => (
    <div style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 600, color: T.textMuted,
      textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>{txt}</div>
  );

  return (
    <div style={{ padding: "24px 28px" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
          <span style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700,
            color: project.color, background: `${project.color}18`,
            padding: "3px 10px", borderRadius: "4px", letterSpacing: "0.5px" }}>{project.code}</span>
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: "20px", color: T.text }}>{project.name}</span>
          <span style={{ marginLeft: "auto", fontFamily: FONT, fontSize: "11px", fontWeight: 500,
            color: s.color, background: s.bg, padding: "3px 10px", borderRadius: "20px" }}>{s.label}</span>
        </div>
        <p style={{ fontFamily: FONT, fontSize: "13px", color: T.textSec, margin: 0, lineHeight: 1.7 }}>
          {project.description}
        </p>
      </div>

      {/* 1. TIMELINE */}
      {project.timeline && project.timeline.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          {sectionLabel("Chronologie")}
          <div style={{ position: "relative", paddingLeft: "16px" }}>
            <div style={{ position: "absolute", left: "4px", top: "6px", bottom: "6px",
              width: "2px", background: `${project.color}25`, borderRadius: "1px" }} />
            {project.timeline.map((e, i) => (
              <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "12px", position: "relative" }}>
                <div style={{ position: "absolute", left: "-20px", top: "4px",
                  width: "10px", height: "10px", borderRadius: "50%",
                  background: T.surface, border: `2px solid ${project.color}` }} />
                <div>
                  <span style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 600, color: project.color }}>{e.date}</span>
                  <span style={{ fontFamily: FONT, fontSize: "13px", color: T.textSec, marginLeft: "10px" }}>{e.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. GITHUB */}
      {project.links.github && (
        <div style={{ marginBottom: "24px" }}>
          {sectionLabel("GitHub")}
          <a href={project.links.github} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", gap: "10px",
            fontFamily: FONT, fontSize: "13px", color: T.textSec,
            textDecoration: "none", padding: "10px 14px",
            background: T.surfaceAlt, border: `1px solid ${T.border}`,
            borderRadius: "6px", wordBreak: "break-all",
          }}>
            <span>⌥</span>{project.links.github.replace("https://", "")}
          </a>
        </div>
      )}

      {project.links.docs && (
        <div style={{ marginBottom: "24px" }}>
          {sectionLabel("Documentation")}
          <a href={project.links.docs} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", gap: "10px",
            fontFamily: FONT, fontSize: "13px", color: T.textSec,
            textDecoration: "none", padding: "10px 14px",
            background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "6px",
          }}>
            <span>⊞</span>{project.links.docs.replace("https://", "")}
          </a>
        </div>
      )}

      {/* 3. NOTES */}
      <div style={{ marginBottom: "24px" }}>
        {sectionLabel("Notes")}
        <textarea
          value={project.notes || ""}
          onChange={e => onUpdateNotes(project.id, e.target.value)}
          placeholder="Ajouter des notes sur ce projet…"
          style={{
            width: "100%", boxSizing: "border-box",
            height: "130px", resize: "none", overflowY: "auto",
            background: T.surfaceAlt, border: `1px solid ${T.border}`,
            borderRadius: "6px", padding: "12px 14px",
            fontFamily: FONT, fontSize: "13px", color: T.text,
            lineHeight: 1.6, outline: "none",
          }}
          onFocus={e => e.target.style.borderColor = T.borderFocus}
          onBlur={e => e.target.style.borderColor = T.border}
        />
      </div>

      {/* 4. CONVERSATIONS CLAUDE */}
      <div style={{ marginBottom: "8px" }}>
        {sectionLabel("Conversations Claude")}
        {project.conversations.length === 0
          ? <p style={{ fontFamily: FONT, fontSize: "13px", color: T.textMuted, margin: 0 }}>Aucune conversation.</p>
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
              <span style={{ color: project.color, fontSize: "12px" }}>↗</span>{c.label}
            </a>
          ))}
      </div>
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
    setForm(f => ({ ...f, timeline: sortTimeline([...f.timeline, { ...newEvent }]) }));
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
          Elle sera stockée dans la base SQLite sur berry (persistée, jamais renvoyée au navigateur).
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
  const [auth, setAuth] = useState(() => sessionStorage.getItem("mante_auth") === "1");
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [loaded, setLoaded] = useState(false);
  const [apiStatus, setApiStatus] = useState("unknown"); // "ok" | "offline" | "unknown"
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

  // Vérifie si une clé API est déjà stockée sur le serveur
  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(s => { if (s.hasApiKey) setApiKey("[stored]"); })
      .catch(() => {});
  }, []);

  // Chargement initial : API SQLite en priorité, localStorage en fallback
  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        setProjects(data.length > 0 ? data : INITIAL_PROJECTS);
        setApiStatus("ok");
        setLoaded(true);
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem("mante_projects");
          if (saved) setProjects(JSON.parse(saved));
        } catch {}
        setApiStatus("offline");
        setLoaded(true);
      });
  }, []);

  // Sauvegarde : API SQLite en priorité, localStorage en fallback
  useEffect(() => {
    if (!loaded) return;
    fetch("/api/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projects),
    }).catch(() => {
      try { localStorage.setItem("mante_projects", JSON.stringify(projects)); } catch {}
    });
  }, [projects, loaded]);

  const handleCmd = async () => {
    if (!cmd.trim()) return;
    if (!apiKey) { setShowApiModal(true); return; }
    const userMsg = cmd.trim();
    setCmd("");
    setCmdHistory(h => [...h, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const result = await askClaude(userMsg, projects);
      if (result.action === "update") {
        setProjects(prev => {
          const claudeMap = new Map(result.projects.map(p => [p.id, p]));
          // Met à jour les projets que Claude a touchés, préserve les autres
          const merged = prev.map(p => claudeMap.has(p.id) ? claudeMap.get(p.id) : p);
          // Ajoute les nouveaux projets créés par Claude
          const prevIds = new Set(prev.map(p => p.id));
          const added = result.projects.filter(p => !prevIds.has(p.id));
          return [...merged, ...added];
        });
      }
      setCmdHistory(h => [...h, { role: "assistant", text: result.message }]);
    } catch (e) {
      setCmdHistory(h => [...h, { role: "error", text: `Erreur : ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = projects.filter(p => p.status === "active").length;

  if (!auth) return <LoginScreen onAuth={() => setAuth(true)} />;

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: T.bg, color: T.text, fontFamily: FONT, display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "4px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="./mante_icon.svg" alt="MANTE" style={{ height: "52px", display: "block" }} />
          <span style={{ color: T.border }}>|</span>
          <span style={{ fontSize: "14px", fontWeight: 700, color: T.text }}>Alexandre Gordien</span>
          <span style={{ color: T.border }}>|</span>
          <span style={{ fontSize: "13px", color: T.textSec }}>Tableau de bord projets</span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: T.textMuted }}>
            {activeCount} actifs · {projects.length} total
          </span>
          <span title={apiStatus === "ok" ? "SQLite connecté" : apiStatus === "offline" ? "Fallback localStorage" : "Connexion..."} style={{
            fontSize: "11px", fontFamily: FONT, fontWeight: 500,
            padding: "3px 8px", borderRadius: "10px",
            background: apiStatus === "ok" ? "#dcfce7" : "#f3f4f6",
            color: apiStatus === "ok" ? "#15803d" : "#6b7280",
            border: `1px solid ${apiStatus === "ok" ? "#bbf7d0" : "#e5e7eb"}`,
          }}>
            {apiStatus === "ok" ? "● SQLite" : apiStatus === "offline" ? "○ local" : "○ …"}
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
          <button onClick={() => {
            if (window.confirm("Réinitialiser tous les projets ?")) {
              localStorage.removeItem("mante_projects");
              setLoaded(false);
              setProjects(INITIAL_PROJECTS);
              setLoaded(true);
            }
          }} style={{
            background: "none", border: "none", color: T.textMuted,
            fontFamily: FONT, fontSize: "11px", cursor: "pointer", padding: "4px 6px",
          }}
            onMouseEnter={e => e.currentTarget.style.color = "#dc2626"}
            onMouseLeave={e => e.currentTarget.style.color = T.textMuted}
            title="Réinitialiser les données">↺</button>
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
          <DetailPanel project={selectedProject}
            onUpdateNotes={(id, notes) => setProjects(ps => ps.map(p => p.id === id ? { ...p, notes } : p))} />
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
            placeholder={apiKey ? "Crée un projet… / Ajoute un événement… / Résume les projets actifs…" : "Configure la clé API pour activer l'assistant →"}
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
      {showApiModal && <ApiKeyModal onSave={k => {
        fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey: k }) })
          .catch(() => {});
        setApiKey("[stored]");
        setShowApiModal(false);
      }} onClose={() => setShowApiModal(false)} />}
    </div>
  );
}
