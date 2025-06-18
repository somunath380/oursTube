import admin from "../config/firebase"
import { Request, Response } from "express"
import { config } from "../config/env"
import { JWTPayload } from "../interfaces/tokens"
import { generateRefreshToken, generateToken, verifyRefreshToken } from "../utils/tokens"
import { RefreshTokenValidationError, RefreshTokenNotExistError } from "../utils/errors"

export const signIn = async (req: Request, res: Response) => {
    try {
        const {token} = req.body
        const decodedToken = await admin.auth().verifyIdToken(token)
        const {email, uid, name} = decodedToken
        if (!email || !uid || !name) {
            throw new RefreshTokenValidationError("Invalid token data", 401)
        }
        const tokenPayload: JWTPayload = { email, uid, name }
        const jwtToken = generateToken(tokenPayload)
        const refreshToken = generateRefreshToken(tokenPayload)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "prod",
            maxAge: config.JWT_REFRESH_EXPIRY * 1000,
            sameSite: "strict"
        })
        res.status(200).json(jwtToken)
    } catch (error) {
        if (error instanceof RefreshTokenValidationError) {
            res.status(error.statusCode).json({message: error.message})
        } else {
            res.status(500).json({message: "Internal server error"})
        }
    }
}

export const getRefreshToken = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken){
            throw new RefreshTokenNotExistError("Please provide refresh token", 401)
        }
        const decodedRefreshToken: JWTPayload = verifyRefreshToken(refreshToken)
        const tokenPayload: JWTPayload = {
            email: decodedRefreshToken.email,
            uid: decodedRefreshToken.uid,
            name: decodedRefreshToken.name
        }
        const jwtToken = generateToken(tokenPayload)
        res.status(200).json(jwtToken)
    } catch (error) {
        if (error instanceof RefreshTokenNotExistError) {
            res.status(error.statusCode).json({message: error.message})
        } else if (error instanceof RefreshTokenValidationError) {
            res.status(error.statusCode).json({message: error.message})
        } else {
            res.status(500).json({message: "Internal server error"})
        }
    }
}

export const signOut = async (req: Request, res: Response) => {
    try {
        res.clearCookie("refreshToken")
        res.status(200).json({message: "Logged out successfully"})
    } catch (error) {
        res.status(500).json({message: "Internal server error"})
    }
}