/**
 * Builds the self-contained web bundle the Dominia mobile app ships
 * (capacitor.config.ts webDir). The web build serves index.html through the
 * game server, which fills in its EJS placeholders per request; the app has
 * no server of its own, so this renders the page once and copies the result
 * next to the assets.
 *
 * Run after `npm run build-prod`: tsx scripts/build-app.ts
 *   DOMINIA_SERVER=play.example.com  private lobbies on that Dominia server
 *   (unset)                          solo only
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..");
const staticDir = path.join(root, "static");
const outDir = path.join(root, "app-www");

// The Dominia server the app plays private lobbies on (host[:port], served
// over TLS), and its NUM_WORKERS. Without it the app is solo-only.
// GitHub Actions passes an unset repository variable as "".
const nonEmpty = (v: string | undefined) =>
  v === undefined || v === "" ? undefined : v;
const server = nonEmpty(process.env.DOMINIA_SERVER);
const serverWorkers = nonEmpty(process.env.DOMINIA_SERVER_WORKERS) ?? "2";

process.env.GAME_ENV ??= "prod";
// The OpenFront API is never reachable (src/client/Features.ts), so these
// only have to be present, not real.
process.env.DOMAIN ??= server ?? "dominia.invalid";
process.env.TURNSTILE_SITE_KEY ??= "none";
// A game server only admits clients built from its own commit (the
// simulation must match bit for bit), so the app carries the commit it was
// built from: deploy the server from that same commit.
process.env.GIT_COMMIT ??= execSync("git rev-parse HEAD").toString().trim();
if (server !== undefined) {
  // Rendered as that server's own page would be (RenderHtml perServer): its
  // one-entry cluster map, with serverHost pinning sockets and /api to it and
  // siteHost making invite links point at its web page.
  process.env.GAME_HOST = server;
  process.env.SITE_HOST = server;
  process.env.INSTANCE_LETTER = "a";
  process.env.NUM_WORKERS = serverWorkers;
}

if (!fs.existsSync(path.join(staticDir, "index.html"))) {
  throw new Error("static/index.html missing: run `npm run build-prod` first");
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.cpSync(staticDir, outDir, { recursive: true });
// Imported after the env is set: ServerEnv reads GAME_ENV when it loads.
const { renderHtmlContent } = await import("../src/server/RenderHtml");
const html = await renderHtmlContent(path.join(staticDir, "index.html"), {
  perServer: server !== undefined,
});
fs.writeFileSync(path.join(outDir, "index.html"), html);
console.log(
  `App bundle written to ${path.relative(root, outDir)}/ (${
    server === undefined ? "solo only" : `server ${server}`
  })`,
);
