const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const GOLDS        = ["#fff79a", "#ffe875", "#ffd54f", "#ffca28"];
const CYANS        = ["#80deea", "#4dd0e1", "#26c6da", "#b2ebf2"];
const PINKS        = ["#f8bbd0", "#f48fb1", "#ff80ab", "#fce4ec"];
const GREENS       = ["#a5d6a7", "#81c784", "#66bb6a", "#80cbc4"];
const WHITES       = ["#ffffff", "#e2e8f0", "#cbd5e1", "#94a3b8"];
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
const smoothstep = (e0, e1, x) => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

let bouquetPoints = [];
let staticOverlay = [];

function buildScene() {
  bouquetPoints = [];
  staticOverlay = [];

  function add3D(x, y, z, char, palette, rank, origin = null) {
    bouquetPoints.push({
      x,
      y,
      z,
      ox: origin ? origin.x : x * 0.12,
      oy: origin ? origin.y : Math.min(82, y + 30),
      oz: origin ? origin.z : z * 0.12,
      isBloom: Boolean(origin),
      char,
      color: pick(palette),
      rank
    });
  }

  const KNOT = { x: 0, y: 84, z: 0 };

  // 1. Asymmetrical, Organic Flower Arrangement
  const flowers = [
    { x: -10, y: -156, z: 12,  r: 28, palette: GOLDS, delay: 52 },
    { x: 35,  y: -144, z: -18, r: 26, palette: PINKS, delay: 55 },
    { x: -56, y: -126, z: -22, r: 27, palette: CYANS, delay: 50 },
    { x: 18,  y: -118, z: 48,  r: 28, palette: CYANS, delay: 48 },
    { x: 72,  y: -105, z: 24,  r: 25, palette: GOLDS, delay: 50 },
    { x: -38, y: -103, z: 44,  r: 26, palette: PINKS, delay: 48 },
    { x: -90, y: -86,  z: 16,  r: 24, palette: GOLDS, delay: 45 },
    { x: 4,   y: -96,  z: -56, r: 27, palette: GOLDS, delay: 48 },
    { x: 92,  y: -78,  z: -26, r: 24, palette: CYANS, delay: 44 },
    { x: -60, y: -76,  z: -58, r: 25, palette: PINKS, delay: 45 },
    { x: 45,  y: -72,  z: -62, r: 23, palette: PINKS, delay: 45 },
    { x: -16, y: -70,  z: 74,  r: 24, palette: GOLDS, delay: 42 },
    { x: 50,  y: -66,  z: 66,  r: 22, palette: PINKS, delay: 42 },
    { x: -68, y: -62,  z: 56,  r: 22, palette: CYANS, delay: 40 }
  ];

  // 2. Continuous Curved Green Stems Connecting the Knot Directly Into Every Flower
  flowers.forEach((f) => {
    const steps = 42;
    const bendX = f.x * 0.12;
    const bendZ = f.z * 0.12;

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const inv = 1 - t;
      const sx = inv * inv * KNOT.x + 2 * inv * t * bendX + t * t * f.x;
      const sy = inv * inv * KNOT.y + 2 * inv * t * ((KNOT.y + f.y) * 0.5) + t * t * (f.y + 4);
      const sz = inv * inv * KNOT.z + 2 * inv * t * bendZ + t * t * f.z;

      const char = Math.abs(f.x) > 42 && t > 0.4 ? (f.x < 0 ? "\\" : "/") : "|";
      add3D(sx, sy, sz, char, GREENS, 8 + t * 34);

      if (s === 26 || s === 33) {
        const dir = s === 26 ? -1 : 1;
        add3D(sx + dir * 6, sy - 2, sz + 2, dir < 0 ? "~" : "*", GREENS, 24 + t * 20);
      }
    }

    // 3. Smooth 3D Spherical Roses that Bloom Outward From Each Flower's Center
    const stepsRose = 88;
    for (let i = 0; i < stepsRose; i++) {
      const frac = i / stepsRose;
      const phi = Math.acos(1 - frac * 0.86);
      const theta = i * 2.39996 + f.x * 0.1;
      const petalWave = 0.8 + 0.2 * Math.cos(theta * 5);
      const rad = f.r * petalWave;

      const lx = Math.sin(phi) * Math.cos(theta) * rad;
      const lz = Math.sin(phi) * Math.sin(theta) * rad;
      const ly = -Math.cos(phi) * (f.r * 0.64);

      let char;
      if (frac < 0.2) char = "@";
      else if (frac < 0.5) char = i % 2 === 0 ? "(" : ")";
      else if (frac < 0.78) char = "=";
      else char = "*";

      add3D(
        f.x + lx,
        f.y + ly,
        f.z + lz,
        char,
        f.palette,
        f.delay + frac * 14,
        { x: f.x, y: f.y, z: f.z }
      );
    }
  });

  // 4. Baby's Breath ("babies") Accent Sprigs
  for (let b = 0; b < 18; b++) {
    const angle = rand(0, Math.PI * 2);
    const dist = rand(25, 88);
    const bx = Math.cos(angle) * dist;
    const bz = Math.sin(angle) * dist;
    const by = rand(-130, -68);

    for (let s = 0; s < 8; s++) {
      const t = s / 8;
      add3D(bx * (0.3 + 0.7 * t), 22 + (by - 22) * t, bz * (0.3 + 0.7 * t), ":", GREENS, 28 + t * 18);
    }
    for (let d = 0; d < 5; d++) {
      add3D(
        bx + rand(-7, 7),
        by + rand(-6, 6),
        bz + rand(-7, 7),
        pick([".", "·", "*"]),
        Math.random() < 0.75 ? WHITES : GOLDS,
        52 + d * 2,
        { x: bx, y: by, z: bz }
      );
    }
  }

  // 5. Smooth 360-degree 3D Cone Wrapper (lower rim so stems stay visible below flowers)
  const layers = 32;
  for (let l = 0; l <= layers; l++) {
    const t = l / layers;
    const y = 84 - t * 116;
    const baseR = 7 + Math.pow(t, 0.85) * 102;
    const circumference = Math.max(12, Math.floor(baseR * 0.65));

    for (let s = 0; s < circumference; s++) {
      const theta = (s / circumference) * Math.PI * 2;
      const fold = Math.sin(theta * 8 + t * 3) * (5.5 * t);
      const r = baseR + fold;

      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      let char = "-";
      let palette = WHITES;

      if (t > 0.92) {
        char = "~";
      } else if (Math.sin(theta * 8) > 0.65) {
        char = ":";
        palette = CYANS;
      } else if (l % 2 === 0) {
        char = "-";
      } else {
        char = "=";
        palette = Math.random() < 0.75 ? WHITES : CYANS;
      }

      add3D(x, y, z, char, palette, 4 + t * 38);
    }
  }

  // 6. Ruffled Tissue Paper Collar
  for (let i = 0; i < 240; i++) {
    const theta = rand(0, Math.PI * 2);
    const v = rand(0, 1);
    const wave = Math.sin(theta * 6) * 13;
    const r = 100 + v * 30 + wave;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    const y = -34 - v * 72 + Math.sin(theta * 5) * 10;

    add3D(x, y, z, v > 0.78 ? "^" : ".", WHITES, 34 + v * 22);
  }

  // 7. Cute Curly Mascot at the Bottom
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
      staticOverlay.push({
        x: (c - line.length / 2) * 7.5,
        y: 112 + r * 13,
        char: ch,
        color: ch === "<" || ch === "3" ? "#ff80ab" : "#ffffff",
        rank: 8 + r * 3
      });
    }
  });

  // 8. Typewriter Bottom Caption
  const msg = "A little something for ya :3";
  for (let i = 0; i < msg.length; i++) {
    if (msg[i] === " ") continue;
    staticOverlay.push({
      x: (i - msg.length / 2) * 7.5,
      y: 194,
      char: msg[i],
      color: "#e2e8f0",
      rank: 78 + i * 1.1
    });
  }
}

