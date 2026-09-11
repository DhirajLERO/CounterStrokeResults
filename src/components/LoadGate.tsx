import { useEffect, useState, type ReactNode } from "react";

export function useJson<T>(key: string, loader: () => Promise<T>): { data: T | null; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    setData(null);
    setError(null);
    if (key.endsWith("-skip")) return () => {
      live = false;
    };
    loader()
      .then((d) => {
        if (live) setData(d);
      })
      .catch((e: Error) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, [key]);
  return { data, error };
}

export function LoadGate({
  error,
  data,
  children,
  hint,
}: {
  error: string | null;
  data: unknown;
  children: ReactNode;
  hint?: string;
}) {
  if (error) {
    return (
      <div className="figure-well p-8 text-sm text-muted">
        <p className="font-medium text-ink">Data bundle not found.</p>
        <p className="mt-2">
          {hint ??
            "Unzip counterstroke_pages_data.zip into public/data/ (see the site README), then rebuild."}
        </p>
        <p className="mt-2 font-mono text-xs">{error}</p>
      </div>
    );
  }
  if (!data) return <p className="text-sm text-muted">Loading…</p>;
  return <>{children}</>;
}
