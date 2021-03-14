const oracledb = require('oracledb');
const cfg = require('../config');

module.exports = class DB {

    constructor() {
        oracledb.extendedMetaData = true;
        this.databases = cfg.databases;
        this.options.connectString = this.options.cs.join('\n');
        this.pools = {};
    }

    async init() {
        for(const [key, val] of Object.entries(cfg.databases)){
            val.hrPool.cs = val.hrPool.cs.join('\n');
            this.pools[key] = await oracledb.createPool(val.hrPool);
            log.info(`DB ready ${key}`);
        }
    }

    async getConnection(dbname) {
        return await this.pools[dbname].getConnection();
    }

    async close(dbcon) {
        if (dbcon) {
            try {
                await dbcon.close();
            }
            catch (ex) {
                return ex.message;
            }
        }
        return null;
    }
}