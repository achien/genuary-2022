const w = 800;
const h = 800;
// triangle width/height
const tw = 12;
const th = (tw * Math.sqrt(3)) / 2;
// how far outside the canvas to draw
const expand = tw;
// triangle coordinate offset
const tox = -expand;
const toy = -expand;
const rows = Math.ceil((h + 2 * expand) / th);
const cols = Math.ceil((w + 2 * expand) / tw);

const palette = [
  "#FCECC9",
  "#FCB0B3",
  "#F93943",
  "#7EB2DD",
  "#445E93",
  "#6A8E7F",
];

function setup() {
  createCanvas(w, h);
}

function randInt(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function drawUpTriangle(r, c) {
  // Top of the triangle
  const x1 = tox + tw * c + (tw / 2) * (r % 2);
  const y1 = toy + th * r;
  triangle(x1, y1, x1 + tw / 2, y1 + th, x1 - tw / 2, y1 + th);
}

function drawDownTriangle(r, c) {
  // Bottom of the triangle
  const x1 = tox + tw / 2 + tw * c + (tw / 2) * (r % 2);
  const y1 = toy + th + th * r;
  triangle(x1, y1, x1 - tw / 2, y1 - th, x1 + tw / 2, y1 - th);
}

function draw() {
  background("#fff");

  strokeWeight(0.5);

  const start = performance.now();

  const picked = {};
  let drawn = 0;
  let skipped = 0;
  while (drawn < 10000 && skipped <= 100) {
    const r = randInt(0, rows);
    const c = randInt(0, cols);
    const up = randInt(0, 1);

    const key = r + "|" + c + "|" + up;
    if (key in picked) {
      skipped++;
      continue;
    }
    skipped = 0;
    picked[key] = true;

    fill(palette[randInt(0, palette.length - 1)]);
    if (up) {
      drawUpTriangle(r, c);
    } else {
      drawDownTriangle(r, c);
    }
    drawn++;
  }

  const elapsed = performance.now() - start;

  console.log(`${rows * cols * 2} possible triangles`);
  console.log(`${drawn} triangles drawn in ${elapsed}ms`);

  noLoop();
}
