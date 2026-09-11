export const METHOD_COLOR: Record<string, string> = {
  counterfactual_pt: "#8A8476",
  cfproto: "#C4A574",
  cfrl: "#6B7C93",
  leapfactual: "#A67C52",
  leapfactual_r: "#C47A4A",
  graco_base_o2: "#0E6B5C",
  graco_base_o3: "#005335",
  graco50: "#00B140",
};

export function methodColor(id: string): string {
  return METHOD_COLOR[id] ?? "#5C5A56";
}
