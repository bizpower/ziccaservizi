import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Configurazione indipendente (sostituisce @lovable.dev/vite-tanstack-config).
// L'entry SSR è src/server.ts (wrapper con pagina di errore brandizzata).
// Il preset di deploy lo rileva Nitro dall'ambiente di build
// (su Vercel -> output Build Output API in .vercel/output; in locale -> node-server).
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
    }),
    nitro(),
    viteReact(),
  ],
});
