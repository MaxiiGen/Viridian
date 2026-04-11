/* ============================================
   VIRIDIAN - JavaScript Interactions
   ============================================ */

// Current page state
let currentPage = 'loginPage';
let isLoggedIn = false;
const lastPageKey = 'viridianLastPage';
const authStateKey = 'viridianIsLoggedIn';

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
        if (pageId === 'homePage' || pageId === 'cartPage' || pageId === 'checkoutPage' || pageId === 'accountPage' || pageId === 'productPage') {
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
        link.classList.remove('active');
        if (link.textContent.toLowerCase() === 'home' && pageId === 'homePage') {
            link.classList.add('active');
        }
    });
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
    }

    // Handle ADD to cart button
    if (e.target.classList.contains('btn-add') && e.target.closest('.product-card')) {
        const btn = e.target;
        btn.textContent = 'Added!';
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

    // Handle filter buttons
    if (e.target.classList.contains('filter-btn')) {
        const filterGroup = e.target.closest('.product-filters') || e.target.closest('.rating-filters');
        if (filterGroup) {
            filterGroup.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
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
        btn.textContent = 'Added to Cart!';
        btn.style.background = '#2E7D32';
        
        setTimeout(() => {
            btn.textContent = 'Add to Cart';
            btn.style.background = '';
        }, 2000);
    }

    // Handle Buy Now on product page
    if (e.target.classList.contains('btn-buy-now')) {
        showPage('cartPage');
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
});

// ==================== KEYBOARD NAVIGATION ====================
document.addEventListener('keydown', (e) => {
    // ESC to go back to login
    if (e.key === 'Escape' && isLoggedIn) {
        isLoggedIn = false;
        localStorage.setItem(authStateKey, 'false');
        showPage('loginPage');
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
