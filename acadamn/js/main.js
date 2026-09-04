/* AcaDAMN shared site interactions */
(function () {
  'use strict';

  /* ---------- Mobile nav drawer ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var drawer = document.querySelector('.mobile-drawer');
  var drawerClose = document.querySelector('.mobile-drawer-close');
  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (navToggle) navToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);

  /* ---------- Mega menu (desktop) ---------- */
  document.querySelectorAll('[data-menu-trigger]').forEach(function (trigger) {
    var menuId = trigger.getAttribute('data-menu-trigger');
    var menu = document.getElementById(menuId);
    if (!menu) return;
    function toggle(open) {
      menu.classList.toggle('open', open);
      trigger.setAttribute('aria-expanded', String(open));
    }
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      toggle(!menu.classList.contains('open'));
    });
    document.addEventListener('click', function (e) {
      if (!trigger.contains(e.target) && !menu.contains(e.target)) toggle(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') toggle(false);
    });
  });

  /* ---------- Service tabs ---------- */
  var tabButtons = document.querySelectorAll('.service-tab-btn');
  var tabPanels = document.querySelectorAll('.service-tab-panel');
  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-tab');
      tabButtons.forEach(function (b) { b.classList.toggle('active', b === btn); b.setAttribute('aria-selected', b === btn); });
      tabPanels.forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-panel') === target); });
    });
  });

  /* ---------- Stat counters ---------- */
  var counters = document.querySelectorAll('[data-counter]');
  if (counters.length && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-counter'), 10) || 0;
        var duration = 1200;
        var start = null;
        function step(ts) {
          if (start === null) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          el.textContent = Math.floor(progress * target).toLocaleString() + (el.getAttribute('data-suffix') || '');
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target.toLocaleString() + (el.getAttribute('data-suffix') || '');
        }
        requestAnimationFrame(step);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { counterObserver.observe(c); });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); revealObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (r) { revealObserver.observe(r); });
  }

  /* ---------- Instant quote calculator (indicative estimate only) ---------- */
  var quoteForm = document.getElementById('quoteCalculator');
  if (quoteForm) {
    var priceOut = quoteForm.querySelector('[data-quote-price]');
    var baseRates = { assignment: 16, essay: 15, dissertation: 22, coursework: 17, research: 20, editing: 9 };
    var levelMultiplier = { undergraduate: 1, masters: 1.25, phd: 1.6 };
    var deadlineMultiplier = { standard: 1, week: 1.2, urgent: 1.5 };

    function calculate() {
      var service = quoteForm.service.value;
      var level = quoteForm.level.value;
      var deadline = quoteForm.deadline.value;
      var words = parseInt(quoteForm.words.value, 10) || 1000;
      var rate = baseRates[service] || 16;
      var lvl = levelMultiplier[level] || 1;
      var dl = deadlineMultiplier[deadline] || 1;
      var estimate = Math.max(45, Math.round(((words / 250) * rate * lvl * dl) / 5) * 5);
      if (priceOut) priceOut.textContent = '£' + estimate.toLocaleString();
    }
    quoteForm.addEventListener('change', calculate);
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      calculate();
      var params = new URLSearchParams({
        service: quoteForm.service.value,
        level: quoteForm.level.value,
        subject: quoteForm.subject.value,
        words: quoteForm.words.value,
        deadline: quoteForm.deadline.value
      });
      window.location.href = 'order.html?' + params.toString();
    });
    calculate();
  }

  /* ---------- Order wizard (prototype — no real backend/payment) ---------- */
  var wizard = document.getElementById('orderWizard');
  if (wizard) {
    var steps = Array.prototype.slice.call(wizard.querySelectorAll('.wizard-panel'));
    var dots = Array.prototype.slice.call(wizard.querySelectorAll('.wizard-progress .dot'));
    var current = 0;

    function showStep(i) {
      steps.forEach(function (s, idx) { s.classList.toggle('active', idx === i); });
      dots.forEach(function (d, idx) {
        d.classList.toggle('current', idx === i);
        d.classList.toggle('done', idx < i);
      });
      window.scrollTo({ top: wizard.offsetTop - 100, behavior: 'smooth' });
      fillSummary();
      current = i;
    }

    wizard.querySelectorAll('[data-next]').forEach(function (btn) {
      btn.addEventListener('click', function () { if (current < steps.length - 1) showStep(current + 1); });
    });
    wizard.querySelectorAll('[data-back]').forEach(function (btn) {
      btn.addEventListener('click', function () { if (current > 0) showStep(current - 1); });
    });

    // Plan select cards
    wizard.querySelectorAll('.plan-select-card').forEach(function (card) {
      card.addEventListener('click', function () {
        wizard.querySelectorAll('.plan-select-card').forEach(function (c) { c.classList.remove('selected'); });
        card.classList.add('selected');
        card.querySelector('input').checked = true;
        fillSummary();
      });
    });

    wizard.addEventListener('change', function () { fillSummary(); });

    // Prefill from query string (from homepage/pricing calculator)
    var qs = new URLSearchParams(window.location.search);
    var fieldMap = { service: 'w-service', level: 'w-level', subject: 'w-subject', words: 'w-words', deadline: 'w-deadline' };
    Object.keys(fieldMap).forEach(function (key) {
      var val = qs.get(key);
      var el = document.getElementById(fieldMap[key]);
      if (val && el) el.value = val;
    });
    var plan = qs.get('plan');
    if (plan) {
      var planCard = wizard.querySelector('.plan-select-card[data-plan="' + plan + '"]');
      if (planCard) planCard.click();
    }

    var extraRates = { priority: 25, originality: 12, editing: 15, slides: 20, sources: 10 };
    var planRates = { essential: 16, plus: 19, advanced: 24 };
    var baseRates2 = { assignment: 16, essay: 15, dissertation: 22, coursework: 17, research: 20, editing: 9 };
    var levelMultiplier2 = { undergraduate: 1, masters: 1.25, phd: 1.6 };
    var deadlineMultiplier2 = { standard: 1, week: 1.2, urgent: 1.5 };

    function computeTotal() {
      var words = parseInt(document.getElementById('w-words').value, 10) || 1000;
      var service = document.getElementById('w-service').value;
      var level = document.getElementById('w-level').value;
      var deadline = document.getElementById('w-deadline').value;
      var selectedPlan = wizard.querySelector('.plan-select-card.selected');
      var planKey = selectedPlan ? selectedPlan.getAttribute('data-plan') : 'essential';
      var rate = planRates[planKey] || baseRates2[service] || 16;
      var lvl = levelMultiplier2[level] || 1;
      var dl = deadlineMultiplier2[deadline] || 1;
      var base = Math.round(((words / 250) * rate * lvl * dl));
      var extrasTotal = 0;
      var extrasSelected = [];
      wizard.querySelectorAll('.extra-row input[type="checkbox"]:checked').forEach(function (cb) {
        var key = cb.value;
        extrasTotal += extraRates[key] || 0;
        extrasSelected.push(cb.getAttribute('data-label'));
      });
      return { base: base, extrasTotal: extrasTotal, extrasSelected: extrasSelected, total: base + extrasTotal, planKey: planKey };
    }

    function fillSummary() {
      var r = computeTotal();
      var setText = function (id, text) { var el = document.getElementById(id); if (el) el.textContent = text; };
      setText('sum-plan', r.planKey.charAt(0).toUpperCase() + r.planKey.slice(1));
      setText('sum-base', '£' + r.base);
      setText('sum-extras', r.extrasSelected.length ? r.extrasSelected.join(', ') + ' (+£' + r.extrasTotal + ')' : 'None selected');
      setText('sum-total', '£' + r.total);
      var ref = document.getElementById('sum-ref');
      if (ref && !ref.textContent) ref.textContent = 'AD-' + Math.floor(100000 + Math.random() * 899999);
    }

    fillSummary();

    var payForm = document.getElementById('paymentForm');
    if (payForm) {
      payForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var ref = document.getElementById('sum-ref');
        var ref2 = document.getElementById('sum-ref-2');
        if (ref2 && ref) ref2.textContent = ref.textContent;
        document.getElementById('paymentStepInner').hidden = true;
        document.getElementById('confirmationPanel').hidden = false;
      });
    }
  }

  /* ---------- Generic tabbed panels (dashboard / admin sidebars, auth tabs) ---------- */
  document.querySelectorAll('[data-tabgroup]').forEach(function (group) {
    var groupName = group.getAttribute('data-tabgroup');
    var triggers = document.querySelectorAll('[data-tabtrigger="' + groupName + '"]');
    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        var target = trigger.getAttribute('data-target');
        triggers.forEach(function (t) { t.classList.toggle('active', t === trigger); });
        group.querySelectorAll('[data-panel-id]').forEach(function (panel) {
          panel.classList.toggle('active', panel.getAttribute('data-panel-id') === target);
        });
      });
    });
  });

  /* ---------- FAQ search filter (faq page) ---------- */
  var faqSearch = document.getElementById('faqSearch');
  if (faqSearch) {
    faqSearch.addEventListener('input', function () {
      var q = faqSearch.value.trim().toLowerCase();
      document.querySelectorAll('.faq-item').forEach(function (item) {
        var text = item.textContent.toLowerCase();
        item.style.display = text.indexOf(q) !== -1 ? '' : 'none';
      });
      document.querySelectorAll('.faq-group-title').forEach(function (title) {
        var group = title.nextElementSibling;
        var anyVisible = false;
        while (group && group.classList && group.classList.contains('faq-item')) {
          if (group.style.display !== 'none') anyVisible = true;
          group = group.nextElementSibling;
        }
        title.style.display = anyVisible ? '' : 'none';
      });
    });
  }

  /* ---------- Floating support panel ---------- */
  var supportToggle = document.querySelector('.floating-toggle');
  var supportPanel = document.querySelector('.floating-support-panel');
  if (supportToggle && supportPanel) {
    supportToggle.addEventListener('click', function () {
      supportPanel.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!supportToggle.contains(e.target) && !supportPanel.contains(e.target)) {
        supportPanel.classList.remove('open');
      }
    });
  }

  /* ---------- Set current year in footer ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
