/* ═══════════════════════════════════════════════════════
   DAQAI — shared.js
   Used by every page in the project.
   ═══════════════════════════════════════════════════════ */

/* ── EMAILJS CONFIG ──────────────────────────────────────
   Setup (free, takes 5 mins):
   1. Sign up at https://www.emailjs.com
   2. Add an Email Service (Gmail recommended) → copy Service ID
   3. Create an Email Template using the variables below → copy Template ID
   4. Account page → copy your Public Key
   5. Replace the three placeholder values below

   Template variables available:
   {{from_name}}, {{organisation}}, {{email}},
   {{phone}}, {{service}}, {{message}}, {{sent_at}}
─────────────────────────────────────────────────────── */
const EJS_PUBLIC_KEY  = 'a2jlimaKu329hn9DA';
const EJS_SERVICE_ID  = 'service_9ku198j';
const EJS_TEMPLATE_ID = 'template_16q65ni';

/* ── INIT EMAILJS ── */
if (typeof emailjs !== 'undefined') {
  emailjs.init({ publicKey: EJS_PUBLIC_KEY });
}

/* ═══════════════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════════════ */

/**
 * Open the consultation request modal.
 * Resets the form and hides the success screen each time.
 */
function openModal() {
  const overlay = document.getElementById('modal-overlay');
  const modal   = document.getElementById('modal');
  const form    = document.getElementById('consult-form');
  const success = document.getElementById('form-success');

  if (!overlay || !modal) return;

  overlay.style.display = 'block';
  modal.style.display   = 'block';
  document.body.style.overflow = 'hidden';

  if (form)    { form.style.display = 'block'; form.reset(); }
  if (success) { success.style.display = 'none'; }

  /* Clear any previous error */
  const errDiv = document.getElementById('form-error');
  if (errDiv) { errDiv.textContent = ''; errDiv.style.display = 'none'; }
}

/**
 * Close the consultation request modal.
 */
function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  const modal   = document.getElementById('modal');

  if (overlay) overlay.style.display = 'none';
  if (modal)   modal.style.display   = 'none';
  document.body.style.overflow = '';
}

/* Close modal on Escape key */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});

/* Close modal when clicking overlay */
document.addEventListener('DOMContentLoaded', function () {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeModal);
  }
});

/* ═══════════════════════════════════════════════════════
   FORM SUBMISSION
═══════════════════════════════════════════════════════ */

/**
 * Handle consultation form submission.
 * Uses EmailJS if configured, otherwise falls back to mailto.
 */
function submitForm(e) {
  e.preventDefault();

  const form   = document.getElementById('consult-form');
  const btn    = form.querySelector('button[type="submit"]');
  const inputs = form.querySelectorAll('input, select, textarea');
  const errDiv = document.getElementById('form-error');

  /* Clear any previous error */
  if (errDiv) { errDiv.textContent = ''; errDiv.style.display = 'none'; }

  /* Collect form values */
  const data = {
    from_name:    inputs[0]?.value || '',
    organisation: inputs[1]?.value || '',
    email:        inputs[2]?.value || '',
    phone:        inputs[3]?.value || 'Not provided',
    service:      inputs[4]?.value || 'Not specified',
    message:      inputs[5]?.value || 'No message provided',
    sent_at:      new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }),
  };

  /* Loading state */
  const originalText  = btn.textContent;
  btn.textContent     = 'Sending…';
  btn.disabled        = true;
  btn.style.opacity   = '0.7';

  /* ── Fallback: EmailJS not configured ── */
  if (EJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    _showFormSuccess(data);
    const subject = encodeURIComponent('Consultation Request from ' + data.from_name);
    const body = encodeURIComponent(
      'Name: '         + data.from_name    + '\n' +
      'Organisation: ' + data.organisation + '\n' +
      'Email: '        + data.email        + '\n' +
      'Phone: '        + data.phone        + '\n' +
      'Service: '      + data.service      + '\n' +
      'Message: '      + data.message      + '\n' +
      'Sent at: '      + data.sent_at
    );
    window.location.href = `mailto:contact@daqai.org,muzammil@daqai.org?subject=${subject}&body=${body}`;
    return;
  }

  /* ── EmailJS send ── */
  emailjs.send(EJS_SERVICE_ID, EJS_TEMPLATE_ID, data)
    .then(() => {
      _showFormSuccess(data);
    })
    .catch((err) => {
      console.error('EmailJS error:', err);
      btn.textContent  = originalText;
      btn.disabled     = false;
      btn.style.opacity = '1';
      if (errDiv) {
        errDiv.textContent    = 'Something went wrong. Please email us directly at contact@daqai.org';
        errDiv.style.display  = 'block';
      }
    });
}

/**
 * Show the success screen inside the modal after form submission.
 * @param {Object} data - The submitted form data
 */
function _showFormSuccess(data) {
  const form    = document.getElementById('consult-form');
  const success = document.getElementById('form-success');
  const nameEl  = document.getElementById('success-name');

  if (form)    form.style.display    = 'none';
  if (success) success.style.display = 'block';
  if (nameEl)  nameEl.textContent    = (data.from_name || '').split(' ')[0] || 'there';
}

/* ═══════════════════════════════════════════════════════
   NAV — ACTIVE LINK HIGHLIGHT
   Automatically marks the current page's nav link as active
   based on the current URL path.
═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  const path  = window.location.pathname;
  const links = document.querySelectorAll('.nav-links a');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;

    /* Normalise paths for comparison */
    const normHref = href.replace('../', '/').replace('./', '/');
    const normPath = path;

    if (
      normPath.endsWith(normHref) ||
      (normHref !== '/' && normHref !== '/index.html' && normPath.includes(normHref.split('/').pop()))
    ) {
      link.classList.add('active');
    }
  });

  /* Mark Services active when on any service sub-page */
  if (path.includes('/services/')) {
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.includes('#services') || href.includes('services')) {
        link.classList.add('active');
      }
    });
  }
});

/* ═══════════════════════════════════════════════════════
   SMOOTH ANCHOR SCROLL
   Handles in-page hash links smoothly.
═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});

/* ═══════════════════════════════════════════════════════
   UTILITY — GO BACK
   Used by service pages to return to the previous page.
═══════════════════════════════════════════════════════ */
function goBack() {
  if (document.referrer && document.referrer !== window.location.href) {
    history.back();
  } else {
    window.location.href = '../index.html';
  }
}

/* ═══════════════════════════════════════════════════════
   UTILITY — SCROLL TO TOP
   Smooth scroll to the top of the page.
═══════════════════════════════════════════════════════ */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ═══════════════════════════════════════════════════════
   UTILITY — OPEN EXTERNAL LINK
   Opens a URL in a new tab safely.
═══════════════════════════════════════════════════════ */
function openLink(url) {
  window.open(url, '_blank', 'noopener,noreferrer');
}
