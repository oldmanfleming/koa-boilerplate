FROM node:lts

WORKDIR /app

COPY package*.json ./
COPY build ./
COPY scripts/wait-for-it.sh ./

RUN chmod +x ./wait-for-it.sh

RUN npm ci --only=production

ENV NODE_ENV "production"

EXPOSE 3000

CMD ["node", "src/server.js"]