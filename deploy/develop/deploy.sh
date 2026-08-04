#!/usr/bin/env bash
set -Eeuo pipefail

DEPLOY_DIR=/home/ec2-user/foodie-develop
cd "$DEPLOY_DIR"

: "${DOCKERHUB_USERNAME:?Missing DOCKERHUB_USERNAME}"
: "${DOCKERHUB_TOKEN:?Missing DOCKERHUB_TOKEN}"
: "${NEXT_PUBLIC_API_URL:?Missing NEXT_PUBLIC_API_URL}"

umask 077

if [ ! -f .env ]; then
  POSTGRES_PASSWORD="$(openssl rand -hex 24)"
  JWT_SECRET="$(openssl rand -hex 48)"
else
  # This file only contains shell-safe generated hex values and the image owner.
  # shellcheck disable=SC1091
  source .env
fi

cat > .env <<EOF
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
JWT_SECRET=${JWT_SECRET}
DOCKERHUB_USERNAME=${DOCKERHUB_USERNAME}
EOF

frontend_url="${DEVELOP_FRONTEND_URL:-}"
if [ -z "$frontend_url" ]; then
  frontend_url="${NEXT_PUBLIC_API_URL%/}"
  frontend_url="${frontend_url%/api}"
  if [[ "$frontend_url" == *:3001 ]]; then
    frontend_url="${frontend_url%:3001}:3000"
  fi
fi

cookie_secure=false
if [[ "$NEXT_PUBLIC_API_URL" == https://* ]]; then
  cookie_secure=true
fi

cat > app.env <<EOF
DATABASE_URL=postgresql://foodie_user:${POSTGRES_PASSWORD}@postgres:5432/foodie_db
PORT=3001
NODE_ENV=production
COOKIE_SECURE=${cookie_secure}
FRONTEND_URL=${frontend_url}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-}
AWS_REGION=${AWS_REGION:-ap-southeast-1}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-}
AWS_BUCKET_NAME=${AWS_BUCKET_NAME:-}
BEDROCK_MODEL_ID=${BEDROCK_MODEL_ID:-anthropic.claude-3-5-sonnet-20240620-v1:0}
CLOUDFRONT_DOMAIN=${CLOUDFRONT_DOMAIN:-}
CLOUDFRONT_KEY_PAIR_ID=${CLOUDFRONT_KEY_PAIR_ID:-}
CLOUDFRONT_PRIVATE_KEY_BASE64=${CLOUDFRONT_PRIVATE_KEY_BASE64:-}
CLOUDFRONT_URL_EXPIRES_IN=${CLOUDFRONT_URL_EXPIRES_IN:-300}
RESEND_API_KEY=${RESEND_API_KEY:-}
EMAIL_FROM=${EMAIL_FROM:-}
EOF

printf '%s' "$DOCKERHUB_TOKEN" | docker login --username "$DOCKERHUB_USERNAME" --password-stdin
docker compose pull
docker compose up -d --remove-orphans
docker compose ps

test "$(docker inspect -f '{{.State.Running}}' foodie-develop-api)" = "true"
test "$(docker inspect -f '{{.State.Running}}' foodie-develop-web)" = "true"
