let tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
if (tg) {
    tg.expand();
    tg.ready();
}

function triggerHaptic(type = 'light') {
    if (tg && tg.HapticFeedback) {
        try { tg.HapticFeedback.impactOccurred(type); } catch (e) {}
    }
}

// 1. ТЕМА
function applyTheme(isLight) {
    if (isLight) {
        document.body.classList.add('light-theme');
        if (tg && tg.setHeaderColor) tg.setHeaderColor('#ffffff');
        if (tg && tg.setBackgroundColor) tg.setBackgroundColor('#ffffff');
    } else {
        document.body.classList.remove('light-theme');
        if (tg && tg.setHeaderColor) tg.setHeaderColor('#000000');
        if (tg && tg.setBackgroundColor) tg.setBackgroundColor('#000000');
    }
}

function toggleTheme() {
    triggerHaptic();
    const isLight = !document.body.classList.contains('light-theme');
    applyTheme(isLight);
    localStorage.setItem('onemarket_theme', isLight ? 'light' : 'dark');
}

applyTheme(localStorage.getItem('onemarket_theme') === 'light');


// 2. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
function switchTab(tabName) {
    triggerHaptic();
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeBtn = document.getElementById('nav-' + tabName);
    if (activeBtn) activeBtn.classList.add('active');

    const shopContent = document.getElementById('shop-content');
    const rouletteContent = document.getElementById('roulette-content');

    if (tabName === 'shop') {
        shopContent.style.display = 'block';
        rouletteContent.style.display = 'none';
        renderProducts();
    } else if (tabName === 'roulette') {
        shopContent.style.display = 'none';
        rouletteContent.style.display = 'block';
    }
}


// 3. ЛОГИКА КОЛЕСА ФОРТУНЫ
let currentRotation = 0;
let isSpinning = false;

// Сектора по 60 градусов (по часовой стрелке от 0 до 360)
const sectors = [
    { label: 'Скидка 10% 🎉', win: true },   // 0 - 60 deg
    { label: 'Пусто 😔', win: false },       // 60 - 120 deg
    { label: '15 Звёзд ⭐️', win: true },     // 120 - 180 deg
    { label: 'Пусто 😔', win: false },       // 180 - 240 deg
    { label: 'Скидка 25% 🔥', win: true },   // 240 - 300 deg
    { label: 'Пусто 😔', win: false }        // 300 - 360 deg
];

function spinWheel() {
    if (isSpinning) return;
    isSpinning = true;
    triggerHaptic('medium');

    const wheel = document.getElementById('fortuneWheel');
    const spinBtn = document.getElementById('spinBtn');
    const resultText = document.getElementById('wheelResult');

    spinBtn.disabled = true;
    resultText.innerText = 'Крутим...';

    // Случайный угол (от 5 до 8 полных оборотов + случайный сектор)
    const extraSpins = (Math.floor(Math.random() * 4) + 5) * 360;
    const randomDegree = Math.floor(Math.random() * 360);
    currentRotation += extraSpins + randomDegree;

    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        isSpinning = false;
        spinBtn.disabled = false;

        // Вычисляем, какой сектор оказался наверху под стрелкой
        const normalizedDeg = (360 - (currentRotation % 360)) % 360;
        const sectorIndex = Math.floor(normalizedDeg / 60);
        const prize = sectors[sectorIndex];

        resultText.innerText = `Результат: ${prize.label}`;
        if (prize.win) {
            triggerHaptic('heavy');
            if (tg && tg.showAlert) {
                tg.showAlert(`Поздравляем! Вы выиграли: ${prize.label}`);
            }
        }
    }, 4100); // Длительность совпадает с transition в CSS (4s)
}


