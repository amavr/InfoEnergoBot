const cfg = require('./cfg.json');

for(const [key, val] of Object.entries(cfg.databases)){
    val.hrPool.connectString = val.hrPool.cs.join('\n');
}

module.exports = cfg;