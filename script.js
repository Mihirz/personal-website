const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

(() => {
  const coin = $('#coin-slot');
  if (!coin) return;
  const count = $('.coin-count', coin);
  const portrait = $('#portrait-canvas');
  const heroArt = $('.hero-art');
  const storageKey = 'mihir_site_credits';
  let credits = Number.parseInt(window.localStorage.getItem(storageKey) || '0', 10);
  if (!Number.isFinite(credits) || credits < 0) credits = 0;

  const renderCredits = () => {
    count.textContent = credits === 1 ? '1 credit' : `${credits} credits`;
  };
  renderCredits();

  const playCoin = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const audio = new AudioContext();
    const now = audio.currentTime;
    [784, 1175, 1568].forEach((freq, i) => {
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
    window.localStorage.setItem(storageKey, String(credits));
    renderCredits();
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
    setTimeout(() => coin.classList.remove('inserted'), 180);
    setTimeout(() => coin.classList.remove('dropping'), 560);
    setTimeout(() => {
      if (portrait) portrait.classList.remove('coin-party');
      if (heroArt) heroArt.classList.remove('coin-party');
    }, 820);
  });
})();

(() => {
  const canvas = $('#neural-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const tracks = [
    [[0.08, 0.26], [0.22, 0.26], [0.22, 0.18], [0.38, 0.18]],
    [[0.62, 0.14], [0.76, 0.14], [0.76, 0.28], [0.9, 0.28]],
    [[0.1, 0.68], [0.24, 0.68], [0.24, 0.52], [0.42, 0.52], [0.42, 0.38]],
    [[0.55, 0.72], [0.68, 0.72], [0.68, 0.58], [0.86, 0.58]],
    [[0.2, 0.88], [0.2, 0.78], [0.36, 0.78], [0.36, 0.9], [0.54, 0.9]],
  ];
  const pointer = { x: innerWidth * 0.5, y: innerHeight * 0.5, tx: innerWidth * 0.5, ty: innerHeight * 0.5, active: false };

  const resize = () => {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(devicePixelRatio, devicePixelRatio);
  };
  resize();
  addEventListener('resize', resize);
  addEventListener('pointermove', (e) => {
    pointer.tx = e.clientX;
    pointer.ty = e.clientY;
    pointer.active = true;
  });
  addEventListener('pointerleave', () => { pointer.active = false; });

  const px = ([x, y]) => [Math.round(x * innerWidth), Math.round(y * innerHeight)];

  const step = (t) => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    pointer.x += (pointer.tx - pointer.x) * 0.12;
    pointer.y += (pointer.ty - pointer.y) * 0.12;

    if (pointer.active) {
      const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 180);
      glow.addColorStop(0, 'rgba(95, 210, 192, 0.18)');
      glow.addColorStop(0.45, 'rgba(134, 183, 243, 0.08)');
      glow.addColorStop(1, 'rgba(17, 18, 15, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 180, 0, Math.PI * 2);
      ctx.fill();
    }

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

      track.forEach((point) => {
        const [x, y] = px(point);
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const dist = Math.hypot(dx, dy);
        const near = Math.max(0, 1 - dist / 180);
        ctx.fillStyle = '#24261f';
        ctx.fillRect(x - 5, y - 5, 10, 10);
        ctx.fillStyle = near > 0.01 ? `rgba(242, 184, 75, ${0.55 + near * 0.4})` : (ti % 2 ? '#86b7f3' : '#5fd2c0');
        ctx.fillRect(x - 2, y - 2, 4, 4);
      });

      const phase = ((t * 0.00018 + ti * 0.18) % 1);
      const seg = Math.min(track.length - 2, Math.floor(phase * (track.length - 1)));
      const local = (phase * (track.length - 1)) - seg;
      const [ax, ay] = px(track[seg]);
      const [bx, by] = px(track[seg + 1]);
      let x = ax + (bx - ax) * local;
      let y = ay + (by - ay) * local;
      if (pointer.active) {
        const dx = pointer.x - x;
        const dy = pointer.y - y;
        const dist = Math.hypot(dx, dy);
        const pull = Math.max(0, 1 - dist / 220) * 12;
        if (dist > 0) {
          x += (dx / dist) * pull;
          y += (dy / dist) * pull;
        }
      }
      ctx.fillStyle = ti % 3 === 0 ? '#f2b84b' : '#ef6f5b';
      ctx.fillRect(Math.round(x) - 3, Math.round(y) - 3, 6, 6);
    });

    for (let i = 0; i < 12; i++) {
      const x = 40 + i * 90;
      const y = 120 + ((i * 53) % Math.max(160, innerHeight - 180));
      if (x < innerWidth - 40) {
        ctx.fillStyle = i % 2 ? 'rgba(242, 184, 75, 0.18)' : 'rgba(239, 111, 91, 0.16)';
        ctx.fillRect(x, y, 4, 4);
      }
    }

    if (pointer.active) {
      for (let i = 0; i < 3; i++) {
        const radius = 18 + i * 16 + Math.sin(t * 0.01 + i) * 3;
        ctx.strokeStyle = i === 1 ? 'rgba(242, 184, 75, 0.2)' : 'rgba(95, 210, 192, 0.22)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
})();

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
    bob += 0.04;
    const dy = Math.sin(bob) > 0 ? 0 : 4;
    if (img.complete && img.naturalWidth > 0) ctx.drawImage(img, 0, -dy * 0.5, cnv.width, cnv.height);
    ctx.fillStyle = 'rgba(240, 234, 223, 0.08)';
    ctx.fillRect(0, scanY, cnv.width, 14);
    scanY = (scanY + 2) % cnv.height;
    requestAnimationFrame(animate);
  };
  animate();
})();

