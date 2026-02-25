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
// Store Logo Mapping (name → domain for logo lookup)
// ============================================================

const STORE_DOMAINS = {
  // Supermarkten
  'albert heijn': 'ah.nl',
  'ah': 'ah.nl',
  'jumbo': 'jumbo.com',
  'lidl': 'lidl.nl',
  'aldi': 'aldi.nl',
  'plus': 'plus.nl',
  'dirk': 'dirk.nl',
  'dekamarkt': 'dekamarkt.nl',
  'hoogvliet': 'hoogvliet.com',
  'vomar': 'vomar.nl',
  'spar': 'spar.nl',
  'coop': 'coop.nl',
  'nettorama': 'nettorama.nl',
  'picnic': 'picnic.app',
  'boni': 'bfrieslanddiscount.nl',

  // Drogisterij
  'kruidvat': 'kruidvat.nl',
  'etos': 'etos.nl',
  'trekpleister': 'trekpleister.nl',
  'da': 'da.nl',
  'douglas': 'douglas.nl',
  'rituals': 'rituals.com',
  'ici paris': 'iciparisxl.nl',
  'ici paris xl': 'iciparisxl.nl',

  // Kleding
  'h&m': 'hm.com',
  'zara': 'zara.com',
  'primark': 'primark.com',
  'c&a': 'c-and-a.com',
  'zeeman': 'zeeman.com',
  'wibra': 'wibra.nl',
  'only': 'only.com',
  'vero moda': 'veromoda.com',
  'we fashion': 'wefashion.com',
  'scotch & soda': 'scotchandsoda.com',
  'nike': 'nike.com',
  'adidas': 'adidas.nl',
  'decathlon': 'decathlon.nl',
  'bristol': 'bristol.nl',
  'van haren': 'vanharen.nl',
  'nelson': 'nelson.nl',
  'ziengs': 'ziengs.nl',
  'peek & cloppenburg': 'peek-cloppenburg.nl',
  'peek en cloppenburg': 'peek-cloppenburg.nl',
  'p&c': 'peek-cloppenburg.nl',

  // Wonen & Bouwmarkt
  'ikea': 'ikea.com',
  'action': 'action.nl',
  'hema': 'hema.nl',
  'blokker': 'blokker.nl',
  'xenos': 'xenos.nl',
  'jysk': 'jysk.nl',
  'kwantum': 'kwantum.nl',
  'gamma': 'gamma.nl',
  'praxis': 'praxis.nl',
  'karwei': 'karwei.nl',
  'hornbach': 'hornbach.nl',
  'mediamarkt': 'mediamarkt.nl',
  'coolblue': 'coolblue.nl',
  'bol.com': 'bol.com',
  'bol': 'bol.com',
  'intratuin': 'intratuin.nl',

  // Overig
  'airmiles': 'airmiles.nl',
  'air miles': 'airmiles.nl',
  'de bijenkorf': 'debijenkorf.nl',
  'bijenkorf': 'debijenkorf.nl',
  'pets place': 'petsplace.nl',
  'bruna': 'bruna.nl',
  'pearle': 'pearle.nl',
  'hans anders': 'hansanders.nl',
  'specsavers': 'specsavers.nl',
  'holland & barrett': 'hollandandbarrett.nl',
  'flying tiger': 'flyingtiger.com',
  'sostrene grene': 'sostrenegrene.com',
  'normal': 'normal.dk',
  'nøormal': 'normal.dk',
};

function getLogoUrl(storeName) {
  const name = storeName.toLowerCase().trim();
  let domain = null;

  // Exact match
  if (STORE_DOMAINS[name]) {
    domain = STORE_DOMAINS[name];
  } else {
    // Partial match (e.g., "Albert Heijn Stadskanaal" → "ah.nl")
    for (const [key, d] of Object.entries(STORE_DOMAINS)) {
      if (name.includes(key) || key.includes(name)) {
        domain = d;
        break;
      }
    }
  }

  if (!domain) return null;

  // Google Favicon V2 API — direct URL, no redirect
  return 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://' + domain + '&size=128';
}

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
const detailColorPicker = document.getElementById('detailColorPicker');
const detailStoreLogo = document.getElementById('detailStoreLogo');
const editNameBtn = document.getElementById('editNameBtn');
const editNameInput = document.getElementById('editNameInput');
const menuBtn = document.getElementById('menuBtn');
const headerDropdown = document.getElementById('headerDropdown');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFileInput');

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

