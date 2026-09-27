import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  // gsap and @gsap/react ship package.json fields that are ambiguous about
  // ESM vs CommonJS (no "type": "module", index files use ESM syntax).
  // Left external, Vite emits a bare `import ... from "gsap"` in the server
  // bundle and Node's own resolution of that ambiguity breaks in Vercel's
  // function runtime. Bundling them in at build time sidesteps that entirely.
  ssr: {
    noExternal: ["gsap", "@gsap/react"],
  },
});
