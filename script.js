/* ═══════════ DOM REFERENCES ═══════════ */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const bookCover = $('#bookCover');
const bookFront = $('#bookFront');
const openBtn = $('#openBookBtn');
const storyContent = $('#storyContent');
const bgMusic = $('#bgMusic');
const musicPlayer = $('#musicPlayer');
const heartRainCanvas = $('#heartRainCanvas');
const floatingContainer = $('#floatingHearts');
const bigQuoteSection = $('#bigQuoteSection');

/* ═══════════ BOOK OPENING ═══════════ */
let bookOpened = false;

openBtn.addEventListener('click', () => {
  if (bookOpened) return;
  bookOpened = true;

  // Open the book cover
  bookFront.classList.add('open');

  // Start music with fade-in
  startMusic();

  // After book animation, transition to content
  setTimeout(() => {
    storyContent.style.display = 'block';
    requestAnimationFrame(() => {
      storyContent.classList.add('visible');
      bookCover.classList.add('hidden');
    });

    // Show music player
    musicPlayer.style.display = 'flex';

    // Start live counter
    startLiveCounter();

    // Start floating hearts
    startFloatingHearts();

    // Init scroll reveals
    initScrollReveal();

    // Init canvas heart rain
    initHeartRain();
  }, 1800);
});

/* ═══════════ MUSIC CONTROLLER ═══════════ */
function startMusic() {
  bgMusic.volume = 0;
  const playPromise = bgMusic.play();
  if (playPromise !== undefined) {
    playPromise.then(() => fadeInVolume()).catch(() => {
      // Autoplay blocked — will play on next interaction
      document.addEventListener('touchstart', () => {
        bgMusic.play().then(() => fadeInVolume());
      }, { once: true });
    });
  }
}

function fadeInVolume() {
  const target = 0.7;
  const step = 0.02;
  const interval = setInterval(() => {
    if (bgMusic.volume < target - step) {
      bgMusic.volume = Math.min(bgMusic.volume + step, target);
    } else {
      bgMusic.volume = target;
      clearInterval(interval);
    }
  }, 50);
}

musicPlayer.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play();
    musicPlayer.classList.remove('paused');
  } else {
    bgMusic.pause();
    musicPlayer.classList.add('paused');
  }
});

/* ═══════════ LIVE COUNTER ═══════════ */
const startDate = new Date(2022, 11, 1); // Dec 1, 2022

function startLiveCounter() {
  updateCounter();
  setInterval(updateCounter, 1000);
}

function updateCounter() {
  const now = new Date();
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();
  const hours = now.getHours();

  if (days < 0) {
    months--;
    const prev = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prev.getDate();
  }
  if (months < 0) { years--; months += 12; }

  const yEl = $('#counterYears');
  const mEl = $('#counterMonths');
  const dEl = $('#counterDays');
  const hEl = $('#counterHours');

  if (yEl) yEl.textContent = years;
  if (mEl) mEl.textContent = months;
  if (dEl) dEl.textContent = days;
  if (hEl) hEl.textContent = hours;

  // Update numbers section days count
  const totalDays = Math.floor((now - startDate) / 86400000);
  const totalMonths = years * 12 + months;
  const dayTarget = $('[data-target="1284"]');
  const monthTarget = $('[data-target="42"]');
  if (dayTarget) dayTarget.setAttribute('data-target', totalDays);
  if (monthTarget) monthTarget.setAttribute('data-target', totalMonths);
}

