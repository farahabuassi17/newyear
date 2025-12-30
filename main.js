// =========================
// إعداد الـ Canvas
// =========================
const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// =========================
// كائنات الألعاب النارية
// =========================
const fireworks = [];
const particles = [];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function randomColor() {
  const colors = [
    "#ffd700",
    "#ffb347",
    "#ffcc66",
    "#ffdf80",
    "#fff1b8"
  ];


  return colors[Math.floor(Math.random() * colors.length)];
}

class Firework {
  constructor(sx, sy, tx, ty) {
    this.x = sx;
    this.y = sy;
    this.sx = sx;
    this.sy = sy;
    this.tx = tx;
    this.ty = ty;
    this.distanceToTarget = Math.hypot(tx - sx, ty - sy);
    this.distanceTraveled = 0;
    this.angle = Math.atan2(ty - sy, tx - sx);
    this.speed = random(4, 7);
    this.acceleration = 1.03;
    this.brightness = random(60, 80);
    this.trail = [];
    this.trailLength = 5;
    while (this.trail.length < this.trailLength) {
      this.trail.push({ x: this.x, y: this.y });
    }
  }

  update(index) {
    this.trail.pop();
    this.trail.unshift({ x: this.x, y: this.y });

    this.speed *= this.acceleration;
    const vx = Math.cos(this.angle) * this.speed;
    const vy = Math.sin(this.angle) * this.speed;
    this.x += vx;
    this.y += vy;

    this.distanceTraveled = Math.hypot(this.x - this.sx, this.y - this.sy);

    // إذا وصلت للهدف، انفجار
    if (this.distanceTraveled >= this.distanceToTarget) {
      createParticles(this.tx, this.ty);
      fireworks.splice(index, 1);
    }
  }

  draw() {
    ctx.beginPath();
    const last = this.trail[this.trail.length - 1];
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = `hsl(${this.brightness}, 100%, 70%)`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = random(0, Math.PI * 2);
    this.speed = random(1, 8);
    this.friction = 0.95;
    this.gravity = 0.03;
    this.hue = random(0, 360);
    this.brightness = random(50, 80);
    this.alpha = 1;
    this.decay = random(0.015, 0.03);
  }

  update(index) {
    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    this.alpha -= this.decay;

    if (this.alpha <= this.decay) {
      particles.splice(index, 1);
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
    ctx.fill();
    ctx.restore();
  }
}

// إنشاء Particles عند الانفجار
function createParticles(x, y) {
  const count = 50;
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y));
  }
}

// إطلاق ألعاب نارية عشوائية
function launchRandomFirework() {
  const startX = random(canvas.width * 0.2, canvas.width * 0.8);
  const startY = canvas.height;
  const targetX = random(canvas.width * 0.2, canvas.width * 0.8);
  const targetY = random(canvas.height * 0.1, canvas.height * 0.5);
  fireworks.push(new Firework(startX, startY, targetX, targetY));
}

// تفاعل بالماوس: لما نكبس في أي مكان تطلع لعبة نارية
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  fireworks.push(new Firework(canvas.width / 2, canvas.height, x, y));
});

// =========================
// حلقة الأنيميشن
// =========================
let lastTime = 0;
const interval = 500; // كل نصف ثانية نحاول نطلق لعبة نارية

function animate(timestamp) {
  requestAnimationFrame(animate);

  // خلفية شفافة بسيطة لترك أثر جميل
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "lighter";

  // تحديث / رسم الألعاب النارية
  fireworks.forEach((fw, idx) => {
    fw.update(idx);
    fw.draw();
  });

  // تحديث / رسم البارتيكلز
  particles.forEach((p, idx) => {
    p.update(idx);
    p.draw();
  });

  // إطلاق عشوائي
  if (timestamp - lastTime > interval) {
    launchRandomFirework();
    lastTime = timestamp;
  }
}

requestAnimationFrame(animate);