// 4. КАТАЛОГ МАГАЗИНА
const products = [
    { id: 'stars_50', name: '50 Звёзд ⭐️', price: 18, type: 'stars' },
    { id: 'stars_75', name: '75 Звёзд ⭐️', price: 27, type: 'stars' },
    { id: 'stars_100', name: '100 Звёзд ⭐️', price: 35, type: 'stars' },
    { id: 'stars_150', name: '150 Звёзд ⭐️', price: 52, type: 'stars' },
    { id: 'stars_250', name: '250 Звёзд ⭐️', price: 87, type: 'stars' },
    { id: 'stars_300', name: '300 Звёзд ⭐️', price: 104, type: 'stars' },
    { id: 'stars_500', name: '500 Звёзд ⭐️', price: 165, type: 'stars' },

    { id: 'prem_1', name: 'Premium 1 мес. (с заходом)', price: 75, type: 'premium' },
    { id: 'prem_3', name: 'Premium 3 мес.', price: 230, type: 'premium' },
    { id: 'prem_6', name: 'Premium 6 мес.', price: 320, type: 'premium' },
    { id: 'prem_12', name: 'Premium 12 мес.', price: 500, type: 'premium' },

    { id: 'steam_1', name: 'Пополнение Steam $1', price: 21, type: 'steam' },
    { id: 'steam_5', name: 'Пополнение Steam $5', price: 100, type: 'steam' },
    { id: 'steam_10', name: 'Пополнение Steam $10', price: 190, type: 'steam' },
];

let cart = {};
let currentCategory = 'all';

function filterCategory(category, btnElement) {
    triggerHaptic();
    currentCategory = category;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    renderProducts();
}

function handleSearch() {
    renderProducts();
}

function renderProducts() {
    const searchInput = document.getElementById('searchInput');
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const premContainer = document.getElementById('premium-grid');
    const starsContainer = document.getElementById('stars-grid');
    const steamContainer = document.getElementById('steam-grid');

    if (!premContainer) return;

    premContainer.innerHTML = '';
    starsContainer.innerHTML = '';
    steamContainer.innerHTML = '';

    let premCount = 0, starsCount = 0, steamCount = 0;

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

            if (p.type === 'premium') { premContainer.appendChild(card); premCount++; }
            else if (p.type === 'stars') { starsContainer.appendChild(card); starsCount++; }
            else if (p.type === 'steam') { steamContainer.appendChild(card); steamCount++; }
        }
    });

    document.getElementById('premium-section').style.display = (premCount > 0) ? 'block' : 'none';
    document.getElementById('stars-section').style.display = (starsCount > 0) ? 'block' : 'none';
    document.getElementById('steam-section').style.display = (steamCount > 0) ? 'block' : 'none';
    document.getElementById('no-results').style.display = (premCount === 0 && starsCount === 0 && steamCount === 0) ? 'block' : 'none';
}

function addToCart(id) {
    triggerHaptic();
    if (cart[id]) cart[id].count += 1;
    else cart[id] = { ...products.find(p => p.id === id), count: 1 };
    updateCartUI();
}

function changeQty(id, delta) {
    triggerHaptic();
    if (!cart[id]) return;
    cart[id].count += delta;
    if (cart[id].count <= 0) delete cart[id];
    updateCartUI();
}

function updateCartUI() {
    let totalPrice = 0, totalCount = 0;
    const cartSection = document.getElementById('cart-section');
    const cartContainer = document.getElementById('cart-items-container');
    if (!cartContainer) return;

    cartContainer.innerHTML = '';
    const items = Object.values(cart);
    cartSection.style.display = items.length > 0 ? 'block' : 'none';

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

const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        triggerHaptic();
        const items = Object.values(cart);
        if (items.length === 0) {
            if (tg && tg.showAlert) tg.showAlert("Ваша корзина пуста!");
            return;
        }
        let totalPrice = items.reduce((sum, item) => sum + item.price * item.count, 0);
        if (tg) {
            tg.sendData(JSON.stringify({
                items: items.map(i => ({ name: i.name, count: i.count, price: i.price })),
                totalPrice: totalPrice
            }));
        }
    });
}


// 5. СКРИМЕР КОНЯ
document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector('.header');
    if (header) {
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
        modal.style.cssText = "display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 100000; justify-content: center; align-items: center;";
        modal.innerHTML = `
            <img src="horse.jpg" onerror="this.src='IMAGE 2026-11-21 23:09:51.jpg'" style="max-width: 90%; max-height: 90%; border-radius: 12px;">
        `;
        document.body.appendChild(modal);

        screamerBtn.addEventListener('click', () => {
            triggerHaptic('heavy');
            modal.style.display = 'flex';
            audio.currentTime = 0;
            audio.play().catch(() => {});
            setTimeout(() => { modal.style.display = 'none'; }, 3500);
        });

        modal.addEventListener('click', () => { modal.style.display = 'none'; });
    }

    renderProducts();
});
