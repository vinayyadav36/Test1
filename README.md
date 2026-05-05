# SME Sync Platform

A multi-tenant platform for small businesses to manage customer feedback and inventory.

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend
cd backend
cp .env.example .env
npm install
npm run dev

### Frontend
cd frontend
npm install
npm run dev

### Seed Demo Data
cd backend
npx ts-node src/scripts/seedDemoUser.ts