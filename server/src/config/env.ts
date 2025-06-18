import * as dotenv from 'dotenv';
import path from "path"

const NODE_ENV = process.env.NODE_ENV || "dev"

const envFilePath = path.resolve(process.cwd(), 'server', `.env.${NODE_ENV}`) // todo: when this is run by launch.json its correct but if run by npm run dev script it might give error

dotenv.config({
    path: envFilePath
})

export const config = {
    NODE_ENV,
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIREY: 60*60*24*2,
    JWT_REFRESH_EXPIRY: 60*60*24*7,
    PG_USER: String(process.env.PG_USER),
    PG_PASSWORD: String(process.env.PG_PASSWORD),
    PG_DB: String(process.env.PG_DB),
    PG_PORT: Number(process.env.PG_PORT),
    PG_HOST: String(process.env.PG_HOST),
}
