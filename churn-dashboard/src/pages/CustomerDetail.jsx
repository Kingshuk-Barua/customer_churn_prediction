import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { getCustomer } from "../lib/data.js";
import { parseDrivers, relabelDrivers, churnLabel, pct } from "../lib/parse.js";
import {
  archetypeInfo,
  SUGGESTION_THRESHOLD,
  DECISION_THRESHOLD,
  GENERATE_DELAY_MS,
} from "../config/index.js";
import Gauge from "../components/Gauge.jsx";
import DriverChart from "../components/DriverChart.jsx";
import { RiskBadge } from "../components/RiskBadge.jsx";

export default function CustomerDetail() {
  const { id } = useParams();
  const c = getCustomer(decodeURIComponent(id));

  if (!c) {
    return (
      <div>
        <Link to="/" className="back-link">
          ← Back to customers
        </Link>
        <div className="empty">Customer “{id}” not found.</div>
      </div>
    );
  }

  const drivers = relabelDrivers(parseDrivers(c.top_churn_drivers));
  const arch = archetypeInfo(c.archetype);
  const eligible = c.churn_probability >= SUGGESTION_THRESHOLD;

  return (
    <div>
      <Link to="/" className="back-link">
        ← Back to customers
      </Link>
      <h1 className="page-title num">{c.customer_id}</h1>
      <p className="page-sub">
        {c.archetype} · {arch.title} &nbsp;·&nbsp; <RiskBadge p={c.churn_probability} />
      </p>

      <div className="detail-grid">
        {/* left column: gauge + facts + archetype */}
        <div className="grid" style={{ gap: 16 }}>
          <div className="card">
            <Gauge p={c.churn_probability} />
            <div style={{ marginTop: 8 }}>
              <div className="stat-row">
                <span className="k">Predicted (@ {DECISION_THRESHOLD})</span>
                <span>{churnLabel(c.predicted_churn_label)}</span>
              </div>
              <div className="stat-row">
                <span className="k">Actual outcome</span>
                <span>{churnLabel(c.actual_churn_value)}</span>
              </div>
              <div className="stat-row">
                <span className="k">Archetype</span>
                <span>{c.archetype}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Archetype · {arch.title}</div>
            <p style={{ margin: "0 0 4px", color: "var(--text)" }}>{arch.summary}</p>
            <div className="stat-row" style={{ borderTop: "1px solid var(--border)", marginTop: 8 }}>
              <span className="k">Segment churn rate</span>
              <span className="num">{pct(arch.churnRate, 0)}</span>
            </div>
            <div className="stat-row">
              <span className="k">Segment size (test)</span>
              <span className="num">{arch.count?.toLocaleString?.() ?? "—"}</span>
            </div>
            <ul className="traits">
              {arch.traits.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* right column: SHAP + suggestions */}
        <div className="grid" style={{ gap: 16 }}>
          <div className="card">
            <div className="card-title">Churn drivers (SHAP contributions)</div>
            <DriverChart drivers={drivers} />
          </div>

          <div className="card">
            <div className="card-title">Retention advice</div>
            <SuggestionPanel customer={c} eligible={eligible} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SuggestionPanel({ customer, eligible }) {
  const [state, setState] = useState("idle"); // idle | generating | done
  const timer = useRef(null);

  // reset when navigating between customers
  useEffect(() => {
    setState("idle");
    return () => clearTimeout(timer.current);
  }, [customer.customer_id]);

  if (!eligible) {
    return (
      <p style={{ color: "var(--muted)", margin: 0 }}>
        This customer’s churn probability ({pct(customer.churn_probability, 1)}) is
        below the {pct(SUGGESTION_THRESHOLD, 0)} action threshold. Retention
        suggestions are generated only for high-risk customers.
      </p>
    );
  }

  function generate() {
    setState("generating");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("done"), GENERATE_DELAY_MS);
  }

  if (state === "idle") {
    return (
      <div>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          High churn risk ({pct(customer.churn_probability, 1)}). Generate the
          model-derived retention playbook for this customer.
        </p>
        <button className="btn primary" onClick={generate}>
          Generate Suggestions
        </button>
      </div>
    );
  }

  if (state === "generating") {
    return (
      <div className="suggestion-box">
        <div className="generating">
          <span className="spinner" />
          Generating retention suggestions…
        </div>
        <div className="shimmer-lines">
          <div style={{ width: "90%" }} />
          <div style={{ width: "75%" }} />
          <div style={{ width: "82%" }} />
        </div>
      </div>
    );
  }

  // done
  return (
    <div className="suggestion-box">
      {customer.llm_suggestion ? (
        <div className="markdown">
          <ReactMarkdown>{customer.llm_suggestion}</ReactMarkdown>
        </div>
      ) : (
        <div className="placeholder">
          No pre-generated suggestion available for this customer.
        </div>
      )}
    </div>
  );
}
