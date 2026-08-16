// ===== Footer year =====
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Shopping cart (shared across every page) =====
const CART_KEY = 'beanBoutiqueCart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (err) { return []; }
}

function saveCart(cart) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (err) { /* storage unavailable */ }
  updateCartBadge();
}

function updateCartBadge() {
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach((badge) => {
    badge.textContent = String(count);
    badge.classList.toggle('hidden-badge', count === 0);
  });
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, category: product.category, qty: 1 });
  }
  saveCart(cart);
}

let cartToastTimer = null;
function showToast(message) {
  let toast = document.getElementById('cartToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cartToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(cartToastTimer);
  cartToastTimer = setTimeout(() => toast.classList.remove('visible'), 2000);
}

updateCartBadge();

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-to-cart-btn');
  if (!btn) return;
  const source = btn.dataset.cartId ? btn : btn.closest('[data-cart-id]');
  if (!source) return;
  addToCart({
    id: source.dataset.cartId,
    name: source.dataset.cartName,
    price: parseFloat(source.dataset.cartPrice) || 0,
    category: source.dataset.cartCategory || 'coffee',
  });
  showToast(`Added ${source.dataset.cartName} to cart`);
  btn.classList.add('added');
  const originalText = btn.textContent;
  btn.textContent = 'Added ✓';
  setTimeout(() => {
    btn.classList.remove('added');
    btn.textContent = originalText;
  }, 1400);
});

// ===== Copy promo code (any page) =====
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.copy-code-btn');
  if (!btn) return;
  const code = btn.dataset.code || '';
  const originalText = btn.textContent;

  const flashCopied = () => {
    btn.classList.add('copied');
    btn.textContent = 'Copied ✓';
    showToast(`Code ${code} copied to clipboard`);
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.textContent = originalText;
    }, 1500);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(flashCopied).catch(() => showToast(`Your code: ${code}`));
  } else {
    showToast(`Your code: ${code}`);
  }
});

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
    if (window.__maybeShowCookieBanner) window.__maybeShowCookieBanner();
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

