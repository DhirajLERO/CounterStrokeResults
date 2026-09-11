import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { BlankPage } from "./pages/Blank";
import { EvolutionPage } from "./pages/Evolution";
import { ExplorePage } from "./pages/Explore";
import { HomePage } from "./pages/Home";
import { MethodPage } from "./pages/Method";
import { MetricsPage } from "./pages/Metrics";
import { PaperPage } from "./pages/Paper";
import { SamplePage } from "./pages/Sample";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/method" element={<MethodPage />} />
        <Route path="/evolution" element={<EvolutionPage />} />
        <Route path="/metrics" element={<MetricsPage />} />
        <Route path="/explore" element={<Navigate to="/explore/mnist" replace />} />
        <Route path="/explore/:dataset" element={<ExplorePage />} />
        <Route path="/explore/:dataset/:sampleIdx" element={<SamplePage />} />
        <Route path="/blank" element={<Navigate to="/blank/mnist" replace />} />
        <Route path="/blank/:dataset" element={<BlankPage />} />
        <Route path="/blank/:dataset/:target" element={<BlankPage />} />
        <Route path="/paper" element={<PaperPage />} />
      </Routes>
    </HashRouter>
  );
}
