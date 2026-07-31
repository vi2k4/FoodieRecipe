const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/foodierecipe?schema=public' });

async function run() {
  const res = await pool.query(
    INSERT INTO "User" (username, email, password, role, created_at, updated_at) VALUES 
    ('user_jul_16_a', 'jula@test.com', 'pwd', 'USER', '2026-07-16 10:00:00', '2026-07-16 10:00:00'),
    ('user_jul_16_b', 'julb@test.com', 'pwd', 'USER', '2026-07-16 11:00:00', '2026-07-16 11:00:00'),
    ('user_jul_16_c', 'julc@test.com', 'pwd', 'USER', '2026-07-16 12:00:00', '2026-07-16 12:00:00')
    RETURNING id;
  );
  
  const userIds = res.rows.map(r => r.id);
  console.log('Inserted users:', userIds);

  await pool.query(
    INSERT INTO "Report" (recipe_id, reporter_id, reason, description, status, created_at) VALUES 
    (1, , 'Spam', 'N?i dung rác', 'PENDING', NOW()),
    (2, , 'Sai thông tin', 'Sai l?ch', 'PENDING', NOW()),
    (3, , 'Hình ?nh x?u', 'Hình ?nh k phù h?p', 'PENDING', NOW())
  , [userIds[0], userIds[1], userIds[2]]);
  console.log('Inserted reports');
}
run().catch(console.error).finally(() => pool.end());
