// ══════════════════════════════════════════════════════
//  LIVE COMMENT SYSTEM — powered by Firebase Realtime DB
// ══════════════════════════════════════════════════════
//
//  SETUP (one-time, free):
//  1. Go to https://console.firebase.google.com/
//  2. Click "Add project" → name it → create
//  3. In the left sidebar: Build → Realtime Database → Create database
//  4. Start in TEST MODE (allows public read/write)
//  5. Go to Project Settings (⚙ icon) → Your apps → </> (Web)
//  6. Register app → copy the firebaseConfig object below
//  7. Replace the placeholder values with your real config
// ══════════════════════════════════════════════════════

// ── YOUR FIREBASE CONFIG (replace with your own) ──
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// ── DEMO MODE (localStorage fallback if Firebase not configured) ──
const FIREBASE_READY = firebaseConfig.apiKey !== "YOUR_API_KEY";

// Profanity-light word filter (extend as needed)
const BANNED = ['spam', 'http://', 'https://'];

function isBanned(text) {
  return BANNED.some(w => text.toLowerCase().includes(w));
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── BUILD COMMENT HTML ──
function buildComment(data) {
  const initials = data.name.trim().slice(0, 2).toUpperCase();
  const hue      = [...data.name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return `
    <div class="comment-item" data-id="${escHtml(data.id || '')}">
      <div class="comment-avatar" style="background: hsl(${hue},55%,40%)">${initials}</div>
      <div class="comment-body">
        <div class="comment-meta">
          <span class="comment-author">${escHtml(data.name)}</span>
          <span class="comment-time">${timeAgo(data.ts)}</span>
        </div>
        <p class="comment-text">${escHtml(data.message)}</p>
      </div>
    </div>`;
}

// ── DEMO STORAGE (localStorage) ──
function demoLoadComments(list) {
  const stored = JSON.parse(localStorage.getItem('site_comments') || '[]');
  stored.sort((a, b) => b.ts - a.ts);
  if (stored.length === 0) {
    list.innerHTML = '<p class="no-comments">Be the first to leave a comment!</p>';
  } else {
    list.innerHTML = stored.map(buildComment).join('');
  }
}

function demoPostComment(data, list, countEl) {
  const stored = JSON.parse(localStorage.getItem('site_comments') || '[]');
  data.id = Date.now().toString();
  stored.unshift(data);
  localStorage.setItem('site_comments', JSON.stringify(stored));
  demoLoadComments(list);
  updateCount(countEl, stored.length);
}

function updateCount(el, n) {
  if (el) el.textContent = n + (n === 1 ? ' comment' : ' comments');
}

// ── MAIN INIT ──
(function initComments() {
  const form    = document.getElementById('comment-form');
  const list    = document.getElementById('comments-list');
  const countEl = document.getElementById('comment-count');
  const status  = document.getElementById('comment-status');
  if (!form || !list) return;

  // ── FIREBASE PATH ──
  if (FIREBASE_READY) {
    // Dynamically load Firebase SDK v9 compat
    const scripts = [
      'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
      'https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js',
    ];
    let loaded = 0;
    scripts.forEach(src => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => {
        loaded++;
        if (loaded === scripts.length) initFirebase();
      };
      document.head.appendChild(s);
    });

    function initFirebase() {
      firebase.initializeApp(firebaseConfig);
      const db  = firebase.database();
      const ref = db.ref('portfolio_comments');

      // Real-time listener
      ref.orderByChild('ts').on('value', snap => {
        const items = [];
        snap.forEach(child => items.push({ id: child.key, ...child.val() }));
        items.reverse();
        updateCount(countEl, items.length);
        if (items.length === 0) {
          list.innerHTML = '<p class="no-comments">Be the first to leave a comment!</p>';
        } else {
          list.innerHTML = items.map(buildComment).join('');
        }
      });

      form.addEventListener('submit', e => {
        e.preventDefault();
        const name    = form.querySelector('#c-name').value.trim();
        const message = form.querySelector('#c-message').value.trim();
        if (!name || !message) return;
        if (isBanned(name) || isBanned(message)) {
          showStatus('⚠ Please keep it clean!', 'error');
          return;
        }
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Posting...';
        ref.push({ name, message, ts: Date.now() })
          .then(() => {
            form.reset();
            showStatus('✓ Comment posted!', 'success');
          })
          .catch(() => showStatus('Failed — try again.', 'error'))
          .finally(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Post Comment';
          });
      });
    }

  } else {
    // ── DEMO (localStorage) PATH ──
    demoLoadComments(list);
    const stored = JSON.parse(localStorage.getItem('site_comments') || '[]');
    updateCount(countEl, stored.length);

    list.insertAdjacentHTML('afterbegin',
      '<div class="demo-notice">⚡ Demo mode — comments saved locally. <a href="#" id="fb-setup-link">Set up Firebase</a> for live sharing.</div>'
    );

    form.addEventListener('submit', e => {
      e.preventDefault();
      const name    = form.querySelector('#c-name').value.trim();
      const message = form.querySelector('#c-message').value.trim();
      if (!name || !message) return;
      if (isBanned(name) || isBanned(message)) {
        showStatus('⚠ Please keep it clean!', 'error');
        return;
      }
      demoPostComment({ name, message, ts: Date.now() }, list, countEl);
      form.reset();
      showStatus('✓ Comment posted!', 'success');
    });
  }

  function showStatus(msg, type) {
    if (!status) return;
    status.textContent  = msg;
    status.className    = 'comment-status ' + type;
    status.style.display = 'block';
    setTimeout(() => { status.style.display = 'none'; }, 3000);
  }
})();
