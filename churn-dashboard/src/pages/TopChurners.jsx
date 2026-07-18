import { useMemo, useState } from "react";
import { customers } from "../lib/data.js";
import { aggregateDrivers, relabelDrivers, pct } from "../lib/parse.js";
import { TOP_CHURNERS_N } from "../config/index.js";
import DriverChart from "../components/DriverChart.jsx";

const OPTIONS = [10, 20, 50, 100];

export default function TopChurners() {
  const [n, setN] = useState(TOP_CHURNERS_N);

  const top = useMemo(
    () =>
      [...customers]
        .sort((a, b) => b.churn_probability - a.churn_probability)
        .slice(0, n),
    [n]
  );

  const agg = useMemo(
    () => relabelDrivers(aggregateDrivers(top)).slice(0, 12),
    [top]
  );
  const avgProb = top.reduce((s, c) => s + c.churn_probability, 0) / (top.length || 1);
  const actualChurned = top.filter((c) => c.actual_churn_value === 1).length;

  return (
    <div>
      <h1 className="page-title">Top churners — aggregate drivers</h1>
      <p className="page-sub">
        Mean SHAP contribution across the highest-probability churners. Positive
        bars are the features pushing this cohort toward churn.
      </p>

      <div className="toolbar">
        <label className="control">
          Cohort size (top-N by probability)
          <select value={n} onChange={(e) => setN(Number(e.target.value))}>
            {OPTIONS.map((o) => (
              <option key={o} value={o}>
                Top {o}
              </option>
            ))}
          </select>
        </label>
        <div className="spacer" />
      </div>

      <div className="kpi-row">
        <div className="card kpi">
          <div className="v">{n}</div>
          <div className="l">Cohort size</div>
        </div>
        <div className="card kpi">
          <div className="v num">{pct(avgProb, 1)}</div>
          <div className="l">Avg churn probability</div>
        </div>
        <div className="card kpi">
          <div className="v num">
            {actualChurned}/{top.length}
          </div>
          <div className="l">Actually churned</div>
        </div>
        <div className="card kpi">
          <div className="v num">{agg.length}</div>
          <div className="l">Distinct drivers</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          Mean signed SHAP driver across top {n} churners
        </div>
        <DriverChart drivers={agg} height={Math.max(260, agg.length * 34 + 24)} />
      </div>
    </div>
  );
}
