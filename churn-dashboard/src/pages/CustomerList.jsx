import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { customers, archetypeNames } from "../lib/data.js";
import { churnLabel } from "../lib/parse.js";
import { riskBand, RISK } from "../config/index.js";
import { RiskBar } from "../components/RiskBadge.jsx";

const PAGE_SIZE = 25;

export default function CustomerList() {
  const navigate = useNavigate();
  const [archetype, setArchetype] = useState("all");
  const [band, setBand] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "churn_probability", dir: "desc" });
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let rows = customers;
    if (archetype !== "all") rows = rows.filter((c) => c.archetype === archetype);
    if (band !== "all") rows = rows.filter((c) => riskBand(c.churn_probability) === band);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((c) => c.customer_id.toLowerCase().includes(q));
    }
    const { key, dir } = sort;
    const mul = dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === "string") return av.localeCompare(bv) * mul;
      return (av - bv) * mul;
    });
  }, [archetype, band, query, sort]);

  // clamp page when filters shrink the result set
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const slice = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  function toggleSort(key) {
    setPage(0);
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "customer_id" || key === "archetype" ? "asc" : "desc" }
    );
  }
  function arrow(key) {
    if (sort.key !== key) return null;
    return <span className="arrow">{sort.dir === "asc" ? "▲" : "▼"}</span>;
  }
  function resetPage(setter) {
    return (v) => {
      setter(v);
      setPage(0);
    };
  }

  return (
    <div>
      <h1 className="page-title">Customers</h1>
      <p className="page-sub">
        {customers.length.toLocaleString()} scored customers · click any row for the
        full record, SHAP drivers and retention advice.
      </p>

      <div className="toolbar">
        <label className="control">
          Archetype
          <select
            value={archetype}
            onChange={(e) => resetPage(setArchetype)(e.target.value)}
          >
            <option value="all">All archetypes</option>
            {archetypeNames.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="control">
          Risk band
          <select value={band} onChange={(e) => resetPage(setBand)(e.target.value)}>
            <option value="all">All risk bands</option>
            <option value="high">High</option>
            <option value="mid">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label className="control">
          Search ID
          <input
            type="search"
            placeholder="e.g. 0679-IDSTG"
            value={query}
            onChange={(e) => resetPage(setQuery)(e.target.value)}
          />
        </label>
        <div className="spacer" />
        <span className="count-chip">
          {filtered.length.toLocaleString()} match
          {filtered.length === 1 ? "" : "es"}
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="sortable" onClick={() => toggleSort("customer_id")}>
                Customer ID {arrow("customer_id")}
              </th>
              <th className="sortable" onClick={() => toggleSort("archetype")}>
                Archetype {arrow("archetype")}
              </th>
              <th
                className="sortable"
                onClick={() => toggleSort("churn_probability")}
                style={{ minWidth: 180 }}
              >
                Churn probability {arrow("churn_probability")}
              </th>
              <th
                className="sortable"
                onClick={() => toggleSort("predicted_churn_label")}
              >
                Predicted {arrow("predicted_churn_label")}
              </th>
              <th
                className="sortable"
                onClick={() => toggleSort("actual_churn_value")}
              >
                Actual {arrow("actual_churn_value")}
              </th>
            </tr>
          </thead>
          <tbody>
            {slice.map((c) => (
              <tr
                key={c.customer_id}
                onClick={() => navigate(`/customer/${encodeURIComponent(c.customer_id)}`)}
              >
                <td className="num">{c.customer_id}</td>
                <td>
                  <span className="tag">{c.archetype}</span>
                </td>
                <td>
                  <RiskBar p={c.churn_probability} />
                </td>
                <td style={{ color: c.predicted_churn_label === 1 ? RISK.high.color : "var(--muted)" }}>
                  {churnLabel(c.predicted_churn_label)}
                </td>
                <td style={{ color: c.actual_churn_value === 1 ? RISK.high.color : "var(--muted)" }}>
                  {churnLabel(c.actual_churn_value)}
                </td>
              </tr>
            ))}
            {slice.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  No customers match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <span className="count-chip">
          Page {safePage + 1} of {pageCount}
        </span>
        <div className="pages">
          <button
            className="btn"
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
          >
            ← Prev
          </button>
          <button
            className="btn"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage(safePage + 1)}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
