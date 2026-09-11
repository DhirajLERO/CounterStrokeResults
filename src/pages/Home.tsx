import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { LoadGate, useJson } from "../components/LoadGate";
import { StatTile } from "../components/StatTile";
import { loadPaper } from "../lib/data";

const steps = [
  { n: "01", title: "Genotype → phenotype", body: "Integer genomes are mapped by DAGE into executable turtle sketch programs." },
  { n: "02", title: "Render & score", body: "Sketches overlay the factual (or blank) image. The black-box classifier scores validity (O1), sparsity (O2), and proximity (O3)." },
  { n: "03", title: "Evolve & explain", body: "NSGA-II evolves the population. The final generation yields CS_sparse, CS_prox, CS_50, and aggregated change maps." },
];

export function HomePage() {
  const { data, error } = useJson("paper", loadPaper);
  return (
    <Layout>
      <LoadGate error={error} data={data}>
        {data ? (
          <div className="space-y-14">
            <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-teal">BDS group · CSIS · University of Limerick</p>
                <h1 className="mt-3 font-display text-5xl leading-tight text-ink md:text-6xl">CounterStroke</h1>
                <p className="mt-4 text-lg text-muted">
                  Evolving visual counterfactuals as inspectable sketch programs.
                </p>
                <p className="mt-6 text-[15px] leading-relaxed text-ink/80">{data.abstract}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/explore" className="rounded-full bg-ul px-5 py-2.5 text-sm text-white">
                    Explore images
                  </Link>
                  <Link to="/evolution" className="rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm">
                    Search dynamics
                  </Link>
                  <Link to="/metrics" className="rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm">
                    Compare metrics
                  </Link>
                  <Link to="/blank" className="rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm">
                    Blank canvas
                  </Link>
                </div>
              </div>
              <StrokeMotif />
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.highlights.map((h, i) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.28 }}
                >
                  <StatTile label={h.label} value={h.value} detail={h.detail} />
                </motion.div>
              ))}
            </section>

            <section>
              <h2 className="font-display text-3xl">How a stroke becomes an explanation</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {steps.map((s) => (
                  <article key={s.n} className="figure-well p-5">
                    <p className="text-xs text-teal">{s.n}</p>
                    <h3 className="mt-1 font-medium">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </LoadGate>
    </Layout>
  );
}

function StrokeMotif() {
  return (
    <div className="figure-well relative aspect-square overflow-hidden bg-white p-8">
      <svg viewBox="0 0 200 200" className="h-full w-full text-teal" fill="none">
        <circle cx="100" cy="100" r="54" stroke="currentColor" strokeWidth="6" className="opacity-30" />
        <motion.path
          d="M70 130 C80 40 140 40 130 120 C125 160 90 155 88 120"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
        />
      </svg>
      <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted">
        A drawing program, not a latent walk
      </p>
    </div>
  );
}
