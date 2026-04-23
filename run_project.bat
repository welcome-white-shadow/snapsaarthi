@echo off
npm install
npm install mongodb
npx prisma generate --schema=./packages/database/prisma/schema.prisma || echo "Prisma ignored"
npx prisma db push --schema=./packages/database/prisma/schema.prisma --accept-data-loss || echo "Prisma ignored"
npm run dev
