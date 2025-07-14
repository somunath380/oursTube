import express, {Router, RequestHandler} from "express"

import {uploadVideoHandler, searchVideo, fetchSegment, getAllVideos, fetchManifest, openSSEConnection, getThumbnail} from "../controllers/video.controller"
import { authenticate } from "../middlewares/auth"

const videoRouter: Router = express.Router()

/**
 * @openapi
 * /video/upload:
 *   post:
 *     summary: Upload a new video
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               tags:
 *                 type: string
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Upload failed
 */
videoRouter.post("/upload", authenticate as RequestHandler, uploadVideoHandler as RequestHandler)

/**
 * @openapi
 * /video/search:
 *   get:
 *     summary: Search for videos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of videos matching the search
 *       400:
 *         description: Query parameter is required
 *       500:
 *         description: Search failed
 */
videoRouter.get("/search", authenticate as RequestHandler, searchVideo as RequestHandler)

/**
 * @openapi
 * /video/all:
 *   get:
 *     summary: Get all videos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all videos
 *       500:
 *         description: Failed to fetch videos
 */
videoRouter.get("/all", authenticate as RequestHandler, getAllVideos as RequestHandler)

/**
 * @openapi
 * /video/manifest/{filepath}:
 *   get:
 *     summary: Get DASH manifest for a video
 *     parameters:
 *       - in: path
 *         name: filepath
 *         schema:
 *           type: string
 *         required: true
 *         description: Video file path
 *     responses:
 *       200:
 *         description: DASH manifest XML
 *       400:
 *         description: Filepath is required
 *       500:
 *         description: Failed to fetch manifest
 */
videoRouter.get("/manifest/:filepath", fetchManifest as RequestHandler);

/**
 * @openapi
 * /video/segment/{filepath}/{filename}:
 *   get:
 *     summary: Get a video segment file
 *     parameters:
 *       - in: path
 *         name: filepath
 *         schema:
 *           type: string
 *         required: true
 *         description: Video file path
 *       - in: path
 *         name: filename
 *         schema:
 *           type: string
 *         required: true
 *         description: Segment file name
 *     responses:
 *       200:
 *         description: Video segment file
 *       400:
 *         description: videoid and filename is required
 *       500:
 *         description: Could not stream video segment
 */
videoRouter.get("/segment/:filepath/:filename", fetchSegment as RequestHandler)

/**
 * @openapi
 * /video/sse/{videoId}:
 *   get:
 *     summary: Open SSE connection for video processing status
 *     parameters:
 *       - in: path
 *         name: videoId
 *         schema:
 *           type: string
 *         required: true
 *         description: Video ID
 *     responses:
 *       200:
 *         description: SSE stream for video status
 */
videoRouter.get("/sse/:videoId", openSSEConnection as RequestHandler)

/**
 * @openapi
 * /video/thumbnail/{videoId}:
 *   get:
 *     summary: Get video thumbnail
 *     parameters:
 *       - in: path
 *         name: videoId
 *         schema:
 *           type: string
 *         required: true
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video thumbnail image
 *       404:
 *         description: Thumbnail not found
 *       500:
 *         description: Error retrieving thumbnail
 */
videoRouter.get("/thumbnail/:videoId", getThumbnail as RequestHandler)

export default videoRouter
