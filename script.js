const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const jumpBtn = document.getElementById('jumpBtn');
const overlay = document.getElementById('overlay');
const overlayContent = document.getElementById('overlayContent');
const overlayBtn = document.getElementById('overlayBtn');
const progressFill = document.getElementById('progressFill');
const platesCounterEl = document.getElementById('platesCounter');

const GROUND_OFFSET = 40;
const GRAVITY = 0.9;
const JUMP_VELOCITY = -15;
const SCROLL_SPEED = 4;
const TRAIN_SPEED = 3.2;
const CHAR_X = 60;

const CHECKPOINTS = [1400, 2900, 4400];
const STAGE_STARTS = [0, CHECKPOINTS[0], CHECKPOINTS[1]];
const REQUIRED_PLATES = 3;
const PLATE_Y_OFFSET = 80;
const PLATE_HIT_TOLERANCE = 40;
const FOOD_EMOJIS = ['🍛', '🍗', '🍰', '🥘'];

const BUILDING_PATTERN_WIDTH = 300;
const BUILDING_SHAPES = [
  { x: 10, w: 40, h: 70 },
  { x: 70, w: 55, h: 110 },
  { x: 140, w: 35, h: 55 },
  { x: 190, w: 60, h: 130 },
  { x: 260, w: 45, h: 85 },
];
const METRO_SPACING = 110;

const STAGE_INFO = [
  {
    title: '🎉 You\'re Invited!',
    body: 'A Walima invitation is waiting for you just up ahead...',
  },
  {
    title: '💍 Jemima & Nazmul',
    body: 'The bride and groom are tying the knot! Keep running to find out where and when.',
  },
];

let state = 'start';
let overlayMode = 'continue';
let distance = 0;
let charY = 0;
let velocity = 0;
let isJumping = false;
let barriers = [];
let plates = [];
let trees = [];
let stageIndex = 0;
let platesCollected = 0;
let nextBarrierAt = 0;
let nextPlateAt = 0;
let nextTreeAt = 0;
let flashTimer = 0;
let collectFlash = 0;
let bgOffset = 0;
let metroOffsetPx = 0;
let trainX = 300;
let confettiInterval = null;

function randomGap() {
  return 350 + Math.random() * 250;
}
function randomPlateGap() {
  return 260 + Math.random() * 220;
}
function randomTreeGap() {
  return 180 + Math.random() * 160;
}

function groundY() {
  return canvas.height - GROUND_OFFSET;
}

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
window.addEventListener('resize', resizeCanvas);

function resetToStageStart(idx) {
  distance = STAGE_STARTS[idx];
  charY = 0;
  velocity = 0;
  isJumping = false;
  barriers = [];
  plates = [];
  platesCollected = 0;
  nextBarrierAt = distance + randomGap();
  nextPlateAt = distance + randomPlateGap();
  flashTimer = 0;
}

function reset() {
  stageIndex = 0;
  resetToStageStart(0);
  trees = [];
  nextTreeAt = randomTreeGap();
  bgOffset = 0;
  metroOffsetPx = 0;
  trainX = canvas.width + 200;
}

function jump() {
  if (state !== 'running' || isJumping) return;
  velocity = JUMP_VELOCITY;
  isJumping = true;
}

function startGame() {
  resizeCanvas();
  reset();
  state = 'running';
  startScreen.classList.add('hidden');
  overlay.classList.add('hidden');
}

function stageReveal(index) {
  state = 'paused';
  overlayMode = 'continue';
  stageIndex = index + 1;
  barriers = [];
  plates = [];
  platesCollected = 0;
  nextBarrierAt = distance + randomGap();
  nextPlateAt = distance + randomPlateGap();
  const s = STAGE_INFO[index];
  overlayContent.innerHTML = `<h2>${s.title}</h2><p>${s.body}</p>`;
  overlayBtn.textContent = 'Continue';
  overlay.classList.remove('hidden');
}

