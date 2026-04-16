/* ============================================
   VIRIDIAN - JavaScript Interactions
   ============================================ */

// Current page state
let currentPage = 'loginPage';
let isLoggedIn = false;
const lastPageKey = 'viridianLastPage';
const authStateKey = 'viridianIsLoggedIn';
const cartStateKey = 'viridianCartState';
const checkoutAddressKey = 'viridianCheckoutAddress';
const checkoutDeliveryKey = 'viridianCheckoutDelivery';
const productFilterKey = 'viridianProductFilter';
const selectedProductKey = 'viridianSelectedProduct';
const profileStateKey = 'viridianProfileState';
const profileImageKey = 'viridianProfileImage';
let onOrderSuccessClose = null;
let profileSaveToastTimer = null;

const defaultProfileState = {
    profileUsername: 'Hot farmer',
    profileName: 'Glen Laurence',
    gender: 'male',
    dobDay: '26',
    dobMonth: '01',
    dobYear: '2005',
};

const productCategoryLabels = {
    all: 'All',
    fertilizers: 'Fertilizers',
    saplings: 'Saplings',
    'crop-protection': 'Agricultural Spray',
    seeds: 'Seeds',
    'soil-care': 'Soil Care',
    tools: 'Tools',
    irrigation: 'Irrigation',
};

const featuredCategories = [
    { key: 'fertilizers', label: 'Fertilizers', image: 'drive-download-20260412T065819Z-3-001/featured(fertilizers).png' },
    { key: 'saplings', label: 'Saplings', image: 'drive-download-20260412T065819Z-3-001/featured(saplings).png' },
    { key: 'crop-protection', label: 'Agricultural Spray', image: 'drive-download-20260412T065819Z-3-001/featured(agricultural spray).png' },
    { key: 'tools', label: 'Gardening Tools', image: 'drive-download-20260412T065819Z-3-001/featured(gardening tools).png' },
    { key: 'irrigation', label: 'Aeroponic Towers', image: 'drive-download-20260412T065819Z-3-001/featured(aeroponic towers).png' },
    { key: 'seeds', label: 'Plant Seeds', image: 'drive-download-20260412T065819Z-3-001/featured(plant seeds).png' },
    { key: 'soil-care', label: 'Garden Soil', image: 'drive-download-20260412T065819Z-3-001/featured(gardening soils).png' },
];

const featuredPromos = [
    { title: 'Organic Fertilizers just for you', image: 'drive-download-20260412T065819Z-3-001/featured(fertilizers).png', alt: 'Fertilizer' },
    { title: 'Handy Tools that are just right!', image: 'drive-download-20260412T065819Z-3-001/featured(gardening tools).png', alt: 'Tools' },
    { title: 'Saplings that fit the season', image: 'drive-download-20260412T065819Z-3-001/featured(saplings).png', alt: 'Saplings' },
];

const productCatalog = [
    { category: 'fertilizers', title: 'Organic Fertilizer', weight: '5kg bag', price: 67.69, image: 'drive-download-20260412T065819Z-3-001/organic fertilizer packaging design.jpg', alt: 'Organic Fertilizer' },
    { category: 'seeds', title: 'Vegetable Seeds Pack', weight: '500g', price: 45.00, image: 'drive-download-20260412T065819Z-3-001/featured(plant seeds).png', alt: 'Vegetable Seeds' },
    { category: 'tools', title: 'Garden Tool Set', weight: '5 pieces', price: 350.00, image: 'drive-download-20260412T065819Z-3-001/close-up-gardening-accesories.jpg', alt: 'Garden Tools' },
    { category: 'crop-protection', title: 'Plant Spray Bottle', weight: '1L', price: 89.00, image: 'drive-download-20260412T065819Z-3-001/Tractor spraying on the field, a Nature Photo by MangoMind.jpg', alt: 'Plant Spray' },
    { category: 'saplings', title: 'Tomato Saplings', weight: 'Bundle of 10', price: 120.00, image: 'drive-download-20260412T065819Z-3-001/photorealistic-sustainable-garden-with-home-grown-plants.jpg', alt: 'Saplings' },
    { category: 'soil-care', title: 'Premium Soil Mix', weight: '10kg bag', price: 180.00, image: 'drive-download-20260412T065819Z-3-001/featured(gardening soils).png', alt: 'Soil Mix' },
    { category: 'seeds', title: 'Herb Seeds Collection', weight: '6 varieties', price: 75.00, image: 'drive-download-20260412T065819Z-3-001/download (1).jpg', alt: 'Herb Seeds' },
    { category: 'tools', title: 'Pruning Shears', weight: 'Professional', price: 250.00, image: 'drive-download-20260412T065819Z-3-001/Agriculture farming, gardening tools.jpg', alt: 'Pruning Shears' },
    { category: 'irrigation', title: 'Drip Irrigation Kit', weight: '50m tubing', price: 450.00, image: 'drive-download-20260412T065819Z-3-001/aero tow3r.jpg', alt: 'Drip Irrigation' },
];

function getCategoryLabel(categoryKey) {
    return productCategoryLabels[categoryKey] || categoryKey;
}

function findProductByTitle(title) {
    return productCatalog.find(product => product.title === title) || null;
}

function findProductByCategory(categoryKey) {
    return productCatalog.find(product => product.category === categoryKey) || null;
}

function findProductByIndex(productIndex) {
    return productCatalog[productIndex] || null;
}

function getCategoryKeyFromLabel(label) {
    const normalizedLabel = (label || '').trim().toLowerCase();
    const entry = Object.entries(productCategoryLabels).find(([, value]) => value.toLowerCase() === normalizedLabel);
    return entry?.[0] || 'all';
}

