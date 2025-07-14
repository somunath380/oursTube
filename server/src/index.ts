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
    try{
        app.use('/videos', express.static(path.join(__dirname, "../uploads/hls")));
        app.use("/api/v1", router)
        app.get("/health", (req: Request, res: Response)=>{
            res.status(200).json({
                success: true
            })
        })
        log("Setting up Elasticsearch...")
        await esService.createIndexIfNotExists();
        log("Elasticsearch setup complete")
        log("Starting HTTP server...")
        app.listen(port, '0.0.0.0', ()=>{
            log(`✅ Server started successfully on port ${port}`);
        }).on('error', (error) => {
            log(`❌ Server failed to start: ${error.message}`)
            process.exit(1)
        })
    } catch (error) {
        log(`❌ Failed to start server: ${error}`)
        process.exit(1)
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    log(`❌ Uncaught Exception: ${error}`)
    process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
    log(`❌ Unhandled Rejection at: ${promise}, reason: ${reason}`)
    process.exit(1)
})

log("Starting application...")
startServer().catch((error) => {
    log(`❌ Failed to start application: ${error}`)
    process.exit(1)
})

log("Starting notification consumer...")
connectAndProcess().catch((error) => {
    log(`❌ Failed to start notification consumer: ${error}`)
    // Don't exit here as the main server might still work
})