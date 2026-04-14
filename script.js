/* =========================================================
   Mihir Sharma — personal site
   Lightweight static site with procedural canvas details.
   ========================================================= */

/* ---------- UTIL ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- YEAR ---------- */
$('#year').textContent = new Date().getFullYear();

/* ---------- COIN SLOT ---------- */
(() => {
  const coin = $('#coin-slot');
  if (!coin) return;

  const count = $('.coin-count', coin);
  const portrait = $('#portrait-canvas');
  const heroArt = $('.hero-art');
  let credits = 0;

  const playCoin = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audio = new AudioContext();
    const now = audio.currentTime;
    const notes = [784, 1175, 1568];

    notes.forEach((freq, i) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * 0.055);
      gain.gain.setValueAtTime(0.0001, now + i * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.08, now + i * 0.055 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.055 + 0.09);
      osc.connect(gain).connect(audio.destination);
      osc.start(now + i * 0.055);
      osc.stop(now + i * 0.055 + 0.1);
    });

    setTimeout(() => audio.close(), 350);
  };

  coin.addEventListener('click', () => {
    credits += 1;
    count.textContent = credits === 1 ? '1 credit' : credits + ' credits';
    coin.classList.remove('dropping');
    void coin.offsetWidth;
    coin.classList.add('dropping');
    coin.classList.add('inserted');
    if (portrait) {
      portrait.classList.remove('coin-party');
      void portrait.offsetWidth;
      portrait.classList.add('coin-party');
    }
    if (heroArt) heroArt.classList.add('coin-party');
    playCoin();

    window.setTimeout(() => {
      coin.classList.remove('inserted');
    }, 180);

    window.setTimeout(() => {
      coin.classList.remove('dropping');
    }, 560);

    window.setTimeout(() => {
      if (portrait) portrait.classList.remove('coin-party');
      if (heroArt) heroArt.classList.remove('coin-party');
    }, 820);
  });
})();

/* ---------- CABINET WIRING BACKGROUND ---------- */
(() => {
  const canvas = $('#neural-bg');
  const ctx = canvas.getContext('2d');
  const tracks = [
    [[0.08, 0.26], [0.22, 0.26], [0.22, 0.18], [0.38, 0.18]],
    [[0.62, 0.14], [0.76, 0.14], [0.76, 0.28], [0.9, 0.28]],
    [[0.1, 0.68], [0.24, 0.68], [0.24, 0.52], [0.42, 0.52], [0.42, 0.38]],
    [[0.55, 0.72], [0.68, 0.72], [0.68, 0.58], [0.86, 0.58]],
    [[0.2, 0.88], [0.2, 0.78], [0.36, 0.78], [0.36, 0.9], [0.54, 0.9]],
  ];

  const resize = () => {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(devicePixelRatio, devicePixelRatio);
  };
  resize();
  window.addEventListener('resize', resize);

  const px = ([x, y]) => [Math.round(x * window.innerWidth), Math.round(y * window.innerHeight)];

  const step = (t) => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    tracks.forEach((track, ti) => {
      ctx.strokeStyle = ti % 2 ? 'rgba(134, 183, 243, 0.14)' : 'rgba(95, 210, 192, 0.16)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      track.forEach((point, i) => {
        const [x, y] = px(point);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      track.forEach(point => {
        const [x, y] = px(point);
        ctx.fillStyle = '#24261f';
        ctx.fillRect(x - 5, y - 5, 10, 10);
        ctx.fillStyle = ti % 2 ? '#86b7f3' : '#5fd2c0';
        ctx.fillRect(x - 2, y - 2, 4, 4);
      });

      const phase = ((t * 0.00018 + ti * 0.18) % 1);
      const seg = Math.min(track.length - 2, Math.floor(phase * (track.length - 1)));
      const local = (phase * (track.length - 1)) - seg;
      const [ax, ay] = px(track[seg]);
      const [bx, by] = px(track[seg + 1]);
      const x = ax + (bx - ax) * local;
      const y = ay + (by - ay) * local;
      ctx.fillStyle = ti % 3 === 0 ? '#f2b84b' : '#ef6f5b';
      ctx.fillRect(Math.round(x) - 3, Math.round(y) - 3, 6, 6);
    });

    for (let i = 0; i < 12; i++) {
      const x = 40 + i * 90;
      const y = 120 + ((i * 53) % Math.max(160, window.innerHeight - 180));
      if (x < window.innerWidth - 40) {
        ctx.fillStyle = i % 2 ? 'rgba(242, 184, 75, 0.18)' : 'rgba(239, 111, 91, 0.16)';
        ctx.fillRect(x, y, 4, 4);
      }
    }

    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
})();

