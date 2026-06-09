/* CURSOR */
const cursorEl = document.getElementById('cur');

if (cursorEl) {
  document.addEventListener(
    'mousemove',
    (e) => {
      const rect = cursorEl.getBoundingClientRect();
      const sx = rect.width / 2;
      const sy = rect.height / 2;

      cursorEl.style.transform = `translate(${e.clientX - sx}px,${e.clientY - sy}px)`;
    },
    { passive: true }
  );
}

const heroLogoLink = document.querySelector('.hero-logo');
if (heroLogoLink && cursorEl) {
  heroLogoLink.addEventListener('mouseenter', () => {
    cursorEl.classList.add('cur-click-me');
  });

  heroLogoLink.addEventListener('mouseleave', () => {
    cursorEl.classList.remove('cur-click-me');
  });
}

/* TIME */
function tick() {
  const lt = document.getElementById('lt');
  if (!lt) return;

  lt.textContent =
    'BKN ' +
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/New_York'
    });
}
tick();
setInterval(tick, 30000);

/* LOADER */
const lpEl = document.getElementById('lpct');
const lfEl = document.getElementById('lf');
let p = 0;

setInterval(() => {
  if (!lpEl || !lfEl) return;
  if (p < 90) {
    p += Math.random() * 6 + 2;
    if (p > 90) p = 90;
    lpEl.textContent = Math.floor(p);
    lfEl.style.width = p + '%';
  }
}, 60);

window.addEventListener('load', () => {
  const ldr = document.getElementById('ldr');

  if (lfEl) lfEl.style.width = '100%';
  if (lpEl) lpEl.textContent = '100';

  setTimeout(() => {
    if (ldr) ldr.classList.add('gone');
  }, 350);
});

setTimeout(() => {
  const ldr = document.getElementById('ldr');
  if (lfEl) lfEl.style.width = '100%';
  if (lpEl) lpEl.textContent = '100';
  if (ldr) ldr.classList.add('gone');
}, 2800);

/* HERO + ABOUT BACKGROUND LOOPS */
const backgroundLoopSlides = [
  'assets/hero-loop/01-zfc-2835.jpg',
  'assets/hero-loop/02-dairy-cow2.jpg',
  'assets/hero-loop/03-zfc-0616.jpg',
  'assets/hero-loop/04-zfc-0703.jpg',
  'assets/hero-loop/05-zfc-0833.jpg',
  'assets/hero-loop/06-zfc-1841.jpg',
  'assets/hero-loop/07-zfc-2394.jpg',
  'assets/hero-loop/08-zfc-2442.jpg',
  'assets/hero-loop/09-zfc-2882.jpg',
  'assets/hero-loop/10-zfc-3377.jpg',
  'assets/hero-loop/11-zfc-8845.jpg',
  'assets/hero-loop/12-zfc-8876.jpg',
  'assets/hero-loop/13-zfc-8932.jpg',
  'assets/hero-loop/14-zfc-9008.jpg',
  'assets/hero-loop/15-zfc-0910.jpg'
];

function startBackgroundLoop(selectorA, selectorB, offset) {
  const slides = [
    ...backgroundLoopSlides.slice(offset || 0),
    ...backgroundLoopSlides.slice(0, offset || 0)
  ];

  const layers = [
    document.querySelector(selectorA),
    document.querySelector(selectorB)
  ];

  if (!layers[0] || !layers[1]) return;
  if (!slides.length) return;

  let idx = 0;
  let active = 0;

  function setLayer(layer, src) {
    layer.style.backgroundImage = `url('${src}')`;
  }

  function preload(src) {
    const img = new Image();
    img.src = src;
  }

  setLayer(layers[0], slides[0]);
  layers[0].classList.add('is-active');
  if (window.matchMedia('(max-width:820px)').matches) return;
  if (slides.length > 1) preload(slides[1]);

  if (slides.length < 2) return;

  setInterval(() => {
    idx = (idx + 1) % slides.length;
    active = 1 - active;

    setLayer(layers[active], slides[idx]);
    layers[active].classList.add('is-active');
    layers[1 - active].classList.remove('is-active');
    preload(slides[(idx + 1) % slides.length]);
  }, 4300);
}

startBackgroundLoop('.hero-bg-a', '.hero-bg-b', 0);
startBackgroundLoop('.about-bg-a', '.about-bg-b', 5);

document.querySelectorAll('img').forEach((img) => {
  if (!img.closest('#hero')) {
    img.loading = 'lazy';
    img.decoding = 'async';
  }
});

/* WATERMARK */
function removeWatermark() {
  const c = document.getElementById('spline-outer');
  if (!c) return;

  c.querySelectorAll('a').forEach((el) => el.remove());

  new MutationObserver((ms) => {
    ms.forEach((m) => {
      m.addedNodes.forEach((n) => {
        if (
          n.nodeType === 1 &&
          (n.tagName === 'A' || n.querySelector?.('a'))
        ) {
          n.remove();
        }
      });
    });
  }).observe(c, { childList: true, subtree: true });
}

