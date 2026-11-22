const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Exact color constants visible in the creator's bouquet.js
const GOLDS        = ["#fff79a", "#ffe875", "#ffd54f", "#ffca28"];
const CYANS        = ["#80deea", "#4dd0e1", "#26c6da", "#b2ebf2"];
const PINKS        = ["#f8bbd0", "#f48fb1", "#ff80ab", "#fce4ec"];
const GREENS       = ["#a5d6a7", "#81c784", "#66bb6a", "#80cbc4"];
const WHITES       = ["#ffffff", "#e2e8f0", "#94a3b8", "#64748b"];
const HEART_COLORS = [...PINKS, "#ffffff"];

const BIG_HEART = [
  " /\\ /\\ ",
  "(  V  )",
  " \\   / ",
  "  \\ /  ",
  "   V   "
];

const MID_HEART = [
  "/\\/\\",
  "\\  /",
  " \\/ "
];

const MINI_HEART = ["<3"];
const BURST = ["+", "*", "·", "✦"];

let width = 0;
let height = 0;
const dpr = Math.min(window.devicePixelRatio || 1, 2);

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

const rand = (min, max) => min + Math.random() * (max - min);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Scene nodes built from 3D parametric curves (matching buildScene() in video)
let sceneNodes = [];

function buildScene() {
  sceneNodes = [];

  function pushNode(x, y, z, char, palette, rank, swayAmp = 1.6) {
    sceneNodes.push({
      x,
      y,
      z,
      char,
      color: pick(palette),
      palette,
      rank,
      swayAmp,
      phase: rand(0, Math.PI * 2),
      freq: rand(0.025, 0.05)
    });
  }

  // 1. Central Ribbon Knot & Lower Wrapper Cone (y: +15 to +95)
  for (let i = 0; i < 420; i++) {
    const t = Math.random(); // 0 = knot, 1 = wide upper rim
    const y = 88 - t * 145;
    // Curved cone silhouette with organic tissue folds
    const baseRadius = 6 + Math.pow(t, 0.82) * 112;
    const angle = rand(-Math.PI, 0); // front-facing half-cone
    const fold = Math.sin(angle * 7 + t * 4) * (6 * t);
    const r = baseRadius + fold;

    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r * 0.45;

    // Horizontal scanline / crease shading like the video
    let char = "-";
    let palette = WHITES;
    const edgeFactor = Math.abs(Math.cos(angle));

    if (edgeFactor > 0.93) {
      char = x < 0 ? "\\" : "/";
      palette = WHITES;
    } else if (Math.sin(angle * 7) > 0.65) {
      char = ":";
      palette = CYANS;
    } else if (t > 0.85) {
      char = "~";
      palette = WHITES;
    } else {
      char = Math.random() < 0.55 ? "-" : "=";
      palette = Math.random() < 0.7 ? WHITES : CYANS;
    }

    pushNode(x, y, z, char, palette, t * 55 + rand(0, 8), 0.9 + t * 1.2);
  }

  // 2. Ruffled Tissue Paper Wings behind the blooms (top & sides)
  for (let i = 0; i < 240; i++) {
    const u = rand(-1, 1);
    const v = rand(0, 1);
    const x = u * (135 + Math.sin(v * Math.PI) * 35);
    const y = -55 - v * 95 + Math.abs(u) * 28 + Math.sin(u * 9) * 8;
    const z = -25 - v * 20;
    const char = v > 0.82 ? "^" : Math.random() < 0.5 ? ":" : ".";
    pushNode(x, y, z, char, WHITES, 42 + v * 25 + Math.abs(u) * 10, 1.8);
  }

  // 3. Stems & Greenery Foliage radiating into the blooms
  for (let i = 0; i < 180; i++) {
    const t = Math.random();
    const spread = rand(-1.05, 1.05);
    const x = spread * (15 + t * 115);
    const y = 75 - t * 185;
    const z = rand(-10, 15);
    const char = Math.abs(spread) > 0.75 ? pick(["/", "\\", "~", "*"]) : "|";
    pushNode(x, y, z, char, GREENS, 25 + t * 45, 1.4);
  }

  // 4. Parametric 3D Rose & Flower Blooms (layered polar rose curves)
  const blooms = [
    { cx: 0,    cy: -135, rx: 36, ry: 26, petals: 5, palette: GOLDS, delay: 72 },
    { cx: -52,  cy: -115, rx: 33, ry: 24, petals: 5, palette: CYANS, delay: 66 },
    { cx: 52,   cy: -115, rx: 33, ry: 24, petals: 5, palette: PINKS, delay: 66 },
    { cx: -98,  cy: -75,  rx: 32, ry: 23, petals: 6, palette: GOLDS, delay: 60 },
    { cx: 98,   cy: -75,  rx: 32, ry: 23, petals: 6, palette: CYANS, delay: 60 },
    { cx: -32,  cy: -78,  rx: 34, ry: 24, petals: 5, palette: PINKS, delay: 64 },
    { cx: 32,   cy: -78,  rx: 34, ry: 24, petals: 5, palette: GOLDS, delay: 64 },
    { cx: 0,    cy: -42,  rx: 30, ry: 21, petals: 5, palette: CYANS, delay: 56 },
    { cx: -68,  cy: -40,  rx: 28, ry: 20, petals: 5, palette: PINKS, delay: 58 },
    { cx: 68,   cy: -40,  rx: 28, ry: 20, petals: 5, palette: GOLDS, delay: 58 },
    { cx: -26,  cy: -158, rx: 25, ry: 18, petals: 4, palette: PINKS, delay: 78 },
    { cx: 26,   cy: -158, rx: 25, ry: 18, petals: 4, palette: CYANS, delay: 78 }
  ];

  blooms.forEach((b) => {
    // Draw 3 concentric petal rings per flower using polar rose math
    for (let ring = 0.25; ring <= 1.0; ring += 0.25) {
      const steps = Math.floor(26 * ring) + 10;
      for (let s = 0; s < steps; s++) {
        const theta = (s / steps) * Math.PI * 2 + ring;
        // Polar rose curve modulation creates sculpted overlapping petals
        const lobe = 0.72 + 0.28 * Math.cos(b.petals * theta + ring * 2);
        const px = b.cx + Math.cos(theta) * b.rx * ring * lobe;
        const py = b.cy + Math.sin(theta) * b.ry * ring * lobe;
        const pz = 20 + (1 - ring) * 18;

        let char;
        if (ring <= 0.3) char = "@";
        else if (ring <= 0.55) char = Math.cos(theta) < 0 ? "(" : ")";
        else if (ring <= 0.8) char = "=";
        else char = "*";

        pushNode(px, py, pz, char, b.palette, b.delay + ring * 12, 2.1);
      }
    }
  });

  // 5. Fluffy Cute Bear / Mascot Holding the Knot at the Bottom
  const mascot = [
    "    . - ~ - .    ",
    "  (  /\\ _ /\\  )  ",
    " (  (  o . o  )  )",
    "  (  \\  <3  /  )  ",
    "    ' - _ - '    "
  ];

  mascot.forEach((line, r) => {
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === " ") continue;
      const mx = (c - line.length / 2) * 7.5;
      const my = 108 + r * 13;
      const isHeart = ch === "<" || ch === "3";
      pushNode(mx, my, 15, ch, isHeart ? PINKS : WHITES, 12 + r * 3, 0.5);
    }
  });

  // 6. Bottom Message
  const msg = "A little something for ya :3";
  for (let i = 0; i < msg.length; i++) {
    if (msg[i] === " ") continue;
    const tx = (i - msg.length / 2) * 7.5;
    const ty = 192;
    pushNode(tx, ty, 0, msg[i], WHITES, 88 + i * 0.7, 0.2);
  }
}

