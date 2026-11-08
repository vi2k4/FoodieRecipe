CREATE TABLE "login_history" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "ip_address" VARCHAR(255) NOT NULL,
    "user_agent" TEXT,
    "login_method" VARCHAR(30) NOT NULL DEFAULT 'PASSWORD',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "login_history_user_id_created_at_idx" ON "login_history"("user_id", "created_at");
CREATE INDEX "login_history_created_at_idx" ON "login_history"("created_at");
CREATE INDEX "login_history_ip_address_idx" ON "login_history"("ip_address");

ALTER TABLE "login_history"
ADD CONSTRAINT "login_history_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
