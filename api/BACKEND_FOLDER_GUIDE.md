# Backend Folder Guide

Tài liệu này giải thích ý nghĩa của từng thư mục trong cấu trúc backend của dự án.

## Cấu trúc chính

### src/

Thư mục chứa toàn bộ source code của ứng dụng NestJS.

### src/app.module.ts

File module gốc của ứng dụng. Tại đây sẽ đăng ký tất cả các module chính như auth, users, recipes, admin, v.v.

### src/main.ts

File khởi động ứng dụng. Đây là nơi NestJS tạo server, cấu hình prefix API, CORS và port chạy.

## Common

### src/common/

Chứa các thành phần dùng chung cho nhiều module, giúp giảm lặp code.

#### src/common/constants/

Chứa các hằng số chung của hệ thống như tên app, mã lỗi, cấu hình mặc định.

#### src/common/decorators/

Chứa custom decorators như `@Public()`, `@CurrentUser()` để tái sử dụng trong auth và authorization.

#### src/common/dto/

Chứa các DTO dùng chung, ví dụ pagination query, response wrapper.

#### src/common/enums/

Chứa enum như vai trò người dùng (`USER`, `ADMIN`), trạng thái bài viết, trạng thái thông báo, v.v.

## Modules

### src/modules/

Chứa các module chức năng theo từng domain nghiệp vụ.

#### src/modules/auth/

Quản lý đăng nhập, đăng ký, refresh token, xác thực người dùng.

#### src/modules/users/

Quản lý thông tin người dùng, profile, phân quyền, cập nhật hồ sơ.

#### src/modules/recipes/

Quản lý công thức nấu ăn: tạo, sửa, xoá, xem, tìm kiếm, phân loại.

#### src/modules/categories/

Quản lý danh mục công thức hoặc loại món ăn.

#### src/modules/tags/

Quản lý tag để phân loại recipe theo từ khóa.

#### src/modules/comments/

Quản lý bình luận cho recipe.

#### src/modules/favorites/

Quản lý danh sách yêu thích của người dùng.

#### src/modules/likes/

Quản lý lượt thích cho recipe hoặc comment.

#### src/modules/ratings/

Quản lý đánh giá sao cho recipe.

#### src/modules/follows/

Quản lý theo dõi người dùng.

#### src/modules/notifications/

Quản lý thông báo hệ thống cho người dùng.

#### src/modules/reports/

Quản lý báo cáo vi phạm hoặc nội dung không phù hợp.

#### src/modules/search-history/

Lưu lịch sử tìm kiếm của người dùng.

#### src/modules/ai-generation/

Chứa các chức năng liên quan đến AI tạo recipe hoặc gợi ý nội dung.

#### src/modules/admin/

Chứa các chức năng quản trị dành cho admin.

## Database

### src/database/

Chứa các thành phần liên quan đến database và ORM.

#### prisma.service.ts

Service dùng để kết nối và quản lý Prisma Client.

## Prisma

### prisma/

Chứa schema và migration cho database.

#### prisma/schema.prisma

Định nghĩa toàn bộ model dữ liệu của hệ thống.

#### prisma/migrations/

Chứa các file migration được tạo khi thay đổi schema.

#### prisma/seed.ts

File seed dữ liệu khởi tạo ban đầu cho database.

## Test

### test/

Chứa các test end-to-end của ứng dụng.

### src/**/*.spec.ts

Chứa unit test cho controller/service.

## Config & Build

### tsconfig.json

Cấu hình TypeScript cho backend.

### tsconfig.build.json

Cấu hình build production.

### package.json

Chứa scripts chạy dev, build, test và các dependency.

### nest-cli.json

Cấu hình Nest CLI.

## Ghi chú chung

- Mỗi module nên có cấu trúc riêng: controller, service, dto, module.
- Logic nghiệp vụ nên nằm ở service.
- DTO dùng để validate input.
- Shared logic nên đặt trong src/common.
