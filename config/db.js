// backend/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool config
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'ancientyoga',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Optional: Test the DB connection once at startup
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL!'))
  .catch(err => console.error('❌ DB connection error:', err));

module.exports = pool;
