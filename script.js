/* ═══════════════════════════════════════════════════════════════════
   PAOLO SABANEKH — PERSONAL WEBSITE
   script.js
   Includes: Navbar, Background, Pixel Fighters (JS port), Mini Games,
             Secret Customizer, Projects Drawer, Particles
═══════════════════════════════════════════════════════════════════ */

'use strict';

/* ════════════════════════════════════════════════════════════════
   1. NAVBAR & SCROLL
════════════════════════════════════════════════════════════════ */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);

  // Highlight active nav link
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
});

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

/* ════════════════════════════════════════════════════════════════
   2. SECTION REVEAL ON SCROLL
════════════════════════════════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.section').forEach(s => revealObserver.observe(s));

/* ════════════════════════════════════════════════════════════════
   3. BACKGROUND CANVAS (Stars / Grid / Waves / Matrix)
════════════════════════════════════════════════════════════════ */
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas.getContext('2d');
let bgMode = 'stars';
let bgAnimId = null;

function resizeBg() {
  bgCanvas.width = bgCanvas.offsetWidth;
  bgCanvas.height = bgCanvas.offsetHeight;
}
resizeBg();
window.addEventListener('resize', resizeBg);

// Stars
const stars = Array.from({ length: 200 }, () => ({
  x: Math.random(), y: Math.random(),
  r: Math.random() * 1.5 + 0.3,
  speed: Math.random() * 0.0003 + 0.0001,
  twinkle: Math.random() * Math.PI * 2
}));

// Matrix
const matrixCols = [];
function initMatrix() {
  const cols = Math.floor(bgCanvas.width / 16);
  matrixCols.length = 0;
  for (let i = 0; i < cols; i++) {
    matrixCols.push({ y: Math.random() * bgCanvas.height, speed: Math.random() * 3 + 1 });
  }
}

let bgT = 0;
function drawBg() {
  bgT++;
  const W = bgCanvas.width, H = bgCanvas.height;
  const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#00f5ff';

  bgCtx.clearRect(0, 0, W, H);

  if (bgMode === 'stars') {
    bgCtx.fillStyle = '#050510';
    bgCtx.fillRect(0, 0, W, H);
    stars.forEach(s => {
      s.twinkle += 0.02;
      const alpha = 0.4 + 0.6 * Math.abs(Math.sin(s.twinkle));
      bgCtx.beginPath();
      bgCtx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      bgCtx.fillStyle = `rgba(255,255,255,${alpha})`;
      bgCtx.fill();
      s.y -= s.speed;
      if (s.y < 0) s.y = 1;
    });
  } else if (bgMode === 'grid') {
    bgCtx.fillStyle = '#050510';
    bgCtx.fillRect(0, 0, W, H);
    bgCtx.strokeStyle = `rgba(0,245,255,0.08)`;
    bgCtx.lineWidth = 1;
    const gs = 60;
    for (let x = 0; x < W; x += gs) {
      bgCtx.beginPath(); bgCtx.moveTo(x, 0); bgCtx.lineTo(x, H); bgCtx.stroke();
    }
    for (let y = 0; y < H; y += gs) {
      bgCtx.beginPath(); bgCtx.moveTo(0, y); bgCtx.lineTo(W, y); bgCtx.stroke();
    }
    // Perspective grid
    const vp = { x: W / 2, y: H * 0.6 };
    bgCtx.strokeStyle = `rgba(0,245,255,0.04)`;
    for (let i = 0; i < 20; i++) {
      const x = (i / 20) * W;
      bgCtx.beginPath(); bgCtx.moveTo(x, H); bgCtx.lineTo(vp.x, vp.y); bgCtx.stroke();
    }
  } else if (bgMode === 'waves') {
    bgCtx.fillStyle = '#050510';
    bgCtx.fillRect(0, 0, W, H);
    for (let i = 0; i < 5; i++) {
      bgCtx.beginPath();
      bgCtx.moveTo(0, H / 2);
      for (let x = 0; x <= W; x += 5) {
        const y = H / 2 + Math.sin((x / W) * Math.PI * 4 + bgT * 0.02 + i) * (30 + i * 15);
        bgCtx.lineTo(x, y);
      }
      bgCtx.strokeStyle = `rgba(0,245,255,${0.04 + i * 0.02})`;
      bgCtx.lineWidth = 1.5;
      bgCtx.stroke();
    }
  } else if (bgMode === 'matrix') {
    bgCtx.fillStyle = 'rgba(5,5,16,0.1)';
    bgCtx.fillRect(0, 0, W, H);
    bgCtx.font = '14px monospace';
    matrixCols.forEach((col, i) => {
      const char = String.fromCharCode(0x30A0 + Math.random() * 96);
      bgCtx.fillStyle = `rgba(0,255,70,0.8)`;
      bgCtx.fillText(char, i * 16, col.y);
      col.y += col.speed;
      if (col.y > H) col.y = 0;
    });
  }

  bgAnimId = requestAnimationFrame(drawBg);
}
drawBg();

/* ════════════════════════════════════════════════════════════════
   4. FLOATING PARTICLES (global)
════════════════════════════════════════════════════════════════ */
let particlesEnabled = true;
const pCanvas = document.createElement('canvas');
pCanvas.id = 'particle-canvas';
document.body.appendChild(pCanvas);
const pCtx = pCanvas.getContext('2d');

