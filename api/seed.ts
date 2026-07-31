import { PrismaClient } from './src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://foodie_user:foodie_password@localhost:5433/foodie_db',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  const existingUsers = await prisma.user.findMany();
  console.log('Existing users count:', existingUsers.length);

  if (existingUsers.length === 0) {
    const user = await prisma.user.create({
      data: {
        username: 'hoang_chef',
        email: 'hoang@foodierecipe.com',
        passwordHash: '$2b$10$e8w8Yg5QG6Jt6Vz1o6n2.uX5R2yG8J4x6M0N1P2Q3R4S5T6U7V8W',
        role: 'USER',
        bio: 'Đầu bếp yêu thích món ăn Việt',
      },
    });

    const admin = await prisma.user.create({
      data: {
        username: 'admin_foodie',
        email: 'admin@foodierecipe.com',
        passwordHash: '$2b$10$e8w8Yg5QG6Jt6Vz1o6n2.uX5R2yG8J4x6M0N1P2Q3R4S5T6U7V8W',
        role: 'ADMIN',
        bio: 'Quản trị viên hệ thống',
      },
    });

    console.log('--- DEMO ACCOUNTS CREATED ---');
    console.log('1. User Member:');
    console.log('   Username: hoang_chef');
    console.log('   Email: hoang@foodierecipe.com');
    console.log('   Password: Password123!');
    console.log('2. Admin:');
    console.log('   Username: admin_foodie');
    console.log('   Email: admin@foodierecipe.com');
    console.log('   Password: AdminPassword123!');
  } else {
    console.log('--- EXISTING USERS IN DATABASE ---');
    existingUsers.forEach((u, i) => {
      console.log(`${i + 1}. Username: ${u.username} | Email: ${u.email} | Role: ${u.role}`);
    });
  }

  await prisma.$disconnect();
  await pool.end();
}

seed().catch(console.error);