function getActiveFilterButton() {
    return document.querySelector('.product-filters .filter-btn.active');
}

function setActiveProductFilter(categoryKey) {
    const filterGroup = document.querySelector('.product-filters');
    if (!filterGroup) {
        return;
    }

    const targetCategoryKey = (categoryKey || 'all').trim().toLowerCase();
    const targetLabel = getCategoryLabel(targetCategoryKey);
    filterGroup.querySelectorAll('.filter-btn').forEach(btn => {
        const buttonCategoryKey = (btn.dataset.category || getCategoryKeyFromLabel(btn.textContent)).toLowerCase();
        btn.classList.toggle('active', buttonCategoryKey === targetCategoryKey);
    });

    localStorage.setItem(productFilterKey, targetCategoryKey);
    applyProductFilters();
}

function renderProductPage(product) {
    if (!product) {
        return;
    }

    localStorage.setItem(selectedProductKey, JSON.stringify(product));

    const page = document.getElementById('productPage');
    if (!page) {
        return;
    }

    const mainImage = page.querySelector('.main-image img');
    const title = page.querySelector('.product-title');
    const category = page.querySelector('.product-category');
    const price = page.querySelector('.product-pricing .price');
    const addToCartButton = page.querySelector('.btn-add-to-cart');
    const buyNowButton = page.querySelector('.btn-buy-now');
    const thumbnails = page.querySelectorAll('.thumbnail img');

    if (mainImage) {
        mainImage.src = product.image;
        mainImage.alt = product.title;
    }
    if (title) {
        title.textContent = product.title;
    }
    if (category) {
        category.textContent = `Category: ${getCategoryLabel(product.category)}`;
    }
    if (price) {
        price.textContent = formatPeso(product.price);
    }
    if (addToCartButton) {
        addToCartButton.dataset.productTitle = product.title;
    }
    if (buyNowButton) {
        buyNowButton.dataset.productTitle = product.title;
    }

    thumbnails.forEach((thumb, index) => {
            const productIndex = Math.max(productCatalog.findIndex(item => item.title === product.title), 0);
            const source = productCatalog[(productIndex + index) % productCatalog.length] || product;
        thumb.src = source.image;
        thumb.alt = source.title;
    });
}

