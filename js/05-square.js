const W = 800;
const H = 800;

const S = 600;
const S_OFFSET_X = (W - S) / 2;
const S_OFFSET_Y = (H - S) / 2;

const GRID = 30;
const NUM_ERASERS = 30;
const ERASER_DIAM = Math.ceil(Math.sqrt(2) * (S / GRID));
const SPEED = 2;

const BG_COLOR = "#000";
const SQ_COLOR = "#fff";
const ERASER_COLOR = "#aa0055";

// const ERASER_COLORS = ["#f7ebec", "#ddbdd5", "#ac9fbb", "#59656f", "#1d1e2c"];
const ERASER_COLORS = ["#2b3a67", "#496a81", "#66999b", "#b3af8f", "#ffc482"];
// const ERASER_COLORS = ["#586ba4", "#324376", "#f5dd90", "#f68e5f", "#f76c5e"];
// const ERASER_COLORS = ["#8b1e3f", "#3c153b", "#89bd9e", "#f0c987", "#db4c40"];

let tick = 0;
let remaining = GRID * GRID;
let squares;
let targeted;
let erasers = [];

function randInt(a, b) {
  return a + Math.floor((b - a + 1) * Math.random());
}

function squareCenter(r, c) {
  return [
    S_OFFSET_X + (c + 0.5) * (S / GRID),
    S_OFFSET_Y + (r + 0.5) * (S / GRID),
  ];
}

function removeSquare(r, c) {
  if (squares[r][c]) {
    remaining--;
    squares[r][c] = false;
  }
}

function initErasers() {
  for (let i = 0; i < NUM_ERASERS; i++) {
    // Number outside squares clockwise starting from the top left square
    // and randomly pick one of them
    let r, c;
    let n = randInt(0, 4 * (GRID - 1) - 1);
    if (n < GRID - 1) {
      r = 0;
      c = n;
    } else if (n < 2 * (GRID - 1)) {
      const offset = n - (GRID - 1);
      r = offset;
      c = GRID - 1;
    } else if (n < 3 * (GRID - 1)) {
      const offset = n - 2 * (GRID - 1);
      r = GRID - 1;
      c = GRID - 1 - offset;
    } else {
      const offset = n - 3 * (GRID - 1);
      r = GRID - 1 - offset;
      c = 0;
    }
    const [x, y] = squareCenter(r, c);
    removeSquare(r, c);
    erasers.push({
      r,
      c,
      x,
      y,
      targetR: r,
      targetC: c,
      dx: 0,
      dy: 0,
      color: ERASER_COLORS[randInt(0, ERASER_COLORS.length - 1)],
    });
  }
}

function setup() {
  squares = Array(GRID);
  targeted = Array(GRID);
  for (let i = 0; i < GRID; i++) {
    squares[i] = Array(GRID);
    targeted[i] = Array(GRID);
    for (let j = 0; j < GRID; j++) {
      squares[i][j] = true;
      targeted[i][j] = null;
    }
  }
  initErasers();

  createCanvas(W, W);

  background(BG_COLOR);

  fill(SQ_COLOR);
  square(S_OFFSET_X, S_OFFSET_Y, S, ERASER_DIAM / 2);
}

function canTarget(eraser, r, c) {
  if (!squares[r][c]) {
    // Square is alredy erased
    return false;
  }

  if (targeted[r][c] !== null) {
    // Can steal the target if this eraser is closer
    const other = targeted[r][c];
    const thisDist = Math.abs(eraser.r - r) + Math.abs(eraser.c - c);
    const otherDist = Math.abs(other.r - r) + Math.abs(other.c - c);
    return thisDist < otherDist;
  }

  return true;
}

