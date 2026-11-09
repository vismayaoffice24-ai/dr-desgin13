/**
 * DR. SHYMA SUNIL — CONSULTANT NEPHROLOGIST
 * Shared Website JavaScript (script.js)
 */

document.addEventListener('DOMContentLoaded', function () {
  initIntroAnimation();
  initOpdStatus();
  initAccordions();
  initCkdStageBars();
  initBookingForm();
  initScrollReveals();
  highlightActiveNav();
});

/* --------------------------------------------------------------------------
   1. Full-Screen Intro Animation (Home Page)
   -------------------------------------------------------------------------- */
function initIntroAnimation() {
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) return;

  // Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    overlay.classList.add('finished');
    return;
  }

  // Populate letter-by-letter span tags for Dr. Shyma Sunil
  const nameEl = overlay.querySelector('.intro-name');
  if (nameEl && !nameEl.dataset.initialized) {
    const rawText = nameEl.textContent.trim();
    nameEl.innerHTML = '';
    let charCount = 0;
    for (let i = 0; i < rawText.length; i++) {
      const char = rawText[i];
      const span = document.createElement('span');
      if (char === ' ') {
        span.className = 'intro-letter space';
        span.innerHTML = '&nbsp;';
      } else {
        span.className = 'intro-letter';
        span.textContent = char;
        span.style.setProperty('--char-index', charCount++);
      }
      nameEl.appendChild(span);
    }
    nameEl.dataset.initialized = 'true';
  }

  let isSkipped = false;

  function endIntro() {
    if (isSkipped) return;
    isSkipped = true;
    overlay.classList.add('split');
    setTimeout(() => {
      overlay.classList.add('finished');
    }, 1100);
  }

  // Click or keypress to skip
  overlay.addEventListener('click', endIntro);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      endIntro();
    }
  }, { once: true });

  // Auto-split after ~3.2 seconds
  setTimeout(endIntro, 3200);
}

/* --------------------------------------------------------------------------
   2. Floating "OPD Open Today" Card (Reads Current Weekday)
   -------------------------------------------------------------------------- */
function initOpdStatus() {
  const card = document.getElementById('opd-status-card');
  if (!card) return;

  const now = new Date();
  const dayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[dayIndex];

  const dot = card.querySelector('.opd-indicator');
  const dayLine = card.querySelector('.opd-day-line');
  const hoursText = card.querySelector('.opd-hours-text');
  const titleText = card.querySelector('.opd-status-title');

  if (dayIndex === 0) {
    // Sunday: Closed
    if (dot) {
      dot.className = 'opd-indicator closed';
    }
    if (titleText) titleText.textContent = 'OPD Closed Today';
    if (dayLine) dayLine.textContent = `${todayName} • Closed`;
    if (hoursText) hoursText.textContent = 'Emergency dialysis on-call: +91 97458 66333';
  } else if (dayIndex === 6) {
    // Saturday: Half-day
    if (dot) {
      dot.className = 'opd-indicator open';
    }
    if (titleText) titleText.textContent = 'OPD Open Today';
    if (dayLine) dayLine.textContent = `${todayName} • Morning Clinic`;
    if (hoursText) hoursText.textContent = '10:00 AM – 1:00 PM';
  } else {
    // Monday – Friday: Full OPD
    if (dot) {
      dot.className = 'opd-indicator open';
    }
    if (titleText) titleText.textContent = 'OPD Open Today';
    if (dayLine) dayLine.textContent = `${todayName} • Open Today`;
    if (hoursText) hoursText.textContent = '10:00 AM – 2:00 PM & 4:30 PM – 7:00 PM';
  }
}

/* --------------------------------------------------------------------------
   3. Accordion Handler (One Open at a Time for Care & FAQ)
   -------------------------------------------------------------------------- */
