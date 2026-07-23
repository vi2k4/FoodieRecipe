# Tài liệu cơ sở dữ liệu FoodiRecipe

Tài liệu này mô tả schema Prisma trong `api/prisma/schema.prisma`. Cơ sở dữ liệu sử dụng PostgreSQL. Các tên trong phần **Thuộc tính** là tên field dùng trong Prisma; tên cột thực tế được ghi trong ngoặc nếu field có dùng `@map(...)`.

## Quy ước chung

- `BigInt`: số nguyên lớn, được dùng cho ID và các khóa ngoại.
- `String`: chuỗi ký tự. Một số field có giới hạn PostgreSQL như `VarChar(50)` hoặc lưu dạng `Text`.
- `Boolean`: giá trị đúng/sai.
- `Int`: số nguyên 32-bit.
- `Decimal`: số thập phân có độ chính xác cố định.
- `DateTime`: ngày giờ, các field ngày giờ trong schema dùng `Timestamptz(6)`.
- Dấu `?` sau kiểu dữ liệu nghĩa là field có thể nhận `NULL`.
- `@id`: khóa chính.
- `@unique`: giá trị không được trùng.
- `@default(...)`: giá trị mặc định khi tạo bản ghi.
- `@updatedAt`: Prisma tự cập nhật thời gian khi bản ghi thay đổi.
- `@relation`: quan hệ giữa các model.
- `@@index`: chỉ mục phục vụ truy vấn nhanh.
- `@@map`: tên bảng thực tế trong PostgreSQL.

## Các enum

### `UserRole`

- `USER`: tài khoản người dùng thông thường.
- `ADMIN`: tài khoản quản trị viên.

### `RecipeDifficulty`

- `EASY`: dễ.
- `MEDIUM`: trung bình.
- `HARD`: khó.

### `RecipeImageType`

- `THUMBNAIL`: ảnh đại diện/ảnh thu nhỏ của công thức.
- `INGREDIENT`: ảnh nguyên liệu.
- `STEP`: ảnh minh họa một bước thực hiện.
- `RESULT`: ảnh thành phẩm.
- `AI_GENERATED`: ảnh được tạo bằng AI.
- `OTHER`: loại ảnh khác.

### `NotificationType`

- `LIKE`: có người thích công thức.
- `COMMENT`: có bình luận mới.
- `FOLLOW`: có người theo dõi.
- `REPORT`: thông báo liên quan đến báo cáo.
- `AI_GENERATION`: thông báo về quá trình tạo nội dung bằng AI.
- `SYSTEM`: thông báo hệ thống.

### `ReportStatus`

- `PENDING`: đang chờ xử lý.
- `RESOLVED`: báo cáo hợp lệ và đã được xử lý.
- `REJECTED`: báo cáo bị từ chối.

### `AIGenerationStatus`

- `PENDING`: yêu cầu đang chờ xử lý.
- `PROCESSING`: đang xử lý.
- `SUCCESS`: xử lý thành công.
- `FAILED`: xử lý thất bại.

---

## 1. `User` — bảng `users`

Lưu thông tin tài khoản người dùng, hồ sơ cá nhân và các quan hệ của người dùng trong hệ thống.

