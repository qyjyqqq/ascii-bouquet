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
const FIREWORK_CHARS = ["✦", "✧", "*", "+", "·", "°"];

let width = 0;
let height = 0;
const dpr = Math.min(window.devicePixelRatio || 1, 2);

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
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
let flowerList = [];

function buildScene() {
  bouquetPoints = [];
  staticOverlay = [];

  function add3D(x, y, z, char, color, rank, origin = null, scaleBoost = 1) {
    bouquetPoints.push({
      x: x,
      y: y,
      z: z,
      ox: origin ? origin.x : x * 0.1,
      oy: origin ? origin.y : Math.min(86, y + 32),
      oz: origin ? origin.z : z * 0.1,
      isBloom: Boolean(origin),
      char: char,
      color: color,
      rank: rank,
      scaleBoost: scaleBoost
    });
  }

  const KNOT = { x: 0, y: 86, z: 0 };

  // 1. Exact Same Hand-Balanced Flower Arrangement
  flowerList = [
    { x: -8,   y: -162, z: 10,  r: 31, tiltX: 0.15,  tiltZ: -0.08, palette: GOLDS, delay: 54 },
    { x: 42,   y: -148, z: -18, r: 28, tiltX: -0.18, tiltZ: 0.25,  palette: PINKS, delay: 58 },
    { x: -58,  y: -134, z: -20, r: 29, tiltX: -0.15, tiltZ: -0.28, palette: CYANS, delay: 52 },
    { x: 22,   y: -120, z: 52,  r: 30, tiltX: 0.35,  tiltZ: 0.15,  palette: CYANS, delay: 50 },
    { x: -42,  y: -108, z: 46,  r: 28, tiltX: 0.32,  tiltZ: -0.22, palette: PINKS, delay: 48 },
    { x: 78,   y: -104, z: 24,  r: 27, tiltX: 0.2,   tiltZ: 0.42,  palette: GOLDS, delay: 50 },
    { x: -92,  y: -90,  z: 16,  r: 26, tiltX: 0.18,  tiltZ: -0.45, palette: GOLDS, delay: 46 },
    { x: 4,    y: -102, z: -58, r: 29, tiltX: -0.38, tiltZ: 0.05,  palette: GOLDS, delay: 50 },
    { x: 94,   y: -76,  z: -28, r: 25, tiltX: -0.22, tiltZ: 0.48,  palette: CYANS, delay: 45 },
    { x: -64,  y: -78,  z: -56, r: 26, tiltX: -0.35, tiltZ: -0.34, palette: PINKS, delay: 46 },
    { x: 48,   y: -74,  z: -62, r: 25, tiltX: -0.38, tiltZ: 0.28,  palette: PINKS, delay: 46 },
    { x: -16,  y: -72,  z: 74,  r: 26, tiltX: 0.48,  tiltZ: -0.1,  palette: GOLDS, delay: 44 },
    { x: 52,   y: -66,  z: 64,  r: 24, tiltX: 0.44,  tiltZ: 0.32,  palette: PINKS, delay: 44 },
    { x: -70,  y: -62,  z: 54,  r: 24, tiltX: 0.42,  tiltZ: -0.36, palette: CYANS, delay: 42 }
  ];

  // 2. Smooth Curved Green Stems & Leaves Directly Connected to Each Flower Base
  flowerList.forEach((f) => {
    const stemSteps = 46;
    const bendX = f.x * 0.14;
    const bendZ = f.z * 0.14;

    for (let s = 0; s <= stemSteps; s++) {
      const t = s / stemSteps;
      const inv = 1 - t;
      const sx = inv * inv * KNOT.x + 2 * inv * t * bendX + t * t * f.x;
      const sy = inv * inv * KNOT.y + 2 * inv * t * ((KNOT.y + f.y) * 0.52) + t * t * (f.y + 5);
      const sz = inv * inv * KNOT.z + 2 * inv * t * bendZ + t * t * f.z;

      const char = Math.abs(f.x) > 45 && t > 0.4 ? (f.x < 0 ? "\\" : "/") : "|";
      add3D(sx, sy, sz, char, pick(GREENS), 8 + t * 34);

      if (s === stemSteps - 2) {
        add3D(sx - 3, sy, sz + 2, "\\", pick(GREENS), 38 + t * 10);
        add3D(sx + 3, sy, sz - 2, "/", pick(GREENS), 38 + t * 10);
      }

      if (s === 28 || s === 36) {
        const dir = s === 28 ? -1 : 1;
        add3D(sx + dir * 7, sy - 2, sz + 2, dir < 0 ? "~" : "*", pick(GREENS), 24 + t * 18);
      }
    }

    // 3. Sculpted 3D Spiral Rose Blooms
    const petalCount = 105;
    const cX = Math.cos(f.tiltX);
    const sX = Math.sin(f.tiltX);
    const cZ = Math.cos(f.tiltZ);
    const sZ = Math.sin(f.tiltZ);

    for (let i = 0; i < petalCount; i++) {
      const frac = i / petalCount;
      const phi = Math.acos(1 - frac * 0.88);
      const theta = i * 2.39996 + frac * 3.2;
      const petalCurl = 0.78 + 0.22 * Math.cos(theta * 5 - frac * 6);
      const rad = f.r * petalCurl;

      const lx = Math.sin(phi) * Math.cos(theta) * rad;
      const lz = Math.sin(phi) * Math.sin(theta) * rad;
      const ly = -Math.cos(phi) * (f.r * 0.68);

      const ty1 = ly * cX - lz * sX;
      const tz1 = ly * sX + lz * cX;
      const tx2 = lx * cZ - ty1 * sZ;
      const ty2 = lx * sZ + ty1 * cZ;

      let char;
      let color;
      if (frac < 0.16) {
        char = "@";
        color = "#ffffff";
      } else if (frac < 0.45) {
        char = Math.cos(theta) < 0 ? "(" : ")";
        color = pick(f.palette);
      } else if (frac < 0.75) {
        char = "~";
        color = pick(f.palette);
      } else {
        char = "*";
        color = pick(f.palette);
      }

      add3D(
        f.x + tx2,
        f.y + ty2,
        f.z + tz1,
        char,
        color,
        f.delay + frac * 16,
        { x: f.x, y: f.y, z: f.z },
        frac < 0.2 ? 1.08 : 1
      );
    }
  });

  // 4. Delicate Baby's Breath Sprigs Tucked Between Roses
  for (let b = 0; b < 20; b++) {
    const angle = rand(0, Math.PI * 2);
    const dist = rand(28, 92);
    const bx = Math.cos(angle) * dist;
    const bz = Math.sin(angle) * dist;
    const by = rand(-136, -68);

    for (let s = 0; s < 8; s++) {
      const t = s / 8;
      add3D(bx * (0.3 + 0.7 * t), 24 + (by - 24) * t, bz * (0.3 + 0.7 * t), ":", pick(GREENS), 28 + t * 18);
    }
    for (let d = 0; d < 5; d++) {
      add3D(
        bx + rand(-7, 7),
        by + rand(-6, 6),
        bz + rand(-7, 7),
        pick([".", "·", "✦"]),
        Math.random() < 0.8 ? "#ffffff" : pick(GOLDS),
        54 + d * 2,
        { x: bx, y: by, z: bz }
      );
    }
  }

  // 5. Tighter, Sleeker Pleated Cone Wrapper & Ribbon Knot
  const layers = 34;
  for (let l = 0; l <= layers; l++) {
    const t = l / layers;
    const y = 86 - t * 114;
    // Tighter taper (78 instead of 104) so it hugs the stems cleanly
    const baseR = 6 + Math.pow(t, 0.92) * 78;
    const circumference = Math.max(14, Math.floor(baseR * 0.78));

    for (let s = 0; s < circumference; s++) {
      const theta = (s / circumference) * Math.PI * 2;
      const fold = Math.sin(theta * 8 + t * 2.5) * (3.2 * t);
      const r = baseR + fold;

      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      let char = "-";
      let color = pick(WHITES);

      if (t > 0.93) {
        char = "~";
        color = "#ffffff";
      } else if (Math.sin(theta * 8) > 0.65) {
        char = ":";
        color = pick(CYANS);
      } else if (l % 2 === 0) {
        char = "-";
        color = pick(WHITES);
      } else {
        char = "=";
        color = Math.random() < 0.78 ? pick(WHITES) : pick(CYANS);
      }

      add3D(x, y, z, char, color, 4 + t * 38);
    }
  }

  // 6. Tighter Ruffled Tissue Paper Collar Framing the Wrapper
  for (let i = 0; i < 210; i++) {
    const theta = rand(0, Math.PI * 2);
    const v = rand(0, 1);
    const wave = Math.sin(theta * 6) * 8;
    const r = 78 + v * 20 + wave;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    const y = -28 - v * 66 + Math.sin(theta * 5) * 8;

    add3D(x, y, z, v > 0.78 ? "^" : ".", pick(WHITES), 34 + v * 22);
  }
  // 6.5. Blue-Pink Unicode Braille Ribbon Aligned With the Bouquet Vertex
  const ribbon = [
    " ⣾⣿⣦⣀⣴⣿⣷ ",
    " ⠛⣻⣿⠛⣿⣟⠛ ",
    "⢠⣾⣿⡏  ⢹⣿⣷⡄",
    "  ⡟    ⢻⡀ "
  ];

  ribbon.forEach((line, r) => {
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === " ") continue;
      // Center knot & inner tails in pink (#ff80ab), outer loops in blue/cyan (#4dd0e1)
      const isCenter = c >= 3 && c <= 5;
      staticOverlay.push({
        x: (c - (line.length - 1) / 2) * 8.5,
        y: 66 + r * 11,
        char: ch,
        color: "#ff80ab",
        rank: 6 + r * 2
      });
    }
  });

  // 7. Cute Curly Mascot at the Bottom
  const mascot = [
    "     . - ~ - .     ",
    "   (  /\\ _ /\\  )   ",
    " (  (  o . o  )  ) ",
    "   (    <3     )   ",
    "     ' - _ - '     "
  ];


  mascot.forEach((line, r) => {
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === " ") continue;
      staticOverlay.push({
        x: (c - line.length / 2) * 7.5,
        y: 114 + r * 13,
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
      y: 196,
      char: msg[i],
      color: "#e2e8f0",
      rank: 82 + i * 1.1
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
  let vy = rand(-0.36, -0.16);

  if (roll < 0.14) {
    art = BIG_HEART;
    colors = WHITES;
    vy = rand(-0.25, -0.12);
  } else if (roll < 0.30) {
    art = MID_HEART;
    colors = HEART_COLORS;
    vy = rand(-0.32, -0.15);
  } else if (roll >= 0.65) {
    art = [pick(BURST)];
    colors = [...GOLDS, ...CYANS, ...WHITES];
    vy = rand(-0.18, -0.05);
  }

  particles.push({
    x: cx + side * rand(140, Math.min(width * 0.44, 340)),
    y: cy + rand(-210, 200),
    art: art,
    color: pick(colors),
    vx: rand(-0.08, 0.08),
    vy: vy,
    phase: rand(0, Math.PI * 2),
    life: rand(150, 260),
    maxLife: 260
  });
}

// Mini Fireworks Bursting Out When Flowers Bloom
const fireworks = [];
const triggeredBursts = new Set();
function triggerMiniFirework(fx, fy, fz, palette, cx, cy, scale, fov, cosX, sinX) {
// Project the flower's 3D bloom center to screen coordinates
const ry = fy * cosX - fz * sinX;
const rz = fy * sinX + fz * cosX;
const persp = fov / (fov + rz + 145);
const sx = cx + fx * persp * scale;
const sy = cy + ry * persp * scale;
const sparkCount = 16;
for (let i = 0; i < sparkCount; i++) {
const angle = (i / sparkCount) * Math.PI * 2 + rand(-0.25, 0.25);
const speed = rand(1.1, 3.4) * scale;
fireworks.push({
x: sx,
y: sy,
vx: Math.cos(angle) * speed,
vy: Math.sin(angle) * speed - 0.45 * scale,
char: pick(FIREWORK_CHARS),
color: Math.random() < 0.25 ? "#ffffff" : pick(palette),
life: rand(34, 56),
maxLife: 56
});
}
}
let frame = 0;
let rotY = 0;
function animate() {
ctx.fillStyle = "#020308";
ctx.fillRect(0, 0, width, height);
const cx = width / 2;
const cy = height / 2 + 12;
const scale = Math.min(width / 500, height / 490);
const fov = 470;
const spinEase = smoothstep(85, 180, frame);
rotY += 0.0028 * spinEase;
const cosY = Math.cos(rotY);
const sinY = Math.sin(rotY);
const tiltX = 0.24;
const cosX = Math.cos(tiltX);
const sinX = Math.sin(tiltX);
// Trigger a mini firework pop right as each flower blooms open
for (let idx = 0; idx < flowerList.length; idx++) {
const f = flowerList[idx];
if (frame >= f.delay + 8 && !triggeredBursts.has(idx)) {
triggeredBursts.add(idx);
triggerMiniFirework(f.x, f.y, f.z, f.palette, cx, cy, scale, fov, cosX, sinX);
}
}
const projected = [];
for (let i = 0; i < bouquetPoints.length; i++) {
const p = bouquetPoints[i];
if (frame < p.rank) continue;
const age = frame - p.rank;
const bloomT = p.isBloom ? smoothstep(0, 26, age) : smoothstep(0, 14, age);
const pop = p.isBloom && age < 30 ? 1 + Math.sin((age / 30) * Math.PI) * 0.12 : 1;
const curX = p.ox + (p.x - p.ox) * bloomT * pop;
const curY = p.oy + (p.y - p.oy) * bloomT * pop;
const curZ = p.oz + (p.z - p.oz) * bloomT * pop;
const rx = curX * cosY - curZ * sinY;
const rz1 = curX * sinY + curZ * cosY;
const ry = curY * cosX - rz1 * sinX;
const rz = curY * sinX + rz1 * cosX;
const persp = fov / (fov + rz + 145);
const sx = cx + rx * persp * scale;
const sy = cy + ry * persp * scale;
const revealAlpha = Math.min(1, age / 14);
const depthAlpha = p.isBloom
? Math.max(0.45, Math.min(1, (195 - rz) / 220))
: Math.max(0.26, Math.min(0.95, (165 - rz) / 230));
projected.push({
sx: sx,
sy: sy,
rz: rz,
persp: persp,
char: p.char,
color: p.color,
alpha: revealAlpha * depthAlpha,
scaleBoost: p.scaleBoost
});
}
projected.sort((a, b) => b.rz - a.rz);
ctx.textAlign = "center";
ctx.textBaseline = "middle";
for (let i = 0; i < projected.length; i++) {
const pt = projected[i];
const fontSize = Math.max(9, Math.round(13 * pt.persp * scale * pt.scaleBoost));
ctx.font = "bold " + fontSize + "px 'Courier New', monospace";
ctx.globalAlpha = pt.alpha;
ctx.fillStyle = pt.color;
ctx.fillText(pt.char, pt.sx, pt.sy);
}
// Draw & update mini blooming fireworks
const fwSize = Math.max(9, Math.round(12 * scale));
ctx.font = "bold " + fwSize + "px 'Courier New', monospace";
for (let i = fireworks.length - 1; i >= 0; i--) {
const fw = fireworks[i];
fw.x += fw.vx;
fw.y += fw.vy;
fw.vx *= 0.95; // air drag slowdown like real fireworks
fw.vy = fw.vy * 0.95 + 0.045; // gentle gravity arc
fw.life--;
if (fw.life <= 0) {
fireworks.splice(i, 1);
continue;
}
// Twinkle near the end of the spark's life
const twinkle = fw.life < 16 && fw.life % 3 === 0 ? 0.35 : 1;
ctx.globalAlpha = Math.min(1, fw.life / 22) * twinkle;
ctx.fillStyle = fw.color;
ctx.fillText(fw.char, fw.x, fw.y);
}
// Static mascot & typewriter bottom caption
const staticSize = Math.max(10, Math.round(13 * scale));
ctx.font = "bold " + staticSize + "px 'Courier New', monospace";
for (let i = 0; i < staticOverlay.length; i++) {
const s = staticOverlay[i];
if (frame < s.rank) continue;
ctx.globalAlpha = Math.min(1, (frame - s.rank) / 12);
ctx.fillStyle = s.color;
ctx.fillText(s.char, cx + s.x * scale, cy + s.y * scale);
}
// Surrounding floating hearts & sparkles
if (particles.length < 32 && Math.random() < 0.15) {
spawnParticle();
}
for (let i = particles.length - 1; i >= 0; i--) {
const p = particles[i];
p.x += p.vx + Math.sin(p.phase) * 0.12;
p.y += p.vy;
p.phase += 0.025;
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
