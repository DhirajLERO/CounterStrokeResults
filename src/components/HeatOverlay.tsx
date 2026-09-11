import { useEffect, useRef } from "react";
import { colorizeHeat, loadGrayPng } from "../lib/heat";

export function HeatOverlay({
  baseSrc,
  heatSrc,
  intensity,
  pixelated,
}: {
  baseSrc: string;
  heatSrc: string | null;
  intensity: number;
  pixelated?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let cancelled = false;
    const base = new Image();
    base.onload = async () => {
      if (cancelled) return;
      canvas.width = base.naturalWidth;
      canvas.height = base.naturalHeight;
      ctx.imageSmoothingEnabled = !pixelated;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(base, 0, 0);
      if (!heatSrc) return;
      const gray = await loadGrayPng(heatSrc);
      if (!gray || cancelled) return;
      const overlay = document.createElement("canvas");
      overlay.width = gray.w;
      overlay.height = gray.h;
      const octx = overlay.getContext("2d");
      if (!octx) return;
      octx.putImageData(colorizeHeat(gray.data, gray.w, gray.h, intensity), 0, 0);
      ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
    };
    base.src = baseSrc;
    return () => {
      cancelled = true;
    };
  }, [baseSrc, heatSrc, intensity, pixelated]);

  return <canvas ref={canvasRef} className={`figure-well mx-auto max-h-80 w-full object-contain ${pixelated ? "pixelated" : ""}`} />;
}
