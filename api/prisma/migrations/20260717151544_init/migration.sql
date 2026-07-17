-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "RecipeDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "RecipeImageType" AS ENUM ('THUMBNAIL', 'INGREDIENT', 'STEP', 'RESULT', 'AI_GENERATED', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LIKE', 'COMMENT', 'FOLLOW', 'REPORT', 'AI_GENERATION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AIGenerationStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "avatar_url" TEXT,
    "bio" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "otp_code" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_categories" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "category_id" BIGINT,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "calories" DECIMAL(10,2),
    "cook_time" INTEGER,
    "difficulty" "RecipeDifficulty" NOT NULL DEFAULT 'EASY',
    "servings" INTEGER,
    "thumbnail" TEXT,
    "source" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "view_count" BIGINT NOT NULL DEFAULT 0,
    "like_count" BIGINT NOT NULL DEFAULT 0,
    "favorite_count" BIGINT NOT NULL DEFAULT 0,
    "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_ingredients" (
    "id" BIGSERIAL NOT NULL,
    "recipe_id" BIGINT NOT NULL,
    "ingredient_name" VARCHAR(150) NOT NULL,
    "quantity" DECIMAL(10,2),
    "unit" VARCHAR(50),
    "display_order" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_steps" (
    "id" BIGSERIAL NOT NULL,
    "recipe_id" BIGINT NOT NULL,
    "step_number" INTEGER NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "recipe_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_images" (
    "id" BIGSERIAL NOT NULL,
    "recipe_id" BIGINT NOT NULL,
    "image_url" TEXT NOT NULL,
    "type" "RecipeImageType" NOT NULL DEFAULT 'OTHER',
    "display_order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_tags" (
    "recipe_id" BIGINT NOT NULL,
    "tag_id" BIGINT NOT NULL,

    CONSTRAINT "recipe_tags_pkey" PRIMARY KEY ("recipe_id","tag_id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "user_id" BIGINT NOT NULL,
    "recipe_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("user_id","recipe_id")
);

-- CreateTable
CREATE TABLE "recipe_likes" (
    "user_id" BIGINT NOT NULL,
    "recipe_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_likes_pkey" PRIMARY KEY ("user_id","recipe_id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "user_id" BIGINT NOT NULL,
    "recipe_id" BIGINT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("user_id","recipe_id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" BIGSERIAL NOT NULL,
    "recipe_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "parent_comment_id" BIGINT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "reference_id" BIGINT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_follows" (
    "follower_id" BIGINT NOT NULL,
    "following_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_follows_pkey" PRIMARY KEY ("follower_id","following_id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" BIGSERIAL NOT NULL,
    "recipe_id" BIGINT NOT NULL,
    "reporter_id" BIGINT NOT NULL,
    "reason" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "handled_by" BIGINT,
    "handled_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_history" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT,
    "keyword" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_generation_history" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "recipe_id" BIGINT,
    "image_url" TEXT,
    "detected_labels" JSONB,
    "prompt" TEXT,
    "model" VARCHAR(100),
    "status" "AIGenerationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_generation_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "otp_verifications_user_id_idx" ON "otp_verifications"("user_id");

-- CreateIndex
CREATE INDEX "otp_verifications_expires_at_idx" ON "otp_verifications"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "refresh_tokens_revoked_idx" ON "refresh_tokens"("revoked");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_categories_name_key" ON "recipe_categories"("name");

-- CreateIndex
CREATE INDEX "recipes_user_id_idx" ON "recipes"("user_id");

-- CreateIndex
CREATE INDEX "recipes_category_id_idx" ON "recipes"("category_id");

-- CreateIndex
CREATE INDEX "recipes_title_idx" ON "recipes"("title");

-- CreateIndex
CREATE INDEX "recipes_created_at_idx" ON "recipes"("created_at");

-- CreateIndex
CREATE INDEX "recipes_is_public_deleted_at_idx" ON "recipes"("is_public", "deleted_at");

-- CreateIndex
CREATE INDEX "recipes_view_count_idx" ON "recipes"("view_count");

-- CreateIndex
CREATE INDEX "recipes_like_count_idx" ON "recipes"("like_count");

-- CreateIndex
CREATE INDEX "recipes_average_rating_idx" ON "recipes"("average_rating");

-- CreateIndex
CREATE INDEX "recipe_ingredients_recipe_id_idx" ON "recipe_ingredients"("recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_ingredients_recipe_id_display_order_key" ON "recipe_ingredients"("recipe_id", "display_order");

-- CreateIndex
CREATE INDEX "recipe_steps_recipe_id_idx" ON "recipe_steps"("recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_steps_recipe_id_step_number_key" ON "recipe_steps"("recipe_id", "step_number");

-- CreateIndex
CREATE INDEX "recipe_images_recipe_id_idx" ON "recipe_images"("recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_images_recipe_id_display_order_key" ON "recipe_images"("recipe_id", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "recipe_tags_tag_id_idx" ON "recipe_tags"("tag_id");

-- CreateIndex
CREATE INDEX "favorites_recipe_id_idx" ON "favorites"("recipe_id");

-- CreateIndex
CREATE INDEX "favorites_created_at_idx" ON "favorites"("created_at");

-- CreateIndex
CREATE INDEX "recipe_likes_recipe_id_idx" ON "recipe_likes"("recipe_id");

-- CreateIndex
CREATE INDEX "recipe_likes_created_at_idx" ON "recipe_likes"("created_at");

-- CreateIndex
CREATE INDEX "ratings_recipe_id_idx" ON "ratings"("recipe_id");

-- CreateIndex
CREATE INDEX "comments_recipe_id_idx" ON "comments"("recipe_id");

-- CreateIndex
CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");

-- CreateIndex
CREATE INDEX "comments_parent_comment_id_idx" ON "comments"("parent_comment_id");

-- CreateIndex
CREATE INDEX "comments_created_at_idx" ON "comments"("created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "user_follows_following_id_idx" ON "user_follows"("following_id");

-- CreateIndex
CREATE INDEX "user_follows_created_at_idx" ON "user_follows"("created_at");

-- CreateIndex
CREATE INDEX "reports_reporter_id_idx" ON "reports"("reporter_id");

-- CreateIndex
CREATE INDEX "reports_handled_by_idx" ON "reports"("handled_by");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_created_at_idx" ON "reports"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "reports_recipe_id_reporter_id_key" ON "reports"("recipe_id", "reporter_id");

-- CreateIndex
CREATE INDEX "search_history_user_id_idx" ON "search_history"("user_id");

-- CreateIndex
CREATE INDEX "search_history_keyword_idx" ON "search_history"("keyword");

-- CreateIndex
CREATE INDEX "search_history_created_at_idx" ON "search_history"("created_at");

-- CreateIndex
CREATE INDEX "ai_generation_history_user_id_idx" ON "ai_generation_history"("user_id");

-- CreateIndex
CREATE INDEX "ai_generation_history_recipe_id_idx" ON "ai_generation_history"("recipe_id");

-- CreateIndex
CREATE INDEX "ai_generation_history_status_idx" ON "ai_generation_history"("status");

-- CreateIndex
CREATE INDEX "ai_generation_history_created_at_idx" ON "ai_generation_history"("created_at");

-- AddForeignKey
ALTER TABLE "otp_verifications" ADD CONSTRAINT "otp_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "recipe_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_images" ADD CONSTRAINT "recipe_images_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_likes" ADD CONSTRAINT "recipe_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_likes" ADD CONSTRAINT "recipe_likes_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_handled_by_fkey" FOREIGN KEY ("handled_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_generation_history" ADD CONSTRAINT "ai_generation_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_generation_history" ADD CONSTRAINT "ai_generation_history_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
