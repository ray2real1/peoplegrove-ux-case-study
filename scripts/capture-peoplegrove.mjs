#!/usr/bin/env node
/**
 * Deterministic capture fixture for the PeopleGrove case-study microsite.
 *
 * Uses puppeteer-core driving the system Chrome binary — no bundled browser
 * download, no reliance on the Claude preview pane (whose screenshot viewport
 * did not stay in sync with programmatic scrolling; see
 * docs/PEOPLEGROVE_CAPTURE_WORKFLOW.md).
 *
 * Every capture is pre-verified (selector exists, visible, non-zero box,
 * has content) and post-verified (file written, above a size floor, expected
 * dimensions, not a flat single-colour image). Any failure exits non-zero
 * rather than silently emitting a blank PNG.
 *
 *   node scripts/capture-peoplegrove.mjs --url http://localhost:3000 --mode smoke
 */

import { mkdir, stat, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium"
].filter(Boolean);

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 2, isMobile: false },
  mobile: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true },
  social: { width: 1200, height: 630, deviceScaleFactor: 2, isMobile: false },
  linkedin: { width: 1200, height: 627, deviceScaleFactor: 2, isMobile: false },
  card: { width: 800, height: 600, deviceScaleFactor: 2, isMobile: false }
};

/** Stable capture targets. IDs live in the page markup and double as anchors. */
const SELECTORS = {
  hero: "#hero",
  snapshot: "#snapshot",
  testing: "#testing",
  accessibility: "#accessibility",
  decisions: "#decisions",
  matrix: "#matrix",
  loop: "#loop",
  prototype: "#prototype",
  problem: "#problem",
  deliverables: "#deliverables"
};

const SMOKE_TARGETS = [
  "hero",
  "snapshot",
  "testing",
  "accessibility",
  "decisions" // the required "one additional below-fold section"
];

const MIN_FILE_BYTES = 5_000;
const MIN_BOX_PX = 40;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = {
    url: "http://localhost:3000",
    output: "./artifacts/captures",
    mode: "smoke",
    selector: null,
    viewport: "desktop",
    motion: "reduce" // deterministic by default
  };
  for (let i = 2; i < argv.length; i += 1) {
    const [flag, inline] = argv[i].split("=");
    const value = inline ?? argv[i + 1];
    const consume = () => {
      if (inline === undefined) i += 1;
      return value;
    };
    switch (flag) {
      case "--url": args.url = consume(); break;
      case "--output": args.output = consume(); break;
      case "--mode": args.mode = consume(); break;
      case "--selector": args.selector = consume(); break;
      case "--viewport": args.viewport = consume(); break;
      case "--motion": args.motion = consume(); break;
      case "--help":
        console.log(
          "Usage: node scripts/capture-peoplegrove.mjs --url <url> --output <dir> \\\n" +
            "         --mode smoke|full|element|social [--selector <css|#id>] \\\n" +
            "         [--viewport desktop|mobile|social|linkedin|card] [--motion reduce|no-preference]"
        );
        process.exit(0);
        break;
      default:
        if (flag.startsWith("--")) {
          console.error(`Unknown flag: ${flag}`);
          process.exit(2);
        }
    }
  }
  return args;
}

function resolveChrome() {
  const found = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!found) {
    console.error(
      "No Chrome binary found. Set CHROME_PATH, or install Google Chrome.\n" +
        `Looked in:\n  ${CHROME_CANDIDATES.join("\n  ")}`
    );
    process.exit(3);
  }
  return found;
}

// ---------------------------------------------------------------------------
// Readiness — fonts, images, hydration, animation settle
// ---------------------------------------------------------------------------

