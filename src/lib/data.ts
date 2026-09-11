import type {
  BlankIndexItem,
  BlankMeta,
  Catalog,
  EvolutionCurves,
  EvolutionIndex,
  EvolutionPareto,
  FactualIndexItem,
  MetricBundle,
  PaperCopy,
  SampleMeta,
  ScatterRow,
} from "./types";

export const DATA = `${import.meta.env.BASE_URL}data`;

const cache = new Map<string, Promise<unknown>>();

async function getJson<T>(path: string): Promise<T> {
  const url = path.startsWith("http") ? path : `${DATA}/${path.replace(/^\//, "")}`;
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url).then((r) => {
        if (!r.ok) throw new Error(`Missing ${url}`);
        return r.json();
      }),
    );
  }
  return cache.get(url) as Promise<T>;
}

export function asset(path: string): string {
  const p = path.replace(/^\//, "");
  if (p.startsWith("data/")) return `${import.meta.env.BASE_URL}${p}`;
  return `${DATA}/${p}`;
}

export const loadPaper = () => getJson<PaperCopy>("paper.json");
export const loadCatalog = () => getJson<Catalog>("catalog.json");
export const loadClassNames = () => getJson<Record<string, string[]>>("class_names.json");
export const loadMetrics = (ds: string) => getJson<MetricBundle>(`metrics/${ds}.json`);
export const loadScatter = (ds: string) =>
  getJson<{ dataset: string; rows: ScatterRow[] }>(`metrics/scatter/${ds}.json`);
export const loadFactualIndex = (ds: string) =>
  getJson<{ dataset: string; samples: FactualIndexItem[] }>(`factual/${ds}/index.json`);
export const loadSampleMeta = (ds: string, idx: number) =>
  getJson<SampleMeta>(`factual/${ds}/${idx}/meta.json`);
export const loadBlankIndex = (ds: string) =>
  getJson<{ dataset: string; targets: BlankIndexItem[] }>(`blank/${ds}/index.json`);
export const loadBlankMeta = (ds: string, k: number) =>
  getJson<BlankMeta>(`blank/${ds}/target_${String(k).padStart(3, "0")}/meta.json`);
export const loadEvolutionIndex = () => getJson<EvolutionIndex>("evolution/index.json");
export const loadEvolutionCurves = (ds: string) =>
  getJson<EvolutionCurves>(`evolution/${ds}/curves.json`);
export const loadEvolutionPareto = (ds: string) =>
  getJson<EvolutionPareto>(`evolution/${ds}/pareto.json`);

export function sampleAsset(ds: string, idx: number, rel: string): string {
  return `${DATA}/factual/${ds}/${idx}/${rel}`;
}

export function blankAsset(ds: string, k: number, rel: string): string {
  return `${DATA}/blank/${ds}/target_${String(k).padStart(3, "0")}/${rel}`;
}

export const DATASETS = [
  { id: "mnist", label: "MNIST", detail: "28×28 grayscale · CNN · 10 classes" },
  { id: "cifar10", label: "CIFAR-10", detail: "32×32 colour · ResNet-18 · 10 classes" },
  { id: "imagenet100", label: "ImageNet-100", detail: "299×299 · Inception-v3 · 100 classes" },
] as const;
