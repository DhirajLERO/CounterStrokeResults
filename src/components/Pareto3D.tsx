import { useEffect, useMemo, useRef, useState } from "react";

export type ParetoCloud = {
  points: number[][];
  rank: number[];
  objectives?: { id: string; label: string; short: string }[];
};

function frontColor(rank: number): string {
  if (rank <= 1) return "#005335";
  if (rank === 2) return "#0E6B5C";
  if (rank === 3) return "#00B140";
  if (rank === 4) return "#6B8F71";
  return "#8A8476";
}

function project(
  p: [number, number, number],
  yaw: number,
  pitch: number,
): [number, number, number] {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const x1 = p[0] * cy - p[2] * sy;
  const z1 = p[0] * sy + p[2] * cy;
  const y2 = p[1] * cp - z1 * sp;
  const z2 = p[1] * sp + z1 * cp;
  return [x1, y2, z2];
}

export function Pareto3D({ data }: { data: ParetoCloud }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [yaw, setYaw] = useState(-0.7);
  const [pitch, setPitch] = useState(0.4);
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);
  const [hover, setHover] = useState<{ o1: number; o2: number; o3: number; rank: number } | null>(null);

  const stats = useMemo(() => {
    const pts = data.points;
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (const p of pts) {
      for (let i = 0; i < 3; i++) {
        min[i] = Math.min(min[i], p[i]);
        max[i] = Math.max(max[i], p[i]);
      }
    }
    const span = min.map((m, i) => Math.max(max[i] - m, 1e-6));
    return { min, max, span };
  }, [data.points]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h) * 0.38;
    const { min, span } = stats;

    const drawn = data.points.map((p, i) => {
      const n: [number, number, number] = [
        ((p[0] - min[0]) / span[0]) * 2 - 1,
        ((p[1] - min[1]) / span[1]) * 2 - 1,
        ((p[2] - min[2]) / span[2]) * 2 - 1,
      ];
      const [x, y, z] = project(n, yaw, pitch);
      return { x: cx + x * scale, y: cy - y * scale, z, rank: data.rank[i] ?? 99, raw: p };
    });
    drawn.sort((a, b) => a.z - b.z);

    ctx.strokeStyle = "rgba(28,28,26,0.18)";
    ctx.lineWidth = 1;
    const corners: [number, number, number][] = [];
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) corners.push([sx, sy, sz]);
    const box = corners.map((c) => {
      const [x, y] = project(c, yaw, pitch);
      return [cx + x * scale, cy - y * scale] as [number, number];
    });
    const edges = [
      [0, 1], [2, 3], [4, 5], [6, 7],
      [0, 2], [1, 3], [4, 6], [5, 7],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];
    for (const [a, b] of edges) {
      ctx.beginPath();
      ctx.moveTo(box[a][0], box[a][1]);
      ctx.lineTo(box[b][0], box[b][1]);
      ctx.stroke();
    }

    for (const d of drawn) {
      const r = d.rank <= 1 ? 3.4 : d.rank <= 4 ? 2.4 : 1.6;
      ctx.beginPath();
      ctx.fillStyle = frontColor(d.rank);
      ctx.globalAlpha = d.rank <= 4 ? 0.9 : 0.35;
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#5C5A56";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText("O1 validity", 16, h - 18);
    ctx.fillText("O2 sparsity", w / 2 - 36, h - 18);
    ctx.fillText("O3 proximity", w - 100, h - 18);
  }, [data, yaw, pitch, stats]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="figure-well h-[420px] w-full cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={(e) => {
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, yaw, pitch };
        }}
        onPointerMove={(e) => {
          if (drag.current) {
            const dx = e.clientX - drag.current.x;
            const dy = e.clientY - drag.current.y;
            setYaw(drag.current.yaw + dx * 0.008);
            setPitch(Math.max(-1.2, Math.min(1.2, drag.current.pitch + dy * 0.008)));
            return;
          }
          const canvas = canvasRef.current;
          if (!canvas) return;
          const rect = canvas.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;
          const { min, span } = stats;
          const cx = rect.width / 2;
          const cy = rect.height / 2;
          const scale = Math.min(rect.width, rect.height) * 0.38;
          let bestI = -1;
          let bestD = 10;
          data.points.forEach((p, i) => {
            const n: [number, number, number] = [
              ((p[0] - min[0]) / span[0]) * 2 - 1,
              ((p[1] - min[1]) / span[1]) * 2 - 1,
              ((p[2] - min[2]) / span[2]) * 2 - 1,
            ];
            const [x, y] = project(n, yaw, pitch);
            const dx = mx - (cx + x * scale);
            const dy = my - (cy - y * scale);
            const d = Math.hypot(dx, dy);
            if (d < bestD) {
              bestD = d;
              bestI = i;
            }
          });
          if (bestI >= 0 && bestD < 8) {
            const p = data.points[bestI];
            setHover({ o1: p[0], o2: p[1], o3: p[2], rank: data.rank[bestI] });
          } else setHover(null);
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerLeave={() => {
          drag.current = null;
          setHover(null);
        }}
      />
      {hover ? (
        <div className="pointer-events-none absolute right-3 top-3 rounded-lg bg-white/95 px-3 py-2 text-xs shadow-well">
          <div>Front {hover.rank}</div>
          <div>O1 {hover.o1.toFixed(3)}</div>
          <div>O2 {hover.o2.toFixed(2)}</div>
          <div>O3 {hover.o3.toFixed(2)}</div>
        </div>
      ) : (
        <p className="absolute left-3 top-3 text-xs text-muted">Drag to rotate · hover a point</p>
      )}
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
        {[1, 2, 3, 4].map((r) => (
          <span key={r} className="inline-flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: frontColor(r) }} />
            Front {r}
          </span>
        ))}
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#8A8476]" />
          Rest
        </span>
      </div>
    </div>
  );
}
