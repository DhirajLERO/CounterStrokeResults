export function Chip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm transition ${
        active ? "border-transparent text-white" : "border-ink/15 bg-white text-muted hover:border-teal"
      }`}
      style={active ? { background: color ?? "#005335" } : undefined}
    >
      {children}
    </button>
  );
}
