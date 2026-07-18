import { riskBand, RISK } from "../config/index.js";
import { pct } from "../lib/parse.js";

// Inline probability bar + numeric percent, colored by risk band.
export function RiskBar({ p }) {
  const band = riskBand(p);
  const color = RISK[band].color;
  const width = `${Math.max(2, Math.min(100, p * 100))}%`;
  return (
    <div className="risk-cell">
      <div className="risk-track">
        <div className="risk-fill" style={{ width, background: color }} />
      </div>
      <span className="risk-num num" style={{ color }}>
        {pct(p, 0)}
      </span>
    </div>
  );
}

// Pill badge naming the risk band.
export function RiskBadge({ p }) {
  const band = riskBand(p);
  const { color, label } = RISK[band];
  return (
    <span
      className="badge"
      style={{ color, borderColor: color, background: `${color}1a` }}
    >
      <span className="swatch" style={{ background: color }} />
      {label} risk
    </span>
  );
}