function parsePeso(value) {
    const parsed = Number(String(value).replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatPeso(value) {
    return `₱ ${value.toFixed(2)}`;
}

function getVisibleProductCards() {
    return Array.from(document.querySelectorAll('#homePage .products-grid .product-card'));
}

function renderHomepageData() {
    const categoriesGrid = document.getElementById('featuredCategoriesGrid');
    const promoBanners = document.getElementById('featuredPromoBanners');
    const productsGrid = document.getElementById('homeProductsGrid');

    if (categoriesGrid) {
        categoriesGrid.innerHTML = featuredCategories.map(category => `
            <div class="category-card" data-category="${category.key}">
                <div class="category-icon">
                    <img src="${category.image}" alt="${category.label}">
                </div>
                <span>${category.label}</span>
            </div>
        `).join('');
    }

    if (promoBanners) {
        promoBanners.innerHTML = featuredPromos.map((promo, index) => `
            <div class="promo-card promo-${index + 1}">
                <div class="promo-content">
                    <h3>${promo.title}</h3>
                    <button class="btn-shop">Shop Now <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></button>
                </div>
                <div class="promo-image">
                    <img src="${promo.image}" alt="${promo.alt}">
                </div>
            </div>
        `).join('');
    }

    if (productsGrid) {
        productsGrid.innerHTML = productCatalog.map((product, index) => `
            <div class="product-card" data-category="${product.category}" data-product-title="${product.title}" data-product-index="${index}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.alt}">
                    <div class="product-actions">
                        <div class="qty-selector">
                            <button class="qty-btn minus">-</button>
                            <span class="qty-value">1</span>
                            <button class="qty-btn plus">+</button>
                        </div>
                        <button class="btn-add">ADD</button>
                    </div>
                </div>
                <div class="product-info">
                    <h4>${product.title}</h4>
                    <p class="product-weight">${product.weight}</p>
                    <p class="product-price">${formatPeso(product.price)}</p>
                </div>
            </div>
        `).join('');
    }
}

function getCartRows() {
    return Array.from(document.querySelectorAll('#cartPage .cart-item'));
}

function getCartItemData(row) {
    const title = row.querySelector('.item-details h4')?.textContent.trim() || '';
    const price = parsePeso(row.querySelector('.item-price')?.textContent || '0');
    const qty = Number(row.querySelector('.qty-value')?.textContent || 1);
    const checked = row.querySelector('.item-checkbox input')?.checked ?? true;
    const image = row.querySelector('.item-image img')?.src || '';
    return { title, price, qty, checked, image };
}

function getSavedCartState() {
    try {
        return JSON.parse(localStorage.getItem(cartStateKey) || '[]');
    } catch {
        return [];
    }
}

function saveCartState() {
    const state = getCartRows().map(getCartItemData);
    localStorage.setItem(cartStateKey, JSON.stringify(state));
}

function loadCartState() {
    return new Map(getSavedCartState().map(item => [item.title, item]));
}

function updateCartRowTotals() {
    getCartRows().forEach(row => {
        const price = parsePeso(row.querySelector('.item-price')?.textContent || '0');
        const qty = Number(row.querySelector('.qty-value')?.textContent || 1);
        const total = price * qty;
        const totalElement = row.querySelector('.item-total p');
        if (totalElement) {
            totalElement.textContent = formatPeso(total);
        }
    });
}

function updateCartSummary() {
    const selectedRows = getCartRows().filter(row => row.querySelector('.item-checkbox input')?.checked);
    const total = selectedRows.reduce((sum, row) => {
        const price = parsePeso(row.querySelector('.item-price')?.textContent || '0');
        const qty = Number(row.querySelector('.qty-value')?.textContent || 1);
        return sum + (price * qty);
    }, 0);

    const totalInfo = document.querySelector('#cartPage .total-info span:first-child');
    const totalPrice = document.querySelector('#cartPage .total-price');

    if (totalInfo) {
        totalInfo.textContent = `Total (${selectedRows.length} items):`;
    }
    if (totalPrice) {
        totalPrice.textContent = formatPeso(total);
    }

    updateCheckoutSummary();
}

function restoreCartState() {
    const savedState = loadCartState();
    const restoredTitles = new Set();

    getCartRows().forEach(row => {
        const title = row.querySelector('.item-details h4')?.textContent.trim() || '';
        const savedItem = savedState.get(title);
        if (title) {
            restoredTitles.add(title);
        }
        if (!savedItem) {
            return;
        }

        const qtyValue = row.querySelector('.qty-value');
        const checkbox = row.querySelector('.item-checkbox input');
        if (qtyValue && Number.isFinite(savedItem.qty)) {
            qtyValue.textContent = String(savedItem.qty);
        }
        if (checkbox) {
            checkbox.checked = Boolean(savedItem.checked);
        }
    });

    // Recreate items that were added dynamically and are not part of the static markup.
    savedState.forEach((item, title) => {
        if (!title || restoredTitles.has(title) || findCartRowByTitle(title)) {
            return;
        }

        appendCartItem({
            title,
            price: item.price,
            qty: item.qty,
            checked: item.checked,
            image: item.image,
        });
    });

    const selectAll = document.querySelector('#cartPage .select-all input');
    if (selectAll && getCartRows().length > 0) {
        selectAll.checked = getCartRows().every(row => row.querySelector('.item-checkbox input')?.checked);
    }

    updateCartRowTotals();
    updateCartSummary();
}

function saveCheckoutAddress() {
    const form = document.querySelector('#checkoutPage .address-form');
    if (!form) {
        return;
    }

    const delivery = form.querySelector('input[name="delivery"]:checked')?.value || 'standard';
    const address = {
        fullName: form.querySelector('[name="fullName"]')?.value || '',
        phoneNumber: form.querySelector('[name="phoneNumber"]')?.value || '',
        province: form.querySelector('[name="province"]')?.value || '',
        city: form.querySelector('[name="city"]')?.value || '',
        barangay: form.querySelector('[name="barangay"]')?.value || '',
        postalCode: form.querySelector('[name="postalCode"]')?.value || '',
        street: form.querySelector('[name="street"]')?.value || '',
        defaultAddress: form.querySelector('[name="defaultAddress"]')?.checked || false,
        riderNote: form.querySelector('[name="riderNote"]')?.checked || false,
        delivery,
    };

    localStorage.setItem(checkoutAddressKey, JSON.stringify(address));
    localStorage.setItem(checkoutDeliveryKey, delivery);
}

function restoreCheckoutAddress() {
    const form = document.querySelector('#checkoutPage .address-form');
    if (!form) {
        return;
    }

    let savedAddress = null;
    try {
        savedAddress = JSON.parse(localStorage.getItem(checkoutAddressKey) || 'null');
    } catch {
        savedAddress = null;
    }

    if (!savedAddress) {
        return;
    }

    const setValue = (name, value) => {
        const field = form.querySelector(`[name="${name}"]`);
        if (field && typeof value === 'string') {
            field.value = value;
        }
    };

    setValue('fullName', savedAddress.fullName || '');
    setValue('phoneNumber', savedAddress.phoneNumber || '');
    setValue('province', savedAddress.province || '');
    setValue('city', savedAddress.city || '');
    setValue('barangay', savedAddress.barangay || '');
    setValue('postalCode', savedAddress.postalCode || '');
    setValue('street', savedAddress.street || '');

    const defaultAddress = form.querySelector('[name="defaultAddress"]');
    const riderNote = form.querySelector('[name="riderNote"]');
    if (defaultAddress) {
        defaultAddress.checked = Boolean(savedAddress.defaultAddress);
    }
    if (riderNote) {
        riderNote.checked = Boolean(savedAddress.riderNote);
    }

    const deliveryValue = savedAddress.delivery || localStorage.getItem(checkoutDeliveryKey) || 'standard';
    const deliveryInput = form.querySelector(`input[name="delivery"][value="${deliveryValue}"]`);
    if (deliveryInput) {
        deliveryInput.checked = true;
    }
}

function getSavedProfileState() {
    try {
        return JSON.parse(localStorage.getItem(profileStateKey) || 'null');
    } catch {
        return null;
    }
}

function syncProfileHeaderFromForm() {
    const profileNameInput = document.querySelector('#accountPage input[name="profileName"]');
    const sidebarName = document.querySelector('#accountPage .account-sidebar .username');
    if (sidebarName) {
        sidebarName.textContent = (profileNameInput?.value || defaultProfileState.profileName).trim() || defaultProfileState.profileName;
    }
}

function saveProfileState() {
    const form = document.querySelector('#accountPage .profile-form');
    if (!form) {
        return;
    }

    const state = {
        profileUsername: form.querySelector('[name="profileUsername"]')?.value || defaultProfileState.profileUsername,
        profileName: form.querySelector('[name="profileName"]')?.value || defaultProfileState.profileName,
        gender: form.querySelector('input[name="gender"]:checked')?.value || defaultProfileState.gender,
        dobDay: form.querySelector('[name="dobDay"]')?.value || defaultProfileState.dobDay,
        dobMonth: form.querySelector('[name="dobMonth"]')?.value || defaultProfileState.dobMonth,
        dobYear: form.querySelector('[name="dobYear"]')?.value || defaultProfileState.dobYear,
    };

    localStorage.setItem(profileStateKey, JSON.stringify(state));
    syncProfileHeaderFromForm();
    scheduleProfileSaveToast();
}

function restoreProfileState() {
    const form = document.querySelector('#accountPage .profile-form');
    if (!form) {
        return;
    }

    const saved = getSavedProfileState();
    const state = { ...defaultProfileState, ...(saved || {}) };

    const setValue = (name, value) => {
        const input = form.querySelector(`[name="${name}"]`);
        if (input) {
            input.value = value;
        }
    };

    setValue('profileUsername', state.profileUsername);
    setValue('profileName', state.profileName);
    setValue('dobDay', state.dobDay);
    setValue('dobMonth', state.dobMonth);
    setValue('dobYear', state.dobYear);

    const genderInput = form.querySelector(`input[name="gender"][value="${state.gender}"]`);
    if (genderInput) {
        genderInput.checked = true;
    }

    syncProfileHeaderFromForm();
}

function setProfileImage(src) {
    if (!src) {
        return;
    }

    const avatarTargets = [
        document.querySelector('#accountPage .profile-avatar'),
        document.querySelector('#accountPage .avatar-preview'),
    ];

    avatarTargets.forEach((target) => {
        if (!target) {
            return;
        }

        target.innerHTML = `<img src="${src}" alt="Profile image">`;
    });
}

function restoreProfileImage() {
    const savedImage = localStorage.getItem(profileImageKey);
    if (savedImage) {
        setProfileImage(savedImage);
    }
}

function bindProfileImageUpload() {
    const fileInput = document.getElementById('profileImageInput');
    const editProfileButton = document.querySelector('#accountPage .edit-profile');
    if (!fileInput || !editProfileButton) {
        return;
    }

    editProfileButton.addEventListener('click', (event) => {
        event.preventDefault();
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const imageData = typeof reader.result === 'string' ? reader.result : '';
            if (!imageData) {
                return;
            }

            setProfileImage(imageData);
            localStorage.setItem(profileImageKey, imageData);
            scheduleProfileSaveToast();
        };
        reader.readAsDataURL(file);
    });
}

function showProfileSaveToast() {
    const toast = document.getElementById('profileSaveToast');
    if (!toast) {
        return;
    }

    toast.classList.add('active');
    toast.setAttribute('aria-hidden', 'false');

    window.setTimeout(() => {
        toast.classList.remove('active');
        toast.setAttribute('aria-hidden', 'true');
    }, 1500);
}

function scheduleProfileSaveToast() {
    if (profileSaveToastTimer) {
        window.clearTimeout(profileSaveToastTimer);
    }

    profileSaveToastTimer = window.setTimeout(() => {
        showProfileSaveToast();
    }, 450);
}

function getSelectedDeliveryCost() {
    const selected = document.querySelector('#checkoutPage input[name="delivery"]:checked');
    return selected?.value === 'express' ? 90 : 45;
}

function updateCheckoutSummary() {
    const summaryItems = document.querySelector('#checkoutPage .summary-items');
    const summaryRows = document.querySelectorAll('#checkoutPage .summary-row');
    const summaryRowItems = summaryRows[0]?.querySelector('span:last-child');
    const summaryRowShipping = summaryRows[1]?.querySelector('span:last-child');
    const summaryRowTotal = summaryRows[2]?.querySelector('span:last-child');
    if (!summaryItems || !summaryRowItems || !summaryRowShipping || !summaryRowTotal) {
        return;
    }

    const selectedRows = getCartRows().filter(row => row.querySelector('.item-checkbox input')?.checked);
    const lineItems = selectedRows.map(row => {
        const title = row.querySelector('.item-details h4')?.textContent.trim() || '';
        const price = parsePeso(row.querySelector('.item-price')?.textContent || '0');
        const qty = Number(row.querySelector('.qty-value')?.textContent || 1);
        return { title, total: price * qty };
    });

    summaryItems.innerHTML = lineItems.length
        ? lineItems.map(item => `<div class="summary-item"><span>${item.title}</span><span>${formatPeso(item.total)}</span></div>`).join('')
        : '<div class="summary-item"><span>No items selected</span><span>₱ 0.00</span></div>';

    const itemTotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const shipping = getSelectedDeliveryCost();
    summaryRowItems.textContent = formatPeso(itemTotal);
    summaryRowShipping.textContent = formatPeso(shipping);
    summaryRowTotal.textContent = formatPeso(itemTotal + shipping);
}

function findCartRowByTitle(title) {
    return getCartRows().find(row => row.querySelector('.item-details h4')?.textContent.trim() === title);
}

function buildCartItemMarkup(item) {
    const image = item.image || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=80&h=80&fit=crop';
    const total = (item.price || 0) * (item.qty || 1);

    return `
        <div class="cart-item">
            <label class="item-checkbox">
                <input type="checkbox" ${item.checked === false ? '' : 'checked'}>
            </label>
            <div class="item-image">
                <img src="${image}" alt="${item.title}">
            </div>
            <div class="item-details">
                <h4>${item.title}</h4>
                <p class="item-price">${formatPeso(item.price || 0)}</p>
            </div>
            <div class="item-qty">
                <div class="qty-selector small">
                    <button class="qty-btn minus">-</button>
                    <span class="qty-value">${item.qty || 1}</span>
                    <button class="qty-btn plus">+</button>
                </div>
            </div>
            <div class="item-total">
                <p>${formatPeso(total)}</p>
            </div>
            <div class="item-actions">
                <a href="#">Delete</a>
                <a href="#">Find Similar</a>
            </div>
        </div>
    `;
}

function appendCartItem(item) {
    const cartItems = document.querySelector('#cartPage .cart-items');
    const firstShopGroup = cartItems?.querySelector('.shop-group');
    if (!cartItems || !firstShopGroup) {
        return null;
    }

    firstShopGroup.insertAdjacentHTML('beforeend', buildCartItemMarkup(item));
    return findCartRowByTitle(item.title);
}

function getSelectedProductFromStorage() {
    try {
        return JSON.parse(localStorage.getItem(selectedProductKey) || 'null');
    } catch {
        return null;
    }
}

function incrementCartItem(title, amount = 1, fallbackProduct = null) {
    const normalizedTitle = String(title || '').trim();
    const row = findCartRowByTitle(normalizedTitle);
    if (!row) {
        const product = fallbackProduct || findProductByTitle(normalizedTitle);
        if (!product) {
            return false;
        }

        const createdRow = appendCartItem({
            title: product.title,
            price: product.price,
            qty: amount,
            checked: true,
            image: product.image,
        });

        if (!createdRow) {
            return false;
        }

        updateCartRowTotals();
        updateCartSummary();
        saveCartState();
        return true;
    }

    const qtyValue = row.querySelector('.qty-value');
    if (!qtyValue) {
        return false;
    }

    const currentQty = Number(qtyValue.textContent || 1);
    qtyValue.textContent = String(currentQty + amount);
    updateCartRowTotals();
    updateCartSummary();
    saveCartState();
    return true;
}

function selectOnlyCartItem(title) {
    const normalizedTitle = String(title || '').trim();
    getCartRows().forEach(row => {
        const checkbox = row.querySelector('.item-checkbox input');
        const rowTitle = row.querySelector('.item-details h4')?.textContent.trim() || '';
        if (checkbox) {
            checkbox.checked = rowTitle === normalizedTitle;
        }
    });

    const selectAll = document.querySelector('#cartPage .select-all input');
    if (selectAll) {
        selectAll.checked = false;
    }

    updateCartSummary();
    saveCartState();
}

function applyProductFilters() {
    const searchInput = document.querySelector('.search-bar input');
    const filterButton = getActiveFilterButton();
    const query = (searchInput?.value || '').trim().toLowerCase();
    const activeFilter = (filterButton?.dataset.category || getCategoryKeyFromLabel(filterButton?.textContent) || 'all').toLowerCase();

    getVisibleProductCards().forEach(card => {
        const title = card.querySelector('.product-info h4')?.textContent.toLowerCase() || '';
        const weight = card.querySelector('.product-weight')?.textContent.toLowerCase() || '';
        const category = (card.dataset.category || '').toLowerCase();

        const matchesQuery = !query || title.includes(query) || weight.includes(query) || category.includes(query);
        const matchesFilter = activeFilter === 'all' || category === activeFilter;

        card.style.display = matchesQuery && matchesFilter ? '' : 'none';
    });
}

function syncCategoryButtons() {
    const prev = document.querySelector('.arrow-btn.prev');
    const next = document.querySelector('.arrow-btn.next');
    const categoriesGrid = document.getElementById('featuredCategoriesGrid');
    if (categoriesGrid && prev && next && !categoriesGrid.dataset.carouselBound) {
        prev.addEventListener('click', () => categoriesGrid.scrollBy({ left: -220, behavior: 'smooth' }));
        next.addEventListener('click', () => categoriesGrid.scrollBy({ left: 220, behavior: 'smooth' }));
        categoriesGrid.dataset.carouselBound = 'true';
    }
}

// ==================== PAGE TRANSITIONS ====================
function showPage(pageId, options = {}) {
    const {
        pushHistory = true,
        replaceHistory = false,
        immediate = false,
    } = options;
    const transition = document.getElementById('pageTransition');
    const pages = document.querySelectorAll('.page');
    const mainWrapper = document.getElementById('mainWrapper');
    const footer = document.getElementById('mainFooter');
    const mainPageIds = ['homePage', 'aboutPage', 'iotServicesPage', 'contactPage', 'cartPage', 'checkoutPage', 'accountPage', 'productPage'];

    // Don't transition if already on the same page
    if (currentPage === pageId && !pageId.includes('login') && !pageId.includes('register')) {
        return;
    }

    // If logging in, check credentials first
    if (pageId === 'homePage' && !isLoggedIn) {
        // Allow navigation to homepage only after login
        return;
    }

    if (pushHistory) {
        const historyState = { pageId };
        const historyUrl = `#${pageId}`;
        if (replaceHistory) {
            window.history.replaceState(historyState, '', historyUrl);
        } else {
            window.history.pushState(historyState, '', historyUrl);
        }
    }

    localStorage.setItem(lastPageKey, pageId);
    localStorage.setItem(authStateKey, String(isLoggedIn));

    // Trigger transition
    transition.classList.add('active');

    const renderPage = () => {
        // Hide all pages
        pages.forEach(page => {
            page.classList.remove('active');
        });

        // Show main wrapper for main pages
        if (mainPageIds.includes(pageId)) {
            mainWrapper.classList.remove('hidden');
            footer.style.display = 'block';
            
            // Show the specific page
            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                setTimeout(() => {
                    targetPage.classList.add('active');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
            }
        } else {
            // Hide main wrapper for auth pages
            mainWrapper.classList.add('hidden');
            footer.style.display = 'none';
            
            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                setTimeout(() => {
                    targetPage.classList.add('active');
                }, 100);
            }
        }

        currentPage = pageId;

        // Update navigation active state
        updateNavActiveState(pageId);

        // Hide transition
        setTimeout(() => {
            transition.classList.remove('active');
        }, 300);

        if (pageId === 'checkoutPage') {
            restoreCheckoutAddress();
            updateCheckoutSummary();
        }
    };

    if (immediate) {
        renderPage();
    } else {
        setTimeout(renderPage, 400);
    }
}

function updateNavActiveState(pageId) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageId);
    });
}