| Thuộc tính | Kiểu | Mô tả |
|---|---|---|
| `id` | `BigInt` | Khóa chính, tự tăng. |
| `username` | `String` | Tên người dùng, tối đa 50 ký tự, không trùng. |
| `email` | `String` | Email đăng nhập, tối đa 255 ký tự, không trùng. |
| `passwordHash` (`password_hash`) | `String` | Mật khẩu đã băm, tối đa 255 ký tự; không lưu mật khẩu dạng rõ. |
| `avatarUrl` (`avatar_url`) | `String?` | URL ảnh đại diện, có thể để trống. |
| `bio` | `String?` | Mô tả ngắn về người dùng, có thể để trống. |
| `role` | `UserRole` | Vai trò tài khoản; mặc định `USER`. |
| `isVerified` (`is_verified`) | `Boolean` | Đã xác minh tài khoản hay chưa; mặc định `false`. |
| `createdAt` (`created_at`) | `DateTime` | Thời điểm tạo tài khoản; mặc định thời gian hiện tại. |
| `updatedAt` (`updated_at`) | `DateTime` | Thời điểm cập nhật gần nhất; Prisma tự cập nhật. |
| `deletedAt` (`deleted_at`) | `DateTime?` | Thời điểm xóa mềm; `NULL` nghĩa là chưa bị xóa. |
| `otpVerifications` | Quan hệ 1-n | Các mã OTP của người dùng. |
| `refreshTokens` | Quan hệ 1-n | Các refresh token đã cấp. |
| `recipes` | Quan hệ 1-n | Các công thức do người dùng tạo. |
| `favorites` | Quan hệ 1-n | Các công thức người dùng đã yêu thích. |
| `recipeLikes` | Quan hệ 1-n | Các lượt thích công thức của người dùng. |
| `ratings` | Quan hệ 1-n | Các đánh giá người dùng đã gửi. |
| `comments` | Quan hệ 1-n | Các bình luận của người dùng. |
| `notifications` | Quan hệ 1-n | Các thông báo gửi đến người dùng. |
| `following` | Quan hệ 1-n | Danh sách tài khoản mà người dùng đang theo dõi. |
| `followers` | Quan hệ 1-n | Danh sách tài khoản đang theo dõi người dùng. |
| `submittedReports` | Quan hệ 1-n | Các báo cáo do người dùng gửi. |
| `handledReports` | Quan hệ 1-n | Các báo cáo do người dùng với vai trò quản trị xử lý. |
| `searchHistories` | Quan hệ 1-n | Lịch sử tìm kiếm của người dùng. |
| `aiGenerationHistory` | Quan hệ 1-n | Lịch sử yêu cầu tạo nội dung bằng AI. |

Chỉ mục: `createdAt`, `deletedAt`.

## 2. `OTPVerification` — bảng `otp_verifications`

Lưu mã OTP phục vụ xác minh tài khoản hoặc các nghiệp vụ xác thực khác.

| Thuộc tính | Kiểu | Mô tả |
|---|---|---|
| `id` | `BigInt` | Khóa chính, tự tăng. |
| `userId` (`user_id`) | `BigInt` | Khóa ngoại đến `users.id`. |
| `otpCode` (`otp_code`) | `String` | Mã OTP, tối đa 255 ký tự. |
| `expiresAt` (`expires_at`) | `DateTime` | Thời điểm mã hết hạn. |
| `isUsed` (`is_used`) | `Boolean` | Mã đã được sử dụng chưa; mặc định `false`. |
| `createdAt` (`created_at`) | `DateTime` | Thời điểm tạo mã; mặc định thời gian hiện tại. |
| `user` | Quan hệ n-1 | Người sở hữu mã OTP. Xóa user sẽ xóa các OTP liên quan (`Cascade`). |

Chỉ mục: `userId`, `expiresAt`.

## 3. `RefreshToken` — bảng `refresh_tokens`

Lưu token dùng để cấp lại access token mà không yêu cầu đăng nhập lại.

| Thuộc tính | Kiểu | Mô tả |
|---|---|---|
| `id` | `BigInt` | Khóa chính, tự tăng. |
| `userId` (`user_id`) | `BigInt` | Khóa ngoại đến người dùng sở hữu token. |
| `token` | `String` | Refresh token, không trùng. |
| `expiresAt` (`expires_at`) | `DateTime` | Thời điểm token hết hạn. |
| `revoked` | `Boolean` | Token đã bị thu hồi chưa; mặc định `false`. |
| `createdAt` (`created_at`) | `DateTime` | Thời điểm cấp token. |
| `user` | Quan hệ n-1 | Người sở hữu token; xóa user sẽ xóa token (`Cascade`). |

Chỉ mục: `userId`, `expiresAt`, `revoked`.

