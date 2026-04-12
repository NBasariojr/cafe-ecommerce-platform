# =============================================================================
# CafeBrew — Local Dev Makefile
# Run from cafe-platform/ root.
# Requires: Docker Desktop, pnpm
# =============================================================================

.PHONY: dev down logs mongo redis-cli seed reset check-env

# Start MongoDB and Redis in the background.
# Reads credentials from docker/.env.
# On first run, mongo-init.js creates the app user and database.
dev:
    @echo "Starting MongoDB and Redis..."
    @docker compose --env-file docker/.env up -d
    @echo ""
    @echo "Infrastructure is running."
    @echo "  MongoDB : localhost:27017"
    @echo "  Redis   : localhost:6379"
    @echo ""
    @echo "Now start the backend in a separate terminal:"
    @echo "  cd apps/backend && pnpm dev"
    @echo ""
    @echo "And the web app in another terminal:"
    @echo "  cd apps/web && pnpm dev"

# Stop containers (data volumes are preserved).
down:
    @docker compose --env-file docker/.env down

# Follow logs for both containers.
logs:
    @docker compose --env-file docker/.env logs -f

# Open a MongoDB shell inside the container.
mongo:
    @docker exec -it cafe-mongodb mongosh \
        --username $$(grep MONGO_APP_USERNAME docker/.env | cut -d= -f2) \
        --password $$(grep MONGO_APP_PASSWORD docker/.env | cut -d= -f2) \
        --authenticationDatabase $$(grep MONGO_APP_DATABASE docker/.env | cut -d= -f2) \
        $$(grep MONGO_APP_DATABASE docker/.env | cut -d= -f2)

# Open a Redis CLI shell inside the container.
redis-cli:
    @docker exec -it cafe-redis redis-cli

# Run the seed script (requires MongoDB to be running and backend deps installed).
seed:
    @echo "Running seed script..."
    @cd apps/backend && pnpm seed

# Destroy all data volumes — nuclear reset, all local data is lost.
# You will need to re-seed after this.
reset:
    @echo "WARNING: This will destroy all local MongoDB and Redis data."
    @echo "Press Ctrl+C to cancel, or Enter to continue."
    @read confirm
    @docker compose --env-file docker/.env down -v
    @echo "Volumes destroyed. Run 'make dev' to start fresh."

# Check that required files exist before starting.
check-env:
    @test -f docker/.env || (echo "ERROR: docker/.env not found. Copy docker/.env.example to docker/.env and fill in values." && exit 1)
    @test -f apps/backend/.env || (echo "ERROR: apps/backend/.env not found. Copy .env.local.example to apps/backend/.env and fill in values." && exit 1)
    @echo "Environment files OK."