buildScene();

// Floating ASCII Hearts & Sparkles
const particles = [];

function spawnParticle() {
  const cx = width / 2;
  const cy = height / 2;
  const side = Math.random() < 0.5 ? -1 : 1;
  const roll = Math.random();

  let art = MINI_HEART;
  let colors = HEART_COLORS;
  let vy = rand(-0.4, -0.18);

  if (roll < 0.14) {
    art = BIG_HEART;
    colors = WHITES;
    vy = rand(-0.28, -0.14);
  } else if (roll < 0.30) {
    art = MID_HEART;
    colors = HEART_COLORS;
    vy = rand(-0.35, -0.16);
  } else if (roll >= 0.65) {
    art = [pick(BURST)];
    colors = [...GOLDS, ...CYANS, ...WHITES];
    vy = rand(-0.2, -0.05);
  }

  particles.push({
    x: cx + side * rand(140, Math.min(width * 0.44, 340)),
    y: cy + rand(-210, 200),
    art,
    color: pick(colors),
    vx: rand(-0.1, 0.1),
    vy,
    phase: rand(0, Math.PI * 2),
    life: rand(140, 250),
    maxLife: 250
  });
}

let frame = 0;
let rotY = 0;

function animate() {
  ctx.fillStyle = "#020308";
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2 + 12;
  const scale = Math.min(width / 500, height / 490);
  const fov = 460;

  // Hold steady while stems shoot up & flowers bloom open, then ease into a slow, gentle 3D spin
  const spinEase = smoothstep(80, 165, frame);
  rotY += 0.0052 * spinEase;

  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const tiltX = 0.25;
  const cosX = Math.cos(tiltX);
  const sinX = Math.sin(tiltX);

  const projected = [];

  for (let i = 0; i < bouquetPoints.length; i++) {
    const p = bouquetPoints[i];
    if (frame < p.rank) continue;

    const age = frame - p.rank;
    // Flowers physically unfurl outward from their center bud with a soft spring pop
    const bloomT = p.isBloom ? smoothstep(0, 24, age) : smoothstep(0, 12, age);
    const pop = p.isBloom && age < 28 ? 1 + Math.sin((age / 28) * Math.PI) * 0.12 : 1;

    const curX = p.ox + (p.x - p.ox) * bloomT * pop;
    const curY = p.oy + (p.y - p.oy) * bloomT * pop;
    const curZ = p.oz + (p.z - p.oz) * bloomT * pop;

    const rx = curX * cosY - curZ * sinY;
    const rz1 = curX * sinY + curZ * cosY;

    const ry = curY * cosX - rz1 * sinX;
    const rz = curY * sinX + rz1 * cosX;

    const persp = fov / (fov + rz + 140);
    const sx = cx + rx * persp * scale;
    const sy = cy + ry * persp * scale;

    const revealAlpha = Math.min(1, age / 14);
    const depthAlpha = p.isBloom
? Math.max(0.45, Math.min(1, (190 - rz) / 220))
: Math.max(0.28, Math.min(1, (165 - rz) / 230));
projected.push({
sx,
sy,
rz,
persp,
char: p.char,
color: p.color,
alpha: revealAlpha * depthAlpha
});
}
projected.sort((a, b) => b.rz - a.rz);
ctx.textAlign = "center";
ctx.textBaseline = "middle";
for (let i = 0; i < projected.length; i++) {
const pt = projected[i];
const fontSize = Math.max(9, Math.round(13 * pt.persp * scale));
ctx.font = bold ${fontSize}px "Courier New", monospace;
ctx.globalAlpha = pt.alpha;
ctx.fillStyle = pt.color;
ctx.fillText(pt.char, pt.sx, pt.sy);
}
// Static mascot & typewriter bottom caption
ctx.font = bold ${Math.max(10, Math.round(13 * scale))}px "Courier New", monospace;
for (let i = 0; i < staticOverlay.length; i++) {
const s = staticOverlay[i];
if (frame < s.rank) continue;
ctx.globalAlpha = Math.min(1, (frame - s.rank) / 12);
ctx.fillStyle = s.color;
ctx.fillText(s.char, cx + s.x * scale, cy + s.y * scale);
}
// Surrounding floating hearts & sparkles
if (particles.length < 34 && Math.random() < 0.16) {
spawnParticle();
}
for (let i = particles.length - 1; i >= 0; i--) {
const p = particles[i];
p.x += p.vx + Math.sin(p.phase) * 0.14;
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
