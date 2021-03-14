const DB = require('./helpers/db');
const bot = require('./bot');
const { context } = require('./bot');

const db = new DB();
setImmediate(() => { db.init(); });

bot.onStart = onStart;
bot.onStop = onStop;

bot.launch();

setInterval(onTime, 12000);

async function onTime() {
	const ntf_list = await db.loadNotifications();
	if (ntf_list.length > 0) {
		for (const ntf of ntf_list) {
			await bot.telegram.sendMessage(ntf.CHAT_ID, ntf.MSG);
		}
	}
}

async function onStart(key, grp, username) {
	await db.addKeyGroup(key, grp, username);
}

async function onStop(key, grp) {
	await db.delKeyGroup(key, grp);
}
