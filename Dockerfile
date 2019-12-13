FROM node:12.13.1-stretch

WORKDIR /home/server

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 9000

CMD [ "node", "index.js" ]
