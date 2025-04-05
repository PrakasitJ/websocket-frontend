FROM oven/bun:latest as dev

WORKDIR /app

COPY . .

RUN bun install

FROM node:latest as prod

WORKDIR /app

COPY . .
COPY --from=dev /app/node_modules /app/node_modules

RUN npm install

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]