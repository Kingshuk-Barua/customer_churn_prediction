// Defensive parsing helpers. Every function must tolerate a malformed row and
// return something safe rather than throwing — the app must never crash on bad data.

// Parse a SHAP driver string like
//   "Contract (+1.54); Number of Referrals (+1.01); monthly_to_total_ratio (+0.86)"
// into [{ feature, value }, ...]. Unparseable tokens are skipped, not fatal.
export function parseDrivers(raw) {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(";")
    .map((tok) => tok.trim())
    .filter(Boolean)
    .map((tok) => {
      // feature name, then a signed number inside the trailing parentheses.
      const m = tok.match(/^(.*?)\s*\(\s*([+-]?\d*\.?\d+)\s*\)\s*$/);
      if (!m) return null;
      const value = Number(m[2]);
      if (!Number.isFinite(value)) return null;
      return { feature: m[1].trim(), value };
    })
    .filter(Boolean);
}

// Aggregate signed drivers across many customers into a mean-signed-contribution
// summary, sorted by absolute magnitude. Used by the Top-Churners view.
export function aggregateDrivers(rows) {
  const acc = new Map();
  for (const r of rows) {
    for (const d of parseDrivers(r.top_churn_drivers)) {
      const cur = acc.get(d.feature) || { sum: 0, n: 0 };
      cur.sum += d.value;
      cur.n += 1;
      acc.set(d.feature, cur);
    }
  }
  return [...acc.entries()]
    .map(([feature, { sum, n }]) => ({ feature, value: sum / n, n }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
}

// Display-only relabeling: the model's geographic features (Latitude, Longitude)
// are shown to users as a single "Location" driver. Because SHAP is additive, when
// a customer has both we merge them by summing their contributions into one bar.
const LOCATION_FEATURES = new Set(["Latitude", "Longitude"]);

export function relabelDrivers(drivers) {
  const out = [];
  let locIdx = -1;
  for (const d of drivers) {
    const feature = LOCATION_FEATURES.has(d.feature) ? "Location" : d.feature;
    if (feature === "Location" && locIdx >= 0) {
      out[locIdx] = {
        ...out[locIdx],
        value: out[locIdx].value + d.value,
        n: (out[locIdx].n || 0) + (d.n || 0),
      };
    } else {
      if (feature === "Location") locIdx = out.length;
      out.push({ ...d, feature });
    }
  }
  return out;
}

export function pct(x, digits = 1) {
  if (!Number.isFinite(x)) return "—";
  return `${(x * 100).toFixed(digits)}%`;
}

export function churnLabel(v) {
  if (v === 1) return "Churned";
  if (v === 0) return "Stayed";
  return "—";
}
