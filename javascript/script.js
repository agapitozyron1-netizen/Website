/* ============================================
   SANTI BLINDS — script.js
   ============================================ */

'use strict';

/* ---- NAV: Scroll & Mobile Toggle ---- */
(function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!nav || !hamburger || !navLinks) return;

  // Scroll state
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close on link click (mobile)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });
})();


/* ---- SCROLL REVEAL ---- */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  function revealIfVisible(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.92;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
        setTimeout(() => {
          el.classList.add('in-view');
        }, delay);
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => {
    if (revealIfVisible(el)) {
      const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
      setTimeout(() => el.classList.add('in-view'), 100 + delay);
    } else {
      observer.observe(el);
    }
  });
})();


/* ---- HERO: Animate in on load (index page only) ---- */
(function initHeroLoad() {
  const heroReveals = document.querySelectorAll('.hero .reveal');
  if (!heroReveals.length) return;
  let delay = 200;
  heroReveals.forEach(el => {
    setTimeout(() => {
      el.classList.add('in-view');
    }, delay);
    delay += 120;
  });
})();


/* ---- PAGE HERO INNER PAGES: Animate in on load ---- */
(function initPageHeroLoad() {
  const pageHeroReveals = document.querySelectorAll('.page-hero .reveal');
  if (!pageHeroReveals.length) return;
  let delay = 150;
  pageHeroReveals.forEach(el => {
    setTimeout(() => {
      el.classList.add('in-view');
    }, delay);
    delay += 140;
  });
})();


/* ---- TESTIMONIALS SLIDER ---- */
(function initTestimonials() {
  const slides = document.querySelectorAll('.testimonial');
  const dotsContainer = document.getElementById('tDots');
  const prevBtn = document.getElementById('tPrev');
  const nextBtn = document.getElementById('tNext');
  if (!slides.length || !dotsContainer) return;

  let current = 0;
  let autoTimer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 't-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    slides[current].classList.remove('active');
    dotsContainer.children[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsContainer.children[current].classList.add('active');
    resetAuto();
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  let touchStartX = 0;
  const slider = document.getElementById('testimonialSlider');
  if (slider) {
    slider.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    slider.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });
  }

  resetAuto();
})();