## 4. `RecipeCategory` — bảng `recipe_categories`

Lưu danh mục dùng để phân loại công thức.

| Thuộc tính | Kiểu | Mô tả |
|---|---|---|
| `id` | `BigInt` | Khóa chính, tự tăng. |
| `name` | `String` | Tên danh mục, tối đa 100 ký tự, không trùng. |
| `description` | `String?` | Mô tả danh mục. |
| `icon` | `String?` | URL hoặc dữ liệu tham chiếu đến biểu tượng danh mục. |
| `createdAt` (`created_at`) | `DateTime` | Thời điểm tạo danh mục. |
| `recipes` | Quan hệ 1-n | Các công thức thuộc danh mục. |

## 5. `Recipe` — bảng `recipes`

Lưu thông tin chính của một công thức nấu ăn.

| Thuộc tính | Kiểu | Mô tả |
|---|---|---|
| `id` | `BigInt` | Khóa chính, tự tăng. |
| `userId` (`user_id`) | `BigInt` | Tác giả công thức, khóa ngoại đến `users.id`. |
| `categoryId` (`category_id`) | `BigInt?` | Danh mục; có thể để trống. Khi danh mục bị xóa, field được đặt `NULL`. |
| `title` | `String` | Tên công thức, tối đa 200 ký tự. |
| `description` | `String?` | Mô tả hoặc giới thiệu công thức. |
| `calories` | `Decimal?` | Lượng calo, tối đa 10 chữ số và 2 chữ số thập phân. |
| `cookTime` (`cook_time`) | `Int?` | Thời gian nấu, nên lưu theo đơn vị phút. |
| `difficulty` | `RecipeDifficulty` | Độ khó; mặc định `EASY`. |
| `servings` | `Int?` | Số khẩu phần. |
| `thumbnail` | `String?` | URL ảnh đại diện công thức. |
| `source` | `String?` | Nguồn tham khảo hoặc URL nguồn. |
| `isPublic` (`is_public`) | `Boolean` | Công thức có hiển thị công khai không; mặc định `true`. |
| `viewCount` (`view_count`) | `BigInt` | Số lượt xem; mặc định `0`. |
| `likeCount` (`like_count`) | `BigInt` | Số lượt thích được tổng hợp; mặc định `0`. |
| `favoriteCount` (`favorite_count`) | `BigInt` | Số lượt yêu thích; mặc định `0`. |
| `averageRating` (`average_rating`) | `Decimal` | Điểm đánh giá trung bình, mặc định `0`, tối đa 3 chữ số và 2 chữ số thập phân. |
| `createdAt` (`created_at`) | `DateTime` | Thời điểm tạo công thức. |
| `updatedAt` (`updated_at`) | `DateTime` | Thời điểm cập nhật công thức gần nhất. |
| `deletedAt` (`deleted_at`) | `DateTime?` | Thời điểm xóa mềm. |
| `author` | Quan hệ n-1 | Người tạo công thức. |
| `category` | Quan hệ n-1 | Danh mục của công thức. |
| `ingredients` | Quan hệ 1-n | Danh sách nguyên liệu. |
| `steps` | Quan hệ 1-n | Danh sách các bước nấu. |
| `images` | Quan hệ 1-n | Các ảnh của công thức. |
| `recipeTags` | Quan hệ 1-n | Các bản ghi liên kết với tag. |
| `favorites` | Quan hệ 1-n | Người dùng đã yêu thích công thức. |
| `likes` | Quan hệ 1-n | Người dùng đã thích công thức. |
| `ratings` | Quan hệ 1-n | Các đánh giá cho công thức. |
| `comments` | Quan hệ 1-n | Các bình luận trên công thức. |
| `reports` | Quan hệ 1-n | Các báo cáo liên quan đến công thức. |
| `aiGenerationHistory` | Quan hệ 1-n | Các lịch sử AI tạo ra hoặc liên quan đến công thức. |

