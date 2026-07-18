// Single source of truth for tunable knobs: risk threshold, top-N, color scale,
// and the archetype narratives. Change behaviour here, not in components.

// A "Generate Suggestions" button appears only at or above this churn probability.
export const SUGGESTION_THRESHOLD = 0.6;

// The decision threshold the model was finalised at (LightGBM @ 0.40, from the notebook).
// Used only for labelling context, not recomputed here.
export const DECISION_THRESHOLD = 0.4;

// "Top churners" aggregate SHAP view: how many highest-probability customers to pool.
export const TOP_CHURNERS_N = 20;

// Milliseconds the intentional "generating..." animation runs before revealing advice.
export const GENERATE_DELAY_MS = 2000;

// Risk scale (green low -> amber mid -> red high), per the design spec.
export const RISK = {
  low: { color: "#22C55E", label: "Low" },
  mid: { color: "#F59E0B", label: "Medium" },
  high: { color: "#EF4444", label: "High" },
};

// Probability cutoffs for the three risk bands.
export const RISK_BANDS = { midFrom: 0.4, highFrom: 0.7 };

export function riskBand(p) {
  if (p >= RISK_BANDS.highFrom) return "high";
  if (p >= RISK_BANDS.midFrom) return "mid";
  return "low";
}

// Signed-driver bar colors: pushes toward churn vs. away from churn.
export const DRIVER_COLORS = {
  positive: "#EF4444", // raises churn risk
  negative: "#3B82F6", // lowers churn risk
};

// Archetype narratives. Sourced from Telco_Churn_Archetype_F1.ipynb (Phase 1
// archetype profiling, cell 17) and validated against per-archetype aggregate
// stats computed from telco_test_predictions.xlsx joined to telco_churn_model.csv.
// Every archetype 0-3 has a description; the stats shown are the test-set values.
export const ARCHETYPES = {
  "Archetype 0": {
    title: "Phone-only loyalists",
    churnRate: 0.071,
    avgProb: 0.142,
    count: 312,
    summary:
      "Long-tenured, phone-only customers with almost no internet service. The lowest-risk segment in the book.",
    traits: [
      "~99% have no internet service (voice only)",
      "Low monthly charge (~$21)",
      "Two-Year contracts are the most common term",
      "Longest-standing, sticky relationships",
    ],
  },
  "Archetype 1": {
    title: "DSL mainstream",
    churnRate: 0.189,
    avgProb: 0.291,
    count: 534,
    summary:
      "Mid-value DSL households on mixed contract terms. A moderate, watch-list risk — the largest segment.",
    traits: [
      "Mostly DSL internet (~58%)",
      "Moderate monthly charge (~$62)",
      "Contracts split, but Month-to-Month leads",
      "Broad, mainstream customer base",
    ],
  },
  "Archetype 2": {
    title: "Premium fiber, flexible term",
    churnRate: 0.371,
    avgProb: 0.476,
    count: 313,
    summary:
      "Established, high-spend fiber customers who stayed on month-to-month plans. Valuable but a real flight risk.",
    traits: [
      "~98% on Fiber Optic internet",
      "Highest monthly charge (~$93)",
      "Month-to-Month is the dominant contract",
      "Long tenure but no contractual lock-in",
    ],
  },
  "Archetype 3": {
    title: "New, unattached fiber",
    churnRate: 0.54,
    avgProb: 0.68,
    count: 250,
    summary:
      "Newer, unmarried fiber customers with no referrals and no lock-in — the highest-risk segment by a wide margin.",
    traits: [
      "Month-to-Month contracts (~77%)",
      "Zero referrals and effectively no dependents",
      "100% unmarried, shorter tenure",
      "Fiber Optic on Bank-Withdrawal billing",
    ],
  },
};

export function archetypeInfo(name) {
  return (
    ARCHETYPES[name] || {
      title: name || "Unknown archetype",
      summary: "No description available for this segment.",
      traits: [],
    }
  );
}