function logoutUser() {
    isLoggedIn = false;
    localStorage.setItem(authStateKey, 'false');
    showPage('loginPage');
}

// ==================== AUTH HANDLERS ====================
function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const emailInput = form.querySelector('input[type="text"]').value;
    const passwordInput = form.querySelector('input[type="password"]').value;

    // Simulate login (in real app, this would be an API call)
    if (emailInput && passwordInput) {
        isLoggedIn = true;
        showPage('homePage');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const inputs = form.querySelectorAll('input');

    // Check if all fields are filled
    let allFilled = true;
    inputs.forEach(input => {
        if (!input.value) allFilled = false;
    });

    if (allFilled) {
        isLoggedIn = true;
        showPage('homePage');
    }
}

function handlePlaceOrder(event) {
    event.preventDefault();
    saveCheckoutAddress();
    saveCartState();

    const checkoutForm = document.querySelector('#checkoutPage .address-form');
    const fullName = checkoutForm?.querySelector('[name="fullName"]')?.value.trim();
    const phoneNumber = checkoutForm?.querySelector('[name="phoneNumber"]')?.value.trim();
    const street = checkoutForm?.querySelector('[name="street"]')?.value.trim();

    if (!fullName || !phoneNumber || !street) {
        alert('Please fill out the delivery address before placing the order.');
        return;
    }

    const selectedItems = getCartRows().filter(row => row.querySelector('.item-checkbox input')?.checked);
    if (!selectedItems.length) {
        alert('Select at least one cart item before placing the order.');
        return;
    }

    const order = {
        address: JSON.parse(localStorage.getItem(checkoutAddressKey) || 'null'),
        items: selectedItems.map(getCartItemData),
        total: document.querySelector('#checkoutPage .total-row span:last-child')?.textContent || '₱ 0.00',
        createdAt: new Date().toISOString(),
    };

    localStorage.setItem('viridianLatestOrder', JSON.stringify(order));
    showOrderSuccessPopup(() => {
        showPage('homePage');
    });
}

