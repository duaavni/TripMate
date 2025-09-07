import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
// Sentry removed

export default defineConfig(config => {
  return {
    plugins: [tailwindcss(), tsconfigPaths(), reactRouter()],
    ssr: {
      noExternal: [/@syncfusion/]
    }
  };
});
