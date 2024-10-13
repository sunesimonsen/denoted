FROM node:22.6.0-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

FROM node:22.6.0-alpine

COPY --from=builder /app/dist dist

RUN npm install -g serve

EXPOSE 8080

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["serve", "-s", "-p", "8080", "dist"]
