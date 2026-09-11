import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Chip } from "../components/Chip";
import { CompareSlider } from "../components/CompareSlider";
import { FigureWell } from "../components/FigureWell";
import { HeatOverlay } from "../components/HeatOverlay";
import { Layout } from "../components/Layout";
import { LoadGate, useJson } from "../components/LoadGate";
import { loadCatalog, loadClassNames, loadSampleMeta, sampleAsset } from "../lib/data";
import { methodColor } from "../lib/methods";

export function SamplePage() {
  const { dataset = "mnist", sampleIdx = "0" } = useParams();
  const idx = Number(sampleIdx);
  const meta = useJson(`sample-${dataset}-${idx}`, () => loadSampleMeta(dataset, idx));
  const cat = useJson("catalog", loadCatalog);
  const names = useJson("class-names", loadClassNames);
  const [method, setMethod] = useState<string>("graco_base_o2");
  const [heat, setHeat] = useState("sum_intensity");
  const [attr, setAttr] = useState("integrated_gradients");
  const [intensity, setIntensity] = useState(0.65);
  const [popId, setPopId] = useState(0);

  const m = meta.data;
  const pixel = dataset !== "imagenet100";
  const classNames = names.data?.[dataset] ?? [];
  const inputSrc = sampleAsset(dataset, idx, "input.webp");
  const methodFile = m?.methods[method]?.file;
  const cfSrc = methodFile ? sampleAsset(dataset, idx, methodFile) : inputSrc;
  const heatSrc = m?.heats.includes(heat) ? sampleAsset(dataset, idx, `heats/${heat}.png`) : null;
  const attrSrc = m?.attr.includes(attr) ? sampleAsset(dataset, idx, `attr/${attr}.png`) : null;
  const hist = Object.entries(m?.distribution ?? {}).map(([k, v]) => ({
    name: classNames[Number(k)] ?? k,
    n: v,
  }));
  const pop = m?.population[popId];

  return (
    <Layout>
      <p className="text-sm text-muted">
        <Link to={`/explore/${dataset}`} className="text-teal">
          ← {dataset}
        </Link>
      </p>
      <LoadGate error={meta.error} data={m}>
        {m ? (
          <div className="mt-4 space-y-10">
            <header className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl">Sample {m.sample_idx}</h1>
                <p className="mt-1 text-sm text-muted">
                  True class <strong className="text-ink">{m.y_true_name}</strong>
                  {m.y_intended_target != null ? (
                    <>
                      {" "}
                      → intended {classNames[m.y_intended_target] ?? m.y_intended_target}
                    </>
                  ) : null}
                  {" · "}
                  {m.n_filtered}/{m.n_population} high-confidence flips
                </p>
              </div>
            </header>

            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr_1fr]">
              <div className="space-y-3">
                <FigureWell src={inputSrc} alt="Factual" caption="Factual image" pixelated={pixel} />
                <CompareSlider
                  leftSrc={inputSrc}
                  rightSrc={cfSrc}
                  leftLabel="Factual"
                  rightLabel={cat.data?.methods.find((x) => x.id === method)?.label ?? method}
                  pixelated={pixel}
                />
              </div>

              <div>
                <h2 className="text-sm font-medium">Method filmstrip</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(cat.data?.methods ?? []).map((mm) =>
                    m.methods[mm.id] ? (
                      <Chip
                        key={mm.id}
                        color={methodColor(mm.id)}
                        active={method === mm.id}
                        onClick={() => setMethod(mm.id)}
                      >
                        {mm.label}
                      </Chip>
                    ) : null,
                  )}
                </div>
                <div className="mt-4">
                  <FigureWell
                    src={cfSrc}
                    alt={method}
                    caption={cat.data?.methods.find((x) => x.id === method)?.label}
                    pixelated={pixel}
                  />
                </div>
                <div className="mt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-medium">Change map</h2>
                    <label className="flex items-center gap-2 text-xs text-muted">
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
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(cat.data?.heats ?? []).map((h) => (
                      <Chip key={h.id} active={heat === h.id} onClick={() => setHeat(h.id)}>
                        {h.label}
                      </Chip>
                    ))}
                  </div>
                  <div className="mt-3">
                    <HeatOverlay baseSrc={inputSrc} heatSrc={heatSrc} intensity={intensity} pixelated={pixel} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-medium">Population landing classes</h2>
                <div className="h-40">
                  <ResponsiveContainer>
                    <BarChart data={hist}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="n" fill="#0E6B5C" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <h2 className="text-sm font-medium">Gallery</h2>
                <div className="grid grid-cols-4 gap-2">
                  {m.population.map((p) =>
                    p.file ? (
                      <button key={p.id} type="button" onClick={() => setPopId(p.id)} className="figure-well">
                        <img
                          src={sampleAsset(dataset, idx, p.file)}
                          alt=""
                          className={`aspect-square w-full object-cover ${pixel ? "pixelated" : ""} ${
                            popId === p.id ? "ring-2 ring-ul" : ""
                          }`}
                        />
                      </button>
                    ) : null,
                  )}
                </div>
                {pop ? (
                  <div className="figure-well p-3">
                    <p className="text-xs text-muted">
                      pred {classNames[pop.pred_class] ?? pop.pred_class} · p={pop.pred_prob.toFixed(2)}
                    </p>
                    <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap font-mono text-[10px] text-ink/80">
                      {pop.phenotype || "(no phenotype)"}
                    </pre>
                  </div>
                ) : null}
              </div>
            </div>

            <section>
              <h2 className="text-sm font-medium">Attribution vs phenotype map</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {(cat.data?.attribution ?? []).map((a) => (
                  <Chip key={a.id} active={attr === a.id} onClick={() => setAttr(a.id)}>
                    {a.label}
                  </Chip>
                ))}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <HeatOverlay baseSrc={inputSrc} heatSrc={attrSrc} intensity={intensity} pixelated={pixel} />
                <HeatOverlay baseSrc={inputSrc} heatSrc={heatSrc} intensity={intensity} pixelated={pixel} />
              </div>
              <p className="mt-2 text-center text-xs text-muted">Left: XAI baseline · Right: CounterStroke change map</p>
            </section>
          </div>
        ) : null}
      </LoadGate>
    </Layout>
  );
}
