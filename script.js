// ===== Footer year =====
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Mobile nav toggle =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

// Highlight active nav link based on scroll position (homepage only —
// other pages set their current-page link active statically in HTML)
if (document.getElementById('home')) {
  const sections = document.querySelectorAll('main section[id], .hero[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const updateActiveLink = () => {
    let currentId = 'home';
    const scrollPos = window.scrollY + 120;
    sections.forEach((section) => {
      if (scrollPos >= section.offsetTop) currentId = section.id;
    });
    navAnchors.forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === `#${currentId}`);
    });
  };
  window.addEventListener('scroll', updateActiveLink, { passive: true });
}

// ===== Slideshow (homepage only) =====
const slideshow = document.getElementById('slideshow');
if (slideshow) {
  const slidesTrack = document.getElementById('slidesTrack');
  const slides = slidesTrack.querySelectorAll('.slide');
  const dotsWrap = document.getElementById('slideDots');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');

  let currentSlide = 0;
  let slideTimer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll('button');

  function goToSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    slidesTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlide() { goToSlide(currentSlide - 1); }

  function startAutoplay() {
    stopAutoplay();
    slideTimer = setInterval(nextSlide, 5000);
  }
  function stopAutoplay() {
    if (slideTimer) clearInterval(slideTimer);
  }

  nextBtn.addEventListener('click', () => { nextSlide(); startAutoplay(); });
  prevBtn.addEventListener('click', () => { prevSlide(); startAutoplay(); });
  slideshow.addEventListener('mouseenter', stopAutoplay);
  slideshow.addEventListener('mouseleave', startAutoplay);

  startAutoplay();
}

// ===== Coffee catalogue filter (coffee selection page only) =====
const filterTabs = document.querySelectorAll('.filter-tab');
if (filterTabs.length) {
  const coffeeCards = document.querySelectorAll('.coffee-card');
  filterTabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterTabs.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      coffeeCards.forEach((card) => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden-card', !match);
      });
    });
  });
}

// ===== Newsletter form (inline, in-page) =====
const newsletterForm = document.getElementById('newsletterForm');
const newsletterNote = document.getElementById('newsletterNote');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    newsletterNote.textContent = "You're on the list! Check your inbox for a welcome note.";
    newsletterForm.reset();
  });
}

// ===== First-visit discount modal =====
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalDismiss = document.getElementById('modalDismiss');
const modalForm = document.getElementById('modalForm');
const STORAGE_KEY = 'beanBoutiqueDiscountSeen';

if (modalOverlay) {
  function openModal() {
    modalOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('visible');
    document.body.style.overflow = '';
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch (err) { /* storage unavailable */ }
  }

  try {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTimeout(openModal, 1800);
    }
  } catch (err) {
    setTimeout(openModal, 1800);
  }

  modalClose.addEventListener('click', closeModal);
  modalDismiss.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('visible')) closeModal();
  });

  modalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const modal = modalOverlay.querySelector('.modal');
    modal.innerHTML = `
      <div class="modal-visual" aria-hidden="true">
        <svg viewBox="0 0 100 100" width="56" height="56">
          <path d="M25 52l16 16 34-38" fill="none" stroke="#fff8f0" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3>You're in! 🎉</h3>
      <p>Your code <strong>WELCOME15</strong> is on its way to your inbox. See you at the counter soon.</p>
    `;
    setTimeout(closeModal, 2200);
  });
}

// ===== Event registration modal (events page only) =====
const registerOverlay = document.getElementById('registerModalOverlay');
if (registerOverlay) {
  const registerClose = document.getElementById('registerModalClose');
  const registerForm = document.getElementById('registerForm');
  const registerTitle = document.getElementById('registerModalTitle');
  const registerMeta = document.getElementById('registerEventMeta');
  const registerFormView = document.getElementById('registerFormView');
  const registerSuccessView = document.getElementById('registerSuccessView');
  const successName = document.getElementById('successName');
  const successEvent = document.getElementById('successEvent');
  const REGISTER_KEY = 'beanBoutiqueRegisteredEvents';

  let activeEventId = null;
  let activeEventName = '';

  function getRegisteredIds() {
    try { return JSON.parse(localStorage.getItem(REGISTER_KEY)) || []; } catch (err) { return []; }
  }
  function saveRegisteredIds(ids) {
    try { localStorage.setItem(REGISTER_KEY, JSON.stringify(ids)); } catch (err) { /* storage unavailable */ }
  }
  function markCardRegistered(card) {
    const btn = card.querySelector('.register-btn');
    if (btn) {
      btn.textContent = "You're Registered ✓";
      btn.disabled = true;
      btn.classList.add('registered');
    }
  }

  getRegisteredIds().forEach((id) => {
    const card = document.querySelector(`.session-card[data-event-id="${id}"]`);
    if (card) markCardRegistered(card);
  });

  function openRegisterModal(btn) {
    const card = btn.closest('.session-card');
    if (!card) return;
    activeEventId = card.dataset.eventId;
    activeEventName = card.dataset.eventName;
    registerTitle.textContent = `Register: ${activeEventName}`;
    registerMeta.textContent = `${card.dataset.eventWhen} · ${card.dataset.eventLocation}`;
    registerForm.reset();
    registerFormView.classList.remove('hidden-card');
    registerSuccessView.classList.add('hidden-card');
    registerOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeRegisterModal() {
    registerOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.register-btn');
    if (btn && !btn.disabled) openRegisterModal(btn);
  });

  registerClose.addEventListener('click', closeRegisterModal);
  registerOverlay.addEventListener('click', (e) => {
    if (e.target === registerOverlay) closeRegisterModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && registerOverlay.classList.contains('visible')) closeRegisterModal();
  });

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = registerForm.querySelector('input[type="text"]');
    successName.textContent = nameInput && nameInput.value ? nameInput.value.split(' ')[0] : 'there';
    successEvent.textContent = activeEventName;
    registerFormView.classList.add('hidden-card');
    registerSuccessView.classList.remove('hidden-card');

    const ids = getRegisteredIds();
    if (activeEventId && !ids.includes(activeEventId)) {
      ids.push(activeEventId);
      saveRegisteredIds(ids);
    }
    const card = document.querySelector(`.session-card[data-event-id="${activeEventId}"]`);
    if (card) {
      markCardRegistered(card);
      const leftText = card.querySelector('.capacity-left-text');
      const fill = card.querySelector('.capacity-bar-fill');
      if (leftText && /^\d+ of \d+$/.test(leftText.textContent)) {
        const [taken, total] = leftText.textContent.split(' of ').map(Number);
        const newTaken = Math.min(taken + 1, total);
        leftText.textContent = `${newTaken} of ${total}`;
        if (fill) fill.style.width = `${(newTaken / total) * 100}%`;
      }
    }

    setTimeout(closeRegisterModal, 2400);
  });
}
