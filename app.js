let tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// ==========================================
// ПЕРЕКЛЮЧЕНИЕ ТЕМЫ (ДЕНЬ / НОЧЬ)
// ==========================================
function applyTheme(isLight) {
    if (isLight) {
        document.body.classList.add('light-theme');
        if (tg.setHeaderColor) tg.setHeaderColor('#ffffff');
        if (tg.setBackgroundColor) tg.setBackgroundColor('#ffffff');
    } else {
        document.body.classList.remove('light-theme');
        if (tg.setHeaderColor) tg.setHeaderColor('#000000');
        if (tg.setBackgroundColor) tg.setBackgroundColor('#000000');
    }
}

function toggleTheme() {
    triggerHaptic();
    const isLight = !document.body.classList.contains('light-theme');
    applyTheme(isLight);
    localStorage.setItem('onemarket_theme', isLight ? 'light' : 'dark');
}

// Загружаем сохраненную тему при запуске
const savedTheme = localStorage.getItem('onemarket_theme');
applyTheme(savedTheme === 'light');


const products = [
    // Telegram Stars
    { id: 'stars_50', name: '50 Звёзд ⭐️', price: 18, type: 'stars' },
    { id: 'stars_75', name: '75 Звёзд ⭐️', price: 27, type: 'stars' },
    { id: 'stars_100', name: '100 Звёзд ⭐️', price: 35, type: 'stars' },
    { id: 'stars_150', name: '150 Звёзд ⭐️', price: 52, type: 'stars' },
    { id: 'stars_250', name: '250 Звёзд ⭐️', price: 87, type: 'stars' },
    { id: 'stars_300', name: '300 Звёзд ⭐️', price: 104, type: 'stars' },
    { id: 'stars_500', name: '500 Звёзд ⭐️', price: 165, type: 'stars' },

    // Telegram Premium
    { id: 'prem_1', name: 'Premium 1 мес. (с заходом)', price: 75, type: 'premium' },
    { id: 'prem_3', name: 'Premium 3 мес.', price: 230, type: 'premium' },
    { id: 'prem_6', name: 'Premium 6 мес.', price: 320, type: 'premium' },
    { id: 'prem_12', name: 'Premium 12 мес.', price: 500, type: 'premium' },

    // Пополнение Steam ($)
    { id: 'steam_1', name: 'Пополнение Steam $1', price: 21, type: 'steam' },
    { id: 'steam_5', name: 'Пополнение Steam $5', price: 100, type: 'steam' },
    { id: 'steam_10', name: 'Пополнение Steam $10', price: 190, type: 'steam' },
];

let cart = {};
let currentCategory = 'all';

function triggerHaptic() {
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Фильтрация по категориям (вкладкам)
function filterCategory(category, btnElement) {
    triggerHaptic();
    currentCategory = category;

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) {
        btnElement.classList.add('active');
    }

    renderProducts();
}

// Поиск по названию
function handleSearch() {
    renderProducts();
}

