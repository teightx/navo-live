export interface PopularRoute {
  origin: string;
  destination: string;
  label: string;
}

export const popularRoutes: PopularRoute[] = [
  { origin: "GRU", destination: "LIS", label: "são paulo → lisboa" },
  { origin: "GRU", destination: "MAD", label: "são paulo → madrid" },
  { origin: "GIG", destination: "FOR", label: "rio → fortaleza" },
  { origin: "REC", destination: "OPO", label: "recife → porto" },
  { origin: "BSB", destination: "MIA", label: "brasília → miami" },
  { origin: "CNF", destination: "LIS", label: "belo horizonte → lisboa" },
  { origin: "POA", destination: "CDG", label: "porto alegre → paris" },
  { origin: "SSA", destination: "LIS", label: "salvador → lisboa" },
];