buildScene();

// Floating ASCII Hearts & Ambient Sparkles (matching Particle class in video)
const particles = [];

function spawnParticle() {
  const cx = width / 2;
  const cy = height / 2;
  const side = Math.random() < 0.5 ? -1 : 1;
  const roll = Math.random();

  let art = MINI_HEART;
  let colors = HEART_COLORS;
  let vy = rand(-0.45, -0.2);

  if (roll < 0.14) {
    art = BIG_HEART;
    colors = WHITES;
    vy = rand(-0.32, -0.15);
  } else if (roll < 0.30) {
    art = MID_HEART;
    colors = HEART_COLORS;
    vy = rand(-0.38, -0.18);
  } else if (roll >= 0.65) {
    art = [pick(BURST)];
    colors = [...GOLDS, ...CYANS, ...WHITES];
    vy = rand(-0.22, -0.05);
  }

  particles.push({
    x: cx + side * rand(130, Math.min(width * 0.44, 340)),
    y: cy + rand(-210, 200),
    art,
    color: pick(colors),
    vx: rand(-0.12, 0.12),
    vy,
    phase: rand(0, Math.PI * 2),
    life: rand(130, 240),
    maxLife: 240
  });
}

let frame = 0;

function animate() {
  ctx.fillStyle = "#020308";
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2 + 12;
  // Auto-scale smoothly on smaller phone screens or large monitors
  const scale = Math.min(width / 540, height / 520, 1.35);

  ctx.font = `bold ${Math.max(10, Math.round(13 * scale))}px "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Sort back-to-front by Z depth so petals overlap naturally
  sceneNodes.sort((a, b) => a.z - b.z);

  for (let i = 0; i < sceneNodes.length; i++) {
    const n = sceneNodes[i];
    if (frame < n.rank) continue;

    const age = frame - n.rank;
    const revealAlpha = Math.min(1, age / 20);

    // Gentle 3D sway & shimmer wave across the bouquet
    const swayX = Math.sin(frame * n.freq + n.phase) * n.swayAmp;
    const swayY = Math.cos(frame * n.freq * 0.8 + n.phase) * (n.swayAmp * 0.5);
    const wave = 0.75 + 0.25 * Math.sin(frame * 0.055 + n.y * 0.04 + n.x * 0.02);

    const sx = cx + (n.x + swayX) * scale;
    const sy = cy + (n.y + swayY) * scale;

    ctx.globalAlpha = revealAlpha * wave;
    ctx.fillStyle = n.color;
    ctx.fillText(n.char, sx, sy);
  }

  // Spawn & animate surrounding ASCII hearts
  if (particles.length < 34 && Math.random() < 0.18) {
    spawnParticle();
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx + Math.sin(p.phase) * 0.16;
    p.y += p.vy;
    p.phase += 0.03;
    p.life--;

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    const fade = Math.min(1, p.life / 40) * Math.min(1, (p.maxLife - p.life) / 25);
    ctx.globalAlpha = Math.max(0, fade * 0.9);
    ctx.fillStyle = p.color;

    for (let r = 0; r < p.art.length; r++) {
      ctx.fillText(p.art[r], p.x, p.y + r * (13 * scale));
    }
  }

  ctx.globalAlpha = 1;
  frame++;
  requestAnimationFrame(animate);
}

animate();
