import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  RecipeDifficulty,
  UserRole,
} from '../src/generated/prisma/client';

const recipeNames = [
  'Cơm gà nướng mật ong',
  'Mì Ý sốt cà chua bò bằm',
  'Bún thịt nướng rau sống',
  'Cá hồi áp chảo bơ tỏi',
  'Gỏi cuốn tôm thịt',
  'Canh chua cá lóc',
  'Thịt heo kho trứng',
  'Đậu hũ sốt nấm',
  'Salad ức gà kiểu Địa Trung Hải',
  'Phở bò gia truyền',
  'Cà ri gà nước cốt dừa',
  'Tôm rang me chua ngọt',
  'Bánh mì thịt nướng',
  'Cháo sườn hạt sen',
  'Mực xào sa tế',
  'Cơm chiên hải sản',
  'Ức gà sốt chanh dây',
  'Bò lúc lắc khoai tây',
  'Lẩu nấm rau củ',
  'Bánh xèo miền Tây',
  'Miến gà nấm hương',
  'Cá thu sốt cà',
  'Mì udon xào bò',
  'Pancake chuối yến mạch',
  'Súp bí đỏ kem tươi',
  'Cơm tấm sườn nướng mỡ hành',
  'Bún bò Huế cay nồng',
  'Bánh canh cua nước dùng đậm đà',
  'Hủ tiếu Nam Vang',
  'Bánh cuốn thịt bằm',
  'Bún riêu cua đồng',
  'Mì Quảng tôm thịt',
  'Cao lầu Hội An',
  'Bún chả Hà Nội',
  'Bánh đa cua Hải Phòng',
  'Nui xào bò rau củ',
  'Cơm niêu cá kho tộ',
  'Cá basa kho tiêu',
  'Cá diêu hồng chiên xù',
  'Cá nướng giấy bạc',
  'Cá ngừ áp chảo mè rang',
  'Tôm hấp bia sả',
  'Tôm chiên xù sốt mayonnaise',
  'Ghẹ rang me',
  'Bạch tuộc nướng sa tế',
  'Nghêu hấp thái',
  'Sò điệp nướng phô mai',
  'Hàu nướng mỡ hành',
  'Ốc len xào dừa',
  'Mực nhồi thịt sốt cà',
  'Gà hấp hành gừng',
  'Gà xào sả ớt',
  'Gà chiên nước mắm',
  'Gà nấu lá é',
  'Cánh gà nướng ngũ vị',
  'Đùi gà sốt teriyaki',
  'Vịt quay sốt cam',
  'Vịt nấu chao',
  'Bò kho bánh mì',
  'Bò cuộn nấm kim châm',
  'Bò xào lúc lắc tiêu đen',
  'Bò nhúng giấm',
  'Bò sốt vang kiểu Việt',
  'Sườn non nướng BBQ',
  'Sườn xào chua ngọt',
  'Thịt ba chỉ rang cháy cạnh',
  'Thịt nướng riềng mẻ',
  'Thịt viên sốt cà chua',
  'Nem rán nhân thịt',
  'Chả lá lốt nướng',
  'Xúc xích xào rau củ',
  'Đậu hũ chiên sả ớt',
  'Đậu hũ non sốt nấm đông cô',
  'Nấm đùi gà kho gừng',
  'Nấm rơm xào tỏi',
  'Cà tím nướng mỡ hành',
  'Bông cải xanh xào dầu hào',
  'Rau muống xào tỏi',
  'Khoai tây nghiền bơ tỏi',
  'Bắp cải cuộn rau củ',
  'Đậu que xào mè',
  'Canh bí đỏ hầm xương',
  'Canh khổ qua nhồi thịt',
  'Canh rau ngót thịt bằm',
  'Canh mồng tơi nấu tôm',
  'Canh kim chi thịt bò',
  'Canh rong biển đậu hũ',
  'Cháo gà gừng',
  'Cháo cá lóc rau đắng',
  'Cháo nghêu hành tiêu',
  'Cơm chiên Dương Châu',
  'Cơm chiên kim chi',
  'Cơm chiên trứng rau củ',
  'Cơm cuộn rong biển Hàn Quốc',
  'Tokbokki sốt cay',
  'Mì lạnh Hàn Quốc',
  'Mì ramen thịt heo',
  'Mì soba gà nướng',
  'Cơm cà ri Nhật Bản',
  'Bánh takoyaki bạch tuộc',
  'Há cảo hấp tôm thịt',
  'Sủi cảo chiên giòn',
  'Gà kung pao kiểu Hoa',
  'Chả giò chay nấm rau củ',
  'Đậu hũ kho nấm chay',
  'Bún chay sa tế',
  'Mì xào rau củ ngũ sắc',
  'Salad cá ngừ bắp ngọt',
  'Salad quinoa rau củ',
  'Salad tôm bơ',
  'Bánh mì bơ tỏi',
  'Bánh mì phô mai kéo sợi',
  'Pizza hải sản đế mỏng',
  'Lasagna bò phô mai',
  'Spaghetti carbonara',
  'Mac and cheese nướng',
  'Bánh flan caramel',
  'Chè khúc bạch trái cây',
  'Chè đậu xanh nước cốt dừa',
  'Xôi xoài cốt dừa',
  'Bánh chuối hấp',
  'Bánh tiramisu cà phê',
  'Sinh tố xoài sữa chua',
  'Trà đào cam sả',
  'Nước ép dứa cần tây',
];

