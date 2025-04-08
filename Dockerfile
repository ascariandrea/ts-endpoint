# syntax=docker/dockerfile:1
FROM node:22-slim

EXPOSE 3000 35729

WORKDIR /app

COPY ./website /app/website

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

RUN corepack enable

RUN pnpm install

