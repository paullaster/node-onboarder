FROM node:21.6.2-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

VOLUME ["/app/.env.production"]

WORKDIR /home/node/app


COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 3500

CMD [ "node", "--env-file=/app/.env.production", "./server.js" ]