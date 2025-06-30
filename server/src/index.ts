import  express, {Application, Request, Response}  from "express";
import {config} from "./config/env"
import { log } from "console";
import cors, {CorsOptions} from "cors"
import path from "path"
import bodyParser from "body-parser"

import router from "./routes/index"
import { EsService } from "./services/elasticsearch.service";
import {connectAndProcess} from "./jobs/notifyConsumer"

const app: Application = express()
const esService = new EsService(config.ELASTICSEARCH_INDEX)

const port = config.PORT || 3000

const corsOptions: CorsOptions = {
    origin: "*", // todo: change this later
    methods: ["*"]
}
const startServer = async () => {
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
    await esService.createIndexIfNotExists();

    app.listen(port, '0.0.0.0', ()=>{
        log(`started server on port ${config.PORT}`);
    })
}

startServer()
connectAndProcess()