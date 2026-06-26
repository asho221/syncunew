// Demo data for Sync U — two patients across two conditions, 90 days of logs.
// All synthetic. Designed so the clinician summary tells a clear, realistic story.

export const BRAND = {
  teal: "#0F4C5C",
  tealDeep: "#0A3540",
  ivory: "#F7F4EE",
  sand: "#EDE7DA",
  coral: "#C75D43",
  coralSoft: "#E8927B",
  ink: "#13262B",
  muted: "#5C6B70",
  good: "#2F6B4F",
  amber: "#B7791F",
  line: "#E3DDD0",
};

// ---- helper to build 90 days of dates ending "today" ----
function lastNDates(n) {
  const out = [];
  const today = new Date("2026-06-12T00:00:00");
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push(d);
  }
  return out;
}
const DATES = lastNDates(90);
const fmt = (d) => d.toISOString().slice(0, 10);
const label = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

// gentle noise
function noise(a) { return (Math.random() - 0.5) * a; }

// ============ PATIENT 1 — MENOPAUSE — improving on HRT after a dose change ============
// Story: started low-dose HRT, little improvement for ~5 weeks, dose raised at the
// 6-week mark, then symptoms ease but adherence dips for a stretch (the insight).
function buildMenopause() {
  const entries = DATES.map((d, i) => {
    // dose change at day 42
    const phase = i < 42 ? 0 : 1;
    // symptom severity 0-10 (higher worse) — hot flushes
    let flush =
      phase === 0
        ? 7 + noise(1.4) - i * 0.02
        : 6.2 - (i - 42) * 0.10 + noise(1.1);
    flush = Math.max(0.5, Math.min(10, flush));
    let sleep =
      phase === 0
        ? 4.6 + noise(1.2) + i * 0.005
        : 5.2 + (i - 42) * 0.06 + noise(1.0); // hours
    sleep = Math.max(2.5, Math.min(9, sleep));
    let mood =
      phase === 0
        ? 5.4 + noise(1.5) - i * 0.01
        : 5.0 - (i - 42) * 0.06 + noise(1.2); // 0-10 low=better
    mood = Math.max(0.5, Math.min(10, mood));

    // adherence — good early, dips days 50-64 (the story), recovers
    let took = true;
    if (i >= 50 && i <= 64) took = Math.random() > 0.55;
    else took = Math.random() > 0.08;
    // a few missing logs to feel real
    const logged = Math.random() > 0.06;

    return {
      date: fmt(d),
      label: label(d),
      logged,
      flush: logged ? +flush.toFixed(1) : null,
      sleep: logged ? +sleep.toFixed(1) : null,
      mood: logged ? +mood.toFixed(1) : null,
      took: logged ? took : null,
      sideEffects:
        logged && phase === 1 && i < 52 && Math.random() > 0.7
          ? ["Breast tenderness"]
          : [],
      note:
        i === 42
          ? "Dose increased to 75mcg patch"
          : i === 7 && logged
          ? "Flushes worst overnight, waking 3-4x"
          : i === 58 && logged
          ? "Busy fortnight, forgot patch change a few times"
          : "",
    };
  });
  return entries;
}

// ============ PATIENT 2 — PCOS — partial response, adherence is the real issue ============
// Story: on metformin + lifestyle plan; cycle slowly regularising, but the logs reveal
// adherence is patchy — the question "not working, or not taken?" is answered.
function buildPCOS() {
  const entries = DATES.map((d, i) => {
    let energy = 4.4 + i * 0.012 + noise(1.4); // 0-10 higher better
    energy = Math.max(1, Math.min(10, energy));
    let cravings = 6.5 - i * 0.012 + noise(1.6); // 0-10 higher worse
    cravings = Math.max(0.5, Math.min(10, cravings));
    let cycleDay = ((i % 38) + 1); // long, irregular cycles
    const bleeding = cycleDay <= 4;

    // adherence to metformin — genuinely patchy (the insight for PCOS)
    let took = Math.random() > 0.34;
    const logged = Math.random() > 0.10;

    return {
      date: fmt(d),
      label: label(d),
      logged,
      energy: logged ? +energy.toFixed(1) : null,
      cravings: logged ? +cravings.toFixed(1) : null,
      cycleDay,
      bleeding: logged ? bleeding : null,
      took: logged ? took : null,
      sideEffects:
        logged && took && Math.random() > 0.82 ? ["Nausea after dose"] : [],
      note:
        i === 0
          ? "Started metformin 500mg + lifestyle plan"
          : i === 30 && logged
          ? "Skin and cycle a little better; energy still low"
          : i === 70 && logged
          ? "Struggling to take metformin consistently"
          : "",
    };
  });
  return entries;
}