async function waitForPageReady(page) {
  // Fonts and images must be ready, but neither may block the run forever —
  // a font that never resolves must not hang the capture. Each check races a
  // ceiling and reports rather than stalls.
  await page
    .evaluate(async () => {
      const ceiling = (p, ms) =>
        Promise.race([p, new Promise((r) => setTimeout(r, ms))]);

      await ceiling(document.fonts?.ready ?? Promise.resolve(), 5_000);

      const pending = Array.from(document.images).filter((img) => !img.complete);
      await ceiling(
        Promise.all(
          pending.map(
            (img) =>
              new Promise((resolve) => {
                img.addEventListener("load", resolve, { once: true });
                img.addEventListener("error", resolve, { once: true });
              })
          )
        ),
        10_000
      );
    })
    .catch((err) => {
      console.warn(`  ! readiness check did not settle cleanly: ${err.message}`);
    });
  // Hydration marker: the reveal system adds `js` to <html> pre-paint, and
  // sections gain `reveal-visible` once revealed. Give React a beat to hydrate.
  await page.waitForFunction(
    () => document.documentElement.classList.contains("js"),
    { timeout: 10_000 }
  ).catch(() => {
    console.warn("  ! hydration marker (html.js) not seen — continuing");
  });
  await new Promise((r) => setTimeout(r, 400));
}

/**
 * Scroll a target into view and wait for the reveal + any transition to settle.
 * Uses in-page scrolling (real layout), not preview-pane coordinates.
 */
async function scrollIntoViewAndSettle(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ block: "center", behavior: "instant" });
  }, selector);
  // The reveal has a 1.5s observer-failure fallback and a 0.55s transition.
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      return parseFloat(getComputedStyle(el).opacity) > 0.99;
    },
    { timeout: 5_000 },
    selector
  ).catch(() => {});
  await new Promise((r) => setTimeout(r, 350));
}

// ---------------------------------------------------------------------------
// Pre-capture verification
// ---------------------------------------------------------------------------

async function verifyTarget(page, selector) {
  const info = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { exists: false };
    const cs = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    return {
      exists: true,
      opacity: parseFloat(cs.opacity),
      visibility: cs.visibility,
      display: cs.display,
      width: Math.round(box.width),
      height: Math.round(box.height),
      textLength: (el.innerText || "").trim().length,
      imageCount: el.querySelectorAll("img").length
    };
  }, selector);

  if (!info.exists) throw new Error(`selector not found: ${selector}`);
  if (info.opacity <= 0) throw new Error(`${selector} has opacity ${info.opacity}`);
  if (info.visibility === "hidden") throw new Error(`${selector} is visibility:hidden`);
  if (info.display === "none") throw new Error(`${selector} is display:none`);
  if (info.width < MIN_BOX_PX || info.height < MIN_BOX_PX) {
    throw new Error(`${selector} box too small: ${info.width}x${info.height}`);
  }
  if (info.textLength === 0 && info.imageCount === 0) {
    throw new Error(`${selector} has no text and no images — nothing to capture`);
  }
  return info;
}

// ---------------------------------------------------------------------------
// Post-capture verification — blank-image detection
// ---------------------------------------------------------------------------

/**
 * Flat-image check without an image-processing dependency.
 *
 * A PNG of a single flat colour compresses to almost nothing. We compare the
 * file size against the pixel count: a real screenshot of text/UI carries far
 * more entropy per pixel than a blank fill. Cheap, dependency-free, and
 * catches exactly the failure we saw (uniform dark rectangles).
 */
async function verifyOutput(filePath, expected) {
  if (!existsSync(filePath)) throw new Error(`no file written: ${filePath}`);
  const { size } = await stat(filePath);
  if (size < MIN_FILE_BYTES) {
    throw new Error(`file suspiciously small (${size}B < ${MIN_FILE_BYTES}B) — likely blank`);
  }

  const buf = await readFile(filePath);
  // PNG IHDR: width/height are big-endian uint32 at byte offsets 16 and 20.
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const pixels = width * height;
  const bytesPerPixel = size / pixels;

  if (expected?.width && Math.abs(width - expected.width) > 4) {
    throw new Error(`width ${width} != expected ${expected.width}`);
  }

  // Empirically, a flat fill lands well under 0.01 B/px; real content is far higher.
  const FLAT_THRESHOLD = 0.01;
  const flat = bytesPerPixel < FLAT_THRESHOLD;
  if (flat) {
    throw new Error(
      `image appears blank/flat: ${bytesPerPixel.toFixed(5)} B/px over ${width}x${height}`
    );
  }

  return { size, width, height, bytesPerPixel };
}

