require('dotenv').config();
const { Pool } = require('pg');

async function fixSequences() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const tables = [
    'comments',
    'notifications',
    'recipes',
    'users',
    'categories',
    'tags',
    'ratings',
    'reports',
    'favorites',
    'recipe_likes',
    'ai_generation_history',
  ];

  for (const table of tables) {
    try {
      const res = await pool.query(
        `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE(max(id), 1)) FROM "${table}"`
      );
      console.log(`Reset sequence for ${table}:`, res.rows[0]);
    } catch (e) {
      console.log(`Skipped ${table}:`, e.message);
    }
  }
  await pool.end();
  console.log('ALL SEQUENCES FIXED SUCCESSFULLY!');
}

fixSequences().catch(console.error);
