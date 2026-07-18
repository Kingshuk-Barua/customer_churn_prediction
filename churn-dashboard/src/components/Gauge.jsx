import { riskBand, RISK } from "../config/index.js";

// Semicircular probability gauge for the detail page.
export default function Gauge({ p }) {
  const band = riskBand(p);
  const color = RISK[band].color;
  const r = 78;
  const cx = 100;
  const cy = 100;
  const circ = Math.PI * r; // half circle
  const dash = Math.max(0, Math.min(1, p)) * circ;

  return (
    <div className="gauge-wrap">
      <svg width="200" height="118" viewBox="0 0 200 118">
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#2a3746"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
        />
        <text
          x={cx}
          y={cy - 14}
          textAnchor="middle"
          fill={color}
          fontSize="30"
          fontFamily="var(--mono)"
          fontWeight="600"
        >
          {(p * 100).toFixed(1)}%
        </text>
        <text
          x={cx}
          y={cy + 6}
          textAnchor="middle"
          fill="#8b98a5"
          fontSize="11"
          style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
        >
          churn probability
        </text>
      </svg>
    </div>
  );
}