function resizePCanvas() {
  pCanvas.width = window.innerWidth;
  pCanvas.height = window.innerHeight;
}
resizePCanvas();
window.addEventListener('resize', resizePCanvas);

const floatParticles = Array.from({ length: 40 }, () => createFloatParticle());
function createFloatParticle() {
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -Math.random() * 0.8 - 0.2,
    r: Math.random() * 3 + 1,
    alpha: Math.random() * 0.5 + 0.1,
    life: 1
  };
}

function drawParticles() {
  pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
  if (!particlesEnabled) { requestAnimationFrame(drawParticles); return; }

  const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#00f5ff';
  floatParticles.forEach((p, i) => {
    p.x += p.vx; p.y += p.vy;
    p.alpha -= 0.002;
    if (p.alpha <= 0 || p.y < -10) {
      floatParticles[i] = createFloatParticle();
      floatParticles[i].y = window.innerHeight + 10;
      return;
    }
    pCtx.beginPath();
    pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    pCtx.fillStyle = accent.replace(')', `,${p.alpha})`).replace('rgb', 'rgba').replace('#', 'rgba(').replace(')', ',)');
    // Simple approach:
    pCtx.fillStyle = `rgba(0,245,255,${p.alpha})`;
    pCtx.fill();
  });
  requestAnimationFrame(drawParticles);
}
drawParticles();

/* ════════════════════════════════════════════════════════════════
   5. PROJECTS DRAWER
════════════════════════════════════════════════════════════════ */
const menuBtn = document.getElementById('menu-btn');
const drawer = document.getElementById('projects-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const closeDrawer = document.getElementById('close-drawer');

function openDrawer() {
  drawer.classList.remove('hidden');
  drawerOverlay.classList.remove('hidden');
  setTimeout(() => { drawer.classList.add('open'); drawerOverlay.classList.add('open'); }, 10);
}
function closeDrawerFn() {
  drawer.classList.remove('open');
  drawerOverlay.classList.remove('open');
  setTimeout(() => { drawer.classList.add('hidden'); drawerOverlay.classList.add('hidden'); }, 400);
}

menuBtn.addEventListener('click', openDrawer);
closeDrawer.addEventListener('click', closeDrawerFn);
drawerOverlay.addEventListener('click', closeDrawerFn);

document.querySelectorAll('.project-card[data-target]').forEach(card => {
  card.addEventListener('click', () => {
    closeDrawerFn();
    setTimeout(() => scrollToSection(card.dataset.target), 500);
  });
});

/* ════════════════════════════════════════════════════════════════
   6. SECRET CUSTOMIZER (Ctrl+Shift+P)
════════════════════════════════════════════════════════════════ */
const customizer = document.getElementById('customizer');
const closeCustomizer = document.getElementById('close-customizer');

let custOpen = false;
function toggleCustomizer() {
  custOpen = !custOpen;
  customizer.classList.toggle('hidden', !custOpen);
}

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'P') {
    e.preventDefault();
    toggleCustomizer();
  }
});
closeCustomizer.addEventListener('click', toggleCustomizer);

// Color swatches
document.querySelectorAll('.swatch').forEach(sw => {
  sw.addEventListener('click', () => {
    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
    sw.classList.add('active');
    const color = sw.dataset.color;
    document.body.className = document.body.className.replace(/theme-\w+/, '');
    if (color !== 'cyan') document.body.classList.add('theme-' + color);
    updateAccentColor(color);
  });
});

function updateAccentColor(color) {
  const map = {
    cyan: '#00f5ff', purple: '#bf00ff', green: '#00ff88',
    red: '#ff3355', gold: '#ffd700', orange: '#ff6600'
  };
  document.documentElement.style.setProperty('--accent', map[color] || '#00f5ff');
}

// Background buttons
document.querySelectorAll('.bg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    bgMode = btn.dataset.bg;
    if (bgMode === 'matrix') initMatrix();
  });
});

// Font buttons
document.querySelectorAll('.font-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.font-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const fontMap = {
      pixel: "'Press Start 2P', monospace",
      orbitron: "'Orbitron', sans-serif",
      rajdhani: "'Rajdhani', sans-serif"
    };
    document.documentElement.style.setProperty('--font-main', fontMap[btn.dataset.font]);
  });
});

// Particles toggle
document.getElementById('particles-toggle').addEventListener('change', (e) => {
  particlesEnabled = e.target.checked;
  if (!particlesEnabled) pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
});

// Scanlines toggle
document.getElementById('scanlines-toggle').addEventListener('change', (e) => {
  document.getElementById('scanlines').classList.toggle('hidden', !e.target.checked);
});

