import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "..");
const outputDir = path.join(projectDir, "work", "render");
const url = `file://${path.join(projectDir, "prototype", "index.html")}?render=1`;
const moments = [2, 10, 22, 35, 50, 63, 74, 83, 88];
const browserExecutable = process.env.CHROME_PATH || (process.platform === "darwin"
  ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  : undefined);

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: browserExecutable });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);

for (const second of moments) {
  await page.evaluate((time) => window.setDemoTime(time), second);
  await page.screenshot({ path: path.join(outputDir, `scene-${String(second).padStart(2, "0")}.png`) });
}

await browser.close();
process.stdout.write(`Rendered ${moments.length} stills to ${outputDir}\n`);
