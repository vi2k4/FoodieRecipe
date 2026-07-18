import { PrismaClient, UserRole, RecipeDifficulty, RecipeImageType } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing existing data...');
  // Delete in reverse order of dependencies
  await prisma.recipeTag.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipeStep.deleteMany();
  await prisma.recipeImage.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.recipeLike.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.recipeCategory.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding users...');
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@foodie.com',
      passwordHash: '$2b$10$EP/V.Y.K3H5wBfZtS0U3uO7q6599q1mG9UeS8nFhOaN2aE9tE/Fh6', // bcrypt hash of '123456'
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      bio: 'Quản trị viên hệ thống My Foodie Recipes',
      role: UserRole.ADMIN,
      isVerified: true,
    },
  });

  const chefNguyen = await prisma.user.create({
    data: {
      username: 'chef_nguyen',
      email: 'nguyen@foodie.com',
      passwordHash: '$2b$10$EP/V.Y.K3H5wBfZtS0U3uO7q6599q1mG9UeS8nFhOaN2aE9tE/Fh6', // bcrypt hash of '123456'
      avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80',
      bio: 'Đầu bếp chuyên nghiệp với hơn 10 năm kinh nghiệm trong ẩm thực Việt Nam',
      role: UserRole.USER,
      isVerified: true,
    },
  });

  const memberLan = await prisma.user.create({
    data: {
      username: 'member_lan',
      email: 'lan@foodie.com',
      passwordHash: '$2b$10$EP/V.Y.K3H5wBfZtS0U3uO7q6599q1mG9UeS8nFhOaN2aE9tE/Fh6', // bcrypt hash of '123456'
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      bio: 'Người đam mê làm bánh và nấu các món ăn tốt cho sức khỏe',
      role: UserRole.USER,
      isVerified: true,
    },
  });

  console.log('Seeding categories...');
  const catMain = await prisma.recipeCategory.create({
    data: { name: 'Món chính', description: 'Các món ăn no phục vụ cho bữa trưa và tối', icon: 'utensils' },
  });
  const catDessert = await prisma.recipeCategory.create({
    data: { name: 'Món tráng miệng', description: 'Bánh ngọt, kem, chè và các món ngọt khác', icon: 'cookie' },
  });
  const catVegetarian = await prisma.recipeCategory.create({
    data: { name: 'Món chay', description: 'Các công thức chay bổ dưỡng và thuần thực vật', icon: 'leaf' },
  });
  const catBeverage = await prisma.recipeCategory.create({
    data: { name: 'Đồ uống', description: 'Sinh tố, trà, cà phê và các loại nước giải khát', icon: 'cup-straw' },
  });
  const catFastFood = await prisma.recipeCategory.create({
    data: { name: 'Món ăn nhanh', description: 'Đồ ăn nhẹ chuẩn bị nhanh chóng', icon: 'sandwich' },
  });
  const catVietnamese = await prisma.recipeCategory.create({
    data: { name: 'Món Việt Nam', description: 'Món ăn mang hương vị truyền thống Việt Nam', icon: 'soup' },
  });

  console.log('Seeding tags...');
  const tagHealthy = await prisma.tag.create({ data: { name: 'Healthy' } });
  const tagEasy = await prisma.tag.create({ data: { name: 'Dễ làm' } });
  const tagQuick = await prisma.tag.create({ data: { name: 'Nhanh' } });
  const tagSpicy = await prisma.tag.create({ data: { name: 'Cay' } });
  const tagLowCal = await prisma.tag.create({ data: { name: 'Ít calo' } });
  const tagTraditional = await prisma.tag.create({ data: { name: 'Truyền thống' } });

  console.log('Seeding recipes...');

  // 1. Bánh Flan
  const recipeFlan = await prisma.recipe.create({
    data: {
      userId: chefNguyen.id,
      categoryId: catDessert.id,
      title: 'Bánh Flan Truyền Thống Caramels',
      description: 'Công thức làm bánh flan (caramel) siêu mịn, thơm ngậy mùi trứng sữa và không bị rỗ.',
      calories: 250.00,
      cookTime: 45,
      difficulty: RecipeDifficulty.EASY,
      servings: 4,
      thumbnail: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&w=800&q=80',
      source: 'Đầu bếp Nguyễn',
      isPublic: true,
      viewCount: 150n,
      likeCount: 42n,
      favoriteCount: 20n,
      averageRating: 4.80,
      ingredients: {
        create: [
          { ingredientName: 'Trứng gà', quantity: 5.00, unit: 'quả', displayOrder: 1 },
          { ingredientName: 'Sữa tươi không đường', quantity: 500.00, unit: 'ml', displayOrder: 2 },
          { ingredientName: 'Đường cát', quantity: 100.00, unit: 'g', displayOrder: 3 },
          { ingredientName: 'Vani', quantity: 1.00, unit: 'ống', displayOrder: 4 },
        ],
      },
      steps: {
        create: [
          { stepNumber: 1, content: 'Đun đường với một chút nước lọc đến khi chuyển màu cánh gián (caramel), đổ một lớp mỏng vào đáy các khuôn bánh.' },
          { stepNumber: 2, content: 'Đánh nhẹ trứng gà cho tan (tránh tạo bọt khí), đun sữa tươi ấm rồi từ từ rót sữa vào trứng, khuấy nhẹ đều tay cùng với vani.' },
          { stepNumber: 3, content: 'Lọc hỗn hợp qua rây mịn từ 2 đến 3 lần để bánh được mịn hoàn toàn, sau đó rót từ từ vào khuôn đã nguội caramel.' },
          { stepNumber: 4, content: 'Xếp khuôn vào nồi hấp cách thủy ở lửa nhỏ nhất trong 30-40 phút. Nên che mặt khuôn bằng giấy bạc để tránh nước đọng nhỏ vào bánh.' },
          { stepNumber: 5, content: 'Để bánh nguội hoàn toàn rồi cho vào ngăn mát tủ lạnh từ 2-3 tiếng trước khi úp ngược ra đĩa thưởng thức.' },
        ],
      },
      images: {
        create: [
          { imageUrl: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&w=800&q=80', type: RecipeImageType.THUMBNAIL, displayOrder: 1 },
          { imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', type: RecipeImageType.RESULT, displayOrder: 2 },
        ],
      },
      recipeTags: {
        create: [
          { tagId: tagEasy.id },
          { tagId: tagLowCal.id },
        ],
      },
    },
  });

  // 2. Phở Bò Hà Nội
  const recipePho = await prisma.recipe.create({
    data: {
      userId: chefNguyen.id,
      categoryId: catVietnamese.id,
      title: 'Phở Bò Hà Nội Cổ Truyền',
      description: 'Hương vị phở bò truyền thống tinh tế với nước dùng trong vắt, ngọt thanh từ xương bò ninh kỹ và thơm lừng hồi quế thảo quả.',
      calories: 450.00,
      cookTime: 180,
      difficulty: RecipeDifficulty.HARD,
      servings: 4,
      thumbnail: 'https://images.unsplash.com/photo-1583224964978-2257b960c3d3?auto=format&fit=crop&w=800&q=80',
      source: 'Bí kíp gia truyền Chef Nguyễn',
      isPublic: true,
      viewCount: 500n,
      likeCount: 120n,
      favoriteCount: 85n,
      averageRating: 4.90,
      ingredients: {
        create: [
          { ingredientName: 'Bánh phở tươi', quantity: 500.00, unit: 'g', displayOrder: 1 },
          { ingredientName: 'Thịt thăn bò (hoặc nạm bò)', quantity: 300.00, unit: 'g', displayOrder: 2 },
          { ingredientName: 'Xương ống bò', quantity: 1000.00, unit: 'g', displayOrder: 3 },
          { ingredientName: 'Hành tây, gừng', quantity: 1.00, unit: 'củ', displayOrder: 4 },
          { ingredientName: 'Gia vị phở (quế, hồi, thảo quả, đinh hương)', quantity: 1.00, unit: 'gói', displayOrder: 5 },
          { ingredientName: 'Hành lá, rau thơm', quantity: 50.00, unit: 'g', displayOrder: 6 },
        ],
      },
      steps: {
        create: [
          { stepNumber: 1, content: 'Xương ống rửa sạch, luộc bỏ nước đầu rồi ninh trong nồi áp suất hoặc nồi thường khoảng 2-3 tiếng để ngọt nước.' },
          { stepNumber: 2, content: 'Nướng hành tây, gừng nguyên vỏ cho thơm, cạo sạch phần cháy đen rồi đập dập, thả vào nồi nước dùng.' },
          { stepNumber: 3, content: 'Rang thơm quế, hồi, thảo quả rồi cho vào túi lọc vải, thả vào nồi ninh xương trước khi tắt bếp khoảng 1 tiếng.' },
          { stepNumber: 4, content: 'Trần bánh phở qua nước sôi rồi xếp vào tô, xếp thịt bò thái lát mỏng cùng hành hoa xắt nhỏ lên trên.' },
          { stepNumber: 5, content: 'Chan nước dùng đang sôi sùng sục vào tô phở cho thịt bò chín tái và dậy mùi hành thơm. Ăn kèm quẩy và chanh ớt.' },
        ],
      },
      images: {
        create: [
          { imageUrl: 'https://images.unsplash.com/photo-1583224964978-2257b960c3d3?auto=format&fit=crop&w=800&q=80', type: RecipeImageType.THUMBNAIL, displayOrder: 1 },
        ],
      },
      recipeTags: {
        create: [
          { tagId: tagTraditional.id },
        ],
      },
    },
  });

  // 3. Salad Ức Gà
  const recipeSalad = await prisma.recipe.create({
    data: {
      userId: memberLan.id,
      categoryId: catVegetarian.id,
      title: 'Salad Ức Gà Sốt Mè Rang Giảm Cân',
      description: 'Lựa chọn hoàn hảo cho những bữa ăn Eat-clean thanh đạm, giàu protein tốt và các loại vitamin từ rau quả tươi mát.',
      calories: 320.00,
      cookTime: 15,
      difficulty: RecipeDifficulty.EASY,
      servings: 2,
      thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
      source: 'Kitchen Eaters',
      isPublic: true,
      viewCount: 220n,
      likeCount: 55n,
      favoriteCount: 30n,
      averageRating: 4.60,
      ingredients: {
        create: [
          { ingredientName: 'Ức gà phi lê', quantity: 200.00, unit: 'g', displayOrder: 1 },
          { ingredientName: 'Rau xà lách sạch', quantity: 150.00, unit: 'g', displayOrder: 2 },
          { ingredientName: 'Cà chua bi', quantity: 50.00, unit: 'g', displayOrder: 3 },
          { ingredientName: 'Quả bơ chín', quantity: 0.50, unit: 'quả', displayOrder: 4 },
          { ingredientName: 'Nước sốt mè rang Kewpie', quantity: 3.00, unit: 'muỗng canh', displayOrder: 5 },
        ],
      },
      steps: {
        create: [
          { stepNumber: 1, content: 'Ức gà rửa sạch, luộc chín cùng một chút gừng đập dập và muối để khử mùi. Sau khi chín, xé gà thành sợi vừa ăn.' },
          { stepNumber: 2, content: 'Rau xà lách rửa sạch xắt khúc nhỏ. Cà chua bi cắt đôi. Dưa chuột thái mỏng. Bơ lột vỏ cắt lát dày.' },
          { stepNumber: 3, content: 'Cho xà lách, cà chua, dưa chuột và bơ vào tô trộn lớn.' },
          { stepNumber: 4, content: 'Rải ức gà xé sợi lên trên cùng, rưới nước sốt mè rang đều khắp bề mặt tô salad.' },
          { stepNumber: 5, content: 'Trộn đều nhẹ tay trước khi ăn để các nguyên liệu ngấm sốt mà bơ không bị nát. Dùng lạnh ngon hơn.' },
        ],
      },
      images: {
        create: [
          { imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80', type: RecipeImageType.THUMBNAIL, displayOrder: 1 },
        ],
      },
      recipeTags: {
        create: [
          { tagId: tagHealthy.id },
          { tagId: tagQuick.id },
          { tagId: tagLowCal.id },
        ],
      },
    },
  });

  console.log('Seeding comments & ratings...');
  // Comments on Flan
  await prisma.comment.create({
    data: {
      recipeId: recipeFlan.id,
      userId: memberLan.id,
      content: 'Nhìn ngon quá anh ơi! Cho em hỏi nếu hấp bằng nồi cơm điện thì có được không ạ?',
    },
  });

  // Rating on Flan
  await prisma.rating.create({
    data: {
      recipeId: recipeFlan.id,
      userId: memberLan.id,
      rating: 5,
    },
  });

  // Comments on Pho
  const comment1 = await prisma.comment.create({
    data: {
      recipeId: recipePho.id,
      userId: memberLan.id,
      content: 'Bí quyết nước dùng ngon quá ạ! Em đã thử nấu tại nhà và cả nhà đều khen.',
    },
  });

  await prisma.comment.create({
    data: {
      recipeId: recipePho.id,
      userId: chefNguyen.id,
      parentCommentId: comment1.id,
      content: 'Cảm ơn em đã chia sẻ! Chúc em nấu được nhiều món ăn ngon hơn nữa.',
    },
  });

  await prisma.rating.create({
    data: {
      recipeId: recipePho.id,
      userId: memberLan.id,
      rating: 5,
    },
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