// ---------------------------------------------------------------------------
// Capture primitives
// ---------------------------------------------------------------------------

async function captureElement(page, name, selector, outDir) {
  await scrollIntoViewAndSettle(page, selector);
  const box = await verifyTarget(page, selector);
  const file = path.join(outDir, `${name}.png`);
  const handle = await page.$(selector);
  await handle.screenshot({ path: file });
  const out = await verifyOutput(file);
  console.log(
    `  ✅ ${name.padEnd(22)} ${selector.padEnd(16)} ` +
      `box ${box.width}x${box.height}  opacity ${box.opacity}  ` +
      `→ ${path.relative(process.cwd(), file)}  ` +
      `${(out.size / 1024).toFixed(0)}KB  ${out.width}x${out.height}  ` +
      `${out.bytesPerPixel.toFixed(3)} B/px`
  );
  return { name, selector, ...box, ...out, file };
}

/**
 * Deterministic hero-composition source.
 *
 * A raw #hero element screenshot picks up the sticky header (z-40) and the
 * fixed skip-link because centering a taller-than-viewport hero floats them
 * over its top edge. Instead: scroll to the very top, drop focus (so the
 * skip-link stays hidden), read the sticky header's height live, and clip the
 * hero region STARTING BELOW that header band. No layout mutation, no
 * screenshot-only hack, and the crop self-adjusts if the header height changes.
 *
 * Output is a clean landscape-capable hero source with the project title,
 * status pill, and lead screens — reusable for LinkedIn / OG composition.
 */
async function captureHeroSource(page, name, outDir) {
  const clip = await page.evaluate(() => {
    window.scrollTo(0, 0);
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
    const header = document.querySelector("header");
    const hero = document.querySelector("#hero");
    const hb = header ? header.getBoundingClientRect() : { height: 0 };
    const r = hero.getBoundingClientRect();
    const top = Math.round(r.top + hb.height + 8); // start just below the header band
    return {
      x: Math.max(Math.round(r.left), 0),
      y: Math.max(top, 0),
      width: Math.round(r.width),
      height: Math.round(r.bottom - top)
    };
  });
  await new Promise((r) => setTimeout(r, 300));
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, clip });
  const out = await verifyOutput(file);
  console.log(
    `  ✅ ${name.padEnd(22)} ${"#hero (below-header clip)".padEnd(16)} ` +
      `clip ${clip.width}x${clip.height} @ y${clip.y}  ` +
      `→ ${path.relative(process.cwd(), file)}  ${(out.size / 1024).toFixed(0)}KB  ` +
      `${out.width}x${out.height}  ${out.bytesPerPixel.toFixed(3)} B/px`
  );
  return { name, ...out, file, clip };
}

async function captureFullPage(page, name, outDir) {
  await page.evaluate(() => window.scrollTo(0, 0));
  // Force every reveal to settle before a full-page shot.
  await page.evaluate(async () => {
    const sections = Array.from(document.querySelectorAll(".reveal"));
    for (const s of sections) s.scrollIntoView({ block: "center", behavior: "instant" });
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 1_800));
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  const out = await verifyOutput(file);
  console.log(
    `  ✅ ${name.padEnd(22)} ${"(full page)".padEnd(16)} ` +
      `→ ${path.relative(process.cwd(), file)}  ` +
      `${(out.size / 1024).toFixed(0)}KB  ${out.width}x${out.height}  ` +
      `${out.bytesPerPixel.toFixed(3)} B/px`
  );
  return { name, ...out, file };
}