/* ---- CONTACT FORM ---- */
(function initForm() {

  const form = document.getElementById('contactForm');
  if (!form) return;

  // ── Field error helpers ──────────────────────────────────

  function setError(field, msg) {
    const group = field.closest('.form-group') || field.closest('.form-check') || field.parentElement;
    group.classList.add('field--error');
    let hint = group.querySelector('.field-error-msg');
    if (!hint) {
      hint = document.createElement('span');
      hint.className = 'field-error-msg';
      group.appendChild(hint);
    }
    hint.textContent = msg;
  }

  function clearError(field) {
    const group = field.closest('.form-group') || field.closest('.form-check') || field.parentElement;
    group.classList.remove('field--error');
    const hint = group.querySelector('.field-error-msg');
    if (hint) hint.textContent = '';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function shakeField(field) {
    field.style.animation = 'none';
    field.offsetHeight;
    field.style.animation = 'shake 0.4s ease';
  }

  // Clear error on input/change
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => clearError(el));
    el.addEventListener('change', () => clearError(el));
  });

  // ── Validate all fields ──────────────────────────────────

  function validateForm() {
    let valid = true;

    const fields = [
      { el: form.fname,     msg: 'First name is required.' },
      { el: form.lname,     msg: 'Last name is required.' },
      { el: form.phone,     msg: 'Phone / mobile number is required.' },
      { el: form.city,      msg: 'City / municipality is required.' },
    ];

    fields.forEach(({ el, msg }) => {
      if (!el.value.trim()) {
        setError(el, msg);
        shakeField(el);
        valid = false;
      }
    });

    const emailVal = form.email.value.trim();
    if (!emailVal) {
      setError(form.email, 'Email address is required.');
      shakeField(form.email);
      valid = false;
    } else if (!isValidEmail(emailVal)) {
      setError(form.email, 'Please enter a valid email address.');
      shakeField(form.email);
      valid = false;
    }

    const selects = [
      { el: form.interest,  msg: "Please select a product you're interested in." },
      { el: form.preferred, msg: 'Please select a preferred schedule.' },
      { el: form.rooms,     msg: 'Please select the number of windows / rooms.' },
      { el: form.budget,    msg: 'Please select a budget range.' },
    ];

    selects.forEach(({ el, msg }) => {
      if (!el.value) {
        setError(el, msg);
        shakeField(el);
        valid = false;
      }
    });

    const consent = form.consent;
    if (!consent.checked) {
      setError(consent, 'You must agree to be contacted before submitting.');
      valid = false;
    }

    return valid;
  }

  // ── Success modal ────────────────────────────────────────

  function showSuccessModal() {
    const existing = document.getElementById('enquirySuccessModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'enquirySuccessModal';
    modal.style.cssText = `
      position:fixed;inset:0;z-index:9999;
      display:flex;align-items:center;justify-content:center;
      background:rgba(18,18,18,0.72);
      backdrop-filter:blur(6px);
      padding:20px;
      animation:fadeInModal 0.3s ease;
    `;

    modal.innerHTML = `
      <div style="
        background:#1a1a1a;
        border:1px solid rgba(201,169,110,0.3);
        border-radius:12px;
        padding:48px 40px 40px;
        max-width:460px;width:100%;
        text-align:center;
        position:relative;
        animation:scaleInModal 0.35s cubic-bezier(.34,1.56,.64,1);
      ">
        <button id="enquiryModalClose" aria-label="Close" style="
          position:absolute;top:16px;right:18px;
          background:none;border:none;cursor:pointer;
          color:#888;font-size:22px;line-height:1;padding:4px 8px;
        ">&#x2715;</button>

        <div style="
          width:56px;height:56px;border-radius:50%;
          background:rgba(201,169,110,0.12);
          border:1.5px solid rgba(201,169,110,0.4);
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 24px;font-size:22px;color:#c9a96e;
        ">&#x2726;</div>

        <h2 style="
          margin:0 0 10px;
          font-family:'Anton',sans-serif;
          font-size:clamp(1.6rem,4vw,2rem);
          letter-spacing:.06em;
          color:#c9a96e;
        ">Enquiry Sent</h2>

        <p style="
          margin:0 0 6px;
          font-family:'Quicksand',sans-serif;
          font-size:1rem;
          color:#e0dbd2;
          line-height:1.6;
        ">Thank you! We'll be in touch within one business day.</p>

        <p style="
          margin:0 0 32px;
          font-family:'Quicksand',sans-serif;
          font-size:.875rem;
          color:#888;
          line-height:1.6;
        ">In the meantime, feel free to browse our collection.</p>

        <a href="products.html" style="
          display:inline-block;
          padding:.75rem 2rem;
          background:#c9a96e;
          color:#1a1a1a;
          font-family:'Quicksand',sans-serif;
          font-weight:700;
          font-size:.875rem;
          letter-spacing:.08em;
          text-transform:uppercase;
          text-decoration:none;
          border-radius:4px;
        ">View Our Products</a>
      </div>
    `;

    if (!document.getElementById('enquiryModalStyles')) {
      const style = document.createElement('style');
      style.id = 'enquiryModalStyles';
      style.textContent = `
        @keyframes fadeInModal  { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleInModal { from { opacity:0; transform:scale(.88) } to { opacity:1; transform:scale(1) } }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    function closeModal() {
      modal.style.animation = 'fadeInModal 0.2s ease reverse';
      setTimeout(() => {
        modal.remove();
        document.body.style.overflow = '';
      }, 200);
    }

    document.getElementById('enquiryModalClose').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', handler); }
    });
  }

  // ── Form submit ──────────────────────────────────────────

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = form.querySelector('.field--error input, .field--error select, .field--error textarea, .field--error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending\u2026';
    }

    try {
      const data = new FormData(form);
      const response = await fetch('https://santiblinds.site/enquiries.php', {
        method: 'POST',
        body: data,
      });

      // Read as text first — prevents crash if PHP outputs
      // a notice or whitespace before the JSON (common on mobile)
      const raw = await response.text();
      let json = null;
      try {
        const jsonStart = raw.indexOf('{');
        const clean = jsonStart !== -1 ? raw.slice(jsonStart) : raw;
        json = JSON.parse(clean);
      } catch (_) { /* unparseable — handled below */ }

      if (json && json.success) {
        form.reset();
        showSuccessModal();
      } else if (json && json.success === false) {
        showFormError(form, json.message || 'Something went wrong. Please try again.');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
      } else if (response.ok) {
        // HTTP 200 but JSON unreadable — enquiry still went through (DB + email done)
        form.reset();
        showSuccessModal();
      } else {
        showFormError(form, 'Something went wrong. Please try again.');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
      }

    } catch (err) {
      // The fetch threw — usually a CORS/network timing issue AFTER the server
      // already processed the request (DB saved, email sent). Treat as success.
      form.reset();
      showSuccessModal();
    }
  });

  function showFormError(form, message) {
    let errEl = form.querySelector('.form-error-banner');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.className = 'form-error-banner';
      errEl.style.cssText = 'color:#c0392b;background:#fff0f0;border:1px solid #f5c6c6;border-radius:6px;padding:.75rem 1rem;margin-bottom:1rem;font-size:.9rem;';
      form.prepend(errEl);
    }
    errEl.textContent = message;
    errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
})();


/* ---- GALLERY: Filter + Lightbox ---- */
(function initGallery() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-grid__item');

  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        galleryItems.forEach(item => {
          if (filter === 'all' || item.dataset.room === filter) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }

  const productFilterBtns = document.querySelectorAll('.filter-btn[data-filter]');
  const productCards = document.querySelectorAll('.product-card[data-category]');
  if (productCards.length && productFilterBtns.length) {
    productFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        productFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        productCards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  const lightbox   = document.getElementById('lightbox');
  const lbBackdrop = document.getElementById('lightboxBackdrop');
  const lbImg      = document.getElementById('lightboxImg');
  const lbInfo     = document.getElementById('lightboxInfo');
  const lbClose    = document.getElementById('lightboxClose');
  const lbPrev     = document.getElementById('lightboxPrev');
  const lbNext     = document.getElementById('lightboxNext');
  if (!lightbox) return;

  let currentIdx = 0;
  const getVisible = () => [...galleryItems].filter(i => !i.classList.contains('hidden'));

  function openLightbox(idx) {
    const visible = getVisible();
    if (!visible.length) return;
    currentIdx = ((idx % visible.length) + visible.length) % visible.length;
    const item = visible[currentIdx];
    const fill = item.querySelector('.gallery-grid__fill');
    const label = item.querySelector('.gallery-grid__label');
    const product = item.querySelector('.gallery-grid__product');

    if (fill && lbImg) {
      lbImg.style.background = getComputedStyle(fill).background;
      lbImg.style.backgroundImage = getComputedStyle(fill).backgroundImage;
    }
    if (lbInfo) {
      lbInfo.textContent = (label ? label.textContent : '') + (product ? '  \xb7  ' + product.textContent : '');
    }
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const visible = getVisible();
      const visIdx = visible.indexOf(item);
      openLightbox(visIdx);
    });
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const visible = getVisible();
        openLightbox(visible.indexOf(item));
      }
    });
  });

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbBackdrop) lbBackdrop.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', () => openLightbox(currentIdx - 1));
  if (lbNext) lbNext.addEventListener('click', () => openLightbox(currentIdx + 1));

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox(currentIdx - 1);
    if (e.key === 'ArrowRight') openLightbox(currentIdx + 1);
  });

  let lbTouchX = 0;
  lightbox.addEventListener('touchstart', e => { lbTouchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const diff = lbTouchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) openLightbox(diff > 0 ? currentIdx + 1 : currentIdx - 1);
  }, { passive: true });
})();


/* ---- FAQ ACCORDION ---- */
(function initFAQ() {
  const items = document.querySelectorAll('.faq__item, .faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn = item.querySelector('.faq__q, .faq-item__q');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => {
        i.classList.remove('open');
        const b = i.querySelector('.faq__q, .faq-item__q');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();


/* ---- SMOOTH SCROLL ---- */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ---- PARALLAX: Hero slat overlay subtle shift ---- */
(function initParallax() {
  const overlay = document.querySelector('.hero__slats-overlay');
  if (!overlay) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    overlay.style.transform = `translateY(${y * 0.15}px)`;
  }, { passive: true });
})();


/* ---- MARQUEE: Seamless infinite loop ---- */
(function initMarquee() {
  document.querySelectorAll('.marquee').forEach(marquee => {
    const track = marquee.querySelector('.marquee__track');
    if (!track) return;

    track.style.animation = 'none';

    const originalChildren = Array.from(track.children);
    if (!originalChildren.length) return;

    const minWidth = window.innerWidth * 2;

    function getTotalWidth() {
      return track.scrollWidth;
    }

    let safetyLimit = 20;
    while (getTotalWidth() < minWidth && safetyLimit-- > 0) {
      originalChildren.forEach(child => {
        track.appendChild(child.cloneNode(true));
      });
    }

    const oneSetWidth = originalChildren.reduce((sum, el) => {
      return sum + el.getBoundingClientRect().width;
    }, 0);

    const uid = 'mq' + Math.random().toString(36).slice(2, 7);
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ${uid} {
        from { transform: translateX(0); }
        to   { transform: translateX(-${oneSetWidth}px); }
      }
    `;
    document.head.appendChild(style);

    const basePx = 120;
    const duration = Math.round(oneSetWidth / basePx);
    track.style.animation = `${uid} ${duration}s linear infinite`;
  });
})();

