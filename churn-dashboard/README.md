# Telco Churn Console

A dark, enterprise-style analytics dashboard for the churn predictions in
`telco_test_predictions.xlsx` (1,409 scored customers). Built with **Vite +
React + React Router**, charts via **Recharts**, markdown via **react-markdown**.

## Run

```bash
cd churn-dashboard
npm install
npm run dev      # opens http://localhost:5173
```

`npm run build` produces a static bundle in `dist/`; `npm run preview` serves it.

## How the data is loaded

The workbook is parsed **once at build time** with **SheetJS (`xlsx`)** by
`scripts/build-data.mjs`, which emits `src/data/predictions.json`. The app imports
that JSON directly — no spreadsheet parser is shipped to the browser.

The script runs automatically before `dev` and `build` via the `predev` /
`prebuild` npm hooks (run `npm run build:data` to regenerate manually). It looks
for `telco_test_predictions.xlsx` in the repository root (one level above this
folder). During normalization, empty / `None` / `NaN` suggestions are converted to
`null` so the UI can show the fallback state cleanly.

## Features

- **Customers** (`/`) — every one of the 1,409 rows, paginated (25/page). Sort by
  any column (default: churn probability, descending), filter by archetype and
  risk band, search by ID. Each row links to the detail page. Churn probability
  renders as a colored risk bar (green → amber → red).
- **Customer detail** (`/customer/:id`) — probability gauge, predicted vs. actual
  labels, an **archetype panel** with a plain-language description, and a signed
  **SHAP driver** bar chart (red pushes toward churn, blue away).
- **Generate Suggestions** — appears only when `churn_probability ≥ 0.60`
  (`SUGGESTION_THRESHOLD`). Click → a 2-second generating animation → reveals the
  row's `llm_suggestion` as markdown, or a clear "no pre-generated suggestion"
  fallback (true for all but ~5 rows). Advice is never fabricated.
- **Top churners** (`/top-churners`) — aggregates SHAP drivers across the top-N
  highest-probability churners (N selectable: 10/20/50/100) into a summary chart.

## Configuration

All tunable knobs live in [`src/config/index.js`](src/config/index.js):
`SUGGESTION_THRESHOLD`, `DECISION_THRESHOLD`, `TOP_CHURNERS_N`,
`GENERATE_DELAY_MS`, the risk color scale + band cutoffs, and the archetype
narratives.

## Where the archetype descriptions came from

The spreadsheet has no archetype text. The four narratives in
`src/config/index.js` are sourced from **Phase 1 of
`Telco_Churn_Archetype_F1.ipynb`** (the UMAP + HDBSCAN archetype profiling, cell
17) and cross-checked against per-archetype aggregate statistics computed by
joining `telco_test_predictions.xlsx` to `data/telco_churn_model.csv`:

| Archetype | Title | Test churn rate | Defining traits |
|---|---|---|---|
| 0 | Phone-only loyalists | 7.1% | ~99% no internet, low charge, Two-Year contracts |
| 1 | DSL mainstream | 18.9% | Mostly DSL, mid charge (~$62), mixed contracts |
| 2 | Premium fiber, flexible term | 37.1% | ~98% fiber, highest charge (~$93), month-to-month |
| 3 | New, unattached fiber | 54.0% | Month-to-month, 0 referrals, all unmarried, short tenure |

## Robustness

Bad rows never crash the app: `parseDrivers` skips unparseable driver tokens,
missing customers render a "not found" state, and `None`/empty suggestions fall
through to the placeholder.
