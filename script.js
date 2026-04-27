// Fresh Bazaar - Core App Logic
// NOTE: localhost only works on your computer. 
// On Netlify, the app will now automatically use 'products.json' to show your products.
const API_URL = 'http://localhost:3000/api';

// Shared State
let currentLang = localStorage.getItem('lang') || 'bn';
let user = JSON.parse(localStorage.getItem('user')) || null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    updateUserUI();
    setLanguage(currentLang);
    
    if (document.getElementById('vegetables-grid') || document.getElementById('fruits-grid')) {
        fetchProducts();
        renderCart();
    }
    
    // Sticky Header
    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        if (header) {
            if (window.scrollY > 50) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        }
    });

    // Language Toggle Listener
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            setLanguage(currentLang === 'en' ? 'bn' : 'en');
        });
    }

    // Cart Listeners
    const openCartBtn = document.getElementById('open-cart');
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    if (openCartBtn && cartOverlay) {
        openCartBtn.addEventListener('click', () => cartOverlay.classList.add('active'));
        closeCartBtn.addEventListener('click', () => cartOverlay.classList.remove('active'));
    }

    // Filter Listeners
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderProducts(tab.dataset.cat);
        });
    });

    // Checkout Listener
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
});

// --- User Logic ---
function updateUserUI() {
    const userStatus = document.getElementById('user-status');
    if (!userStatus) return;

    if (user) {
        userStatus.innerHTML = `
            <div style="display: flex; gap: 1rem; align-items: center;">
                <span style="font-weight: 600; color: var(--primary);">${currentLang === 'en' ? 'Hi, ' : 'হাই, '}${user.name}</span>
                <button class="btn btn-outline" onclick="logout()" data-en="Logout" data-bn="লগআউট">${currentLang === 'en' ? 'Logout' : 'লগআউট'}</button>
            </div>
        `;
    } else {
        userStatus.innerHTML = `
            <a href="login.html" class="btn btn-primary" data-en="Login" data-bn="লগইন">${currentLang === 'en' ? 'Login' : 'লগইন'}</a>
        `;
    }
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.reload();
}

