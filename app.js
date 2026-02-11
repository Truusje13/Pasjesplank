// ============================================================
// Maike's PasjesPlank - App Logic
// ============================================================

const STORAGE_KEY = 'klantenkaarten';

// ============================================================
// Categories
// ============================================================

const CATEGORIES = {
  supermarkt: { label: 'Supermarkt', emoji: '\u{1F6D2}' },
  kleding:    { label: 'Kleding',    emoji: '\u{1F455}' },
  drogisterij:{ label: 'Drogisterij',emoji: '\u{1F9F4}' },
  wonen:      { label: 'Wonen',      emoji: '\u{1F3E0}' },
  overig:     { label: 'Overig',     emoji: '\u{1F3F7}\uFE0F' }
};

const CATEGORY_ORDER = ['supermarkt', 'kleding', 'drogisterij', 'wonen', 'overig'];

// ============================================================
// Splash Screen
// ============================================================

window.addEventListener('load', () => {
  const splash = document.getElementById('splashScreen');
  if (splash) {
    setTimeout(() => {
      splash.classList.add('hidden');
      // Remove from DOM after animation
      setTimeout(() => splash.remove(), 600);
    }, 2000);
  }
});

// DOM Elements
const cardsGrid = document.getElementById('cardsGrid');
const emptyState = document.getElementById('emptyState');
const fabAdd = document.getElementById('fabAdd');
const addModal = document.getElementById('addModal');
const closeAddModal = document.getElementById('closeAddModal');
const addCardForm = document.getElementById('addCardForm');
const storeNameInput = document.getElementById('storeName');
const barcodeNumberInput = document.getElementById('barcodeNumber');
const scanBtn = document.getElementById('scanBtn');
const colorPicker = document.getElementById('colorPicker');
const detailModal = document.getElementById('detailModal');
const closeDetailModal = document.getElementById('closeDetailModal');
const detailStoreName = document.getElementById('detailStoreName');
const detailBarcode = document.getElementById('detailBarcode');
const detailNumber = document.getElementById('detailNumber');
const deleteCardBtn = document.getElementById('deleteCardBtn');
const scannerOverlay = document.getElementById('scannerOverlay');
const scannerViewport = document.getElementById('scannerViewport');
const closeScannerBtn = document.getElementById('closeScannerBtn');
const filterBar = document.getElementById('filterBar');
const categoryPicker = document.getElementById('categoryPicker');
const detailCategory = document.getElementById('detailCategory');

let selectedColor = '#6C63FF';
let selectedCategory = 'overig';
let activeFilter = 'all';
let currentDetailId = null;

// ============================================================
// LocalStorage
// ============================================================

function getCards() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveCards(cards) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function addCard(card) {
  const cards = getCards();
  card.id = Date.now().toString();
  cards.push(card);
  saveCards(cards);
  return card;
}

function removeCard(id) {
  const cards = getCards().filter(c => c.id !== id);
  saveCards(cards);
}

// ============================================================
// Rendering
// ============================================================

function renderCards() {
  const allCards = getCards().map(card => ({
    ...card,
    category: card.category || 'overig' // backward compat
  }));

  // Filter
  const filtered = activeFilter === 'all'
    ? allCards
    : allCards.filter(c => c.category === activeFilter);

  if (allCards.length === 0) {
    emptyState.classList.remove('hidden');
    cardsGrid.innerHTML = '';
    return;
  }

  emptyState.classList.add('hidden');

  if (filtered.length === 0) {
    cardsGrid.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:40px 0;">Geen kaarten in deze categorie</p>';
    return;
  }

  // Group by category
  const grouped = {};
  CATEGORY_ORDER.forEach(key => {
    const group = filtered.filter(c => c.category === key);
    if (group.length > 0) grouped[key] = group;
  });

  let html = '';
  const groupKeys = Object.keys(grouped);

  groupKeys.forEach(key => {
    const cat = CATEGORIES[key];
    // Only show group headers when showing all categories
    if (activeFilter === 'all' && groupKeys.length > 1) {
      html += `<div class="category-group-header"><span class="group-emoji">${cat.emoji}</span> ${cat.label}</div>`;
    }
    grouped[key].forEach(card => {
      html += renderCardHtml(card, cat);
    });
  });

  cardsGrid.innerHTML = html;

  // Attach click handlers
  document.querySelectorAll('.loyalty-card').forEach(el => {
    el.addEventListener('click', () => openDetail(el.dataset.id));
  });
}