function showOrderSuccessPopup(onClose) {
    let popup = document.getElementById('orderSuccessPopup');
    if (!popup) {
        document.body.insertAdjacentHTML('beforeend', `
            <div class="order-popup-overlay" id="orderSuccessPopup" aria-hidden="true">
                <div class="order-popup" role="dialog" aria-modal="true" aria-labelledby="orderSuccessTitle">
                    <h3 id="orderSuccessTitle">Order Placed</h3>
                    <p>Your order was placed successfully. We saved your delivery details and order summary.</p>
                    <button type="button" class="order-popup-btn" id="orderSuccessOkBtn">OK</button>
                </div>
            </div>
        `);
        popup = document.getElementById('orderSuccessPopup');
    }

    onOrderSuccessClose = typeof onClose === 'function' ? onClose : null;
    popup.classList.add('active');
    popup.setAttribute('aria-hidden', 'false');

    const popupOkButton = popup.querySelector('#orderSuccessOkBtn');
    if (!popup.dataset.bound) {
        popupOkButton?.addEventListener('click', closeOrderSuccessPopup);
        popup.addEventListener('click', (event) => {
            if (event.target === popup) {
                closeOrderSuccessPopup();
            }
        });
        popup.dataset.bound = 'true';
    }
}

function closeOrderSuccessPopup() {
    const popup = document.getElementById('orderSuccessPopup');
    if (!popup) {
        return;
    }

    popup.classList.remove('active');
    popup.setAttribute('aria-hidden', 'true');

    const callback = onOrderSuccessClose;
    onOrderSuccessClose = null;
    if (typeof callback === 'function') {
        callback();
    }
}

