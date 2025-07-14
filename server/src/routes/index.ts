import { log } from "console"
import express, {Router} from "express"

import videoRouter from "./video"
const router: Router = express.Router()

try {
    router.use("/video", videoRouter)
} catch (error) {
    log(`error: ${error}`)
}

export default router
