/**
 * Aura Dental Studio - Modern Healthcare Client Engine
 */

const CONFIG = {
  PHONE: '+919876543210',
  WHATSAPP: '919876543210',
  LEADS_ENDPOINT: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', // VERIFY WITH CLIENT
  HOURS: {
    start: 10,
    end: 20.5,
    sundayEnd: 14
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initStatusChip();
  initSmartSticky();
  initScrollSpy();
  initMobileMenu();
  initBookingModal();
  initFaqAccordion();
  initFormHandlers();

  trackAnalytics();
});

/* ==========================================================================
   1. i18n Dictionary
   ========================================================================== */
/* ==========================================================================
   2. Live Status Chip (IST)
   ========================================================================== */
function initStatusChip() {
  const chip = document.getElementById('liveStatusChip');
  const text = document.getElementById('statusText');
  if (!chip || !text) return;

  function updateStatus() {
    const options = { timeZone: 'Asia/Kolkata', hour12: false, hour: 'numeric', minute: 'numeric', weekday: 'short' };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(new Date());
    
    let hour = 0, minute = 0, weekday = '';
    parts.forEach(p => {
      if (p.type === 'hour') hour = parseInt(p.value, 10);
      if (p.type === 'minute') minute = parseInt(p.value, 10);
      if (p.type === 'weekday') weekday = p.value;
    });

    const time = hour + (minute / 60);
    const isSunday = weekday === 'Sun';
    const endHour = isSunday ? CONFIG.HOURS.sundayEnd : CONFIG.HOURS.end;
    
    let isOpen = false;
    let label = "";

    if (time >= CONFIG.HOURS.start && time < endHour) {
      isOpen = true;
      const closeTime = isSunday ? "2:00 PM" : "8:30 PM";
      label = `Open now · Closes ${closeTime}`;
    } else {
      label = `Closed · Opens 10:00 AM`;
    }

    if (isOpen) {
      chip.classList.remove('closed');
      chip.classList.add('open');
    } else {
      chip.classList.remove('open');
      chip.classList.add('closed');
    }
    text.textContent = label;
  }

  updateStatus();
  setInterval(updateStatus, 60000);
}

/* ==========================================================================
   3. Smart Sticky Header
   ========================================================================== */
function initSmartSticky() {
  const header = document.getElementById('siteHeader');
  const announcement = document.getElementById('announcementBar');
  if (!header || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Collapse announcement after 50px
    if (announcement) {
      if (currentScroll > 50) announcement.classList.add('collapsed');
      else announcement.classList.remove('collapsed');
    }

    // Hide/show header
    if (currentScroll <= 0) {
      header.classList.remove('scrolled-up', 'scrolled-down');
    } else if (currentScroll > lastScroll && currentScroll > 100) {
      header.classList.remove('scrolled-up');
      header.classList.add('scrolled-down');
    } else if (currentScroll < lastScroll) {
      header.classList.remove('scrolled-down');
      header.classList.add('scrolled-up');
    }
    lastScroll = currentScroll;
  }, { passive: true });
}

/* ==========================================================================
   4. Scroll-Spy
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');
  
  if (!sections.length || !window.IntersectionObserver) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.removeAttribute('aria-current');
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.setAttribute('aria-current', 'true');
          }
        });
      }
    });
  }, { rootMargin: "-20% 0px -80% 0px" });

  sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   5. Mobile Drawer Menu
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const closeBtn = document.getElementById('mobileMenuCloseBtn');
  const overlay = document.getElementById('mobileOverlay');
  const menu = document.getElementById('mobileMenu');

  if (!menu || !menuBtn) return;

  const openMenu = () => {
    menu.classList.add('active');
    menu.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
    if (overlay) {
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
    }
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menu.classList.remove('active');
    menu.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
    if (overlay) {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  };

  menuBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  document.querySelectorAll('.mobile-nav-link:not(.has-submenu)').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Submenu
  const submenuBtns = document.querySelectorAll('.mobile-nav-link.has-submenu');
  submenuBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('aria-controls');
      const target = document.getElementById(targetId);
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      
      btn.setAttribute('aria-expanded', !isExpanded);
      if (target) {
        if (!isExpanded) target.classList.add('active');
        else target.classList.remove('active');
      }
    });
  });
}

/* ==========================================================================
   6. Popup Booking Modal
   ========================================================================== */
