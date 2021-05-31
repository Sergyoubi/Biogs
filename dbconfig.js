
const Pool = require('pg').Pool;

const pool = new Pool({
  user: process.env.USER || 'hoby',
  password: process.env.PASSWORD || 'sergyoubi',
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 5432,
  database: process.env.DATABASE || 'biogs'
});

module.exports = pool;





