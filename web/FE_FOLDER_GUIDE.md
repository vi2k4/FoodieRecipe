# Frontend Folder Guide

Tài liệu này mô tả nhanh chức năng của từng thư mục trong `web` để dễ bảo trì và mở rộng.

## `app/`

Chứa toàn bộ route và layout của Next.js App Router.

- `(public)/`: các trang công khai như trang chủ, danh sách món, chi tiết món và trang người dùng.
- `(auth)/`: các trang xác thực như đăng nhập, đăng ký, quên mật khẩu, đặt lại mật khẩu và xác thực OTP.
- `(member)/`: các trang dành cho thành viên đã đăng nhập như hồ sơ, món của tôi, yêu thích, thông báo, tạo và sửa recipe, AI generator.
- `admin/`: các trang quản trị như dashboard, users, recipes, reports, categories và tags.
- `layout.tsx`: layout gốc của toàn bộ ứng dụng.
- `page.tsx`: trang landing gốc.
- `loading.tsx`: UI hiển thị khi route đang tải.
- `error.tsx`: error boundary cho từng route segment.
- `global-error.tsx`: error boundary toàn cục cho App Router.
- `not-found.tsx`: UI khi không tìm thấy trang.
- `globals.css`: stylesheet toàn cục.

## `components/`

Chứa các component dùng chung.

- `layout/`: các thành phần khung giao diện như Header, Footer, Sidebar và AdminSidebar.
- `ui/`: các component UI cơ bản theo thiết kế hệ thống, thường là button, input, dialog, table, select, tooltip, v.v.

## `features/`

Chứa logic theo từng domain nghiệp vụ.

- `auth/`: logic liên quan đến đăng nhập, đăng ký và xác thực.
- `recipes/`: logic liên quan đến recipe.
- `comments/`: logic bình luận.
- `favorites/`: logic yêu thích món.
- `ratings/`: logic đánh giá.
- `notifications/`: logic thông báo.
- `users/`: logic người dùng.
- `reports/`: logic báo cáo.
- `ai/`: logic liên quan tới AI generator.

Mỗi feature có thể chứa `components/`, `hooks/`, `services/`, `schemas/`, `types/` và `index.ts` để export tập trung.

## `hooks/`

Chứa custom React hooks dùng chung toàn ứng dụng.

- `useDebounce.ts`: làm chậm giá trị đầu vào.
- `usePagination.ts`: hỗ trợ phân trang.
- `useLocalStorage.ts`: đọc/ghi dữ liệu vào localStorage.

## `lib/`

Chứa các helper cấp thấp, kết nối hạ tầng và logic dùng chung.

- `api-client.ts`: cấu hình client gọi API.
- `auth.ts`: helper phục vụ xác thực.
- `env.ts`: đọc và chuẩn hóa biến môi trường.
- `utils.ts`: helper tổng quát.

## `stores/`

Chứa state management dùng chung, hiện đang theo kiểu store độc lập.

- `auth.store.ts`: trạng thái đăng nhập.
- `notification.store.ts`: trạng thái thông báo.
- `theme.store.ts`: trạng thái giao diện sáng/tối.

## `constants/`

Chứa hằng số dùng chung để tránh hardcode.

- `routes.ts`: định nghĩa đường dẫn.
- `api-endpoints.ts`: định nghĩa endpoint API.
- `roles.ts`: định nghĩa role của người dùng.

## `utils/`

Chứa các hàm tiện ích thuần.

- `format-date.ts`: định dạng ngày.
- `format-number.ts`: định dạng số.
- `format-time.ts`: định dạng thời gian.
- `handle-api-error.ts`: chuẩn hóa lỗi API.
- `upload-image.ts`: logic upload ảnh.

## `types/`

Chứa các type dùng chung.

- `api.ts`: type cho dữ liệu API.
- `common.ts`: type chung cho dữ liệu phổ biến.
- `pagination.ts`: type cho phân trang.

## `public/`

Chứa tài nguyên tĩnh có thể truy cập trực tiếp qua URL.

- `images/`: ảnh tĩnh.
- `icons/`: icon tĩnh.
- `logo/`: logo và nhận diện thương hiệu.

## File cấu hình ở root `web`

- `.env.example`: mẫu biến môi trường.
- `proxy.ts`: proxy layer theo convention mới của Next.js 16.
- `components.json`: cấu hình cho bộ component/UI generator.
- `next.config.ts`: cấu hình Next.js.
- `eslint.config.mjs`: cấu hình lint.
- `postcss.config.mjs`: cấu hình PostCSS.
- `tsconfig.json`: cấu hình TypeScript.

## Gợi ý tổ chức code

- Đặt logic theo domain trong `features/` thay vì nhét vào `app/`.
- Giữ `app/` chủ yếu cho route, layout và page.
- Tái sử dụng UI trong `components/ui/` và khung giao diện trong `components/layout/`.
- Chỉ dùng `utils/`, `lib/` và `constants/` cho phần thật sự dùng chung.
