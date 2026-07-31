# Giải thích Dockerfile của FoodiRecipe

Project có hai ứng dụng độc lập:

- `api`: Backend NestJS chạy cổng `3001`.
- `web`: Frontend Next.js chạy cổng `3000`.

Mỗi ứng dụng có Dockerfile riêng để build và deploy độc lập.

## 1. Vì sao dùng multi-stage build?

Cả hai Dockerfile đều chia thành các stage:

```text
base → deps → builder → runner
```

### `base`

```dockerfile
FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN corepack enable
```

Stage này dùng chung Node.js 22, Debian Slim và pnpm. Debian Slim được chọn vì tương thích tốt với Prisma, `sharp` và AWS SDK.

### `deps`

```dockerfile
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
```

Chỉ copy file dependency trước khi cài package để Docker có thể cache layer. `--frozen-lockfile` bảo đảm Docker dùng đúng phiên bản trong lockfile.

### `builder`

Stage này copy source code và compile project:

- Backend chạy `prisma generate` rồi `pnpm build`.
- Frontend chạy `pnpm build`.

TypeScript, compiler và dev dependency chỉ tồn tại trong stage build, không đưa vào image runtime.

### `runner`

Image cuối chỉ chứa output đã build và production dependencies. Cách này giúp image nhỏ hơn, khởi động nhanh hơn và giảm package không cần thiết trong production.

## 2. Vì sao Backend chạy Prisma generate?

Trong [api/Dockerfile](api/Dockerfile) có:

```dockerfile
RUN pnpm exec prisma generate
```

Project dùng Prisma 7, nên Prisma Client phải được generate từ `prisma/schema.prisma` trước khi NestJS build.

Dockerfile dùng `DATABASE_URL` build argument giả lập:

```dockerfile
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ENV DATABASE_URL=${DATABASE_URL}
```

Giá trị này chỉ phục vụ lúc build/generate Prisma. Database thật được truyền khi container chạy.

## 3. Vì sao không copy `.env` vào image?

Hai `.dockerignore` loại trừ:

```text
.env
.env.*
```

Lý do:

- Không đưa database password vào Docker image.
- Không đưa JWT secret hoặc AWS secret vào image.
- Có thể dùng cùng image cho development, staging và production.

Backend nhận biến môi trường lúc chạy:

```powershell
docker run --env-file api/.env foodirecipe-api
```

Production nên dùng Docker Secrets, Kubernetes Secrets hoặc secret manager của cloud.

## 4. Vì sao Frontend dùng Next standalone?

Trong [web/next.config.ts](web/next.config.ts) có:

```ts
output: "standalone"
```

Next.js tạo `.next/standalone`, chứa server và dependency tối thiểu để chạy production.

Dockerfile chỉ copy:

```text
public
.next/standalone
.next/static
```

Frontend chạy bằng:

```dockerfile
CMD ["node", "server.js"]
```

Nhờ vậy image không cần copy toàn bộ `node_modules` vào runtime.

## 5. Vì sao `NEXT_PUBLIC_API_URL` là build argument?

Các biến `NEXT_PUBLIC_*` được Next.js đưa vào bundle trong quá trình build:

```dockerfile
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
```

Build local:

```powershell
docker build -f web/Dockerfile -t foodirecipe-web `
  --build-arg NEXT_PUBLIC_API_URL="http://localhost:3001/api" web
```

Deploy production cần thay bằng URL Backend thật:

```powershell
--build-arg NEXT_PUBLIC_API_URL="https://api.example.com/api"
```

## 6. Kết nối Backend container với PostgreSQL

Nếu PostgreSQL chạy trên máy host ở port `5433`, container không được dùng `localhost:5433`, vì `localhost` bên trong container trỏ tới chính container đó.

Trên Windows dùng:

```text
host.docker.internal:5433
```

Ví dụ:

```powershell
docker run --rm --name foodirecipe-api `
  --env-file api/.env `
  --add-host=host.docker.internal:host-gateway `
  -e DATABASE_URL="postgresql://foodie_user:foodie_password@host.docker.internal:5433/foodie_db?schema=public" `
  -p 3001:3001 foodirecipe-api
```

Nếu PostgreSQL cũng chạy trong Docker Compose và cùng network, hostname phải là tên service:

```text
postgresql://foodie_user:foodie_password@postgres:5432/foodie_db
```

Trong trường hợp này dùng port nội bộ `5432`, không dùng port host `5433`.

## 7. Vì sao dùng `.dockerignore`?

`.dockerignore` giúp:

- Không gửi `node_modules` từ máy host vào build context.
- Không gửi `.next`, `dist`, coverage và log cũ.
- Không gửi `.env` chứa secret.
- Giảm thời gian build và dung lượng context.

Dependency luôn được cài lại từ lockfile bên trong Docker.

## 8. Quy trình build và chạy

Khởi động PostgreSQL:

```powershell
docker compose up -d
docker compose ps
```

Build Backend:

```powershell
docker build -f api/Dockerfile -t foodirecipe-api `
  --build-arg DATABASE_URL="postgresql://build:build@localhost:5432/build" api
```

Build Frontend:

```powershell
docker build -f web/Dockerfile -t foodirecipe-web `
  --build-arg NEXT_PUBLIC_API_URL="http://localhost:3001/api" web
```

Chạy Frontend:

```powershell
docker run --rm --name foodirecipe-web -p 3000:3000 foodirecipe-web
```

Truy cập:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:3001
```

## 9. Kiểm tra và xử lý lỗi

```powershell
docker ps
docker logs -f foodirecipe-api
docker logs -f foodirecipe-web
```

Dừng container nhưng giữ volume PostgreSQL:

```powershell
docker compose down
```

Không dùng lệnh sau nếu chưa muốn xóa dữ liệu database:

```powershell
docker compose down -v
```

`down -v` sẽ xóa Docker volume chứa dữ liệu PostgreSQL.
