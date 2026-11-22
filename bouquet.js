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

// Build 3D points with exact reveal rank (matching buildScene() in video)
let points = [];

function buildScene() {
  points = [];

  function pushPt(x, y, z, char, palette, rank, priority = 1, bloomOrigin = null) {
    points.push({
      x,
      y,
      z,
      ox: bloomOrigin ? bloomOrigin.x : x * 0.1,
      oy: bloomOrigin ? bloomOrigin.y : Math.min(78, y + 35),
      oz: bloomOrigin ? bloomOrigin.z : z * 0.1,
      hasBloom: Boolean(bloomOrigin),
      char,
      color: pick(palette),
      rank,
      priority // higher priority wins when two points snap to the same ASCII cell
    });
  }

  const KNOT = { x: 0, y: 80, z: 0 };

  // 1. Asymmetrical Flower Heads (top & side blooms like 00:05 - 00:14)
  const flowers = [
    { x: -10, y: -158, z: 12,  r: 30, palette: GOLDS, delay: 44 },
    { x: 36,  y: -146, z: -16, r: 27, palette: PINKS, delay: 46 },
    { x: -58, y: -128, z: -22, r: 28, palette: CYANS, delay: 42 },
    { x: 18,  y: -120, z: 48,  r: 29, palette: CYANS, delay: 40 },
    { x: 74,  y: -106, z: 24,  r: 26, palette: GOLDS, delay: 42 },
    { x: -40, y: -104, z: 44,  r: 27, palette: PINKS, delay: 40 },
    { x: -94, y: -88,  z: 16,  r: 25, palette: GOLDS, delay: 38 },
    { x: 4,   y: -98,  z: -56, r: 28, palette: GOLDS, delay: 40 },
    { x: 96,  y: -78,  z: -26, r: 25, palette: CYANS, delay: 38 },
    { x: -62, y: -76,  z: -58, r: 26, palette: PINKS, delay: 38 },
    { x: 46,  y: -72,  z: -62, r: 24, palette: PINKS, delay: 38 },
    { x: -16, y: -72,  z: 74,  r: 25, palette: GOLDS, delay: 36 },
    { x: 52,  y: -66,  z: 66,  r: 23, palette: PINKS, delay: 36 },
    { x: -70, y: -62,  z: 56,  r: 23, palette: CYANS, delay: 36 }
  ];

  // 2. Curved Stems shooting up from Knot directly into each Flower Base
  flowers.forEach((f) => {
    const steps = 32;
    const bendX = f.x * 0.15 + rand(-3, 3);
    const bendZ = f.z * 0.15 + rand(-3, 3);

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const inv = 1 - t;
      const sx = inv * inv * KNOT.x + 2 * inv * t * bendX + t * t * f.x;
      const sy = inv * inv * KNOT.y + 2 * inv * t * ((KNOT.y + f.y) * 0.52) + t * t * (f.y + 8);
      const sz = inv * inv * KNOT.z + 2 * inv * t * bendZ + t * t * f.z;

      const char = Math.abs(f.x) > 45 && t > 0.45 ? (f.x < 0 ? "\\" : "/") : "|";
      // Stems shoot upward rapidly between frames 8 and 36
      pushPt(sx, sy, sz, char, GREENS, 8 + t * 28, 2);

      // Side leaves along upper stems
      if (s === 18 || s === 24) {
        const dir = s === 18 ? -1 : 1;
        pushPt(sx + dir * 7, sy - 2, sz + 3, dir < 0 ? "~" : "*", GREENS, 22 + t * 18, 2);
      }
    }

    // 3. 3D Spherical Rose Blooms that physically expand outward from center bud
    const count = 95;
    for (let i = 0; i < count; i++) {
      const frac = i / count; // 0 = center bud, 1 = outer petals
      const phi = Math.acos(1 - frac * 0.88);
      const theta = i * 2.39996 + f.x * 0.1;
      const lobe = 0.78 + 0.22 * Math.cos(theta * 5);
      const rad = f.r * lobe;

      const lx = Math.sin(phi) * Math.cos(theta) * rad;
      const lz = Math.sin(phi) * Math.sin(theta) * rad;
      const ly = -Math.cos(phi) * (f.r * 0.62);

      let char;
      if (frac < 0.22) char = "@";
      else if (frac < 0.52) char = i % 2 === 0 ? "(" : ")";
      else if (frac < 0.8) char = "=";
      else char = "*";

      // Center bud appears first, outer petals erupt outward right after
      pushPt(
        f.x + lx,
        f.y + ly,
        f.z + lz,
        char,
        f.palette,
        f.delay + frac * 16,
        3,
        { x: f.x, y: f.y, z: f.z }
      );
    }
  });

  // 4. Baby's Breath ("babies") Sprigs between flowers
  for (let b = 0; b < 22; b++) {
    const angle = rand(0, Math.PI * 2);
    const dist = rand(25, 92);
    const bx = Math.cos(angle) * dist;
    const bz = Math.sin(angle) * dist;
    const by = rand(-135, -66);

    for (let s = 0; s < 8; s++) {
      const t = s / 8;
      pushPt(bx * (0.3 + 0.7 * t), 22 + (by - 22) * t, bz * (0.3 + 0.7 * t), ":", GREENS, 26 + t * 18, 2);
    }
    for (let d = 0; d < 5; d++) {
      pushPt(
        bx + rand(-7, 7),
        by + rand(-6, 6),
        bz + rand(-7, 7),
        pick([".", "·", "*"]),
        Math.random() < 0.75 ? WHITES : GOLDS,
        46 + d * 2,
        3,
        { x: bx, y: by, z: bz }
      );
    }
  }

  // 5. 3D Cone Wrapper (horizontal scanline rows like 00:04 - 00:14)
  const layers = 36;
  for (let l = 0; l <= layers; l++) {
    const t = l / layers; // 0 = knot, 1 = wide rim
    const y = 80 - t * 134;
    const baseR = 8 + Math.pow(t, 0.85) * 108;
    const steps = Math.max(16, Math.floor(baseR * 0.75));

    for (let s = 0; s < steps; s++) {
      const theta = (s / steps) * Math.PI * 2;
      const fold = Math.sin(theta * 7 + t * 3) * (5 * t);
      const r = baseR + fold;

      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      let char = "-";
      let palette = WHITES;

      if (t > 0.92) {
        char = "~";
      } else if (Math.sin(theta * 7) > 0.65) {
        char = ":";
        palette = CYANS;
      } else if (l % 2 === 0) {
        char = "-";
      } else {
        char = "=";
        palette = Math.random() < 0.75 ? WHITES : CYANS;
      }

      pushPt(x, y, z, char, palette, 4 + t * 34, 1);
    }
  }

  // 6. Ruffled Tissue Paper Collar Wings
  for (let i = 0; i < 240; i++) {
    const theta = rand(0, Math.PI * 2);
    const v = rand(0, 1);
    const wave = Math.sin(theta * 6) * 13;
    const r = 104 + v * 32 + wave;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    const y = -50 - v * 76 + Math.sin(theta * 5) * 10;

    pushPt(x, y, z, v > 0.78 ? "^" : ".", WHITES, 32 + v * 20, 1);
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
  const cy = height / 2 - 4;
  const scale = Math.min(width / 500, height / 490);
  const fov = 470;

  // Monospace ASCII character cell dimensions (creates the crisp horizontal row look in video)
  const cellW = Math.max(6, 7.2 * scale);
  const cellH = Math.max(9, 11.2 * scale);
  const fontSize = Math.max(9, Math.round(12.2 * scale));

  // Phase 1 (frames 0-72): Bouquet erupts upward & flowers bloom outward from centers
  // Phase 2 (frames 72+): Smoothly eases into a slow, steady 3D spin
  const spinEase = smoothstep(72, 150, frame);
  rotY += 0.0052 * spinEase;

  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const tiltX = 0.25;
  const cosX = Math.cos(tiltX);
  const sinX = Math.sin(tiltX);

  // Grid buffer: snaps 3D points onto monospace ASCII cells with Z-depth occlusion
  const gridMap = new Map();

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (frame < p.rank) continue;

    const age = frame - p.rank;
    // Physical radial bloom eruption from each flower's bud (frames 0..22 after rank)
    const bloomT = p.hasBloom ? smoothstep(0, 22, age) : smoothstep(0, 12, age);
    // Slight overshoot bounce on petals so they visibly pop open
    const pop = p.hasBloom && age < 26 ? 1 + Math.sin((age / 26) * Math.PI) * 0.14 : 1;

    const curX = p.ox + (p.x - p.ox) * bloomT * pop;
    const curY = p.oy + (p.y - p.oy) * bloomT * pop;
    const curZ = p.oz + (p.z - p.oz) * bloomT * pop;

    // 3D Y-axis rotation
    const rx = curX * cosY - curZ * sinY;
    const rz1 = curX * sinY + curZ * cosY;

    // Forward tilt
    const ry = curY * cosX - rz1 * sinX;
    const rz = curY * sinX + rz1 * cosX;

    const persp = fov / (fov + rz + 145);
    const sx = cx + rx * persp * scale;
    const sy = cy + ry * persp * scale;

// Snap screen coordinates to crisp monospace grid cells
const col = Math.round((sx - cx) / cellW);
const row = Math.round((sy - cy) / cellH);
const key = ${col},${row};
const depthAlpha = p.hasBloom
? Math.max(0.45, Math.min(1, (195 - rz) / 220))
: Math.max(0.24, Math.min(0.95, (155 - rz) / 230));
const existing = gridMap.get(key);
// Closer Z (smaller rz) or higher priority (blooms over stems) wins the cell
if (!existing || rz < existing.rz - 6 || (Math.abs(rz - existing.rz) <= 6 && p.priority > existing.priority)) {
gridMap.set(key, {
col,
row,
rz,
char: p.char,
color: p.color,
alpha: depthAlpha
});
}
}
ctx.font = bold ${fontSize}px "Courier New", monospace;
ctx.textAlign = "center";
ctx.textBaseline = "middle";
gridMap.forEach((cell) => {
ctx.globalAlpha = cell.alpha;
ctx.fillStyle = cell.color;
ctx.fillText(cell.char, cx + cell.col * cellW, cy + cell.row * cellH);
});
// Cute Mascot inside a Spinning Dotted Halo Ring at the Bottom (matching 00:05 - 00:14)
if (frame >= 14) {
const mascotY = cy + 132 * scale;
const ringDots = 26;
for (let d = 0; d < ringDots; d++) {
const a = (d / ringDots) * Math.PI * 2 + frame * 0.025;
const rx = Math.cos(a) * 36 * scale;
const ry = Math.sin(a) * 28 * scale;
ctx.globalAlpha = 0.85;
ctx.fillStyle = d % 2 === 0 ? "#ffffff" : "#cbd5e1";
ctx.fillText(d % 3 === 0 ? "·" : ".", cx + rx, mascotY + ry);
}
const mascotLines = [
" /\_/\ ",
"( o.o )",
" ( <3 )"
];
mascotLines.forEach((line, rIdx) => {
for (let cIdx = 0; cIdx < line.length; cIdx++) {
const ch = line[cIdx];
if (ch === " ") continue;
const lx = (cIdx - line.length / 2 + 0.5) * cellW;
const ly = (rIdx - 1) * cellH;
ctx.globalAlpha = 1;
ctx.fillStyle = ch === "<" || ch === "3" ? "#ff80ab" : "#ffffff";
ctx.fillText(ch, cx + lx, mascotY + ly);
}
});
}
// Typewriter Bottom Caption ("A little something for ya :3" appearing letter-by-letter)
const caption = "A little something for ya :3";
const visibleChars = Math.max(0, Math.min(caption.length, Math.floor((frame - 78) * 0.45)));
if (visibleChars > 0) {
const capY = cy + 188 * scale;
for (let i = 0; i < visibleChars; i++) {
const ch = caption[i];
if (ch === " ") continue;
const lx = (i - caption.length / 2 + 0.5) * cellW;
ctx.globalAlpha = 0.95;
ctx.fillStyle = "#e2e8f0";
ctx.fillText(ch, cx + lx, capY);
}
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
