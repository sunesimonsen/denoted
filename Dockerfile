FROM node:22.6.0-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

FROM sunesimonsen/spa-base-image

COPY --from=builder /app/dist public