function renderCardHtml(card, cat) {
  return `
    <div class="loyalty-card" data-id="${card.id}">
      <div class="card-color-bar" style="background: ${card.color}"></div>
      <div class="card-body">
        <div class="card-store-icon" style="background: ${card.color}">
          ${card.storeName.charAt(0)}
        </div>
        <div class="card-info">
          <div class="card-store-name">${escapeHtml(card.storeName)}</div>
          <div class="card-category-badge">
            <span class="cat-emoji">${cat.emoji}</span> ${cat.label}
          </div>
          <div class="card-barcode-preview">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="6" x2="4" y2="18"/>
              <line x1="7" y1="6" x2="7" y2="18"/>
              <line x1="10" y1="6" x2="10" y2="18"/>
              <line x1="13" y1="6" x2="13" y2="18"/>
              <line x1="16" y1="6" x2="16" y2="18"/>
              <line x1="19" y1="6" x2="19" y2="18"/>
            </svg>
            ${escapeHtml(card.barcodeNumber)}
          </div>
        </div>
        <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9,18 15,12 9,6"/>
        </svg>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
// Modal: Add Card
// ============================================================

function openAddModal() {
  addCardForm.reset();
  selectedColor = '#6C63FF';
  selectedCategory = 'overig';
  document.querySelectorAll('.color-option').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.color === selectedColor);
  });
  document.querySelectorAll('.category-option').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.category === selectedCategory);
  });
  addModal.classList.add('active');
}

function closeAddModalFn() {
  addModal.classList.remove('active');
}

fabAdd.addEventListener('click', openAddModal);
closeAddModal.addEventListener('click', closeAddModalFn);
addModal.addEventListener('click', (e) => {
  if (e.target === addModal) closeAddModalFn();
});

// Category picker
categoryPicker.addEventListener('click', (e) => {
  const btn = e.target.closest('.category-option');
  if (!btn) return;
  selectedCategory = btn.dataset.category;
  document.querySelectorAll('.category-option').forEach(b => {
    b.classList.toggle('selected', b === btn);
  });
});

// Filter bar
filterBar.addEventListener('click', (e) => {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;
  activeFilter = chip.dataset.filter;
  document.querySelectorAll('.filter-chip').forEach(c => {
    c.classList.toggle('active', c === chip);
  });
  renderCards();
});

// Color picker
colorPicker.addEventListener('click', (e) => {
  const btn = e.target.closest('.color-option');
  if (!btn) return;
  selectedColor = btn.dataset.color;
  document.querySelectorAll('.color-option').forEach(b => {
    b.classList.toggle('selected', b === btn);
  });
});

// Form submit
addCardForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const storeName = storeNameInput.value.trim();
  const barcodeNumber = barcodeNumberInput.value.trim();

  if (!storeName || !barcodeNumber) return;

  addCard({ storeName, barcodeNumber, color: selectedColor, category: selectedCategory });
  closeAddModalFn();
  renderCards();
  showToast('Kaart toegevoegd!');
});

// ============================================================
// Modal: Card Detail
// ============================================================

function openDetail(id) {
  const cards = getCards();
  const card = cards.find(c => c.id === id);
  if (!card) return;

  currentDetailId = id;
  detailStoreName.textContent = card.storeName;
  detailNumber.textContent = card.barcodeNumber;

  // Show category
  const cardCat = CATEGORIES[card.category || 'overig'];
  detailCategory.textContent = cardCat.emoji + ' ' + cardCat.label;

  // Render barcode
  try {
    JsBarcode(detailBarcode, card.barcodeNumber, {
      format: 'EAN13',
      width: 2,
      height: 80,
      displayValue: false,
      margin: 10
    });
  } catch {
    // Fallback: try CODE128 if EAN fails
    try {
      JsBarcode(detailBarcode, card.barcodeNumber, {
        format: 'CODE128',
        width: 2,
        height: 80,
        displayValue: false,
        margin: 10
      });
    } catch {
      detailBarcode.innerHTML = '';
    }
  }

  detailModal.classList.add('active');
}

function closeDetailModalFn() {
  detailModal.classList.remove('active');
  currentDetailId = null;
}

closeDetailModal.addEventListener('click', closeDetailModalFn);
detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) closeDetailModalFn();
});

deleteCardBtn.addEventListener('click', () => {
  if (!currentDetailId) return;
  if (confirm('Weet je zeker dat je deze kaart wilt verwijderen?')) {
    removeCard(currentDetailId);
    closeDetailModalFn();
    renderCards();
    showToast('Kaart verwijderd');
  }
});

// ============================================================
// Barcode Scanner
// ============================================================

function openScanner() {
  scannerOverlay.classList.add('active');

  Quagga.init({
    inputStream: {
      name: 'Live',
      type: 'LiveStream',
      target: scannerViewport,
      constraints: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    },
    decoder: {
      readers: ['ean_reader', 'ean_8_reader']
    },
    locate: true,
    frequency: 10
  }, (err) => {
    if (err) {
      console.error('Scanner error:', err);
      closeScanner();
      showToast('Camera niet beschikbaar');
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected((result) => {
    if (result && result.codeResult && result.codeResult.code) {
      const code = result.codeResult.code;
      barcodeNumberInput.value = code;
      closeScanner();
      showToast('Barcode gescand: ' + code);
    }
  });
}

function closeScanner() {
  try {
    Quagga.stop();
    Quagga.offDetected();
  } catch {
    // Scanner may not have been initialized
  }
  scannerOverlay.classList.remove('active');

  // Clean up video elements
  const videos = scannerViewport.querySelectorAll('video');
  videos.forEach(v => {
    if (v.srcObject) {
      v.srcObject.getTracks().forEach(t => t.stop());
    }
  });

  // Remove Quagga-generated elements but keep the guide
  const guide = scannerViewport.querySelector('.scanner-guide');
  scannerViewport.innerHTML = '';
  if (guide) scannerViewport.appendChild(guide);
}

scanBtn.addEventListener('click', openScanner);
closeScannerBtn.addEventListener('click', closeScanner);

// ============================================================
// Toast
// ============================================================

function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ============================================================
// Service Worker Registration
// ============================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // SW registration failed - app still works without it
    });
  });
}

// ============================================================
// Init
// ============================================================

renderCards();
