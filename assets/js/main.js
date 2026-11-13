/* ==========================================================
   Portfolio interactions
   1. Theme toggle (persisted)       4. Case study dialogs
   2. Sticky header state            5. Live GitHub repositories
   3. PDTS tracking demo
   ========================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. Theme ---------- */
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('#themeToggle')?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}
applyTheme(store.get('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
$('#themeToggle')?.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  store.set('theme', next);
});

/* ---------- 2. Header ---------- */
const header = $('header.top');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 8), { passive: true });
$('#yr').textContent = new Date().getFullYear();

/* ---------- 3. PDTS tracking demo ----------
   Mirrors how the real PDTS works: a submission has a purpose,
   a checklist template, and moves through five stages.
   All names below are sample data. */
const STAGES = ['Received', 'Checked', 'Verified', 'Notified', 'Released'];

const SUBMISSIONS = {
  'PDTS-2026-0142': {
    student: 'Juan Dela Cruz (sample)',
    purpose: 'Admission – Bachelor',
    via: 'Courier (LBC)',
    stage: 3, // index of last completed stage
    status: { label: 'Complete, student notified', tone: 'ok' },
    dates: ['Nov 3, 9:14 AM', 'Nov 3, 2:40 PM', 'Nov 4, 10:05 AM', 'Nov 4, 10:06 AM', 'Pending'],
    checklist: [
      ['Application form', true], ['PSA birth certificate', true], ['Form 138 / Transcript of Records', true],
      ['Certificate of good moral character', true], ['Two 2x2 ID photos', true],
    ],
    email: {
      subject: 'PDTS-2026-0142: Your requirements are complete',
      body: ['All five requirements for Admission – Bachelor have been verified by the Registrar\'s Office.', 'Your process slip is attached. No further action is needed.'],
    },
  },
  'PDTS-2026-0157': {
    student: 'Maria Santos (sample)',
    purpose: 'Comprehensive Exam',
    via: 'Walk-in',
    stage: 1,
    status: { label: 'Deficiency: 1 document missing', tone: 'warn' },
    dates: ['Nov 10, 8:52 AM', 'Nov 10, 11:30 AM', 'Waiting', '—', '—'],
    checklist: [
      ['Application for comprehensive exam', true], ['Approved study plan', true],
      ['Certificate of grades', true], ['Official receipt of exam fee', false],
    ],
    email: {
      subject: 'PDTS-2026-0157: One requirement is missing',
      body: ['We received your submission for the Comprehensive Exam, but the official receipt of the exam fee is missing.', 'Submit it at the Registrar\'s Office or by courier using this reference number.'],
    },
  },
  'PDTS-2026-0163': {
    student: 'Jose Reyes (sample)',
    purpose: 'Masteral',
    via: 'Courier (J&T)',
    stage: 0,
    status: { label: 'Received, awaiting checking', tone: 'info' },
    dates: ['Nov 12, 4:18 PM', 'In queue', '—', '—', '—'],
    checklist: [
      ['Application form', null], ['Transcript of Records', null], ['Diploma (certified copy)', null],
      ['Two recommendation letters', null],
    ],
    email: {
      subject: 'PDTS-2026-0163: We received your documents',
      body: ['Your Masteral submission was logged by the Registrar\'s Office.', 'You will get another email once a staff member checks each document.'],
    },
  },
};

const CHECK_SVG = '<svg viewBox="0 0 12 12" fill="none" stroke="#fff" stroke-width="2" aria-hidden="true"><path d="M2 6.5l2.5 2.5L10 3.5"/></svg>';
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function renderSubmission(ref, data) {
  const isMobile = matchMedia('(max-width: 760px)').matches;
  const pct = data.stage / (STAGES.length - 1) * 100;

  $('#resultRef').textContent = ref;
  $('#resultMeta').textContent = `${data.student} · ${data.purpose} · ${data.via}`;
  const status = $('#resultStatus');
  status.textContent = data.status.label;
  status.className = `status ${data.status.tone}`;

  $('#resultSteps').innerHTML =
    `<div class="rail" aria-hidden="true"><div class="rail-fill"></div></div>` +
    STAGES.map((name, i) => `
      <div class="step${i === data.stage + 1 ? ' current' : ''}" data-i="${i}">
        <div class="dot">${CHECK_SVG}</div>
        <div><div class="step-name">${name}</div><div class="step-note">${esc(data.dates[i])}</div></div>
      </div>`).join('');

  const items = data.checklist.map(([label, ok]) => {
    const cls = ok === true ? 'yes' : ok === false ? 'no' : 'tbd';
    const mark = ok === true ? '✓' : ok === false ? '!' : '·';
    const sr = ok === true ? 'received' : ok === false ? 'missing' : 'not yet checked';
    return `<li class="${cls}"><span class="mark" aria-hidden="true">${mark}</span><span>${esc(label)} <span class="sr">(${sr})</span></span></li>`;
  }).join('');
  $('#resultChecklist').innerHTML = items;

  $('#resultEmail').innerHTML =
    `<div class="subject">${esc(data.email.subject)}</div>` + data.email.body.map((p) => `<p>${esc(p)}</p>`).join('');

  $('#result').hidden = false;
  $('#demoError').hidden = true;

  // animate stages in sequence
  const fill = $('#resultSteps .rail-fill');
  const steps = $$('#resultSteps .step');
  const prop = isMobile ? 'height' : 'width';
  if (reduceMotion) {
    fill.style.transition = 'none';
    fill.style[prop] = `${pct}%`;
    steps.forEach((s, i) => i <= data.stage && s.classList.add('done'));
    return;
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { fill.style[prop] = `${pct}%`; }));
  steps.forEach((s, i) => { if (i <= data.stage) setTimeout(() => s.classList.add('done'), 150 + i * 330); });
}