// --- Language Logic ---
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    
    const elements = document.querySelectorAll('[data-en]');
    elements.forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`);
    });

    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) langToggle.textContent = lang === 'en' ? 'বাংলা' : 'English';
    
    if (document.getElementById('product-grid')) {
        renderProducts();
        renderFestivals();
        renderCart();
    }
    updateUserUI();
}

// --- Product Logic ---
async function fetchProducts() {
    try {
        // Try local API first
        const res = await fetch(`${API_URL}/products`);
        if (!res.ok) throw new Error('API unreachable');
        products = await res.json();
    } catch (err) {
        console.warn('API failed, falling back to local products.json', err);
        try {
            // Fallback for Netlify/Production
            const res = await fetch('products.json');
            products = await res.json();
        } catch (fallbackErr) {
            console.error('Failed to fetch even from fallback', fallbackErr);
        }
    }
    renderProducts();
}

function renderProducts() {
    const vegGrid = document.getElementById('vegetables-grid');
    const fruitGrid = document.getElementById('fruits-grid');
    if (!vegGrid || !fruitGrid) return;

    const veggies = products.filter(p => p.category === 'vegetables');
    const fruits = products.filter(p => p.category === 'fruits');
    
    const renderCard = (p) => `
        <div class="card ${!p.stock ? 'out-of-stock' : ''}">
            <div class="card-img">
                <img src="${p.img}" alt="${p[currentLang]}">
                <span class="badge ${p.stock ? 'badge-veg' : 'badge-out'}">
                    ${p.stock ? (currentLang === 'en' ? 'In Stock' : 'আছে') : (currentLang === 'en' ? 'Out of Stock' : 'নেই')}
                </span>
            </div>
            <div class="card-body">
                <div class="card-title">
                    <span class="bn">${p[currentLang]}</span>
                    <span class="price">₹${p.price}</span>
                </div>
                <p class="unit">Per ${p.unit}</p>
                <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" 
                    onclick="addToCart(${p.id})" ${!p.stock ? 'disabled' : ''}>
                    ${currentLang === 'en' ? '+ Add to Cart' : '+ কার্টে যোগ করুন'}
                </button>
            </div>
        </div>
    `;

    vegGrid.innerHTML = veggies.map(renderCard).join('');
    fruitGrid.innerHTML = fruits.map(renderCard).join('');
}

function addToCart(id) {
    const item = products.find(p => p.id === id);
    const existing = cart.find(c => c.id === id);
    
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    showToast(`${item[currentLang]} added to cart`);
}

function removeFromCart(id) {
    cart = cart.filter(c => c.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function updateQty(id, delta) {
    const item = cart.find(c => c.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(id);
    else updateCartUI();
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    renderCart();
    const total = cart.reduce((acc, current) => acc + (current.price * current.qty), 0);
    const count = cart.reduce((acc, current) => acc + current.qty, 0);
    
    const totalEl = document.getElementById('cart-total');
    const countEl = document.querySelector('.cart-count');
    if (totalEl) totalEl.textContent = `₹${total}`;
    if (countEl) countEl.textContent = count;
}

function renderCart() {
    const list = document.getElementById('cart-list');
    if (!list) return;

    if (cart.length === 0) {
        list.innerHTML = `<p style="text-align: center; margin-top: 2rem; opacity: 0.5;">
            ${currentLang === 'en' ? 'Your cart is empty' : 'আপনার কার্ট খালি'}
        </p>`;
        return;
    }

    list.innerHTML = cart.map(c => `
        <div class="cart-item">
            <img src="${c.img}" alt="${c[currentLang]}">
            <div style="flex: 1;">
                <h5 class="bn">${c[currentLang]}</h5>
                <p class="unit">₹${c.price} x ${c.qty}</p>
                <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.5rem;">
                    <button class="qty-btn" onclick="updateQty(${c.id}, -1)">-</button>
                    <span>${c.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${c.id}, 1)">+</button>
                </div>
            </div>
            <button onclick="removeFromCart(${c.id})" style="background:none; border:none; color: var(--danger); cursor:pointer;">✕</button>
        </div>
    `).join('');
}

// --- Checkout Logic ---
function handleCheckout() {
    if (cart.length === 0) {
        showToast(currentLang === 'en' ? 'Cart is empty' : 'কার্ট খালি');
        return;
    }
    if (!user) {
        showToast(currentLang === 'en' ? 'Please login first' : 'দয়া করে আগে লগইন করুন');
        window.location.href = 'login.html';
        return;
    }
    
    // Check if on shop page
    if (!document.getElementById('checkout-address')) {
        // We need a checkout modal or separate page
        openModal('checkout');
    }
}

// Reuse modal system for checkout
function openModal(type) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    let content = '';
    if (type === 'checkout') {
        const total = cart.reduce((acc, current) => acc + (current.price * current.qty), 0);
        content = `
            <div class="modal-overlay active" id="modal-checkout">
                <div class="modal-content">
                    <button class="modal-close" onclick="closeModal('modal-checkout')">✕</button>
                    <h3 style="margin-bottom: 1.5rem;" data-en="Complete Your Order" data-bn="অর্ডার সম্পন্ন করুন">অর্ডার সম্পন্ন করুন</h3>
                    <div class="form-group">
                        <label data-en="Delivery Address" data-bn="ডেলিভারি ঠিকানা">ডেলিভারি ঠিকানা</label>
                        <textarea id="checkout-address" rows="3" placeholder="Shop address: Joyrambati near Hok Party restaurant"></textarea>
                    </div>
                    <div class="payment-qr">
                        <div style="background: white; padding: 1rem; display: inline-block; border-radius: var(--radius-sm);">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=9647969391@upi&pn=Mrinmoy%20Pramanik&am=${total}&cu=INR" alt="UPI QR">
                        </div>
                        <p style="margin-top: 1rem;">UPI ID: <span class="upi-id">9647969391@upi</span></p>
                    </div>
                    <div class="form-group">
                        <label data-en="Transaction ID" data-bn="ট্রানজ্যাকশন আইডি">ট্রানজ্যাকশন আইডি</label>
                        <input type="text" id="checkout-txid" placeholder="1234567890">
                    </div>
                    <button class="btn btn-primary" style="width: 100%; justify-content: center;" onclick="confirmOrder()">
                        পেমেন্ট ও অর্ডার নিশ্চিত করুন
                    </button>
                </div>
            </div>
        `;
    } else if (type === 'success') {
        content = `
            <div class="modal-overlay active" id="modal-success">
                <div class="modal-content" style="text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
                    <h3 data-en="Order Placed Successfully!" data-bn="অর্ডার সফলভাবে সম্পন্ন হয়েছে!">অর্ডার সফলভাবে সম্পন্ন হয়েছে!</h3>
                    <button class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 2rem;" onclick="location.reload()">দোকানে ফিরে যান</button>
                </div>
            </div>
        `;
    }
    modalContainer.innerHTML = content;
    setLanguage(currentLang);
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
}

async function confirmOrder() {
    const address = document.getElementById('checkout-address').value;
    const transactionId = document.getElementById('checkout-txid').value;
    const total = cart.reduce((acc, current) => acc + (current.price * current.qty), 0);

    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                items: cart,
                totalPrice: total,
                address: address,
                paymentMethod: 'UPI',
                transactionId: transactionId
            })
        });

        if (!res.ok) throw new Error('Order failed');
        cart = [];
        localStorage.removeItem('cart');
        closeModal('modal-checkout');
        openModal('success');
    } catch (err) {
        showToast(err.message);
    }
}

// --- Utils ---
function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
        background: var(--text-main); color: white; padding: 0.75rem 1.5rem;
        border-radius: 30px; z-index: 3000; box-shadow: var(--shadow-lg);
        animation: fadeIn 0.3s ease;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}
