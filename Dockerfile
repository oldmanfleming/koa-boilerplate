FROM node:lts

WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

COPY package*.json ./
COPY build ./
COPY scripts/wait-for-it.sh ./

RUN chmod +x ./wait-for-it.sh

RUN npm ci --only=production

EXPOSE 3000

CMD ["node", "src/server.js"]