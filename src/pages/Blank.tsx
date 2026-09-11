import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Chip } from "../components/Chip";
import { FigureWell } from "../components/FigureWell";
import { HeatOverlay } from "../components/HeatOverlay";
import { Layout } from "../components/Layout";
import { LoadGate, useJson } from "../components/LoadGate";
import { DATASETS, blankAsset, loadBlankIndex, loadBlankMeta, loadCatalog } from "../lib/data";

export function BlankPage() {
  const { dataset = "mnist", target } = useParams();
  const nav = useNavigate();
  const idx = useJson(`blank-${dataset}`, () => loadBlankIndex(dataset));
  const targets = idx.data?.targets ?? [];
  const selected = target != null ? Number(target) : targets[0]?.wanted_class;
  const meta = useJson(
    selected == null ? "blank-skip" : `blank-meta-${dataset}-${selected}`,
    () => loadBlankMeta(dataset, selected as number),
  );
  const cat = useJson("catalog", loadCatalog);
  const [heat, setHeat] = useState("sum_intensity");
  const [intensity, setIntensity] = useState(0.7);
  const pixel = dataset !== "imagenet100";
  const k = selected ?? 0;
  const blankSrc = blankAsset(dataset, k, "blank.webp");
  const bestSrc = blankAsset(dataset, k, "best.webp");
  const heatSrc = meta.data?.heats?.includes(heat) ? blankAsset(dataset, k, `heats/${heat}.png`) : null;

  return (
    <Layout>
      <h1 className="font-display text-4xl">Blank canvas</h1>
      <p className="mt-2 max-w-3xl text-sm text-muted">
        Evolution from an empty canvas toward each target class — classifier-sufficient evidence
        without a factual image.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {DATASETS.map((d) => (
          <Chip key={d.id} active={dataset === d.id} onClick={() => nav(`/blank/${d.id}`)}>
            {d.label}
          </Chip>
        ))}
      </div>
      <LoadGate error={idx.error} data={idx.data} hint="GPU harvest writes blank/{dataset}/index.json.">
        <div className="mt-6 grid grid-cols-5 gap-2 sm:grid-cols-10">
          {targets.map((t) => (
            <button
              key={t.wanted_class}
              type="button"
              onClick={() => nav(`/blank/${dataset}/${t.wanted_class}`)}
              className={`figure-well p-2 text-center text-xs ${
                selected === t.wanted_class ? "ring-2 ring-ul" : ""
              }`}
              title={`success ${(t.success_rate * 100).toFixed(0)}%`}
              style={{
                background: `rgba(14,107,92,${0.12 + t.success_rate * 0.5})`,
              }}
            >
              <div className="font-medium">{t.wanted_name}</div>
              <div className="text-[10px] text-muted">{(t.success_rate * 100).toFixed(0)}%</div>
            </button>
          ))}
        </div>

        {selected != null ? (
          <LoadGate error={meta.error} data={meta.data}>
            {meta.data ? (
              <div className="mt-10 grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                  <FigureWell src={blankSrc} alt="Blank" caption="Starting canvas" pixelated={pixel} />
                  <FigureWell src={bestSrc} alt="Best" caption="Best evolved evidence" pixelated={pixel} />
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {(cat.data?.heats ?? []).map((h) => (
                        <Chip key={h.id} active={heat === h.id} onClick={() => setHeat(h.id)}>
                          {h.label}
                        </Chip>
                      ))}
                    </div>
                    <label className="mt-2 flex items-center gap-2 text-xs text-muted">
                      Intensity
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={intensity}
                        onChange={(e) => setIntensity(Number(e.target.value))}
                      />
                    </label>
                    <div className="mt-3">
                      <HeatOverlay baseSrc={blankSrc} heatSrc={heatSrc} intensity={intensity} pixelated={pixel} />
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-medium">
                    Confidence ladder · {meta.data.wanted_name} · n={meta.data.n_total}
                  </h2>
                  <div className="mt-3 grid gap-4">
                    {(meta.data.bins ?? []).map((b) =>
                      b.file ? (
                        <div key={b.label} className="flex items-center gap-4">
                          <img
                            src={blankAsset(dataset, k, b.file)}
                            alt={b.label}
                            className={`h-20 w-20 rounded-lg object-contain shadow-well ${pixel ? "pixelated" : ""}`}
                          />
                          {b.ssim?.file ? (
                            <img
                              src={blankAsset(dataset, k, b.ssim.file)}
                              alt="SSIM ref"
                              className={`h-20 w-20 rounded-lg object-contain shadow-well ${pixel ? "pixelated" : ""}`}
                            />
                          ) : null}
                          <div className="text-sm">
                            <p className="font-medium">{b.label}</p>
                            {b.pred_prob != null ? <p className="text-muted">p={b.pred_prob.toFixed(2)}</p> : null}
                            {b.ssim ? <p className="text-muted">SSIM {b.ssim.score.toFixed(3)}</p> : null}
                          </div>
                        </div>
                      ) : (
                        <p key={b.label} className="text-xs text-muted">
                          {b.label}: no individual
                        </p>
                      ),
                    )}
                  </div>
                  <p className="mt-6 text-xs text-muted">
                    <Link to={`/explore/${dataset}`} className="text-teal">
                      Compare with factual explorer →
                    </Link>
                  </p>
                </div>
              </div>
            ) : null}
          </LoadGate>
        ) : null}
      </LoadGate>
    </Layout>
  );
}
