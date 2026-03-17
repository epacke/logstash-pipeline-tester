.PHONY: help dev dev-logstash dev-backend dev-frontend dev-ui stop build build-backend build-frontend lint test install clean

help: ## Show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start all services with hot-reload (Logstash, Backend, Frontend)
	BACKEND_ENDPOINT=http://host.docker.internal:8080/api/v1/receiveLogstashOutput \
	  npx concurrently -n logstash,backend,frontend -c yellow,blue,green \
	    "docker compose up logstash" \
	    "npm run dev --prefix pipeline-ui/backend" \
	    "npm run dev --prefix pipeline-ui/frontend"

dev-logstash: ## Start only Logstash in Docker (backend must be running separately)
	BACKEND_ENDPOINT=http://host.docker.internal:8080/api/v1/receiveLogstashOutput \
	  docker compose up logstash

dev-backend: ## Start only Backend with hot-reload
	cd pipeline-ui/backend && npm run dev

dev-frontend: ## Start only Frontend with hot-reload
	cd pipeline-ui/frontend && npm run dev

dev-ui: ## Start Backend + Frontend together (no Logstash)
	cd pipeline-ui && npm run dev

stop: ## Stop all services and Docker containers
	@echo "Stopping all services..."
	@pkill -f "pipeline-ui/backend.*nodemon" 2>/dev/null || true
	@pkill -f "pipeline-ui/frontend.*vite" 2>/dev/null || true
	@docker compose down
	@echo "All services stopped"

build: build-backend build-frontend ## Build both backend and frontend

build-backend: ## Build backend TypeScript
	cd pipeline-ui/backend && npm run build

build-frontend: ## Build frontend for production
	cd pipeline-ui/frontend && npm run build

lint: ## Lint frontend and backend
	cd pipeline-ui/frontend && npm run lint
	cd pipeline-ui/backend && npm run lint

test: ## Run integration tests (requires app to be running via make dev or make dev-ui)
	cd pipeline-ui/integration-tests && npm start

install: ## Install dependencies for backend and frontend
	cd pipeline-ui && npm install
	cd pipeline-ui/backend && npm install
	cd pipeline-ui/frontend && npm install

clean: ## Clean build artifacts and Docker containers
	docker compose down
	rm -rf pipeline-ui/backend/build
	rm -rf pipeline-ui/frontend/dist

.DEFAULT_GOAL := help