(() => {
  const drawGlyph = (ctx, glyph, x, y, scale, color) => {
    const map = {
      '2': ['.1111.','11..11','....11','..111.','.11...','11....','111111'],
      '3': ['11111.','....11','..111.','....11','....11','11..11','.1111.'],
      '7': ['111111','....11','...11.','..11..','..11..','.11...','.11...'],
      '9': ['.1111.','11..11','11..11','.11111','....11','11..11','.1111.'],
      '?': ['.1111.','11..11','...11.','..11..','..1...','......','..1...'],
    };
    map[glyph].forEach((row, ry) => [...row].forEach((cell, rx) => {
      if (cell !== '1') return;
      ctx.fillStyle = color;
      ctx.fillRect(x + rx * scale, y + ry * scale, scale - 1, scale - 1);
    }));
  };

  const scenes = {
    neural: (ctx, W, H, t) => {
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
        if (x === 20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    },
    robot: (ctx, W, H, t) => {
      ctx.fillStyle = '#111318';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(242,184,75,0.26)';
      for (let i = 0; i < 12; i++) {
        const y = H * 0.6 + i * 6;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      const cx = W / 2 + Math.sin(t * 0.03) * 14;
      const cy = H * 0.45;
      ctx.fillStyle = '#ddd';
      ctx.fillRect(cx - 22, cy - 18, 44, 30);
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(cx - 14, cy - 34, 28, 18);
      ctx.fillStyle = '#f2b84b';
      ctx.fillRect(cx - 1, cy - 42, 2, 8);
      ctx.fillRect(cx - 3, cy - 44, 6, 4);
      const blink = (Math.sin(t * 0.03) > 0.97) ? 1 : 4;
      ctx.fillStyle = '#5fd2c0';
      ctx.fillRect(cx - 8, cy - 26, 4, blink);
      ctx.fillRect(cx + 4, cy - 26, 4, blink);
      ctx.fillStyle = '#ef6f5b';
      ctx.fillRect(cx - 6, cy - 20, 12, 2);
      ctx.fillStyle = '#333';
      ctx.fillRect(cx - 22, cy + 12, 12, 8);
      ctx.fillRect(cx + 10, cy + 12, 12, 8);
    },
    brain: (ctx, W, H, t) => {
      ctx.fillStyle = '#111318';
      ctx.fillRect(0, 0, W, H);
      const seq = ['3', '7', '2', '9'];
      const phase = Math.floor(t / 40) % seq.length;
      const active = seq[phase];
      ctx.strokeStyle = '#243238';
      for (let x = 30; x < W - 20; x += 54) { ctx.beginPath(); ctx.moveTo(x, 18); ctx.lineTo(x, H - 18); ctx.stroke(); }
      for (let y = 24; y < H - 10; y += 38) { ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(W - 20, y); ctx.stroke(); }
      const boxX = 128, boxY = 26, boxW = 144, boxH = 82;
      ctx.fillStyle = '#182126';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = '#7fd7cc';
      ctx.lineWidth = 4;
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      drawGlyph(ctx, active, boxX + 48, boxY + 12, 8, '#f0eadf');
      for (let i = 0; i < seq.length; i++) {
        const x = 32 + i * 36;
        const y = 74;
        ctx.strokeStyle = i <= phase ? '#f2c86e' : '#364046';
        ctx.strokeRect(x, y, 24, 24);
        if (i < phase) {
          ctx.fillStyle = i % 2 ? '#86b7f3' : '#5fd2c0';
          ctx.fillRect(x + 5, y + 5, 14, 14);
        }
      }
      const bottomY = 114;
      seq.forEach((digit, i) => {
        const x = 98 + i * 52;
        ctx.fillStyle = '#1a2230';
        ctx.fillRect(x, bottomY, 34, 32);
        ctx.strokeStyle = '#50698f';
        ctx.strokeRect(x, bottomY, 34, 32);
        drawGlyph(ctx, i === seq.length - 1 ? '?' : digit, x + 6, bottomY + 6, 3, i === seq.length - 1 ? '#f2c86e' : '#9ec0f3');
      });
      ctx.strokeStyle = '#31464a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(64, 98); ctx.lineTo(118, 62); ctx.lineTo(148, 78); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(252, 78); ctx.lineTo(302, 62); ctx.lineTo(350, 98); ctx.stroke();
      [[78,46],[122,86],[212,30],[286,42],[318,104],[188,18]].forEach(([x,y], i) => {
        ctx.fillStyle = i % 2 ? '#f2c86e' : '#7fd7cc';
        ctx.fillRect(x, y, 8, 8);
      });
    },
    gear: (ctx, W, H, t) => {
      ctx.fillStyle = '#111318';
      ctx.fillRect(0, 0, W, H);
      const drawGear = (cx, cy, R, teeth, rot, color) => {
        const inner = R * 0.55;
        ctx.fillStyle = color;
        for (let i = 0; i < teeth; i++) {
          const a = rot + (i / teeth) * Math.PI * 2;
          const tx = cx + Math.cos(a) * R;
          const ty = cy + Math.sin(a) * R;
          ctx.fillRect(tx - 3, ty - 3, 6, 6);
        }
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.78, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111318';
        ctx.beginPath();
        ctx.arc(cx, cy, inner * 0.5, 0, Math.PI * 2);
        ctx.fill();
      };
      drawGear(W * 0.35, H * 0.5, 36, 10, t * 0.02, '#86b7f3');
      drawGear(W * 0.72, H * 0.42, 22, 8, -t * 0.03, '#f2b84b');
      drawGear(W * 0.68, H * 0.78, 18, 7, t * 0.04, '#ef6f5b');
    },
    eco: (ctx, W, H, t) => {
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#12201a');
      sky.addColorStop(1, '#0f1712');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(95,210,192,0.14)';
      for (let x = 0; x < W; x += 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.fillStyle = '#1b2a22';
      ctx.fillRect(0, H - 22, W, 22);
      for (let i = 0; i < 10; i++) {
        const x = 18 + i * 38;
        const phase = t * 0.05 + i * 0.7;
        const knocked = Math.max(0, Math.sin(phase));
        const hBar = 10 + (1 - knocked) * 70;
        ctx.fillStyle = i % 3 === 0 ? '#ef6f5b' : '#c98a4b';
        ctx.fillRect(x, H - 22 - hBar, 16, hBar);
        ctx.fillStyle = 'rgba(240,234,223,0.35)';
        ctx.fillRect(x + 2, H - 22 - hBar - 6, 12, 4);
        if (knocked > 0.2) {
          ctx.fillStyle = 'rgba(127,215,204,0.5)';
          ctx.fillRect(x + 2, H - 22 - hBar - 14, 2, 8);
          ctx.fillRect(x + 12, H - 22 - hBar - 10, 2, 6);
        }
      }
      const pulse = (Math.sin(t * 0.06) + 1) * 0.5;
      const cx = W / 2;
      const cy = H * 0.42;
      const r = 18 + pulse * 10;
      ctx.fillStyle = '#2d6a3f';
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.5, cy, r * 0.7, r, -0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5fd2c0';
      ctx.beginPath();
      ctx.ellipse(cx + r * 0.5, cy, r * 0.7, r, 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1b2a22';
      ctx.fillRect(cx - 2, cy - 2, 4, r + 12);
      ctx.fillStyle = '#f2b84b';
      const sparkleX = [cx - 40, cx + 44, cx - 26, cx + 30];
      const sparkleY = [cy - 24, cy - 12, cy + 20, cy + 28];
      sparkleX.forEach((sx, i) => {
        if ((t * 0.1 + i) % 4 < 2) {
          ctx.fillRect(sx, sparkleY[i], 4, 4);
          ctx.fillRect(sx - 2, sparkleY[i] + 2, 2, 2);
          ctx.fillRect(sx + 4, sparkleY[i] + 2, 2, 2);
        }
      });
    },
    pyros: (ctx, W, H, t) => {
      ctx.fillStyle = '#111318';
      ctx.fillRect(0, 0, W, H);
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#18212a');
      sky.addColorStop(0.55, '#1d2520');
      sky.addColorStop(1, '#251813');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#1b2a1b';
      ctx.fillRect(0, H - 36, W, 36);
      for (let i = 0; i < W; i += 18) {
        const h = 10 + ((i / 18) % 3) * 4;
        ctx.fillStyle = i % 36 === 0 ? '#284028' : '#223622';
        ctx.fillRect(i, H - 36 - h, 16, h);
      }
      const fireBase = 272 + Math.sin(t * 0.06) * 8;
      for (let i = 0; i < 5; i++) {
        const x = fireBase + i * 14;
        const flame = 18 + Math.sin(t * 0.14 + i) * 10 + i * 3;
        ctx.fillStyle = i % 2 === 0 ? '#ef6f5b' : '#f2b84b';
        ctx.fillRect(x, H - 36 - flame, 10, flame);
      }
      const droneX = 62 + (t * 1.2) % 230;
      const droneY = 44 + Math.sin(t * 0.05) * 9;
      ctx.strokeStyle = '#d8ddd7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(droneX - 22, droneY); ctx.lineTo(droneX + 22, droneY);
      ctx.moveTo(droneX, droneY - 8); ctx.lineTo(droneX, droneY + 10);
      ctx.stroke();
      ctx.fillStyle = '#86b7f3';
      ctx.fillRect(droneX - 8, droneY - 5, 16, 10);
      ctx.fillStyle = '#f0eadf';
      ctx.fillRect(droneX - 28, droneY - 4, 8, 8);
      ctx.fillRect(droneX + 20, droneY - 4, 8, 8);
      ctx.fillRect(droneX - 4, droneY - 18, 8, 8);
      ctx.fillRect(droneX - 4, droneY + 10, 8, 8);
      ctx.fillStyle = '#5fd2c0';
      ctx.fillRect(droneX - 3, droneY + 12, 6, 14);
      ctx.strokeStyle = 'rgba(95, 210, 192, 0.75)';
      ctx.beginPath();
      ctx.moveTo(droneX, droneY + 26); ctx.lineTo(droneX + 18, droneY + 54); ctx.lineTo(droneX + 32, droneY + 82);
      ctx.stroke();
      ctx.fillStyle = '#111318';
      ctx.fillRect(W - 98, 18, 76, 42);
      ctx.strokeStyle = '#5fd2c0';
      ctx.strokeRect(W - 98, 18, 76, 42);
      [0.32, 0.55, 0.78, 0.94].forEach((level, i) => {
        const x = W - 89 + i * 16;
        const h = 8 + level * 20 + Math.sin(t * 0.08 + i) * 2;
        ctx.fillStyle = i < 2 ? '#5fd2c0' : '#ef6f5b';
        ctx.fillRect(x, 52 - h, 10, h);
      });
    },
  };

  $$('.project-art').forEach((el) => {
    const fn = scenes[el.dataset.art];
    if (!fn) return;
    const cnv = document.createElement('canvas');
    cnv.width = 400;
    cnv.height = 160;
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

(() => {
  $$('.project-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - py) * 8;
      const ry = (px - 0.5) * 10;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
})();

(() => {
  const dot = $('#cursor-dot');
  const ring = $('#cursor-ring');
  if (!dot || !ring || matchMedia('(max-width: 900px)').matches) return;
  let x = innerWidth * 0.5;
  let y = innerHeight * 0.5;
  let rx = x;
  let ry = y;
  document.body.classList.add('cursor-active');
  addEventListener('pointermove', (e) => {
    x = e.clientX;
    y = e.clientY;
    dot.style.transform = `translate(${x}px, ${y}px)`;
  });
  addEventListener('pointerleave', () => document.body.classList.remove('cursor-active'));
  addEventListener('pointerenter', () => document.body.classList.add('cursor-active'));
  $$('a, button, .project-card, .xp-toggle').forEach((el) => {
    el.addEventListener('pointerenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('pointerleave', () => document.body.classList.remove('cursor-hover'));
  });
  const loop = () => {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  };
  loop();
})();

(() => {
  $$('.xp-toggle').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const card = toggle.closest('.xp-accordion');
      const panel = document.getElementById(toggle.getAttribute('aria-controls'));
      if (!card || !panel) return;
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      card.classList.toggle('open', !open);
      panel.hidden = open;
    });
  });
})();

(() => {
  const els = $$('.section, .xp-card, .project-card, .award, .hero-text, .hero-art');
  els.forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach((el) => io.observe(el));
})();
