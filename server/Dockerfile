FROM node:18-slim

WORKDIR /app

COPY server/package.json ./

RUN npm install

COPY server/ ./

COPY auths/ ../../../auths/

RUN apt-get update -y && apt-get install -y openssl curl netcat-openbsd iputils-ping ffmpeg

RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npm run build && sleep 20 && ping -c 3 rabbitmq && npm run migrate && npm run start"]
