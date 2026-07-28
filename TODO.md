# My Recipes - Implementation Plan

## ✅ Completed Steps

## 📋 Steps to Complete

### Step 1: Mở rộng `web/types/recipe.ts`

- [x] Thêm đầy đủ fields: difficulty, servings, author, category, ingredients[], steps[], tags[], source, viewCount, likeCount, favoriteCount, isPublic

### Step 2: Sửa Components để nhận Props

- [x] `RecipeHeader.tsx` → nhận `image`, `title` props
- [x] `RecipeInfo.tsx` → nhận `recipe` object props
- [x] `IngredientList.tsx` → nhận `ingredients[]` props
- [x] `InstructionList.tsx` → nhận `steps[]` props
- [x] `NutritionCard.tsx` → nhận nutrition props
- [x] `UpdateButton.tsx` → nhận `recipeId` prop
- [x] `RecipeCard.tsx` → mở rộng với field mới
- [ ] `RecipeGrid.tsx` → cập nhật

### Step 3: Sửa `SearchFilter.tsx`

- [x] Thêm props: `onSearch`, `onFilterChange`, `categories[]`
- [x] Gọi `api.categories.list()`
- [x] Truyền filter values lên parent

### Step 4: Sửa Page Components - Kết nối API

- [ ] `web/app/(member)/my-recipes/page.tsx` → gọi API, loading, error, empty states
- [ ] `web/app/(member)/my-recipes/[id]/page.tsx` → gọi API, loading skeleton

### Step 5: Kiểm tra

- [ ] Verify UI hoạt động đúng
