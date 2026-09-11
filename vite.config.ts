import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base works for HashRouter on GitHub project pages and locally.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
