# ForgeAI MERN app — build the Vite client, run the Express server
FROM node:20-alpine AS client-build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY client/package.json client/package-lock.json* ./client/
RUN cd client && npm install --include=dev
COPY client ./client
RUN cd client && npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY server ./server
COPY --from=client-build /app/client/dist ./client/dist
EXPOSE 5000
CMD ["node", "server/index.js"]