function finalReveal() {
  state = 'finished';
  overlayMode = 'finished';
  stageIndex = CHECKPOINTS.length;
  overlayContent.innerHTML = `
    <h2>🎊 You Made It! 🎊</h2>
    <p class="names">Jemima <span class="amp">&amp;</span> Nazmul</p>
    <p>are getting married, and you're invited to the Walima!</p>
    <div class="details">
      <p>📍 Shiny Hotel and Co.<br>Mirpur 12, City Centre, 12th Floor</p>
      <p>📅 Saturday, August 1, 2026</p>
      <p>🕗 8:00 PM</p>
    </div>
    <p>We can't wait to celebrate with you!</p>
  `;
  overlayBtn.textContent = '🔁 Play Again';
  overlay.classList.remove('hidden');
  launchConfetti();
}

function triggerHit() {
  state = 'paused';
  overlayMode = 'retry';
  overlayContent.innerHTML = `<h2>💥 Oops!</h2><p>You hit a barrier — let's try that stretch again.</p>`;
  overlayBtn.textContent = 'Try Again';
  overlay.classList.remove('hidden');
}

function update() {
  distance += SCROLL_SPEED;
  bgOffset += SCROLL_SPEED * 0.25;
  metroOffsetPx += SCROLL_SPEED * 0.5;

  trainX -= TRAIN_SPEED;
  if (trainX < -80) {
    trainX = canvas.width + 100 + Math.random() * 150;
  }

  if (isJumping) {
    velocity += GRAVITY;
    charY += velocity;
    if (charY >= 0) {
      charY = 0;
      velocity = 0;
      isJumping = false;
    }
  }

  if (stageIndex < CHECKPOINTS.length && distance >= nextBarrierAt) {
    barriers.push({ x: canvas.width + 20, hit: false });
    nextBarrierAt = distance + randomGap();
  }
  if (stageIndex < CHECKPOINTS.length && distance >= nextPlateAt) {
    plates.push({
      x: canvas.width + 20,
      hit: false,
      emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
    });
    nextPlateAt = distance + randomPlateGap();
  }
  if (distance >= nextTreeAt) {
    trees.push({ x: canvas.width + 20, emoji: Math.random() > 0.3 ? '🌳' : '🌴' });
    nextTreeAt = distance + randomTreeGap();
  }

  barriers.forEach((b) => {
    b.x -= SCROLL_SPEED;
    if (!b.hit && Math.abs(b.x - CHAR_X) < 26 && charY > -18) {
      b.hit = true;
      triggerHit();
    }
  });
  barriers = barriers.filter((b) => b.x > -40);

  plates.forEach((p) => {
    p.x -= SCROLL_SPEED;
    if (!p.hit && Math.abs(p.x - CHAR_X) < 26 && Math.abs(charY - -PLATE_Y_OFFSET) < PLATE_HIT_TOLERANCE) {
      p.hit = true;
      platesCollected++;
      collectFlash = 8;
    }
  });
  plates = plates.filter((p) => p.x > -40 && !p.hit);

  trees.forEach((t) => (t.x -= SCROLL_SPEED));
  trees = trees.filter((t) => t.x > -60);

  if (
    stageIndex < CHECKPOINTS.length &&
    distance >= CHECKPOINTS[stageIndex] &&
    platesCollected >= REQUIRED_PLATES
  ) {
    if (stageIndex === CHECKPOINTS.length - 1) {
      finalReveal();
    } else {
      stageReveal(stageIndex);
    }
  }

  progressFill.style.width = `${Math.min(100, (distance / CHECKPOINTS[CHECKPOINTS.length - 1]) * 100)}%`;
  platesCounterEl.textContent = `🍽️ ${platesCollected}/${REQUIRED_PLATES}`;
}

