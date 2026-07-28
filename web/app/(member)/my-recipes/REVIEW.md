# Review: My Recipes và thanh tìm kiếm trang chủ

Ngày review: 2026-07-28

## Vấn đề đã xác nhận

1. `RecipeGrid` chỉ dùng ba cột từ breakpoint `2xl`, nên màn hình desktop thông thường vẫn hiển thị hai món trên một hàng.
2. Trang My Recipes gọi API public `GET /recipes` và gửi `userId` từ client.
3. Backend bật `ValidationPipe` với `whitelist: true`, nhưng các thuộc tính trong `QueryRecipeDto` không có decorator. Vì vậy query có thể bị loại bỏ trước khi tới service, khiến điều kiện `userId` không được áp dụng.
4. Việc nhận `userId` từ query không phù hợp cho dữ liệu cá nhân vì client có thể thay ID.
5. Thanh tìm kiếm trang chủ đặt nhiều control trên cùng một flex row ở chiều rộng không đủ, khiến nút tìm kiếm tràn khỏi khung.

## Thay đổi đã thực hiện

- Grid My Recipes hiển thị một cột trên mobile, hai cột từ `md` và ba cột từ `xl`.
- Thêm endpoint xác thực `GET /recipes/mine`.
- `GET /recipes/mine` lấy `user.id` từ access token do `AuthGuard` xác thực, không nhận ID người dùng từ frontend.
- Frontend My Recipes chuyển sang gọi `api.recipes.mine(params)`.
- Bổ sung validation và transform cho pagination/filter trong `QueryRecipeDto`.
- Loại `userId` khỏi DTO query public để query từ client không thể dùng làm danh tính cho My Recipes.
- Thanh tìm kiếm trang chủ chính dùng grid responsive 12 cột ở desktop và tự xếp hàng ở màn hình nhỏ.
- Thanh tìm kiếm trang public chuyển sang dạng dọc trên mobile, hàng ngang từ breakpoint `sm`; input có `min-width: 0` và nút không co/tràn.
- API danh sách public luôn áp dụng `isPublic = true` và `deletedAt = null`, kể cả khi client không truyền bộ lọc visibility.
- Trang chủ chỉ yêu cầu tối đa sáu công thức public mới nhất.
- Trang `/recipes` dùng phân trang và trường `total` để hiển thị toàn bộ công thức public qua các trang.
- Trang public đọc đúng response phân trang `{ data, page, limit, total }` thay vì nhầm response là một mảng.
- Trang public không còn dùng mock recipe khi API lỗi hoặc trả dữ liệu không hợp lệ; giao diện chỉ phản ánh dữ liệu thật từ backend.

## API contract

### `GET /api/recipes/mine`

- Yêu cầu header `Authorization: Bearer <access-token>`.
- Query hỗ trợ: `page`, `limit`, `search`, `categoryId`, `difficulty`, `isPublic`.
- User ID luôn lấy từ access token.
- Response giữ nguyên định dạng phân trang hiện có:

```json
{
  "data": [],
  "page": 1,
  "limit": 6,
  "total": 0
}
```

## File liên quan

- `api/src/modules/recipes/recipes.controller.ts`
- `api/src/modules/recipes/recipes.service.ts`
- `api/src/modules/recipes/dto/query-recipe.dto.ts`
- `web/lib/api-client.ts`
- `web/app/(member)/my-recipes/page.tsx`
- `web/components/my-recipes/RecipeGrid.tsx`
- `web/app/page.tsx`
- `web/app/(public)/page.tsx`

## Kết quả kiểm tra

- Backend build: đạt.
- Recipe service tests: 18/18 đạt, gồm kiểm tra public endpoint và phạm vi recipe của user.
- Frontend TypeScript: đạt.
- Frontend production build: đạt.
- ESLint các file thay đổi: không có error.
- Trang public còn hai warning có sẵn về sử dụng thẻ `<img>`; không ảnh hưởng build hoặc sửa lỗi responsive lần này.