Chỉ mục: `userId`, `categoryId`, `title`, `createdAt`, `(isPublic, deletedAt)`, `viewCount`, `likeCount`, `averageRating`.

## 6. `RecipeIngredient` — bảng `recipe_ingredients`

Lưu từng nguyên liệu của một công thức.

| Thuộc tính | Kiểu | Mô tả |
|---|---|---|
| `id` | `BigInt` | Khóa chính, tự tăng. |
| `recipeId` (`recipe_id`) | `BigInt` | Công thức sở hữu nguyên liệu. |
| `ingredientName` (`ingredient_name`) | `String` | Tên nguyên liệu, tối đa 150 ký tự. |
| `quantity` | `Decimal?` | Số lượng nguyên liệu, tối đa 10 chữ số và 2 chữ số thập phân. |
| `unit` | `String?` | Đơn vị như gram, ml, muỗng, quả. |
| `displayOrder` (`display_order`) | `Int` | Thứ tự hiển thị; mặc định `1`. |
| `recipe` | Quan hệ n-1 | Công thức liên quan; xóa công thức sẽ xóa nguyên liệu (`Cascade`). |

Ràng buộc duy nhất: mỗi công thức không được có hai nguyên liệu cùng `displayOrder`. Chỉ mục: `recipeId`.

## 7. `RecipeStep` — bảng `recipe_steps`

Lưu các bước thực hiện công thức theo thứ tự.

| Thuộc tính | Kiểu | Mô tả |
|---|---|---|
| `id` | `BigInt` | Khóa chính, tự tăng. |
| `recipeId` (`recipe_id`) | `BigInt` | Công thức liên quan. |
| `stepNumber` (`step_number`) | `Int` | Số thứ tự của bước. |
| `content` | `String` | Nội dung hướng dẫn thực hiện bước. |
| `recipe` | Quan hệ n-1 | Công thức liên quan; xóa công thức sẽ xóa các bước (`Cascade`). |

Ràng buộc duy nhất: một công thức không được có hai bước cùng `stepNumber`. Chỉ mục: `recipeId`.

## 8. `RecipeImage` — bảng `recipe_images`

Lưu ảnh bổ sung của công thức.

| Thuộc tính | Kiểu | Mô tả |
|---|---|---|
| `id` | `BigInt` | Khóa chính, tự tăng. |
| `recipeId` (`recipe_id`) | `BigInt` | Công thức liên quan. |
| `imageUrl` (`image_url`) | `String` | URL ảnh. |
| `type` | `RecipeImageType` | Loại ảnh; mặc định `OTHER`. |
| `displayOrder` (`display_order`) | `Int` | Thứ tự hiển thị; mặc định `1`. |
| `createdAt` (`created_at`) | `DateTime` | Thời điểm thêm ảnh. |
| `recipe` | Quan hệ n-1 | Công thức liên quan; xóa công thức sẽ xóa ảnh (`Cascade`). |

Ràng buộc duy nhất: mỗi công thức không được có hai ảnh cùng `displayOrder`. Chỉ mục: `recipeId`.

## 9. `Tag` — bảng `tags`

Lưu các từ khóa dùng để gắn nhãn và tìm kiếm công thức.

| Thuộc tính | Kiểu | Mô tả |
|---|---|---|
| `id` | `BigInt` | Khóa chính, tự tăng. |
| `name` | `String` | Tên tag, tối đa 50 ký tự, không trùng. |
| `recipeTags` | Quan hệ 1-n | Các liên kết giữa tag và công thức. |

## 10. `RecipeTag` — bảng `recipe_tags`

Là bảng trung gian cho quan hệ nhiều-nhiều giữa `Recipe` và `Tag`.

| Thuộc tính | Kiểu | Mô tả |
|---|---|---|
| `recipeId` (`recipe_id`) | `BigInt` | Khóa ngoại đến công thức. |
| `tagId` (`tag_id`) | `BigInt` | Khóa ngoại đến tag. |
| `recipe` | Quan hệ n-1 | Công thức liên quan; xóa công thức sẽ xóa liên kết (`Cascade`). |
| `tag` | Quan hệ n-1 | Tag liên quan; xóa tag sẽ xóa liên kết (`Cascade`). |

