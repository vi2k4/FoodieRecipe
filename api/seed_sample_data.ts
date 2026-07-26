import { PrismaClient } from './src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://foodie_user:foodie_password@localhost:5433/foodie_db',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Bắt đầu khởi tạo dữ liệu mẫu (Seeding Database)...');

  // 1. Seed Categories (Danh mục)
  console.log('📦 Creating Categories...');
  const catMonNuoc = await prisma.recipeCategory.upsert({
    where: { name: 'Món nước' },
    update: {},
    create: { name: 'Món nước', description: 'Các món bún, phở, hủ tiếu, mì có nước dùng đậm đà', icon: '🍜' },
  });

  const catMonChinh = await prisma.recipeCategory.upsert({
    where: { name: 'Món chính' },
    update: {},
    create: { name: 'Món chính', description: 'Cơm, thịt, cá cho bữa ăn chính dinh dưỡng', icon: '🍲' },
  });

  const catAnSang = await prisma.recipeCategory.upsert({
    where: { name: 'Ăn sáng' },
    update: {},
    create: { name: 'Ăn sáng', description: 'Món ăn nhanh gọn, năng lượng cho buổi sáng', icon: '🍳' },
  });

  const catDiet = await prisma.recipeCategory.upsert({
    where: { name: 'Diet & Healthy' },
    update: {},
    create: { name: 'Diet & Healthy', description: 'Món ăn ít calo, giàu protein và chất xơ', icon: '🥗' },
  });

  const catDoUong = await prisma.recipeCategory.upsert({
    where: { name: 'Đồ uống & Tráng miệng' },
    update: {},
    create: { name: 'Đồ uống & Tráng miệng', description: 'Sinh tố, nước ép, món ngọt tráng miệng', icon: '🍹' },
  });

  // 2. Seed Tags
  console.log('🏷️ Creating Tags...');
  const tagViet = await prisma.tag.upsert({ where: { name: 'Món Việt' }, update: {}, create: { name: 'Món Việt' } });
  const tagDeLam = await prisma.tag.upsert({ where: { name: 'Dễ làm' }, update: {}, create: { name: 'Dễ làm' } });
  const tagNhanhGon = await prisma.tag.upsert({ where: { name: 'Nhanh gọn' }, update: {}, create: { name: 'Nhanh gọn' } });
  const tagKeto = await prisma.tag.upsert({ where: { name: 'Keto' }, update: {}, create: { name: 'Keto' } });

  // 3. Seed Users
  console.log('👥 Creating Users...');
  let user1 = await prisma.user.findFirst({ where: { username: 'hoang_chef' } });
  if (!user1) {
    user1 = await prisma.user.create({
      data: {
        username: 'hoang_chef',
        email: 'hoang@foodierecipe.com',
        passwordHash: '$2b$10$e8w8Yg5QG6Jt6Vz1o6n2.uX5R2yG8J4x6M0N1P2Q3R4S5T6U7V8W',
        role: 'USER',
        bio: 'Đầu bếp đam mê ẩm thực truyền thống Việt Nam',
      },
    });
  }

  let user2 = await prisma.user.findFirst({ where: { username: 'lan_anh_kitchen' } });
  if (!user2) {
    user2 = await prisma.user.create({
      data: {
        username: 'lan_anh_kitchen',
        email: 'lananh@foodierecipe.com',
        passwordHash: '$2b$10$e8w8Yg5QG6Jt6Vz1o6n2.uX5R2yG8J4x6M0N1P2Q3R4S5T6U7V8W',
        role: 'USER',
        bio: 'Đam mê làm bánh và pha chế đồ uống healthy',
      },
    });
  }

  let user3 = await prisma.user.findFirst({ where: { username: 'minh_tuan_fit' } });
  if (!user3) {
    user3 = await prisma.user.create({
      data: {
        username: 'minh_tuan_fit',
        email: 'minhtuan@foodierecipe.com',
        passwordHash: '$2b$10$e8w8Yg5QG6Jt6Vz1o6n2.uX5R2yG8J4x6M0N1P2Q3R4S5T6U7V8W',
        role: 'USER',
        bio: 'Chuyên gia dinh dưỡng & Eat Clean Gymmer',
      },
    });
  }

  let adminUser = await prisma.user.findFirst({ where: { username: 'admin_foodie' } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        username: 'admin_foodie',
        email: 'admin@foodierecipe.com',
        passwordHash: '$2b$10$e8w8Yg5QG6Jt6Vz1o6n2.uX5R2yG8J4x6M0N1P2Q3R4S5T6U7V8W',
        role: 'ADMIN',
        bio: 'Quản trị viên hệ thống FoodieRecipe',
      },
    });
  }

  // 4. Seed Recipes & Sub-resources
  console.log('🍲 Creating Sample Recipes...');

  // Recipe 1: Phở Bò Nam Định (User 1)
  const recipePho = await prisma.recipe.create({
    data: {
      userId: user1.id,
      categoryId: catMonNuoc.id,
      title: 'Phở Bò Truyền Thống Nam Định',
      description: 'Món phở bò đặc sản miền Bắc với nước dùng thơm mùi quế, hồi, gừng nướng và vị ngọt từ xương ống ninh kĩ.',
      calories: 450,
      cookTime: 120,
      difficulty: 'MEDIUM',
      servings: 4,
      thumbnail: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb431?auto=format&fit=crop&w=800&q=80',
      source: 'USER',
      isPublic: true,
    },
  });

  await prisma.recipeIngredient.createMany({
    data: [
      { id: BigInt(Date.now() + 1), recipeId: recipePho.id, ingredientName: 'Xương ống bò', quantity: 1, unit: 'kg', displayOrder: 1 },
      { id: BigInt(Date.now() + 2), recipeId: recipePho.id, ingredientName: 'Thịt thăn bò', quantity: 400, unit: 'g', displayOrder: 2 },
      { id: BigInt(Date.now() + 3), recipeId: recipePho.id, ingredientName: 'Bánh phở tươi', quantity: 1, unit: 'kg', displayOrder: 3 },
      { id: BigInt(Date.now() + 4), recipeId: recipePho.id, ingredientName: 'Hành tây & Gừng nướng', quantity: 2, unit: 'củ', displayOrder: 4 },
      { id: BigInt(Date.now() + 5), recipeId: recipePho.id, ingredientName: 'Quế, thảo quả, hoa hồi', quantity: 1, unit: 'gói', displayOrder: 5 },
    ],
  });

  await prisma.recipeStep.createMany({
    data: [
      { id: BigInt(Date.now() + 10), recipeId: recipePho.id, stepNumber: 1, content: 'Sơ chế xương ống bò, chần qua nước sôi rồi rửa sạch để loại bỏ mùi hôi.' },
      { id: BigInt(Date.now() + 11), recipeId: recipePho.id, stepNumber: 2, content: 'Nướng chín thơm hành tây và gừng. Rang sơ hoa hồi, thảo quả, quế cho dậy mùi.' },
      { id: BigInt(Date.now() + 12), recipeId: recipePho.id, stepNumber: 3, content: 'Cho xương bò, gừng, hành nướng và túi gia vị vào ninh nhỏ lửa trong 2-3 tiếng.' },
      { id: BigInt(Date.now() + 13), recipeId: recipePho.id, stepNumber: 4, content: 'Trần bánh phở, xếp thịt bò tái/chín lên trên, chan nước dùng đang sôi và thưởng thức.' },
    ],
  });

  await prisma.recipeTag.create({ data: { recipeId: recipePho.id, tagId: tagViet.id } });

  // Recipe 2: User 2 - Bánh Tiramisu (Public)
  const recipeTiramisu = await prisma.recipe.create({
    data: {
      userId: user2.id,
      categoryId: catDoUong.id,
      title: 'Bánh Tiramisu Ca Cao Mềm Mịn',
      description: 'Món bánh tráng miệng Ý béo ngậy vị mascarpone kết hợp đắng nhẹ của cà phê espresso và bột ca cao.',
      calories: 320,
      cookTime: 30,
      difficulty: 'EASY',
      servings: 6,
      thumbnail: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
      source: 'USER',
      isPublic: true,
    },
  });

  // Recipe 3: User 2 - Sốt Bơ Tỏi (Private)
  const recipeSotBoToi = await prisma.recipe.create({
    data: {
      userId: user2.id,
      categoryId: catMonChinh.id,
      title: 'Công Thức Sốt Bơ Tỏi Bí Truyền (Riêng Tư)',
      description: 'Công thức độc quyền cá nhân để làm sốt bơ tỏi thần thánh chấm hải sản và bánh mì.',
      calories: 180,
      cookTime: 10,
      difficulty: 'EASY',
      servings: 4,
      thumbnail: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
      source: 'USER',
      isPublic: false,
    },
  });

  // Recipe 4: User 3 - Ức Gà Nướng Mật Ong (Public)
  const recipeUcGa = await prisma.recipe.create({
    data: {
      userId: user3.id,
      categoryId: catDiet.id,
      title: 'Ức Gà Nướng Mật Ong Tỏi Healthy',
      description: 'Món ăn giàu protein dành cho dân tập gym, thịt gà mềm mọng không bị khô.',
      calories: 310,
      cookTime: 25,
      difficulty: 'EASY',
      servings: 2,
      thumbnail: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80',
      source: 'USER',
      isPublic: true,
    },
  });

  // Recipe 5: User 3 - Sinh Tố Protein (Private)
  const recipeSinhTo = await prisma.recipe.create({
    data: {
      userId: user3.id,
      categoryId: catDoUong.id,
      title: 'Sinh Tố Protein Chuối Yến Mạch (Riêng Tư)',
      description: 'Thức uống nạp năng lượng nhanh trước buổi tập gym của riêng Tuấn.',
      calories: 250,
      cookTime: 5,
      difficulty: 'EASY',
      servings: 1,
      thumbnail: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80',
      source: 'USER',
      isPublic: false,
    },
  });

  console.log('✅ Khởi tạo dữ liệu mẫu hoàn tất 100%!');
  console.log('📌 Danh sách Users:', [user1.username, user2.username, user3.username, adminUser.username].join(', '));

  // Recipe 2: Salad Gà Keto (AI Generated)
  const recipeSalad = await prisma.recipe.create({
    data: {
      userId: adminUser.id,
      categoryId: catDiet.id,
      title: 'Salad Ức Gà Keto Áp Chảo',
      description: 'Công thức Salad ít carb giàu protein do AI GenAI sáng tạo từ ức gà, bơ chín và xà lách tươi sốt mè rang.',
      calories: 280,
      cookTime: 15,
      difficulty: 'EASY',
      servings: 2,
      thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
      source: 'AI GenAI',
      isPublic: true,
    },
  });

  await prisma.recipeIngredient.createMany({
    data: [
      { id: BigInt(Date.now() + 20), recipeId: recipeSalad.id, ingredientName: 'Ức gà tươi', quantity: 300, unit: 'g', displayOrder: 1 },
      { id: BigInt(Date.now() + 21), recipeId: recipeSalad.id, ingredientName: 'Bơ chín', quantity: 1, unit: 'quả', displayOrder: 2 },
      { id: BigInt(Date.now() + 22), recipeId: recipeSalad.id, ingredientName: 'Rau xà lách & Cà chua bi', quantity: 200, unit: 'g', displayOrder: 3 },
      { id: BigInt(Date.now() + 23), recipeId: recipeSalad.id, ingredientName: 'Sốt mè rang Healthy', quantity: 3, unit: 'muỗng', displayOrder: 4 },
    ],
  });

  await prisma.recipeStep.createMany({
    data: [
      { id: BigInt(Date.now() + 30), recipeId: recipeSalad.id, stepNumber: 1, content: 'Ức gà thái miếng vừa ăn, ướp chút muối tiêu rồi áp chảo chín vàng 2 mặt.' },
      { id: BigInt(Date.now() + 31), recipeId: recipeSalad.id, stepNumber: 2, content: 'Rửa sạch xà lách và cà chua bi, cắt bơ vừa ăn.' },
      { id: BigInt(Date.now() + 32), recipeId: recipeSalad.id, stepNumber: 3, content: 'Xếp rau củ ra đĩa, đặt ức gà lên trên và rưới sốt mè rang vào trộn đều.' },
    ],
  });

  await prisma.recipeTag.create({ data: { recipeId: recipeSalad.id, tagId: tagKeto.id } });
  await prisma.recipeTag.create({ data: { recipeId: recipeSalad.id, tagId: tagNhanhGon.id } });

  // Recipe 3: Bánh Mì Chảo Bít Tết
  const recipeBanhMi = await prisma.recipe.create({
    data: {
      userId: user1.id,
      categoryId: catAnSang.id,
      title: 'Bánh Mì Chảo Trứng Pate Nóng Hổi',
      description: 'Món ăn sáng quốc dân quen thuộc gồm pate gan ngậy, trứng ốp la lòng đào và sốt cà chua đậm đà chấm bánh mì giòn.',
      calories: 550,
      cookTime: 20,
      difficulty: 'EASY',
      servings: 2,
      thumbnail: 'https://images.unsplash.com/photo-1628240411354-946b28169e6b?auto=format&fit=crop&w=800&q=80',
      source: 'USER',
      isPublic: true,
    },
  });

  await prisma.recipeIngredient.createMany({
    data: [
      { id: BigInt(Date.now() + 40), recipeId: recipeBanhMi.id, ingredientName: 'Trứng gà', quantity: 2, unit: 'quả', displayOrder: 1 },
      { id: BigInt(Date.now() + 41), recipeId: recipeBanhMi.id, ingredientName: 'Pate gan heo', quantity: 100, unit: 'g', displayOrder: 2 },
      { id: BigInt(Date.now() + 42), recipeId: recipeBanhMi.id, ingredientName: 'Xúc xích Đức', quantity: 2, unit: 'cây', displayOrder: 3 },
      { id: BigInt(Date.now() + 43), recipeId: recipeBanhMi.id, ingredientName: 'Bánh mì nóng giòn', quantity: 2, unit: 'ổ', displayOrder: 4 },
    ],
  });

  await prisma.recipeStep.createMany({
    data: [
      { id: BigInt(Date.now() + 50), recipeId: recipeBanhMi.id, stepNumber: 1, content: 'Đun nóng chảo gang, cho 1 ít bơ và phi thơm hành tỏi băm.' },
      { id: BigInt(Date.now() + 51), recipeId: recipeBanhMi.id, stepNumber: 2, content: 'Chiên xúc xích xém cạnh, ốp la 2 quả trứng lòng đào.' },
      { id: BigInt(Date.now() + 52), recipeId: recipeBanhMi.id, stepNumber: 3, content: 'Cho pate và sốt cà chua vào đun sôi sền sệt, rắc hành ngò và dưa leo ăn kèm bánh mì.' },
    ],
  });

  await prisma.recipeTag.create({ data: { recipeId: recipeBanhMi.id, tagId: tagDeLam.id } });

  console.log('✅ Khởi tạo dữ liệu mẫu hoàn tất 100%!');
  console.log('📌 Danh mục đã tạo:', [catMonNuoc.name, catMonChinh.name, catAnSang.name, catDiet.name, catDoUong.name].join(', '));
  console.log('📌 Công thức đã tạo:', [recipePho.title, recipeSalad.title, recipeBanhMi.title].join(', '));

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error('❌ Error seeding data:', e);
  process.exit(1);
});