const thumbnailSets = {
  soup: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
  noodles: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80',
  seafood: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
  pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
  vegetables: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
  dessert: 'https://images.unsplash.com/photo-1559843776-7b0db7f4f7e7?auto=format&fit=crop&w=900&q=80',
  default: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80',
} as const;

const getRecipeThumbnail = (title: string) => {
  const normalizedTitle = title.toLowerCase();

  if (/canh|cháo|súp|lẩu/.test(normalizedTitle)) return thumbnailSets.soup;
  if (/mì|miến|bún|phở|hủ tiếu|udon|ramen|pasta|spaghetti/.test(normalizedTitle)) return thumbnailSets.noodles;
  if (/cá|tôm|mực|ghẹ|nghêu|sò|hàu|bạch tuộc|hải sản/.test(normalizedTitle)) return thumbnailSets.seafood;
  if (/salad|rau|bông cải|bắp cải|đậu que/.test(normalizedTitle)) return thumbnailSets.salad;
  if (/pizza|bánh mì|lasagna|tacos/.test(normalizedTitle)) return thumbnailSets.pizza;
  if (/đậu hũ|nấm|khoai|cà tím|xôi|cơm/.test(normalizedTitle)) return thumbnailSets.vegetables;
  if (/bánh|chè|pancake|tiramisu|sinh tố|trà|nước ép/.test(normalizedTitle)) return thumbnailSets.dessert;

  return thumbnailSets.default;
};

const categoryNames = [
  'Món chính',
  'Món khai vị',
  'Món chay',
  'Nước uống',
  'Đồ tráng miệng',
];

const categoryAliases: Record<string, string[]> = {
  'Món khai vị': ['Món phụ'],
  'Nước uống': ['Đồ uống'],
  'Đồ tráng miệng': ['Tráng miệng'],
};