function retarget(eraser, depth = 0) {
  if (depth > 1000) {
    // Something has gone horribly wrong and we are endlessly retargeting erasers
    console.error("Retargeting loop", eraser.r, eraser.c);
    return;
  }

  const { r, c, targetR, targetC } = eraser;

  // 1. Pick a target square if necessary
  if (!squares[targetR][targetC] || targeted[targetR][targetC] !== eraser) {
    let eligible = [];
    for (let radius = 1; radius <= 2 * GRID; radius++) {
      // Check eligibility of all squares Manhattan distance radius from eraser
      for (let dr = -radius; dr <= radius; dr++) {
        if (r + dr < 0 || r + dr >= GRID) {
          continue;
        }
        const dcRight = radius - Math.abs(dr);
        const dcLeft = -dcRight;
        if (c + dcLeft >= 0 && canTarget(eraser, r + dr, c + dcLeft)) {
          eligible.push([r + dr, c + dcLeft]);
        }
        // Check right square if it is different from the left
        if (
          dcRight != 0 &&
          c + dcRight < GRID &&
          canTarget(eraser, r + dr, c + dcRight)
        ) {
          eligible.push([r + dr, c + dcRight]);
        }
      }
      if (eligible.length) {
        break;
      }
    }
    if (!eligible.length) {
      // We're out of targets
      eraser.targetR = r;
      eraser.targetC = c;
      eraser.dx = 0;
      eraser.dy = 0;
      return;
    }
    targeted[eraser.targetR][eraser.targetC] = null;
    const [newTargetR, newTargetC] = eligible[randInt(0, eligible.length - 1)];
    eraser.targetR = newTargetR;
    eraser.targetC = newTargetC;
    if (targeted[newTargetR][newTargetC] !== null) {
      // If we steal a target, retarget the other eraser.  I have no idea
      // if this can infinite loop or not so let's introduce a depth paramter
      // to prevent it from doing so even though I don't think it can.
      const other = targeted[newTargetR][newTargetC];
      targeted[newTargetR][newTargetC] = eraser;
      retarget(other, depth + 1);
    } else {
      targeted[newTargetR][newTargetC] = eraser;
    }
    // console.log(`Retargeting: (${r}, ${c}) => (${newTargetR}, ${newTargetC})`);
  }

  // 2. Pick a direction to travel in
  const dr = eraser.targetR - r;
  const dc = eraser.targetC - c;
  const randDir = randInt(0, 1);
  if (dr === 0 || (dc !== 0 && randDir === 0)) {
    eraser.dx = SPEED * Math.sign(dc);
    eraser.dy = 0;
  } else {
    eraser.dx = 0;
    eraser.dy = SPEED * Math.sign(dr);
  }
  // console.log(`Redirecting: (${r}, ${c}) along (${eraser.dy}, ${eraser.dx})`);
}

function draw() {
  if (tick % (S / GRID / SPEED) === 0) {
    // Erasers have reached squares. Clear the square and pick new targets.
    for (const eraser of erasers) {
      eraser.r += Math.sign(eraser.dy);
      eraser.c += Math.sign(eraser.dx);
      removeSquare(eraser.r, eraser.c);

      // Sanity check for now
      const [expectedX, expectedY] = squareCenter(eraser.r, eraser.c);
      if (expectedX !== eraser.x || expectedY !== eraser.y) {
        console.warn(
          `Eraser position incorrect: ` +
            `expected (${expectedX}, ${expectedY}), ` +
            `actual (${eraser.x}, ${eraser.y})`
        );
        noLoop();
        return;
      }
    }
    if (remaining === 0) {
      console.log("No squares remaining.");
      noLoop();
      return;
    }

    for (const eraser of erasers) {
      retarget(eraser);
    }
  }

  for (const eraser of erasers) {
    fill(BG_COLOR);
    noStroke();
    circle(eraser.x, eraser.y, ERASER_DIAM);
  }

  // Move all erasers
  let moved = false;
  for (const eraser of erasers) {
    eraser.x += eraser.dx;
    eraser.y += eraser.dy;
    moved = moved || eraser.dx !== 0 || eraser.dy !== 0;
  }
  if (!moved) {
    console.log("No erasers moved.");
    noLoop();
    return;
  }

  // noFill();
  // stroke(SQ_COLOR);
  // strokeWeight(1);
  // square(S_OFFSET_X, S_OFFSET_Y, S, ERASER_DIAM / 2);

  for (const eraser of erasers) {
    fill(eraser.color);
    noStroke();
    circle(eraser.x, eraser.y, ERASER_DIAM);
  }

  tick += 1;
}
