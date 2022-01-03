const w = 750;
const h = 750;
const scale = 3;

function setup() {
  createCanvas(w, h);
}

function draw() {
  background("#000");

  const sunX = 100;
  const sunY = 100;

  // Colors from https://commons.wikimedia.org/wiki/File:MosqueinAbuja.jpg
  const radii = [
    // sun
    { skyColor: "#fff", groundColor: "#fff", radius: 45 },
    // yellow
    { skyColor: "#f4f0ca", groundColor: "#edf7d5", radius: 90 },
    // orange
    { skyColor: "#f6cdaf", groundColor: "#f8cc9f", radius: 180 },
    // red
    { skyColor: "#f2baab", groundColor: "#f2ae8b", radius: 270 },
    // red-gray
    { skyColor: "#e5b8b2", groundColor: "#c8997d", radius: 360 },
    // red-grayer
    { skyColor: "#bda5a5", groundColor: "#6f6e69", radius: 450 },
    // gray
    { skyColor: "#948a8b", groundColor: "#525f65", radius: 600 },
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
      let rColor;
      if (r1.radius == r2.radius) {
        rColor = r1;
      } else {
        // Fraction of distance covered between r1 and r2 zones
        const distCovered = (dist - r1.radius) / (r2.radius - r1.radius);
        rColor = Math.random() < distCovered ? r2 : r1;
      }
      let color;
      if (y <= skyX) {
        color = rColor.skyColor;
      } else if (y >= groundX) {
        color = rColor.groundColor;
      } else {
        color =
          Math.random() < (y - skyX) / (groundX - skyX)
            ? rColor.groundColor
            : rColor.skyColor;
      }

      fill(color);
      square(x, y, scale);
    }
  }

  fill(far);
  rect(0, groundX, w, h);
  fill(middle);
  rect(0, groundMiddleX, w, h);
  fill(near);
  rect(0, groundNearX, w, h);

  noLoop();
}