async function ensureCategories(prisma: PrismaClient) {
  const categories = [];

  for (const name of categoryNames) {
    const aliases = categoryAliases[name] ?? [];
    const existingCategory = await prisma.recipeCategory.findUnique({
      where: { name },
    });

    if (!existingCategory) {
      const legacyCategories = await prisma.recipeCategory.findMany({
        where: { name: { in: aliases } },
        orderBy: { id: 'asc' },
      });

      if (legacyCategories.length > 0) {
        await prisma.recipeCategory.update({
          where: { id: legacyCategories[0].id },
          data: { name },
        });

        for (const duplicateCategory of legacyCategories.slice(1)) {
          await prisma.recipe.updateMany({
            where: { categoryId: duplicateCategory.id },
            data: { categoryId: legacyCategories[0].id },
          });
          await prisma.recipeCategory.delete({
            where: { id: duplicateCategory.id },
          });
        }
      }
    } else if (aliases.length > 0) {
      const legacyCategories = await prisma.recipeCategory.findMany({
        where: { name: { in: aliases } },
        select: { id: true },
      });

      for (const legacyCategory of legacyCategories) {
        await prisma.recipe.updateMany({
          where: { categoryId: legacyCategory.id },
          data: { categoryId: existingCategory.id },
        });
        await prisma.recipeCategory.delete({
          where: { id: legacyCategory.id },
        });
      }
    }

    categories.push(
      await prisma.recipeCategory.upsert({
        where: { name },
        update: {},
        create: { name, description: `Các công thức thuộc nhóm ${name}.` },
      }),
    );
  }

  return categories;
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const admin = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN, deletedAt: null },
      orderBy: { id: 'asc' },
    });

    if (!admin) {
      throw new Error('Không tìm thấy tài khoản ADMIN để gán công thức.');
    }

    if (process.argv.includes('--rename')) {
      const seededRecipes = await prisma.recipe.findMany({
        where: { source: 'SEED', deletedAt: null },
        orderBy: { id: 'asc' },
        select: { id: true },
      });

      for (const [index, recipe] of seededRecipes.entries()) {
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: {
            title: recipeNames[index % recipeNames.length],
            description: `Công thức ${recipeNames[index % recipeNames.length].toLowerCase()} với cách chế biến đơn giản, phù hợp cho bữa ăn gia đình.`,
            thumbnail: getRecipeThumbnail(recipeNames[index % recipeNames.length]),
          },
        });
      }

      console.log(`Đã cập nhật tên cho ${seededRecipes.length} công thức seed.`);
      return;
    }

    const categories = await ensureCategories(prisma);
    const existingSeedCount = await prisma.recipe.count({
      where: { source: 'SEED', deletedAt: null },
    });

    if (existingSeedCount > 0) {
      const seededRecipes = await prisma.recipe.findMany({
        where: { source: 'SEED', deletedAt: null },
        orderBy: { id: 'asc' },
        select: { id: true },
      });

      for (const [index, recipe] of seededRecipes.entries()) {
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: {
            thumbnail: getRecipeThumbnail(
              recipeNames[index % recipeNames.length],
            ),
          },
        });
      }

      console.log(
        `Đã cập nhật ảnh Unsplash cho ${existingSeedCount} công thức SEED. Không tạo dữ liệu trùng.`,
      );
      return;
    }

    // Một số dữ liệu seed cũ dùng ID thủ công nên sequence tự tăng có thể bị lệch.
    // Đồng bộ sequence trước khi thêm dữ liệu để tránh lỗi trùng khóa chính.
    for (const table of [
      'recipe_categories',
      'recipes',
      'recipe_ingredients',
      'recipe_steps',
    ]) {
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 0) + 1, false)`,
      );
    }

    for (let index = 0; index < 100; index += 1) {
      const difficulty = [
        RecipeDifficulty.EASY,
        RecipeDifficulty.MEDIUM,
        RecipeDifficulty.HARD,
      ][index % 3];
      const category = categories[index % categories.length];
      const title = recipeNames[index % recipeNames.length];

      await prisma.recipe.create({
        data: {
          userId: admin.id,
          categoryId: category.id,
          title,
          description: `Công thức ${title.toLowerCase()} dễ thực hiện, phù hợp cho bữa ăn gia đình.`,
          calories: 180 + (index % 12) * 35,
          cookTime: 15 + (index % 8) * 10,
          difficulty,
          servings: 2 + (index % 5),
          thumbnail: getRecipeThumbnail(title),
          source: 'SEED',
          isPublic: true,
          viewCount: BigInt(20 + index * 7),
          likeCount: BigInt(index % 28),
          favoriteCount: BigInt(index % 15),
          averageRating: 3.5 + (index % 15) / 10,
          ingredients: {
            create: [
              {
                ingredientName: 'Nguyên liệu chính',
                quantity: 250 + (index % 5) * 50,
                unit: 'gram',
                displayOrder: 1,
              },
              {
                ingredientName: 'Hành lá',
                quantity: 20,
                unit: 'gram',
                displayOrder: 2,
              },
              {
                ingredientName: 'Gia vị tổng hợp',
                quantity: 1,
                unit: 'muỗng cà phê',
                displayOrder: 3,
              },
            ],
          },
          steps: {
            create: [
              { stepNumber: 1, content: 'Sơ chế và chuẩn bị toàn bộ nguyên liệu.' },
              { stepNumber: 2, content: 'Nêm gia vị, nấu chín theo hướng dẫn.' },
              { stepNumber: 3, content: 'Trang trí và thưởng thức khi còn nóng.' },
            ],
          },
        },
      });

      if ((index + 1) % 10 === 0) {
        console.log(`Đã tạo ${index + 1}/100 công thức`);
      }
    }

    console.log('Hoàn tất: đã thêm 100 công thức mới.');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Seed recipe thất bại:', error);
  process.exitCode = 1;
});
