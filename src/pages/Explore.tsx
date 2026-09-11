import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Chip } from "../components/Chip";
import { Layout } from "../components/Layout";
import { LoadGate, useJson } from "../components/LoadGate";
import { DATASETS, loadClassNames, loadFactualIndex, sampleAsset } from "../lib/data";
import type { FactualIndexItem } from "../lib/types";

export function ExplorePage() {
  const { dataset = "mnist" } = useParams();
  const nav = useNavigate();
  const idx = useJson(`factual-${dataset}`, () => loadFactualIndex(dataset));
  const names = useJson("class-names", loadClassNames);
  const [cls, setCls] = useState<number | "all">("all");

  const samples = idx.data?.samples ?? [];
  const classList = names.data?.[dataset] ?? [];
  const filtered = useMemo(
    () => (cls === "all" ? samples : samples.filter((s) => s.y_true === cls)),
    [samples, cls],
  );
  const pixel = dataset !== "imagenet100";
  const cols = dataset === "imagenet100" ? "grid-cols-2 sm:grid-cols-4 md:grid-cols-5" : "grid-cols-5 sm:grid-cols-8 md:grid-cols-10";

  return (
    <Layout>
      <h1 className="font-display text-4xl">Explore populations</h1>
      <p className="mt-2 text-sm text-muted">
        All eval images. Filter by class, then open a sample workspace.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {DATASETS.map((d) => (
          <Chip key={d.id} active={dataset === d.id} onClick={() => nav(`/explore/${d.id}`)}>
            {d.label}
          </Chip>
        ))}
      </div>
      <LoadGate error={idx.error} data={idx.data} hint="Run the GPU harvest (or --write-fixture) so factual/index.json exists.">
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip active={cls === "all"} onClick={() => setCls("all")}>
            All
          </Chip>
          {classList.slice(0, dataset === "imagenet100" ? 20 : 10).map((n, i) => (
            <Chip key={i} active={cls === i} onClick={() => setCls(i)}>
              {n}
            </Chip>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">{filtered.length} images</p>
        <div className={`mt-4 grid gap-3 ${cols}`}>
          {filtered.map((s) => (
            <Thumb key={s.sample_idx} dataset={dataset} sample={s} pixelated={pixel} />
          ))}
        </div>
      </LoadGate>
    </Layout>
  );
}

function Thumb({
  dataset,
  sample,
  pixelated,
}: {
  dataset: string;
  sample: FactualIndexItem;
  pixelated: boolean;
}) {
  return (
    <Link to={`/explore/${dataset}/${sample.sample_idx}`} className="group block">
      <div className="figure-well overflow-hidden transition group-hover:shadow-[0_0_0_1px_#005335]">
        <img
          src={sampleAsset(dataset, sample.sample_idx, "thumb.webp")}
          alt={sample.y_true_name}
          className={`aspect-square w-full object-cover ${pixelated ? "pixelated" : ""}`}
        />
      </div>
      <p className="mt-1 truncate text-center text-[11px] text-muted">
        {sample.y_true_name} · {sample.sample_idx}
      </p>
    </Link>
  );
}