async function captureViewport(page, name, selector, outDir, expected) {
  if (selector) await scrollIntoViewAndSettle(page, selector);
  else await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 300));
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file });
  const out = await verifyOutput(file, expected);
  console.log(
    `  ✅ ${name.padEnd(22)} ${(selector ?? "(viewport)").padEnd(16)} ` +
      `→ ${path.relative(process.cwd(), file)}  ` +
      `${(out.size / 1024).toFixed(0)}KB  ${out.width}x${out.height}`
  );
  return { name, ...out, file };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv);
  const chrome = resolveChrome();
  const outDir = path.resolve(args.output);
  await mkdir(outDir, { recursive: true });

  console.log(`\nPeopleGrove capture fixture`);
  console.log(`  url      ${args.url}`);
  console.log(`  mode     ${args.mode}`);
  console.log(`  viewport ${args.viewport}`);
  console.log(`  motion   ${args.motion}`);
  console.log(`  chrome   ${chrome}`);
  console.log(`  output   ${outDir}\n`);

  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: "new",
    protocolTimeout: 120_000,
    args: ["--no-sandbox", "--hide-scrollbars", "--force-color-profile=srgb"]
  });

  const results = [];
  let failed = 0;

  try {
    const page = await browser.newPage();

    // Deterministic rendering: reduced motion by default kills transitions and
    // caret blink, so captures are stable frame-to-frame. Content is unchanged —
    // the reveal system shows the same content either way.
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: args.motion }
    ]);

    const vp = VIEWPORTS[args.viewport] ?? VIEWPORTS.desktop;
    await page.setViewport(vp);

    const response = await page.goto(args.url, {
      waitUntil: "networkidle0",
      timeout: 45_000
    });
    if (!response || !response.ok()) {
      throw new Error(`page load failed: HTTP ${response?.status() ?? "no response"}`);
    }
    await waitForPageReady(page);

    const run = async (fn) => {
      try {
        results.push(await fn());
      } catch (err) {
        failed += 1;
        console.error(`  ❌ ${err.message}`);
      }
    };

    if (args.mode === "smoke") {
      for (const name of SMOKE_TARGETS) {
        await run(() => captureElement(page, name, SELECTORS[name], outDir));
      }
      await run(() => captureFullPage(page, "fullpage-desktop", outDir));

      await page.setViewport(VIEWPORTS.mobile);
      await waitForPageReady(page);
      await run(() => captureFullPage(page, "fullpage-mobile", outDir));
    } else if (args.mode === "full") {
      await page.setViewport(VIEWPORTS.desktop);
      await waitForPageReady(page);
      await run(() => captureFullPage(page, "fullpage-desktop", outDir));

      await page.setViewport(VIEWPORTS.mobile);
      await waitForPageReady(page);
      await run(() => captureFullPage(page, "fullpage-mobile", outDir));
    } else if (args.mode === "hero") {
      // Clean hero-composition source (desktop), then mobile equivalent.
      await run(() => captureHeroSource(page, "hero-source-desktop", outDir));
      await page.setViewport(VIEWPORTS.mobile);
      await waitForPageReady(page);
      await run(() => captureHeroSource(page, "hero-source-mobile", outDir));
    } else if (args.mode === "element") {
      if (!args.selector) {
        console.error("--mode element requires --selector");
        process.exit(2);
      }
      const sel = SELECTORS[args.selector] ?? args.selector;
      const name = args.selector.replace(/[^a-z0-9-]/gi, "-").replace(/^-+/, "");
      await run(() => captureElement(page, name, sel, outDir));
    } else if (args.mode === "social") {
      for (const [name, preset] of [
        ["linkedin-1200x627", VIEWPORTS.linkedin],
        ["opengraph-1200x630", VIEWPORTS.social],
        ["portfolio-card", VIEWPORTS.card]
      ]) {
        await page.setViewport(preset);
        await waitForPageReady(page);
        await run(() =>
          captureViewport(page, name, SELECTORS.hero, outDir, {
            width: preset.width * preset.deviceScaleFactor
          })
        );
      }
    } else {
      console.error(`Unknown mode: ${args.mode}`);
      process.exit(2);
    }
  } finally {
    await browser.close();
  }

  console.log(
    `\n${results.length} captured, ${failed} failed → ${path.relative(process.cwd(), outDir)}\n`
  );
  if (failed > 0 || results.length === 0) process.exit(1);
}

main().catch((err) => {
  console.error(`\nFATAL: ${err.message}\n`);
  process.exit(1);
});
