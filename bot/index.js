const cfg = require('../config/cfg.json');
const { Telegraf } = require('telegraf');

const bot = new Telegraf(cfg.botToken);

bot.start((ctx) => {
    ctx.reply('Welcome')
});

bot.hears('/stop', (ctx) => ctx.reply('Bye'))

module.exports = bot;