function renderProducts() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();

    const premContainer = document.getElementById('premium-grid');
    const starsContainer = document.getElementById('stars-grid');
    const steamContainer = document.getElementById('steam-grid');

    const premSection = document.getElementById('premium-section');
    const starsSection = document.getElementById('stars-section');
    const steamSection = document.getElementById('steam-section');
    const noResults = document.getElementById('no-results');

    premContainer.innerHTML = '';
    starsContainer.innerHTML = '';
    steamContainer.innerHTML = '';

    let premCount = 0;
    let starsCount = 0;
    let steamCount = 0;

    products.forEach(p => {
        const matchesCategory = (currentCategory === 'all' || p.type === currentCategory);
        const matchesSearch = p.name.toLowerCase().includes(searchQuery);

        if (matchesCategory && matchesSearch) {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-title">${p.name}</div>
                <div class="card-price">${p.price} ₽</div>
                <button class="btn-add" onclick="addToCart('${p.id}')">В корзину</button>
            `;

            if (p.type === 'premium') {
                premContainer.appendChild(card);
                premCount++;
            } else if (p.type === 'stars') {
                starsContainer.appendChild(card);
                starsCount++;
            } else if (p.type === 'steam') {
                steamContainer.appendChild(card);
                steamCount++;
            }
        }
    });

    premSection.style.display = premCount > 0 ? 'block' : 'none';
    starsSection.style.display = starsCount > 0 ? 'block' : 'none';
    steamSection.style.display = steamCount > 0 ? 'block' : 'none';

    if (premCount === 0 && starsCount === 0 && steamCount === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
    }
}

function addToCart(id) {
    triggerHaptic();
    if (cart[id]) {
        cart[id].count += 1;
    } else {
        const product = products.find(p => p.id === id);
        cart[id] = { ...product, count: 1 };
    }
    updateCartUI();
}

function changeQty(id, delta) {
    triggerHaptic();
    if (!cart[id]) return;

    cart[id].count += delta;
    if (cart[id].count <= 0) {
        delete cart[id];
    }
    updateCartUI();
}

function updateCartUI() {
    let totalPrice = 0;
    let totalCount = 0;

    const cartSection = document.getElementById('cart-section');
    const cartContainer = document.getElementById('cart-items-container');
    cartContainer.innerHTML = '';

    const items = Object.values(cart);

    if (items.length > 0) {
        cartSection.style.display = 'block';
    } else {
        cartSection.style.display = 'none';
    }

    items.forEach(item => {
        totalPrice += item.price * item.count;
        totalCount += item.count;

        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.innerHTML = `
            <div>
                <strong style="font-size:13px;">${item.name}</strong>
                <div style="font-size:11px; color:var(--hint-color);">${item.price} ₽ × ${item.count}</div>
            </div>
            <div class="counter-control">
                <button class="btn-qty" onclick="changeQty('${item.id}', -1)">-</button>
                <span style="font-weight:700; font-size:13px;">${item.count}</span>
                <button class="btn-qty" onclick="changeQty('${item.id}', 1)">+</button>
            </div>
        `;
        cartContainer.appendChild(row);
    });

    document.getElementById('total-price').innerText = `${totalPrice} ₽`;
    document.getElementById('total-count').innerText = `Товаров: ${totalCount}`;
}

document.getElementById('checkoutBtn').addEventListener('click', () => {
    triggerHaptic();
    const items = Object.values(cart);
    if (items.length === 0) {
        tg.showAlert("Ваша корзина пуста!");
        return;
    }

    let totalPrice = items.reduce((sum, item) => sum + item.price * item.count, 0);

    const orderData = {
        items: items.map(i => ({ name: i.name, count: i.count, price: i.price })),
        totalPrice: totalPrice
    };

    tg.sendData(JSON.stringify(orderData));
});

// ==========================================
// СКРИМЕР КОНЯ ДЛЯ MINI APP
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector('.header');
    const screamerBtn = document.createElement('button');
    screamerBtn.innerHTML = "🎁 Получить секретную скидку";
    screamerBtn.className = "btn-add";
    screamerBtn.style.cssText = "width: 100%; margin-top: 10px;";
    header.appendChild(screamerBtn);

    const audio = document.createElement('audio');
    audio.id = "horseAudio";
    audio.src = "mixkit-scared-horse-neighing-85.wav";
    document.body.appendChild(audio);

    const modal = document.createElement('div');
    modal.id = "screamerModal";
    modal.style.cssText = "display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 9999; justify-content: center; align-items: center;";
    modal.innerHTML = `
        <img src="IMAGE 2026-11-21 23:09:51.jpg" style="max-width: 90%; max-height: 90%; border-radius: 12px;">
    `;
    document.body.appendChild(modal);

    screamerBtn.addEventListener('click', () => {
        triggerHaptic();
        modal.style.display = 'flex';
        
        audio.currentTime = 0;
        audio.play().catch(err => console.log("Автозапуск звука заблокирован:", err));

        setTimeout(() => {
            modal.style.display = 'none';
        }, 3500);
    });

    modal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
});

renderProducts();

