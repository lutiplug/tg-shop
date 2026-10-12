import asyncio
import logging
import json
from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import CommandStart

TOKEN = "8791410538:AAEaGwZSR6O6mzoPxglRXF4vcECHTn4EcXY"

bot = Bot(token=TOKEN)
dp = Dispatcher()

@dp.message(CommandStart())
async def cmd_start(message: types.Message):
    # Важно: sendData работает ТОЛЬКО с обычной кнопкой клавиатуры (web_app), 
    # а не с Inline-кнопкой!
    kb = types.ReplyKeyboardMarkup(
        keyboard=[
            [
                types.KeyboardButton(
                    text="Открыть магазин",
                    web_app=types.WebAppInfo(url="https://lutiplug.github.io/tg-shop/")
                )
            ]
        ],
        resize_keyboard=True
    )
    await message.answer("Добро пожаловать! Нажмите кнопку ниже:", reply_markup=kb)

# Хэндлер получения данных из Mini App
@dp.message(F.web_app_data)
async def handle_web_app_data(message: types.Message):
    data = json.loads(message.web_app_data.data)
    logging.info(f"Получены данные из WebApp: {data}")
    
    await message.answer(
        f"✅ Заказ успешно получен!\n\n"
        f"Товар: {data.get('item')}\n"
        f"Цена: {data.get('price')} руб."
    )

async def main():
    logging.basicConfig(level=logging.INFO)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