/* ---------- PIXEL ART ENGINE ----------
   tiny helper: renders a string grid where each char is a color key.
*/
function drawPixelArt(ctx, grid, palette, px = 1, ox = 0, oy = 0) {
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c === '.' || c === ' ') continue;
      ctx.fillStyle = palette[c] || '#fff';
      ctx.fillRect(ox + x * px, oy + y * px, px, px);
    }
  }
}

/* ---------- 8-BIT PORTRAIT (8bitme.png with CRT scanline) ---------- */
(() => {
  const cnv = $('#portrait-canvas');
  if (!cnv) return;
  const ctx = cnv.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const img = new Image();
  img.src = '8bitme.png';

  let scanY = 0;
  let bob = 0;
  const animate = () => {
    ctx.clearRect(0, 0, cnv.width, cnv.height);

    // subtle idle bob — 1-pixel drift
    bob += 0.04;
    const dy = Math.sin(bob) > 0 ? 0 : 4;
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, 0, -dy * 0.5, cnv.width, cnv.height);
    }

    // CRT scan line
    ctx.fillStyle = 'rgba(240, 234, 223, 0.08)';
    ctx.fillRect(0, scanY, cnv.width, 14);
    scanY = (scanY + 2) % cnv.height;

    requestAnimationFrame(animate);
  };
  animate();
})();

