const marks = [
  { href: "https://www.ul.ie/research/biocomputing-and-developmental-systems", src: "bds.png", alt: "Biocomputing & Developmental Systems" },
  { href: "https://www.ul.ie/", src: "ul.svg", alt: "University of Limerick" },
  { href: "https://lero.ie/", src: "lero.png", alt: "Lero, the Research Ireland Centre for Software" },
  { href: "https://www.crt-ai.ie/", src: "crt-ai.png", alt: "CRT-AI" },
];

export function Footer() {
  const base = import.meta.env.BASE_URL;
  return (
    <footer className="mt-16 bg-white">
      <div className="mx-auto max-w-6xl border-t border-ink/10 px-4 py-10">
        <p className="mb-6 text-center text-sm text-muted">
          Research carried out in the Biocomputing &amp; Developmental Systems (BDS) group at the
          University of Limerick, with support from Lero and CRT-AI.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10">
          {marks.map((m) => (
            <a key={m.src} href={m.href} target="_blank" rel="noreferrer" className="opacity-90 hover:opacity-100">
              <img src={`${base}affiliations/${m.src}`} alt={m.alt} className="h-9 w-auto object-contain md:h-10" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