Khóa chính ghép: `recipeId` + `tagId`. Chỉ mục: `tagId`.

## 11. `Favorite` — bảng `favorites`

Lưu việc người dùng đánh dấu một công thức là yêu thích.

| Thuộc tính | Kiểu | Mô tả |
|---|---|---|
| `userId` (`user_id`) | `BigInt` | Người dùng yêu thích. |
| `recipeId` (`recipe_id`) | `BigInt` | Công thức được yêu thích. |
| `createdAt` (`created_at`) | `DateTime` | Thời điểm thêm vào danh sách yêu thích. |
| `user` | Quan hệ n-1 | Người dùng liên quan. |
| `recipe` | Quan hệ n-1 | Công thức liên quan. |

Khóa chính ghép: `userId` + `recipeId`, bảo đảm mỗi người dùng chỉ yêu thích một công thức một lần. Chỉ mục: `recipeId`, `createdAt`.

## 12. `RecipeLike` — bảng `recipe_likes`

Lưu lượt thích của người dùng đối với công thức.

| Thuộc tính | Kiểu | Mô tả |
|---|---|---|
| `userId` (`user_id`) | `BigInt` | Người dùng thực hiện lượt thích. |
| `recipeId` (`recipe_id`) | `BigInt` | Công thức được thích. |
| `createdAt` (`created_at`) | `DateTime` | Thời điểm thích. |
| `user` | Quan hệ n-1 | Người dùng liên quan. |
| `recipe` | Quan hệ n-1 | Công thức liên quan. |

Khóa chính ghép: `userId` + `recipeId`, bảo đảm một người dùng chỉ có một lượt thích cho mỗi công thức. Chỉ mục: `recipeId`, `createdAt`.

## 13. `Rating` — bảng `ratings`

Lưu điểm đánh giá của người dùng đối với công thức.

| Thuộc tính | Kiểu | Mô tả |
|---|---|---|
| `userId` (`user_id`) | `BigInt` | Người dùng đánh giá. |
| `recipeId` (`recipe_id`) | `BigInt` | Công thức được đánh giá. |
| `rating` | `Int` | Điểm đánh giá. Schema chưa đặt giới hạn min/max; tầng service nên kiểm tra, ví dụ từ 1 đến 5. |
| `createdAt` (`created_at`) | `DateTime` | Thời điểm đánh giá lần đầu. |
| `updatedAt` (`updated_at`) | `DateTime` | Thời điểm sửa đánh giá gần nhất. |
| `user` | Quan hệ n-1 | Người đánh giá. |
| `recipe` | Quan hệ n-1 | Công thức được đánh giá. |

Khóa chính ghép: `userId` + `recipeId`, nên mỗi người dùng chỉ có một đánh giá cho mỗi công thức. Chỉ mục: `recipeId`.

## 14. `Comment` — bảng `comments`

Lưu bình luận và cấu trúc trả lời bình luận.

| Thuộc tính | Kiểu | Mô tả |
|---|---|---|
| `id` | `BigInt` | Khóa chính, tự tăng. |
| `recipeId` (`recipe_id`) | `BigInt` | Công thức được bình luận. |
| `userId` (`user_id`) | `BigInt` | Người viết bình luận. |
| `parentCommentId` (`parent_comment_id`) | `BigInt?` | Bình luận cha; `NULL` nếu là bình luận gốc. |
| `content` | `String` | Nội dung bình luận. |
| `createdAt` (`created_at`) | `DateTime` | Thời điểm tạo bình luận. |
| `updatedAt` (`updated_at`) | `DateTime` | Thời điểm chỉnh sửa gần nhất. |
| `deletedAt` (`deleted_at`) | `DateTime?` | Thời điểm xóa mềm. |
| `recipe` | Quan hệ n-1 | Công thức được bình luận. |
| `user` | Quan hệ n-1 | Người viết bình luận. |
| `parentComment` | Quan hệ n-1 | Bình luận cha, nếu đây là câu trả lời. |
| `replies` | Quan hệ 1-n | Các câu trả lời trực tiếp cho bình luận. |

