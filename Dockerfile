FROM node:12

WORKDIR /server

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 80

CMD [ "node", "index.js" ]
