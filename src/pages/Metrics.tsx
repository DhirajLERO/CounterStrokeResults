import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ErrorBar,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { Chip } from "../components/Chip";
import { Layout } from "../components/Layout";
import { LoadGate, useJson } from "../components/LoadGate";
import { DATASETS, loadCatalog, loadMetrics, loadScatter } from "../lib/data";
import { methodColor } from "../lib/methods";
import type { Catalog, MetricBundle, ScatterRow } from "../lib/types";

export function MetricsPage() {
  const nav = useNavigate();
  const cat = useJson("catalog", loadCatalog);
  const [ds, setDs] = useState("mnist");
  const [group, setGroup] = useState("Success");
  const metrics = useJson(`metrics-${ds}`, () => loadMetrics(ds));
  const scatter = useJson(`scatter-${ds}`, () => loadScatter(ds));
  const [onMethods, setOnMethods] = useState<Record<string, boolean>>({});

  const catalog = cat.data;
  const methods = catalog?.methods ?? [];
  const active = methods.filter((m) => onMethods[m.id] !== false);

  return (
    <Layout>
      <h1 className="font-display text-4xl">Metrics</h1>
      <p className="mt-2 max-w-3xl text-sm text-muted">
        Precomputed evaluation tables. Toggle methods and groups; click a chart to open Explore, or a
        scatter point to open that sample.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {DATASETS.map((d) => (
          <Chip key={d.id} active={ds === d.id} onClick={() => setDs(d.id)}>
            {d.label}
          </Chip>
        ))}
      </div>
      <LoadGate error={cat.error ?? metrics.error} data={catalog && metrics.data}>
        {catalog && metrics.data ? (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {methods.map((m) => (
                <Chip
                  key={m.id}
                  color={methodColor(m.id)}
                  active={onMethods[m.id] !== false}
                  onClick={() => setOnMethods((s) => ({ ...s, [m.id]: s[m.id] === false }))}
                >
                  {m.label}
                </Chip>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {catalog.metricGroups.map((g) => (
                <Chip key={g} active={group === g} onClick={() => setGroup(g)}>
                  {g}
                </Chip>
              ))}
            </div>
            <MetricGrid
              catalog={catalog}
              bundle={metrics.data}
              group={group}
              methodIds={active.map((m) => m.id)}
              onBarClick={() => nav(`/explore/${ds}`)}
            />
            {scatter.data ? <ScatterPanel dataset={ds} rows={scatter.data.rows} methodIds={active.map((m) => m.id)} /> : null}
          </>
        ) : null}
      </LoadGate>
    </Layout>
  );
}

function MetricGrid({
  catalog,
  bundle,
  group,
  methodIds,
  onBarClick,
}: {
  catalog: Catalog;
  bundle: MetricBundle;
  group: string;
  methodIds: string[];
  onBarClick: () => void;
}) {
  const defs = catalog.metrics.filter((m) => m.group === group);
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      {defs.map((def) => {
        const block = bundle.metrics[def.id];
        const data = methodIds.map((id) => {
          const row = block?.byMethod[id];
          return {
            method: catalog.methods.find((m) => m.id === id)?.label ?? id,
            id,
            mean: row?.mean ?? 0,
            err: row?.err ?? 0,
          };
        });
        return (
          <article key={def.id} className="figure-well p-4">
            <h3 className="text-sm font-medium">{def.label}</h3>
            <p className="mt-1 text-xs text-muted">{def.description}</p>
            <div className="mt-3 h-56">
              <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                  <CartesianGrid stroke="#e8e6df" vertical={false} />
                  <XAxis dataKey="method" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="mean" radius={[4, 4, 0, 0]} cursor="pointer" onClick={onBarClick}>
                    {data.map((d) => (
                      <Cell key={d.id} fill={methodColor(d.id)} />
                    ))}
                    <ErrorBar dataKey="err" width={4} strokeOpacity={0.7} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ScatterPanel({
  dataset,
  rows,
  methodIds,
}: {
  dataset: string;
  rows: ScatterRow[];
  methodIds: string[];
}) {
  const nav = useNavigate();
  const points = useMemo(
    () =>
      rows
        .filter((r) => methodIds.includes(r.method) && r.l2_distance != null && r.sparsity_count != null)
        .map((r) => ({
          ...r,
          x: r.l2_distance as number,
          y: r.sparsity_count as number,
        })),
    [rows, methodIds],
  );
  return (
    <section className="mt-10 figure-well p-4">
      <h3 className="text-sm font-medium">L2 vs sparsity (click a point)</h3>
      <div className="mt-3 h-80">
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <CartesianGrid stroke="#e8e6df" />
            <XAxis type="number" dataKey="x" name="L2" tick={{ fontSize: 10 }} />
            <YAxis type="number" dataKey="y" name="Sparsity" tick={{ fontSize: 10 }} />
            <ZAxis range={[40, 40]} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            {methodIds.map((id) => (
              <Scatter
                key={id}
                name={id}
                data={points.filter((p) => p.method === id)}
                fill={methodColor(id)}
                onClick={(p) => {
                  const row = p as ScatterRow;
                  if (row.sample_idx != null) nav(`/explore/${dataset}/${row.sample_idx}`);
                }}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
