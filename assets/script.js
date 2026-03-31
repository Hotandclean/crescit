/* ============================================
   CRESCIT — Built to compound.
   Interactive Scripts
   ============================================ */

'use strict';

// ============================================
// HERO PARTICLE CANVAS
// ============================================

(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, animId;
  let mouseX = 0, mouseY = 0;

  const ACCENT = { r: 0, g: 229, b: 204 };
  const PARTICLE_COUNT = 120;
  const CURVE_COUNT = 8;

  const particles = [];
  const curves = [];

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  // Flowing curve paths (yield-curve / liquidity stream aesthetic)
  function createCurve(index) {
    const totalCurves = CURVE_COUNT;
    const yBase = (index / totalCurves) * height;
    const phase = Math.random() * Math.PI * 2;
    const speed = 0.0003 + Math.random() * 0.0004;
    const amplitude = 30 + Math.random() * 60;
    const opacity = 0.03 + Math.random() * 0.07;
    const segments = 100;

    return { yBase, phase, speed, amplitude, opacity, segments, time: Math.random() * 100 };
  }

  function drawCurve(curve, t) {
    curve.time += curve.speed;
    const segW = width / curve.segments;

    ctx.beginPath();
    ctx.moveTo(0, curve.yBase);

    for (let i = 0; i <= curve.segments; i++) {
      const x = i * segW;
      const wave1 = Math.sin(i * 0.08 + curve.time + curve.phase) * curve.amplitude;
      const wave2 = Math.sin(i * 0.03 - curve.time * 0.7 + curve.phase * 1.3) * (curve.amplitude * 0.5);
      const wave3 = Math.cos(i * 0.12 + curve.time * 1.2) * (curve.amplitude * 0.25);
      const y = curve.yBase + wave1 + wave2 + wave3;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, 0)`);
    gradient.addColorStop(0.3, `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${curve.opacity})`);
    gradient.addColorStop(0.7, `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${curve.opacity})`);
    gradient.addColorStop(1, `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, 0)`);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 0.75;
    ctx.stroke();
  }

  // Particles
  function createParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.1 + Math.random() * 0.3;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.3,
      radius: 0.5 + Math.random() * 1.5,
      opacity: 0.1 + Math.random() * 0.4,
      life: Math.random(),
      lifeSpeed: 0.001 + Math.random() * 0.003,
    };
  }

  function drawParticle(p) {
    const pulse = 0.5 + Math.sin(p.life * Math.PI * 2) * 0.5;
    const alpha = p.opacity * pulse;

    // Draw connecting lines to nearby particles
    for (let j = 0; j < particles.length; j++) {
      const other = particles[j];
      const dx = other.x - p.x;
      const dy = other.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 120;

      if (dist < maxDist && dist > 0) {
        const lineAlpha = (1 - dist / maxDist) * 0.08;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(other.x, other.y);
        ctx.strokeStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${lineAlpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${alpha})`;
    ctx.fill();
  }

  function updateParticle(p) {
    // Mouse influence
    const dx = mouseX - p.x;
    const dy = mouseY - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 200 && dist > 0) {
      const force = (200 - dist) / 200 * 0.002;
      p.vx -= (dx / dist) * force;
      p.vy -= (dy / dist) * force;
    }

    p.x += p.vx;
    p.y += p.vy;
    p.life += p.lifeSpeed;

    // Damping
    p.vx *= 0.99;
    p.vy *= 0.99;

    // Drift slightly upward (compound growth feel)
    p.vy -= 0.0005;

    // Wrap
    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
    if (p.y < -10) p.y = height + 10;
    if (p.y > height + 10) p.y = -10;
    if (p.life > 1) p.life = 0;
  }

  // Background grid
  function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 229, 204, 0.015)';
    ctx.lineWidth = 0.5;

    const gridSize = 80;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  // Vignette
  function drawVignette() {
    const radial = ctx.createRadialGradient(
      width * 0.5, height * 0.5, 0,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.7
    );
    radial.addColorStop(0, 'rgba(10, 10, 15, 0)');
    radial.addColorStop(1, 'rgba(10, 10, 15, 0.8)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);
  }

  let t = 0;

  function animate() {
    animId = requestAnimationFrame(animate);
    t++;

    ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
    ctx.fillRect(0, 0, width, height);

    // Grid
    drawGrid();

    // Curves
    curves.forEach(c => drawCurve(c, t));

    // Particles
    particles.forEach(p => {
      updateParticle(p);
      drawParticle(p);
    });

    // Vignette
    drawVignette();
  }

  function init() {
    resize();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
    for (let i = 0; i < CURVE_COUNT; i++) {
      curves.push(createCurve(i));
    }

    window.addEventListener('resize', () => {
      resize();
    });

    window.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    animate();
  }

  init();
})();

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================

