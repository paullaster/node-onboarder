FROM node:21.6.2-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app


COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

COPY .env.production .env.production

EXPOSE 3500

CMD [ "node", "--env-file=/app/.env.production", "./server.js" ]