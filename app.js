// ── THEME TOGGLE ──
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

function updateTheme(mode) {
  const isLight = mode === 'light';
  body.classList.toggle('light-mode', isLight);
  if (!themeToggle) return;
  const icon = themeToggle.querySelector('i');
  if (icon) icon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  localStorage.setItem('color-mode', mode);
}

if (themeToggle) {
  const saved = localStorage.getItem('color-mode') || 'dark';
  updateTheme(saved);
  themeToggle.addEventListener('click', () => {
    updateTheme(body.classList.contains('light-mode') ? 'dark' : 'light');
  });
}

// ── HEADER SCROLL SHRINK ──
const header = document.getElementById('main-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ── PARTICLES ──
const canvas = document.getElementById('particles-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.floor((W * H) / 18000);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      a: Math.random() * 0.5 + 0.15
    }));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    const isDark = !body.classList.contains('light-mode');
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = isDark
        ? `rgba(224,51,76,${p.a})`
        : `rgba(180,40,60,${p.a * 0.6})`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const alpha = (1 - dist / 120) * 0.12;
          ctx.strokeStyle = isDark
            ? `rgba(224,51,76,${alpha})`
            : `rgba(180,40,60,${alpha * 0.5})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawParticles);
  }

  resize();
  createParticles();
  drawParticles();
  window.addEventListener('resize', () => { resize(); createParticles(); });
}

// ── SCROLL REVEAL ──
function initReveal() {
  const els = document.querySelectorAll('.reveal, .card, .project-card, .timeline-item');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.style.animationDelay || '0s';
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
        }, parseFloat(delay) * 1000);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => {
    if (!el.closest('.home')) { // don't re-animate home elements
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      io.observe(el);
    }
  });
}
initReveal();

// ── SKILL BARS ANIMATION ──
function animateSkillBars() {
  const bars = document.querySelectorAll('.bar-fill');
  if (!bars.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.getAttribute('data-width') + '%';
        setTimeout(() => { bar.style.width = width; }, 200);
        io.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => io.observe(bar));
}
animateSkillBars();

// ── CURSOR GLOW (desktop only) ──
if (window.innerWidth > 900) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed; pointer-events: none; z-index: 9999;
    width: 300px; height: 300px; border-radius: 50%;
    background: radial-gradient(circle, rgba(224,51,76,0.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: left 0.12s ease, top 0.12s ease;
  `;
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}
