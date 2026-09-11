export type MethodId = string;

export type Catalog = {
  methods: { id: string; label: string; secondary?: string | null; family: string }[];
  metricGroups: string[];
  metrics: {
    id: string;
    label: string;
    group: string;
    description: string;
    direction: string;
    csvSource: string;
  }[];
  heats: { id: string; label: string }[];
  attribution: { id: string; label: string }[];
};

export type PaperCopy = {
  title: string;
  authors: { name: string; email: string }[];
  affiliation: string;
  keywords: string[];
  abstract: string;
  highlights: { id: string; label: string; value: string; detail: string }[];
  contributions: string[];
};

export type MetricBundle = {
  dataset: string;
  methods: string[];
  metrics: Record<
    string,
    {
      id: string;
      label: string;
      group: string;
      direction: string;
      byMethod: Record<string, { mean: number; err: number; n: number }>;
    }
  >;
};

export type ScatterRow = {
  sample_idx: number;
  y_true?: number;
  y_intended_target?: number | null;
  method: string;
  l2_distance?: number | null;
  sparsity_count?: number | null;
  sparsity_frac?: number | null;
  success_plot?: boolean | number | null;
  pred_class_cf?: number | null;
  p_pred_cf?: number | null;
};

export type FactualIndexItem = {
  sample_idx: number;
  y_true: number;
  y_true_name: string;
  y_intended_target: number | null;
  n_filtered: number;
  top_class: number | null;
  thumb: string;
  fixture?: boolean;
};

export type PopulationMember = {
  id: number;
  file: string | null;
  pred_class: number;
  pred_prob: number;
  o1?: number | null;
  o2?: number | null;
  o3?: number | null;
  phenotype?: string;
};

export type MethodMeta = {
  file?: string;
  pred_class?: number | null;
  pred_prob?: number | null;
  probs?: number[];
  o1?: number | null;
  o2?: number | null;
  o3?: number | null;
};

export type SampleMeta = {
  sample_idx: number;
  y_true: number;
  y_true_name: string;
  y_intended_target: number | null;
  n_population: number;
  n_filtered: number;
  top_class: number | null;
  distribution: Record<string, number>;
  o1_hist: { edges: number[]; counts: number[] };
  input_probs?: number[] | null;
  methods: Record<string, MethodMeta>;
  population: PopulationMember[];
  heats: string[];
  attr: string[];
  fixture?: boolean;
};

export type BlankIndexItem = {
  wanted_class: number;
  wanted_name: string;
  n_total: number;
  success_rate: number;
  mean_p_blank: number;
  mode_pred: number | null;
  has_csv: boolean;
};

export type BlankBin = {
  lo: number;
  hi: number;
  label: string;
  file?: string | null;
  pred_prob?: number;
  phenotype?: string;
  ssim?: { file: string; score: number } | null;
};

export type BlankMeta = BlankIndexItem & {
  bins?: BlankBin[];
  heats?: string[];
  distribution?: Record<string, number>;
  blank_probs?: number[] | null;
};

export type EvolutionObjective = { id: string; label: string; short: string };

export type EvolutionCurves = {
  dataset: string;
  sample_idx: number;
  y_true: number;
  n_runs: number;
  n_generations: number;
  objectives: EvolutionObjective[];
  gen: number[];
  mean: Record<"o1" | "o2" | "o3", number[]>;
  std: Record<"o1" | "o2" | "o3", number[]>;
  sem?: Record<"o1" | "o2" | "o3", number[]>;
  runs: Record<"o1" | "o2" | "o3", number[][]>;
  fixture?: boolean;
};

export type EvolutionPareto = {
  dataset: string;
  sample_idx: number;
  y_true: number;
  n_runs: number;
  n_raw: number;
  n_clean: number;
  n_unique: number;
  n_fronts: number;
  objectives: EvolutionObjective[];
  points: number[][];
  rank: number[];
  fixture?: boolean;
};

export type EvolutionIndex = {
  datasets: Record<
    string,
    {
      curves: boolean;
      pareto: boolean;
      sample_idx: number;
      y_true: number;
      n_runs: number;
      n_generations?: number;
      fixture?: boolean;
    }
  >;
};
