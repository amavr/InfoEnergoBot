const cfg = require('../config/cfg.json');
const { Telegraf } = require('telegraf');

const bot = new Telegraf(cfg.botToken);

bot.start(async (ctx) => {
    const words = ctx.message.text.split(' ');
    if (words.length > 1) {
        if (bot.onStart) {
            await bot.onStart(words[1].toUpperCase(), ctx.message.chat.id, ctx.message.from.username);
            await bot.telegram.sendMessage(ctx.message.chat.id, `Код "${words[1]}" добавлен в чат "${ctx.message.chat.title}"`);
        }
    }
});

bot.on('text', async (ctx) => {
    const words = ctx.message.text.split(' ');
    if (words.length > 1) {
        if (words[0] === '/stop') {
            if (bot.onStop) {
                await bot.onStop(words[1].toUpperCase(), ctx.message.chat.id);
                await bot.telegram.sendMessage(ctx.message.chat.id, `Код "${words[1]}" удален из чата "${ctx.message.chat.title}"`);
            }
        }
    }
})

module.exports = bot;