/* ANNOTATIONS */
function buildAnn() {
  const hero = document.getElementById('hero');
  const so = document.getElementById('spline-outer');
  const svg = document.getElementById('asvg');
  const atr = document.getElementById('at-tr');
  const al = document.getElementById('at-l');
  const ab = document.getElementById('at-b');

  if (!hero || !so || !svg || !atr || !al || !ab) return;

  const hr = hero.getBoundingClientRect();
  const sr = so.getBoundingClientRect();
  const cx = sr.left - hr.left + sr.width * 0.5;
  const cy = sr.top - hr.top + sr.height * 0.5;
  const R = sr.width * 0.48;

  const pts = {
    t: { x: cx, y: cy - R },
    r: { x: cx + R, y: cy },
    b: { x: cx, y: cy + R },
    l: { x: cx - R, y: cy }
  };

  Object.entries(pts).forEach(([k, pt]) => {
    const el = document.getElementById('sq-' + k);
    if (el) {
      el.style.left = pt.x + 'px';
      el.style.top = pt.y + 'px';
    }
  });

  atr.style.left = Math.min(pts.t.x + 50, hero.clientWidth - 200) + 'px';
  atr.style.top = Math.max(pts.t.y - 145, 56) + 'px';

  al.style.left = Math.max(pts.l.x - 197, 6) + 'px';
  al.style.top = pts.l.y + 18 + 'px';

  ab.style.left = pts.b.x + 48 + 'px';
  ab.style.top = pts.b.y + 18 + 'px';

  requestAnimationFrame(() => {
    svg.innerHTML = '';

    const ln = (x1, y1, x2, y2) => {
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', x1);
      l.setAttribute('y1', y1);
      l.setAttribute('x2', x2);
      l.setAttribute('y2', y2);
      svg.appendChild(l);
    };

    const rel = (el) => {
      const r = el.getBoundingClientRect();
      return {
        top: r.top - hr.top,
        bottom: r.bottom - hr.top,
        left: r.left - hr.left,
        right: r.right - hr.left
      };
    };

    const atrB = rel(atr);
    const ly_tr = atrB.bottom + 3;
    ln(atrB.left, ly_tr, atrB.right, ly_tr);
    ln(atrB.left, ly_tr, pts.t.x, pts.t.y);

    const alB = rel(al);
    const ly_l = alB.bottom + 3;
    ln(alB.left, ly_l, alB.right, ly_l);
    ln(alB.right, ly_l, pts.l.x, pts.l.y);

    const dbox = document.getElementById('dbox');
    if (dbox) {
      const db = rel(dbox);
      ln(pts.r.x, pts.r.y, db.left, db.top + (db.bottom - db.top) * 0.45);
    }

    const abB = rel(ab);
    const ly_b = abB.bottom + 3;
    ln(abB.left, ly_b, abB.right, ly_b);
    ln(abB.left, ly_b, pts.b.x, pts.b.y);
  });
}

window.addEventListener('resize', buildAnn, { passive: true });
requestAnimationFrame(() => {
  setTimeout(buildAnn, 200);
  setTimeout(buildAnn, 900);
});

