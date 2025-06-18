import { log } from "console"
import express, {Router, RequestHandler} from "express"
import { signIn, getRefreshToken, signOut } from "../controllers/auth.controller"

const authRouter: Router = express.Router()

authRouter.post("/signin", signIn as RequestHandler)
authRouter.post("/refresh", getRefreshToken as RequestHandler)
authRouter.post("/signout", signOut as RequestHandler)

export default authRouter
