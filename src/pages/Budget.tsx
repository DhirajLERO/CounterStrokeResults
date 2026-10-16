import { useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Chip } from "../components/Chip";
import { Layout } from "../components/Layout";
import { LoadGate, useJson } from "../components/LoadGate";
import { loadBudgetCurves, loadBudgetIndex, loadBudgetLines, loadBudgetTable } from "../lib/data";
import type { BudgetCurves, BudgetIndex, BudgetLinePoint, BudgetMetricRow } from "../lib/types";

const SEARCH = "#1B3A6B";
const GRAMMAR = "#c47b2b";
const OBJ = [
  { id: "o1" as const, label: "O1 validity", color: "#005335" },
  { id: "o2" as const, label: "O2 sparsity", color: "#0E6B5C" },
  { id: "o3" as const, label: "O3 proximity", color: "#C47A4A" },
];

export function BudgetPage() {
  const index = useJson("budget-index", loadBudgetIndex);
  const lines = useJson("budget-lines", loadBudgetLines);
  const [ds, setDs] = useState("mnist");
  const [readout, setReadout] = useState("CS_sparse");
  const table = useJson(`budget-table-${ds}`, () => loadBudgetTable(ds));
  const curves = useJson(`budget-curves-${ds}`, () => loadBudgetCurves(ds));
  const meta = index.data?.datasets.find((item) => item.id === ds);

  return (
    <Layout>
      <h1 className="font-display text-4xl">Search budget and the grammar</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
        A population of 300, on the same three seeds as the multirun, stopped at generation 300. That is 90,300
        evaluations: 18% of the MNIST and CIFAR-10 budget, and 9% of the ImageNet-100 budget. The grammar ablation
        keeps the representation and the same pick rules, and drops selection, crossover, and mutation.
      </p>
      <LoadGate error={index.error} data={index.data} hint="The budget bundle is missing from public/data/budget/.">
        {index.data ? (
          <>
            <div className="mt-6 flex flex-wrap gap-2">
              {index.data.datasets.map((item) => (
                <Chip key={item.id} active={ds === item.id} onClick={() => setDs(item.id)}>
                  {item.label}
                </Chip>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {index.data.readouts.map((item) => (
                <Chip key={item.id} active={readout === item.id} onClick={() => setReadout(item.id)}>
                  {item.label}
                </Chip>
              ))}
            </div>
            <div className="mt-8 space-y-12">
              <LoadGate error={table.error} data={table.data}>
                {table.data && meta ? (
                  <Tables
                    meta={meta}
                    notes={index.data.notes}
                    readout={readout}
                    rows={table.data.readouts[readout]}
                  />
                ) : null}
              </LoadGate>
              <LoadGate error={lines.error} data={lines.data}>
                {lines.data ? (
                  <GrammarLines
                    readout={readout}
                    block={lines.data[ds]?.[readout]}
                    note={index.data.notes.grammar}
                    radar={index.data.radar}
                  />
                ) : null}
              </LoadGate>
              <LoadGate error={curves.error} data={curves.data}>
                {curves.data ? <ObjectiveCurves data={curves.data} label={meta?.label ?? ds} /> : null}
              </LoadGate>
            </div>
          </>
        ) : null}
      </LoadGate>
    </Layout>
  );
}

function Tables({
  meta,
  notes,
  readout,
  rows,
}: {
  meta: BudgetIndex["datasets"][number];
  notes: BudgetIndex["notes"];
  readout: string;
  rows: { main: BudgetMetricRow[]; extra: BudgetMetricRow[] } | undefined;
}) {
  if (!rows) return null;
  return (
    <section>
      <h2 className="text-lg font-medium">Population 300 against the multirun</h2>
      <p className="mt-1 max-w-3xl text-sm text-muted">
        {meta.label} · {readout} · generations 100, 200, and 300 are {meta.shares} of the main-run evaluation budget ({meta.mainBudget} evaluations). {notes.percent}
      </p>
      {meta.id !== "mnist" ? <p className="mt-2 max-w-3xl text-sm text-muted">{notes.kid}</p> : null}
      <div className="mt-4 overflow-x-auto figure-well p-4">
        <MetricTable rows={rows.main} checkpoints={meta.checkpoints} />
      </div>
      <h3 className="mt-8 text-sm font-medium">Generation 300 on the remaining metrics</h3>
      <p className="mt-1 max-w-3xl text-sm text-muted">
        Class reference, embedding distance, and class-conditional scores at 90,300 evaluations.
      </p>
      <div className="mt-4 overflow-x-auto figure-well p-4">
        <MetricTable rows={rows.extra} checkpoints={meta.checkpoints.filter((item) => item.generation === 300)} />
      </div>
    </section>
  );
}

function MetricTable({
  rows,
  checkpoints,
}: {
  rows: BudgetMetricRow[];
  checkpoints: { generation: number; nEvaluations: number }[];
}) {
  return (
    <table className="w-full min-w-[40rem] border-collapse text-sm">
      <thead>
        <tr className="border-b border-ink/10 text-left text-xs text-muted">
          <th className="py-2 pr-3 font-medium">Metric</th>
          <th className="py-2 pr-3 font-medium">Multirun</th>
          {checkpoints.map((item) => (
            <th key={item.generation} className="py-2 pr-3 font-medium">
              Gen {item.generation}
              <span className="mt-0.5 block font-normal">{item.nEvaluations.toLocaleString("en-US")}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-ink/5">
            <td className="py-2 pr-3">{row.label}</td>
            <td className="py-2 pr-3 tabular-nums">{formatValue(row.id, row.baseline)}</td>
            {row.cells.map((cell) => (
              <td key={cell.generation} className="py-2 pr-3 tabular-nums">
                {formatValue(row.id, cell.value)}{" "}
                <span className="text-muted">({formatPercent(cell.percent)})</span>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GrammarLines({
  readout,
  block,
  note,
  radar,
}: {
  readout: string;
  block: { search: BudgetLinePoint[]; grammar: { sharedN: number; paperN: number; points: BudgetLinePoint[] } } | undefined;
  note: string;
  radar: string;
}) {
  if (!block) return null;
  const charts = [
    { title: "L2", percent: "l2Percent" as const, value: "l2" as const },
    { title: "Sparsity", percent: "sparsityPercent" as const, value: "sparsity" as const },
  ];
  return (
    <section>
      <h2 className="text-lg font-medium">Grammar against evolution</h2>
      <p className="mt-1 max-w-3xl text-sm text-muted">
        {readout} · percent above the multirun. Zero is the full solution. {note}
      </p>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {charts.map((chart) => (
          <article key={chart.title} className="figure-well p-4">
            <h3 className="text-sm font-medium">{chart.title}</h3>
            <div className="mt-2 flex gap-4 text-xs text-muted">
              <span style={{ color: SEARCH }}>Search</span>
              <span style={{ color: GRAMMAR }}>Grammar only</span>
            </div>
            <div className="mt-2 h-56">
              <ResponsiveContainer>
                <LineChart margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#e8e6df" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={[25, 95]}
                    ticks={[30, 60, 90]}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value, _name, item) => {
                      const point = item.payload as { value?: number };
                      const percent = typeof value === "number" ? value : Number(value);
                      const absolute = point.value;
                      return [`${percent.toFixed(1)}% · ${absolute?.toPrecision(3) ?? ""}`, String(_name)];
                    }}
                  />
                  <Line
                    data={block.search.map((point) => ({
                      x: point.nEvaluations / 1000,
                      y: point[chart.percent],
                      value: point[chart.value],
                    }))}
                    dataKey="y"
                    name="Search"
                    stroke={SEARCH}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    data={block.grammar.points.map((point) => ({
                      x: point.nEvaluations / 1000,
                      y: point[chart.percent],
                      value: point[chart.value],
                    }))}
                    dataKey="y"
                    name="Grammar only"
                    stroke={GRAMMAR}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-1 text-center text-[10px] text-muted">Evaluations (thousands)</p>
          </article>
        ))}
      </div>
      <figure className="mt-8 figure-well p-4">
        <img
          src={`${import.meta.env.BASE_URL}${radar}`}
          alt="Radar of retained fraction for CS_sparse and CS_prox at generations 100, 200, and 300"
          className="w-full"
        />
        <figcaption className="mt-3 max-w-3xl text-xs leading-relaxed text-muted">
          CS_sparse on top and CS_prox below. The outer ring is that readout’s multirun row. Spokes run clockwise from
          L2 and are identified by the colour key. Blue polygons are generations 100, 200, and 300. Magenta marks are
          the grammar at about 30k, 60k, and 90k evaluations, and only L2 and sparsity are drawn for that ablation.
        </figcaption>
      </figure>
    </section>
  );
}

function ObjectiveCurves({ data, label }: { data: BudgetCurves; label: string }) {
  return (
    <section>
      <h2 className="text-lg font-medium">Small-budget search dynamics</h2>
      <p className="mt-1 max-w-3xl text-sm text-muted">
        {label} · mean best objective across the population-300 runs (±1 std). Dashed lines mark generations 100, 200,
        and 300. These curves are the search, before a pick is chosen.
      </p>
      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        {OBJ.map((objective) => (
          <ObjectiveChart key={objective.id} data={data} objective={objective} />
        ))}
      </div>
    </section>
  );
}

function ObjectiveChart({
  data,
  objective,
}: {
  data: BudgetCurves;
  objective: (typeof OBJ)[number];
}) {
  const rows = data.gen.map((generation, index) => {
    const mean = data.mean[objective.id][index];
    const std = data.std[objective.id][index];
    return { g: generation, mean, lo: mean - std, band: 2 * std };
  });
  return (
    <article className="figure-well p-3">
      <h3 className="text-sm font-medium" style={{ color: objective.color }}>
        {objective.label}
      </h3>
      <div className="mt-2 h-52">
        <ResponsiveContainer>
          <ComposedChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#e8e6df" />
            <XAxis dataKey="g" ticks={[0, 100, 200, 300]} tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              domain={objective.id === "o1" ? [-1.05, 0.05] : ["auto", "auto"]}
              allowDataOverflow={objective.id === "o1"}
              tickFormatter={(value) => Number(value).toFixed(objective.id === "o1" ? 2 : 0)}
            />
            <Tooltip />
            {data.marks.map((generation) => (
              <ReferenceLine key={generation} x={generation} stroke="#8a8680" strokeDasharray="3 3" />
            ))}
            <Area type="monotone" dataKey="lo" stackId="band" stroke="none" fill="transparent" />
            <Area type="monotone" dataKey="band" stackId="band" stroke="none" fill={objective.color} fillOpacity={0.18} />
            <Line type="monotone" dataKey="mean" stroke={objective.color} dot={false} strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

function formatValue(metric: string, value: number): string {
  const abs = Math.abs(value);
  let text: string;
  if (metric === "sparsity_frac") text = abs < 0.001 ? value.toFixed(6) : value.toFixed(4);
  else if (metric.startsWith("ssim")) text = abs > 0.99 ? value.toFixed(4) : value.toFixed(3);
  else if (metric.startsWith("lpips")) text = abs < 0.02 ? value.toFixed(4) : value.toFixed(3);
  else if (metric === "l2_distance" || metric === "p_pred_cf") text = value.toFixed(3);
  else if (metric.startsWith("frechet") || metric.startsWith("inception")) text = value.toFixed(2);
  else if (metric.startsWith("kid")) text = value.toFixed(5);
  else if (metric.startsWith("cmmd")) text = value.toFixed(4);
  else text = value.toPrecision(4);
  return text.replace("-", "−");
}

function formatPercent(value: number): string {
  const body = Math.abs(value).toFixed(1);
  if (value > 0) return `+${body}%`;
  if (value < 0) return `−${body}%`;
  return "0%";
}
