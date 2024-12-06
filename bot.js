const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv')
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const bot_token =  process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(bot_token, { polling: true });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_TOKEN);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  const result = await model.generateContent(messageText);
  const response = await result.response;
  bot.sendMessage(chatId, response.text())

});
