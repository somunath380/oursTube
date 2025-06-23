FROM node:18-slim

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN apt-get update -y && apt-get install -y openssl

RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npm run build && npm run migrate && npm run start"]
