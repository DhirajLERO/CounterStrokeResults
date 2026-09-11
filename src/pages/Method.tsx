import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export function MethodPage() {
  return (
    <Layout>
      <h1 className="font-display text-4xl">Method</h1>
      <p className="mt-3 max-w-3xl text-muted">
        CounterStroke represents a counterfactual as a sparse, localised drawing program evolved in
        image space. The search, the visual intervention, and the explanation share one inspectable
        representation.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          { k: "O1", t: "Validity", d: "Decision margin: flip the classifier with high confidence." },
          { k: "O2", t: "Sparsity", d: "Change as few pixels as possible (CS_sparse / Graco O2)." },
          { k: "O3", t: "Proximity", d: "Stay close in L₂ to the factual image (CS_prox / Graco O3)." },
        ].map((o) => (
          <article key={o.k} className="figure-well p-6">
            <p className="text-sm text-teal">{o.k}</p>
            <h2 className="mt-1 text-xl font-medium">{o.t}</h2>
            <p className="mt-2 text-sm text-muted">{o.d}</p>
          </article>
        ))}
      </div>
      <div className="mt-10 figure-well p-6">
        <h2 className="text-lg font-medium">Three readouts from one population</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>
            <strong className="text-ink">CS_sparse</strong> — sparsest successful flip (Graco O2).
          </li>
          <li>
            <strong className="text-ink">CS_prox</strong> — most proximal successful flip (Graco O3).
          </li>
          <li>
            <strong className="text-ink">CS_50</strong> — median sparsity among successful flips (Graco50).
          </li>
        </ul>
        <p className="mt-4 text-sm text-muted">
          Baselines in the explorer: GradCF (Wachter), CFProto, CFRL, Leap, and Leap-R. No
          counterfactual-specific generative model is trained for CounterStroke — only the task
          classifier is queried.
        </p>
        <p className="mt-4 text-sm text-muted">
          Thirty-run mean ± std of O1/O2/O3 and the pooled final-generation Pareto cloud are on the{" "}
          <Link to="/evolution" className="text-teal">
            Evolution
          </Link>{" "}
          page.
        </p>
      </div>
    </Layout>
  );
}
