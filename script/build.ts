import esbuild from "esbuild";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

async function build() {
  // Build frontend
  console.log("Building frontend...");
  execSync("npx vite build", { stdio: "inherit" });

  // Build backend
  console.log("Building backend...");
  await esbuild.build({
    entryPoints: ["server/index.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: "dist/index.js",
    external: [
      "better-sqlite3",
      "pg",
      "ws",
      "express",
      "vite",
      "path",
      "fs",
      "url",
      "http",
      "https",
      "@babel/core",
      "lightningcss"
    ],
    sourcemap: true,
    mainFields: ["module", "main"],
    banner: {
      js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
    },
  });
  console.log("Build complete.");
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
