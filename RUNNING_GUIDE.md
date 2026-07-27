# Hướng dẫn chạy Frontend và Backend

Tài liệu này hướng dẫn cách khởi động cả frontend (Next.js) và backend (NestJS) cho dự án FoodiRecipe.

## 1. Yêu cầu trước khi chạy

Cài đặt sẵn:

- Node.js (khuyến nghị phiên bản mới)
- pnpmgit pull origin develop
- Docker Desktop (nếu dùng PostgreSQL qua Docker)

## 2. Cài đặt dependency

### Cài dependency cho backend

```bash
cd api
pnpm install
```

### Cài dependency cho frontend

```bash
cd web
pnpm install
```

## 3. Cấu hình môi trường

### Backend

Tạo file môi trường cho API:

```bash
cd api
copy .env.example .env
```

Nếu bạn dùng PostgreSQL qua Docker, file `.env` nên có nội dung giống như:

```env
DATABASE_URL=postgresql://foodie_user:foodie_password@localhost:5433/foodie_db
PORT=3001
NODE_ENV=development
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=7d
```

### Frontend

Tạo file môi trường cho web:

```bash
cd web
copy .env.example .env.local
```

Nội dung mẫu:

```env
NEXT_PUBLIC_APP_NAME=FoodiRecipe
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 4. Chạy database bằng Docker

Từ thư mục gốc:

```bash
docker compose up -d
```

Kiểm tra container:

```bash
docker compose ps
```

## 5. Chạy backend

```bash
cd api
pnpm start:dev
```

Backend sẽ chạy ở:

- http://localhost:3001
- API prefix mặc định: http://localhost:3001/api

## 6. Chạy frontend

```bash
cd web
pnpm dev
```

Frontend sẽ chạy ở:

- http://localhost:3000

## 7. Các lệnh hữu ích

### Backend

```bash
cd api
pnpm build
pnpm test
pnpm prisma migrate dev
pnpm prisma studio
```

### Frontend

```bash
cd web
pnpm build
pnpm lint
```

## 8. Lưu ý

- Nếu backend không kết nối được database, hãy kiểm tra Docker container đang chạy và `DATABASE_URL` đúng.
- Nếu frontend không gọi được API, hãy kiểm tra `NEXT_PUBLIC_API_URL` trong `.env.local`.
- Nếu bạn vừa đổi schema Prisma, chạy:

```bash
cd api
pnpm prisma migrate dev --name <ten_migration>
```

## 9. Tắt và Khởi động lại (Restart)

### 9.1 Tắt chương trình
Khi bạn code xong và muốn tắt các server, bạn chỉ cần làm như sau:
1. Mở cửa sổ terminal đang chạy Frontend (`pnpm dev`) và nhấn tổ hợp phím **`Ctrl + C`**, sau đó ấn `Y` (nếu được hỏi) để dừng tiến trình.
2. Làm tương tự ở cửa sổ terminal đang chạy Backend (`pnpm start:dev`): nhấn **`Ctrl + C`**.
3. Để tắt cơ sở dữ liệu (nếu muốn giải phóng RAM máy), mở terminal ở thư mục gốc (`c:\Code\FoodieRecipe`) và chạy:
```bash
docker compose stop
```
*(Nếu muốn xóa hẳn container nhưng giữ lại dữ liệu trong volume, có thể dùng `docker compose down`)*

### 9.2 Khởi động lại vào lần code tới
Vào ngày hôm sau hoặc lần code tới, bạn chỉ cần làm 3 bước đơn giản:

**Bước 1: Bật Database**
Mở terminal ở thư mục gốc:
```bash
docker compose start
```
*(Nếu trước đó dùng `down`, hãy chạy lại `docker compose up -d`)*

**Bước 2: Bật Backend API**
Mở 1 terminal mới:
```bash
cd api
corepack pnpm start:dev
```

**Bước 3: Bật Frontend Web**
Mở thêm 1 terminal mới:
```bash
cd web
corepack pnpm dev
```
Sau đó truy cập `http://localhost:3000` để bắt đầu code.