// ==================== QUANTITY SELECTOR ====================
document.addEventListener('click', function(e) {
    // Handle quantity buttons
    if (e.target.classList.contains('qty-btn')) {
        const selector = e.target.closest('.qty-selector');
        const valueEl = selector.querySelector('.qty-value');
        let value = parseInt(valueEl.textContent);

        if (e.target.classList.contains('plus')) {
            value++;
        } else if (e.target.classList.contains('minus')) {
            if (value > 1) value--;
        }

        // Animate the value change
        valueEl.style.transform = 'scale(1.3)';
        valueEl.textContent = value;
        setTimeout(() => {
            valueEl.style.transform = 'scale(1)';
        }, 150);

        if (e.target.closest('#cartPage')) {
            updateCartRowTotals();
            updateCartSummary();
            saveCartState();
        }
    }

    // Handle ADD to cart button
    if (e.target.classList.contains('btn-add') && e.target.closest('.product-card')) {
        const btn = e.target;
        const card = btn.closest('.product-card');
        const title = card?.querySelector('.product-info h4')?.textContent.trim() || '';
        const added = incrementCartItem(title, 1);
        btn.textContent = added ? 'Added!' : 'Saved';
        btn.style.background = '#2E7D32';
        
        // Create floating animation
        const originalText = 'ADD';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 1500);

        // Add pulse animation
        btn.style.transform = 'scale(1.1)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 200);
    }

    if (e.target.closest('.category-card')) {
        const categoryCard = e.target.closest('.category-card');
        const categoryKey = categoryCard.dataset.category || 'all';
        const matchingProduct = findProductByCategory(categoryKey);

        if (!matchingProduct) {
            alert(`No product found for ${getCategoryLabel(categoryKey)} yet.`);
            return;
        }

        setActiveProductFilter(categoryKey);
        renderProductPage(matchingProduct);
        showPage('productPage');
        return;
    }

    if (e.target.closest('.product-card') && e.target.closest('#homeProductsGrid') && !e.target.closest('.btn-add') && !e.target.closest('.qty-btn')) {
        const productCard = e.target.closest('.product-card');
        const productIndex = Number(productCard.dataset.productIndex);
        const productTitle = productCard.dataset.productTitle || '';
        const product = Number.isInteger(productIndex) ? findProductByIndex(productIndex) : findProductByTitle(productTitle);

        renderProductPage(product);
        showPage('productPage');
        return;
    }

    // Handle filter buttons
    if (e.target.classList.contains('filter-btn')) {
        const filterGroup = e.target.closest('.product-filters') || e.target.closest('.rating-filters');
        if (filterGroup) {
            filterGroup.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');

            if (filterGroup.classList.contains('product-filters')) {
                const categoryKey = e.target.dataset.category || getCategoryKeyFromLabel(e.target.textContent);
                localStorage.setItem(productFilterKey, categoryKey);
                applyProductFilters();
            }
        }
    }

    // Handle thumbnail clicks
    if (e.target.closest('.thumbnail')) {
        const thumbnail = e.target.closest('.thumbnail');
        const thumbnails = thumbnail.parentElement.querySelectorAll('.thumbnail');
        const mainImage = thumbnail.closest('.product-gallery').querySelector('.main-image img');

        thumbnails.forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');

        // Animate image change
        mainImage.style.opacity = '0';
        mainImage.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            mainImage.src = thumbnail.querySelector('img').src;
            mainImage.style.opacity = '1';
            mainImage.style.transform = 'scale(1)';
        }, 200);
    }

    // Handle Add to Cart on product page
    if (e.target.classList.contains('btn-add-to-cart')) {
        const btn = e.target;
        const productTitle = btn.dataset.productTitle || document.querySelector('#productPage .product-title')?.textContent.trim() || '';
        const selectedProduct = getSelectedProductFromStorage();
        const fallbackProduct = selectedProduct?.title === productTitle ? selectedProduct : null;
        const added = incrementCartItem(productTitle, 1, fallbackProduct);

        btn.textContent = added ? 'Added to Cart!' : 'Unable to Add';
        btn.classList.toggle('is-added', added);
        
        setTimeout(() => {
            btn.textContent = 'Add to Cart';
            btn.classList.remove('is-added');
        }, 2000);

        if (!added) {
            alert('Could not add this item to cart. Please try again.');
        }
    }

    // Handle Buy Now on product page
    if (e.target.classList.contains('btn-buy-now')) {
        const productTitle = e.target.dataset.productTitle || document.querySelector('#productPage .product-title')?.textContent.trim() || '';
        const selectedProduct = getSelectedProductFromStorage();
        const fallbackProduct = selectedProduct?.title === productTitle ? selectedProduct : null;
        const added = incrementCartItem(productTitle, 1, fallbackProduct);
        if (!added) {
            alert('Could not proceed with Buy Now. Please try again.');
            return;
        }

        selectOnlyCartItem(productTitle);
        showPage('checkoutPage');
    }

    // Handle Place Order
    if (e.target.classList.contains('place-order-btn')) {
        handlePlaceOrder(e);
        return;
    }

    if (e.target.closest('.btn-logout')) {
        logoutUser();
        return;
    }
});

