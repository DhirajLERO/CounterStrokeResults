import { Layout } from "../components/Layout";
import { LoadGate, useJson } from "../components/LoadGate";
import { loadPaper } from "../lib/data";

export function PaperPage() {
  const { data, error } = useJson("paper", loadPaper);
  return (
    <Layout>
      <LoadGate error={error} data={data}>
        {data ? (
          <article className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.2em] text-teal">Paper</p>
            <h1 className="mt-2 font-display text-4xl leading-tight">{data.title}</h1>
            <p className="mt-4 text-sm">
              {data.authors.map((a) => a.name).join(" and ")}
            </p>
            <p className="mt-1 text-sm text-muted">{data.affiliation}</p>
            <p className="mt-1 text-sm text-muted">{data.authors.map((a) => a.email).join(" · ")}</p>
            <h2 className="mt-10 text-lg font-medium">Abstract</h2>
            <p className="mt-3 leading-relaxed text-ink/85">{data.abstract}</p>
            <h2 className="mt-10 text-lg font-medium">Contributions</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
              {data.contributions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ol>
            <h2 className="mt-10 text-lg font-medium">Causal interventions</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Beyond the interactive classification explorer (MNIST, CIFAR-10, ImageNet-100), the
              paper evaluates CounterStroke on the Deep-SCM protocol: MorphoMNIST (digit / thickness /
              intensity) and CelebA (simple and complex attribute graphs). CounterStroke has the
              strongest CelebA intervention effectiveness and perfect MorphoMNIST digit accuracy, with
              minimality comparable to VAE and HVAE baselines.
            </p>
            <p className="mt-6 text-sm text-muted">Keywords: {data.keywords.join(" · ")}</p>
          </article>
        ) : null}
      </LoadGate>
    </Layout>
  );
}
