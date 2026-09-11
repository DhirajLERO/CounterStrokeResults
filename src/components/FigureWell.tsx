export function FigureWell({
  src,
  alt,
  caption,
  pixelated,
  onClick,
}: {
  src: string;
  alt: string;
  caption?: string;
  pixelated?: boolean;
  onClick?: () => void;
}) {
  return (
    <figure className="min-w-0">
      <button
        type="button"
        onClick={onClick}
        className={`figure-well block w-full ${onClick ? "cursor-zoom-in" : "cursor-default"}`}
      >
        <img
          src={src}
          alt={alt}
          className={`mx-auto max-h-56 w-full object-contain ${pixelated ? "pixelated" : ""}`}
        />
      </button>
      {caption ? <figcaption className="mt-1 text-center text-xs text-muted">{caption}</figcaption> : null}
    </figure>
  );
}
