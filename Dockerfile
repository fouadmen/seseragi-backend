FROM node:12

WORKDIR /home/server

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 9000

CMD [ "node", "index.js" ]
