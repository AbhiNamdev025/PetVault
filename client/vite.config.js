import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "hide-public-asset-warnings",
      enforce: "pre",
      apply: "serve",
      configResolved() {
        const originalWarn = console.warn;
        console.warn = (msg, ...args) => {
          if (
            typeof msg === "string" &&
            (msg.includes("Assets in public directory cannot be imported") ||
              msg.includes(
                "Files in the public directory are served at the root path"
              ))
          ) {
            return;
          }
          originalWarn(msg, ...args);
        };
      },
    },
  ],
});
