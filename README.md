# oursTube
free video streaming platform without ads

postgres dokcer command

docker run -d \
--name onepiece \
-e POSTGRES_PASSWORD=postgres \
-e POSTGRES_USER=postgres \
-e POSTGRES_DB=onepiece \
-p 5433:5432 \
postgres:17

need ffmpeg sudo package

need to run terminal commands of prisma for creating db table schemas
1. npm install prisma --save-dev
2. npx prisma init 
3. npx prisma generate
4. npx prisma migrate dev --name init
