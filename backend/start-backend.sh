#!/usr/bin/env bash
# Permanent backend startup script with auto-restart.
# Run once: bash start-backend.sh
# The loop keeps the backend alive if it crashes.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JAR="$SCRIPT_DIR/target/event-invite-backend-1.0.0.jar"
LOG="$SCRIPT_DIR/backend.log"

export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5433/eventinvite"
export SPRING_DATASOURCE_USERNAME="eventinvite"
export SPRING_DATASOURCE_PASSWORD="eventinvite2024"
export SPRING_DATA_REDIS_HOST="localhost"
export SPRING_DATA_REDIS_PORT="6380"
export JWT_SECRET="YourSuperSecretJwtKeyThatIsAtLeast256BitsLong_ChangeInProduction!"
export JWT_EXPIRATION_MS="900000"
export JWT_REFRESH_EXPIRATION_MS="604800000"
export CORS_ALLOWED_ORIGINS="http://localhost:5173"
export MINIO_ENDPOINT="http://localhost:9000"
export MINIO_ACCESS_KEY="eventinvite"
export MINIO_SECRET_KEY="EventInvite2024!"
export MINIO_BUCKET="event-media"
export MINIO_PUBLIC_URL="http://localhost:9000"
export SERVER_PORT="8090"

echo "[$(date)] Starting backend..." | tee -a "$LOG"

while true; do
  java -jar "$JAR" >> "$LOG" 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Backend exited with code $EXIT_CODE. Restarting in 3s..." | tee -a "$LOG"
  sleep 3
done
