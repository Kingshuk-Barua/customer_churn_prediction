// Loads the build-time JSON and exposes typed-ish accessors.
import raw from "../data/predictions.json";

export const customers = raw.map((r) => ({
  ...r,
  churn_probability: Number(r.churn_probability),
}));

const byId = new Map(customers.map((c) => [c.customer_id, c]));
export function getCustomer(id) {
  return byId.get(id) || null;
}

export const archetypeNames = [...new Set(customers.map((c) => c.archetype))]
  .filter(Boolean)
  .sort();
