const w = 750;
const h = 750;
const scale = 3;

function setup() {
  createCanvas(w, h);
}

function draw() {
  background("#000");

  const sunX = 150;
  const sunY = 150;

  // Colors from https://commons.wikimedia.org/wiki/File:MosqueinAbuja.jpg
  const radii = [
    // sun
    { color: "#fff", radius: 45 },
    // yellow
    { color: "#f4f0ca", radius: 90 },
    // orange
    { color: "#f6cdaf", radius: 180 },
    // red
    { color: "#f2baab", radius: 270 },
    // red-gray
    { color: "#e5b8b2", radius: 360 },
    // red-grayer
    { color: "#bda5a5", radius: 450 },
    // gray
    { color: "#948a8b", radius: 600 },
  ];
  const skyX = 240;
  const groundX = 450;
  const groundMiddleX = 555;
  const groundNearX = 660;
  const far = "#9e8370";
  const middle = "#746e62";
  const near = "#213639";

  noStroke();

  for (let x = 0; x < w; x += scale) {
    for (let y = 0; y < h; y += scale) {
      const dist = Math.sqrt((x - sunX) * (x - sunX) + (y - sunY) * (y - sunY));
      let i = 0;
      for (; i < radii.length; i++) {
        if (radii[i].radius > dist) {
          break;
        }
      }
      const r1 = radii[Math.max(i - 1, 0)];
      const r2 = radii[Math.min(i, radii.length - 1)];

      // Calculate band based on radius
      let color;
      if (r1.radius == r2.radius) {
        color = r1.color;
      } else {
        // Fraction of distance covered between r1 and r2 zones
        const distCovered = (dist - r1.radius) / (r2.radius - r1.radius);
        color = Math.random() < distCovered ? r2.color : r1.color;
      }

      fill(color);
      square(x, y, scale);
    }
  }

  noLoop();
}
