# Jenkins CI/CD Setup Guide
## Dynamic Event Invitation System

---

## Overview

This document covers the complete CI/CD pipeline setup for the Dynamic Event Invitation System using Jenkins. The pipeline automates deployment to the production server whenever code is pushed to the `release_v1` branch.

---

## Infrastructure

| Component | Details |
|-----------|---------|
| **Production Server** | `95.216.188.135` (Ubuntu 24.04) |
| **Jenkins URL** | `http://95.216.188.135:8081` |
| **Frontend URL** | `http://95.216.188.135:8091` |
| **Backend URL** | `http://95.216.188.135:8090/api` |
| **MinIO Console** | `http://95.216.188.135:9001` |
| **GitHub Repository** | `https://github.com/sachinthadilshandisanayaka/dynamic-event-invitation.git` |
| **Deploy Branch** | `release_v1` |

### Existing services on the same server (do not touch)

| Container | Ports | Purpose |
|-----------|-------|---------|
| `travel-srilanka-nginx` | 80, 443 | Existing travel site frontend |
| `travel-srilanka-backend` | 8080 (internal) | Existing travel site backend |
| `travel-srilanka-db` | 5432 (internal) | Existing travel site database |
| `jenkins` | 8081, 50000 | Shared Jenkins instance |
| `event-minio` | 9000, 9001 | MinIO object storage (shared) |

---

## Repository Branch Strategy

```
main          Production archive. Stable, tagged releases.
  │
  └── release_v1    Jenkins deploys this branch to production.
         │
         └── develop     Day-to-day development. Features merge here first.
```

### Workflow

1. Do all development work on `develop` (or feature branches off `develop`).
2. When ready to release, merge `develop` → `release_v1`.
3. Push `release_v1` to GitHub.
4. Jenkins detects the push (webhook) or manually trigger **Build Now**.

```bash
# Typical release flow
git checkout develop
# ... commit your changes ...
git push origin develop

# Promote to production
git checkout release_v1
git merge develop
git push origin release_v1
# Jenkins auto-deploys (if webhook is set up) or click Build Now
```

---

## Server Directory Structure

```
/root/event-invitation-system/
├── .env                  ← Production secrets (NOT in git)
├── docker-compose.yml    ← Reads vars from .env
├── Jenkinsfile           ← Pipeline definition (in git)
├── backend/              ← Spring Boot source + Dockerfile
└── frontend/             ← React source + Dockerfile + nginx.conf
```

### `.env` file (production values — never commit this)

Located at `/root/event-invitation-system/.env` on the server:

```env
# MinIO (runs separately on this server)
MINIO_ENDPOINT=http://95.216.188.135:9000
MINIO_ACCESS_KEY=eventinvite
MINIO_SECRET_KEY=EventInvite2024!
MINIO_PUBLIC_URL=http://95.216.188.135:9000

# JWT (use a strong random key in production)
JWT_SECRET=YourSuperSecretJwtKeyThatIsAtLeast256BitsLong_ChangeInProduction!

# CORS — comma-separated allowed origins
CORS_ALLOWED_ORIGINS=http://95.216.188.135:8091

# Frontend build-time variables
VITE_API_URL=http://95.216.188.135:8090
VITE_MINIO_PUBLIC_URL=http://95.216.188.135:9000
```

> **Important:** This file is created manually on the server. It is listed in `.gitignore` and must never be pushed to GitHub.

---

## Pipeline Stages

The `Jenkinsfile` at the repository root defines 4 stages:

```
┌─────────────────┐   ┌──────────────────────┐   ┌─────────────────┐   ┌──────────────┐
│ Pull Latest Code │ → │ Stop Old Containers  │ → │ Build & Deploy  │ → │ Health Check │
└─────────────────┘   └──────────────────────┘   └─────────────────┘   └──────────────┘
   git pull origin         docker compose down       docker compose           curl BE
   release_v1              --remove-orphans          up -d --build            curl FE
```

### Stage Details

#### 1. Pull Latest Code
```groovy
sh "cd ${PROJECT_DIR} && git fetch origin && git checkout ${BRANCH} && git pull origin ${BRANCH}"
```
Fetches and applies the latest commits from `release_v1`.

#### 2. Stop Old Containers
```groovy
sh "docker compose -f ${COMPOSE_FILE} down --remove-orphans || true"
```
Gracefully stops backend and frontend containers. The `|| true` prevents failure if containers are already stopped. MinIO, PostgreSQL, and Redis are unaffected.

#### 3. Build & Deploy
```groovy
sh "docker compose -f ${COMPOSE_FILE} up -d --build"
```
Rebuilds Docker images from source (Maven build for backend, npm build for frontend) and starts the containers. Build time is approximately 4–6 minutes.

#### 4. Health Check
```groovy
sh 'sleep 40'
sh 'curl -sf http://localhost:8090/api/actuator/health | grep -q \'"status":"UP"\''
sh 'curl -sf -o /dev/null -w "%{http_code}" http://localhost:8091 | grep -q 200'
```
Waits 40 seconds for Spring Boot to fully start, then checks:
- Backend health endpoint returns `{"status":"UP"}`
- Frontend returns HTTP 200

If either check fails, the build is marked **FAILED** and the last 80 log lines are printed.

---

## Jenkins Job Configuration

### Job name
`event-invitation-deploy`

### Pipeline type
**Pipeline from SCM** — reads `Jenkinsfile` directly from the GitHub repository.