/* ════════════════════════════════════════════════════════════════
   7. PIXEL FIGHTERS — JAVASCRIPT PORT
════════════════════════════════════════════════════════════════ */
const PF = (() => {
  const canvas = document.getElementById('pf-canvas');
  const ctx = canvas.getContext('2d');
  const W = 900, H = 550;

  // Characters
  const CHARACTERS = [
    { name: 'MeleeKnight',  color: '#dc3c3c', accent: '#ffa0a0', type: 0,
      desc: 'Powerful melee fighter with lunging special' },
    { name: 'MagicFist',    color: '#3cc83c', accent: '#a0ffa0', type: 1,
      desc: 'Fast puncher with power punch special' },
    { name: 'LaserMage',    color: '#5050e6', accent: '#9696ff', type: 2,
      desc: 'Ranged fighter with homing laser bolts' },
    { name: 'ShadowNinja',  color: '#c8c800', accent: '#ffff78', type: 3,
      desc: 'Agile ninja with shadow slice special' },
    { name: 'OrbSorcerer',  color: '#00c8c8', accent: '#78ffff', type: 4,
      desc: 'Summons orb bursts to overwhelm enemies' },
  ];

  // Platforms
  const PLATFORMS = [
    { x: 0,   y: 500, w: W,   h: 50 },
    { x: 200, y: 370, w: 200, h: 18 },
    { x: 500, y: 320, w: 200, h: 18 },
    { x: 100, y: 230, w: 150, h: 18 },
    { x: 650, y: 180, w: 150, h: 18 },
  ];

  const GRAVITY = 0.55;
  const BLAST_BOTTOM = H + 80;
  const BLAST_SIDE = 120;

  let p1 = null, p2 = null;
  let projectiles = [], particles = [];
  let paused = false;
  let gameRunning = false;
  let animId = null;
  let keys = {};

  // Controls
  const P1_CTRL = { left: 'a', right: 'd', up: 'w', attack: 'f', special: 'g', shield: 'q' };
  const P2_CTRL = { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', attack: 'k', special: 'l', shield: 'p' };

  class Fighter {
    constructor(x, charData, controls, playerNum) {
      this.x = x; this.y = 400;
      this.w = 36; this.h = 48;
      this.vx = 0; this.vy = 0;
      this.onGround = false;
      this.jumpsLeft = 2;
      this.color = charData.color;
      this.accent = charData.accent;
      this.name = charData.name;
      this.type = charData.type;
      this.ctrl = controls;
      this.playerNum = playerNum;
      this.lives = 3;
      this.damage = 0;
      this.stamina = 100;
      this.shielding = false;
      this.isAttacking = false;
      this.attackTimer = 0;
      this.attackRect = null;
      this.specialAttack = false;
      this.charging = false;
      this.chargeTime = 0;
      this.maxCharge = 60;
      this.knockbackX = 0;
      this.flashTimer = 0;
      this.facing = playerNum === 1 ? 1 : -1;
      this.animFrame = 0;
      this.jumpPressed = false;
      this.attackPressed = false;
      this.specialHeld = false;
    }

    get rect() {
      return { x: this.x, y: this.y, w: this.w, h: this.h,
               right: this.x + this.w, bottom: this.y + this.h,
               cx: this.x + this.w / 2, cy: this.y + this.h / 2 };
    }

    move(other) {
      const speed = 4.5;
      let moving = false;

      if (!this.shielding) {
        if (keys[this.ctrl.left])  { this.vx = -speed; this.facing = -1; moving = true; }
        if (keys[this.ctrl.right]) { this.vx =  speed; this.facing =  1; moving = true; }
        if (!keys[this.ctrl.left] && !keys[this.ctrl.right]) this.vx *= 0.7;
      } else {
        this.vx *= 0.5;
      }

      // Jump
      if (keys[this.ctrl.up] && !this.jumpPressed && this.jumpsLeft > 0) {
        this.vy = -13; this.jumpsLeft--; this.jumpPressed = true;
      }
      if (!keys[this.ctrl.up]) this.jumpPressed = false;

      // Attack
      if (keys[this.ctrl.attack] && !this.attackPressed && !this.isAttacking) {
        this.startAttack(false, other);
        this.attackPressed = true;
      }
      if (!keys[this.ctrl.attack]) this.attackPressed = false;

      // Special
      if (keys[this.ctrl.special]) {
        if (!this.charging) { this.charging = true; this.chargeTime = 0; }
        this.chargeTime++;
        this.specialHeld = true;
      } else if (this.specialHeld) {
        this.releaseSpecial(other);
        this.specialHeld = false;
      }

      // Shield
      this.shielding = !!keys[this.ctrl.shield];

      // Gravity
      this.vy += GRAVITY;
      this.y += this.vy;
      this.x += this.vx;

      // Knockback
      this.x += this.knockbackX;
      this.knockbackX *= 0.8;

      // Platform collision
      this.onGround = false;
      PLATFORMS.forEach(plat => {
        if (this.x < plat.x + plat.w && this.x + this.w > plat.x &&
            this.y + this.h > plat.y && this.y + this.h < plat.y + plat.h + 20 &&
            this.vy >= 0) {
          this.y = plat.y - this.h;
          this.vy = 0;
          this.onGround = true;
          this.jumpsLeft = 2;
        }
      });

      // Player collision
      const r = this.rect, o = other.rect;
      if (r.x < o.right && r.right > o.x && r.y < o.bottom && r.bottom > o.y) {
        if (r.cx < o.cx) this.x = o.x - this.w;
        else this.x = o.right;
      }

      if (moving) this.animFrame = (this.animFrame + 0.2) % 4;
      else this.animFrame = 0;

      if (this.flashTimer > 0) this.flashTimer--;

      // Stamina
      if (this.shielding) {
        this.stamina = Math.max(0, this.stamina - 0.4);
        if (this.stamina <= 0) this.shielding = false;
      } else {
        this.stamina = Math.min(100, this.stamina + 0.3);
      }
    }

    startAttack(special, other) {
      if (special) return;
      if (!this.isAttacking) {
        this.isAttacking = true;
        this.attackTimer = 20;
        this.specialAttack = false;
        const dir = this.facing;
        const aw = 50, ah = 30;
        const ax = dir === 1 ? this.x + this.w : this.x - aw;
        this.attackRect = { x: ax, y: this.y + 10, w: aw, h: ah };
      }
    }

    releaseSpecial(other) {
      if (!this.charging) return;
      const pct = Math.min(this.chargeTime / this.maxCharge, 1);
      const dir = this.x + this.w / 2 < other.x + other.w / 2 ? 1 : -1;

      if (this.type === 0) { // MeleeKnight lunge
        const aw = 55 + Math.floor(15 * pct);
        const ax = dir === 1 ? this.x + this.w : this.x - aw;
        this.attackRect = { x: ax, y: this.y + 15, w: aw, h: 30 };
        this.isAttacking = true; this.attackTimer = 18; this.specialAttack = true;
      } else if (this.type === 1) { // MagicFist power punch
        const aw = 45 + Math.floor(15 * pct);
        const ax = dir === 1 ? this.x + this.w : this.x - aw;
        this.attackRect = { x: ax, y: this.y, w: aw, h: 40 };
        this.isAttacking = true; this.attackTimer = 14; this.specialAttack = true;
      } else if (this.type === 2) { // LaserMage homing bolt
        const speed = 8 + 4 * pct;
        projectiles.push(new Projectile(
          this.x + this.w / 2, this.y + this.h / 2,
          other, '#50dcff', 10 + Math.floor(6 * pct), 10 + Math.floor(5 * pct), speed
        ));
      } else if (this.type === 3) { // ShadowNinja slice
        const ax = dir === 1 ? this.x + this.w : this.x - 35;
        this.attackRect = { x: ax, y: this.y - 5, w: 35, h: this.h + 10 };
        this.isAttacking = true; this.attackTimer = 14; this.specialAttack = true;
      } else if (this.type === 4) { // OrbSorcerer burst
        const count = 3 + Math.floor(2 * pct);
        for (let i = 0; i < count; i++) {
          const ox = (Math.random() - 0.5) * 40;
          const oy = (Math.random() - 0.5) * 40;
          projectiles.push(new Projectile(
            this.x + this.w / 2 + ox, this.y + this.h / 2 + oy,
            other, '#dc3cff', 7 + Math.floor(3 * pct), 7 + Math.floor(3 * pct)
          ));
        }
      }

      // Burst particles
      for (let i = 0; i < 12; i++) {
        particles.push(new Particle(this.x + this.w / 2, this.y + this.h / 2, this.accent));
      }
      this.charging = false; this.chargeTime = 0;
    }

    updateAttack(other) {
      if (!this.isAttacking) return;
      this.attackTimer--;
      if (this.attackTimer <= 0) {
        this.isAttacking = false; this.attackRect = null;
      }
      if (this.attackRect && !other.shielding && other.flashTimer <= 0) {
        const r = this.attackRect, o = other.rect;
        if (r.x < o.right && r.x + r.w > o.x && r.y < o.bottom && r.y + r.h > o.y) {
          const base = this.specialAttack ? 12 : 7;
          const kb = (base + other.damage * 0.15) * (this.specialAttack ? 1.5 : 1);
          const dir = o.cx > this.x + this.w / 2 ? 1 : -1;
          other.knockbackX = kb * dir;
          other.vy = -kb * 0.5;
          other.damage += base;
          other.flashTimer = 20;
          for (let i = 0; i < 8; i++) {
            particles.push(new Particle(o.cx, o.cy, other.accent));
          }
        }
      }
    }

    checkFall() {
      if (this.y > BLAST_BOTTOM || this.x + this.w < -BLAST_SIDE || this.x > W + BLAST_SIDE) {
        this.lives--;
        this.damage = 0;
        this.x = this.playerNum === 1 ? 200 : 650;
        this.y = 300;
        this.vx = 0; this.vy = 0;
        this.knockbackX = 0;
        this.flashTimer = 60;
      }
    }

    draw() {
      const r = this.rect;
      const flash = this.flashTimer > 0 && Math.floor(this.flashTimer / 4) % 2 === 0;
      if (flash) return;

      // Shield
      if (this.shielding) {
        ctx.beginPath();
        ctx.arc(r.cx, r.cy, 28, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100,200,255,0.25)`;
        ctx.fill();
        ctx.strokeStyle = `rgba(100,200,255,0.8)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Body
      const bob = Math.sin(this.animFrame * Math.PI / 2) * 2;
      ctx.fillStyle = this.color;
      ctx.fillRect(r.x + 4, r.y + bob, this.w - 8, this.h - 16);

      // Head
      ctx.fillStyle = this.accent;
      ctx.fillRect(r.x + 6, r.y - 14 + bob, this.w - 12, 18);

      // Eyes
      ctx.fillStyle = '#000';
      const eyeDir = this.facing === 1 ? 4 : -4;
      ctx.fillRect(r.x + this.w / 2 + eyeDir - 3, r.y - 10 + bob, 4, 4);

      // Legs animation
      const legOff = Math.sin(this.animFrame * Math.PI / 2) * 4;
      ctx.fillStyle = this.color;
      ctx.fillRect(r.x + 4, r.y + this.h - 16 + bob, 12, 16 + legOff);
      ctx.fillRect(r.x + this.w - 16, r.y + this.h - 16 + bob, 12, 16 - legOff);

      // Name tag
      ctx.font = '10px Orbitron, sans-serif';
      ctx.fillStyle = this.accent;
      ctx.textAlign = 'center';
      ctx.fillText(this.name, r.cx, r.y - 20 + bob);

      // Attack rect
      if (this.isAttacking && this.attackRect) {
        const ar = this.attackRect;
        ctx.fillStyle = this.specialAttack
          ? `rgba(255,220,0,0.5)` : `rgba(255,255,255,0.35)`;
        ctx.fillRect(ar.x, ar.y, ar.w, ar.h);
        ctx.strokeStyle = this.specialAttack ? '#ffd700' : '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(ar.x, ar.y, ar.w, ar.h);
      }

      // Charge bar
      if (this.charging) {
        const pct = Math.min(this.chargeTime / this.maxCharge, 1);
        ctx.fillStyle = 'rgba(60,60,60,0.8)';
        ctx.fillRect(r.cx - 20, r.y - 30, 40, 7);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(r.cx - 20, r.y - 30, 40 * pct, 7);
      }
    }
  }

  class Projectile {
    constructor(x, y, target, color, dmg, r, speed = 7) {
      this.x = x; this.y = y;
      this.target = target;
      this.color = color;
      this.dmg = dmg;
      this.r = r;
      this.speed = speed;
      this.active = true;
      this.life = 180;
    }
    update() {
      this.life--;
      if (this.life <= 0) { this.active = false; return; }
      const dx = (this.target.x + this.target.w / 2) - this.x;
      const dy = (this.target.y + this.target.h / 2) - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;

      // Hit check
      const t = this.target.rect;
      if (this.x > t.x && this.x < t.right && this.y > t.y && this.y < t.bottom) {
        if (!this.target.shielding && this.target.flashTimer <= 0) {
          const dir = this.x < t.cx ? -1 : 1;
          const kb = (this.dmg + this.target.damage * 0.1);
          this.target.knockbackX = kb * dir * -1;
          this.target.vy = -kb * 0.4;
          this.target.damage += this.dmg;
          this.target.flashTimer = 15;
          for (let i = 0; i < 6; i++) {
            particles.push(new Particle(this.x, this.y, this.color));
          }
        }
        this.active = false;
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  class Particle {
    constructor(x, y, color) {
      this.x = x; this.y = y;
      this.vx = (Math.random() - 0.5) * 6;
      this.vy = (Math.random() - 0.5) * 6 - 2;
      this.life = 1;
      this.decay = Math.random() * 0.04 + 0.02;
      this.r = Math.random() * 4 + 2;
      this.color = color;
    }
    update() { this.x += this.vx; this.y += this.vy; this.vy += 0.2; this.life -= this.decay; }
    draw() {
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawScene() {
    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0a0a2e');
    grad.addColorStop(1, '#1a0a3e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i = 0; i < 60; i++) {
      const sx = ((i * 137 + 50) % W);
      const sy = ((i * 97 + 30) % (H * 0.7));
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Platforms
    PLATFORMS.forEach((plat, i) => {
      const pg = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.h);
      pg.addColorStop(0, i === 0 ? '#3a3a6a' : '#2a5a8a');
      pg.addColorStop(1, i === 0 ? '#1a1a4a' : '#1a3a5a');
      ctx.fillStyle = pg;
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      ctx.fillStyle = i === 0 ? '#5a5aaa' : '#4a8aaa';
      ctx.fillRect(plat.x, plat.y, plat.w, 3);
    });
  }

  function drawHUD() {
    // Player 1 HUD
    drawPlayerHUD(p1, 20, 16);
    // Player 2 HUD
    drawPlayerHUD(p2, W - 220, 16, true);

    // Center timer / pause
    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = 'bold 36px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffd700';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', W / 2, H / 2);
      ctx.font = '12px Orbitron, sans-serif';
      ctx.fillStyle = '#aaa';
      ctx.fillText('Press ESC to resume', W / 2, H / 2 + 40);
    }
  }

  function drawPlayerHUD(p, x, y, flip = false) {
    const w = 200;
    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(x, y, w, 80);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, 80);

    // Name
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = p.accent;
    ctx.textAlign = flip ? 'right' : 'left';
    ctx.fillText(p.name, flip ? x + w - 8 : x + 8, y + 18);

    // Lives
    ctx.font = '11px Orbitron, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = flip ? 'right' : 'left';
    ctx.fillText('Lives: ' + '♥'.repeat(p.lives), flip ? x + w - 8 : x + 8, y + 36);

    // Damage %
    const dmgColor = p.damage < 50 ? '#00ff88' : p.damage < 100 ? '#ffd700' : '#ff3355';
    ctx.font = 'bold 18px Orbitron, sans-serif';
    ctx.fillStyle = dmgColor;
    ctx.fillText(p.damage + '%', flip ? x + w - 8 : x + 8, y + 58);

    // Stamina bar
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(x + 8, y + 66, w - 16, 8);
    const stW = ((w - 16) * p.stamina) / 100;
    ctx.fillStyle = p.shielding ? '#4488ff' : '#00ff88';
    ctx.fillRect(x + 8, y + 66, stW, 8);
  }

  function gameLoop() {
    if (!gameRunning) return;
    drawScene();
    p1.move(p2);
    p2.move(p1);
    p1.updateAttack(p2);
    p2.updateAttack(p1);
    p1.checkFall();
    p2.checkFall();

    projectiles.forEach(pr => pr.update());
    projectiles = projectiles.filter(pr => pr.active);
    particles.forEach(pt => pt.update());
    particles = particles.filter(pt => pt.life > 0);

    particles.forEach(pt => pt.draw());
    p1.draw();
    p2.draw();
    projectiles.forEach(pr => pr.draw());
    drawHUD();

    if (p1.lives <= 0) { endGame(p2); return; }
    if (p2.lives <= 0) { endGame(p1); return; }

    animId = requestAnimationFrame(gameLoop);
  }

  function endGame(winner) {
    gameRunning = false;
    cancelAnimationFrame(animId);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    showWinScreen(winner);
  }

  function showWinScreen(winner) {
    document.getElementById('pf-game').classList.add('hidden');
    const winEl = document.getElementById('pf-win');
    winEl.classList.remove('hidden');
    document.getElementById('win-text').textContent = winner.name + ' WINS!';
    document.getElementById('win-text').style.color = winner.color;
    launchFireworks(winner.color);
  }

  function launchFireworks(color) {
    const fw = document.getElementById('win-fireworks');
    fw.innerHTML = '';
    for (let i = 0; i < 20; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        position:absolute; width:8px; height:8px; border-radius:50%;
        background:${color}; left:${Math.random()*100}%;
        top:${Math.random()*100}%; animation:firework 1s ease-out ${Math.random()*0.5}s both;
      `;
      fw.appendChild(dot);
    }
  }

  function onKeyDown(e) {
    keys[e.key] = true;
    if (e.key === 'Escape' && gameRunning) paused = !paused;
    // Prevent arrow key scrolling during game
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
      const gameVisible = !document.getElementById('pf-game').classList.contains('hidden');
      if (gameVisible) e.preventDefault();
    }
  }
  function onKeyUp(e) { keys[e.key] = false; }

  // Character select UI
  function buildCharSelect() {
    const p1c = document.getElementById('p1-chars');
    const p2c = document.getElementById('p2-chars');
    p1c.innerHTML = ''; p2c.innerHTML = '';

    let p1sel = null, p2sel = null;

    CHARACTERS.forEach((ch, i) => {
      [p1c, p2c].forEach((container, pi) => {
        const card = document.createElement('div');
        card.className = 'char-card';
        card.innerHTML = `
          <div class="char-swatch" style="background:${ch.color}"></div>
          <div>
            <div class="char-name">${ch.name}</div>
            <div class="char-desc">${ch.desc}</div>
          </div>
        `;
        card.addEventListener('click', () => {
          container.querySelectorAll('.char-card').forEach(c => {
            c.classList.remove('selected', 'selected-p2');
          });
          card.classList.add(pi === 0 ? 'selected' : 'selected-p2');
          if (pi === 0) {
            p1sel = i;
            document.getElementById('p1-preview').textContent = ch.name + ' selected!';
            document.getElementById('p1-preview').style.color = ch.color;
          } else {
            p2sel = i;
            document.getElementById('p2-preview').textContent = ch.name + ' selected!';
            document.getElementById('p2-preview').style.color = ch.color;
          }
          document.getElementById('pf-start-btn').disabled = !(p1sel !== null && p2sel !== null);
        });
        container.appendChild(card);
      });
    });

    document.getElementById('pf-start-btn').addEventListener('click', () => {
      if (p1sel === null || p2sel === null) return;
      startGame(CHARACTERS[p1sel], CHARACTERS[p2sel]);
    });
  }

  function startGame(c1, c2) {
    document.getElementById('pf-char-select').classList.add('hidden');
    document.getElementById('pf-game').classList.remove('hidden');
    document.getElementById('pf-win').classList.add('hidden');

    p1 = new Fighter(200, c1, P1_CTRL, 1);
    p2 = new Fighter(650, c2, P2_CTRL, 2);
    projectiles = []; particles = [];
    paused = false; gameRunning = true; keys = {};

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    cancelAnimationFrame(animId);
    gameLoop();
  }

  // Init
  buildCharSelect();

  document.getElementById('pf-quit-btn').addEventListener('click', () => {
    gameRunning = false;
    cancelAnimationFrame(animId);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    document.getElementById('pf-game').classList.add('hidden');
    document.getElementById('pf-win').classList.add('hidden');
    document.getElementById('pf-char-select').classList.remove('hidden');
  });

  document.getElementById('pf-rematch-btn').addEventListener('click', () => {
    document.getElementById('pf-win').classList.add('hidden');
    document.getElementById('pf-char-select').classList.remove('hidden');
  });

  document.getElementById('pf-menu-btn').addEventListener('click', () => {
    document.getElementById('pf-win').classList.add('hidden');
    document.getElementById('pf-char-select').classList.remove('hidden');
  });

  // Add firework animation
  const fwStyle = document.createElement('style');
  fwStyle.textContent = `
    @keyframes firework {
      0% { transform: scale(0) translate(0,0); opacity:1; }
      100% { transform: scale(1) translate(${Math.random()*200-100}px, ${Math.random()*-200}px); opacity:0; }
    }
    #win-fireworks { position:relative; width:100%; height:80px; overflow:visible; }
  `;
  document.head.appendChild(fwStyle);
})();

/* ════════════════════════════════════════════════════════════════
   8. MINI GAMES — TAB SWITCHING
════════════════════════════════════════════════════════════════ */
document.querySelectorAll('.mini-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.mini-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const game = tab.dataset.game;
    document.querySelectorAll('.mini-game').forEach(g => g.classList.add('hidden'));
    document.getElementById('game-' + game).classList.remove('hidden');
  });
});

/* ════════════════════════════════════════════════════════════════
   9. MINI GAME — SNAKE
════════════════════════════════════════════════════════════════ */
const Snake = (() => {
  const canvas = document.getElementById('snake-canvas');
  const ctx = canvas.getContext('2d');
  const CELL = 20, COLS = 20, ROWS = 20;
  let snake, dir, food, score, hiScore = 0, running = false, animId;

  function init() {
    snake = [{ x: 10, y: 10 }];
    dir = { x: 1, y: 0 };
    placeFood();
    score = 0;
    document.getElementById('snake-score').textContent = '0';
  }

  function placeFood() {
    food = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS)
    };
  }

  function draw() {
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(0,245,255,0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, canvas.height); ctx.stroke();
    }
    for (let j = 0; j <= ROWS; j++) {
      ctx.beginPath(); ctx.moveTo(0, j * CELL); ctx.lineTo(canvas.width, j * CELL); ctx.stroke();
    }

    // Food
    ctx.fillStyle = '#ff3355';
    ctx.shadowBlur = 10; ctx.shadowColor = '#ff3355';
    ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);
    ctx.shadowBlur = 0;

    // Snake
    snake.forEach((seg, i) => {
      const t = i / snake.length;
      ctx.fillStyle = i === 0 ? '#00f5ff' : `rgba(0,${Math.floor(200 - t * 100)},255,0.9)`;
      ctx.shadowBlur = i === 0 ? 8 : 0;
      ctx.shadowColor = '#00f5ff';
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
    });
    ctx.shadowBlur = 0;
  }

  let lastTime = 0, interval = 120;
  function loop(ts) {
    if (!running) return;
    if (ts - lastTime > interval) {
      lastTime = ts;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
          snake.some(s => s.x === head.x && s.y === head.y)) {
        running = false;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 20px "Press Start 2P", monospace';
        ctx.fillStyle = '#ff3355';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '12px Orbitron, sans-serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Click Start to play again', canvas.width / 2, canvas.height / 2 + 50);
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score++;
        hiScore = Math.max(hiScore, score);
        document.getElementById('snake-score').textContent = score;
        document.getElementById('snake-hi').textContent = hiScore;
        interval = Math.max(60, interval - 2);
        placeFood();
      } else {
        snake.pop();
      }
    }
    draw();
    animId = requestAnimationFrame(loop);
  }

  document.getElementById('snake-start').addEventListener('click', () => {
    cancelAnimationFrame(animId);
    running = true; interval = 120;
    init(); draw();
    animId = requestAnimationFrame(loop);
  });

  document.addEventListener('keydown', (e) => {
    if (!running) return;
    const map = {
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
      a: { x: -1, y: 0 }, d: { x: 1, y: 0 }
    };
    const nd = map[e.key];
    if (nd && !(nd.x === -dir.x && nd.y === -dir.y)) {
      const snakeVisible = document.getElementById('game-snake').classList.contains('active') ||
                           !document.getElementById('game-snake').classList.contains('hidden');
      if (snakeVisible) { dir = nd; }
    }
  });

  init(); draw();
})();

/* ════════════════════════════════════════════════════════════════
   10. MINI GAME — REACTION TEST
════════════════════════════════════════════════════════════════ */
const Reaction = (() => {
  const box = document.getElementById('reaction-box');
  const textEl = document.getElementById('reaction-text');
  const resultEl = document.getElementById('reaction-result');
  let state = 'idle'; // idle, waiting, ready
  let startTime = 0, timeout = null;
  let times = [], best = Infinity;

  box.addEventListener('click', () => {
    if (state === 'idle') {
      state = 'waiting';
      box.className = 'reaction-box waiting';
      textEl.textContent = 'Wait for green...';
      resultEl.textContent = '';
      const delay = 1500 + Math.random() * 3000;
      timeout = setTimeout(() => {
        state = 'ready';
        box.className = 'reaction-box ready';
        textEl.textContent = 'CLICK NOW!';
        startTime = performance.now();
      }, delay);
    } else if (state === 'waiting') {
      clearTimeout(timeout);
      state = 'idle';
      box.className = 'reaction-box too-early';
      textEl.textContent = 'Too early! Click to try again.';
    } else if (state === 'ready') {
      const rt = Math.round(performance.now() - startTime);
      times.push(rt);
      if (rt < best) best = rt;
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      document.getElementById('reaction-last').textContent = rt + 'ms';
      document.getElementById('reaction-best').textContent = best + 'ms';
      document.getElementById('reaction-avg').textContent = avg + 'ms';
      state = 'idle';
      box.className = 'reaction-box';
      let rating = rt < 200 ? '⚡ Superhuman!' : rt < 300 ? '🔥 Great!' : rt < 400 ? '👍 Good' : '🐢 Slow...';
      textEl.textContent = rt + 'ms — ' + rating;
      resultEl.textContent = 'Click to try again';
    }
  });
})();

/* ════════════════════════════════════════════════════════════════
   11. MINI GAME — MEMORY MATCH
════════════════════════════════════════════════════════════════ */
const Memory = (() => {
  const EMOJIS = ['🎮','⚔️','🚀','🌟','💎','🔥','⚡','🎯'];
  let cards = [], flipped = [], matched = 0, moves = 0, lock = false;

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function init() {
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    flipped = []; matched = 0; moves = 0; lock = false;
    document.getElementById('mem-moves').textContent = '0';
    document.getElementById('mem-pairs').textContent = '0';
    cards = shuffle([...EMOJIS, ...EMOJIS]);
    cards.forEach((emoji, i) => {
      const card = document.createElement('div');
      card.className = 'mem-card';
      card.dataset.idx = i;
      card.dataset.emoji = emoji;
      card.innerHTML = `<span class="mem-face">${emoji}</span>`;
      card.addEventListener('click', () => flipCard(card));
      grid.appendChild(card);
    });
  }

  function flipCard(card) {
    if (lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    card.classList.add('flipped');
    flipped.push(card);
    if (flipped.length === 2) {
      moves++;
      document.getElementById('mem-moves').textContent = moves;
      lock = true;
      if (flipped[0].dataset.emoji === flipped[1].dataset.emoji) {
        flipped[0].classList.add('matched');
        flipped[1].classList.add('matched');
        matched++;
        document.getElementById('mem-pairs').textContent = matched;
        flipped = []; lock = false;
        if (matched === EMOJIS.length) {
          setTimeout(() => alert(`🎉 You won in ${moves} moves!`), 200);
        }
      } else {
        setTimeout(() => {
          flipped[0].classList.remove('flipped');
          flipped[1].classList.remove('flipped');
          flipped = []; lock = false;
        }, 800);
      }
    }
  }

  document.getElementById('mem-restart').addEventListener('click', init);
  init();
})();

/* ════════════════════════════════════════════════════════════════
   12. MINI GAME — DODGE
════════════════════════════════════════════════════════════════ */
const Dodge = (() => {
  const canvas = document.getElementById('dodge-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let player = { x: W / 2, y: H / 2, r: 10 };
  let enemies = [], score = 0, hiScore = 0, running = false, animId;
  let spawnRate = 60, spawnTimer = 0, frame = 0;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    player.x = e.clientX - rect.left;
    player.y = e.clientY - rect.top;
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    player.x = e.touches[0].clientX - rect.left;
    player.y = e.touches[0].clientY - rect.top;
  }, { passive: false });

  canvas.addEventListener('click', () => {
    if (!running) {
      running = true; score = 0; enemies = []; frame = 0; spawnRate = 60;
      cancelAnimationFrame(animId);
      loop();
    }
  });

  function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { x = Math.random() * W; y = -15; }
    else if (side === 1) { x = W + 15; y = Math.random() * H; }
    else if (side === 2) { x = Math.random() * W; y = H + 15; }
    else { x = -15; y = Math.random() * H; }
    const dx = player.x - x, dy = player.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = 2 + Math.random() * 2 + score * 0.01;
    enemies.push({ x, y, vx: (dx / dist) * speed, vy: (dy / dist) * speed, r: 8 + Math.random() * 6 });
  }

  function loop() {
    if (!running) return;
    frame++;
    spawnTimer++;
    if (spawnTimer >= spawnRate) {
      spawnEnemy();
      spawnTimer = 0;
      spawnRate = Math.max(15, spawnRate - 0.5);
    }
    score++;
    document.getElementById('dodge-score').textContent = score;
    if (score > hiScore) { hiScore = score; document.getElementById('dodge-hi').textContent = hiScore; }

    ctx.fillStyle = 'rgba(5,5,16,0.85)';
    ctx.fillRect(0, 0, W, H);

    // Player
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fillStyle = '#00f5ff';
    ctx.shadowBlur = 15; ctx.shadowColor = '#00f5ff';
    ctx.fill(); ctx.shadowBlur = 0;

    // Enemies
    let dead = false;
    enemies.forEach(e => {
      e.x += e.vx; e.y += e.vy;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fillStyle = '#ff3355';
      ctx.shadowBlur = 10; ctx.shadowColor = '#ff3355';
      ctx.fill(); ctx.shadowBlur = 0;
      const dx = e.x - player.x, dy = e.y - player.y;
      if (Math.sqrt(dx * dx + dy * dy) < e.r + player.r) dead = true;
    });
    enemies = enemies.filter(e => e.x > -50 && e.x < W + 50 && e.y > -50 && e.y < H + 50);

    // Score display
    ctx.font = '14px Orbitron, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'left';
    ctx.fillText('Move mouse to dodge!', 10, 20);

    if (dead) {
      running = false;
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = 'bold 20px "Press Start 2P", monospace';
      ctx.fillStyle = '#ff3355';
      ctx.textAlign = 'center';
      ctx.fillText('DEAD!', W / 2, H / 2 - 30);
      ctx.font = '13px Orbitron, sans-serif';
      ctx.fillStyle = '#aaa';
      ctx.fillText('Score: ' + score, W / 2, H / 2 + 10);
      ctx.fillText('Click to play again', W / 2, H / 2 + 40);
      return;
    }

    animId = requestAnimationFrame(loop);
  }

  // Draw start screen
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, W, H);
  ctx.font = '14px Orbitron, sans-serif';
  ctx.fillStyle = '#00f5ff';
  ctx.textAlign = 'center';
  ctx.fillText('Click to Start!', W / 2, H / 2);
  ctx.font = '11px Orbitron, sans-serif';
  ctx.fillStyle = '#888';
  ctx.fillText('Move your mouse to dodge the red balls', W / 2, H / 2 + 30);
})();