Chỉ mục: `recipeId`, `userId`, `parentCommentId`, `createdAt`.

## 15. `Notification` — bảng `notifications`

Lưu thông báo gửi đến người dùng.

| Thuộc tính | Kiểu | Mô tả |
|---|---|---|
| `id` | `BigInt` | Khóa chính, tự tăng. |
| `userId` (`user_id`) | `BigInt` | Người nhận thông báo. |
| `title` | `String` | Tiêu đề, tối đa 200 ký tự. |
| `content` | `String` | Nội dung thông báo. |
| `type` | `NotificationType` | Loại thông báo. |
| `referenceId` (`reference_id`) | `BigInt?` | ID đối tượng liên quan, ví dụ recipe, comment hoặc report. |
| `isRead` (`is_read`) | `Boolean` | Đã đọc chưa; mặc định `false`. |
| `createdAt` (`created_at`) | `DateTime` | Thời điểm tạo thông báo. |
| `user` | Quan hệ n-1 | Người nhận; xóa user sẽ xóa thông báo (`Cascade`). |

Chỉ mục: `userId`, `(userId, isRead)`, `createdAt`.

## 16. `UserFollow` — bảng `user_follows`

Lưu quan hệ theo dõi giữa hai người dùng.

| Thuộc tính | Kiểu | Mô tả |
|---|---|---|
| `followerId` (`follower_id`) | `BigInt` | Người thực hiện theo dõi. |
| `followingId` (`following_id`) | `BigInt` | Người được theo dõi. |
| `createdAt` (`created_at`) | `DateTime` | Thời điểm bắt đầu theo dõi. |
| `follower` | Quan hệ n-1 | Trỏ đến user theo dõi, qua relation `UserFollowing`. |
| `following` | Quan hệ n-1 | Trỏ đến user được theo dõi, qua relation `UserFollowers`. |

Khóa chính ghép: `followerId` + `followingId`. Chỉ mục: `followingId`, `createdAt`.

## 17. `Report` — bảng `reports`

Lưu báo cáo của người dùng về công thức vi phạm hoặc nội dung không phù hợp.

| Thuộc tính | Kiểu | Mô tả |
|---|---|---|
| `id` | `BigInt` | Khóa chính, tự tăng. |
| `recipeId` (`recipe_id`) | `BigInt` | Công thức bị báo cáo. |
| `reporterId` (`reporter_id`) | `BigInt` | Người gửi báo cáo. |
| `reason` | `String` | Lý do báo cáo, tối đa 100 ký tự. |
| `description` | `String?` | Mô tả chi tiết bổ sung. |
| `status` | `ReportStatus` | Trạng thái xử lý; mặc định `PENDING`. |
| `handledBy` (`handled_by`) | `BigInt?` | Quản trị viên xử lý; có thể để trống khi chưa xử lý. |
| `handledAt` (`handled_at`) | `DateTime?` | Thời điểm xử lý báo cáo. |
| `createdAt` (`created_at`) | `DateTime` | Thời điểm gửi báo cáo. |
| `recipe` | Quan hệ n-1 | Công thức bị báo cáo. |
| `reporter` | Quan hệ n-1 | Người gửi báo cáo, qua relation `ReportReporter`. |
| `handler` | Quan hệ n-1 | Người xử lý, qua relation `ReportHandler`. Xóa handler sẽ đặt `handledBy` thành `NULL`. |

Ràng buộc duy nhất: một người dùng chỉ được báo cáo một công thức một lần. Chỉ mục: `recipeId + reporterId`, `reporterId`, `handledBy`, `status`, `createdAt`.

## 18. `SearchHistory` — bảng `search_history`