(function initNav() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  function onScroll() {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ============================================
// SMOOTH SCROLL — ENTER BUTTON
// ============================================

(function initSmoothScroll() {
  document.querySelectorAll('[data-scroll]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(el.dataset.scroll);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Nav links
  document.querySelectorAll('a[href^="#"]').forEach(el => {
    el.addEventListener('click', (e) => {
      const href = el.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();

// ============================================
// COUNTER ANIMATION
// ============================================

(function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCounter(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = 'true';

    const target = parseFloat(el.dataset.counter);
    const duration = 2000;
    const start = performance.now();
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const value = target * eased;

      const formatted = decimals > 0
        ? value.toFixed(decimals)
        : Math.floor(value).toLocaleString();

      el.textContent = prefix + formatted + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Final value with proper formatting
        const final = decimals > 0
          ? target.toFixed(decimals)
          : target.toLocaleString();
        el.textContent = prefix + final + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

// ============================================
// REVEAL ON SCROLL
// ============================================

(function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(el => observer.observe(el));
})();

// ============================================
// CURSOR GLOW
// ============================================

(function initCursorGlow() {
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;

  let x = 0, y = 0;
  let tx = 0, ty = 0;

  document.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
  });

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function update() {
    x = lerp(x, tx, 0.08);
    y = lerp(y, ty, 0.08);
    glow.style.left = x + 'px';
    glow.style.top = y + 'px';
    requestAnimationFrame(update);
  }

  update();
})();

// ============================================
// TERMINAL LIVE UPDATE EFFECT
// ============================================

(function initTerminalEffect() {
  const values = document.querySelectorAll('.t-val');
  if (!values.length) return;

  // Simulate live data flicker
  const baseValues = Array.from(values).map(v => v.textContent);

  function flicker() {
    const idx = Math.floor(Math.random() * values.length);
    const base = parseFloat(baseValues[idx].replace(/[^0-9.]/g, ''));
    const variance = base * (0.001 + Math.random() * 0.002);
    const sign = Math.random() > 0.5 ? 1 : -1;
    const newVal = base + sign * variance;

    const prefix = baseValues[idx].startsWith('$') ? '$' : '';
    const suffix = baseValues[idx].includes('%') ? '%' : '';
    const decimals = baseValues[idx].includes('.') ? 2 : 0;

    values[idx].textContent = prefix + newVal.toFixed(decimals) + suffix;
    values[idx].style.color = sign > 0 ? '#27C93F' : '#FF5F56';

    setTimeout(() => {
      values[idx].textContent = baseValues[idx];
      values[idx].style.color = '';
    }, 400);

    setTimeout(flicker, 800 + Math.random() * 2000);
  }

  setTimeout(flicker, 2000);
})();

// ============================================
// HERO TITLE SHIMMER
// ============================================

(function initTitleShimmer() {
  const title = document.querySelector('.hero-title');
  if (!title) return;

  let angle = 135;
  let dir = 0.1;

  function update() {
    angle += dir;
    if (angle > 160 || angle < 110) dir *= -1;
    title.style.backgroundImage = `linear-gradient(${angle}deg, #fff 0%, #fff 45%, var(--accent) 100%)`;
    requestAnimationFrame(update);
  }

  update();
})();

// ============================================
// EARLY ACCESS FORM
// ============================================

(function initCtaForm() {
  const form = document.getElementById('cta-form');
  const successEl = document.getElementById('cta-success');
  if (!form || !successEl) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('cta-name').value.trim();
    const email = document.getElementById('cta-email').value.trim();
    const capital = document.getElementById('cta-capital').value;

    if (!name || !email || !capital) return;

    // Log submission (no backend — console only)
    console.log('[Crescit CTA]', { name, email, capital, ts: new Date().toISOString() });

    // Transition to success
    form.style.opacity = '0';
    form.style.transform = 'translateY(8px)';
    form.style.transition = 'opacity 0.35s ease, transform 0.35s ease';

    setTimeout(function () {
      form.hidden = true;
      successEl.hidden = false;
      successEl.style.opacity = '0';
      successEl.style.transform = 'translateY(8px)';
      successEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          successEl.style.opacity = '1';
          successEl.style.transform = 'translateY(0)';
        });
      });
    }, 350);
  });
})();
