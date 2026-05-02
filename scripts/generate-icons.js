// Generates all app icon assets from CrabVector.svg + construction paper wave PNGs.
// Run with: node scripts/generate-icons.js

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ASSETS = path.join(__dirname, "..", "assets");
const SIZE = 1024;

// Wave images are 1160×1200 RGBA. Scale to icon width.
const WAVE_SCALE = SIZE / 1160;
const WAVE_W = SIZE;
const WAVE_H = Math.round(1200 * WAVE_SCALE); // ~1060px
// Torn paper edge is ~32% from top of the original 1200px image.
const TORN_EDGE_Y = Math.round(384 * WAVE_SCALE); // ~338px into scaled image

// Sky background color (matches the light space above the waves in the app)
const SKY = { r: 222, g: 241, b: 252, alpha: 1 };

// Where each wave layer's torn edge should land on the 1024 icon canvas.
const WAVE_LAYERS = [
    { file: "LightBlueWave.png", tornAt: 420 },
    { file: "LightBlue.png",     tornAt: 520 },
    { file: "BlueWave.png",      tornAt: 620 },
    { file: "DarkBlue.png",      tornAt: 720 },
    { file: "Sand.png",          tornAt: 820 },
];

async function buildBackground() {
    const composites = [];
    for (const layer of WAVE_LAYERS) {
        const top = layer.tornAt - TORN_EDGE_Y;
        const visibleTop    = Math.max(0, top);
        const visibleBottom = Math.min(SIZE, top + WAVE_H);
        const cropTop    = Math.max(0, -top);
        const cropHeight = visibleBottom - visibleTop;
        if (cropHeight <= 0) continue;

        const input = await sharp(path.join(ASSETS, layer.file))
            .resize(WAVE_W, WAVE_H, { fit: "fill" })
            .extract({ left: 0, top: cropTop, width: WAVE_W, height: cropHeight })
            .toBuffer();
        composites.push({ input, top: visibleTop, left: 0 });
    }
    return sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: SKY } })
        .composite(composites)
        .png()
        .toBuffer();
}

function crabSvg(w, h, mono = false) {
    let svg = fs.readFileSync(path.join(ASSETS, "CrabVector.svg"), "utf8");
    svg = svg
        .replace('width="100%"', `width="${w}"`)
        .replace('height="100%"', `height="${h}"`);
    if (mono) {
        svg = svg.replace(/fill:rgb\([^)]+\);/g, "fill:white;");
    }
    return Buffer.from(svg);
}

async function crabBuffer(w, mono = false) {
    const h = Math.round(w * (1828 / 2430));
    return { buf: await sharp(crabSvg(w, h, mono)).png().toBuffer(), w, h };
}

async function main() {
    console.log("Generating icon assets…");

    const bgBuf = await buildBackground();

    // ── icon.png ────────────────────────────────────────────────────────────
    // Full composition: wave background + crab centered, sitting at the horizon.
    const { buf: crab1024, w: cW, h: cH } = await crabBuffer(Math.round(SIZE * 0.75));
    const crabLeft = Math.round((SIZE - cW) / 2);
    const crabTop  = Math.round(SIZE / 2 - cH / 2 - SIZE * 0.04); // slightly above center

    await sharp(bgBuf)
        .composite([{ input: crab1024, top: crabTop, left: crabLeft }])
        .png()
        .toFile(path.join(ASSETS, "icon.png"));
    console.log("✓ icon.png");

    // ── android-icon-background.png ─────────────────────────────────────────
    await sharp(bgBuf)
        .toFile(path.join(ASSETS, "android-icon-background.png"));
    console.log("✓ android-icon-background.png");

    // ── android-icon-foreground.png ─────────────────────────────────────────
    // Crab on transparent, sized to stay within the 66% adaptive-icon safe zone.
    const { buf: crabFg, w: fgW, h: fgH } = await crabBuffer(Math.round(SIZE * 0.58));
    const fgLeft = Math.round((SIZE - fgW) / 2);
    const fgTop  = Math.round((SIZE - fgH) / 2);

    await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: crabFg, top: fgTop, left: fgLeft }])
        .png()
        .toFile(path.join(ASSETS, "android-icon-foreground.png"));
    console.log("✓ android-icon-foreground.png");

    // ── android-icon-monochrome.png ─────────────────────────────────────────
    const { buf: crabMono } = await crabBuffer(Math.round(SIZE * 0.58), true);

    await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: crabMono, top: fgTop, left: fgLeft }])
        .png()
        .toFile(path.join(ASSETS, "android-icon-monochrome.png"));
    console.log("✓ android-icon-monochrome.png");

    // ── favicon.png (48×48) ─────────────────────────────────────────────────
    // Waves are too small at 48px; use a solid ocean blue background instead.
    const { buf: crabFav, w: favW, h: favH } = await crabBuffer(36);

    await sharp({ create: { width: 48, height: 48, channels: 4, background: { r: 30, g: 120, b: 185, alpha: 1 } } })
        .composite([{
            input: crabFav,
            top:  Math.round((48 - favH) / 2),
            left: Math.round((48 - favW) / 2),
        }])
        .png()
        .toFile(path.join(ASSETS, "favicon.png"));
    console.log("✓ favicon.png");

    // ── splash-icon.png (1024×1024) ─────────────────────────────────────────
    // Crab on transparent — Expo centers it on the splash backgroundColor (#fff).
    const { buf: crabSplash, w: spW, h: spH } = await crabBuffer(Math.round(SIZE * 0.72));

    await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{
            input: crabSplash,
            top:  Math.round((SIZE - spH) / 2),
            left: Math.round((SIZE - spW) / 2),
        }])
        .png()
        .toFile(path.join(ASSETS, "splash-icon.png"));
    console.log("✓ splash-icon.png");

    console.log("\nAll icon assets generated.");
}

main().catch(err => { console.error(err); process.exit(1); });