/* ═══════════ SCROLL REVEAL ═══════════ */
function initScrollReveal() {
  const reveals = $$('.reveal-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('revealed'), i * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach((el) => observer.observe(el));

  // Big quote word reveal
  const quoteObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const words = entry.target.querySelectorAll('.word');
        words.forEach((w, i) => {
          setTimeout(() => w.classList.add('visible'), i * 200);
        });
        quoteObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  if (bigQuoteSection) quoteObserver.observe(bigQuoteSection);

  // Count-up for numbers
  const numObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const nums = entry.target.querySelectorAll('.number-value');
        nums.forEach((el) => countUp(el));
        numObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const numSection = $('#numbersSection');
  if (numSection) numObserver.observe(numSection);
}

/* ═══════════ COUNT-UP ANIMATION ═══════════ */
function countUp(el) {
  const target = parseInt(el.dataset.target) || 0;
  const duration = 2000;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  requestAnimationFrame(tick);
}

/* ═══════════ FLOATING HEARTS ═══════════ */
let heartInterval;

function startFloatingHearts() {
  spawnHeart();
  heartInterval = setInterval(spawnHeart, 3000);
}

function spawnHeart() {
  if (!floatingContainer) return;
  const heart = document.createElement('span');
  heart.className = 'floating-heart';
  heart.textContent = ['❤', '♥', '💕', '💗'][Math.floor(Math.random() * 4)];
  heart.style.left = Math.random() * 100 + '%';
  heart.style.fontSize = (14 + Math.random() * 18) + 'px';
  heart.style.animationDuration = (5 + Math.random() * 6) + 's';
  heart.style.animationDelay = Math.random() * 1 + 's';
  floatingContainer.appendChild(heart);
  setTimeout(() => heart.remove(), 12000);
}

/* ═══════════ CANVAS HEART RAIN ═══════════ */
function initHeartRain() {
  if (!heartRainCanvas) return;
  const ctx = heartRainCanvas.getContext('2d');
  let hearts = [];
  let animating = false;

  function resize() {
    const rect = heartRainCanvas.parentElement.getBoundingClientRect();
    heartRainCanvas.width = rect.width;
    heartRainCanvas.height = rect.height;
  }
  resize();
  window.addEventListener('resize', resize);

  const rainObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animating) {
        animating = true;
        resize();
        animate();
      }
    });
  }, { threshold: 0.2 });

  rainObserver.observe(heartRainCanvas.parentElement);

  function createHeart() {
    return {
      x: Math.random() * heartRainCanvas.width,
      y: -20,
      size: 8 + Math.random() * 14,
      speed: 1 + Math.random() * 2.5,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      opacity: 0.3 + Math.random() * 0.5,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05
    };
  }

  function drawHeart(h) {
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(h.rotation);
    ctx.globalAlpha = h.opacity;
    ctx.fillStyle = `hsl(${350 + Math.random() * 15}, ${60 + Math.random() * 20}%, ${55 + Math.random() * 15}%)`;
    ctx.beginPath();
    const s = h.size;
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(-s * 0.5, -s * 0.3, -s, s * 0.1, 0, s);
    ctx.bezierCurveTo(s, s * 0.1, s * 0.5, -s * 0.3, 0, s * 0.3);
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    if (!animating) return;
    ctx.clearRect(0, 0, heartRainCanvas.width, heartRainCanvas.height);

    if (hearts.length < 40 && Math.random() > 0.85) {
      hearts.push(createHeart());
    }

    hearts.forEach((h) => {
      h.y += h.speed;
      h.x += Math.sin(h.wobble) * 0.8;
      h.wobble += h.wobbleSpeed;
      h.rotation += h.rotSpeed;
      drawHeart(h);
    });

    hearts = hearts.filter((h) => h.y < heartRainCanvas.height + 30);
    requestAnimationFrame(animate);
  }
}

/* ═══════════ COVER PARTICLES ═══════════ */
(function initCoverParticles() {
  const container = $('#coverParticles');
  if (!container) return;
  for (let i = 0; i < 15; i++) {
    const p = document.createElement('span');
    p.className = 'floating-heart';
    p.textContent = '♥';
    p.style.left = Math.random() * 100 + '%';
    p.style.fontSize = (10 + Math.random() * 14) + 'px';
    p.style.animationDuration = (6 + Math.random() * 8) + 's';
    p.style.animationDelay = Math.random() * 6 + 's';
    p.style.color = Math.random() > 0.5 ? '#d4736e' : '#c9a96e';
    container.appendChild(p);
  }
})();
