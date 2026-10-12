let tg = window.Telegram.WebApp;

// Разворачиваем окно на всю высоту
tg.expand();

document.getElementById("sendDataBtn").addEventListener("click", function () {
    let data = {
        item: "Тестовый товар",
        price: 500,
        status: "success"
    };

    // Отправляем данные обратно в бот (сработает при открытии через KeyboardButton)
    tg.sendData(JSON.stringify(data));
});
