import { log } from "console"
import express, {Router, RequestHandler} from "express"

import {uploadVideoHandler, searchVideo, fetchSegment, getAllVideos} from "../controllers/video.controller"
// import {uploadVideo} from "../middlewares/uploadFile"

const videoRouter: Router = express.Router()

videoRouter.post("/upload", uploadVideoHandler as RequestHandler)

videoRouter.get("/search", searchVideo as RequestHandler)

videoRouter.get("/all", getAllVideos as RequestHandler)

videoRouter.get("/segment/:filepath/:filename", fetchSegment as RequestHandler)

export default videoRouter
