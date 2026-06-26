"use client";
import Link from "next/link";
import { useState } from "react";
import { PATIENTS, analyse } from "../../lib/data";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine,
  Area, AreaChart, CartesianGrid,
} from "recharts";

const COND = [
  { key: "menopause", ...PATIENTS.menopause },
  { key: "pcos", ...PATIENTS.pcos },
];

function AdherenceStrip({ entries }) {
  // last 30 days as squares
  const last = entries.slice(-35);
  return (
    <div>
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {last.map((e, i) => {
          let bg = "var(--line)";
          let title = `${e.label}: no log`;
          if (e.logged && e.took === true) { bg = "var(--good)"; title = `${e.label}: taken`; }
          else if (e.logged && e.took === false) { bg = "var(--coral)"; title = `${e.label}: missed`; }
          return <div key={i} title={title} style={{ width: 15, height: 15, borderRadius: 3, background: bg }} />;
        })}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12.5 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="dot" style={{ background: "var(--good)" }} /> Taken</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="dot" style={{ background: "var(--coral)" }} /> Missed</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="dot" style={{ background: "var(--line)" }} /> No log</span>
      </div>
    </div>
  );
}

function SymptomChart({ entries, sym, color }) {
  const data = entries
    .filter((e) => e.logged && e[sym.key] != null)
    .map((e) => ({ label: e.label, value: e[sym.key] }));
  return (
    <div style={{ height: 150 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id={`g-${sym.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="#EDE7DA" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9AA5A8" }} interval={Math.floor(data.length / 5)} tickLine={false} axisLine={{ stroke: "#E3DDD0" }} />
          <YAxis tick={{ fontSize: 10, fill: "#9AA5A8" }} tickLine={false} axisLine={false} domain={sym.unit === "hrs" ? [0, 10] : [0, 10]} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E3DDD0", boxShadow: "var(--shadow)" }}
            labelStyle={{ color: "#5C6B70" }}
            formatter={(v) => [`${v}${sym.unit}`, sym.name]}
          />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#g-${sym.key})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function Stat({ label, value, sub, tone }) {
  const color = tone === "good" ? "var(--good)" : tone === "amber" ? "var(--amber)" : "var(--teal)";
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <div className="serif" style={{ fontSize: 30, fontWeight: 500, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

export default function ClinicianView() {
  const [condIdx, setCondIdx] = useState(0);
  const patient = COND[condIdx];
  const a = analyse(patient);
  const adhTone = a.adherence >= 80 ? "good" : "amber";

  return (
    <main style={{ minHeight: "100vh", background: "var(--sand)" }}>
      {/* demo top bar */}
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <Link href="/" className="muted" style={{ fontSize: 14, fontWeight: 600 }}>← Demo home</Link>
        <div style={{ display: "flex", gap: 8 }}>
          {COND.map((c, i) => (
            <button key={c.key} onClick={() => setCondIdx(i)} className={`pill ${i === condIdx ? (i === 0 ? "pill-teal" : "pill-coral") : ""}`}
              style={{ border: i === condIdx ? "none" : "1px solid var(--sand-2)", background: i === condIdx ? undefined : "transparent", color: i === condIdx ? undefined : "var(--muted)" }}>
              {c.name} · {c.condition}
            </button>
          ))}
        </div>
      </div>

      <div className="wrap" style={{ paddingBottom: 60 }}>
        {/* EHR frame */}
        <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-lg)", border: "1px solid var(--line)", marginTop: 8 }}>
          {/* fake EHR chrome */}
          <div style={{ background: "#F2EFEA", borderBottom: "1px solid var(--line)", padding: "10px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ width: 11, height: 11, borderRadius: 100, background: "#E1655A" }} />
              <span style={{ width: 11, height: 11, borderRadius: 100, background: "#E8B14C" }} />
              <span style={{ width: 11, height: 11, borderRadius: 100, background: "#69B86B" }} />
            </div>
            <div style={{ flex: 1, background: "#fff", border: "1px solid var(--line)", borderRadius: 6, padding: "5px 12px", fontSize: 12.5, color: "var(--muted)", maxWidth: 420 }}>
              app.semble.io / patients / {patient.name.toLowerCase().replace(/[^a-z]/g, "")}
            </div>
            <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>Semble · Practice EHR</span>
          </div>

          {/* EHR patient header (their system) */}
          <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ width: 44, height: 44, borderRadius: 100, background: patient.conditionColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 16 }}>
              {patient.name.split(" ").map((x) => x[0]).join("")}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{patient.name}</div>
              <div className="muted" style={{ fontSize: 13 }}>{patient.age} · {patient.condition} · Next review: {patient.nextReview}</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 18, fontSize: 13, color: "var(--muted)" }}>
              <span>Notes</span><span>Prescriptions</span><span>Letters</span>
              <span style={{ color: patient.conditionColor, fontWeight: 600, borderBottom: `2px solid ${patient.conditionColor}`, paddingBottom: 2 }}>Sync U</span>
            </div>
          </div>

          {/* ===== THE SYNC U PANEL (embedded) ===== */}
          <div style={{ padding: "26px 26px 30px", background: "linear-gradient(180deg, #FCFBF8, #fff)" }}>
            {/* panel header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Sync U · Between-visit summary</div>
                <h1 className="serif" style={{ fontSize: 24, fontWeight: 500, color: "var(--ink)", maxWidth: 620, lineHeight: 1.25 }}>
                  {patient.summaryHeadline}
                </h1>
                <div className="muted" style={{ fontSize: 13.5, marginTop: 8 }}>
                  {patient.treatment} · started {patient.started}
                  {patient.wearable ? ` · ${patient.device} connected` : " · no wearable"}
                </div>
              </div>
              <span className={`pill ${a.improved ? "pill-good" : "pill-amber"}`} style={{ fontSize: 13, padding: "7px 13px" }}>
                {a.improved ? "↓ Symptoms improving" : "→ Mixed response"}
              </span>
            </div>

            {/* top stat row */}
            <div style={{ display: "flex", gap: 20, padding: "18px 20px", background: "#fff", border: "1px solid var(--line)", borderRadius: 14, marginBottom: 18, flexWrap: "wrap" }}>
              <Stat
                label="Treatment adherence"
                value={`${a.adherence}%`}
                sub={`${a.adhA}% early → ${a.adhB}% recent`}
                tone={adhTone}
              />
              <div style={{ width: 1, background: "var(--line)" }} />
              <Stat
                label={`${a.symName} (first 2 wks → last 2 wks)`}
                value={`${a.earlyAvg} → ${a.lateAvg}`}
                sub={a.improved ? `${a.deltaPct}% better` : `${a.deltaPct}% change`}
                tone={a.improved ? "good" : "amber"}
              />
              <div style={{ width: 1, background: "var(--line)" }} />
              <Stat
                label="Days logged"
                value={`${a.loggedCount}/${a.totalDays}`}
                sub={`${a.logRate}% of days`}
                tone="teal"
              />
              <div style={{ width: 1, background: "var(--line)" }} />
              <Stat
                label="Side-effect days"
                value={a.sideEffectDays}
                sub={a.sideEffectDays ? "see timeline" : "none reported"}
                tone="teal"
              />
            </div>

            {/* the key insight callout */}
            <div style={{ display: "flex", gap: 14, padding: "16px 18px", background: adhTone === "good" ? "var(--good-bg)" : "var(--amber-bg)", borderRadius: 12, marginBottom: 24, alignItems: "flex-start" }}>
              <div style={{ fontSize: 18, lineHeight: 1.2 }}>{adhTone === "good" ? "✓" : "!"}</div>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ink)" }}>
                {condIdx === 0 ? (
                  <>
                    <strong>The data answers the question memory can’t.</strong> Hot flushes and sleep clearly improved after the
                    dose change at week 6 — but adherence dropped to <strong>{patient.entries.slice(50,65).filter(e=>e.took===false).length} missed days</strong> in
                    weeks 8–9. The recent plateau is likely missed doses, not treatment failure. Worth confirming before changing the dose again.
                  </>
                ) : (
                  <>
                    <strong>Is it the plan, or the adherence?</strong> Energy and cravings are only slightly better, which could read as a weak
                    response — but metformin was taken on just <strong>{a.adherence}% of days</strong>. Before escalating treatment, the
                    bigger lever here is adherence support. The data separates the two.
                  </>
                )}
              </div>
            </div>

            {/* adherence strip */}
            <div style={{ marginBottom: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>Adherence — last 5 weeks</h3>
                <span className="muted" style={{ fontSize: 12.5 }}>Did the patient take the treatment?</span>
              </div>
              <AdherenceStrip entries={patient.entries} />
            </div>

            {/* symptom charts */}
            <div style={{ display: "grid", gridTemplateColumns: patient.symptoms.length > 2 ? "1fr 1fr 1fr" : "1fr 1fr", gap: 20 }} className="chart-grid">
              {patient.symptoms.map((sym) => (
                <div key={sym.key} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600 }}>{sym.name}</h4>
                    <span className="muted" style={{ fontSize: 11.5 }}>90 days · {sym.invert ? "lower is better" : "higher is better"}</span>
                  </div>
                  <SymptomChart entries={patient.entries} sym={sym} color={condIdx === 0 ? "var(--teal)" : "var(--coral)"} />
                </div>
              ))}
            </div>

            {/* patient notes timeline */}
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>What the patient flagged</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {patient.entries.filter((e) => e.note).map((e, i, arr) => (
                  <div key={i} style={{ display: "flex", gap: 14, paddingBottom: i < arr.length - 1 ? 14 : 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span className="dot" style={{ background: patient.conditionColor, width: 9, height: 9, marginTop: 4 }} />
                      {i < arr.length - 1 && <span style={{ width: 1, flex: 1, background: "var(--line)", marginTop: 4 }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}>{e.label}</div>
                      <div style={{ fontSize: 14, color: "var(--ink)" }}>{e.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* footer line */}
            <div style={{ marginTop: 26, paddingTop: 18, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <span className="muted" style={{ fontSize: 12.5, maxWidth: 560, lineHeight: 1.5 }}>
                Sync U displays patient-reported data and connected wearable signals. It does not diagnose or recommend treatment.
                Clinical decisions remain with the clinician.
              </span>
              <Link href="/patient" className="btn btn-ghost" style={{ fontSize: 13.5, padding: "9px 16px" }}>
                ← See the patient side
              </Link>
            </div>
          </div>
        </div>

        <p className="muted" style={{ textAlign: "center", fontSize: 13, marginTop: 18, lineHeight: 1.5 }}>
          This is the whole product for the clinician — one page, inside the system they already use.
          Switch between <strong>{COND[0].name}</strong> and <strong>{COND[1].name}</strong> above to see the same summary adapt to a different condition.
        </p>
      </div>

      <style>{`@media (max-width: 760px){ .chart-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </main>
  );
}
