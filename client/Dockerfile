FROM node:18-slim

WORKDIR /app

COPY client/package.json ./

COPY client/ ./

COPY auths/ ../auths/

RUN npm install

EXPOSE 5173

CMD ["sh", "-c", "npm run dev -- --host"]
