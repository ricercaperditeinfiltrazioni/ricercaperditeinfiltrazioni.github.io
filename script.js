/* ═══════════════════════════════════════════════════
   RICERCA PERDITE & INFILTRAZIONI — script.js
   Gocce animate canvas + interazioni UI
═══════════════════════════════════════════════════ */

/* ─────────────────────────────────────
   1. GOCCE CANVAS — HERO
───────────────────────────────────── */
(function initDrops() {
  const canvas = document.getElementById('dropCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, drops = [];
  const mouse = { x: -999, y: -999 };
  const isMobile = window.matchMedia('(hover: none)').matches;

  /* Ridimensiona canvas alla dimensione reale dell'hero */
  function resize() {
    const hero = document.querySelector('.hero');
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }

  /* Classe singola goccia */
  class Drop {
    constructor() { this.reset(true); }

    reset(init) {
      this.x     = Math.random() * W;
      this.y     = init ? Math.random() * H : -40;
      this.r     = Math.random() * 20 + 8;   // raggio 8-28px
      this.vx    = (Math.random() - 0.5) * 0.3;
      this.vy    = Math.random() * 0.55 + 0.2; // lente: 0.2-0.75 px/frame
      this.alpha = Math.random() * 0.3 + 0.08;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.018 + 0.008;
    }

    update() {
      const dx   = this.x - mouse.x;
      const dy   = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const RANGE = 150;

      if (dist < RANGE && dist > 0) {
        const force = (RANGE - dist) / RANGE * 3.2;
        /* Le gocce vengono ATTRATTE dal mouse (seguono il cursore) */
        this.vx -= (dx / dist) * force * 0.07;
        this.vy -= (dy / dist) * force * 0.07;
      }

      /* Oscillazione naturale */
      this.wobble += this.wobbleSpeed;
      this.vx += Math.sin(this.wobble) * 0.009;

      /* Gravità leggera */
      this.vy += 0.015;

      /* Attrito */
      this.vx *= 0.975;
      this.vy  = Math.min(this.vy, 2.5);

      this.x += this.vx;
      this.y += this.vy;

      /* Reset quando esce */
      if (this.y > H + 45 || this.x < -50 || this.x > W + 50) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;

      /* Corpo goccia — gradiente radiale effetto vetro */
      const grad = ctx.createRadialGradient(
        this.x - this.r * 0.3,
        this.y - this.r * 0.35,
        this.r * 0.04,
        this.x,
        this.y,
        this.r
      );
      grad.addColorStop(0,   'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.35,'rgba(200, 230, 255, 0.55)');
      grad.addColorStop(1,   'rgba(80,  160, 255, 0.04)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      /* Forma a goccia: ellisse leggermente allungata verso il basso */
      ctx.ellipse(
        this.x,
        this.y + this.r * 0.12,
        this.r * 0.70,
        this.r,
        0, 0, Math.PI * 2
      );
      ctx.fill();

      /* Bordo sottile */
      ctx.globalAlpha = this.alpha * 0.38;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth   = 0.8;
      ctx.stroke();

      /* Riflesso interno (punto luce) */
      ctx.globalAlpha = this.alpha * 0.88;
      ctx.fillStyle   = 'rgba(255, 255, 255, 0.92)';
      ctx.beginPath();
      ctx.ellipse(
        this.x - this.r * 0.26,
        this.y - this.r * 0.28,
        this.r * 0.17,
        this.r * 0.1,
        -0.5, 0, Math.PI * 2
      );
      ctx.fill();

      ctx.restore();
    }
  }

  /* Inizializza */
  resize();
  for (let i = 0; i < 42; i++) drops.push(new Drop());

  /* Mouse / Touch */
  const hero = document.querySelector('.hero');
  hero.addEventListener('mousemove', function (e) {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  hero.addEventListener('mouseleave', function () {
    mouse.x = -999;
    mouse.y = -999;
  });
  hero.addEventListener('touchmove', function (e) {
    const r = hero.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - r.left;
    mouse.y = e.touches[0].clientY - r.top;
  }, { passive: true });
  hero.addEventListener('touchend', function () {
    mouse.x = -999;
    mouse.y = -999;
  });

  window.addEventListener('resize', resize);

  /* Loop animazione */
  function loop() {
    /* Sfondo gradiente pulito — NIENTE GRIGLIA */
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0,   '#102e7a');
    bg.addColorStop(0.5, '#0d2060');
    bg.addColorStop(1,   '#050a18');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    drops.forEach(function (d) { d.update(); d.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();


/* ─────────────────────────────────────
   2. MENU HAMBURGER
───────────────────────────────────── */
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}
document.querySelectorAll('#navLinks a').forEach(function (a) {
  a.addEventListener('click', function () {
    document.getElementById('navLinks').classList.remove('open');
  });
});


/* ─────────────────────────────────────
   3. SCROLL REVEAL
───────────────────────────────────── */
var revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.rv').forEach(function (el) {
  revealObserver.observe(el);
});


/* ─────────────────────────────────────
   4. NAV SHADOW ON SCROLL
───────────────────────────────────── */
window.addEventListener('scroll', function () {
  var nav = document.getElementById('mainNav');
  if (nav) {
    nav.style.boxShadow = window.scrollY > 60
      ? '0 4px 24px rgba(0,0,0,0.55)'
      : 'none';
  }
});


/* ─────────────────────────────────────
   5. POPUP MANUTENZIONE
───────────────────────────────────── */
function openPopup() {
  document.getElementById('popup-maint').classList.add('open');
}
function closePopup() {
  document.getElementById('popup-maint').classList.remove('open');
}
/* Chiudi cliccando fuori */
document.getElementById('popup-maint').addEventListener('click', function (e) {
  if (e.target === this) closePopup();
});
