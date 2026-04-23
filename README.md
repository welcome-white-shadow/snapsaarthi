# SnapSaarthi Quick Start Guide

This project is a high-performance monorepo for enterprise image management.

## 🚀 How to Run

Due to environment restrictions, you will need to run the following commands in your local terminal:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Update the `DATABASE_URL` in the [`.env`](file:///e:/snapsaarthi/.env) file with your MongoDB connection string.

### 3. Generate Database Client
```bash
npx prisma generate --schema=./packages/database/prisma/schema.prisma
```

### 4. Start Development Servers
Run the following from the root directory to start both the frontend and backend:
```bash
npm run dev
```

## 📂 Project Structure
- `apps/web`: Next.js Landing Page & UI
- `apps/api`: Express Backend (Clean Architecture)
- `packages/database`: Prisma & MongoDB Schema
- `packages/ui`: Shared React Component Library