function drawSky() {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#8ec9e8');
  grad.addColorStop(1, '#ffdca8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBuildings() {
  const gy = groundY();
  const offset = bgOffset % BUILDING_PATTERN_WIDTH;
  const tilesNeeded = Math.ceil(canvas.width / BUILDING_PATTERN_WIDTH) + 2;
  for (let t = -1; t < tilesNeeded; t++) {
    const baseX = t * BUILDING_PATTERN_WIDTH - offset;
    BUILDING_SHAPES.forEach((b, i) => {
      ctx.fillStyle = i % 2 === 0 ? '#7c6b86' : '#5f5069';
      ctx.fillRect(baseX + b.x, gy - b.h, b.w, b.h);
    });
  }
}

function drawMetro() {
  const gy = groundY();
  const railY = gy - Math.min(150, gy * 0.55);
  const offset = metroOffsetPx % METRO_SPACING;
  const count = Math.ceil(canvas.width / METRO_SPACING) + 2;

  ctx.strokeStyle = '#8a919b';
  ctx.lineWidth = 4;
  for (let i = -1; i < count; i++) {
    const px = i * METRO_SPACING - offset;
    ctx.beginPath();
    ctx.moveTo(px, railY);
    ctx.lineTo(px, gy);
    ctx.stroke();
  }

  ctx.strokeStyle = '#b0b8c1';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, railY);
  ctx.lineTo(canvas.width, railY);
  ctx.stroke();

  ctx.font = '28px serif';
  ctx.fillText('🚆', trainX, railY + 6);
}

function drawGround() {
  const gy = groundY();
  ctx.fillStyle = '#7fae5c';
  ctx.fillRect(0, gy - 6, canvas.width, 10);
  ctx.fillStyle = '#cbb994';
  ctx.fillRect(0, gy + 4, canvas.width, canvas.height - (gy + 4));
}

function drawTrees() {
  ctx.font = '30px serif';
  trees.forEach((t) => ctx.fillText(t.emoji, t.x, groundY() + 6));
}

function drawHotelMarker() {
  const hotelX = CHAR_X + (CHECKPOINTS[CHECKPOINTS.length - 1] - distance);
  if (hotelX < canvas.width + 50) {
    ctx.font = '40px serif';
    ctx.fillText('🏨', hotelX, groundY());
  }
}

function drawBarriers() {
  ctx.font = '30px serif';
  barriers.forEach((b) => ctx.fillText('🚧', b.x, groundY()));
}

function drawPlates() {
  ctx.font = '28px serif';
  plates.forEach((p) => ctx.fillText(p.emoji, p.x, groundY() - PLATE_Y_OFFSET));
}

function drawCharacter() {
  ctx.font = '34px serif';
  ctx.fillText('🏃', CHAR_X, groundY() + charY);
}

function drawFlash() {
  if (flashTimer > 0) {
    ctx.fillStyle = `rgba(220,50,50,${(flashTimer / 10) * 0.35})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    flashTimer--;
  }
  if (collectFlash > 0) {
    ctx.fillStyle = `rgba(243,217,139,${(collectFlash / 8) * 0.3})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    collectFlash--;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSky();
  drawBuildings();
  drawMetro();
  drawGround();
  drawTrees();
  drawHotelMarker();
  drawBarriers();
  drawPlates();
  drawCharacter();
  drawFlash();
}

function loop() {
  if (state === 'running') {
    update();
  }
  draw();
  requestAnimationFrame(loop);
}

function launchConfetti() {
  const colors = ['#f3d98b', '#c9a227', '#ffffff', '#e8a0bf'];
  confettiInterval = setInterval(() => {
    const piece = document.createElement('div');
    piece.className = 'confetti';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${2 + Math.random() * 2}s`;
    document.getElementById('game').appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }, 150);
}

function handleJump(e) {
  e.preventDefault();
  jump();
}

startBtn.addEventListener('click', startGame);
jumpBtn.addEventListener('touchstart', handleJump, { passive: false });
jumpBtn.addEventListener('click', handleJump);

overlayBtn.addEventListener('click', () => {
  if (overlayMode === 'finished') {
    clearInterval(confettiInterval);
    document.querySelectorAll('.confetti').forEach((el) => el.remove());
    reset();
    overlay.classList.add('hidden');
    startScreen.classList.remove('hidden');
    return;
  }
  if (overlayMode === 'retry') {
    resetToStageStart(stageIndex);
    overlay.classList.add('hidden');
    state = 'running';
    return;
  }
  overlay.classList.add('hidden');
  state = 'running';
});

resizeCanvas();
loop();