// ==================== HEADER SCROLL EFFECT ====================
let lastScrollY = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    lastScrollY = currentScrollY;
});

// ==================== CATEGORY CAROUSEL ====================
const categoriesGrid = document.querySelector('.categories-grid');
const prevBtn = document.querySelector('.arrow-btn.prev');
const nextBtn = document.querySelector('.arrow-btn.next');

if (categoriesGrid && prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
        categoriesGrid.scrollBy({ left: -160, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
        categoriesGrid.scrollBy({ left: 160, behavior: 'smooth' });
    });
}

// ==================== PRODUCT CARD HOVER EFFECTS ====================
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.zIndex = '10';
    });

    card.addEventListener('mouseleave', () => {
        card.style.zIndex = '1';
    });
});

// ==================== ANIMATED ENTRANCE FOR ELEMENTS ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for scroll animations
document.querySelectorAll('.categories, .promo-banners, .popular-products').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// ==================== CART CHECKBOX HANDLING ====================
document.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
        const checkbox = e.target;
        const parent = checkbox.closest('.shop-group');
        
        // Animate checkbox
        checkbox.style.transform = 'scale(1.2)';
        setTimeout(() => {
            checkbox.style.transform = 'scale(1)';
        }, 150);

        // Update total if it's a select all checkbox
        if (checkbox.closest('.select-all')) {
            const shopCheckboxes = document.querySelectorAll('.shop-group .item-checkbox input');
            shopCheckboxes.forEach(cb => {
                cb.checked = checkbox.checked;
            });
        }

        // If all items in shop are unchecked, uncheck shop
        if (parent) {
            const shopCheckbox = parent.querySelector('.shop-checkbox input');
            const itemCheckboxes = parent.querySelectorAll('.item-checkbox input');
            const allChecked = Array.from(itemCheckboxes).every(cb => cb.checked);
            shopCheckbox.checked = allChecked;
        }

        if (checkbox.closest('#cartPage')) {
            updateCartSummary();
            saveCartState();
        }

        if (checkbox.name === 'defaultAddress' || checkbox.name === 'riderNote') {
            saveCheckoutAddress();
        }
    }

    if (e.target.name === 'delivery') {
        const deliveryOptions = document.querySelectorAll('#checkoutPage .delivery-option');
        deliveryOptions.forEach(option => {
            option.classList.toggle('active', option.querySelector('input[name="delivery"]') === e.target);
        });
        saveCheckoutAddress();
        updateCheckoutSummary();
    }
});

