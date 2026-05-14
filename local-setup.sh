#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.local.yml"

: "${USER_POSTGRES_USER:?USER_POSTGRES_USER is not set}"
: "${USER_POSTGRES_PASSWORD:?USER_POSTGRES_PASSWORD is not set}"
: "${USER_POSTGRES_DB:?USER_POSTGRES_DB is not set}"

echo "Starting Cloud Note local environment..."
echo "Building images..."
docker compose -f "$COMPOSE_FILE" build

echo "Starting PostgreSQL..."
docker compose -f "$COMPOSE_FILE" up -d cloud-note-db

echo "Waiting for PostgreSQL to be ready..."
for ((attempt = 1; attempt <= 30; attempt++)); do
	if docker compose -f "$COMPOSE_FILE" exec -T cloud-note-db pg_isready -U "$USER_POSTGRES_USER" -d "$USER_POSTGRES_DB" >/dev/null 2>&1; then
		echo "PostgreSQL is ready."
		break
	fi

	if [[ "$attempt" -eq 30 ]]; then
		echo "PostgreSQL did not become ready in time."
		docker compose -f "$COMPOSE_FILE" logs --no-color cloud-note-db
		exit 1
	fi

	printf '.'
	sleep 2
done
echo

echo "Running Prisma migrations..."
docker compose -f "$COMPOSE_FILE" run --rm --no-deps cloud-note-api npx prisma migrate deploy

echo "Starting application services..."
docker compose -f "$COMPOSE_FILE" up -d

echo "Setup complete."
