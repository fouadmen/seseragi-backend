FROM node:12.13.1-stretch

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/backend

WORKDIR /home/node/backend

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 9000

CMD [ "node", "index.js" ]
