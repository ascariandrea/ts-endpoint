FROM node:20-slim

WORKDIR /app/website

EXPOSE 3000 35729
COPY ./docs /app/docs
COPY ./website /app/website

RUN pnpm install

CMD ["pnpm", "start"]
