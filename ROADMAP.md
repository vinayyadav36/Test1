# SME Sync Platform — Roadmap

## Goals

Build a lightweight, multi-tenant SaaS platform for small and medium businesses (SMEs) to manage two critical operations:
1. **Customer Feedback** — Capture, store, and analyse customer feedback (voice/text).
2. **Inventory Management** — Track stock, record movements (sales/purchases), and generate AI-powered restock suggestions.

## Architecture

- **Backend**: Node.js + Express + TypeScript with local JSON document storage (`backend/data`), multi-tenant via `businessId` scoping.
- **Frontend**: React + TypeScript (Vite), Axios, React Router.
- **Auth**: Demo header-based auth (`x-demo-user-id`); designed for JWT replacement in v2.
- **Monorepo**: Root `package.json` with workspace scripts for backend and frontend.

## Modules

### Core Auth
- Business (tenant) model with slug-based identification.
- User model scoped to a business with roles: `owner`, `staff`, `admin`.
- Auth middleware reads `x-demo-user-id` header and resolves the user + business context.
- Tenant middleware enforces `businessId` presence on every protected route.

### Feedback Module
- **Model**: `Feedback` — stores rating, transcript, sentiment, serviceType, staffName, customerPhone per business.
- **Service**: `feedbackService` — create and paginated-list operations.
- **API**: `POST /api/feedback`, `GET /api/feedback?page=&limit=`.

### Inventory Module
- **Models**: `Product` (name, SKU, unit, stock) and `InventoryMovement` (sale/purchase/adjustment).
- **Service**: `forecastingService` — 30-day moving average to generate restock suggestions.
- **API**:
  - `POST /api/inventory/products` — create product
  - `GET /api/inventory/products` — list products
  - `POST /api/inventory/movements` — record stock movement (auto-updates `currentStock`)
  - `GET /api/inventory/restock` — restock suggestions with configurable horizon and safety factor

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | No | Server health check |
| GET | /api/feedback | Yes | List paginated feedback |
| POST | /api/feedback | Yes | Submit new feedback |
| GET | /api/inventory/products | Yes | List products |
| POST | /api/inventory/products | Yes | Create a product |
| POST | /api/inventory/movements | Yes | Record stock movement |
| GET | /api/inventory/restock | Yes | Get restock suggestions |

## Frontend Screens

- **Login** — Enter demo user ID (from seed script) to authenticate.
- **Dashboard** — Summary stats: total feedback count, products needing restock.
- **Feedback** — Submit new feedback + paginated feedback table.
- **Inventory** — Add products, record sales, view stock table, and restock suggestion table.

## Future Plans

- **v2**: Replace demo header auth with proper JWT authentication (bcrypt password hashing, refresh tokens).
- **Voice Feedback**: Add optional offline/local transcription for voice-based feedback capture.
- **Sentiment Analysis**: Auto-classify feedback sentiment using local NLP models.
- **In-App Alerts**: Alert owners inside the platform when stock drops below reorder level.
- **Analytics Dashboard**: Charts for feedback trends, top-rated staff, stock velocity.
- **Role-based Access Control**: Granular permissions per module per role.
- **Offline Support**: PWA with service workers for kirana shops with intermittent connectivity.
- **Multi-language UI**: Hindi, Tamil, Telugu support for Indian SME market.
