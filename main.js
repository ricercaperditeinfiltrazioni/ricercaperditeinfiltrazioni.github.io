/* ══════════════════════════════════════
   RICERCA PERDITE — main.js
   Gocce interattive + utility globali
   ══════════════════════════════════════ */

// ── NAV SCROLL ──
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ── HAMBURGER ──
function toggleMenu() {
  document.getElementById('navLinks')?.classList.toggle('open');
}
document.querySelectorAll('#navLinks a').forEach(a =>
  a.addEventListener('click', () => document.getElementById('navLinks')?.classList.remove('open'))
);

// ── SCROLL REVEAL ──
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); } });
}, { threshold: 0.12 });
document.querySelectorAll('.rv').forEach(el => revealObs.observe(el));

// ── INTERACTIVE WATER DROPS CANVAS ──
(function initDrops() {
  const canvas = document.getElementById('dropsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, drops = [], mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); });

  // Track mouse over canvas
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.x = -9999; mouse.y = -9999;
  });
  // Touch support
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - rect.left;
    mouse.y = e.touches[0].clientY - rect.top;
  }, { passive: false });

  function Drop() {
    this.reset();
  }
  Drop.prototype.reset = function() {
    this.x  = Math.random() * W;
    this.y  = -20;
    this.vy = Math.random() * 1.5 + 0.8;   // velocità verticale
    this.vx = (Math.random() - 0.5) * 0.4;  // deriva laterale leggera
    this.size = Math.random() * 4 + 2;
    this.alpha = Math.random() * 0.4 + 0.15;
    this.trail = [];
  };
  Drop.prototype.update = function() {
    // Interazione con mouse: se vicino, la goccia si allontana
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const influence = 120; // raggio d'influenza px

    if (dist < influence && dist > 0) {
      const force = (influence - dist) / influence;
      const angle = Math.atan2(dy, dx);
      this.vx += Math.cos(angle) * force * 0.6;
      this.vy += Math.sin(angle) * force * 0.4;
    }

    // Attrito leggero
    this.vx *= 0.97;

    // Gravity pull back
    this.vy = Math.max(this.vy, 0.5);

    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 8) this.trail.shift();

    this.x += this.vx;
    this.y += this.vy;

    if (this.y > H + 20) this.reset();
    if (this.x < -20 || this.x > W + 20) this.reset();
  };
  Drop.prototype.draw = function() {
    // Traccia
    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.strokeStyle = `rgba(77,184,245,${this.alpha * 0.3})`;
      ctx.lineWidth = this.size * 0.4;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Corpo goccia
    ctx.save();
    ctx.translate(this.x, this.y);

    // Angolo di movimento
    const angle = Math.atan2(this.vy, this.vx) - Math.PI / 2;
    ctx.rotate(angle);

    // Forma goccia (ellisse allungata)
    const rW = this.size * 0.6;
    const rH = this.size * 1.3;

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rH);
    grad.addColorStop(0,   `rgba(200,235,255,${this.alpha * 1.2})`);
    grad.addColorStop(0.4, `rgba(130,200,245,${this.alpha})`);
    grad.addColorStop(1,   `rgba(26,127,212,${this.alpha * 0.3})`);

    ctx.beginPath();
    ctx.ellipse(0, 0, rW, rH, 0, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Riflesso luce
    ctx.beginPath();
    ctx.ellipse(-rW * 0.2, -rH * 0.3, rW * 0.25, rH * 0.2, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${this.alpha * 0.6})`;
    ctx.fill();

    ctx.restore();
  };

  // Crea 35 gocce
  for (let i = 0; i < 35; i++) {
    const d = new Drop();
    d.y = Math.random() * H; // distribuzione iniziale
    drops.push(d);
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drops.forEach(d => { d.update(); d.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();

// ── GALLERY FILTER (gallery.html) ──
window.filterGallery = function(cat) {
  document.querySelectorAll('.gcat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  document.querySelectorAll('.gallery-item').forEach(item => {
    const show = cat === 'all' || item.dataset.cat === cat;
    item.style.display = show ? '' : 'none';
    if (show) {
      item.style.opacity = 0;
      setTimeout(() => { item.style.opacity = ''; }, 10);
    }
  });
};
