import { useEffect, useState } from "react";

export function StatTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !/^[0-9.%]+$/.test(value.replace(/[−–-]/g, ""))) {
      setShown(value);
      return;
    }
    setShown(value);
  }, [value]);

  return (
    <div className="figure-well p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl text-ul">{shown}</p>
      <p className="mt-2 text-sm text-muted">{detail}</p>
    </div>
  );
}