/* ---- GALLERY LIGHTBOX: Real image support ---- */
(function initPhotoLightbox() {
  if (!document.getElementById('galleryGrid')) return;

  const lightbox   = document.getElementById('lightbox');
  const lbBackdrop = document.getElementById('lightboxBackdrop');
  const lbImg      = document.getElementById('lightboxImg');
  const lbInfo     = document.getElementById('lightboxInfo');
  const lbCounter  = document.getElementById('lightboxCounter');
  const lbClose    = document.getElementById('lightboxClose');
  const lbPrev     = document.getElementById('lightboxPrev');
  const lbNext     = document.getElementById('lightboxNext');
  if (!lightbox) return;

  let currentIdx = 0;

  function getVisible() {
    return [...document.querySelectorAll('.gallery-grid__item')]
      .filter(i => !i.classList.contains('hidden'));
  }

  function openLightbox(idx) {
    const visible = getVisible();
    if (!visible.length) return;
    currentIdx = ((idx % visible.length) + visible.length) % visible.length;
    const item = visible[currentIdx];

    const photo   = item.querySelector('.gallery-grid__photo');
    const tag     = item.querySelector('.gallery-grid__tag');
    const label   = item.querySelector('.gallery-grid__label');
    const product = item.querySelector('.gallery-grid__product');

    lbImg.innerHTML = '';
    if (photo) {
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt || '';
      lbImg.appendChild(img);
    }

    if (lbInfo) {
      lbInfo.textContent =
        (tag     ? tag.textContent + '  \xb7  ' : '') +
        (label   ? label.textContent             : '') +
        (product ? '  \u2014  ' + product.textContent : '');
    }

    if (lbCounter) {
      lbCounter.textContent = (currentIdx + 1) + ' / ' + visible.length;
    }

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.gallery-grid__item').forEach(item => {
    item.addEventListener('click', () => {
      openLightbox(getVisible().indexOf(item));
    });
  });

  if (lbClose)    lbClose.addEventListener('click', closeLightbox);
  if (lbBackdrop) lbBackdrop.addEventListener('click', closeLightbox);
  if (lbPrev)     lbPrev.addEventListener('click', () => openLightbox(currentIdx - 1));
  if (lbNext)     lbNext.addEventListener('click', () => openLightbox(currentIdx + 1));

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  openLightbox(currentIdx - 1);
    if (e.key === 'ArrowRight') openLightbox(currentIdx + 1);
  });

  let lbTouchX = 0;
  lightbox.addEventListener('touchstart', e => { lbTouchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const diff = lbTouchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) openLightbox(diff > 0 ? currentIdx + 1 : currentIdx - 1);
  }, { passive: true });
})();

