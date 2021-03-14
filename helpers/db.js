const oracledb = require('oracledb');
const cfg = require('../config');

module.exports = class DB {

    constructor() {
        oracledb.extendedMetaData = true;
        this.databases = cfg.databases;
        this.pools = {};
    }

    async init() {
        for(const [key, val] of Object.entries(this.databases)){
            this.pools[key] = await oracledb.createPool(val.hrPool);
            console.info(`DB ready ${key}`);
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
                console.error(ex.message);
            }
        }
    }

    async commit(dbcon) {
        if(dbcon){
            try{
                await dbcon.commit();
            }
            catch(ex){
                console.error(ex.message);
            }
        }
    }

    async rollback(dbcon) {
        if(dbcon){
            try{
                await dbcon.rollback();
            }
            catch(ex){
                console.error(ex.message);
            }
        }
    }

    async checkDatabase(dbname){
        const res  = [];
        const answer = await this.checkMsg(dbname);
        if(answer.success){
            return answer.rows;
        }
        else{
            console.log(answer.error);
        }
        return [];
    }

    async loadNotifications(){
        let res = [];
        for(const [key, val] of Object.entries(this.databases)){
            const db_res = await this.checkDatabase(key);
            res = [...res, ...db_res];
            console.info(`DB ${key} checked`);
        }
        return res;
    }

    async addKeyGroup(key, grp, username){
        const sql = 'INSERT INTO TLG_GROUP_KEYS(key, chat_id, username) VALUES(:key, :grp, :username)';
        for(const [dbname, val] of Object.entries(this.databases)){
            await this.execSql(dbname, sql, [key, grp, username]);
            console.info(`Save ${key}:${grp}:${username} to DB ${dbname} successfull`);
        }
    }

    async delKeyGroup(key, grp){
        const sql = 'DELETE FROM TLG_GROUP_KEYS WHERE key = :key and chat_id = :grp';
        for(const [dbname, val] of Object.entries(this.databases)){
            await this.execSql(dbname, sql, [key, grp]);
        }
    }

    async checkMsg(dbname) {
        const res = {
            success: false,
            error: null,
            rows: null
        };

        const sql = 'SELECT K.CHAT_ID, M.MSG FROM TLG_GROUP_KEYS k, TLG_MSG m WHERE K.key = upper(M.key)';

        const dbcon = await this.getConnection(dbname);
        try {
            let result = await dbcon.execute(sql, [], { autoCommit: false, outFormat: oracledb.OBJECT });
            res.rows = result.rows;

            result = await dbcon.execute('DELETE FROM TLG_MSG', [], { autoCommit: true, outFormat: oracledb.OBJECT });

            res.success = true;
        } catch (ex) {
            res.error = ex.message;

        } finally {
            await this.close(dbcon);
        }
        return res;
    }

    async execSql(dbname, sql, binds) {
        const res = {
            success: false,
            error: null,
            rows: null,
            rowsAffected: 0
        };

        const dbcon = await this.getConnection(dbname);
        try {
            if(binds === undefined) binds = [];
            const result = await dbcon.execute(sql, binds, { autoCommit: true, outFormat: oracledb.OBJECT });
            res.rows = result.rows;
            res.rowsAffected = result.rowsAffected;
            res.success = true;
        } catch (ex) {
            res.error = ex.message;
        } finally {
            await this.close(dbcon);
        }
        return res;
    }

}