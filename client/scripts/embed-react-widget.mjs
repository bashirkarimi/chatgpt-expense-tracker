import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUILD_DIR = path.join(__dirname, "..", "build");
const SERVER_DIR = path.join(__dirname, "..", "..", "server");
const TARGET_FILE = path.join(SERVER_DIR, "expense-widget.html");

const readManifest = async () => {
  const manifestPath = path.join(BUILD_DIR, "asset-manifest.json");
  const raw = await readFile(manifestPath, "utf8");
  return JSON.parse(raw);
};

const normalizeAssetPath = (assetPath) => assetPath.replace(/^\//, "");

const collectAssets = (manifest) => {
  const cssAssets = new Set();
  const jsAssets = new Set();

  const entrypoints = manifest.entrypoints ?? [];
  entrypoints.forEach((entry) => {
    if (entry.endsWith(".css")) cssAssets.add(entry);
    if (entry.endsWith(".js")) jsAssets.add(entry);
  });

  Object.values(manifest.files ?? {}).forEach((filePath) => {
    if (!filePath) return;
    if (!filePath.startsWith("/")) return;
    if (filePath.endsWith(".map")) return;
    if (filePath.endsWith(".css")) cssAssets.add(normalizeAssetPath(filePath));
    if (filePath.endsWith(".js")) jsAssets.add(normalizeAssetPath(filePath));
  });

  const jsAssetsOrdered = Array.from(jsAssets).sort((a, b) => {
    const isMainA = a.includes("main.");
    const isMainB = b.includes("main.");
    if (isMainA && !isMainB) return 1;
    if (!isMainA && isMainB) return -1;
    return a.localeCompare(b);
  });

  return {
    cssAssets: Array.from(cssAssets).map(normalizeAssetPath),
    jsAssets: jsAssetsOrdered.map(normalizeAssetPath),
  };
};

const inlineAssets = async () => {
  let html = await readFile(path.join(BUILD_DIR, "index.html"), "utf8");
  const manifest = await readManifest();
  const assets = collectAssets(manifest);

  html = html.replace(/<link[^>]+href="\/static\/css\/[^>]+>/g, "");
  html = html.replace(/<script[^>]+src="\/static\/js\/[^>]+><\/script>/g, "");

  const cssBlocks = await Promise.all(
    assets.cssAssets.map(async (asset) => {
      const content = await readFile(path.join(BUILD_DIR, asset), "utf8");
      return `<style>${content}</style>`;
    })
  );

  const jsBlocks = await Promise.all(
    assets.jsAssets.map(async (asset) => {
      const content = await readFile(path.join(BUILD_DIR, asset), "utf8");
      return `<script>${content}</script>`;
    })
  );

  html = html.replace("</head>", `${cssBlocks.join("")}</head>`);
  html = html.replace("</body>", `${jsBlocks.join("")}</body>`);

  await writeFile(TARGET_FILE, html, "utf8");
  console.log(`✓ Wrote React widget to ${TARGET_FILE}`);
};

inlineAssets().catch((error) => {
  console.error("Failed to embed React widget:", error);
  process.exitCode = 1;
});
