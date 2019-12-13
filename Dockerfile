FROM node:12

<<<<<<< HEAD
WORKDIR /app
=======
WORKDIR /home/server
>>>>>>> f889f6b49204a7cc3c89a740f3553bb1279e05b5

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 9000

CMD [ "node", "index.js" ]
