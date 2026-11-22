let tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// ==========================================
// 1. ПЕРЕКЛЮЧЕНИЕ ТЕМЫ (ДЕНЬ / НОЧЬ)
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

const savedTheme = localStorage.getItem('onemarket_theme');
applyTheme(savedTheme === 'light');


// ==========================================
// 2. ДАННЫЕ И КАТАЛОГ МАГАЗИНА
// ==========================================
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

function triggerHaptic() {
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

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
    const searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();

    const premContainer = document.getElementById('premium-grid');
    const starsContainer = document.getElementById('stars-grid');
    const steamContainer = document.getElementById('steam-grid');

    const premSection = document.getElementById('premium-section');
    const starsSection = document.getElementById('stars-section');
    const steamSection = document.getElementById('steam-section');
    const noResults = document.getElementById('no-results');

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

    premSection.style.display = premCount > 0 ? 'block' : 'none';
    starsSection.style.display = starsCount > 0 ? 'block' : 'none';
    steamSection.style.display = steamCount > 0 ? 'block' : 'none';
    noResults.style.display = (premCount === 0 && starsCount === 0 && steamCount === 0) ? 'block' : 'none';
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
            tg.showAlert("Ваша корзина пуста!");
            return;
        }
        let totalPrice = items.reduce((sum, item) => sum + item.price * item.count, 0);
        tg.sendData(JSON.stringify({
            items: items.map(i => ({ name: i.name, count: i.count, price: i.price })),
            totalPrice: totalPrice
        }));
    });
}


// ==========================================
// 3. НИЖНЯЯ НАВИГАЦИЯ (МАГАЗИН / ИГРЫ / ЛУДКА)
// ==========================================
function switchTab(tabName, btnElement) {
    triggerHaptic();
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    const shopContent = document.getElementById('shop-content');
    const gamesContent = document.getElementById('games-content');
    const rouletteContent = document.getElementById('roulette-content');

    if (shopContent) shopContent.style.display = 'none';
    if (gamesContent) { gamesContent.style.display = 'none'; stopFlappyBird(); }
    if (rouletteContent) rouletteContent.style.display = 'none';

    if (tabName === 'shop') {
        if (shopContent) shopContent.style.display = 'block';
        renderProducts();
    } else if (tabName === 'games') {
        if (gamesContent) {
            gamesContent.style.display = 'block';
            startFlappyBird();
        }
    } else if (tabName === 'roulette') {
        if (rouletteContent) rouletteContent.style.display = 'block';
    }
}


// ==========================================
// 4. ИГРА FLAPPY BIRD
// ==========================================
let fbInterval = null;
let bird = { x: 50, y: 150, gravity: 0.5, lift: -8, velocity: 0, radius: 14 };
let pipes = [];
let score = 0;
let isGameOver = false;

function startFlappyBird() {
    const container = document.getElementById('games-content');
    if (!container) return;

    container.innerHTML = `
        <div style="text-align: center; padding-top: 10px;">
            <h3 style="margin: 0 0 10px 0;">🎮 Flappy Bird</h3>
            <p style="font-size: 12px; color: var(--hint-color); margin-bottom: 15px;">Тапай по экрану, чтобы лететь!</p>
            <div style="position: relative; width: 300px; height: 400px; margin: 0 auto; border-radius: 16px; overflow: hidden; border: 2px solid var(--border-color); background: #1a1a1a;">
                <canvas id="flappyCanvas" width="300" height="400" style="display: block; cursor: pointer;"></canvas>
                <div id="fbScore" style="position: absolute; top: 15px; left: 0; right: 0; font-size: 28px; font-weight: 800; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">0</div>
            </div>
        </div>
    `;

    const canvas = document.getElementById('flappyCanvas');
    const ctx = canvas.getContext('2d');

    bird = { x: 50, y: 150, gravity: 0.5, lift: -8, velocity: 0, radius: 14 };
    pipes = [];
    score = 0;
    isGameOver = false;

    function addPipe() {
        let gap = 120;
        let topHeight = Math.floor(Math.random() * (canvas.height - gap - 120)) + 40;
        pipes.push({ x: canvas.width, top: topHeight, bottom: canvas.height - topHeight - gap, width: 50, passed: false });
    }

    canvas.addEventListener('click', () => {
        triggerHaptic();
        if (isGameOver) {
            bird = { x: 50, y: 150, gravity: 0.5, lift: -8, velocity: 0, radius: 14 };
            pipes = [];
            score = 0;
            isGameOver = false;
        } else {
            bird.velocity = bird.lift;
        }
    });

    let frameCount = 0;
    fbInterval = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (frameCount % 90 === 0) {
            addPipe();
        }

        ctx.fillStyle = '#22c55e';
        pipes.forEach(pipe => {
            pipe.x -= 2.5;

            ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
            ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);

            if (!pipe.passed && pipe.x + pipe.width < bird.x) {
                score++;
                pipe.passed = true;
                const scoreEl = document.getElementById('fbScore');
                if (scoreEl) scoreEl.innerText = score;
            }

            if (
                bird.x + bird.radius > pipe.x && 
                bird.x - bird.radius < pipe.x + pipe.width && 
                (bird.y - bird.radius < pipe.top || bird.y + bird.radius > canvas.height - pipe.bottom)
            ) {
                isGameOver = true;
            }
        });

        pipes = pipes.filter(p => p.x + p.width > 0);

        if (bird.y + bird.radius >= canvas.height || bird.y - bird.radius <= 0) {
            isGameOver = true;
        }

        if (isGameOver) {
            clearInterval(fbInterval);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('ИГРА ОКОНЧЕНА', canvas.width / 2, canvas.height / 2 - 15);
            ctx.font = '14px sans-serif';
            ctx.fillText('Тапни, чтобы начать заново', canvas.width / 2, canvas.height / 2 + 20);
        }

        frameCount++;
    }, 1000 / 60);
}

function stopFlappyBird() {
    if (fbInterval) {
        clearInterval(fbInterval);
        fbInterval = null;
    }
}


// ==========================================
// 5. СКРИМЕР КОНЯ
// ==========================================
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
        modal.style.cssText = "display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 9999; justify-content: center; align-items: center;";
        modal.innerHTML = `
            <img src="IMAGE 2026-11-21 23:09:51.jpg" style="max-width: 90%; max-height: 90%; border-radius: 12px;">
        `;
        document.body.appendChild(modal);

        screamerBtn.addEventListener('click', () => {
            triggerHaptic();
            modal.style.display = 'flex';
            audio.currentTime = 0;
            audio.play().catch(err => console.log("Звук заблокирован:", err));
            setTimeout(() => { modal.style.display = 'none'; }, 3500);
        });

        modal.addEventListener('click', () => { modal.style.display = 'none'; });
    }

    renderProducts();
});
