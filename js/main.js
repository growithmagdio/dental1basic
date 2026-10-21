/**
 * LUMORA DENTAL STUDIO — Interactive UI & Liquid Glass Controllers
 * Handles: Sticky header elevation, Mobile Navigation, Interactive Before/After slider,
 * FAQ Accordion, Booking Form Validation & Demo Confirmation Modal.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileNav();
  initBeforeAfterSlider();
  initFaqAccordion();
  initBookingForm();
  initModals();
});

/* --------------------------------------------------------------------------
   1. NAVBAR SCROLL ELEVATION
   -------------------------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* --------------------------------------------------------------------------
   2. MOBILE NAVIGATION DRAWER
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.querySelector('.navbar-toggle');
  const overlay = document.querySelector('.mobile-nav-overlay');
  const closeBtn = document.querySelector('.mobile-nav-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !overlay) return;

  const openDrawer = () => {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDrawer();
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* --------------------------------------------------------------------------
   3. INTERACTIVE BEFORE / AFTER SLIDER
   -------------------------------------------------------------------------- */
function initBeforeAfterSlider() {
  const slider = document.querySelector('.comparison-slider-container');
  if (!slider) return;

  const afterWrapper = slider.querySelector('.comparison-after-wrapper');
  const handle = slider.querySelector('.comparison-handle');
  if (!afterWrapper || !handle) return;

  let isDragging = false;

  const setPosition = (clientX) => {
    const rect = slider.getBoundingClientRect();
    let x = clientX - rect.left;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;

    const percentage = (x / rect.width) * 100;
    afterWrapper.style.width = `${percentage}%`;
    handle.style.left = `${percentage}%`;
  };

  slider.addEventListener('mousedown', (e) => {
    isDragging = true;
    setPosition(e.clientX);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    setPosition(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch support for mobile devices
  slider.addEventListener('touchstart', (e) => {
    isDragging = true;
    if (e.touches[0]) setPosition(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches[0]) return;
    setPosition(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });
}

/* --------------------------------------------------------------------------
   4. FAQ ACCORDION
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close other accordions in the same list
      items.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherTrigger = otherItem.querySelector('.faq-trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        }
      });

      if (isActive) {
        item.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   5. APPOINTMENT BOOKING & DEMO RECEIPT ENGINE
   -------------------------------------------------------------------------- */
function initBookingForm() {
  const form = document.getElementById('appointmentForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('[name="fullName"]')?.value.trim();
    const email = form.querySelector('[name="email"]')?.value.trim();
    const phone = form.querySelector('[name="phone"]')?.value.trim();
    const treatment = form.querySelector('[name="treatment"]')?.value;
    const date = form.querySelector('[name="preferredDate"]')?.value;
    const time = form.querySelector('[name="preferredTime"]')?.value;
    const notes = form.querySelector('[name="notes"]')?.value.trim();
    const consent = form.querySelector('[name="consent"]')?.checked;

    if (!name || !email || !treatment || !date) {
      showToast('Please complete all required fields.');
      return;
    }

    if (!consent) {
      showToast('Please agree to the consultation booking terms.');
      return;
    }

    // Generate Fictional Demo Reference Code
    const refCode = 'LUM-' + Math.floor(1000 + Math.random() * 9000);

    // Populate Modal Summary Details
    const modal = document.getElementById('confirmationModal');
    if (modal) {
      const refEl = modal.querySelector('#summaryRefCode');
      const nameEl = modal.querySelector('#summaryName');
      const treatmentEl = modal.querySelector('#summaryTreatment');
      const dateEl = modal.querySelector('#summaryDate');

      if (refEl) refEl.textContent = refCode;
      if (nameEl) nameEl.textContent = name;
      if (treatmentEl) treatmentEl.textContent = treatment;
      if (dateEl) dateEl.textContent = `${date} at ${time || 'Flexible morning'}`;

      modal.classList.add('active');
    }

    showToast(`Appointment Request ${refCode} Logged (Demo)`);
    form.reset();
  });
}

/* --------------------------------------------------------------------------
   6. MODAL & TOAST CONTROLLERS
   -------------------------------------------------------------------------- */
function initModals() {
  const modalOverlays = document.querySelectorAll('.modal-overlay');
  
  modalOverlays.forEach(overlay => {
    const closeBtns = overlay.querySelectorAll('.modal-close-btn, .btn-modal-close');
    
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.classList.remove('active');
      });
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });
}

function showToast(message) {
  let toast = document.querySelector('.toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<span style="color:#C6A574;">✦</span> <span class="toast-text"></span>`;
    document.body.appendChild(toast);
  }

  const textEl = toast.querySelector('.toast-text');
  if (textEl) textEl.textContent = message;

  toast.classList.add('show');
  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}