Lưu lịch sử từ khóa tìm kiếm của người dùng, đồng thời cho phép lưu tìm kiếm ẩn danh.

| Thuộc tính | Kiểu | Mô tả |
|---|---|---|
| `id` | `BigInt` | Khóa chính, tự tăng. |
| `userId` (`user_id`) | `BigInt?` | Người tìm kiếm; `NULL` nếu tìm kiếm ẩn danh. |
| `keyword` | `String` | Từ khóa tìm kiếm, tối đa 255 ký tự. |
| `createdAt` (`created_at`) | `DateTime` | Thời điểm tìm kiếm. |
| `user` | Quan hệ n-1 | Người dùng liên quan; có thể không có. Xóa user sẽ xóa lịch sử liên quan (`Cascade`). |

Chỉ mục: `userId`, `keyword`, `createdAt`.

## 19. `AIGenerationHistory` — bảng `ai_generation_history`

Lưu lịch sử tạo công thức hoặc hình ảnh bằng AI.

| Thuộc tính | Kiểu | Mô tả |
|---|---|---|
| `id` | `BigInt` | Khóa chính, tự tăng. |
| `userId` (`user_id`) | `BigInt` | Người yêu cầu tạo nội dung. |
| `recipeId` (`recipe_id`) | `BigInt?` | Công thức liên quan, có thể trống nếu AI chưa tạo thành công công thức. |
| `imageUrl` (`image_url`) | `String?` | URL ảnh AI tạo ra. |
| `detectedLabels` (`detected_labels`) | `Json?` | Các nhãn/đối tượng được nhận diện từ ảnh, lưu dưới dạng JSONB. |
| `prompt` | `String?` | Prompt người dùng gửi cho AI. |
| `model` | `String?` | Tên model AI được sử dụng, tối đa 100 ký tự. |
| `status` | `AIGenerationStatus` | Trạng thái xử lý; mặc định `PENDING`. |
| `createdAt` (`created_at`) | `DateTime` | Thời điểm tạo yêu cầu. |
| `user` | Quan hệ n-1 | Người gửi yêu cầu; xóa user sẽ xóa lịch sử (`Cascade`). |
| `recipe` | Quan hệ n-1 | Công thức được tạo hoặc liên quan; xóa công thức sẽ đặt `recipeId` thành `NULL`. |

Chỉ mục: `userId`, `recipeId`, `status`, `createdAt`.

---

## Sơ đồ quan hệ tổng quát

```text
User 1 ─── n Recipe ─── n RecipeIngredient
  │             │       └── n RecipeStep
  │             │       └── n RecipeImage
  │             │
  │             ├── n RecipeTag n ─── 1 Tag
  │             ├── n Favorite
  │             ├── n RecipeLike
  │             ├── n Rating
  │             ├── n Comment (có replies đệ quy)
  │             ├── n Report
  │             └── n AIGenerationHistory
  │
  ├── n OTPVerification
  ├── n RefreshToken
  ├── n Notification
  ├── n SearchHistory
  ├── n AIGenerationHistory
  └── n UserFollow (follower/following)

RecipeCategory 1 ─── n Recipe
```

## Lưu ý khi phát triển API

1. Các ID kiểu `BigInt` cần được chuyển đổi phù hợp trước khi trả JSON vì JavaScript không serialize `BigInt` mặc định.
2. `Rating.rating` chưa có ràng buộc trong database; nên kiểm tra giới hạn điểm ở DTO hoặc service.
3. `deletedAt` là cơ chế xóa mềm của `User`, `Recipe` và `Comment`; các truy vấn danh sách thông thường nên lọc `deletedAt: null`.
4. `referenceId` trong `Notification` là ID đa hình và không có foreign key trực tiếp; code ứng dụng phải xác định loại đối tượng dựa trên `type`.
5. Các field đếm như `viewCount`, `likeCount`, `favoriteCount` là dữ liệu tổng hợp; khi thêm/xóa like hoặc favorite cần cập nhật nhất quán trong transaction.
