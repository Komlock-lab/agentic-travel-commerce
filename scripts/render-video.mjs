import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "..");
const outputDir = path.join(projectDir, "assets", "video");

const fps = Number(process.env.VIDEO_FPS || 24);
const speed = Number(process.env.VIDEO_SPEED || 1);
const duration = Number(process.env.VIDEO_DURATION || (90 / speed));
const width = Number(process.env.VIDEO_WIDTH || 1280);
const height = Number(process.env.VIDEO_HEIGHT || 720);
const outputSuffix = speed > 1 ? `-${Math.round(duration)}s` : "";
const outputFile = process.env.VIDEO_OUTPUT || path.join(outputDir, `agentic-travel-commerce-concept${outputSuffix}.mp4`);
const posterFile = process.env.VIDEO_POSTER || path.join(outputDir, `agentic-travel-commerce-poster${outputSuffix}.png`);
const baseUrl = process.env.PROTOTYPE_URL || `file://${path.join(projectDir, "prototype", "index.html")}?render=1`;
const browserExecutable = process.env.CHROME_PATH || (process.platform === "darwin"
  ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  : undefined);

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: browserExecutable });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.evaluate((exportSpeed) => window.setExportSpeed(exportSpeed), speed);

await page.evaluate(() => window.setDemoTime(88));
await page.screenshot({ path: posterFile, type: "png" });

const ffmpeg = spawn("ffmpeg", [
  "-y",
  "-f", "image2pipe",
  "-framerate", String(fps),
  "-vcodec", "png",
  "-i", "-",
  "-an",
  "-c:v", "libx264",
  "-preset", "medium",
  "-crf", "19",
  "-pix_fmt", "yuv420p",
  "-movflags", "+faststart",
  outputFile,
], { stdio: ["pipe", "inherit", "inherit"] });

const frameCount = Math.round(duration * fps);
for (let frame = 0; frame < frameCount; frame += 1) {
  const seconds = frame / fps;
  await page.evaluate((time) => window.setDemoTime(time), seconds * speed);
  const png = await page.screenshot({ type: "png" });
  if (!ffmpeg.stdin.write(png)) {
    await new Promise((resolve) => ffmpeg.stdin.once("drain", resolve));
  }
  if (frame % (fps * 5) === 0) {
    process.stdout.write(`Rendered ${seconds.toFixed(0)} / ${duration}s\n`);
  }
}

ffmpeg.stdin.end();
const exitCode = await new Promise((resolve) => ffmpeg.on("close", resolve));
await browser.close();

if (exitCode !== 0) {
  throw new Error(`ffmpeg exited with code ${exitCode}`);
}

process.stdout.write(`Video: ${outputFile}\nPoster: ${posterFile}\n`);
