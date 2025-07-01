import express, {Router, RequestHandler} from "express"

import {uploadVideoHandler, searchVideo, fetchSegment, getAllVideos, fetchManifest, openSSEConnection, getThumbnail} from "../controllers/video.controller"
import { authenticate } from "../middlewares/auth"

const videoRouter: Router = express.Router()

videoRouter.post("/upload", authenticate as RequestHandler, uploadVideoHandler as RequestHandler)

videoRouter.get("/search", authenticate as RequestHandler, searchVideo as RequestHandler)

videoRouter.get("/all", authenticate as RequestHandler, getAllVideos as RequestHandler)

videoRouter.get("/manifest/:filepath", fetchManifest as RequestHandler);

videoRouter.get("/segment/:filepath/:filename", fetchSegment as RequestHandler)

videoRouter.get("/sse/:videoId", openSSEConnection as RequestHandler)

videoRouter.get("/thumbnail/:encodedUrl", getThumbnail as RequestHandler)

export default videoRouter
