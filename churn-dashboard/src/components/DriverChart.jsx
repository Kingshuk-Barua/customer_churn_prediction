import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DRIVER_COLORS } from "../config/index.js";

// Horizontal signed SHAP-contribution bar chart.
// Positive = pushes toward churn (red); negative = pushes away (blue).
export default function DriverChart({ drivers, height }) {
  if (!drivers || drivers.length === 0) {
    return <div className="placeholder">No driver data could be parsed.</div>;
  }
  // Recharts renders the first data item at the top for a horizontal layout,
  // so order by absolute magnitude descending for a clean tornado shape.
  const data = [...drivers].sort(
    (a, b) => Math.abs(b.value) - Math.abs(a.value)
  );
  const max = Math.max(...data.map((d) => Math.abs(d.value))) * 1.15 || 1;
  const h = height || Math.max(160, data.length * 34 + 24);

  return (
    <div>
      <div className="chart-frame">
        <ResponsiveContainer width="100%" height={h}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 4, right: 40, bottom: 4, left: 8 }}
            barCategoryGap={6}
          >
            <XAxis
              type="number"
              domain={[-max, max]}
              tickFormatter={(v) => (v > 0 ? "+" : "") + v.toFixed(2)}
              tick={{ fill: "#8b98a5", fontSize: 11 }}
              axisLine={{ stroke: "#2a3746" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="feature"
              width={190}
              tick={{ fill: "#e6edf3", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine x={0} stroke="#2a3746" />
            <Tooltip
              cursor={{ fill: "#ffffff08" }}
              contentStyle={{
                background: "#1b2531",
                border: "1px solid #2a3746",
                borderRadius: 8,
                color: "#e6edf3",
                fontSize: 12,
              }}
              formatter={(v) => [
                `${v > 0 ? "+" : ""}${v.toFixed(3)}`,
                "SHAP contribution",
              ]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={
                    d.value >= 0
                      ? DRIVER_COLORS.positive
                      : DRIVER_COLORS.negative
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="legend">
        <span>
          <span
            className="swatch"
            style={{ background: DRIVER_COLORS.positive }}
          />
          Pushes toward churn
        </span>
        <span>
          <span
            className="swatch"
            style={{ background: DRIVER_COLORS.negative }}
          />
          Pushes away from churn
        </span>
        <span style={{ marginLeft: "auto" }}>
          SHAP-style contribution (churn log-odds)
        </span>
      </div>
    </div>
  );
}
