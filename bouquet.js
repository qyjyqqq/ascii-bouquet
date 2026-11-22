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

// 3D points for the rotating bouquet + 2D fixed points for mascot & caption
let bouquetPoints = [];
let staticOverlay = [];

function buildScene() {
  bouquetPoints = [];
  staticOverlay = [];

  function add3D(x, y, z, char, palette, rank) {
    bouquetPoints.push({
      x,
      y,
      z,
      char,
      color: pick(palette),
      rank,
      phase: rand(0, Math.PI * 2)
    });
  }

  // 1. Full 360-degree 3D Cone Wrapper (y from +85 knot up to -55 rim)
  const layers = 34;
  for (let l = 0; l <= layers; l++) {
    const t = l / layers; // 0 = bottom knot, 1 = wide upper rim
    const y = 85 - t * 140;
    const baseR = 7 + Math.pow(t, 0.85) * 108;
    const circumference = Math.max(12, Math.floor(baseR * 0.65));

    for (let s = 0; s < circumference; s++) {
      const theta = (s / circumference) * Math.PI * 2;
      // Pleated folds around the 360-degree cone
      const fold = Math.sin(theta * 8 + t * 3) * (5.5 * t);
      const r = baseR + fold;

      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      let char = "-";
      let palette = WHITES;

      if (t > 0.92) {
        char = "~";
        palette = WHITES;
      } else if (Math.sin(theta * 8) > 0.65) {
        char = ":";
        palette = CYANS;
      } else if (l % 2 === 0) {
        char = "-";
        palette = WHITES;
      } else {
        char = "=";
        palette = Math.random() < 0.75 ? WHITES : CYANS;
      }

      add3D(x, y, z, char, palette, t * 55 + rand(0, 6));
    }
  }

  // 2. Ruffled Tissue Paper Collar rising behind/around the 3D cone
  for (let i = 0; i < 260; i++) {
    const theta = rand(0, Math.PI * 2);
    const v = rand(0, 1);
    const wave = Math.sin(theta * 6) * 14;
    const r = 105 + v * 32 + wave;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    const y = -52 - v * 72 + Math.sin(theta * 5) * 10;

    add3D(x, y, z, v > 0.78 ? "^" : ".", WHITES, 45 + v * 25);
  }

  // 3. 3D Stems & Foliage inside the bouquet
  for (let i = 0; i < 160; i++) {
    const t = Math.random();
    const theta = rand(0, Math.PI * 2);
    const r = 4 + t * 88 * Math.random();
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    const y = 78 - t * 175;
    add3D(x, y, z, pick(["|", "/", "\\", "*"]), GREENS, 22 + t * 42);
  }

  // 4. 3D Sculpted Roses arranged in a dome at the top of the bouquet
  const roseDome = [
    { x: 0,   y: -145, z: 0,   r: 28, palette: GOLDS, delay: 75 },
    { x: 0,   y: -115, z: 58,  r: 26, palette: PINKS, delay: 68 },
    { x: 50,  y: -115, z: 29,  r: 26, palette: CYANS, delay: 68 },
    { x: 50,  y: -115, z: -29, r: 26, palette: GOLDS, delay: 68 },
    { x: 0,   y: -115, z: -58, r: 26, palette: PINKS, delay: 68 },
    { x: -50, y: -115, z: -29, r: 26, palette: CYANS, delay: 68 },
    { x: -50, y: -115, z: 29,  r: 26, palette: GOLDS, delay: 68 },

    // Outer ring of flowers
    { x: 0,   y: -78,  z: 92,  r: 24, palette: CYANS, delay: 60 },
    { x: 65,  y: -78,  z: 65,  r: 24, palette: PINKS, delay: 60 },
    { x: 92,  y: -78,  z: 0,   r: 24, palette: GOLDS, delay: 60 },
    { x: 65,  y: -78,  z: -65, r: 24, palette: CYANS, delay: 60 },
    { x: 0,   y: -78,  z: -92, r: 24, palette: PINKS, delay: 60 },
    { x: -65, y: -78,  z: -65, r: 24, palette: GOLDS, delay: 60 },
    { x: -92, y: -78,  z: 0,   r: 24, palette: CYANS, delay: 60 },
    { x: -65, y: -78,  z: 65,  r: 24, palette: PINKS, delay: 60 }
  ];

  roseDome.forEach((rose) => {
    // Build each rose as a 3D spherical bloom so it looks full from EVERY rotation angle
    const steps = 85;
    for (let i = 0; i < steps; i++) {
      const frac = i / steps;
      const phi = Math.acos(1 - frac * 0.85); // dome curvature from top center to outer rim
      const theta = i * 2.39996; // golden angle spiral for even 3D petal distribution
      const petalWave = 0.82 + 0.18 * Math.cos(theta * 5);
      const rad = rose.r * petalWave;

      const lx = Math.sin(phi) * Math.cos(theta) * rad;
      const lz = Math.sin(phi) * Math.sin(theta) * rad;
      const ly = -Math.cos(phi) * (rose.r * 0.65);

      let char;
      if (frac < 0.2) char = "@";
      else if (frac < 0.5) char = i % 2 === 0 ? "(" : ")";
      else if (frac < 0.78) char = "=";
      else char = "*";

      add3D(
        rose.x + lx,
        rose.y + ly,
        rose.z + lz,
        char,
        rose.palette,
        rose.delay + frac * 12
      );
    }
  });


  // 5. Cute Mascot at the Bottom (stays facing viewer)
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
        rank: 10 + r * 3
      });
    }
  });

  // 6. Caption Underneath
  const msg = "A little something for ya :3";
  for (let i = 0; i < msg.length; i++) {
    if (msg[i] === " ") continue;
    staticOverlay.push({
      x: (i - msg.length / 2) * 7.5,
      y: 194,
      char: msg[i],
      color: "#e2e8f0",
      rank: 88 + i * 0.7
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
    x: cx + side * rand(140, Math.min(width * 0.44, 340)),
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
let rotY = 0;

function animate() {
  ctx.fillStyle = "#020308";
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2 + 12;
  const scale = Math.min(width / 540, height / 520, 1.35);
  const fov = 460;

  // Continuous 3D Y-axis rotation + slight tilt so you see into the top of the bouquet
  rotY += 0.014;
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const tiltX = 0.24; // slight forward tilt toward viewer
  const cosX = Math.cos(tiltX);
  const sinX = Math.sin(tiltX);

  // Project all visible 3D points into 2D screen coordinates
  const projected = [];

  for (let i = 0; i < bouquetPoints.length; i++) {
    const p = bouquetPoints[i];
    if (frame < p.rank) continue;

    // Rotate around Y axis (spinning bouquet)
    const rx = p.x * cosY - p.z * sinY;
    const rz1 = p.x * sinY + p.z * cosY;

    // Tilt slightly around X axis so the top roses face the viewer nicely
    const ry = p.y * cosX - rz1 * sinX;
    const rz = p.y * sinX + rz1 * cosX;

    // Perspective projection
    const persp = fov / (fov + rz + 140);
    const sx = cx + rx * persp * scale;
    const sy = cy + ry * persp * scale;

    const revealAlpha = Math.min(1, (frame - p.rank) / 18);
    // Depth fog: front characters are bright, back characters fade slightly for 3D depth
    const depthAlpha = Math.max(0.28, Math.min(1, (160 - rz) / 230));

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

  // Sort back-to-front by rotated Z depth so front petals cleanly occlude back ones
  projected.sort((a, b) => b.rz - a.rz);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < projected.length; i++) {
    const pt = projected[i];
    const fontSize = Math.max(9, Math.round(13 * pt.persp * scale));
    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    ctx.globalAlpha = pt.alpha;
    ctx.fillStyle = pt.color;
    ctx.fillText(pt.char, pt.sx, pt.sy);
  }

  // Draw static mascot & caption at bottom
  ctx.font = `bold ${Math.max(10, Math.round(13 * scale))}px "Courier New", monospace`;
  for (let i = 0; i < staticOverlay.length; i++) {
    const s = staticOverlay[i];
    if (frame < s.rank) continue;
    ctx.globalAlpha = Math.min(1, (frame - s.rank) / 18);
    ctx.fillStyle = s.color;
    ctx.fillText(s.char, cx + s.x * scale, cy + s.y * scale);
  }

  // Spawn & animate floating ASCII hearts
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