/* ═══════════════════════════════════════════════════════
   FEATURED WORK — vertical gallery
═══════════════════════════════════════════════════════ */
(function () {
  var isMobile = window.matchMedia('(max-width:820px)').matches;
  var wkCenter = document.getElementById('wk-center');
  var wkRight = document.getElementById('wk-right');
  var wkFrame = document.getElementById('wk-frame');
  var imgStrip = document.getElementById('wk-img-strip');
  var namesStrip = document.getElementById('wk-names-strip');
  var slides = Array.from(document.querySelectorAll('.wk-slide'));
  var nameRows = Array.from(document.querySelectorAll('.wk-name-row'));
  var progFill = document.getElementById('wk-prog-fill');
  var cntEl = document.getElementById('wk-counter-num');
  var hint = document.getElementById('wk-scroll-hint');
  var viewBtn = document.getElementById('wk-view-btn');
  var wibName = document.getElementById('wib-proj-name');
  var wibBody = document.getElementById('wib-body');
  var panel = document.getElementById('proj-panel');
  var ppBarTitle = document.getElementById('pp-bar-title');
  var ppBarMeta = document.getElementById('pp-bar-meta');
  var ppGallery = document.getElementById('pp-gallery');
  var overlay = document.getElementById('pp-overlay');
  var closeBtn = document.getElementById('pp-close-btn');
  var projectPage = document.getElementById('project-page');
  var pdTitle = document.getElementById('pd-title');
  var pdRole = document.getElementById('pd-role');
  var pdYear = document.getElementById('pd-year');
  var pdNote = document.getElementById('pd-note');
  var pdImages = document.getElementById('pd-images');
  var pdMoreList = document.getElementById('pd-more-list');
  var pdLogoBtn = document.getElementById('pd-logo-btn');

  if (!wkCenter || !imgStrip || !slides.length) return;

  var TRANSITION = 'transform .85s cubic-bezier(.16,1,.3,1)';
  var QUICK_TRANSITION = 'transform .22s cubic-bezier(.16,1,.3,1)';
  var RETURN_TRANSITION = 'transform .72s cubic-bezier(.16,1,.3,1)';
  var COOL = 650;
  var WHEEL_THRESHOLD = 55;
  var EDGE_OFFSET = 14;
  var N = slides.length;
  var curIdx = 0;
  var slideH = 0, gapPx = 0, rowH = 0, centerH = 0, rightH = 0;
  var wheelAccum = 0;
  var wheelResetTimer = 0;
  var cooldownTimer = 0;
  var edgeLockTimer = 0;
  var lastIdx = 0;

  function pad(n) { return String(n).padStart(2, '0'); }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function isInteractive() { return !isMobile && imgStrip && imgStrip.matches(':hover'); }

  function setStripTransition(value) {
    imgStrip.style.transition = value;
    if (namesStrip) namesStrip.style.transition = value;
  }

  function setStripPosition(imgY, namesY) {
    imgStrip.style.transform = 'translateY(' + imgY.toFixed(2) + 'px)';
    if (!isMobile && namesStrip) {
      namesStrip.style.transform = 'translateY(' + namesY.toFixed(2) + 'px)';
    }
  }

  function sizeFrame() {
    if (isMobile || !slides[0] || !wkFrame) return;
    var rect = slides[0].getBoundingClientRect();
    wkFrame.style.width = rect.width + 'px';
    wkFrame.style.height = rect.height + 'px';
  }

  function measure() {
    if (isMobile || !slides[0]) return;
    slideH = slides[0].offsetHeight;
    centerH = wkCenter.clientHeight;
    rightH = wkRight ? wkRight.clientHeight : 0;
    rowH = nameRows[0] ? nameRows[0].offsetHeight : 60;
    var styles = getComputedStyle(imgStrip);
    gapPx = parseFloat(styles.rowGap) || parseFloat(styles.gap) || 32;
    sizeFrame();
  }

  function imgStripY(idx) {
    return (centerH - slideH) / 2 - idx * (slideH + gapPx);
  }

  function namesStripY(idx) {
    return (rightH - rowH) / 2 - idx * rowH;
  }

  function applyClasses(idx) {
    slides.forEach(function (slide, i) {
      slide.classList.toggle('wk-active', i === idx);
      slide.classList.toggle('wk-adj', Math.abs(i - idx) === 1);
    });

    nameRows.forEach(function (row, i) {
      row.classList.toggle('wk-nr-active', i === idx);
      row.classList.toggle('wk-nr-adj', Math.abs(i - idx) === 1);
    });
  }

  function updateUI(idx) {
    applyClasses(idx);
    if (progFill) progFill.style.width = (N <= 1 ? 100 : idx / (N - 1) * 100) + '%';
    if (cntEl) cntEl.textContent = pad(idx + 1) + ' / ' + pad(N);
    if (hint) hint.classList.toggle('hidden', idx > 0);

    var s = slides[idx] ? slides[idx].dataset : {};
    if (wibName) wibName.textContent = s.ptitle || '';
    if (wibBody) wibBody.innerHTML = (s.pcat || '') + ' — ' + (s.pyear || '') + '<br>→ JULLY LI';

    var bgImg = slides[idx] ? slides[idx].querySelector('img') : null;
    if (bgImg && bgImg.getAttribute('src')) {
      document.documentElement.style.setProperty('--wk-active-bg', 'url("' + bgImg.getAttribute('src') + '")');
    }
  }

  var mobileScrollRaf = 0;
  function syncMobileActiveFromScroll() {
    if (!isMobile || !imgStrip) return;

    var stripRect = imgStrip.getBoundingClientRect();
    var stripCenter = stripRect.left + stripRect.width / 2;
    var closestIdx = curIdx;
    var closestDistance = Infinity;

    slides.forEach(function (slide, i) {
      var rect = slide.getBoundingClientRect();
      var slideCenter = rect.left + rect.width / 2;
      var distance = Math.abs(slideCenter - stripCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIdx = i;
      }
    });

    if (closestIdx !== curIdx) {
      curIdx = closestIdx;
      lastIdx = closestIdx;
      updateUI(closestIdx);
    }
  }

  function requestMobileActiveSync() {
    if (mobileScrollRaf) return;
    mobileScrollRaf = requestAnimationFrame(function () {
      mobileScrollRaf = 0;
      syncMobileActiveFromScroll();
    });
  }

  function goTo(idx, animate) {
    var dir = idx > lastIdx ? 1 : idx < lastIdx ? -1 : 0;
    lastIdx = idx;
    curIdx = clamp(idx, 0, N - 1);

    setStripTransition(animate ? TRANSITION : 'none');
    setStripPosition(imgStripY(curIdx), namesStripY(curIdx));

    if (!animate) {
      requestAnimationFrame(function () {
        setStripTransition(TRANSITION);
      });
    }

    updateUI(curIdx);

    if (animate && dir !== 0) {
      slides.forEach(function (s) {
        var num = s.querySelector('.wk-slide-num');
        if (num) num.style.transform = 'translateY(' + (dir * 18) + 'px)';
      });

      setTimeout(function () {
        slides.forEach(function (s) {
          var num = s.querySelector('.wk-slide-num');
          if (num) num.style.transform = '';
        });
      }, 120);
    }
  }

  function bounceAndScroll(dir, deltaY) {
    if (edgeLockTimer) return;

    var imgY = imgStripY(curIdx);
    var namesY = namesStripY(curIdx);
    var offset = dir > 0 ? -EDGE_OFFSET : EDGE_OFFSET;

    setStripTransition(QUICK_TRANSITION);
    setStripPosition(imgY + offset, namesY + offset * 0.7);

    setTimeout(function () {
      setStripTransition(RETURN_TRANSITION);
      setStripPosition(imgY, namesY);
    }, 36);

    window.scrollTo({
      top: window.scrollY + dir * Math.min(220, Math.max(110, Math.abs(deltaY) * 0.9)),
      behavior: 'smooth'
    });

    edgeLockTimer = setTimeout(function () { edgeLockTimer = 0; }, 520);
  }

  function step(dir, deltaY) {
    if (cooldownTimer) return;

    wheelAccum = 0;
    clearTimeout(wheelResetTimer);

    var next = curIdx + dir;
    if (next < 0 || next >= N) return bounceAndScroll(dir, deltaY || 120);

    goTo(next, true);
    cooldownTimer = setTimeout(function () { cooldownTimer = 0; }, COOL);
  }

  function onWheel(e) {
    if (!isInteractive()) return;
    e.preventDefault();
    if (cooldownTimer) return;

    var delta = e.deltaY;
    if (Math.abs(delta) < 4) return;

    if ((wheelAccum > 0 && delta < 0) || (wheelAccum < 0 && delta > 0)) wheelAccum = 0;
    wheelAccum += delta;

    clearTimeout(wheelResetTimer);
    wheelResetTimer = setTimeout(function () { wheelAccum = 0; }, 140);

    if (Math.abs(wheelAccum) < WHEEL_THRESHOLD) return;
    step(wheelAccum > 0 ? 1 : -1, wheelAccum);
  }

  function openPanel(slide) {
    if (!slide) return;

    var data = slide.dataset;
    var idx = parseInt(data.idx, 10);
    var num = pad(idx + 1);
    var bg = slide.style.getPropertyValue('--slide-bg') || '#f0ede8';

    var gallery = (data.gallery || '').split(',').map(function (src) {
      return src.trim();
    }).filter(Boolean);
    var labels = (data.galleryLabels || '').split(',').map(function (label) {
      return label.trim();
    });

    if (!gallery.length) {
      var coverImgFallback = slide.querySelector('img');
      var coverSrcFallback = coverImgFallback ? coverImgFallback.getAttribute('src') : '';
      gallery = coverSrcFallback ? [coverSrcFallback] : [];
      labels = ['Cover'];
    }

    function escapeAttr(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    function loadInstagramEmbeds() {
      if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
        return;
      }

      if (document.querySelector('script[data-instagram-embed]')) return;

      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.instagram.com/embed.js';
      script.setAttribute('data-instagram-embed', 'true');
      document.body.appendChild(script);
    }

    function noteForProject(d) {
      var title = d.ptitle || 'This project';
      var cat = (d.pcat || 'visual work').toLowerCase();
      if (title === 'MIZE') {
        return "Album cover design created for jazz musician Gal Hecht. Inspired by the album title MIZE (\"Who is it?\" in Hebrew), the artwork explores themes of identity and mystery. Painted in watercolor, the cover features a blurred figure playing piano beneath a waterfall, creating a dreamlike atmosphere that reflects the album's emotional and improvisational nature.";
      }
      if (title === 'FASHION ILLUSTRATIONS') {
        return 'A collection of fashion illustrations exploring garment design, movement, and form. Created using charcoal, markers, and India ink, these drawings focus on expressive linework, texture, and silhouette while capturing the character and presence of each model and design.';
      }
      if (title === 'DOGGIE PLAYGROUND') {
        return 'An interactive Arduino-based music box inspired by playful childhood memories and dogs. The project combines electronics, sculpture, and storytelling, with all physical components hand-built from paper clay and finished with hand-painted details. Users interact with the miniature environment to trigger sound and movement and explore the playful world of the installation.';
      }
      if (/installation|interactive|object|computing/.test(cat)) {
        return title + ' is an interactive project built through tactile material, spatial storytelling, and audience participation. The work uses physical detail and atmosphere to make the viewer slow down and enter the story through the body.';
      }
      if (/album/.test(cat)) {
        return title + ' is an album design project focused on building a clear visual world around sound. The system balances cover imagery, printed objects, and supporting mockups into a cohesive identity.';
      }
      if (/poster/.test(cat)) {
        return title + ' is a poster design project shaped around rhythm, hierarchy, and public-facing impact. The work translates performance and mood into a strong graphic system.';
      }
      if (/photo/.test(cat) && /10&BEANS|CERAMIC|HOME/.test(title)) {
        return title + ' is a photography project for handmade ceramic work, focusing on soft light, tactile surfaces, quiet domestic moments, and the handmade irregularities that give each object its character.';
      }
      if (/photo/.test(cat)) {
        return title + ' captures live music through atmosphere, low light, motion, and performance detail. The series focuses on the intimacy of jazz spaces and the visual rhythm of musicians at work.';
      }
      if (/game/.test(cat)) {
        return title + ' is a narrative game project combining interface, object interaction, and environmental storytelling. The experience uses sequence and choice to unfold a memory-driven world.';
      }
      if (/film|motion|animation/.test(cat)) {
        return title + ' is a stop-motion film project built through handmade sets, puppets, props, and frame-by-frame storytelling. The work brings a small Christmas Eve world to life through material detail, lighting, and sequence.';
      }
      if (/illustration|printmaking/.test(cat)) {
        return title + ' explores image-making through gesture, material texture, and composition. The project focuses on visual character and a tactile sense of process.';
      }
      return title + ' is a selected project from Jully Li’s portfolio, exploring image, story, and visual systems across media.';
    }

    if (!projectPage || !pdImages) return;

    var coverImg = slide.querySelector('img');
    if (coverImg && coverImg.getAttribute('src')) {
      projectPage.style.setProperty('--pd-active-bg', 'url("' + coverImg.getAttribute('src') + '")');
    }

    if (pdTitle) {
      pdTitle.textContent = data.ptitle || '';
      pdTitle.className = '';
    }
    if (pdRole) pdRole.innerHTML = (data.pcat || 'Visual Design') + '<br>Art Direction';
    if (pdYear) pdYear.textContent = data.pyear || '';
    if (pdNote) pdNote.textContent = noteForProject(data);

    pdImages.innerHTML = '';
    if (pdMoreList) pdMoreList.innerHTML = '';

    var needsInstagramEmbed = false;

    for (var i = 0; i < gallery.length; i++) {
      var item = document.createElement('article');
      item.className = 'pd-image-item';
      if (gallery[i]) {
        var isVideo = /\.(mov|mp4|webm)$/i.test(gallery[i]);
        var isInstagram = /^instagram:/i.test(gallery[i]);
        if (isInstagram) needsInstagramEmbed = true;

        var instagramUrl = isInstagram ? gallery[i].replace(/^instagram:/i, '') : '';
        item.innerHTML =
          (isInstagram
            ? '<blockquote class="instagram-media pd-instagram-embed" data-instgrm-captioned data-instgrm-permalink="' + escapeAttr(instagramUrl) + '" data-instgrm-version="14">' +
              '<a class="pd-instagram-link" href="' + escapeAttr(instagramUrl) + '" target="_blank" rel="noopener">View Instagram reel ↗</a>' +
              '</blockquote>'
            : (isVideo
              ? '<video src="' + gallery[i] + '" controls playsinline preload="metadata"></video>'
              : '<img src="' + gallery[i] + '" loading="lazy" decoding="async" alt="' + escapeAttr(labels[i] || data.ptitle || 'Project image') + '">')) +
          '<div class="pd-image-caption"><span>' + num + '.' + (i + 1) + '</span><span>' + escapeAttr(labels[i] || (isInstagram ? 'Instagram' : (isVideo ? 'Video' : 'Image'))) + '</span></div>';
      } else {
        continue;
      }
      pdImages.appendChild(item);
    }

    if (needsInstagramEmbed) loadInstagramEmbeds();

    if (pdMoreList) {
      var moreCount = Math.min(4, Math.max(0, N - 1));
      for (var moreStep = 1; moreStep <= moreCount; moreStep++) {
        var otherIdx = (idx + moreStep) % N;
        var other = slides[otherIdx];
        var otherData = other.dataset;
        var otherImg = other.querySelector('img');
        var otherSrc = otherImg ? otherImg.getAttribute('src') : '';
        var btn = document.createElement('button');
        btn.className = 'pd-more-item';
        btn.innerHTML =
          '<span class="pd-more-num">' + pad(otherIdx + 1) + '</span>' +
          (otherSrc ? '<img src="' + escapeAttr(otherSrc) + '" loading="lazy" decoding="async" alt="' + escapeAttr(otherData.ptitle || 'Project') + '">' : '') +
          '<span class="pd-more-meta"><strong>' + escapeAttr(otherData.ptitle || '') + '</strong>' +
          '<em>' + escapeAttr((otherData.pcat || '') + ' — ' + (otherData.pyear || '')) + '</em></span>';
        btn.addEventListener('click', (function (targetIdx, targetSlide) {
          return function () {
            curIdx = targetIdx;
            lastIdx = targetIdx;
            goTo(targetIdx, false);
            openPanel(targetSlide);
          };
        })(otherIdx, other));
        pdMoreList.appendChild(btn);
      }
    }

    projectPage.classList.add('open');
    projectPage.setAttribute('aria-hidden', 'false');
    projectPage.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    if (panel) panel.classList.remove('open');
    if (overlay) overlay.classList.remove('vis');
    if (projectPage) {
      projectPage.classList.remove('open');
      projectPage.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  }

  function closeDetailTo(targetId) {
    closePanel();
    var target = document.getElementById(targetId);
    if (!target) return;

    setTimeout(function () {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  function init() {
    measure();
    goTo(curIdx, false);
    syncMobileActiveFromScroll();
  }

  requestAnimationFrame(function () {
    requestAnimationFrame(init);
  });

  window.addEventListener('resize', function () {
    isMobile = window.matchMedia('(max-width:820px)').matches;
    measure();
    goTo(curIdx, false);
    syncMobileActiveFromScroll();
  }, { passive: true });

  wkCenter.addEventListener('wheel', onWheel, { passive: false });
  imgStrip.addEventListener('scroll', requestMobileActiveSync, { passive: true });

  slides.forEach(function (slide, idx) {
    slide.addEventListener('click', function (e) {
      e.stopPropagation();

      if (idx !== curIdx) {
        if (isMobile) {
          curIdx = idx;
          lastIdx = idx;
          updateUI(idx);
        } else {
          goTo(idx, true);
        }
      }

      openPanel(slide);
    });
  });

  imgStrip.addEventListener('mouseenter', function () {
    if (cursorEl) cursorEl.classList.add('cur-grow');
  });

  imgStrip.addEventListener('mouseleave', function () {
    if (!cursorEl) return;
    cursorEl.classList.remove('cur-grow');
    cursorEl.classList.remove('cur-click');
  });

  imgStrip.addEventListener('mousedown', function () {
    if (!cursorEl) return;
    cursorEl.classList.add('cur-click');
    cursorEl.classList.remove('cur-grow');
  });

  imgStrip.addEventListener('mouseup', function () {
    if (!cursorEl) return;
    cursorEl.classList.remove('cur-click');
    cursorEl.classList.add('cur-grow');
  });

  nameRows.forEach(function (row) {
    row.addEventListener('click', function () {
      var idx = parseInt(row.dataset.idx, 10);
      if (!isNaN(idx)) goTo(idx, true);
    });
  });

  if (viewBtn) {
    viewBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      openPanel(slides[curIdx]);
    });
  }

  document.addEventListener('click', function (e) {
    var archiveCard = e.target.closest && e.target.closest('.pi-card[data-gallery]');
    if (!archiveCard) return;
    openPanel(archiveCard);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var archiveCard = e.target.closest && e.target.closest('.pi-card[data-gallery]');
    if (!archiveCard) return;
    e.preventDefault();
    openPanel(archiveCard);
  });

  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  document.querySelectorAll('[data-pd-target]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      closeDetailTo(btn.getAttribute('data-pd-target'));
    });
  });
  if (pdLogoBtn) {
    pdLogoBtn.addEventListener('click', function () {
      closeDetailTo('works');
    });
  }
  if (overlay) overlay.addEventListener('click', closePanel);

  document.addEventListener('keydown', function (e) {
    if (((panel && panel.classList.contains('open')) || (projectPage && projectPage.classList.contains('open'))) && e.key === 'Escape') {
      closePanel();
      return;
    }

    if (!isInteractive()) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      step(1, 140);
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1, -140);
    }
  });
})();

