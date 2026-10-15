import asyncio
import logging
import json
import random
from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import CommandStart
from aiogram.utils.keyboard import InlineKeyboardBuilder

TOKEN = "8791410538:AAEaGwZSR6O6mzoPxglRXF4vcECHTn4EcXY"
ADMIN_ID = 8601986783  # Ваш ID

logging.basicConfig(level=logging.INFO)

bot = Bot(token=TOKEN)
dp = Dispatcher()

@dp.message(CommandStart())
async def cmd_start(message: types.Message):
    kb = types.ReplyKeyboardMarkup(
        keyboard=[
            [
                types.KeyboardButton(
                    text="🛒 Открыть магазин",
                    web_app=types.WebAppInfo(url="https://lutiplug.github.io/tg-shop/")
                )
            ]
        ],
        resize_keyboard=True
    )
    await message.answer("Добро пожаловать в OneMarket! Нажмите кнопку ниже для покупок:", reply_markup=kb)

@dp.message(F.web_app_data)
async def handle_web_app_data(message: types.Message):
    try:
        data = json.loads(message.web_app_data.data)
        items = data.get("items", [])
        total_price = data.get("totalPrice", 0)

        user = message.from_user
        user_info = f"@{user.username}" if user.username else f"{user.first_name}"
        order_id = random.randint(1000, 9999)  # Генерируем короткий номер заказа

        order_details = "\n".join([f"• {item['name']} x{item['count']} — {item['price'] * item['count']} ₽" for item in items])

        # 1. Отправляем уведомление администратору с кнопками управления
        builder = InlineKeyboardBuilder()
        builder.row(
            types.InlineKeyboardButton(text="✅ Выполнен", callback_data=f"status_done_{user.id}_{order_id}"),
            types.InlineKeyboardButton(text="❌ Отменен", callback_data=f"status_cancel_{user.id}_{order_id}")
        )
        if user.username:
            builder.row(types.InlineKeyboardButton(text="💬 Написать клиенту", url=f"https://t.me/{user.username}"))

        admin_message = (
            f"🚨 **Новый заказ #{order_id}!**\n\n"
            f"👤 **Покупатель:** {user_info}\n"
            f"🆔 **ID:** `{user.id}`\n\n"
            f"📦 **Товары:**\n{order_details}\n\n"
            f"💰 **Сумма:** {total_price} ₽\n"
            f"📌 **Статус:** ⏳ В обработке"
        )
        await bot.send_message(chat_id=ADMIN_ID, text=admin_message, reply_markup=builder.as_markup(), parse_mode="Markdown")

        # 2. Подтверждение клиенту
        try:
            await message.answer(
                f"✅ **Заказ #{order_id} оформлен!**\n\n"
                f"Состав заказа:\n{order_details}\n\n"
                f"Итого к оплате: {total_price} ₽\n\n"
                f"Менеджер свяжется с вами для выдачи товара.",
                parse_mode="Markdown"
            )
        except Exception as client_err:
            logging.warning(f"Не удалось отправить сообщение клиенту: {client_err}")

    except Exception as e:
        logging.error(f"Ошибка обработки заказа: {e}")

# Обработка нажатия кнопки "Выполнен"
@dp.callback_query(F.data.startswith("status_done_"))
async def order_done(callback: types.CallbackQuery):
    _, _, user_id, order_id = callback.data.split("_")
    
    # Обновляем текст чека у админа
    updated_text = callback.message.text.replace("📌 Статус: ⏳ В обработке", "📌 Статус: ✅ Выполнен")
    await callback.message.edit_text(updated_text)

    # Оповещаем клиента
    try:
        await bot.send_message(
            chat_id=int(user_id),
            text=f"🎉 **Ваш заказ #{order_id} успешно выполнен!**\nСпасибо за покупку в OneMarket!"
        )
    except Exception:
        pass
    
    await callback.answer("Заказ помечен как выполнен!")

# Обработка нажатия кнопки "Отменен"
@dp.callback_query(F.data.startswith("status_cancel_"))
async def order_cancel(callback: types.CallbackQuery):
    _, _, user_id, order_id = callback.data.split("_")
    
    # Обновляем текст чека у админа
    updated_text = callback.message.text.replace("📌 Статус: ⏳ В обработке", "📌 Статус: ❌ Отменен")
    await callback.message.edit_text(updated_text)

    # Оповещаем клиента
    try:
        await bot.send_message(
            chat_id=int(user_id),
            text=f"❌ **Ваш заказ #{order_id} был отменен.**\nОбратитесь в поддержку для уточнения деталей."
        )
    except Exception:
        pass
    
    await callback.answer("Заказ отменен!")

async def main():
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
