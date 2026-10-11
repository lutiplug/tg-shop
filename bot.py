import asyncio
import json
from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import CommandStart
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton

# 1. ЗАМЕНИТЕ ЭТУ СТРОКУ на ваш токен от BotFather (в кавычках)
TOKEN = "8791410538:AAEaGwZSR6O6mzoPxglRXF4vcECHTn4EcXY"

# 2. ЗАМЕНИТЕ ЭТО ЧИСЛО на ваш числовой Telegram ID (без кавычек!)
ADMIN_ID = 6592791153  

bot = Bot(token=TOKEN)
dp = Dispatcher()
@dp.message()
async def debug_all_messages(message: types.Message):
    print(f"DEBUG: Получено сообщение. Текст: {message.text}, WebApp data: {message.web_app_data}")

@dp.message(CommandStart())
async def cmd_start(message: types.Message):
    # 3. Убедитесь, что здесь указана ваша актуальная ссылка на GitHub Pages
    web_app_url = "https://lutiplug.github.io/tg-shop/" 
    
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🛍 Открыть каталог", 
                    web_app=WebAppInfo(url=web_app_url)
                )
            ]
        ]
    )
    
    await message.answer(
        f"Привет, {message.from_user.first_name}! 👋\n\n"
        f"Добро пожаловать в наш магазин цифровых товаров.\n"
        f"Нажми на кнопку ниже, чтобы открыть каталог и сделать заказ!",
        reply_markup=keyboard
    )

# Обработка данных от Mini App после оформления заказа
@dp.message(F.web_app_data)
async def handle_web_app_data(message: types.Message):
    try:
        data = json.loads(message.web_app_data.data)
        
        user = message.from_user
        username = f"@{user.username}" if user.username else "без username"
        
        order_text = f"📦 **Новый заказ!**\n\n"
        order_text += f"👤 Покупатель: {user.full_name} ({username})\n"
        order_text += f"🆔 ID: `{user.id}`\n\n"
        order_text += "📋 **Состав заказа:**\n"
        
        for item in data.get("items", []):
            order_text += f"• {item['name']} x{item['qty']} — {item['price'] * item['qty']} руб.\n"
            
        order_text += f"\n💰 **Итого:** {data.get('totalPrice')} руб."

        # Отправляем админу
        await bot.send_message(chat_id=ADMIN_ID, text=order_text, parse_mode="Markdown")
        # Отвечаем покупателю
        await message.answer("Спасибо за заказ! Менеджер свяжется с вами в ближайшее время.")
    except Exception as e:
        print(f"Ошибка при обработке заказа: {e}")
        await message.answer("Произошла ошибка при обработке заказа. Попробуйте еще раз.")

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())