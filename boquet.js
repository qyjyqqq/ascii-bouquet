const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Color palettes matching the creator's code in the video
const GOLDS  = ["#fff79a", "#ffe875", "#ffd54f", "#ffca28"];
const CYANS  = ["#80deea", "#4dd0e1", "#26c6da", "#b2ebf2"];
const PINKS  = ["#f8bbd0", "#f48fb1", "#ff80ab", "#fce4ec"];
const GREENS = ["#a5d6a7", "#81c784", "#66bb6a", "#c8e6c9"];
const WHITES = ["#ffffff", "#dce4f2", "#9fb3c8", "#627d98"];

const HEART_COLORS = [...PINKS, "#ffffff"];

// ASCII heart sprites matching the floating hearts in the video
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

// Cute curly-haired character holding the bouquet at the bottom
const HOLDER_SPRITE = [
  "   .-\"\"\"-.   ",
  "  / .===. \\  ",
  " ( ( o o ) ) ",
  "  \\ ( <3 ) / ",
  "   '-...-'   "
];

let width = 0;
let height = 0;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

// Grid dimensions (character cells)
const COLS = 88;
const ROWS = 54;
let cellW = 10;
let cellH = 16;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Scale character grid cleanly to fit any screen size
  const maxCellH = Math.floor((height * 0.9) / ROWS);
  const maxCellW = Math.floor((width * 0.94) / COLS);
  cellH = Math.max(10, Math.min(18, maxCellH, Math.floor(maxCellW * 1.65)));
  cellW = cellH * 0.62;
}

window.addEventListener("resize", resize);
resize();

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Build the structured ASCII bouquet scene on a coordinate grid
const sceneCells = [];

function buildScene() {
  sceneCells.length = 0;
  const cx = Math.floor(COLS / 2);

  // Helper to add a character cell with reveal order (rank) & color group
  function addCell(gx, gy, char, palette, rank, kind = "wrap") {
    sceneCells.push({
      gx,
      gy,
      char,
      palette,
      baseColor: pick(palette),
      rank, // controls bottom-to-top bloom timing
      kind,
      phase: rand(0, Math.PI * 2),
      speed: rand(0.03, 0.07)
    });
  }

  // 1. Wrapping Paper Cone & Ribbed Folds (rows 18 to 39)
  const coneTop = 17;
  const coneBot = 39;

  for (let y = coneTop; y <= coneBot; y++) {
    // Progress from bottom knot (0) to wide top rim (1)
    const t = (coneBot - y) / (coneBot - coneTop);
    // Flared cone silhouette with ruffled upper edges
    const ruffle = Math.sin(t * Math.PI * 3) * 1.6;
    const halfSpan = Math.round(2 + Math.pow(t, 0.85) * 26 + ruffle);

    for (let dx = -halfSpan; dx <= halfSpan; dx++) {
      const gx = cx + dx;
      const normX = halfSpan === 0 ? 0 : dx / halfSpan;
      const absNorm = Math.abs(normX);

      // Leave hollow V-pocket at the top center where flowers sit
      if (y < 24 && absNorm < 0.58 * (1 - (y - coneTop) / 9)) {
        continue;
      }

      // Create pleated paper folds radiating from the knot
      const foldWave = Math.sin(normX * Math.PI * 5);
      let char = ".";
      let palette = WHITES;

      if (absNorm > 0.92) {
        char = dx < 0 ? "\\" : "/";
        palette = WHITES;
      } else if (foldWave > 0.55) {
        char = dx < 0 ? "\\" : "/";
        palette = CYANS;
      } else if (foldWave < -0.55) {
        char = ":";
        palette = WHITES;
      } else if ((gx + y) % 2 === 0) {
        char = "-";
        palette = WHITES;
      } else {
        char = "=";
        palette = CYANS;
      }

      // Reveal flows smoothly from bottom knot (t=0) upward (t=1)
      const rank = t * 55 + absNorm * 8;
      addCell(gx, y, char, palette, rank, "wrap");
    }
  }

  // 2. Green Foliage & Stems peeking out around the blooms
  for (let i = 0; i < 150; i++) {
    const angle = rand(-Math.PI * 0.92, -Math.PI * 0.08);
    const radius = rand(7, 25);
    const gx = Math.round(cx + Math.cos(angle) * radius * 1.25);
    const gy = Math.round(22 + Math.sin(angle) * radius * 0.72);
    const leafChars = ["/", "\\", "|", "~", "*", ";"];
    addCell(gx, gy, pick(leafChars), GREENS, 45 + rand(0, 25), "leaf");
  }

  // 3. Sculpted ASCII Rose & Flower Heads (layered blooms in Gold, Cyan, Pink)
  const flowers = [
    { x: cx,      y: 12, rx: 6.5, ry: 4.2, palette: GOLDS,  delay: 68 },
    { x: cx - 11, y: 14, rx: 6.0, ry: 3.8, palette: CYANS,  delay: 62 },
    { x: cx + 11, y: 14, rx: 6.0, ry: 3.8, palette: PINKS,  delay: 62 },
    { x: cx - 19, y: 18, rx: 5.5, ry: 3.5, palette: GOLDS,  delay: 56 },
    { x: cx + 19, y: 18, rx: 5.5, ry: 3.5, palette: CYANS,  delay: 56 },
    { x: cx - 6,  y: 18, rx: 5.8, ry: 3.6, palette: PINKS,  delay: 58 },
    { x: cx + 6,  y: 18, rx: 5.8, ry: 3.6, palette: GOLDS,  delay: 58 },
    { x: cx,      y: 22, rx: 5.2, ry: 3.2, palette: CYANS,  delay: 50 },
    { x: cx - 13, y: 22, rx: 4.8, ry: 3.0, palette: PINKS,  delay: 52 },
    { x: cx + 13, y: 22, rx: 4.8, ry: 3.0, palette: GOLDS,  delay: 52 },
    { x: cx - 5,  y: 8,  rx: 4.5, ry: 2.8, palette: PINKS,  delay: 74 },
    { x: cx + 5,  y: 8,  rx: 4.5, ry: 2.8, palette: CYANS,  delay: 74 }
  ];

  flowers.forEach((f) => {
    for (let dy = -Math.ceil(f.ry); dy <= Math.ceil(f.ry); dy++) {
      for (let dx = -Math.ceil(f.rx); dx <= Math.ceil(f.rx); dx++) {
        const dist = Math.sqrt((dx / f.rx) ** 2 + (dy / f.ry) ** 2);
        if (dist <= 1.0) {
          let char;
          if (dist < 0.28) {
            char = "@";
          } else if (dist < 0.58) {
            char = dx < 0 ? "(" : ")";
          } else if (dist < 0.82) {
            char = dy < 0 ? "~" : "=";
          } else {
            char = "*";
          }
          addCell(
            Math.round(f.x + dx),
            Math.round(f.y + dy),
            char,
            f.palette,
            f.delay + dist * 10,
            "flower"
          );
        }
      }
    }
  });

  // 4. Cute Character Holding the Knot (rows 40 to 44)
  HOLDER_SPRITE.forEach((line, rIdx) => {
    const startX = Math.floor(cx - line.length / 2);
    for (let cIdx = 0; cIdx < line.length; cIdx++) {
      const ch = line[cIdx];
      if (ch !== " ") {
        const isHeart = ch === "<" || ch === "3";
        addCell(
          startX + cIdx,
          40 + rIdx,
          ch,
          isHeart ? PINKS : WHITES,
          10 + rIdx * 3,
          "holder"
        );
      }
    }
  });

  // 5. Caption at the Bottom (row 47)
  const caption = "A little something for ya :3";
  const capStartX = Math.floor(cx - caption.length / 2);
  for (let i = 0; i < caption.length; i++) {
    const ch = caption[i];
    if (ch !== " ") {
      addCell(capStartX + i, 47, ch, WHITES, 85 + i * 0.8, "text");
    }
  }
}

