let tg = window.Telegram.WebApp;
tg.expand();

// Список товаров
const products = [
    // Telegram Premium
    { id: 'prem_1', name: 'Premium 1 мес.', price: 75, type: 'premium' },
    { id: 'prem_3', name: 'Premium 3 мес.', price: 230, type: 'premium' },
    { id: 'prem_6', name: 'Premium 6 мес.', price: 320, type: 'premium' },
    { id: 'prem_12', name: 'Premium 12 мес.', price: 500, type: 'premium' },

    // Telegram Stars
    { id: 'stars_50', name: '50 Stars', price: 18, type: 'stars' },
    { id: 'stars_100', name: '100 Stars', price: 35, type: 'stars' },
    { id: 'stars_250', name: '250 Stars', price: 87, type: 'stars' },
    { id: 'stars_500', name: '500 Stars', price: 165, type: 'stars' },
];

let cart = {};

// Рендеринг карточек
function renderProducts() {
    const premContainer = document.getElementById('premium-grid');
    const starsContainer = document.getElementById('stars-grid');

    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-title">${p.name}</div>
            <div class="card-price">${p.price} ₽</div>
            <button class="btn-add" onclick="addToCart('${p.id}')">Добавить</button>
        `;

        if (p.type === 'premium') {
            premContainer.appendChild(card);
        } else {
            starsContainer.appendChild(card);
        }
    });
}

// Добавление в корзину
function addToCart(id) {
    if (cart[id]) {
        cart[id].count += 1;
    } else {
        const product = products.find(p => p.id === id);
        cart[id] = { ...product, count: 1 };
    }
    updateCartUI();
}

// Обновление отображения корзины
function updateCartUI() {
    let totalPrice = 0;
    let totalCount = 0;

    Object.values(cart).forEach(item => {
        totalPrice += item.price * item.count;
        totalCount += item.count;
    });

    document.getElementById('total-price').innerText = `${totalPrice} ₽`;
    document.getElementById('total-count').innerText = `Товаров: ${totalCount}`;
}

// Отправка заказа в бот
document.getElementById('checkoutBtn').addEventListener('click', () => {
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

renderProducts();
