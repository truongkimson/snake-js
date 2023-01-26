const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const SIZE = 20;
const PLAY_SIZE = SIZE - 2;
const unit = WIDTH / SIZE;
const step = 0.05;
const Direction = {
  Up: "ArrowUp",
  Down: "ArrowDown",
  Left: "ArrowLeft",
  Right: "ArrowRight",
};
const DELAY = 10;

// state
// snake coord array
let s = [];
// snake growing
let growing = 0;
// fruit coordinate
let f = {};
// input state
let currDir, cmd;
// game state
let gameOver = false;

// keypress listener
document.onkeydown = (e) => {
  if (Object.values(Direction).includes(e.key)) {
    cmd = e.key;
  }
};

const roundOff = (num) => {
  return Math.round(num * 1000) / 1000;
};

drawAt = (x, y, type) => {
  const draw = (x, y, color) => {
    ctx.fillStyle = color;
    console.log(roundOff(x));
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

getRandCoord = () => {
  const x = Math.floor(Math.random() * PLAY_SIZE) + 1;
  const y = Math.floor(Math.random() * PLAY_SIZE) + 1;
  return { x, y };
};

init = () => {
  // draw background
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // draw border
  const drawHorBricks = (x, y) => {
    for (let i = 0; i < SIZE; i++) {
      ctx.fillStyle = "white";
      ctx.fillRect(i * unit + 5, y, unit - 10, unit - 10);
    }
  };

  const drawVertBricks = (x, y) => {
    for (let i = 1; i < SIZE - 1; i++) {
      ctx.fillStyle = "white";
      ctx.fillRect(x, i * unit + 5, unit - 10, unit - 10);
    }
  };

  drawHorBricks(5, 5);
  drawHorBricks(5, HEIGHT - unit + 5);
  drawVertBricks(5, unit + 5);
  drawVertBricks(WIDTH - unit + 5, unit + 5);

  f = getRandCoord();
  let head = getRandCoord();
  while (head.x == f.x && head.y == f.y) {
    head = getRandCoord();
  }
  s.push(head);
};

render = () => {
  s.forEach(({ x, y }) => {
    drawAt(x, y, "snake");
  });

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

const dirChangeAllowed = () => {
  const head = s[0];
  return (
    Number.isInteger(roundOff(head.x)) && Number.isInteger(roundOff(head.y))
  );
};

const logic = () => {
  if (!cmd) {
    return;
  }

  let dir;
  if (isConflict(cmd, currDir) || !dirChangeAllowed()) {
    dir = currDir;
  } else {
    dir = cmd;
    currDir = cmd;
  }

  const head = s[0];
  switch (dir) {
    case Direction.Up:
      s.unshift({ x: head.x, y: head.y - step });
      break;
    case Direction.Down:
      s.unshift({ x: head.x, y: head.y + step });
      break;
    case Direction.Left:
      s.unshift({ x: head.x - step, y: head.y });
      break;
    case Direction.Right:
      s.unshift({ x: head.x + step, y: head.y });
      break;
  }

  const updatedHead = s[0];
  // check collide with fruit
  if (
    (roundOff(updatedHead.x) == roundOff(f.x) &&
      roundOff(updatedHead.y) == roundOff(f.y)) ||
    growing
  ) {
    if (growing == roundOff(1 / step)) {
      f = getRandCoord();
      growing = 0;
    } else {
      growing += 1;
    }
  } else {
    s.pop();
  }

  // check collide with wall
  if (
    roundOff(updatedHead.x) < 1 ||
    roundOff(updatedHead.x) > PLAY_SIZE ||
    roundOff(updatedHead.y) < 1 ||
    roundOff(updatedHead.y) > PLAY_SIZE
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

const startGame = () => {
  init();

  const intervalId = setInterval(() => {
    // console.log(s[0].x, s[0].y);
    if (!gameOver) {
      clear();
      logic();
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
  cmd = undefined;

  startGame();
};

const createBtn = () => {
  var btn = document.createElement("button");
  btn.innerHTML = "Play Again";
  btn.setAttribute("id", "restart-btn");
  btn.onclick = restart;
  document.getElementById("main").appendChild(btn);
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
  startGame();
};

main();
