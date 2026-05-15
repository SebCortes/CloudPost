#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"

# Load .env variables
if [[ -f "$SCRIPT_DIR/.env" ]]; then
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
else
    echo "Warning: .env file not found in $SCRIPT_DIR. Make sure to set environment variables manually."
fi

: "${POSTGRES_USER:?POSTGRES_USER is not set}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is not set}"
: "${POSTGRES_DB:?POSTGRES_DB is not set}"

echo "Starting Cloud Post local environment..."
echo "Building images..."
docker compose -f "$COMPOSE_FILE" build

echo "Generating Prisma client..."
docker compose -f "$COMPOSE_FILE" run --rm --no-deps cloud-post-api npx prisma generate

echo "Starting PostgreSQL..."
docker compose -f "$COMPOSE_FILE" up -d cloud-post-db

echo "Waiting for PostgreSQL to be ready..."
for ((attempt = 1; attempt <= 30; attempt++)); do
	if docker compose -f "$COMPOSE_FILE" exec -T cloud-post-db pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
		echo "PostgreSQL is ready."
		break
	fi

	if [[ "$attempt" -eq 30 ]]; then
		echo "PostgreSQL did not become ready in time."
		docker compose -f "$COMPOSE_FILE" logs --no-color cloud-post-db
		exit 1
	fi

	printf '.'
	sleep 2
done
echo

echo "Running Prisma migrations..."
docker compose -f "$COMPOSE_FILE" run --rm --no-deps cloud-post-api npx prisma migrate deploy

echo "Starting application services..."
docker compose -f "$COMPOSE_FILE" up -d

echo "Setup complete."
