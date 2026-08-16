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
