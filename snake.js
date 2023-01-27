let canvas, ctx, scoreEl;
const WIDTH = 800;
const HEIGHT = 800;
const SIZE = 30;
const PLAY_SIZE = SIZE - 2;
const unit = WIDTH / SIZE;
const step = 0.05;
const TTL = 200; // in ms
const DELAY = 5; // in ms
const Direction = {
  Up: "ArrowUp",
  Down: "ArrowDown",
  Left: "ArrowLeft",
  Right: "ArrowRight",
};

// state
// snake coord array
let s = [];
// snake growing
let growing = 0;
// fruit coordinate
let f = {};
// input state
let currDir;
// game state
let gameOver = false;
// score
let score = 0;
// input q
let q = [];

// keypress listener
document.onkeydown = (e) => {
  if (Object.values(Direction).includes(e.key)) {
    var last = q[q.length - 1];
    if (last != e.key && last != e.key && !isConflict(e.key, last)) {
      q.push({ cmd: e.key, timestamp: Date.now() });
    }
  }
};

const roundOff = (num) => {
  return Math.round(num * 1000) / 1000;
};

const drawAt = (x, y, type) => {
  const draw = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(roundOff(x) * unit, roundOff(y) * unit, unit, unit);
  };

  switch (type) {
    case "snake":
      draw(x, y, "green");
      break;
    case "fruit":
      draw(x, y, "orange");
      break;
  }
};

const getRandCoord = () => {
  const x = Math.floor(Math.random() * PLAY_SIZE) + 1;
  const y = Math.floor(Math.random() * PLAY_SIZE) + 1;
  return { x, y };
};

const init = () => {
  scoreEl = document.getElementById("score");
  if (!scoreEl) {
    scoreEl = document.createElement("p");
    scoreEl.setAttribute("id", "score");
    scoreEl.innerText = "Score: 0";
    scoreEl.setAttribute(
      "style",
      "font-family:verdana; font-size: 2rem; color: blue;"
    );
    document.body.appendChild(scoreEl);
  }
  canvas = document.getElementById("screen");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.setAttribute("id", "screen");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    document.body.appendChild(canvas);
  }
  ctx = canvas.getContext("2d");
  // draw background
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // draw border
  const drawHorBricks = (x, y) => {
    for (let i = 0; i < SIZE; i++) {
      ctx.fillStyle = "white";
      ctx.fillRect(i * unit, y, unit, unit);
      ctx.lineWidth = 5;
      ctx.strokeStyle = "black";
      ctx.strokeRect(i * unit, y, unit, unit);
    }
  };

  const drawVertBricks = (x, y) => {
    for (let i = 1; i < SIZE - 1; i++) {
      ctx.fillStyle = "white";
      ctx.fillRect(x, i * unit, unit, unit);
      ctx.lineWidth = 5;
      ctx.strokeStyle = "black";
      ctx.strokeRect(x, i * unit, unit, unit);
    }
  };

  drawHorBricks(0, 0);
  drawHorBricks(0, HEIGHT - unit);
  drawVertBricks(0, unit);
  drawVertBricks(WIDTH - unit, unit);

  f = getRandCoord();
  let head = getRandCoord();
  while (head.x == f.x && head.y == f.y) {
    head = getRandCoord();
  }
  s.push(head);
};

const render = () => {
  for (let i = s.length - 1; i >= 0; i--) {
    drawAt(s[i].x, s[i].y, "snake");
  }

  drawAt(f.x, f.y, "fruit");
};

const clear = () => {
  ctx.fillStyle = "black";
  ctx.fillRect(unit, unit, WIDTH - 2 * unit, HEIGHT - 2 * unit);
};

const isConflict = (cmd, lastCmd) => {
  const Conflict = {
    ArrowUp: Direction.Down,
    ArrowDown: Direction.Up,
    ArrowLeft: Direction.Right,
    ArrowRight: Direction.Left,
  };
  return cmd == Conflict[lastCmd];
};

const inSquare = () => {
  const head = s[0];
  return Number.isInteger(head.x) && Number.isInteger(head.y);
};

const isCollided = (a, b) => {
  const delX = Math.abs(a.x - b.x);
  const delY = Math.abs(a.y - b.y);
  return delX < 1 && delY < 1;
};

const moveAndCheckCollision = (dir) => {
  const head = s[0];
  switch (dir) {
    case Direction.Up:
      s.unshift({ x: head.x, y: roundOff(head.y - step) });
      break;
    case Direction.Down:
      s.unshift({ x: head.x, y: roundOff(head.y + step) });
      break;
    case Direction.Left:
      s.unshift({ x: roundOff(head.x - step), y: head.y });
      break;
    case Direction.Right:
      s.unshift({ x: roundOff(head.x + step), y: head.y });
      break;
  }

  const updatedHead = s[0];
  // check collide with fruit
  if (isCollided(updatedHead, f) || growing) {
    f = {};
    if (growing == roundOff(1 / step)) {
      f = getRandCoord();
      growing = 0;
      score++;
      scoreEl.innerText = `Score: ${score}`;
    } else {
      growing += 1;
    }
  } else {
    s.pop();
  }

  // check collide with wall
  if (
    updatedHead.x < 1 ||
    updatedHead.x > PLAY_SIZE ||
    updatedHead.y < 1 ||
    updatedHead.y > PLAY_SIZE
  ) {
    gameOver = true;
  }

  // check self-collision
  for (let i = 1; i < s.length; i++) {
    if (s[i].x == updatedHead.x && s[i].y == updatedHead.y) {
      gameOver = true;
    }
  }
};

const isExpired = (timestamp) => {
  if (Date.now() > timestamp + TTL) {
    console.log("expired");
    return true;
  }
};

const logic = () => {
  // starting condition
  if (q.length == 0 && !currDir) {
    return;
  }

  let dir;
  if (!inSquare()) {
    dir = currDir;
    moveAndCheckCollision(dir);
    return;
  }

  // keep polling for non-expired input
  var input = q.shift();
  while (input && (isExpired(input.timestamp) || input.cmd == currDir)) {
    input = q.shift();
  }

  if (!input) {
    dir = currDir;
    moveAndCheckCollision(dir);
    return;
  }

  if (isConflict(input.cmd, currDir)) {
    dir = currDir;
    moveAndCheckCollision(dir);
    return;
  }

  dir = input.cmd;
  currDir = dir;
  console.log("switch to " + currDir);
  moveAndCheckCollision(dir);
};

const gameLoop = () => {
  const intervalId = setInterval(() => {
    if (!gameOver) {
      clear();
      console.log("dir " + currDir);
      console.log(q.map((i) => i.cmd).join(" "));
      logic();
      if (gameOver) {
        return;
      }
      render();
      return;
    }

    endGame(intervalId);
  }, DELAY);
};

const restart = () => {
  document.getElementById("restart-btn").remove();
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  gameOver = false;
  s = [];
  currDir = undefined;
  q = [];
  score = 0;

  main();
};

const createBtn = () => {
  var btn = document.createElement("button");
  btn.innerHTML = "Play Again";
  btn.setAttribute("id", "restart-btn");
  btn.onclick = restart;
  document.body.appendChild(btn);
};

const endGame = (id) => {
  clearInterval(id);
  ctx.font = "5rem sans-serif";
  ctx.fillStyle = "blue";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", WIDTH / 2, HEIGHT / 2);

  var btn = document.getElementById("restart-btn");
  if (!btn) {
    createBtn();
  }
};

const main = () => {
  init();
  gameLoop();
};

main();