// ===== Cart page (cart.html only) =====
const cartPageContent = document.getElementById('cartPageContent');
if (cartPageContent) {
  const CATEGORY_ICON = { coffee: '☕', equipment: '🫖' };
  const CATEGORY_LABEL = { coffee: 'Coffee', equipment: 'Equipment' };

  function cartSubtotal(cart) {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function renderCart() {
    const cart = getCart();

    if (cart.length === 0) {
      cartPageContent.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" width="56" height="56" aria-hidden="true"><path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="21" r="1.5" fill="currentColor"/><circle cx="18" cy="21" r="1.5" fill="currentColor"/></svg>
          <h2>Your cart is empty</h2>
          <p>Add a favourite blend or a piece of brewing gear and it'll show up here.</p>
          <div class="cart-empty-links">
            <a href="coffee-selection.html" class="btn btn-primary">Browse Coffee</a>
            <a href="brewing-equipment.html" class="btn btn-ghost">Browse Equipment</a>
          </div>
        </div>
      `;
      return;
    }

    const itemsHTML = cart.map((item) => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-thumb" aria-hidden="true">${CATEGORY_ICON[item.category] || '🛍️'}</div>
        <div class="cart-item-info">
          <h3>${item.name}</h3>
          <span class="cart-item-category">${CATEGORY_LABEL[item.category] || 'Item'}</span>
        </div>
        <div class="cart-item-qty">
          <button type="button" class="qty-btn" data-action="decrease" aria-label="Decrease quantity of ${item.name}">−</button>
          <span class="qty-value">${item.qty}</span>
          <button type="button" class="qty-btn" data-action="increase" aria-label="Increase quantity of ${item.name}">+</button>
        </div>
        <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
        <button type="button" class="cart-item-remove" aria-label="Remove ${item.name} from cart">&times;</button>
      </div>
    `).join('');

    const subtotal = cartSubtotal(cart);
    const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

    cartPageContent.innerHTML = `
      <div class="cart-items">${itemsHTML}</div>
      <div class="cart-summary">
        <h3>Order Summary</h3>
        <div class="cart-summary-row"><span>Items (${itemCount})</span><span>$${subtotal.toFixed(2)}</span></div>
        <div class="cart-summary-row"><span>Pickup</span><span>Free</span></div>
        <div class="cart-summary-total"><span>Total</span><span>$${subtotal.toFixed(2)}</span></div>
        <button type="button" class="btn btn-primary" id="checkoutBtn">Proceed to Checkout</button>
        <p class="cart-summary-note">Online payment isn't live yet — we'll email you to arrange pickup &amp; payment.</p>
      </div>
    `;
  }

  function changeQty(id, delta) {
    const cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    item.qty += delta;
    const nextCart = item.qty <= 0 ? cart.filter((i) => i.id !== id) : cart;
    saveCart(nextCart);
    renderCart();
  }

  function removeItem(id) {
    saveCart(getCart().filter((i) => i.id !== id));
    renderCart();
  }

  cartPageContent.addEventListener('click', (e) => {
    const itemEl = e.target.closest('.cart-item');
    if (itemEl) {
      const id = itemEl.dataset.id;
      if (e.target.closest('[data-action="increase"]')) changeQty(id, 1);
      else if (e.target.closest('[data-action="decrease"]')) changeQty(id, -1);
      else if (e.target.closest('.cart-item-remove')) removeItem(id);
      return;
    }
    if (e.target.closest('#checkoutBtn')) openCheckoutModal();
  });

  // ----- Checkout modal -----
  const checkoutOverlay = document.getElementById('checkoutModalOverlay');
  const checkoutClose = document.getElementById('checkoutModalClose');
  const checkoutForm = document.getElementById('checkoutForm');
  const checkoutSummaryText = document.getElementById('checkoutSummaryText');
  const checkoutFormView = document.getElementById('checkoutFormView');
  const checkoutSuccessView = document.getElementById('checkoutSuccessView');
  const checkoutSuccessName = document.getElementById('checkoutSuccessName');

  function openCheckoutModal() {
    if (!checkoutOverlay) return;
    const cart = getCart();
    if (cart.length === 0) return;
    const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
    checkoutSummaryText.textContent = `${itemCount} item${itemCount === 1 ? '' : 's'} · $${cartSubtotal(cart).toFixed(2)} total`;
    checkoutForm.reset();
    checkoutFormView.classList.remove('hidden-card');
    checkoutSuccessView.classList.add('hidden-card');
    checkoutOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckoutModal() {
    if (!checkoutOverlay) return;
    checkoutOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  if (checkoutOverlay) {
    checkoutClose.addEventListener('click', closeCheckoutModal);
    checkoutOverlay.addEventListener('click', (e) => {
      if (e.target === checkoutOverlay) closeCheckoutModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && checkoutOverlay.classList.contains('visible')) closeCheckoutModal();
    });

    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = checkoutForm.querySelector('input[type="text"]');
      checkoutSuccessName.textContent = nameInput && nameInput.value ? nameInput.value.split(' ')[0] : 'there';
      checkoutFormView.classList.add('hidden-card');
      checkoutSuccessView.classList.remove('hidden-card');
      saveCart([]);
      renderCart();
      setTimeout(closeCheckoutModal, 2600);
    });
  }

  renderCart();
}