// ==================== FORM INPUT ANIMATIONS ====================
document.querySelectorAll('.form-group input').forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.style.transform = 'scale(1.02)';
    });

    input.addEventListener('blur', () => {
        input.parentElement.style.transform = 'scale(1)';
    });
});

// ==================== SMOOTH SCROLL FOR ANCHOR LINKS ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// ==================== PRELOAD IMAGES ====================
function preloadImages(urls) {
    urls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Preload hero and product images
preloadImages([
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&h=600&fit=crop',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=500&fit=crop'
]);

// ==================== INITIAL PAGE LOAD ====================
document.addEventListener('DOMContentLoaded', () => {
    // Show login page first (default)
    const loginPage = document.getElementById('loginPage');

    isLoggedIn = localStorage.getItem(authStateKey) === 'true';
    const savedPageId = localStorage.getItem(lastPageKey);
    const hashPageId = window.location.hash ? window.location.hash.slice(1) : '';
    let initialPageId = hashPageId || savedPageId || 'loginPage';

    if (!isLoggedIn && initialPageId !== 'loginPage' && initialPageId !== 'registerPage') {
        initialPageId = 'loginPage';
    }

    if (loginPage && initialPageId === 'loginPage') {
        loginPage.classList.add('active');
    }

    showPage(initialPageId, { pushHistory: false, replaceHistory: true, immediate: true });

    window.addEventListener('popstate', (event) => {
        const pageId = event.state?.pageId || 'loginPage';
        if (pageId === 'loginPage') {
            isLoggedIn = false;
            localStorage.setItem(authStateKey, 'false');
        }
        showPage(pageId, { pushHistory: false, immediate: true });
    });

    // Initialize header
    const header = document.querySelector('.header');
    if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            header.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }, 500);
    }

    // Add smooth transition to product images
    document.querySelectorAll('.product-image img').forEach(img => {
        img.style.transition = 'transform 0.3s ease';
    });

    renderHomepageData();
    syncCategoryButtons();

    // Restore cart and checkout state
    restoreCartState();
    restoreCheckoutAddress();
    restoreProfileState();
    restoreProfileImage();

    const profileForm = document.querySelector('#accountPage .profile-form');
    if (profileForm) {
        profileForm.addEventListener('input', saveProfileState);
        profileForm.addEventListener('change', saveProfileState);
    }

    bindProfileImageUpload();

    // Wire search and checkout persistence
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', applyProductFilters);
        searchInput.value = searchInput.value || '';
    }

    const checkoutForm = document.querySelector('#checkoutPage .address-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('input', saveCheckoutAddress);
        checkoutForm.addEventListener('change', () => {
            saveCheckoutAddress();
            updateCheckoutSummary();
        });
    }

    const savedFilter = localStorage.getItem(productFilterKey);
    if (savedFilter) {
        const button = Array.from(document.querySelectorAll('.product-filters .filter-btn')).find(btn => {
            const categoryKey = (btn.dataset.category || getCategoryKeyFromLabel(btn.textContent)).toLowerCase();
            return categoryKey === savedFilter.toLowerCase();
        });
        if (button) {
            button.click();
        }
    }

    const savedProduct = localStorage.getItem(selectedProductKey);
    if (savedProduct) {
        try {
            renderProductPage(JSON.parse(savedProduct));
        } catch {
            renderProductPage(productCatalog[0]);
        }
    } else {
        renderProductPage(productCatalog[0]);
    }

    const orderPopup = document.getElementById('orderSuccessPopup');
    const orderPopupOkBtn = document.getElementById('orderSuccessOkBtn');
    if (orderPopup && !orderPopup.dataset.bound) {
        orderPopupOkBtn?.addEventListener('click', closeOrderSuccessPopup);
        orderPopup.addEventListener('click', (event) => {
            if (event.target === orderPopup) {
                closeOrderSuccessPopup();
            }
        });
        orderPopup.dataset.bound = 'true';
    }
});

// ==================== KEYBOARD NAVIGATION ====================
document.addEventListener('keydown', (e) => {
    // ESC to go back to login
    if (e.key === 'Escape' && isLoggedIn) {
        const orderPopup = document.getElementById('orderSuccessPopup');
        if (orderPopup?.classList.contains('active')) {
            closeOrderSuccessPopup();
            return;
        }

        logoutUser();
    }
});

// ==================== TOUCH SWIPE FOR MOBILE CAROUSELS ====================
let touchStartX = 0;
let touchEndX = 0;

if (categoriesGrid) {
    categoriesGrid.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    categoriesGrid.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - scroll right
                categoriesGrid.scrollBy({ left: 160, behavior: 'smooth' });
            } else {
                // Swiped right - scroll left
                categoriesGrid.scrollBy({ left: -160, behavior: 'smooth' });
            }
        }
    }
}

// ==================== PERFORMANCE: DEBOUNCE SCROLL ====================
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }
    
    scrollTimeout = window.requestAnimationFrame(() => {
        // Scroll-based animations here
    });
});

// ==================== CONSOLE LOGO ====================
console.log('%c Viridian ', 'background: #1B5E20; color: white; font-size: 20px; padding: 10px 20px; border-radius: 4px;');
console.log('%c Sustainable Agriculture Marketplace ', 'color: #1B5E20; font-size: 12px;');
