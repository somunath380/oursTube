import { log } from "console"
import express, {Router, RequestHandler} from "express"

import {uploadVideoHandler} from "../controllers/video.controller"
// import {uploadVideo} from "../middlewares/uploadFile"

const videoRouter: Router = express.Router()

videoRouter.post("/upload", uploadVideoHandler as RequestHandler)

export default videoRouter
