import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Chip } from "../components/Chip";
import { Layout } from "../components/Layout";
import { LoadGate, useJson } from "../components/LoadGate";
import { Pareto3D } from "../components/Pareto3D";
import { DATASETS, loadEvolutionCurves, loadEvolutionIndex, loadEvolutionPareto } from "../lib/data";
import type { EvolutionCurves, EvolutionIndex, EvolutionPareto } from "../lib/types";

const OBJ = [
  { id: "o1" as const, label: "O1 validity", color: "#005335" },
  { id: "o2" as const, label: "O2 sparsity", color: "#0E6B5C" },
  { id: "o3" as const, label: "O3 proximity", color: "#C47A4A" },
];

export function EvolutionPage() {
  const nav = useNavigate();
  const idx = useJson("evo-index", loadEvolutionIndex);
  const available = Object.keys(idx.data?.datasets ?? {});
  const [ds, setDs] = useState("mnist");
  const active = available.includes(ds) ? ds : available[0] ?? "mnist";
  const curves = useJson(`evo-curves-${active}`, () => loadEvolutionCurves(active));
  const pareto = useJson(`evo-pareto-${active}`, () => loadEvolutionPareto(active));

  return (
    <Layout>
      <h1 className="font-display text-4xl">Search dynamics</h1>
      <p className="mt-2 max-w-3xl text-sm text-muted">
        Thirty independent evolutionary runs on one eval image per dataset. Curves show the mean best
        O1 / O2 / O3 across generations (±1 std). The cloud is the pooled final-generation population,
        ranked into successive Pareto fronts (all three objectives minimized).
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {DATASETS.map((d) => (
          <Chip key={d.id} active={active === d.id} onClick={() => setDs(d.id)}>
            {d.label}
          </Chip>
        ))}
      </div>
      <LoadGate
        error={idx.error}
        data={idx.data}
        hint="Run harvest with --evolution-only so public/data/evolution/index.json exists."
      >
        {idx.data ? (
          <div className="mt-8 space-y-12">
            <LoadGate error={curves.error} data={curves.data}>
              {curves.data ? <CurvesBlock data={curves.data} index={idx.data} /> : null}
            </LoadGate>
            <LoadGate error={pareto.error} data={pareto.data}>
              {pareto.data ? <ParetoBlock data={pareto.data} /> : null}
            </LoadGate>
            <p className="text-xs text-muted">
              <button type="button" className="text-teal" onClick={() => nav(`/explore/${active}`)}>
                Open this dataset in Explore →
              </button>
            </p>
          </div>
        ) : null}
      </LoadGate>
    </Layout>
  );
}

function CurvesBlock({ data, index }: { data: EvolutionCurves; index: EvolutionIndex }) {
  const meta = index.datasets[data.dataset];
  const [showRuns, setShowRuns] = useState(false);
  return (
    <section>
      <h2 className="text-lg font-medium">Objectives over generations</h2>
      <p className="mt-1 text-sm text-muted">
        Sample {data.sample_idx} · true class {data.y_true} · {data.n_runs} runs · {data.n_generations}{" "}
        generations
        {meta?.fixture ? " · fixture preview" : ""}
      </p>
      <label className="mt-3 flex items-center gap-2 text-xs text-muted">
        <input type="checkbox" checked={showRuns} onChange={(e) => setShowRuns(e.target.checked)} />
        Show individual runs
      </label>
      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        {OBJ.map((o) => (
          <ObjectiveChart key={o.id} data={data} obj={o} showRuns={showRuns} />
        ))}
      </div>
    </section>
  );
}

function ObjectiveChart({
  data,
  obj,
  showRuns,
}: {
  data: EvolutionCurves;
  obj: (typeof OBJ)[number];
  showRuns: boolean;
}) {
  const rows = data.gen.map((g, i) => {
    const mean = data.mean[obj.id][i];
    const std = data.std[obj.id][i];
    const lo = mean - std;
    return { g, mean, lo, band: 2 * std };
  });
  return (
    <article className="figure-well p-3">
      <h3 className="text-sm font-medium" style={{ color: obj.color }}>
        {obj.label}
      </h3>
      <div className="mt-2 h-52">
        <ResponsiveContainer>
          <ComposedChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#e8e6df" />
            <XAxis dataKey="g" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={obj.id === "o1" ? [-1.05, 0.05] : ["auto", "auto"]} />
            <Tooltip />
            <Area type="monotone" dataKey="lo" stackId="band" stroke="none" fill="transparent" />
            <Area type="monotone" dataKey="band" stackId="band" stroke="none" fill={obj.color} fillOpacity={0.18} />
            <Line type="monotone" dataKey="mean" stroke={obj.color} dot={false} strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {showRuns ? (
        <div className="mt-2 h-28 opacity-50">
          <ResponsiveContainer>
            <ComposedChart margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="g" hide />
              <YAxis hide domain={obj.id === "o1" ? [-1.05, 0.05] : ["auto", "auto"]} />
              {data.runs[obj.id].slice(0, 12).map((run, ri) => (
                <Line
                  key={ri}
                  type="monotone"
                  data={run.map((v, i) => ({ g: data.gen[i], v }))}
                  dataKey="v"
                  stroke={obj.color}
                  dot={false}
                  strokeWidth={0.8}
                  isAnimationActive={false}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </article>
  );
}

function ParetoBlock({ data }: { data: EvolutionPareto }) {
  const pairs = useMemo(
    () => [
      { x: 0, y: 1, xl: "O1", yl: "O2" },
      { x: 0, y: 2, xl: "O1", yl: "O3" },
      { x: 1, y: 2, xl: "O2", yl: "O3" },
    ],
    [],
  );
  return (
    <section>
      <h2 className="text-lg font-medium">Interactive Pareto front</h2>
      <p className="mt-1 text-sm text-muted">
        {data.n_unique} unique final-generation individuals from {data.n_runs} runs · {data.n_fronts}{" "}
        successive fronts
        {data.fixture ? " · fixture preview" : ""}
      </p>
      <div className="mt-4">
        <Pareto3D data={data} />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {pairs.map((pr) => {
          const scatter = data.points.map((p, i) => ({
            x: p[pr.x],
            y: p[pr.y],
            rank: data.rank[i],
          }));
          const front = scatter.filter((s) => s.rank <= 4);
          const rest = scatter.filter((s) => s.rank > 4);
          return (
            <article key={pr.xl + pr.yl} className="figure-well p-3">
              <h3 className="text-sm font-medium">
                {pr.xl} vs {pr.yl}
              </h3>
              <div className="mt-2 h-48">
                <ResponsiveContainer>
                  <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                    <CartesianGrid stroke="#e8e6df" />
                    <XAxis type="number" dataKey="x" name={pr.xl} tick={{ fontSize: 10 }} />
                    <YAxis type="number" dataKey="y" name={pr.yl} tick={{ fontSize: 10 }} />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter data={rest} fill="#8A8476" fillOpacity={0.25} />
                    <Scatter data={front} fill="#005335" fillOpacity={0.8} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
