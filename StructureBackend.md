FoodieRecipe/
├── web/ # Next.js frontend
│
├── api/ # NestJS backend
│ ├── prisma/
│ │ ├── migrations/
│ │ │ └── ...
│ │ ├── schema.prisma
│ │ └── seed.ts
│ │
│ ├── src/
│ │ ├── common/
│ │ │ ├── constants/
│ │ │ │ └── app.constant.ts
│ │ │ │
│ │ │ ├── decorators/
│ │ │ │ ├── current-user.decorator.ts
│ │ │ │ ├── public.decorator.ts
│ │ │ │ └── roles.decorator.ts
│ │ │ │
│ │ │ ├── dto/
│ │ │ │ ├── pagination-query.dto.ts
│ │ │ │ └── pagination-response.dto.ts
│ │ │ │
│ │ │ ├── enums/
│ │ │ │ ├── role.enum.ts
│ │ │ │ └── token-type.enum.ts
│ │ │ │
│ │ │ ├── filters/
│ │ │ │ └── http-exception.filter.ts
│ │ │ │
│ │ │ ├── guards/
│ │ │ │ ├── jwt-auth.guard.ts
│ │ │ │ └── roles.guard.ts
│ │ │ │
│ │ │ ├── interceptors/
│ │ │ │ ├── response.interceptor.ts
│ │ │ │ └── transform-bigint.interceptor.ts
│ │ │ │
│ │ │ ├── pipes/
│ │ │ │ └── validation.pipe.ts
│ │ │ │
│ │ │ └── utils/
│ │ │ ├── hash.util.ts
│ │ │ └── pagination.util.ts
│ │ │
│ │ ├── config/
│ │ │ ├── app.config.ts
│ │ │ ├── auth.config.ts
│ │ │ ├── database.config.ts
│ │ │ ├── mail.config.ts
│ │ │ └── configuration.ts
│ │ │
│ │ ├── database/
│ │ │ ├── prisma.module.ts
│ │ │ └── prisma.service.ts
│ │ │
│ │ ├── generated/
│ │ │ └── prisma/
│ │ │ ├── client.ts
│ │ │ ├── enums.ts
│ │ │ ├── models.ts
│ │ │ └── ...
│ │ │
│ │ ├── modules/
│ │ │ ├── auth/
│ │ │ │ ├── dto/
│ │ │ │ │ ├── login.dto.ts
│ │ │ │ │ ├── register.dto.ts
│ │ │ │ │ ├── refresh-token.dto.ts
│ │ │ │ │ ├── send-otp.dto.ts
│ │ │ │ │ └── verify-otp.dto.ts
│ │ │ │ ├── strategies/
│ │ │ │ │ └── jwt.strategy.ts
│ │ │ │ ├── auth.controller.ts
│ │ │ │ ├── auth.module.ts
│ │ │ │ └── auth.service.ts
│ │ │ │
│ │ │ ├── users/
│ │ │ │ ├── dto/
│ │ │ │ │ ├── create-user.dto.ts
│ │ │ │ │ ├── update-user.dto.ts
│ │ │ │ │ └── update-profile.dto.ts
│ │ │ │ ├── users.controller.ts
│ │ │ │ ├── users.module.ts
│ │ │ │ └── users.service.ts
│ │ │ │
│ │ │ ├── recipes/
│ │ │ │ ├── dto/
│ │ │ │ ├── recipes.controller.ts
│ │ │ │ ├── recipes.module.ts
│ │ │ │ └── recipes.service.ts
│ │ │ │
│ │ │ ├── categories/
│ │ │ ├── tags/
│ │ │ ├── comments/
│ │ │ ├── favorites/
│ │ │ ├── likes/
│ │ │ ├── ratings/
│ │ │ ├── follows/
│ │ │ ├── notifications/
│ │ │ ├── reports/
│ │ │ ├── search-history/
│ │ │ ├── ai-generation/
│ │ │ └── admin/
│ │ │
│ │ ├── app.controller.ts
│ │ ├── app.module.ts
│ │ ├── app.service.ts
│ │ └── main.ts
│ │
│ ├── test/
│ │ ├── app.e2e-spec.ts
│ │ └── jest-e2e.json
│ │
│ ├── .env
│ ├── .env.example
│ ├── .gitignore
│ ├── eslint.config.mjs
│ ├── nest-cli.json
│ ├── package.json
│ ├── pnpm-lock.yaml
│ ├── prisma.config.ts
│ ├── tsconfig.build.json
│ └── tsconfig.json
│
├── docker-compose.yml
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
