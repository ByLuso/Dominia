/**
 * Builds the self-contained web bundle the Dominia mobile app ships
 * (capacitor.config.ts webDir). The web build serves index.html through the
 * game server, which fills in its EJS placeholders per request; the app has
 * no server, so this renders the page once with the environment-only values
 * (RenderHtml perServer: false) and copies the result next to the assets.
 *
 * Run after `npm run build-prod`: tsx scripts/build-app.ts
 */
import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..");
const staticDir = path.join(root, "static");
const outDir = path.join(root, "app-www");

process.env.GAME_ENV ??= "prod";
// No API is reachable in the solo build (src/client/Features.ts), so these
// only have to be present, not real.
process.env.DOMAIN ??= "dominia.invalid";
process.env.TURNSTILE_SITE_KEY ??= "none";
process.env.GIT_COMMIT ??= "app";

if (!fs.existsSync(path.join(staticDir, "index.html"))) {
  throw new Error("static/index.html missing: run `npm run build-prod` first");
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.cpSync(staticDir, outDir, { recursive: true });
// Imported after the env is set: ServerEnv reads GAME_ENV when it loads.
const { renderHtmlContent } = await import("../src/server/RenderHtml");
const html = await renderHtmlContent(path.join(staticDir, "index.html"), {
  perServer: false,
});
fs.writeFileSync(path.join(outDir, "index.html"), html);
console.log(`App bundle written to ${path.relative(root, outDir)}/`);