function initAccordions() {
  const accordions = document.querySelectorAll('.accordion-wrapper, .faq-list');

  accordions.forEach(container => {
    const items = container.querySelectorAll('.accordion-item, .faq-item');

    items.forEach(item => {
      const trigger = item.querySelector('.accordion-trigger, .faq-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all other items in this container (One open at a time)
        items.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('open');
            const otherBtn = otherItem.querySelector('.accordion-trigger, .faq-trigger');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current item
        if (isOpen) {
          item.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   4. Animated CKD Stage Bars (Triggered on Scroll)
   -------------------------------------------------------------------------- */
function initCkdStageBars() {
  const stageContainer = document.querySelector('.ckd-stages-container');
  if (!stageContainer) return;

  const fills = stageContainer.querySelectorAll('.stage-fill');

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        fills.forEach((fill, idx) => {
          const targetWidth = fill.getAttribute('data-target-width') || '50%';
          setTimeout(() => {
            fill.style.width = targetWidth;
          }, idx * 120);
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(stageContainer);
}

/* --------------------------------------------------------------------------
   5. Appointment Booking Form with 10-Digit Validation & WhatsApp
   -------------------------------------------------------------------------- */
function initBookingForm() {
  const form = document.getElementById('appointment-form');
  if (!form) return;

  const phoneInput = document.getElementById('phone');
  const errorMsg = document.getElementById('phone-error');
  const resultBox = document.getElementById('booking-result');
  const waFallbackBtn = document.getElementById('wa-fallback-btn');

  // Set min date for preferred date picker to today
  const dateInput = document.getElementById('preferred-date');
  if (dateInput) {
    const todayStr = new Date().toISOString().split('T')[0];
    dateInput.min = todayStr;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = (document.getElementById('fullname')?.value || '').trim();
    const phoneRaw = (phoneInput?.value || '').trim();
    const date = (dateInput?.value || '').trim();
    const timeSlot = (document.getElementById('timeslot')?.value || 'Morning').trim();
    const visitType = (document.getElementById('visit-type')?.value || 'First consultation').trim();
    const reason = (document.getElementById('reason')?.value || '').trim();

    // Clean phone number (strip whitespace, dashes, plus, paren)
    const cleanPhone = phoneRaw.replace(/[\s\-\+\(\)]/g, '');

    // Validate 10-digit number
    const isValid10Digit = /^[6-9]\d{9}$/.test(cleanPhone) || (/^\d{10}$/.test(cleanPhone));

    if (!isValid10Digit) {
      if (errorMsg) {
        errorMsg.textContent = 'Please enter a valid 10-digit mobile number.';
        errorMsg.classList.add('visible');
      }
      if (phoneInput) {
        phoneInput.focus();
      }
      return;
    } else {
      if (errorMsg) {
        errorMsg.classList.remove('visible');
      }
    }

    // Compose formatted WhatsApp message
    const waText = 
`Hello Dr. Shyma Sunil,

I would like to request a nephrology consultation:
• Patient Name: ${name}
• Mobile Number: ${cleanPhone}
• Preferred Date: ${date}
• Preferred Time: ${timeSlot}
• Visit Type: ${visitType}
• Notes / Reason: ${reason || 'General Kidney Consultation'}`;

    const encodedText = encodeURIComponent(waText);
    const doctorWhatsAppNumber = '919745866333'; // Doctor's clinic phone
    const waUrl = `https://wa.me/${doctorWhatsAppNumber}?text=${encodedText}`;

    // Show fallback box immediately
    if (resultBox) {
      resultBox.style.display = 'block';
      if (waFallbackBtn) {
        waFallbackBtn.href = waUrl;
      }
    }

    // Try to open WhatsApp in a new tab/window
    const newWindow = window.open(waUrl, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Pop-up blocker might have prevented it, fallback box is already visible
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

/* --------------------------------------------------------------------------
   6. Scroll Reveal Fade-Up Animations
   -------------------------------------------------------------------------- */
function initScrollReveals() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    reveals.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   7. Highlight Active Navigation Links
   -------------------------------------------------------------------------- */
function highlightActiveNav() {
  const path = window.location.pathname.toLowerCase();
  
  // Find matching links
  const links = document.querySelectorAll('.nav-link, .mobile-nav-item');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Normalize href
    const linkPath = href.toLowerCase();
    
    // Check if on home page
    if ((path.endsWith('/') || path.endsWith('index.html')) && (linkPath.endsWith('index.html') || linkPath === './' || linkPath === '/')) {
      link.classList.add('active');
    } else if (path.includes('care.html') && linkPath.includes('care.html')) {
      link.classList.add('active');
    } else if ((path.includes('kidney-health') || path.includes('kidney-health.html')) && linkPath.includes('kidney-health')) {
      link.classList.add('active');
    } else if (path.includes('about.html') && linkPath.includes('about.html')) {
      link.classList.add('active');
    } else if (path.includes('faq.html') && linkPath.includes('faq.html')) {
      link.classList.add('active');
    } else if (path.includes('book.html') && linkPath.includes('book.html')) {
      link.classList.add('active');
    }
  });
}

