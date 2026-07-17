web/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── recipes/
│   │   │   ├── page.tsx
│   │   │   └── [recipeId]/
│   │   │       └── page.tsx
│   │   ├── users/
│   │   │   └── [userId]/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── verify-otp/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (member)/
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── my-recipes/
│   │   │   └── page.tsx
│   │   ├── favorites/
│   │   │   └── page.tsx
│   │   ├── notifications/
│   │   │   └── page.tsx
│   │   ├── recipes/
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [recipeId]/
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── ai-generator/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── users/
│   │   │   └── page.tsx
│   │   ├── recipes/
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── tags/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── error.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── globals.css
│   └── layout.tsx
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   ├── Pagination.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── EmptyState.tsx
│   │
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── Sidebar.tsx
│       └── AdminSidebar.tsx
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── recipes/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── comments/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── index.ts
│   │
│   ├── favorites/
│   ├── ratings/
│   ├── notifications/
│   ├── users/
│   ├── reports/
│   └── ai/
│
├── hooks/
│   ├── useDebounce.ts
│   ├── usePagination.ts
│   └── useLocalStorage.ts
│
├── lib/
│   ├── api-client.ts
│   ├── auth.ts
│   ├── env.ts
│   └── utils.ts
│
├── stores/
│   ├── auth.store.ts
│   ├── notification.store.ts
│   └── theme.store.ts
│
├── constants/
│   ├── routes.ts
│   ├── api-endpoints.ts
│   └── roles.ts
│
├── utils/
│   ├── format-date.ts
│   ├── format-number.ts
│   ├── format-time.ts
│   ├── handle-api-error.ts
│   └── upload-image.ts
│
├── types/
│   ├── api.ts
│   ├── common.ts
│   └── pagination.ts
│
├── middleware.ts
│
├── public/
│   ├── images/
│   ├── icons/
│   ├── logo/
│   └── favicon.ico
│
├── .env.example
├── components.json
├── next.config.ts
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
└── pnpm-lock.yaml