const w = 800;
const h = 800;

const SPACE_COLOR = "#000";

const NUM_STARS = 1000;

const MIN_STAR_DIAMETER = 0.5;
const MAX_STAR_DIAMETER = 8;
// The middle of the star is a solid circle, the outside is fuzzy
const STAR_POINT_DIAMETER = 1.5;

const stars = Array(NUM_STARS);

function pickStarColor() {
  const random = Math.random();
  if (random < 0.1) {
    // blue
    return "#c1e6f7";
  } else if (random < 0.5) {
    // white
    return "#fff";
  } else if (random < 0.8) {
    // yellow
    return "#e8c764";
  } else {
    // red
    return "e3573b";
  }
}

function setup() {
  createCanvas(w, h);

  for (let i = 0; i < NUM_STARS; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const diameter =
      MIN_STAR_DIAMETER +
      Math.random() * (MAX_STAR_DIAMETER - MIN_STAR_DIAMETER);
    const color = pickStarColor();
    stars[i] = { x, y, diameter, color };
  }
}

function drawStar(star) {
  const { x, y, diameter, color: starColor } = star;
  // Small stars are circles
  if (diameter <= STAR_POINT_DIAMETER) {
    fill(starColor);
    circle(x, y, diameter);
  } else {
    // Big stars have a gradient on the outside
    for (let d = diameter; d > STAR_POINT_DIAMETER; d -= 0.5) {
      const gradColor = lerpColor(
        color(starColor),
        color(SPACE_COLOR),
        Math.sqrt((d - STAR_POINT_DIAMETER) / (diameter - STAR_POINT_DIAMETER))
      );
      fill(gradColor);
      circle(x, y, d);
    }
    // The middle of the star is a circle
    fill(starColor);
    circle(x, y, STAR_POINT_DIAMETER);
  }
}

function draw() {
  background(SPACE_COLOR);

  noStroke();
  for (const star of stars) {
    drawStar(star);
  }

  noLoop();
}
