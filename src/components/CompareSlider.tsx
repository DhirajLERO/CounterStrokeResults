import { useRef } from "react";

export function CompareSlider({
  leftSrc,
  rightSrc,
  leftLabel,
  rightLabel,
  pixelated,
}: {
  leftSrc: string;
  rightSrc: string;
  leftLabel: string;
  rightLabel: string;
  pixelated?: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);

  return (
    <div ref={wrap} className="figure-well relative aspect-square max-h-80 w-full overflow-hidden">
      <img src={leftSrc} alt={leftLabel} className={`absolute inset-0 h-full w-full object-contain ${pixelated ? "pixelated" : ""}`} />
      <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }} id="cf-clip">
        <img src={rightSrc} alt={rightLabel} className={`h-full w-full object-contain ${pixelated ? "pixelated" : ""}`} />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        defaultValue={50}
        className="absolute inset-x-0 bottom-3 z-10 mx-auto w-2/3 accent-ul"
        onInput={(e) => {
          const el = wrap.current?.querySelector("#cf-clip") as HTMLDivElement | null;
          if (el) el.style.width = `${(e.target as HTMLInputElement).value}%`;
        }}
        aria-label="Compare original and counterfactual"
      />
      <span className="absolute left-2 top-2 rounded bg-white/80 px-2 py-0.5 text-[10px] uppercase text-muted">
        {leftLabel}
      </span>
      <span className="absolute right-2 top-2 rounded bg-white/80 px-2 py-0.5 text-[10px] uppercase text-muted">
        {rightLabel}
      </span>
    </div>
  );
}