function updateCardCategory(id, newCategory) {
  const cards = getCards();
  const card = cards.find(c => c.id === id);
  if (card) {
    card.category = newCategory;
    saveCards(cards);
  }
}

function updateCardColor(id, newColor) {
  const cards = getCards();
  const card = cards.find(c => c.id === id);
  if (card) {
    card.color = newColor;
    saveCards(cards);
  }
}

function updateCardName(id, newName) {
  const cards = getCards();
  const card = cards.find(c => c.id === id);
  if (card) {
    card.storeName = newName;
    saveCards(cards);
  }
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

  // Attach click handlers (drag-aware)
  document.querySelectorAll('.loyalty-card').forEach(el => {
    el.addEventListener('click', () => {
      if (!dragState.didDrag) openDetail(el.dataset.id);
    });
  });

  initDrag();
}

function renderCardHtml(card, cat) {
  const logoUrl = getLogoUrl(card.storeName);
  const iconHtml = logoUrl
    ? `<div class="card-store-icon has-logo" style="background: ${card.color}">
        <img src="${logoUrl}" alt="" class="store-logo"
          onerror="this.parentElement.classList.remove('has-logo');this.parentElement.textContent='${card.storeName.charAt(0)}';"/>
      </div>`
    : `<div class="card-store-icon" style="background: ${card.color}">
        ${card.storeName.charAt(0)}
      </div>`;

  return `
    <div class="loyalty-card" data-id="${card.id}">
      <div class="card-color-bar" style="background: ${card.color}"></div>
      <div class="card-body">
        ${iconHtml}
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

  // Reset edit mode
  detailStoreName.classList.remove('hidden');
  editNameBtn.classList.remove('hidden');
  editNameInput.classList.add('hidden');

  // Show store logo
  const logoUrl = getLogoUrl(card.storeName);
  if (logoUrl) {
    detailStoreLogo.innerHTML = `<img src="${logoUrl}" alt="${escapeHtml(card.storeName)}" onerror="this.parentElement.innerHTML=''"/>`;
  } else {
    detailStoreLogo.innerHTML = '';
  }

  // Show category
  const cardCat = CATEGORIES[card.category || 'overig'];
  detailCategory.textContent = cardCat.emoji + ' ' + cardCat.label;

  // Highlight current color in detail color picker
  detailColorPicker.querySelectorAll('.color-option').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.color === card.color);
  });

  // Render barcode — try formats in order of likelihood
  const barcodeFormats = ['EAN13', 'EAN8', 'CODE128', 'CODE39', 'ITF', 'codabar'];
  let barcodeRendered = false;
  for (const fmt of barcodeFormats) {
    try {
      JsBarcode(detailBarcode, card.barcodeNumber, {
        format: fmt,
        width: 2,
        height: 80,
        displayValue: false,
        margin: 10
      });
      barcodeRendered = true;
      break;
    } catch {
      // Try next format
    }
  }
  if (!barcodeRendered) {
    detailBarcode.innerHTML = '';
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

// Edit store name
editNameBtn.addEventListener('click', () => {
  // Switch to edit mode
  detailStoreName.classList.add('hidden');
  editNameBtn.classList.add('hidden');
  editNameInput.classList.remove('hidden');
  editNameInput.value = detailStoreName.textContent;
  editNameInput.focus();
  editNameInput.select();
});

function saveNameEdit() {
  const newName = editNameInput.value.trim();
  if (newName && currentDetailId) {
    updateCardName(currentDetailId, newName);
    detailStoreName.textContent = newName;

    // Update logo
    const logoUrl = getLogoUrl(newName);
    if (logoUrl) {
      detailStoreLogo.innerHTML = `<img src="${logoUrl}" alt="${escapeHtml(newName)}" onerror="this.parentElement.innerHTML=''"/>`;
    } else {
      detailStoreLogo.innerHTML = '';
    }

    renderCards();
    showToast('Naam gewijzigd!');
  }
  // Switch back to display mode
  detailStoreName.classList.remove('hidden');
  editNameBtn.classList.remove('hidden');
  editNameInput.classList.add('hidden');
}

editNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    saveNameEdit();
  }
  if (e.key === 'Escape') {
    detailStoreName.classList.remove('hidden');
    editNameBtn.classList.remove('hidden');
    editNameInput.classList.add('hidden');
  }
});

editNameInput.addEventListener('blur', () => {
  saveNameEdit();
});

// Detail color picker
detailColorPicker.addEventListener('click', (e) => {
  const btn = e.target.closest('.color-option');
  if (!btn || !currentDetailId) return;
  const newColor = btn.dataset.color;
  updateCardColor(currentDetailId, newColor);
  detailColorPicker.querySelectorAll('.color-option').forEach(b => {
    b.classList.toggle('selected', b === btn);
  });
  renderCards();
  showToast('Kleur aangepast!');
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
// Barcode Scanner (native BarcodeDetector with Quagga fallback)
// ============================================================

let scannerStream = null;
let scannerAnimFrame = null;
const hasNativeDetector = ('BarcodeDetector' in window);

async function openScanner() {
  scannerOverlay.classList.add('active');

  try {
    // Open camera directly
    scannerStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });

    // Create a video element
    const video = document.createElement('video');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';

    // Keep the scanner guide
    const guide = scannerViewport.querySelector('.scanner-guide');
    scannerViewport.innerHTML = '';
    scannerViewport.appendChild(video);
    if (guide) scannerViewport.appendChild(guide);

    video.srcObject = scannerStream;
    await video.play();

    if (hasNativeDetector) {
      // Use native BarcodeDetector (fast & accurate)
      const detector = new BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'itf', 'codabar', 'qr_code']
      });
      scanNative(video, detector);
    } else {
      // Fallback: use Quagga on video frames
      scanWithQuagga(video);
    }

  } catch (err) {
    console.error('Camera error:', err);
    closeScanner();
    if (err.name === 'NotAllowedError') {
      showToast('Geef cameratoestemming via het slotje naast de URL');
    } else {
      showToast('Camera kon niet geopend worden');
    }
  }
}

function scanNative(video, detector) {
  let lastCode = '';
  let confirmCount = 0;

  function detect() {
    if (!scannerStream) return;

    detector.detect(video).then(barcodes => {
      if (barcodes.length > 0) {
        const code = barcodes[0].rawValue;
        if (code === lastCode) {
          confirmCount++;
        } else {
          lastCode = code;
          confirmCount = 1;
        }

        // Accept after 2 identical reads
        if (confirmCount >= 2) {
          barcodeNumberInput.value = code;
          if (navigator.vibrate) navigator.vibrate(100);
          closeScanner();
          showToast('Barcode gescand: ' + code);
          return;
        }
      }
      scannerAnimFrame = requestAnimationFrame(detect);
    }).catch(() => {
      scannerAnimFrame = requestAnimationFrame(detect);
    });
  }

  scannerAnimFrame = requestAnimationFrame(detect);
}

function scanWithQuagga(video) {
  // Use Quagga to decode from canvas frames
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let scanBuffer = [];

  function detect() {
    if (!scannerStream) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    if (canvas.width === 0) {
      scannerAnimFrame = requestAnimationFrame(detect);
      return;
    }

    ctx.drawImage(video, 0, 0);
    const imageData = ctx.toImageData
      ? ctx.toImageData()
      : ctx.getImageData(0, 0, canvas.width, canvas.height);

    Quagga.decodeSingle({
      src: canvas.toDataURL('image/jpeg'),
      numOfWorkers: 0,
      decoder: {
        readers: ['ean_reader', 'ean_8_reader', 'code_128_reader']
      },
      locate: true
    }, (result) => {
      if (result && result.codeResult && result.codeResult.code) {
        const code = result.codeResult.code;
        scanBuffer.push(code);
        if (scanBuffer.length > 10) scanBuffer.shift();

        const recent = scanBuffer.slice(-3);
        if (recent.length === 3 && recent.every(c => c === code)) {
          barcodeNumberInput.value = code;
          if (navigator.vibrate) navigator.vibrate(100);
          closeScanner();
          showToast('Barcode gescand: ' + code);
          return;
        }
      }
      // Scan every 500ms to avoid overloading
      setTimeout(() => {
        scannerAnimFrame = requestAnimationFrame(detect);
      }, 500);
    });
  }

  scannerAnimFrame = requestAnimationFrame(detect);
}

function closeScanner() {
  // Stop animation loop
  if (scannerAnimFrame) {
    cancelAnimationFrame(scannerAnimFrame);
    scannerAnimFrame = null;
  }

  // Stop camera stream
  if (scannerStream) {
    scannerStream.getTracks().forEach(t => t.stop());
    scannerStream = null;
  }

  scannerOverlay.classList.remove('active');

  // Clean up viewport
  const guide = scannerViewport.querySelector('.scanner-guide');
  scannerViewport.innerHTML = '';
  if (guide) scannerViewport.appendChild(guide);
}

scanBtn.addEventListener('click', openScanner);
closeScannerBtn.addEventListener('click', closeScanner);

// ============================================================
// Drag & Drop (long-press to change category)
// ============================================================

const dragState = {
  active: false,
  didDrag: false,
  cardId: null,
  clone: null,
  originEl: null,
  timer: null,
  startX: 0,
  startY: 0
};

function initDrag() {
  document.querySelectorAll('.loyalty-card').forEach(el => {
    el.addEventListener('touchstart', onDragStart, { passive: false });
    el.addEventListener('mousedown', onDragStart);
  });
}

function getPos(e) {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

function onDragStart(e) {
  const card = e.target.closest('.loyalty-card');
  if (!card) return;

  const pos = getPos(e);
  dragState.startX = pos.x;
  dragState.startY = pos.y;
  dragState.didDrag = false;
  dragState.cardId = card.dataset.id;
  dragState.originEl = card;

  dragState.timer = setTimeout(() => {
    startDrag(card, pos);
  }, 500);

  document.addEventListener('touchmove', onDragMove, { passive: false });
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('touchend', onDragEnd);
  document.addEventListener('mouseup', onDragEnd);
  document.addEventListener('touchcancel', onDragEnd);
}

function startDrag(card, pos) {
  dragState.active = true;
  dragState.didDrag = true;

  // Haptic feedback
  if (navigator.vibrate) navigator.vibrate(50);

  // Mark original as dragging
  card.classList.add('dragging');

  // Create visual clone
  const rect = card.getBoundingClientRect();
  const clone = card.cloneNode(true);
  clone.className = 'loyalty-card drag-clone';
  clone.style.width = rect.width + 'px';
  clone.style.left = rect.left + 'px';
  clone.style.top = rect.top + 'px';
  document.body.appendChild(clone);
  dragState.clone = clone;

  // Prevent scrolling
  document.body.classList.add('drag-active');
}

function onDragMove(e) {
  const pos = getPos(e);

  // Cancel long-press if moved too much before activation
  if (!dragState.active && dragState.timer) {
    const dx = Math.abs(pos.x - dragState.startX);
    const dy = Math.abs(pos.y - dragState.startY);
    if (dx > 10 || dy > 10) {
      cancelDrag();
      return;
    }
  }

  if (!dragState.active) return;
  e.preventDefault();

  // Move clone
  const dx = pos.x - dragState.startX;
  const dy = pos.y - dragState.startY;
  dragState.clone.style.transform = `translate(${dx}px, ${dy}px) scale(1.05)`;

  // Highlight filter chip under pointer
  document.querySelectorAll('.filter-chip').forEach(chip => {
    const r = chip.getBoundingClientRect();
    const over = pos.x >= r.left && pos.x <= r.right && pos.y >= r.top && pos.y <= r.bottom;
    chip.classList.toggle('drop-hover', over && chip.dataset.filter !== 'all');
  });
}

function onDragEnd(e) {
  // Clean up listeners
  document.removeEventListener('touchmove', onDragMove);
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('touchend', onDragEnd);
  document.removeEventListener('mouseup', onDragEnd);
  document.removeEventListener('touchcancel', onDragEnd);

  if (dragState.timer) {
    clearTimeout(dragState.timer);
    dragState.timer = null;
  }

  if (!dragState.active) return;

  // Find drop target
  const pos = e.changedTouches ? {
    x: e.changedTouches[0].clientX,
    y: e.changedTouches[0].clientY
  } : { x: e.clientX, y: e.clientY };

  let droppedCategory = null;
  document.querySelectorAll('.filter-chip').forEach(chip => {
    const r = chip.getBoundingClientRect();
    if (pos.x >= r.left && pos.x <= r.right && pos.y >= r.top && pos.y <= r.bottom) {
      if (chip.dataset.filter !== 'all') {
        droppedCategory = chip.dataset.filter;
      }
    }
  });

  // Apply category change
  if (droppedCategory && dragState.cardId) {
    updateCardCategory(dragState.cardId, droppedCategory);
    const cat = CATEGORIES[droppedCategory];
    showToast(`Verplaatst naar ${cat.emoji} ${cat.label}`);
    renderCards();
  }

  // Clean up visuals
  if (dragState.clone) dragState.clone.remove();
  if (dragState.originEl) dragState.originEl.classList.remove('dragging');
  document.querySelectorAll('.filter-chip.drop-hover').forEach(c => c.classList.remove('drop-hover'));
  document.body.classList.remove('drag-active');

  dragState.active = false;
  dragState.clone = null;
  dragState.originEl = null;
  dragState.cardId = null;
}

function cancelDrag() {
  if (dragState.timer) {
    clearTimeout(dragState.timer);
    dragState.timer = null;
  }
  document.removeEventListener('touchmove', onDragMove);
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('touchend', onDragEnd);
  document.removeEventListener('mouseup', onDragEnd);
  document.removeEventListener('touchcancel', onDragEnd);
}

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
// Export / Import
// ============================================================

// Toggle dropdown menu
menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  headerDropdown.classList.toggle('hidden');
});

// Close dropdown when clicking elsewhere
document.addEventListener('click', () => {
  headerDropdown.classList.add('hidden');
});

// Export cards as JSON file
exportBtn.addEventListener('click', () => {
  headerDropdown.classList.add('hidden');
  const cards = getCards();
  if (cards.length === 0) {
    showToast('Geen kaarten om te exporteren');
    return;
  }

  const data = {
    app: 'PasjesPlank',
    version: 1,
    exportDate: new Date().toISOString(),
    cards: cards
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pasjesplank-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`${cards.length} kaart(en) geëxporteerd!`);
});

// Import: open file picker
importBtn.addEventListener('click', () => {
  headerDropdown.classList.add('hidden');
  importFileInput.click();
});

// Import: handle selected file
importFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);

      // Validate format
      if (!data.cards || !Array.isArray(data.cards)) {
        showToast('Ongeldig backupbestand');
        return;
      }

      // Validate each card has required fields
      const validCards = data.cards.filter(c =>
        c.storeName && c.barcodeNumber && c.color
      );

      if (validCards.length === 0) {
        showToast('Geen geldige kaarten gevonden');
        return;
      }

      // Ask user: merge or replace?
      const existing = getCards();
      if (existing.length > 0) {
        const choice = confirm(
          `Je hebt ${existing.length} bestaande kaart(en).\n\n` +
          `OK = Samenvoegen (bestaande behouden + nieuwe toevoegen)\n` +
          `Annuleren = Vervangen (alles overschrijven)`
        );

        if (choice) {
          // Merge: add only cards with new barcodeNumbers
          const existingBarcodes = new Set(existing.map(c => c.barcodeNumber));
          let added = 0;
          validCards.forEach(card => {
            if (!existingBarcodes.has(card.barcodeNumber)) {
              card.id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
              existing.push(card);
              added++;
            }
          });
          saveCards(existing);
          showToast(`${added} nieuwe kaart(en) toegevoegd!`);
        } else {
          // Replace: ensure all cards have IDs
          validCards.forEach(card => {
            if (!card.id) card.id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
          });
          saveCards(validCards);
          showToast(`${validCards.length} kaart(en) geïmporteerd!`);
        }
      } else {
        // No existing cards, just import
        validCards.forEach(card => {
          if (!card.id) card.id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
        });
        saveCards(validCards);
        showToast(`${validCards.length} kaart(en) geïmporteerd!`);
      }

      renderCards();
    } catch {
      showToast('Fout bij lezen van bestand');
    }
  };
  reader.readAsText(file);

  // Reset file input so same file can be selected again
  importFileInput.value = '';
});

// ============================================================
// Service Worker Registration
// ============================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
      .then((reg) => {
        // Check for updates every time the app opens
        reg.update();

        // When a new SW is found, auto-activate and reload
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
                // New version active — reload to show updates
                showToast('Update beschikbaar, app wordt herladen...');
                setTimeout(() => window.location.reload(), 1000);
              }
            });
          }
        });
      })
      .catch(() => {
        // SW registration failed - app still works without it
      });
  });
}

// ============================================================
// Init
// ============================================================

renderCards();