function initBookingModal() {
  const modal = document.getElementById('leadModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const openButtons = document.querySelectorAll('[data-open-modal]');

  if (!modal) return;

  const openModal = (treatment = null) => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (treatment) {
      const radios = document.querySelectorAll('input[name="modal_treatment"]');
      radios.forEach(r => {
        if (r.value.toLowerCase().includes(treatment.toLowerCase().split(' ')[0])) {
          r.checked = true;
        }
      });
    }

    setTimeout(() => {
      const nameInput = document.getElementById('modalFullName');
      if (nameInput) nameInput.focus();
    }, 150);
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const treatment = btn.getAttribute('data-treatment');
      openModal(treatment);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });
}

/* ==========================================================================
   7. FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-trigger')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ==========================================================================
   8. Form Submission & Validation
   ========================================================================== */
async function submitBookingData(button, data, form) {
  const originalText = button.innerHTML;
  button.innerHTML = '<span>Submitting...</span>';
  button.disabled = true;

  try {
    const urlEncodedData = new URLSearchParams(data).toString();

    if (CONFIG.LEADS_ENDPOINT.includes('YOUR_SCRIPT_ID')) {
      await new Promise(r => setTimeout(r, 800)); // Simulate
      return true;
    }

    const res = await fetch(CONFIG.LEADS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: urlEncodedData,
      mode: 'no-cors'
    });
    return true;
  } catch (error) {
    console.error('Submission failed, redirecting to WhatsApp');
    const msg = encodeURIComponent(`Hi, I'm ${data.name}. I want to book an appointment for ${data.treatment}.`);
    window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${msg}`, '_blank');
    return false;
  } finally {
    button.innerHTML = originalText;
    button.disabled = false;
  }
}

function handleForm(formId, prefix) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Honeypot check
    if (form.elements['_gotcha'] && form.elements['_gotcha'].value) return;

    const name = document.getElementById(`${prefix}FullName`)?.value.trim();
    const phoneInput = document.getElementById(`${prefix}Phone`);
    const phone = phoneInput?.value.trim();
    const time = document.getElementById(`${prefix}Time`)?.value || '';
    
    // Get checked radio chip
    const treatmentInput = form.querySelector(`input[name="${prefix === 'modal' ? 'modal_treatment' : 'treatment'}"]:checked`);
    const treatment = treatmentInput ? treatmentInput.value : '';
    
    const consent = document.getElementById(`${prefix}Consent`)?.checked;
    
    let isValid = true;
    
    if (!name || !phone || !consent) {
      alert("Please fill all required fields and consent.");
      return;
    }

    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      phoneInput.classList.add('error');
      isValid = false;
    } else {
      phoneInput.classList.remove('error');
    }

    if (!isValid) return;

    if (window.dataLayer) window.dataLayer.push({ event: 'form_submit', form_id: formId });

    const submitBtn = form.querySelector('button[type="submit"]');
    const success = await submitBookingData(submitBtn, { name, phone, treatment, time, source: formId }, form);
    
    if (success) {
      form.reset();
      const msg = form.querySelector('.form-success-state');
      if (msg) msg.style.display = 'block';
      else alert(`Thank you, ${name}! Request received.`);
      
      if (prefix === 'modal') {
        setTimeout(() => {
          document.getElementById('leadModal').classList.remove('active');
          document.body.style.overflow = '';
        }, 2000);
      }
    }
  });
}

function initFormHandlers() {
  handleForm('onPageBookingForm', 'book');
  handleForm('modalBookingForm', 'modal');
}


/* ==========================================================================
   10. Analytics
   ========================================================================== */
function trackAnalytics() {
  document.querySelectorAll('a[href^="https://wa.me"]').forEach(a => {
    a.addEventListener('click', () => {
      if (window.dataLayer) window.dataLayer.push({ event: 'whatsapp_click' });
    });
  });
  
  document.querySelectorAll('a[href^="tel:"]').forEach(a => {
    a.addEventListener('click', () => {
      if (window.dataLayer) window.dataLayer.push({ event: 'call_click' });
    });
  });
}
