FROM node:18-slim

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN apt-get update -y && apt-get install -y openssl netcat-openbsd iputils-ping ffmpeg

RUN npx prisma generate

EXPOSE 3000

# Add a longer delay to ensure services are ready and test connectivity
CMD ["sh", "-c", "npm run build && sleep 20 && ping -c 3 rabbitmq && npm run migrate && npm run task"]