// ===== Subscription plans (special-offers page only) =====
const subscribeOverlay = document.getElementById('subscribeModalOverlay');
if (subscribeOverlay) {
  const subscribeClose = document.getElementById('subscribeModalClose');
  const subscribeForm = document.getElementById('subscribeForm');
  const subscribeTitle = document.getElementById('subscribeModalTitle');
  const subscribeMeta = document.getElementById('subscribePlanMeta');
  const subscribeFormView = document.getElementById('subscribeFormView');
  const subscribeSuccessView = document.getElementById('subscribeSuccessView');
  const subscribeSuccessName = document.getElementById('subscribeSuccessName');
  const subscribeSuccessPlan = document.getElementById('subscribeSuccessPlan');
  const SUBSCRIPTION_KEY = 'beanBoutiqueSubscription';

  let activePlanId = null;
  let activePlanName = '';

  function getSubscription() {
    try { return JSON.parse(localStorage.getItem(SUBSCRIPTION_KEY)); } catch (err) { return null; }
  }
  function saveSubscription(sub) {
    try { localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(sub)); } catch (err) { /* storage unavailable */ }
  }

  function refreshPlanButtons() {
    const sub = getSubscription();
    document.querySelectorAll('.plan-card[data-plan-id]').forEach((card) => {
      const btn = card.querySelector('.choose-plan-btn');
      if (!btn) return;
      if (sub && sub.planId === card.dataset.planId) {
        btn.textContent = 'Current Plan ✓';
        btn.classList.add('current-plan');
      } else {
        btn.textContent = sub ? 'Switch to This Plan' : 'Choose This Plan';
        btn.classList.remove('current-plan');
      }
    });
  }

  function openSubscribeModal(btn) {
    const card = btn.closest('.plan-card');
    if (!card) return;
    activePlanId = card.dataset.planId;
    activePlanName = card.dataset.planName;
    subscribeTitle.textContent = `Subscribe: ${activePlanName}`;
    subscribeMeta.textContent = card.dataset.planFrequency || '';
    subscribeForm.reset();
    subscribeFormView.classList.remove('hidden-card');
    subscribeSuccessView.classList.add('hidden-card');
    subscribeOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeSubscribeModal() {
    subscribeOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.choose-plan-btn');
    if (btn && !btn.classList.contains('current-plan')) openSubscribeModal(btn);
  });

  subscribeClose.addEventListener('click', closeSubscribeModal);
  subscribeOverlay.addEventListener('click', (e) => {
    if (e.target === subscribeOverlay) closeSubscribeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && subscribeOverlay.classList.contains('visible')) closeSubscribeModal();
  });

  subscribeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = subscribeForm.querySelector('input[type="text"]');
    subscribeSuccessName.textContent = nameInput && nameInput.value ? nameInput.value.split(' ')[0] : 'there';
    subscribeSuccessPlan.textContent = activePlanName;
    subscribeFormView.classList.add('hidden-card');
    subscribeSuccessView.classList.remove('hidden-card');

    saveSubscription({ planId: activePlanId, planName: activePlanName });
    refreshPlanButtons();

    setTimeout(closeSubscribeModal, 2600);
  });

  refreshPlanButtons();
}

// ===== Interactive map pin (homepage only) =====
const mapPin = document.getElementById('mapPin');
const mapTooltip = document.getElementById('mapTooltip');
if (mapPin && mapTooltip) {
  mapPin.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = mapTooltip.classList.toggle('visible');
    mapPin.setAttribute('aria-expanded', String(isVisible));
  });
  document.addEventListener('click', (e) => {
    if (!mapPin.contains(e.target) && !mapTooltip.contains(e.target)) {
      mapTooltip.classList.remove('visible');
      mapPin.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      mapTooltip.classList.remove('visible');
      mapPin.setAttribute('aria-expanded', 'false');
    }
  });
}

// ===== Cookie / privacy consent banner (every page) =====
const cookieBanner = document.getElementById('cookieBanner');
if (cookieBanner) {
  const COOKIE_KEY = 'beanBoutiqueCookieChoice';
  const cookieAccept = document.getElementById('cookieAccept');
  const cookieEssential = document.getElementById('cookieEssential');
  const cookieDetailsToggle = document.getElementById('cookieDetailsToggle');
  const cookieDetails = document.getElementById('cookieDetails');

  function getCookieChoice() {
    try { return localStorage.getItem(COOKIE_KEY); } catch (err) { return null; }
  }
  function setCookieChoice(value) {
    try { localStorage.setItem(COOKIE_KEY, value); } catch (err) { /* storage unavailable */ }
  }

  // Don't compete with the welcome-discount modal for attention: if it's
  // currently open, wait for it to close (via window.__maybeShowCookieBanner,
  // called from the modal's closeModal) rather than showing both at once.
  window.__maybeShowCookieBanner = () => {
    if (getCookieChoice()) return;
    const discountModal = document.getElementById('modalOverlay');
    if (discountModal && discountModal.classList.contains('visible')) return;
    cookieBanner.classList.add('visible');
  };

  setTimeout(() => window.__maybeShowCookieBanner(), 2200);

  function dismissCookieBanner(choice) {
    setCookieChoice(choice);
    cookieBanner.classList.remove('visible');
  }

  cookieAccept.addEventListener('click', () => dismissCookieBanner('all'));
  cookieEssential.addEventListener('click', () => dismissCookieBanner('essential'));
  cookieDetailsToggle.addEventListener('click', () => {
    const isVisible = cookieDetails.classList.toggle('visible');
    cookieDetailsToggle.textContent = isVisible ? 'Hide details' : 'What do you store?';
  });
}
