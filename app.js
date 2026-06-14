// ══════════════════════════════════════════════
// 🔥 OLIYAD BETO — ULTRA 3D INTERACTIVE ENGINE
// ══════════════════════════════════════════════

// ── THEME ──
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
  updateTheme(localStorage.getItem('color-mode') || 'dark');
  themeToggle.addEventListener('click', () =>
    updateTheme(body.classList.contains('light-mode') ? 'dark' : 'light')
  );
}

// ── SCROLL PROGRESS BAR ──
const progressBar = document.createElement('div');
progressBar.className = 'scroll-indicator';
document.body.prepend(progressBar);
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  progressBar.style.width = Math.min(pct, 100) + '%';
});

// ── HEADER SHRINK ──
const header = document.getElementById('main-header');
if (header) {
  window.addEventListener('scroll', () =>
    header.classList.toggle('scrolled', window.scrollY > 40)
  );
}

// ── CUSTOM CURSOR (desktop) ──
if (window.innerWidth > 900) {
  const dot  = document.createElement('div'); dot.className  = 'cursor-dot';
  const ring = document.createElement('div'); ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  let rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    dot.style.left  = e.clientX + 'px';
    dot.style.top   = e.clientY + 'px';
    rx += (e.clientX - rx) * 0.18;
    ry += (e.clientY - ry) * 0.18;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
  });

  // Lag ring animation
  function animateRing() {
    requestAnimationFrame(animateRing);
    // Already handled by mousemove for simplicity
  }

  document.querySelectorAll('a, button, .btn, .orb, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });

  // Cursor glow
  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed;pointer-events:none;z-index:9997;
    width:320px;height:320px;border-radius:50%;
    background:radial-gradient(circle,rgba(224,51,76,0.07) 0%,transparent 70%);
    transform:translate(-50%,-50%);
    transition:left 0.15s ease,top 0.15s ease;
  `;
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}

// ── CYBER NAME: ensure data-text is set (CSS uses it for ::before/::after) ──
const cyberName = document.getElementById('name-glitch');
if (cyberName) {
  // Ensure data-text matches content (already set in HTML, this is a safety fallback)
  if (!cyberName.getAttribute('data-text')) {
    cyberName.setAttribute('data-text', cyberName.textContent.trim());
  }

  // JS-driven random "glitch burst" — briefly shifts the element with filter
  function triggerGlitchBurst() {
    const intensity = Math.random() * 6 + 2;
    const dur       = Math.random() * 80 + 40;
    cyberName.style.transition = 'none';
    cyberName.style.filter = `
      drop-shadow(${-intensity}px 0 rgba(255,20,80,0.9))
      drop-shadow(${intensity}px 0 rgba(0,210,255,0.8))
      drop-shadow(0 0 ${intensity * 4}px rgba(224,51,76,0.5))
    `;
    cyberName.style.transform = `translateX(${(Math.random() - 0.5) * 4}px)`;
    setTimeout(() => {
      cyberName.style.filter = 'drop-shadow(0 0 30px rgba(224,51,76,0.35)) drop-shadow(0 4px 20px rgba(0,0,0,0.5))';
      cyberName.style.transform = '';
    }, dur);
  }

  // Schedule random bursts
  function scheduleGlitch() {
    const delay = Math.random() * 4000 + 2000; // every 2–6 seconds
    setTimeout(() => {
      triggerGlitchBurst();
      // Sometimes fire a double-burst
      if (Math.random() > 0.6) {
        setTimeout(triggerGlitchBurst, 120);
      }
      scheduleGlitch();
    }, delay);
  }
  scheduleGlitch();
}

// ── CYBERPUNK CODE-RAIN BACKGROUND (MOUSE INTERACTIVE) ──
(function initCyberRain() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initColumns();
  });

  // Characters: binary, hex, katakana, hacker symbols
  const CHARS = '01アイウエオカキクケコ0123456789ABCDEF><[]{}!@#$%^&*;:./\\|~?';
  const FONT_SIZE = 14;
  let columns = [];

  // Mouse state — raw pixel position + smoothed
  let mouseX = W / 2, mouseY = H / 2;
  let smMouseX = W / 2, smMouseY = H / 2;
  let mouseActive = false;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseActive = true;
  });

  function initColumns() {
    const count = Math.floor(W / FONT_SIZE);
    columns = [];
    for (let i = 0; i < count; i++) {
      columns.push({
        x:       i * FONT_SIZE,
        y:       Math.random() * -H,
        baseSpeed: 1.2 + Math.random() * 2.2,
        speed:   1.2 + Math.random() * 2.2,
        length:  10 + Math.floor(Math.random() * 20),
        chars:   Array.from({ length: 40 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]),
        bright:  Math.random() > 0.85,
        glitch:  0,
        offsetX: 0,   // horizontal push from mouse
      });
    }
  }
  initColumns();

  // Interaction radius around the cursor
  const MOUSE_RADIUS    = 160;   // px — columns within this distance are affected
  const PUSH_STRENGTH   = 55;    // max horizontal push
  const SPEED_BOOST     = 4.5;   // extra speed for columns in range
  const GLOW_RADIUS     = 220;   // glow circle size

  let tick = 0;

  function draw() {
    requestAnimationFrame(draw);
    tick++;

    // Smooth mouse follow
    smMouseX += (mouseX - smMouseX) * 0.1;
    smMouseY += (mouseY - smMouseY) * 0.1;

    // Trail wipe — lower alpha = longer tail
    ctx.fillStyle = 'rgba(8,8,16,0.16)';
    ctx.fillRect(0, 0, W, H);

    ctx.font = `${FONT_SIZE}px 'Courier New', monospace`;

    // ── MOUSE GLOW BLAST through the rain ──
    if (mouseActive) {
      const grd = ctx.createRadialGradient(
        smMouseX, smMouseY, 0,
        smMouseX, smMouseY, GLOW_RADIUS
      );
      grd.addColorStop(0,    'rgba(255,107,53,0.07)');
      grd.addColorStop(0.35, 'rgba(224,51,76,0.04)');
      grd.addColorStop(0.7,  'rgba(224,51,76,0.01)');
      grd.addColorStop(1,    'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // Subtle flare dot at cursor
      const flare = ctx.createRadialGradient(
        smMouseX, smMouseY, 0,
        smMouseX, smMouseY, 18
      );
      flare.addColorStop(0,   'rgba(255,200,160,0.35)');
      flare.addColorStop(0.4, 'rgba(255,107,53,0.2)');
      flare.addColorStop(1,   'rgba(224,51,76,0)');
      ctx.fillStyle = flare;
      ctx.beginPath();
      ctx.arc(smMouseX, smMouseY, 28, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];

      // Distance from column to mouse
      const colCenterX = col.x + FONT_SIZE / 2;
      const dx  = colCenterX - smMouseX;
      const dy  = (col.y - col.length * FONT_SIZE / 2) - smMouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const inRange = dist < MOUSE_RADIUS;

      // Push columns sideways (part like a curtain)
      const pushFactor = inRange ? Math.max(0, 1 - dist / MOUSE_RADIUS) : 0;
      const targetOffsetX = pushFactor * Math.sign(dx) * PUSH_STRENGTH;
      col.offsetX += (targetOffsetX - col.offsetX) * 0.15;  // smooth spring

      // Speed boost near cursor
      const targetSpeed = col.baseSpeed + (inRange ? pushFactor * SPEED_BOOST : 0);
      col.speed += (targetSpeed - col.speed) * 0.2;

      // Higher scramble rate near cursor
      const scrambleFreq = inRange ? 1 : 3;
      if (tick % scrambleFreq === 0) {
        const idx = Math.floor(Math.random() * col.chars.length);
        col.chars[idx] = CHARS[Math.floor(Math.random() * CHARS.length)];
      }

      // Random glitch
      if (Math.random() < (inRange ? 0.008 : 0.0008)) col.glitch = 8;
      if (col.glitch > 0) col.glitch--;

      // Draw trail
      for (let j = 0; j < col.length; j++) {
        const cy = col.y - j * FONT_SIZE;
        if (cy < 0 || cy > H) continue;

        const ch    = col.chars[j % col.chars.length];
        const alpha = Math.max(0, 1 - j / col.length);

        // Columns near cursor get extra brightness
        const brightBoost = inRange ? 1 + pushFactor * 0.6 : 1;

        if (j === 0) {
          // Leader head
          const la = Math.min(1, alpha * brightBoost);
          ctx.fillStyle = col.bright
            ? `rgba(255,240,220,${la})`
            : `rgba(255,180,120,${la})`;
        } else if (j < 3) {
          ctx.fillStyle = `rgba(224,51,76,${Math.min(1, alpha * 0.95 * brightBoost)})`;
        } else {
          const r = i % 3;
          const a = Math.min(1, alpha * brightBoost);
          if (r === 0)      ctx.fillStyle = `rgba(224,51,76,${a * 0.65})`;
          else if (r === 1) ctx.fillStyle = `rgba(255,107,53,${a * 0.58})`;
          else              ctx.fillStyle = `rgba(255,153,102,${a * 0.48})`;
        }

        const gx = col.glitch > 0 ? (Math.random() - 0.5) * 8 : 0;
        ctx.fillText(ch, col.x + col.offsetX + gx, cy);
      }

      col.y += col.speed;

      if (col.y - col.length * FONT_SIZE > H) {
        col.y        = Math.random() * -200;
        col.baseSpeed = 1.2 + Math.random() * 2.2;
        col.speed    = col.baseSpeed;
        col.length   = 10 + Math.floor(Math.random() * 20);
        col.bright   = Math.random() > 0.85;
        col.offsetX  = 0;
      }
    }

    // CRT scanlines
    if (tick % 2 === 0) {
      for (let y = 0; y < H; y += 4) {
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(0, y, W, 1);
      }
    }

    // Vignette
    const vg = ctx.createRadialGradient(W/2, H/2, H*0.25, W/2, H/2, H*0.9);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  draw();
})();





// ── PARALLAX (home only) ──
if (document.querySelector('.home')) {
  const homeImg     = document.querySelector('.home-img');
  const homeContent = document.querySelector('.home-content');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (homeImg)     homeImg.style.transform     = `translateY(${y * 0.22}px)`;
        if (homeContent) homeContent.style.transform = `translateY(${y * 0.1}px)`;
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ── MAGNETIC BUTTONS ──
if (window.innerWidth > 900) {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      btn.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px) scale(1.05)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ── 3D CARD TILT ──
function applyTilt(el) {
  if (el.dataset.tilt) return;
  el.dataset.tilt = '1';
  el.style.transformStyle = 'preserve-3d';
  el.style.willChange = 'transform';

  const shine = document.createElement('div');
  shine.className = 'tilt-shine';
  el.appendChild(shine);

  el.addEventListener('mousemove', e => {
    const r   = el.getBoundingClientRect();
    const dx  = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
    const dy  = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    const max = 14;
    el.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
    el.style.transform  = `perspective(900px) rotateX(${-dy*max}deg) rotateY(${dx*max}deg) scale3d(1.03,1.03,1.03)`;
    el.style.boxShadow  = `${-dx*max*2}px ${-dy*max*2}px 50px rgba(224,51,76,0.2), 0 20px 60px rgba(0,0,0,0.4)`;
    shine.style.background = `radial-gradient(circle at ${(dx+1)/2*100}% ${(dy+1)/2*100}%, rgba(255,255,255,0.1) 0%, transparent 65%)`;
    shine.style.opacity = '1';
  });
  el.addEventListener('mouseleave', () => {
    el.style.transition = 'transform 0.6s cubic-bezier(.23,1,.32,1), box-shadow 0.6s ease';
    el.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    el.style.boxShadow  = '';
    shine.style.opacity = '0';
  });
}

// ── SKILL ORBS — inject on skills page ──
function buildSkillOrbs() {
  const container = document.querySelector('.skills-grid-2col');
  if (!container) return;

  const skills = [
    { icon: 'fa-brands fa-html5',   label: 'HTML5',      color: '#e34c26' },
    { icon: 'fa-brands fa-css3-alt',label: 'CSS3',       color: '#264de4' },
    { icon: 'fa-brands fa-js',      label: 'JavaScript', color: '#f7df1e' },
    { icon: 'fa-solid fa-code',     label: 'C#',         color: '#9b59b6' },
    { icon: 'fa-brands fa-python',  label: 'Python',     color: '#3572a5' },
    { icon: 'fa-brands fa-java',    label: 'Java',       color: '#f89820' },
    { icon: 'fa-solid fa-database', label: 'MySQL',      color: '#00758f' },
    { icon: 'fa-brands fa-git-alt', label: 'Git',        color: '#f05032' },
    { icon: 'fa-brands fa-react',   label: 'React',      color: '#61dafb' },
    { icon: 'fa-brands fa-node-js', label: 'Node.js',    color: '#83cd29' },
  ];

  const orbSection = document.createElement('div');
  orbSection.innerHTML = `
    <div class="card reveal" style="animation-delay:0.05s; margin-bottom:2.4rem;">
      <h2><i class="fa-solid fa-atom"></i> Tech Stack</h2>
      <div class="skill-orb-grid" id="orb-grid"></div>
    </div>
  `;
  container.parentNode.insertBefore(orbSection, container);

  const grid = orbSection.querySelector('#orb-grid');
  skills.forEach((sk, i) => {
    const orb = document.createElement('div');
    orb.className = 'skill-orb';
    orb.style.animationDelay = `${i * 0.08}s`;
    orb.innerHTML = `
      <div class="orb" style="border-color:${sk.color}33; box-shadow:0 0 20px ${sk.color}33, inset 0 -4px 12px rgba(0,0,0,0.3)">
        <i class="${sk.icon}" style="color:${sk.color}"></i>
      </div>
      <span>${sk.label}</span>
    `;
    orb.querySelector('.orb').addEventListener('click', () => {
      orb.querySelector('.orb').style.animation = 'none';
      orb.querySelector('.orb').style.transform = 'scale(1.3) rotateY(360deg)';
      orb.querySelector('.orb').style.transition = 'transform 0.6s ease';
      setTimeout(() => {
        orb.querySelector('.orb').style.transform = '';
        orb.querySelector('.orb').style.transition = '';
        orb.querySelector('.orb').style.animation  = '';
      }, 700);
    });
    grid.appendChild(orb);
  });
}
buildSkillOrbs();

// ── SCROLL REVEAL + TILT INIT ──
function initReveal() {
  const els = document.querySelectorAll('.reveal, .card, .project-card, .timeline-item, blockquote');
  const io  = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseFloat(el.style.animationDelay || '0') * 1000;
      setTimeout(() => {
        el.style.opacity    = '1';
        el.style.transform  = 'translateY(0)';
        el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
        el.classList.add('in-view');
        if (window.innerWidth > 900) applyTilt(el);
      }, delay);
      io.unobserve(el);
    });
  }, { threshold: 0.1 });

  els.forEach(el => {
    if (!el.closest('.home')) {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(30px)';
      io.observe(el);
    }
  });
}

// Apply tilt immediately to home-visible cards
if (window.innerWidth > 900) {
  document.querySelectorAll('.card, .project-card, blockquote').forEach(applyTilt);
}
initReveal();

// ── SKILL BARS ──
function animateSkillBars() {
  const bars = document.querySelectorAll('.bar-fill');
  if (!bars.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bar = entry.target;
      setTimeout(() => {
        bar.style.width = bar.getAttribute('data-width') + '%';
        bar.classList.add('animated');
      }, 200);
      io.unobserve(bar);
    });
  }, { threshold: 0.3 });
  bars.forEach(b => io.observe(b));
}
animateSkillBars();

// ── COUNTER ANIMATION (about page stats) ──
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    let current  = 0;
    const step   = target / 60;
    const timer  = setInterval(() => {
      current += step;
      if (current >= target) { el.textContent = target + '+'; clearInterval(timer); }
      else el.textContent = Math.floor(current) + '+';
    }, 16);
  });
}

// ── HACKER TERMINAL TYPEWRITER ──
(function initHackerTyper() {
  const el = document.getElementById('term-typed');
  if (!el) return;

  const ROLES = [
    'Software Engineer',
    'Web Developer',
    'Cybersecurity Enthusiast',
    'UI/UX Designer',
    'Full-Stack Dev',
    'Aspiring Hacker',
  ];

  // Characters used for the scramble/decrypt effect
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*<>[]{}|/\\~';

  const TYPING_SPEED  = 65;   // ms per character type
  const SCRAMBLE_ITER = 5;    // random char flashes before locking
  const DELETE_SPEED  = 35;   // ms per character delete
  const PAUSE_AFTER   = 1800; // ms to hold full word
  const PAUSE_BEFORE  = 500;  // ms before starting to delete

  let roleIndex = 0;
  let charIndex = 0;
  let deleting  = false;
  let locked    = '';   // the portion that's been "locked in"

  function randGlyph() {
    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }

  function scrambleThen(finalChar, iters, cb) {
    if (iters <= 0) { cb(); return; }
    el.textContent = locked + finalChar.replace(/./g, randGlyph());
    setTimeout(() => scrambleThen(finalChar, iters - 1, cb), TYPING_SPEED / SCRAMBLE_ITER);
  }

  function typeChar() {
    const role = ROLES[roleIndex];

    if (!deleting) {
      if (charIndex < role.length) {
        const nextChar = role[charIndex];
        scrambleThen(nextChar, SCRAMBLE_ITER, () => {
          locked += nextChar;
          el.textContent = locked;
          charIndex++;
          setTimeout(typeChar, TYPING_SPEED);
        });
      } else {
        // Full word typed — pause then delete
        setTimeout(() => {
          deleting = true;
          setTimeout(typeChar, PAUSE_BEFORE);
        }, PAUSE_AFTER);
      }
    } else {
      // Deleting
      if (locked.length > 0) {
        locked = locked.slice(0, -1);
        el.textContent = locked;
        setTimeout(typeChar, DELETE_SPEED);
      } else {
        // Move to next role
        deleting  = false;
        charIndex = 0;
        roleIndex = (roleIndex + 1) % ROLES.length;
        setTimeout(typeChar, 400);
      }
    }
  }

  // Start after the page fade-in
  setTimeout(typeChar, 900);
})();


// ── STAGGER CHILD ANIMATIONS ──
document.querySelectorAll('.skill-list').forEach(list => {
  list.querySelectorAll('li').forEach((li, i) => {
    li.style.opacity   = '0';
    li.style.transform = 'translateX(-20px)';
    li.style.transition = `opacity 0.4s ${i * 0.07}s ease, transform 0.4s ${i * 0.07}s ease`;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        li.style.opacity   = '1';
        li.style.transform = 'translateX(0)';
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(li);
  });
});

// ── PROJECT CARD CLICK RIPPLE ──
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', e => {
    const ripple = document.createElement('div');
    const r = card.getBoundingClientRect();
    ripple.style.cssText = `
      position:absolute;
      left:${e.clientX - r.left}px;
      top:${e.clientY - r.top}px;
      width:0;height:0;
      background:rgba(224,51,76,0.25);
      border-radius:50%;
      transform:translate(-50%,-50%);
      animation:ripple-out 0.6s ease forwards;
      pointer-events:none;
      z-index:20;
    `;
    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

// Ripple keyframe injection
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes ripple-out {
    to { width: 300px; height: 300px; opacity: 0; }
  }
`;
document.head.appendChild(rippleStyle);

// ── 3D PROFILE PICTURE MOUSE-TILT ──
(function initProfile3D() {
  const wrapper = document.getElementById('profile-3d');
  const inner   = document.getElementById('profile-inner');
  if (!wrapper || !inner || window.innerWidth <= 900) return;

  const MAX_TILT   = 22;   // max degrees of tilt
  const MAX_SHIFT  = 10;   // max px of perspective shift
  let   rafId      = null;
  let   targetRX   = 0, targetRY = 0;
  let   currentRX  = 0, currentRY = 0;
  let   isHovering = false;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    // Smooth interpolation toward target
    currentRX = lerp(currentRX, targetRX, 0.12);
    currentRY = lerp(currentRY, targetRY, 0.12);

    inner.style.transform = `
      rotateX(${currentRX}deg)
      rotateY(${currentRY}deg)
      translateZ(${isHovering ? 24 : 0}px)
    `;

    // Shift the outer glow ring slightly for depth illusion
    const shiftX = (currentRY / MAX_TILT) * MAX_SHIFT;
    const shiftY = -(currentRX / MAX_TILT) * MAX_SHIFT;
    wrapper.style.setProperty('--tilt-x', shiftX + 'px');
    wrapper.style.setProperty('--tilt-y', shiftY + 'px');

    if (isHovering || Math.abs(currentRX) > 0.05 || Math.abs(currentRY) > 0.05) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
      inner.style.transform = '';
    }
  }

  wrapper.addEventListener('mousemove', e => {
    isHovering = true;
    const rect   = wrapper.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / (rect.width  / 2);  // -1 to 1
    const dy     = (e.clientY - cy) / (rect.height / 2);  // -1 to 1

    targetRY =  dx * MAX_TILT;
    targetRX = -dy * MAX_TILT;

    if (!rafId) rafId = requestAnimationFrame(tick);
  });

  wrapper.addEventListener('mouseleave', () => {
    isHovering = false;
    targetRX   = 0;
    targetRY   = 0;
    if (!rafId) rafId = requestAnimationFrame(tick);
  });
})();