// Build-time loader: reads telco_test_predictions.xlsx with SheetJS (xlsx) ONCE
// and emits src/data/predictions.json, which the app imports directly.
// Rationale (documented in README): parsing the workbook in the browser would ship
// the whole xlsx + SheetJS to every client; converting once at build keeps the
// bundle small and the runtime free of a spreadsheet parser. Re-run happens
// automatically via the `predev` / `prebuild` npm hooks.
import * as XLSX from "xlsx";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// The workbook lives one level up from the dashboard project (in the repo root).
const CANDIDATES = [
  resolve(__dirname, "../../telco_test_predictions.xlsx"),
  resolve(__dirname, "../telco_test_predictions.xlsx"),
];
const src = CANDIDATES.find((p) => existsSync(p));
if (!src) {
  console.error(
    "[build:data] Could not find telco_test_predictions.xlsx in:\n  " +
      CANDIDATES.join("\n  ")
  );
  process.exit(1);
}

const wb = XLSX.read(readFileSync(src), { type: "buffer" });
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { defval: null });

// Normalise once so the app never has to defend against spreadsheet quirks.
const clean = rows.map((r, i) => {
  const sug = r.llm_suggestion;
  const suggestion =
    sug == null || String(sug).trim() === "" || String(sug).trim() === "None"
      ? null
      : String(sug);
  return {
    row_index: r.row_index ?? i,
    customer_id: String(r["Customer ID"] ?? "").trim(),
    archetype: String(r.archetype ?? "").trim(),
    churn_probability: Number(r.churn_probability),
    predicted_churn_label: Number(r.predicted_churn_label),
    actual_churn_value: Number(r.actual_churn_value),
    top_churn_drivers:
      r.top_churn_drivers == null ? "" : String(r.top_churn_drivers),
    llm_suggestion: suggestion,
  };
});

const outDir = resolve(__dirname, "../src/data");
const out = resolve(outDir, "predictions.json");
writeFileSync(out, JSON.stringify(clean, null, 0));
console.log(
  `[build:data] wrote ${clean.length} rows -> ${out} ` +
    `(${clean.filter((r) => r.llm_suggestion).length} with LLM suggestions)`
);
