import { PrismaClient, UserRole, RecipeDifficulty, RecipeImageType, NotificationType, ReportStatus, AIGenerationStatus } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Bắt đầu dọn dẹp database cũ...');
  // Delete in reverse order of dependencies
  await prisma.aIGenerationHistory.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.recipeLike.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.recipeTag.deleteMany();
  await prisma.recipeImage.deleteMany();
  await prisma.recipeStep.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.recipeCategory.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.userFollow.deleteMany();
  await prisma.user.deleteMany();

  console.log('Bắt đầu seed dữ liệu mới...');

  // 1. Tạo Users (Admin + Regular Users)
  const user1 = await prisma.user.create({
    data: {
      id: 1n,
      username: 'dung_admin',
      email: 'dung@foodie.com',
      passwordHash: 'dung_secret_hash',
      bio: 'Quản trị viên hệ thống FoodiRecipe.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      role: UserRole.ADMIN,
      isVerified: true,
      createdAt: subDays(new Date(), 6),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: 2n,
      username: 'hoang_chef',
      email: 'hoang@chef.com',
      passwordHash: 'hoang_secret_hash',
      bio: 'Đam mê ẩm thực truyền thống Việt Nam.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      role: UserRole.USER,
      isVerified: true,
      createdAt: subDays(new Date(), 5),
    },
  });

  const user3 = await prisma.user.create({
    data: {
      id: 3n,
      username: 'lan_anh',
      email: 'lananh@food.com',
      passwordHash: 'lananh_secret_hash',
      bio: 'Yêu thích làm bánh và các món ăn ngọt.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      role: UserRole.USER,
      isVerified: true,
      createdAt: subDays(new Date(), 4),
    },
  });

  const user4 = await prisma.user.create({
    data: {
      id: 4n,
      username: 'minh_chay',
      email: 'minhchay@vegan.com',
      passwordHash: 'minh_secret_hash',
      bio: 'Chuyên gia ẩm thực chay vì sức khỏe.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      role: UserRole.USER,
      isVerified: false,
      createdAt: subDays(new Date(), 3),
    },
  });

  const user5 = await prisma.user.create({
    data: {
      id: 5n,
      username: 'huong_giang',
      email: 'giang@example.com',
      passwordHash: 'giang_secret_hash',
      bio: 'Sinh viên thiết kế, thích nấu ăn nhanh gọn.',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
      role: UserRole.USER,
      isVerified: true,
      createdAt: subDays(new Date(), 2),
    },
  });

  // More users created on yesterday and today to show growth
  await prisma.user.createMany({
    data: [
      {
        id: 6n,
        username: 'quoc_bao',
        email: 'bao@example.com',
        passwordHash: 'bao_secret',
        role: UserRole.USER,
        createdAt: subDays(new Date(), 1),
      },
      {
        id: 7n,
        username: 'thu_thao',
        email: 'thao@example.com',
        passwordHash: 'thao_secret',
        role: UserRole.USER,
        createdAt: subDays(new Date(), 1),
      },
      {
        id: 8n,
        username: 'viet_anh',
        email: 'viet@example.com',
        passwordHash: 'viet_secret',
        role: UserRole.USER,
        createdAt: new Date(),
      },
    ],
  });

  console.log('Đã seed xong Users.');

  // 2. Tạo Categories
  const catMain = await prisma.recipeCategory.create({
    data: { id: 1n, name: 'Món chính', description: 'Các món ăn chính cho bữa trưa và tối', icon: 'Utensils' },
  });
  const catAppetizer = await prisma.recipeCategory.create({
    data: { id: 2n, name: 'Món khai vị', description: 'Các món nhẹ kích thích vị giác', icon: 'Salad' },
  });
  const catDessert = await prisma.recipeCategory.create({
    data: { id: 3n, name: 'Đồ tráng miệng', description: 'Các món ngọt, bánh, chè', icon: 'Cake' },
  });
  const catDrink = await prisma.recipeCategory.create({
    data: { id: 4n, name: 'Nước uống', description: 'Sinh tố, nước ép, cà phê', icon: 'Coffee' },
  });
  const catVegan = await prisma.recipeCategory.create({
    data: { id: 5n, name: 'Món chay', description: 'Các món thuần chay lành mạnh', icon: 'Leaf' },
  });

  console.log('Đã seed xong Categories.');

  // 3. Tạo Tags
  const tagEasy = await prisma.tag.create({ data: { id: 1n, name: 'Dễ làm' } });
  const tagSoup = await prisma.tag.create({ data: { id: 2n, name: 'Món nước' } });
  const tagFry = await prisma.tag.create({ data: { id: 3n, name: 'Đồ rán' } });
  const tagHealthy = await prisma.tag.create({ data: { id: 4n, name: 'Tốt cho sức khỏe' } });
  const tagTrad = await prisma.tag.create({ data: { id: 5n, name: 'Truyền thống' } });

  console.log('Đã seed xong Tags.');

  // 4. Tạo Recipes
  const r1 = await prisma.recipe.create({
    data: {
      id: 1n,
      userId: 2n, // hoang_chef
      categoryId: 1n, // Món chính
      title: 'Phở bò truyền thống',
      description: 'Công thức nấu phở bò gia truyền thơm ngon đậm vị.',
      cookTime: 180,
      difficulty: RecipeDifficulty.HARD,
      servings: 4,
      thumbnail: 'https://images.unsplash.com/photo-1583002621742-881c9c72e2cf?auto=format&fit=crop&q=80&w=600',
      likeCount: 5n,
      favoriteCount: 3n,
      averageRating: 4.8,
      createdAt: subDays(new Date(), 6),
    },
  });

  const r2 = await prisma.recipe.create({
    data: {
      id: 2n,
      userId: 3n, // lan_anh
      categoryId: 3n, // Tráng miệng
      title: 'Bánh flan sữa tươi siêu mịn',
      description: 'Làm bánh flan caramen tại nhà siêu đơn giản, không bị rỗ.',
      cookTime: 45,
      difficulty: RecipeDifficulty.EASY,
      servings: 6,
      thumbnail: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&q=80&w=600',
      likeCount: 4n,
      favoriteCount: 2n,
      averageRating: 4.5,
      createdAt: subDays(new Date(), 5),
    },
  });

  const r3 = await prisma.recipe.create({
    data: {
      id: 3n,
      userId: 4n, // minh_chay
      categoryId: 5n, // Món chay
      title: 'Đậu hũ sốt Tứ Xuyên chay',
      description: 'Món đậu hũ sốt cay cay, đậm đà, cực kỳ trôi cơm.',
      cookTime: 20,
      difficulty: RecipeDifficulty.MEDIUM,
      servings: 3,
      thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
      likeCount: 3n,
      favoriteCount: 1n,
      averageRating: 4.2,
      createdAt: subDays(new Date(), 4),
    },
  });

  const r4 = await prisma.recipe.create({
    data: {
      id: 4n,
      userId: 5n, // huong_giang
      categoryId: 2n, // Khai vị
      title: 'Gỏi cuốn tôm thịt',
      description: 'Món ăn thanh mát, giải nhiệt cho mùa hè nóng bức.',
      cookTime: 30,
      difficulty: RecipeDifficulty.EASY,
      servings: 4,
      thumbnail: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=600',
      likeCount: 2n,
      favoriteCount: 2n,
      averageRating: 4.0,
      createdAt: subDays(new Date(), 3),
    },
  });

  const r5 = await prisma.recipe.create({
    data: {
      id: 5n,
      userId: 2n, // hoang_chef
      categoryId: 1n, // Món chính
      title: 'Cá kho tộ miền Tây',
      description: 'Cá kho đậm vị tỏi ớt, thịt ba chỉ béo ngậy.',
      cookTime: 60,
      difficulty: RecipeDifficulty.MEDIUM,
      servings: 4,
      thumbnail: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=600',
      likeCount: 1n,
      favoriteCount: 1n,
      averageRating: 4.7,
      createdAt: subDays(new Date(), 2),
    },
  });

  // More recipes created recently
  await prisma.recipe.createMany({
    data: [
      {
        id: 6n,
        userId: 3n,
        categoryId: 3n,
        title: 'Bánh tart trứng Hong Kong',
        cookTime: 50,
        difficulty: RecipeDifficulty.HARD,
        thumbnail: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=600',
        createdAt: subDays(new Date(), 1),
      },
      {
        id: 7n,
        userId: 4n,
        categoryId: 5n,
        title: 'Nấm đùi gà kho tiêu xanh',
        cookTime: 25,
        difficulty: RecipeDifficulty.EASY,
        thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
        createdAt: subDays(new Date(), 1),
      },
      {
        id: 8n,
        userId: 5n,
        categoryId: 4n,
        title: 'Trà đào cam sả thanh nhiệt',
        cookTime: 15,
        difficulty: RecipeDifficulty.EASY,
        thumbnail: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&q=80&w=600',
        createdAt: new Date(),
      },
    ],
  });

  // 5a. Seed Ingredients
  await prisma.recipeIngredient.createMany({
    data: [
      // Phở bò (recipe 1)
      { recipeId: 1n, ingredientName: 'Xương bò (ống tuỷ)', quantity: 1.5, unit: 'kg', displayOrder: 1 },
      { recipeId: 1n, ingredientName: 'Thịt bò tái (nạm, gầu)', quantity: 500, unit: 'g', displayOrder: 2 },
      { recipeId: 1n, ingredientName: 'Bánh phở tươi', quantity: 800, unit: 'g', displayOrder: 3 },
      { recipeId: 1n, ingredientName: 'Hành tây', quantity: 2, unit: 'củ', displayOrder: 4 },
      { recipeId: 1n, ingredientName: 'Gừng tươi', quantity: 1, unit: 'củ lớn', displayOrder: 5 },
      { recipeId: 1n, ingredientName: 'Hoa hồi', quantity: 5, unit: 'tai', displayOrder: 6 },
      { recipeId: 1n, ingredientName: 'Quế', quantity: 2, unit: 'thanh', displayOrder: 7 },
      { recipeId: 1n, ingredientName: 'Nước mắm, muối, đường phèn', quantity: null, unit: 'vừa đủ', displayOrder: 8 },
      { recipeId: 1n, ingredientName: 'Hành lá, ngò gai, giá đỗ, chanh, ớt', quantity: null, unit: 'kèm ăn', displayOrder: 9 },
      // Bánh flan (recipe 2)
      { recipeId: 2n, ingredientName: 'Trứng gà', quantity: 4, unit: 'quả', displayOrder: 1 },
      { recipeId: 2n, ingredientName: 'Sữa tươi không đường', quantity: 400, unit: 'ml', displayOrder: 2 },
      { recipeId: 2n, ingredientName: 'Sữa đặc có đường', quantity: 100, unit: 'ml', displayOrder: 3 },
      { recipeId: 2n, ingredientName: 'Đường trắng', quantity: 100, unit: 'g', displayOrder: 4 },
      { recipeId: 2n, ingredientName: 'Nước', quantity: 30, unit: 'ml', displayOrder: 5 },
      { recipeId: 2n, ingredientName: 'Vani extract', quantity: 1, unit: 'muỗng cà phê', displayOrder: 6 },
      // Đậu hũ (recipe 3)
      { recipeId: 3n, ingredientName: 'Đậu hũ cứng', quantity: 400, unit: 'g', displayOrder: 1 },
      { recipeId: 3n, ingredientName: 'Tương đậu đen (doubanjiang)', quantity: 2, unit: 'muỗng canh', displayOrder: 2 },
      { recipeId: 3n, ingredientName: 'Dầu mè', quantity: 1, unit: 'muỗng canh', displayOrder: 3 },
      { recipeId: 3n, ingredientName: 'Tỏi, gừng băm', quantity: null, unit: 'vừa đủ', displayOrder: 4 },
      { recipeId: 3n, ingredientName: 'Nước tương, đường, tinh bột năng', quantity: null, unit: 'vừa đủ', displayOrder: 5 },
    ],
  });

  // 5b. Seed Steps
  await prisma.recipeStep.createMany({
    data: [
      // Phở bò (recipe 1)
      { recipeId: 1n, stepNumber: 1, content: 'Xương bò rửa sạch, chần qua nước sôi 5 phút rồi rửa lại với nước lạnh để loại bỏ tạp chất.' },
      { recipeId: 1n, stepNumber: 2, content: 'Nướng hành tây và gừng trên lửa trực tiếp hoặc trong lò nướng đến khi vỏ ngoài cháy đen, rồi cạo sạch lớp đen bên ngoài.' },
      { recipeId: 1n, stepNumber: 3, content: 'Rang khô hoa hồi, quế và gia vị phở đến khi dậy mùi thơm. Cho vào túi lọc gia vị.' },
      { recipeId: 1n, stepNumber: 4, content: 'Cho xương vào nồi lớn, đổ nước ngập xương (khoảng 4-5 lít), đun sôi rồi hạ lửa nhỏ. Thêm hành tây, gừng nướng và túi gia vị, ninh ít nhất 3 tiếng.' },
      { recipeId: 1n, stepNumber: 5, content: 'Nêm nước dùng với nước mắm, muối và đường phèn cho vừa khẩu vị. Nước dùng chuẩn phải trong, có vị ngọt tự nhiên từ xương.' },
      { recipeId: 1n, stepNumber: 6, content: 'Trụng bánh phở qua nước sôi, cho vào tô. Thái thịt bò thật mỏng xếp lên mặt. Chan nước dùng nóng bỏng vào tô, trang trí với hành lá và ngò gai.' },
      // Bánh flan (recipe 2)
      { recipeId: 2n, stepNumber: 1, content: 'Làm caramel: đun đường và nước trên lửa vừa, không khuấy, đến khi chuyển màu vàng cánh gián đẹp. Đổ ngay vào khuôn, nghiêng đều để caramel phủ đáy khuôn.' },
      { recipeId: 2n, stepNumber: 2, content: 'Đánh trứng với sữa đặc, sau đó từ từ thêm sữa tươi ấm (không nóng quá). Thêm vani khuấy đều.' },
      { recipeId: 2n, stepNumber: 3, content: 'Lọc hỗn hợp trứng qua rây mịn 2-3 lần để loại bỏ bọt khí và màng trứng, giúp bánh mịn không bị rỗ.' },
      { recipeId: 2n, stepNumber: 4, content: 'Đổ hỗn hợp vào khuôn có caramel. Đặt khuôn vào khay nước nóng (cách thủy), hấp hoặc nướng ở 150°C trong 40-45 phút đến khi bánh đặc lại.' },
      { recipeId: 2n, stepNumber: 5, content: 'Để nguội hoàn toàn rồi cho vào tủ lạnh ít nhất 4 tiếng. Khi ăn, dùng dao nhỏ rạch cạnh khuôn và úp ngược bánh ra đĩa.' },
      // Đậu hũ (recipe 3)
      { recipeId: 3n, stepNumber: 1, content: 'Cắt đậu hũ thành khối vuông 2cm. Dầu mè nóng vàng, chiên đậu hũ đến vàng đều các mặt rồi vớt ra.' },
      { recipeId: 3n, stepNumber: 2, content: 'Phi thơm tỏi gừng, thêm tương đậu đen xào đến khi dậy mùi thơm đặc trưng và dầu chuyển màu đỏ.' },
      { recipeId: 3n, stepNumber: 3, content: 'Cho đậu hũ vào xào cùng, thêm nước tương, đường và một ít nước. Đun nhỏ lửa khoảng 5 phút.' },
      { recipeId: 3n, stepNumber: 4, content: 'Pha tinh bột năng với nước lạnh, đổ từ từ vào chảo, đảo đều đến khi sốt sánh lại. Rắc tiêu xanh và hành lá rồi tắt bếp.' },
    ],
  });

  console.log('Đã seed xong Recipes.');

  // 5. Kết nối Recipe & Tags
  await prisma.recipeTag.createMany({
    data: [
      { recipeId: 1n, tagId: 2n },
      { recipeId: 1n, tagId: 5n },
      { recipeId: 2n, tagId: 1n },
      { recipeId: 3n, tagId: 4n },
      { recipeId: 4n, tagId: 1n },
      { recipeId: 4n, tagId: 4n },
      { recipeId: 5n, tagId: 5n },
    ],
  });

  // 6. Seed Recipe Likes
  await prisma.recipeLike.createMany({
    data: [
      { userId: 1n, recipeId: 1n },
      { userId: 3n, recipeId: 1n },
      { userId: 4n, recipeId: 1n },
      { userId: 5n, recipeId: 1n },
      { userId: 2n, recipeId: 2n },
      { userId: 4n, recipeId: 2n },
      { userId: 5n, recipeId: 2n },
      { userId: 2n, recipeId: 3n },
      { userId: 3n, recipeId: 3n },
      { userId: 2n, recipeId: 4n },
    ],
  });

  // 7. Seed Comments
  await prisma.comment.createMany({
    data: [
      { id: 1n, recipeId: 1n, userId: 3n, content: 'Nước lèo rất trong và ngọt thanh, đúng vị Phở Hà Nội!' },
      { id: 2n, recipeId: 1n, userId: 4n, content: 'Bánh phở mềm dai vừa phải. Rất xuất sắc!' },
      { id: 3n, recipeId: 2n, userId: 2n, content: 'Bánh béo ngậy, mịn màng không hề bị tanh mùi trứng.' },
      { id: 4n, recipeId: 3n, userId: 5n, content: 'Món này ăn với cơm nóng vào mùa đông thì tuyệt vời.' },
    ],
  });

  // 8. Seed Reports
  await prisma.report.createMany({
    data: [
      {
        id: 1n,
        recipeId: 2n,
        reporterId: 4n,
        reason: 'Nội dung phản cảm',
        description: 'Phần mô tả chứa một số từ ngữ không lịch sự.',
        status: ReportStatus.PENDING,
        createdAt: subDays(new Date(), 2),
      },
      {
        id: 2n,
        recipeId: 4n,
        reporterId: 2n,
        reason: 'Hình ảnh sai lệch',
        description: 'Ảnh thumbnail là gỏi cuốn nhưng công thức lại hướng dẫn làm gỏi xoài.',
        status: ReportStatus.PENDING,
        createdAt: subDays(new Date(), 1),
      },
      {
        id: 3n,
        recipeId: 3n,
        reporterId: 3n,
        reason: 'Bản quyền công thức',
        description: 'Sao chép nguyên văn công thức từ trang cá nhân của tôi.',
        status: ReportStatus.RESOLVED,
        handledBy: 1n,
        handledAt: subDays(new Date(), 1),
        createdAt: subDays(new Date(), 3),
      },
    ],
  });

  // 9. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        id: 1n,
        userId: 2n,
        title: 'Bình luận mới về công thức',
        content: 'lan_anh đã bình luận về công thức "Phở bò truyền thống" của bạn.',
        type: NotificationType.COMMENT,
        referenceId: 1n,
        isRead: false,
        createdAt: subDays(new Date(), 1),
      },
      {
        id: 2n,
        userId: 2n,
        title: 'Lượt thích mới',
        content: 'dung_admin đã thích công thức "Phở bò truyền thống" của bạn.',
        type: NotificationType.LIKE,
        referenceId: 1n,
        isRead: true,
        createdAt: subDays(new Date(), 2),
      },
      {
        id: 3n,
        userId: 1n,
        title: 'Báo cáo vi phạm mới',
        content: 'minh_chay đã báo cáo công thức "Bánh flan sữa tươi siêu mịn".',
        type: NotificationType.REPORT,
        referenceId: 1n,
        isRead: false,
        createdAt: subDays(new Date(), 2),
      },
    ],
  });

  // 10. Seed AI Generation History
  await prisma.aIGenerationHistory.createMany({
    data: [
      {
        id: 1n,
        userId: 2n,
        recipeId: 1n,
        imageUrl: 'https://images.unsplash.com/photo-1583002621742-881c9c72e2cf?auto=format&fit=crop&q=80&w=600',
        prompt: 'phở bò việt nam bốc khói nghi ngút',
        model: 'gemini-2.0-flash',
        status: AIGenerationStatus.SUCCESS,
        createdAt: subDays(new Date(), 4),
      },
      {
        id: 2n,
        userId: 3n,
        recipeId: 2n,
        imageUrl: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&q=80&w=600',
        prompt: 'bánh flan caramel bóng mịn bày trên đĩa sứ trắng',
        model: 'gemini-2.0-flash',
        status: AIGenerationStatus.SUCCESS,
        createdAt: subDays(new Date(), 2),
      },
      {
        id: 3n,
        userId: 5n,
        prompt: 'nước ép dưa hấu mát lạnh trang trí bạc hà',
        model: 'gemini-2.0-flash',
        status: AIGenerationStatus.FAILED,
        createdAt: subDays(new Date(), 1),
      },
    ],
  });

  console.log('Seed dữ liệu thành công!');
  await prisma.$disconnect();
  await pool.end();
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  });