| Setting | Value |
|---------|-------|
| SCM | Git |
| Repository URL | `https://github.com/sachinthadilshandisanayaka/dynamic-event-invitation.git` |
| Branch | `*/release_v1` |
| Script Path | `Jenkinsfile` |
| Lightweight checkout | ✓ Enabled |

The job config XML is stored at:
```
/var/lib/docker/volumes/jenkins_home/_data/jobs/event-invitation-deploy/config.xml
```

---

## How to Trigger a Deployment

### Option A — Manual (Build Now)

1. Open `http://95.216.188.135:8081` in a browser.
2. Log in with your Jenkins admin credentials.
3. Click **`event-invitation-deploy`**.
4. Click **Build Now** in the left sidebar.
5. Click the build number (e.g., `#1`) → **Console Output** to watch the logs.

### Option B — GitHub Webhook (Automatic on push)

Set this up once to auto-deploy whenever `release_v1` is pushed.

#### Step 1 — Configure Jenkins job
1. Open the job → **Configure**.
2. Scroll to **Build Triggers**.
3. Tick **GitHub hook trigger for GITScm polling**.
4. Click **Save**.

#### Step 2 — Add webhook in GitHub
1. Go to the repository → **Settings → Webhooks → Add webhook**.
2. Fill in:

   | Field | Value |
   |-------|-------|
   | Payload URL | `http://95.216.188.135:8081/github-webhook/` |
   | Content type | `application/json` |
   | Trigger | Just the push event |

3. Click **Add webhook**.

After this, every `git push origin release_v1` will automatically trigger a build.

---

## Monitoring a Build

### Console output
Jenkins UI → job → build number → **Console Output**

### Container status (after deploy)
```bash
ssh root@95.216.188.135
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

Expected output after a successful deploy:

```
NAMES                      STATUS                    PORTS
event-frontend             Up X minutes              0.0.0.0:8091->80/tcp
event-backend              Up X minutes (healthy)    0.0.0.0:8090->8080/tcp
event-postgres             Up X hours (healthy)      0.0.0.0:5433->5432/tcp
event-redis                Up X hours (healthy)      0.0.0.0:6380->6379/tcp
event-minio                Up X hours (healthy)      0.0.0.0:9000-9001->9000-9001/tcp
```

### Application logs
```bash
docker logs event-backend --tail 100 -f
docker logs event-frontend --tail 50
```

---

## Rollback Procedure

If a deployment breaks production, roll back to the previous working commit:

```bash
ssh root@95.216.188.135

cd /root/event-invitation-system

# Find the last good commit hash
git log --oneline -10

# Roll back to it
git checkout <commit-hash>

# Rebuild and restart
docker compose down
docker compose up -d --build
```

Alternatively, revert the bad commit on `release_v1` and push — Jenkins will auto-deploy the revert.

---

## Local Development Setup

### Prerequisites

| Tool | Required Version | Notes |
|------|-----------------|-------|
| Java | 21 | Use Microsoft OpenJDK at `/Library/Java/JavaVirtualMachines/ms-21.0.10` |
| Maven | 3.9+ | |
| Node.js | 20+ | Use `nvm use 20` |
| PostgreSQL | 14+ | Installed via Homebrew |
| Redis | 7+ | Installed via Homebrew |

### Start services

```bash
brew services start postgresql@14
brew services start redis
```

### Backend

```bash
cd backend
JAVA_HOME="/Users/sachinthadilshan/Library/Java/JavaVirtualMachines/ms-21.0.10/Contents/Home" \
  mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The `application-local.yml` profile points to local PostgreSQL and Redis, and to the remote MinIO on `95.216.188.135:9000`.

### Frontend

```bash
cd frontend
nvm use 20
npm run dev
```

Vite starts at `http://localhost:5173`.
API calls go to `http://localhost:8090` (set in `frontend/.env.local`).

### Stop services

```bash
pkill -f "spring-boot:run"
pkill -f "vite"
```

---

## Default Credentials

| Service | Username | Password | Notes |
|---------|----------|----------|-------|
| Admin login | `admin@eventinvite.local` | `Admin@1234` | Change after first login |
| PostgreSQL | `eventinvite` | `eventinvite2024` | |
| MinIO | `eventinvite` | `EventInvite2024!` | |
| Jenkins | `admin` | *(set during Jenkins setup)* | |

---

## Port Reference

| Port | Service | Visible externally |
|------|---------|-------------------|
| 80 / 443 | Travel site nginx | Yes |
| 8081 | Jenkins | Yes |
| 8090 | Event invitation backend | Yes |
| 8091 | Event invitation frontend | Yes |
| 9000 | MinIO API | Yes |
| 9001 | MinIO Console | Yes |
| 5433 | Event invitation PostgreSQL | Yes (dev only) |
| 6380 | Event invitation Redis | Yes (dev only) |
| 5432 | Travel site PostgreSQL | No (internal) |
| 50000 | Jenkins agent | Yes |

---

## Known Issues & Notes

| Issue | Resolution |
|-------|-----------|
| Java 24 breaks Lombok annotation processing | Always use Java 21 (`ms-21.0.10`) for local builds |
| `flyway-database-postgresql` missing version | Use `flyway-core` instead (Flyway 9.x bundled with Spring Boot 3.2) |
| MinIO port conflict on server | MinIO runs from a separate compose file; removed from main `docker-compose.yml` |
| Backend health check 404 | Context path is `/api` — health endpoint is `/api/actuator/health` |
| Admin login fails on fresh DB | Seed hash must be generated by pgcrypto — not a static bcrypt string |
