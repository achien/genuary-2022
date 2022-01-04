const w = 800;
const h = 800;

const SPACE_COLOR = "#000";

const NUM_STARS = 1000;

const MIN_STAR_DIAMETER = 0.5;
const MAX_STAR_DIAMETER = 8;
// The middle of the star is a solid circle, the outside is fuzzy
const STAR_POINT_DIAMETER = 1.5;

// pixels/second
const MAX_METEOR_DX = 100;
const MIN_METEOR_DY = 50;
const MAX_METEOR_DY = 200;
// milliseconds
const MIN_METEOR_DURATION = 2000;
const MAX_METEOR_DURATION = 5000;
const METEOR_FADE_IN = 250;
const METEOR_FADE_OUT = 500;

const METEOR_DIAMETER = 10;
const METEOR_COLOR = "#fff";
// in ms of travel time
const METEOR_TRAIL_LENGTH = 250;

let startTime;
let lastMeteorCreated;
let meteors = [];

let stars;

function randNum(min, max) {
  return min + Math.random() * (max - min);
}

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

function drawStar(star) {
  const { x, y, diameter, color: starColor } = star;
  noStroke();
  if (diameter <= STAR_POINT_DIAMETER) {
    // Small stars are circles
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

function setup() {
  createCanvas(w, h);

  for (let i = 0; i < NUM_STARS; i++) {
    drawStar({
      x: Math.random() * w,
      y: Math.random() * h,
      diameter: randNum(MIN_STAR_DIAMETER, MAX_STAR_DIAMETER),
      color: pickStarColor(),
    });
  }
  stars = get();

  startTime = performance.now();
  lastMeteorCreated = startTime;
}

function makeMeteor(now) {
  return {
    created: now,
    x: randNum(-50, w + 50),
    // Bias y towards the top of the viewport so the meteors fall longer
    y: Math.min(randNum(-50, h - 50), randNum(-50, h - 50)),
    dx: randNum(-MAX_METEOR_DX, MAX_METEOR_DX),
    dy: randNum(MIN_METEOR_DY, MAX_METEOR_DY),
    duration: randNum(MIN_METEOR_DURATION, MAX_METEOR_DURATION),
  };
}

function meteorColorAt(meteor, time) {
  const elapsed = time - meteor.created;
  const remaining = meteor.duration - elapsed;
  let meteorColor = color(METEOR_COLOR);
  if (elapsed < METEOR_FADE_IN) {
    meteorColor = lerpColor(
      color(SPACE_COLOR),
      color(METEOR_COLOR),
      elapsed / METEOR_FADE_IN
    );
  } else if (remaining < METEOR_FADE_OUT) {
    meteorColor = lerpColor(
      color(SPACE_COLOR),
      color(METEOR_COLOR),
      remaining / METEOR_FADE_OUT
    );
  }
  return meteorColor;
}

function drawMeteor(meteor, now) {
  const { created, x: initialX, y: initialY, dx, dy, duration } = meteor;
  const x = initialX + (dx * (now - created)) / 1000;
  const y = initialY + (dy * (now - created)) / 1000;

  const meteorColor = meteorColorAt(meteor, now);
  drawStar({
    x,
    y,
    diameter: METEOR_DIAMETER,
    color: meteorColor,
  });

  // Draw the trail
  const startTime = now - Math.min(METEOR_TRAIL_LENGTH, now - created);
  const startX = initialX + (dx * (startTime - created)) / 1000;
  const startY = initialY + (dy * (startTime - created)) / 1000;

  // Draw segments to make a gradient
  const SEGMENTS = 10;
  for (let i = 1; i <= SEGMENTS; i++) {
    // Calculate the meteor color when it passed over the segment, then
    // fade it out based on age
    const meteorColorAtSegment = meteorColorAt(
      meteor,
      startTime + ((i - 1) / SEGMENTS) * (now - startTime)
    );
    const segmentColor = lerpColor(
      color(SPACE_COLOR),
      color(meteorColorAtSegment),
      i / SEGMENTS
    );
    stroke(segmentColor);
    line(
      startX + ((x - startX) * (i - 1)) / SEGMENTS,
      startY + ((y - startY) * (i - 1)) / SEGMENTS,
      startX + ((x - startX) * i) / SEGMENTS,
      startY + ((y - startY) * i) / SEGMENTS
    );
  }
}

function draw() {
  background(SPACE_COLOR);

  image(stars, 0, 0);

  // Prune all stale meteors
  const now = performance.now();
  meteors = meteors.filter((m) => now - m.created <= m.duration);

  // Create a meteor if necessary. arctan is arbitrary; I want a function that
  // starts at 0 and is 1 at infinity to allow (theoretically) for arbitrarily
  // large gaps in meteors.
  const timeSinceLastMeteor = now - lastMeteorCreated;
  const shouldCreate =
    (PI / 2) * Math.random() < Math.atan(timeSinceLastMeteor / 30000);
  if (shouldCreate) {
    const meteor = makeMeteor(now);
    lastMeteorCreated = now;
    meteors.push(meteor);
  }

  for (const meteor of meteors) {
    drawMeteor(meteor, now);
  }
}
