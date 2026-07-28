const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const jumpBtn = document.getElementById('jumpBtn');
const overlay = document.getElementById('overlay');
const overlayContent = document.getElementById('overlayContent');
const overlayBtn = document.getElementById('overlayBtn');
const progressFill = document.getElementById('progressFill');

const GROUND_OFFSET = 40;
const GRAVITY = 0.9;
const JUMP_VELOCITY = -15;
const SCROLL_SPEED = 4;
const CHAR_X = 60;
const CHECKPOINTS = [1400, 2900, 4400];

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
let distance = 0;
let charY = 0;
let velocity = 0;
let isJumping = false;
let barriers = [];
let nextBarrierAt = randomGap();
let stageIndex = 0;
let flashTimer = 0;
let confettiInterval = null;

function randomGap() {
  return 300 + Math.random() * 250;
}

function groundY() {
  return canvas.height - GROUND_OFFSET;
}

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
window.addEventListener('resize', resizeCanvas);

function reset() {
  distance = 0;
  charY = 0;
  velocity = 0;
  isJumping = false;
  barriers = [];
  nextBarrierAt = randomGap();
  stageIndex = 0;
  flashTimer = 0;
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
  stageIndex = index + 1;
  const s = STAGE_INFO[index];
  overlayContent.innerHTML = `<h2>${s.title}</h2><p>${s.body}</p>`;
  overlayBtn.textContent = 'Continue';
  overlay.classList.remove('hidden');
}

function finalReveal() {
  state = 'finished';
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

function update() {
  distance += SCROLL_SPEED;

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

  barriers.forEach((b) => {
    b.x -= SCROLL_SPEED;
    if (!b.hit && Math.abs(b.x - CHAR_X) < 26 && charY > -18) {
      b.hit = true;
      flashTimer = 10;
    }
  });
  barriers = barriers.filter((b) => b.x > -40);

  if (stageIndex < CHECKPOINTS.length && distance >= CHECKPOINTS[stageIndex]) {
    if (stageIndex === CHECKPOINTS.length - 1) {
      finalReveal();
    } else {
      stageReveal(stageIndex);
    }
  }

  progressFill.style.width = `${Math.min(100, (distance / CHECKPOINTS[CHECKPOINTS.length - 1]) * 100)}%`;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff8f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, groundY() + 20);
  ctx.lineTo(canvas.width, groundY() + 20);
  ctx.stroke();

  const hotelX = CHAR_X + (CHECKPOINTS[CHECKPOINTS.length - 1] - distance);
  if (hotelX < canvas.width + 50) {
    ctx.font = '36px serif';
    ctx.fillText('🏨', hotelX, groundY());
  }

  ctx.font = '30px serif';
  barriers.forEach((b) => ctx.fillText('🚧', b.x, groundY()));

  ctx.font = '34px serif';
  ctx.fillText('🏃', CHAR_X, groundY() + charY);

  if (flashTimer > 0) {
    ctx.fillStyle = `rgba(220,50,50,${(flashTimer / 10) * 0.35})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    flashTimer--;
  }
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
  if (state === 'finished') {
    clearInterval(confettiInterval);
    document.querySelectorAll('.confetti').forEach((el) => el.remove());
    reset();
    overlay.classList.add('hidden');
    startScreen.classList.remove('hidden');
    return;
  }
  overlay.classList.add('hidden');
  state = 'running';
});

resizeCanvas();
loop();