export const PATIENTS = {
  menopause: {
    id: "p-anita",
    name: "Anita R.",
    age: 52,
    condition: "Menopause",
    conditionColor: BRAND.teal,
    treatment: "HRT — 75mcg estradiol patch + micronised progesterone",
    started: "12 weeks ago",
    wearable: true,
    device: "Oura Ring",
    nextReview: "Tomorrow, 10:30",
    summaryHeadline: "Improving since the dose change, but adherence dipped mid-cycle",
    entries: buildMenopause(),
    symptoms: [
      { key: "flush", name: "Hot flushes", unit: "/10", invert: true },
      { key: "sleep", name: "Sleep", unit: "hrs", invert: false },
      { key: "mood", name: "Low mood", unit: "/10", invert: true },
    ],
    logFields: [
      { key: "flush", label: "Hot flushes & night sweats", type: "scale", lowLabel: "None", highLabel: "Severe" },
      { key: "sleep", label: "How many hours did you sleep?", type: "hours" },
      { key: "mood", label: "Mood today", type: "scale", lowLabel: "Good", highLabel: "Very low" },
      { key: "took", label: "Did you use your patch as prescribed?", type: "yesno" },
      { key: "sideEffects", label: "Any side effects?", type: "tags", options: ["Breast tenderness", "Headache", "Nausea", "Bleeding", "None"] },
    ],
  },
  pcos: {
    id: "p-leah",
    name: "Leah M.",
    age: 29,
    condition: "PCOS",
    conditionColor: BRAND.coral,
    treatment: "Metformin 500mg + structured lifestyle plan",
    started: "12 weeks ago",
    wearable: false,
    device: null,
    nextReview: "Thursday, 14:00",
    summaryHeadline: "Cycle slowly regularising — but the plan is only half-followed",
    entries: buildPCOS(),
    symptoms: [
      { key: "energy", name: "Energy", unit: "/10", invert: false },
      { key: "cravings", name: "Cravings", unit: "/10", invert: true },
    ],
    logFields: [
      { key: "energy", label: "Energy levels today", type: "scale", lowLabel: "Exhausted", highLabel: "Great" },
      { key: "cravings", label: "Sugar / carb cravings", type: "scale", lowLabel: "None", highLabel: "Intense" },
      { key: "bleeding", label: "Any bleeding today?", type: "yesno" },
      { key: "took", label: "Did you take your metformin?", type: "yesno" },
      { key: "sideEffects", label: "Any side effects?", type: "tags", options: ["Nausea after dose", "Bloating", "Headache", "None"] },
    ],
  },
};

// ---- derived analytics for the clinician summary ----
export function analyse(patient) {
  const e = patient.entries;
  const logged = e.filter((x) => x.logged);
  const adherenceDays = logged.filter((x) => x.took === true).length;
  const adherence = Math.round((adherenceDays / logged.length) * 100);
  const logRate = Math.round((logged.length / e.length) * 100);

  // adherence in two halves to surface a trend
  const mid = Math.floor(e.length / 2);
  const firstHalf = e.slice(0, mid).filter((x) => x.logged);
  const secondHalf = e.slice(mid).filter((x) => x.logged);
  const adhA = Math.round((firstHalf.filter((x) => x.took).length / firstHalf.length) * 100);
  const adhB = Math.round((secondHalf.filter((x) => x.took).length / secondHalf.length) * 100);

  // primary symptom trend (first symptom)
  const sym = patient.symptoms[0];
  const early = logged.slice(0, 14).map((x) => x[sym.key]).filter((v) => v != null);
  const late = logged.slice(-14).map((x) => x[sym.key]).filter((v) => v != null);
  const earlyAvg = early.reduce((a, b) => a + b, 0) / early.length;
  const lateAvg = late.reduce((a, b) => a + b, 0) / late.length;
  const improved = sym.invert ? lateAvg < earlyAvg : lateAvg > earlyAvg;
  const deltaPct = Math.round((Math.abs(lateAvg - earlyAvg) / earlyAvg) * 100);

  const sideEffectDays = logged.filter((x) => x.sideEffects && x.sideEffects.length).length;

  return {
    adherence, logRate, adhA, adhB,
    symName: sym.name, improved, deltaPct,
    earlyAvg: +earlyAvg.toFixed(1), lateAvg: +lateAvg.toFixed(1),
    sideEffectDays,
    loggedCount: logged.length,
    totalDays: e.length,
  };
}
