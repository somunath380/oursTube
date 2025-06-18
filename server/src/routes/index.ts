import { log } from "console"
import express, {Router} from "express"

import authRouter from "./auth"
import videoRouter from "./video"
const router: Router = express.Router()

try {
    // router.use("/auth", authRouter)
    router.use("/video", videoRouter)
} catch (error) {
    log(`error: ${error}`)
}

export default router
