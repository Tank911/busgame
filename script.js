const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// HUD & Overlay Elements
const scoreEl = document.getElementById('score');
const passengersEl = document.getElementById('passengers');
const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScoreEl = document.getElementById('finalScore');
const finalPassengersEl = document.getElementById('finalPassengers');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Game Variables
let gameLoopId;
let score = 0;
let passengersCount = 0;
let gameSpeed = 4;
let isGameOver = false;

// Bus (Player) Object
const bus = {
  width: 40,
  height: 80,
  x: canvas.width / 2 - 20,
  y: canvas.height - 100,
  speed: 5,
  dx: 0,
  color: '#f59e0b'
};

// Controls
const keys = { left: false, right: false };

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
});

// Obstacles and Bus Stops
let obstacles = [];
let busStops = [];
let roadOffset = 0;

function spawnObstacle() {
  const laneWidth = canvas.width / 3;
  const lane = Math.floor(Math.random() * 3);
  const x = lane * laneWidth + (laneWidth - 35) / 2;
  obstacles.push({
    x: x,
    y: -70,
    width: 35,
    height: 65,
    color: ['#ef4444', '#3b82f6', '#10b981', '#8b5cf6'][Math.floor(Math.random() * 4)]
  });
}

function spawnBusStop() {
  const laneWidth = canvas.width / 3;
  const lane = Math.floor(Math.random() * 3);
  const x = lane * laneWidth + (laneWidth - 50) / 2;
  busStops.push({
    x: x,
    y: -50,
    width: 50,
    height: 40,
    active: true
  });
}

function startGame() {
  score = 0;
  passengersCount = 0;
  gameSpeed = 4;
  isGameOver = false;
  obstacles = [];
  busStops = [];
  bus.x = canvas.width / 2 - 20;

  scoreEl.textContent = score;
  passengersEl.textContent = passengersCount;

  startOverlay.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');

  cancelAnimationFrame(gameLoopId);
  gameLoop();
}

function gameOver() {
  isGameOver = true;
  finalScoreEl.textContent = Math.floor(score);
  finalPassengersEl.textContent = passengersCount;
  gameOverOverlay.classList.remove('hidden');
}

// Draw Functions
function drawRoad() {
  // Road base
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Lane Dividers
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.setLineDash([20, 20]);
  ctx.lineDashOffset = -roadOffset;

  const laneWidth = canvas.width / 3;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(i * laneWidth, 0);
    ctx.lineTo(i * laneWidth, canvas.height);
    ctx.stroke();
  }
  ctx.setLineDash([]); // Reset line dash
}

function drawBus() {
  // Bus Body
  ctx.fillStyle = bus.color;
  ctx.fillRect(bus.x, bus.y, bus.width, bus.height);

  // Windshield
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(bus.x + 4, bus.y + 6, bus.width - 8, 16);

  // Roof details / Windows
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(bus.x + 4, bus.y + 30, bus.width - 8, 4);
  ctx.fillRect(bus.x + 4, bus.y + 42, bus.width - 8, 4);
  ctx.fillRect(bus.x + 4, bus.y + 54, bus.width - 8, 4);

  // Headlights
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(bus.x + 2, bus.y, 8, 4);
  ctx.fillRect(bus.x + bus.width - 10, bus.y, 8, 4);
}

function drawObstacles() {
  obstacles.forEach((obs) => {
    ctx.fillStyle = obs.color;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

    // Car windshield
    ctx.fillStyle = '#000';
    ctx.fillRect(obs.x + 4, obs.y + obs.height - 18, obs.width - 8, 12);
  });
}

function drawBusStops() {
  busStops.forEach((stop) => {
    if (stop.active) {
      // Yellow Stop Zone
      ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
      ctx.fillRect(stop.x, stop.y, stop.width, stop.height);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.strokeRect(stop.x, stop.y, stop.width, stop.height);

      // Bus Stop Icon / Text
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.fillText('🚏 STOP', stop.x + 2, stop.y + 24);
    }
  });
}

// Update Game State
function update() {
  if (isGameOver) return;

  // Move road lines
  roadOffset = (roadOffset + gameSpeed) % 40;

  // Player Steering
  if (keys.left && bus.x > 0) bus.x -= bus.speed;
  if (keys.right && bus.x + bus.width < canvas.width) bus.x += bus.speed;

  // Increment Score
  score += 0.1;
  scoreEl.textContent = Math.floor(score);

  // Gradually increase game speed
  gameSpeed += 0.0005;

  // Spawning logic
  if (Math.random() < 0.02) spawnObstacle();
  if (Math.random() < 0.005) spawnBusStop();

  // Update Obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.y += gameSpeed;

    // Collision Detection (Bus vs Car)
    if (
      bus.x < obs.x + obs.width &&
      bus.x + bus.width > obs.x &&
      bus.y < obs.y + obs.height &&
      bus.y + bus.height > obs.y
    ) {
      gameOver();
    }

    // Remove off-screen obstacles
    if (obs.y > canvas.height) obstacles.splice(i, 1);
  }

  // Update Bus Stops
  for (let i = busStops.length - 1; i >= 0; i--) {
    const stop = busStops[i];
    stop.y += gameSpeed;

    // Pickup Passengers
    if (
      stop.active &&
      bus.x < stop.x + stop.width &&
      bus.x + bus.width > stop.x &&
      bus.y < stop.y + stop.height &&
      bus.y + bus.height > stop.y
    ) {
      stop.active = false;
      passengersCount += 1;
      score += 50; // Bonus points
      passengersEl.textContent = passengersCount;
    }

    // Remove off-screen bus stops
    if (stop.y > canvas.height) busStops.splice(i, 1);
  }
}

// Game Loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawRoad();
  drawBusStops();
  drawObstacles();
  drawBus();

  update();

  if (!isGameOver) {
    gameLoopId = requestAnimationFrame(gameLoop);
  }
}

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