/* ---------- PROJECT CARD PIXEL ART ---------- */
(() => {
  const scenes = {
    neural: (ctx, W, H, t) => {
      // pixel neural readout for the C. elegans simulation
      ctx.fillStyle = '#111318';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(95,210,192,0.22)';
      for (let x = 0; x < W; x += 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      for (let i = 0; i < 26; i++) {
        const x = 28 + i * 14;
        const phase = t * 0.08 + i * 0.62;
        const height = 14 + Math.max(0, Math.sin(phase)) * 64;
        const hue = i % 5 === 0 ? '#f2b84b' : (i % 3 === 0 ? '#ef6f5b' : '#5fd2c0');
        ctx.fillStyle = hue;
        ctx.fillRect(x, H - 24 - height, 8, height);
        ctx.fillStyle = 'rgba(240,234,223,0.8)';
        ctx.fillRect(x, H - 28 - height, 8, 4);
      }

      ctx.strokeStyle = '#86b7f3';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 20; x < W - 20; x += 8) {
        const y = 50 + Math.sin(t * 0.06 + x * 0.04) * 20;
        if (x === 20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = '#f2b84b';
      ctx.fillRect(W - 28, 18, 4, 4);
      ctx.fillRect(W - 20, 26, 4, 4);
    },
    robot: (ctx, W, H, t) => {
      ctx.fillStyle = '#111318';
      ctx.fillRect(0, 0, W, H);
      // grid floor
      ctx.strokeStyle = 'rgba(242,184,75,0.26)';
      for (let i = 0; i < 12; i++) {
        const y = H * 0.6 + i * 6;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      // robot body
      const cx = W / 2 + Math.sin(t * 0.03) * 14;
      const cy = H * 0.45;
      // body
      ctx.fillStyle = '#ddd';
      ctx.fillRect(cx - 22, cy - 18, 44, 30);
      // head
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(cx - 14, cy - 34, 28, 18);
      // antenna
      ctx.fillStyle = '#f2b84b';
      ctx.fillRect(cx - 1, cy - 42, 2, 8);
      ctx.fillRect(cx - 3, cy - 44, 6, 4);
      // eyes (blinking)
      const blink = (Math.sin(t * 0.03) > 0.97) ? 1 : 4;
      ctx.fillStyle = '#5fd2c0';
      ctx.fillRect(cx - 8, cy - 26, 4, blink);
      ctx.fillRect(cx + 4, cy - 26, 4, blink);
      // mouth
      ctx.fillStyle = '#ef6f5b';
      ctx.fillRect(cx - 6, cy - 20, 12, 2);
      // wheels
      ctx.fillStyle = '#333';
      ctx.fillRect(cx - 22, cy + 12, 12, 8);
      ctx.fillRect(cx + 10, cy + 12, 12, 8);
      ctx.fillStyle = '#f2b84b';
      ctx.fillRect(cx - 18, cy + 15, 4, 2);
      ctx.fillRect(cx + 14, cy + 15, 4, 2);
    },
    brain: (ctx, W, H, t) => {
      ctx.fillStyle = '#111318';
      ctx.fillRect(0, 0, W, H);
      // animated circuit-brain
      const cx = W / 2, cy = H / 2;
      // brain lobes (pixel squares)
      const shape = [
        '..XXXXXX..',
        '.XXOOOOXX.',
        'XXOOOOOOXX',
        'XOOXOOXOOX',
        'XOOOOOOOOX',
        'XOOXOOXOOX',
        'XXOOOOOOXX',
        '.XXOOOOXX.',
        '..XXXXXX..',
      ];
      const size = 6;
      const ox = cx - (shape[0].length * size) / 2;
      const oy = cy - (shape.length * size) / 2;
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          const c = shape[y][x];
          if (c === '.') continue;
          const pulse = 0.6 + 0.4 * Math.sin(t * 0.05 + x + y);
          if (c === 'X') ctx.fillStyle = `rgba(239,111,91,${0.9 * pulse})`;
          else ctx.fillStyle = `rgba(134,183,243,${0.9 * pulse})`;
          ctx.fillRect(ox + x * size, oy + y * size, size - 1, size - 1);
        }
      }
      // sparks around
      for (let i = 0; i < 6; i++) {
        const a = (t * 0.02 + i * Math.PI / 3) % (Math.PI * 2);
        const r = 48 + Math.sin(t * 0.05 + i) * 6;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        ctx.fillStyle = '#f2b84b';
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }
    },
    gear: (ctx, W, H, t) => {
      ctx.fillStyle = '#111318';
      ctx.fillRect(0, 0, W, H);
      const drawGear = (cx, cy, R, teeth, rot, color) => {
        const inner = R * 0.55;
        ctx.fillStyle = color;
        // teeth as radial squares
        for (let i = 0; i < teeth; i++) {
          const a = rot + (i / teeth) * Math.PI * 2;
          const tx = cx + Math.cos(a) * R;
          const ty = cy + Math.sin(a) * R;
          ctx.fillRect(tx - 3, ty - 3, 6, 6);
        }
        // body
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.78, 0, Math.PI * 2);
        ctx.fill();
        // inner hole
        ctx.fillStyle = '#111318';
        ctx.beginPath();
        ctx.arc(cx, cy, inner * 0.5, 0, Math.PI * 2);
        ctx.fill();
      };
      drawGear(W * 0.35, H * 0.5, 36, 10, t * 0.02, '#86b7f3');
      drawGear(W * 0.72, H * 0.42, 22, 8, -t * 0.03, '#f2b84b');
      drawGear(W * 0.68, H * 0.78, 18, 7, t * 0.04, '#ef6f5b');
    },
  };

  $$('.project-art').forEach(el => {
    const type = el.dataset.art;
    const fn = scenes[type];
    if (!fn) return;
    const cnv = document.createElement('canvas');
    cnv.width = 400; cnv.height = 160;
    el.appendChild(cnv);
    const ctx = cnv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    let t = 0;
    const loop = () => {
      t += 1;
      fn(ctx, cnv.width, cnv.height, t);
      requestAnimationFrame(loop);
    };
    loop();
  });
})();

/* ---------- REVEAL ON SCROLL ---------- */
(() => {
  const els = $$('.section, .xp-card, .project-card, .award, .hero-text, .hero-art');
  els.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => io.observe(el));
})();

/* ---------- KONAMI EASTER EGG ---------- */
(() => {
  const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let i = 0;
  window.addEventListener('keydown', (e) => {
    if (e.key === code[i]) {
      i++;
      if (i === code.length) {
        document.body.style.animation = 'hueShift 3s linear infinite';
        const style = document.createElement('style');
        style.textContent = '@keyframes hueShift { to { filter: hue-rotate(360deg); } }';
        document.head.appendChild(style);
        i = 0;
      }
    } else {
      i = 0;
    }
  });
})();
