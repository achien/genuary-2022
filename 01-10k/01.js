const w = 800;
const h = 800;
const padding = 8;
const diameter = 16;

const palette = ["#493B2A", "#593F62", "#7B6D8D", "#8499B1", "#A5C4D4"];

function setup() {
  createCanvas(w, h);
}

function randInt(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function draw() {
  background("#fff");

  noFill();
  strokeWeight(1);

  for (let i = 0; i < 10000; i++) {
    const x = randInt(padding, w - padding);
    const y = randInt(padding, h - padding);
    const start = (TWO_PI / 3) * randInt(0, 2);
    const stop = start + TWO_PI / 3;

    fill(palette[randInt(0, palette.length - 1)]);
    arc(x, y, diameter, diameter, start, stop, PIE);
  }

  noLoop();
}
