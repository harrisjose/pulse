import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "@svgr/rollup";
import electron from "vite-plugin-electron";

export default defineConfig({
  mode: "development",
  plugins: [
    react(),
    svgr(),
    electron([
      {
        entry: "electron/server.ts",
      },
      {
        entry: "preload/preload.ts",
        onstart(options) {
          options.reload();
        },
      },
    ]),
  ],
});
