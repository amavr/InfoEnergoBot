const DB = require('./helpers/db');
const bot = require('./bot');

const db = new DB();

bot.launch();

