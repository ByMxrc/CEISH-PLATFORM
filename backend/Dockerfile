FROM node:22-alpine AS build
WORKDIR /app/backend

RUN apk add --no-cache python3 make g++ openssl

COPY backend/package*.json ./
RUN npm ci

COPY backend ./
COPY database/prisma /app/database/prisma

RUN npm run prisma:generate && npm run build

FROM node:22-alpine AS runtime
WORKDIR /app/backend
ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY --from=build /app/backend/package*.json ./
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/src/commands ./src/commands
COPY --from=build /app/backend/tsconfig.json ./tsconfig.json
COPY --from=build /app/database/prisma /app/database/prisma

EXPOSE 3000
CMD ["node", "dist/main"]
