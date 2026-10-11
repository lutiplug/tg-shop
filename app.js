// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// 📌 ВСЕ ТОВАРЫ И ЦЕНЫ НАХОДЯТСЯ ЗДЕСЬ. Вы можете легко их изменять, добавлять или удалять!
const PRODUCTS = [
    { id: 1, name: "Telegram Premium (1 месяц)", price: 75, description: "Официальная подписка на месяц" },
    { id: 2, name: "Telegram Premium (1 год)", price: 500, description: "Выгодная подписка на 12 месяцев" },
    { id: 3, name: "50 Telegram Stars (Звезды)", price: 18, description: "Для донатов и каналов" },
    { id: 4, name: "100 Telegram Stars (Звезды)", price: 35, description: "Популярный выбор" },
    { id: 5, name: "500 Telegram Stars (Звезды)", price: 165, description: "Большой пакет звезд" }
];

// Объект корзины (хранит id товара и его количество)
let cart = {};

// Рендерим карточки товаров на странице
function renderProducts() {
    const container = document.getElementById("products-container");
    container.innerHTML = "";

    PRODUCTS.forEach(product => {
        const qty = cart[product.id] || 0;
        
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p style="font-weight: bold; margin-top: 4px;">${product.price} руб.</p>
            </div>
            <div class="product-action">
                ${qty > 0 ? `
                    <button class="btn-add" onclick="changeQty(${product.id}, -1)">-</button>
                    <span style="font-weight: bold;">${qty}</span>
                    <button class="btn-add" onclick="changeQty(${product.id}, 1)">+</button>
                ` : `
                    <button class="btn-add" onclick="changeQty(${product.id}, 1)">В корзину</button>
                `}
            </div>
        `;
        container.appendChild(card);
    });

    updateCartUI();
}

// Изменение количества товара в корзине
function changeQty(productId, delta) {
    if (!cart[productId]) {
        cart[productId] = 0;
    }
    cart[productId] += delta;
    
    if (cart[productId] <= 0) {
        delete cart[productId];
    }
    
    renderProducts();
}

// Обновление нижней панели корзины
function updateCartUI() {
    const cartInfo = document.getElementById("cart-info");
    const checkoutBtn = document.getElementById("checkout-btn");

    let totalItems = 0;
    let totalPrice = 0;

    for (let id in cart) {
        const product = PRODUCTS.find(p => p.id == id);
        if (product) {
            totalItems += cart[id];
            totalPrice += product.price * cart[id];
        }
    }

    if (totalItems > 0) {
        cartInfo.innerHTML = `Товаров: ${totalItems} | <b>Итого: ${totalPrice} руб.</b>`;
        checkoutBtn.disabled = false;
    } else {
        cartInfo.innerHTML = "Корзина пуста";
        checkoutBtn.disabled = true;
    }
}

// Оформление заказа и отправка боту
function checkout() {
    let orderItems = [];
    let totalPrice = 0;

    for (let id in cart) {
        const product = PRODUCTS.find(p => p.id == id);
        if (product) {
            orderItems.push({
                name: product.name,
                price: product.price,
                qty: cart[id]
            });
            totalPrice += product.price * cart[id];
        }
    }

    const orderData = {
        items: orderItems,
        totalPrice: totalPrice
    };

    // Отправляем данные боту и закрываем приложение
    tg.sendData(JSON.stringify(orderData));
    tg.close();
}

// Запускаем отрисовку при загрузке
renderProducts();
