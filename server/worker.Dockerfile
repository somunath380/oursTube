FROM node:18-slim

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN apt-get update -y && apt-get install -y openssl netcat-openbsd iputils-ping

RUN npx prisma generate

EXPOSE 3000

# Add a longer delay to ensure services are ready and test connectivity
CMD ["sh", "-c", "npm run build && sleep 20 && echo 'Testing network connectivity...' && ping -c 3 rabbitmq && echo 'Testing RabbitMQ port...' && nc -z rabbitmq 5672 && echo 'RabbitMQ is reachable' && echo 'Testing MinIO port...' && nc -z minio 9000 && echo 'MinIO is reachable' && echo 'Testing RabbitMQ connection...' && node test-rabbitmq.js && echo 'Testing MinIO connection...' && node test-minio.js && npm run migrate && npm run task"]
