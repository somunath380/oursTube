import  express, {Application, Request, Response}  from "express";
import {config} from "./config/env"
import { log } from "console";
import cors, {CorsOptions} from "cors"
import path from "path"
import bodyParser from "body-parser"

import router from "./routes/index"

const app: Application = express()

const port: number = Number(config.PORT)

const corsOptions: CorsOptions = {
    origin: "*", // todo: change this later
    methods: ["*"]
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(bodyParser.json())

app.use('/videos', express.static(path.join(__dirname, "../uploads/hls")));

app.use("/api/v1", router)

app.get("/health", (req: Request, res: Response)=>{
    res.status(200).json({
        success: true
    })
})

app.listen(port, 'localhost', ()=>{
    log(`started server on port ${config.PORT}. ENV: ${config.NODE_ENV}`);
})