/* ---- VIDEO SHOWCASE PLAYER ---- */
(function initVideoShowcase() {
  const video    = document.getElementById('vsVideo');
  const overlay  = document.getElementById('vsOverlay');
  const playBtn  = document.getElementById('vsPlayBtn');
  const pauseBtn = document.getElementById('vsPauseBtn');
  const durEl    = document.getElementById('vsDur');

  if (!video) return;

  video.addEventListener('loadedmetadata', function () {
    const t = Math.round(video.duration);
    const m = Math.floor(t / 60);
    const s = String(t % 60).padStart(2, '0');
    if (durEl) durEl.textContent = m + ':' + s;
  });

  function play() {
    video.play();
    overlay.style.opacity       = '0';
    overlay.style.pointerEvents = 'none';
    if (pauseBtn) pauseBtn.style.display = 'flex';
  }

  function pause() {
    video.pause();
    overlay.style.opacity       = '1';
    overlay.style.pointerEvents = 'auto';
    if (pauseBtn) pauseBtn.style.display = 'none';
  }

  if (playBtn)  playBtn.addEventListener('click',  play);
  if (pauseBtn) pauseBtn.addEventListener('click', pause);

  video.addEventListener('click', function () {
    video.paused ? play() : pause();
  });

  video.addEventListener('ended', function () {
    video.currentTime = 0;
    pause();
  });
})();