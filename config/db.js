const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL via DATABASE_URL!'))
  .catch((err) => console.error('❌ DB connection error:', err));

module.exports = pool;