buildScene();

// Ambient floating ASCII hearts & sparkles (matching the creator's Particle class)
const particles = [];

function spawnParticle() {
  const cx = width / 2;
  const cy = height / 2;
  const side = Math.random() < 0.5 ? -1 : 1;

  // Pick from big ASCII hearts, medium hearts, mini <3, or + sparkles
  const roll = Math.random();
  let art = MINI_HEART;
  let colors = HEART_COLORS;
  let vy = rand(-0.45, -0.2);

  if (roll < 0.12) {
    art = BIG_HEART;
    colors = WHITES;
    vy = rand(-0.3, -0.15);
  } else if (roll < 0.28) {
    art = MID_HEART;
    colors = HEART_COLORS;
    vy = rand(-0.4, -0.2);
  } else if (roll < 0.62) {
    art = MINI_HEART;
    colors = HEART_COLORS;
  } else {
    art = ["+"];
    colors = [...GOLDS, ...CYANS, ...WHITES];
    vy = rand(-0.25, -0.05);
  }

  particles.push({
    x: cx + side * rand(cellW * 16, cellW * 38),
    y: cy + rand(-cellH * 22, cellH * 22),
    art,
    color: pick(colors),
    vx: rand(-0.12, 0.12),
    vy,
    phase: rand(0, Math.PI * 2),
    life: rand(120, 240),
    maxLife: 240
  });
}

let frame = 0;

function animate() {
  ctx.fillStyle = "#020308";
  ctx.fillRect(0, 0, width, height);

  const gridPixelW = COLS * cellW;
  const gridPixelH = ROWS * cellH;
  const offsetX = (width - gridPixelW) / 2;
  const offsetY = (height - gridPixelH) / 2;

  ctx.font = `bold ${Math.round(cellH * 0.88)}px "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Draw the structured ASCII bouquet with bottom-to-top reveal & shimmer wave
  for (let i = 0; i < sceneCells.length; i++) {
    const c = sceneCells[i];
    if (frame < c.rank) continue;

    const age = frame - c.rank;
    const revealAlpha = Math.min(1, age / 18);

    // Subtle upward light wave & character shimmer
    const wave = Math.sin(frame * 0.06 + c.gy * 0.25 + c.gx * 0.12);
    const shimmerAlpha = 0.72 + 0.28 * wave;

    // Occasionally cycle flower/wrap highlights
    if (c.kind === "flower" && Math.sin(frame * c.speed + c.phase) > 0.96) {
      c.baseColor = pick(c.palette);
    }

    const px = offsetX + c.gx * cellW + cellW / 2;
    const py = offsetY + c.gy * cellH + cellH / 2;

    ctx.globalAlpha = revealAlpha * shimmerAlpha;
    ctx.fillStyle = c.baseColor;
    ctx.fillText(c.char, px, py);
  }

  // Spawn & update floating ASCII hearts and sparkles
  if (particles.length < 36 && Math.random() < 0.18) {
    spawnParticle();
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx + Math.sin(p.phase) * 0.18;
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

    for (let lineIdx = 0; lineIdx < p.art.length; lineIdx++) {
      ctx.fillText(p.art[lineIdx], p.x, p.y + lineIdx * (cellH * 0.85));
    }
  }

ctx.globalAlpha = 1;
frame++;
requestAnimationFrame(animate);
}
animate();