function track(raw) {
  const ref = raw.trim().toUpperCase();
  const data = SUBMISSIONS[ref];
  if (!data) {
    $('#result').hidden = true;
    const err = $('#demoError');
    err.textContent = ref
      ? `No submission found for ${ref}. Check the reference on your process slip, or try one of the sample references.`
      : 'Enter a reference number to track a submission.';
    err.hidden = false;
    return;
  }
  renderSubmission(ref, data);
}

$('#trackForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  track($('#refInput').value);
});
$$('.samples button').forEach((b) => b.addEventListener('click', () => {
  $('#refInput').value = b.dataset.ref;
  track(b.dataset.ref);
}));
// show a first result when the demo scrolls into view
const demoIO = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) { track($('#refInput').value); demoIO.disconnect(); }
}, { threshold: 0.25 });
if ($('#trackForm')) demoIO.observe($('#trackForm'));

/* ---------- 4. Case study dialogs ---------- */
$$('[data-case]').forEach((btn) => btn.addEventListener('click', () => {
  const dlg = document.getElementById(btn.dataset.case);
  dlg?.showModal();
}));
$$('dialog.case').forEach((dlg) => {
  $('.case-close', dlg).addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // backdrop click
});

/* ---------- 5. Live GitHub repositories ---------- */
async function loadRepos() {
  const list = $('#ghList');
  if (!list) return;
  const user = list.dataset.user;
  try {
    const res = await fetch(`https://api.github.com/users/${user}/repos?sort=pushed&per_page=6`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
    const repos = (await res.json()).filter((r) => !r.fork);
    if (!repos.length) throw new Error('No public repositories');
    const fmt = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
    list.innerHTML = repos.map((r) => `
      <li>
        <a href="${esc(r.html_url)}" target="_blank" rel="noopener">${esc(r.name)}</a>
        <span class="when">Updated ${fmt.format(new Date(r.pushed_at))}</span>
        ${r.description ? `<span class="desc">${esc(r.description)}</span>` : ''}
        ${r.language ? `<span class="lang">${esc(r.language)}</span>` : ''}
      </li>`).join('');
  } catch {
    list.innerHTML = `<li><span class="loading">Couldn't load repositories right now. <a href="https://github.com/${esc(user)}" target="_blank" rel="noopener">See them on GitHub</a>.</span></li>`;
  }
}
loadRepos();

/* ---------- 6. Motion ---------- */
// Hero headline: split into words for a staggered rise.
(() => {
  const h1 = $('.hero h1');
  if (!h1 || reduceMotion) return;
  const words = h1.textContent.trim().split(/\s+/);
  h1.setAttribute('aria-label', h1.textContent.trim());
  h1.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${esc(w)}</span></span>`).join(' ');
})();

// Scroll reveal, staggered within each group.
(() => {
  const groups = [
    ['.sec-head'], ['.feature'], ['.projects .proj'], ['.small-builds'], ['.gh'],
    ['.skills > div'], ['.timeline li'], ['.edu'], ['.certs .cert'], ['.cert-courses'], ['.contact .wrap > *'],
  ];
  groups.forEach(([sel]) => $$(sel).forEach((el, i) => {
    el.dataset.reveal = '';
    el.style.setProperty('--d', `${Math.min(i, 6) * 80}ms`);
  }));
  if (reduceMotion || !('IntersectionObserver' in window)) {
    $$('[data-reveal]').forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('[data-reveal]').forEach((el) => io.observe(el));
})();

// Cursor spotlight on glass cards (fine pointers only).
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  $$('.demo, .feature, .proj, .small-builds, .cert, .edu').forEach((el) => {
    el.classList.add('spot');
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
})();

// Scroll progress bar.
(() => {
  const bar = $('#progress');
  if (!bar) return;
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();

/* ---------- 7. Copy email ---------- */
(() => {
  const toast = $('#toast');
  let t;
  const show = (msg) => { if (!toast) return; toast.textContent = msg; toast.classList.add('show'); clearTimeout(t); t = setTimeout(() => toast.classList.remove('show'), 2200); };
  $$('[data-copy]').forEach((btn) => btn.addEventListener('click', async () => {
    const text = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
      show('Email copied: ' + text);
    } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      document.body.append(ta); ta.select();
      try { document.execCommand('copy'); show('Email copied: ' + text); } catch { show(text); }
      ta.remove();
    }
  }));
})();

/* ---------- 8. Experience tabs ---------- */
$$('[data-tabs]').forEach((root) => {
  const tabs = $$('[role="tab"]', root);
  const ind = $('.xp-indicator', root);
  const horizontal = () => matchMedia('(max-width: 760px)').matches;
  const place = (tab) => {
    if (!ind) return;
    if (horizontal()) { ind.style.transform = `translateX(${tab.offsetLeft}px)`; ind.style.width = `${tab.offsetWidth}px`; }
    else { ind.style.transform = `translateY(${tab.offsetTop}px)`; ind.style.height = `${tab.offsetHeight}px`; ind.style.width = ''; }
  };
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    place(tab);
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in keys) { e.preventDefault(); select(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
    });
  });
  const current = () => tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
  requestAnimationFrame(() => place(current()));
  addEventListener('resize', () => place(current()));
});

/* ---------- 9. Screenshot lightbox ---------- */
(() => {
  const box = $('#lightbox');
  if (!box) return;
  const img = $('img', box);
  $$('.shot-open').forEach((b) => b.addEventListener('click', () => {
    img.src = b.dataset.full; img.alt = b.dataset.alt || '';
    box.showModal();
  }));
  $('.case-close', box).addEventListener('click', () => box.close());
  box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
})();