/* IMAGE CARD MICRO-INTERACTIONS */
(function () {
  if (window.matchMedia('(hover:none), (pointer:coarse)').matches) return;

  document.addEventListener('pointermove', function (e) {
    var card = e.target.closest && e.target.closest('.pi-card, .pd-more-item');
    if (!card) return;

    var rect = card.getBoundingClientRect();
    var px = (e.clientX - rect.left) / rect.width - 0.5;
    var py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty('--tilt-x', (py * -5).toFixed(2) + 'deg');
    card.style.setProperty('--tilt-y', (px * 5).toFixed(2) + 'deg');
    card.style.setProperty('--glow-x', ((px + 0.5) * 100).toFixed(1) + '%');
    card.style.setProperty('--glow-y', ((py + 0.5) * 100).toFixed(1) + '%');
  }, { passive: true });

  document.addEventListener('pointerout', function (e) {
    var card = e.target.closest && e.target.closest('.pi-card, .pd-more-item');
    if (card && e.relatedTarget && card.contains(e.relatedTarget)) return;
    if (!card) return;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
    card.style.setProperty('--glow-x', '50%');
    card.style.setProperty('--glow-y', '50%');
  });
})();

/* ═══════════════════════════════════════════════════════
   OTHER WORKS — horizontal gallery + right flow
═══════════════════════════════════════════════════════ */
(function () {
  var isMobile = window.matchMedia('(max-width:820px)').matches;
  var owCenter = document.getElementById('ow-center');
  var owRight = document.getElementById('ow-right');
  var owFrame = document.getElementById('ow-frame');
  var imgStrip = document.getElementById('ow-img-strip');
  var slides = Array.from(document.querySelectorAll('.ow-slide'));
  var progFill = document.getElementById('ow-prog-fill');
  var cntEl = document.getElementById('ow-counter-num');
  var hint = document.getElementById('ow-scroll-hint');
  var viewBtn = document.getElementById('ow-view-btn');
  var infoName = document.getElementById('owib-proj-name');
  var infoBody = document.getElementById('owib-body');

  var flowTitle = document.getElementById('ow-flow-title');
  var flowMeta = document.getElementById('ow-flow-meta');
  var flowClose = document.getElementById('ow-flow-close');
  var flowWrap = document.getElementById('ow-flow-wrap');
  var flowStrip = document.getElementById('ow-flow-strip');
  var flowHint = document.getElementById('ow-flow-hint');

  if (!owCenter || !owRight || !imgStrip || !slides.length) return;

  var TRANSITION = 'transform .95s cubic-bezier(.16,1,.3,1)';
  var QUICK_TRANSITION = 'transform .24s cubic-bezier(.16,1,.3,1)';
  var RETURN_TRANSITION = 'transform .78s cubic-bezier(.16,1,.3,1)';
  var COOL = 650;
  var WHEEL_THRESHOLD = 55;
  var EDGE_OFFSET = 18;
  var N = slides.length;

  var curIdx = 0;
  var slideW = 0, gapPx = 0, centerW = 0;
  var wheelAccum = 0;
  var wheelResetTimer = 0;
  var cooldownTimer = 0;
  var edgeLockTimer = 0;
  var lastIdx = 0;

  var flowItems = [];
  var flowCur = 0;
  var flowItemH = 0;
  var flowGap = 0;
  var flowWrapH = 0;
  var flowWheelAccum = 0;
  var flowWheelResetTimer = 0;
  var flowCooldownTimer = 0;

  function pad(n) { return String(n).padStart(2, '0'); }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function isInteractive() { return !isMobile && imgStrip && imgStrip.matches(':hover'); }
  function isFlowOpen() { return owRight.classList.contains('ow-flow-open'); }

  function setStripTransition(value) {
    imgStrip.style.transition = value;
  }

  function setStripPosition(imgX) {
    imgStrip.style.transform = 'translateX(' + imgX.toFixed(2) + 'px)';
  }

  function sizeFrame() {
    if (isMobile || !slides[0] || !owFrame) return;
    var rect = slides[0].querySelector('.ow-slide-art').getBoundingClientRect();
    owFrame.style.width = rect.width + 'px';
    owFrame.style.height = rect.height + 'px';
  }

  function measure() {
    if (!slides[0]) return;
    isMobile = window.matchMedia('(max-width:820px)').matches;
    slideW = slides[0].offsetWidth;
    centerW = owCenter.clientWidth;
    var styles = getComputedStyle(imgStrip);
    gapPx = parseFloat(styles.columnGap) || parseFloat(styles.gap) || 32;
    sizeFrame();
  }

  function imgStripX(idx) {
    return (centerW - slideW) / 2 - idx * (slideW + gapPx);
  }

  function applyClasses(idx) {
    slides.forEach(function (slide, i) {
      slide.classList.toggle('ow-active', i === idx);
      slide.classList.toggle('ow-adj', Math.abs(i - idx) === 1);
    });
  }

  function updateUI(idx) {
    applyClasses(idx);

    if (progFill) {
      progFill.style.width = (N <= 1 ? 100 : (idx / (N - 1) * 100)) + '%';
    }

    if (cntEl) {
      cntEl.textContent = pad(idx + 1) + ' / ' + pad(N);
    }

    if (hint) {
      hint.classList.toggle('hidden', idx > 0);
    }

    var d = slides[idx] ? slides[idx].dataset : {};
    if (infoName) infoName.textContent = d.owTitle || '';
    if (infoBody) infoBody.innerHTML = (d.owCat || '') + ' — ' + (d.owYear || '') + '<br>→ JULLY LI';
  }

  function goTo(idx, animate) {
    var dir = idx > lastIdx ? 1 : idx < lastIdx ? -1 : 0;
    lastIdx = idx;
    curIdx = clamp(idx, 0, N - 1);

    setStripTransition(animate ? TRANSITION : 'none');
    setStripPosition(imgStripX(curIdx));

    if (!animate) {
      requestAnimationFrame(function () {
        setStripTransition(TRANSITION);
      });
    }

    updateUI(curIdx);

    if (animate && dir !== 0) {
      slides.forEach(function (s) {
        var num = s.querySelector('.ow-slide-num');
        if (num) num.style.transform = 'translateX(' + (dir * 18) + 'px)';
      });

      setTimeout(function () {
        slides.forEach(function (s) {
          var num = s.querySelector('.ow-slide-num');
          if (num) num.style.transform = '';
        });
      }, 120);
    }
  }

  function bounceAndScroll(dir, deltaY) {
    if (edgeLockTimer) return;

    var imgX = imgStripX(curIdx);
    var offset = dir > 0 ? -EDGE_OFFSET : EDGE_OFFSET;

    setStripTransition(QUICK_TRANSITION);
    setStripPosition(imgX + offset);

    setTimeout(function () {
      setStripTransition(RETURN_TRANSITION);
      setStripPosition(imgX);
    }, 36);

    window.scrollTo({
      top: window.scrollY + dir * Math.min(220, Math.max(110, Math.abs(deltaY || 120) * 0.9)),
      behavior: 'smooth'
    });

    edgeLockTimer = setTimeout(function () { edgeLockTimer = 0; }, 520);
  }

  function step(dir, deltaY) {
    if (cooldownTimer) return;

    wheelAccum = 0;
    clearTimeout(wheelResetTimer);

    var next = curIdx + dir;
    if (next < 0 || next >= N) {
      bounceAndScroll(dir, deltaY || 120);
      return;
    }

    goTo(next, true);
    cooldownTimer = setTimeout(function () {
      cooldownTimer = 0;
    }, COOL);
  }

  function onWheel(e) {
    if (!isInteractive() || isFlowOpen()) return;

    e.preventDefault();
    if (cooldownTimer) return;

    var delta = e.deltaY;
    if (Math.abs(delta) < 4) return;

    if ((wheelAccum > 0 && delta < 0) || (wheelAccum < 0 && delta > 0)) {
      wheelAccum = 0;
    }

    wheelAccum += delta;

    clearTimeout(wheelResetTimer);
    wheelResetTimer = setTimeout(function () {
      wheelAccum = 0;
    }, 140);

    if (Math.abs(wheelAccum) < WHEEL_THRESHOLD) return;
    step(wheelAccum > 0 ? 1 : -1, wheelAccum);
  }

  function measureFlow() {
    if (!flowItems.length || !flowWrap || !flowStrip) return;
    flowItemH = flowItems[0].offsetHeight;
    flowWrapH = flowWrap.clientHeight;
    var styles = getComputedStyle(flowStrip);
    flowGap = parseFloat(styles.rowGap) || parseFloat(styles.gap) || 18;
  }

  function flowStripY(idx) {
    return (flowWrapH - flowItemH) / 2 - idx * (flowItemH + flowGap);
  }

  function setFlowY(y, animate) {
    if (!flowStrip) return;
    flowStrip.style.transition = animate
      ? 'transform .9s cubic-bezier(.16,1,.3,1)'
      : 'none';
    flowStrip.style.transform = 'translateY(' + y.toFixed(2) + 'px)';
  }

  function applyFlowClasses(idx) {
    flowItems.forEach(function (item, i) {
      item.classList.toggle('ow-flow-active', i === idx);
      item.classList.toggle('ow-flow-adj', Math.abs(i - idx) === 1);
    });

    if (flowHint) {
      flowHint.classList.toggle('hidden', idx > 0);
    }
  }

  function goFlow(idx, animate) {
    flowCur = Math.max(0, Math.min(idx, flowItems.length - 1));
    applyFlowClasses(flowCur);
    setFlowY(flowStripY(flowCur), animate);
  }

  function stepFlow(dir) {
    if (flowCooldownTimer || !flowItems.length) return;

    var next = flowCur + dir;
    if (next < 0 || next >= flowItems.length) return;

    goFlow(next, true);
    flowCooldownTimer = setTimeout(function () {
      flowCooldownTimer = 0;
    }, 600);
  }

  function onFlowWheel(e) {
    if (!isFlowOpen()) return;

    e.preventDefault();
    if (flowCooldownTimer) return;

    var delta = e.deltaY;
    if (Math.abs(delta) < 4) return;

    if ((flowWheelAccum > 0 && delta < 0) || (flowWheelAccum < 0 && delta > 0)) {
      flowWheelAccum = 0;
    }

    flowWheelAccum += delta;

    clearTimeout(flowWheelResetTimer);
    flowWheelResetTimer = setTimeout(function () {
      flowWheelAccum = 0;
    }, 140);

    if (Math.abs(flowWheelAccum) < 55) return;

    stepFlow(flowWheelAccum > 0 ? 1 : -1);
  }

  function openFlow(slide) {
    if (!slide || !flowStrip) return;

    var d = slide.dataset;
    var idx = parseInt(d.idx, 10);
    var num = pad(idx + 1);
    var bg = slide.style.getPropertyValue('--ow-slide-bg') || '#f0ede8';

    if (flowTitle) flowTitle.textContent = d.owTitle || '';
    if (flowMeta) flowMeta.textContent = (d.owCat || '') + ' — ' + (d.owYear || '');

    flowStrip.innerHTML = '';

    var labels = ['HERO IMAGE', 'DETAIL', 'PROCESS', 'CLOSEUP'];

    for (var i = 0; i < 4; i++) {
      var item = document.createElement('div');
      item.className = 'ow-flow-item';
      item.style.setProperty('--ow-flow-bg', bg);
      item.innerHTML =
        '<span class="ow-flow-num">' + num + '.' + (i + 1) + '</span>' +
        '<span class="ow-flow-lbl">' + labels[i] + '</span>';
      flowStrip.appendChild(item);
    }

    flowItems = Array.from(flowStrip.querySelectorAll('.ow-flow-item'));
    flowCur = 0;
    owRight.classList.add('ow-flow-open');

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        measureFlow();
        goFlow(0, false);
      });
    });
  }

  function closeFlow() {
    owRight.classList.remove('ow-flow-open');
    flowItems = [];
    flowCur = 0;
    if (flowStrip) flowStrip.innerHTML = '';
  }

  function init() {
    measure();
    goTo(curIdx, false);
  }

  requestAnimationFrame(function () {
    requestAnimationFrame(init);
  });

  window.addEventListener('resize', function () {
    measure();
    goTo(curIdx, false);

    if (isFlowOpen()) {
      measureFlow();
      goFlow(flowCur, false);
    }
  }, { passive: true });

  owCenter.addEventListener('wheel', onWheel, { passive: false });

  owCenter.addEventListener('click', function () {
    openFlow(slides[curIdx]);
  });

  imgStrip.addEventListener('mouseenter', function () {
    if (cursorEl) cursorEl.classList.add('cur-grow');
  });

  imgStrip.addEventListener('mouseleave', function () {
    if (!cursorEl) return;
    cursorEl.classList.remove('cur-grow');
    cursorEl.classList.remove('cur-click');
  });

  imgStrip.addEventListener('mousedown', function () {
    if (!cursorEl) return;
    cursorEl.classList.add('cur-click');
    cursorEl.classList.remove('cur-grow');
  });

  imgStrip.addEventListener('mouseup', function () {
    if (!cursorEl) return;
    cursorEl.classList.remove('cur-click');
    cursorEl.classList.add('cur-grow');
  });

  if (viewBtn) {
    viewBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      openFlow(slides[curIdx]);
    });
  }

  if (flowClose) {
    flowClose.addEventListener('click', closeFlow);
  }

  if (flowWrap) {
    flowWrap.addEventListener('wheel', onFlowWheel, { passive: false });
  }

  document.addEventListener('keydown', function (e) {
    if (isFlowOpen()) {
      if (e.key === 'Escape') {
        closeFlow();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        stepFlow(1);
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        stepFlow(-1);
        return;
      }
    }

    if (!isInteractive()) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      step(1, 140);
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      step(-1, -140);
    }
  });
})();

/* expose for spline.js */
window.buildAnn = buildAnn;
window.removeWatermark = removeWatermark;

/* SCROLL REVEAL */
const revealEls = document.querySelectorAll('.rv');
if (revealEls.length) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('in');
    });
  }, { threshold: 0.1 });

  revealEls.forEach((el) => obs.observe(el));
}
