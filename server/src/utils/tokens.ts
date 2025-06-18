import jwt, { Secret } from "jsonwebtoken"
import { config } from "../config/env"
import { JWTPayload } from "../interfaces/tokens"

import { RefreshTokenValidationError } from "../utils/errors"

export const generateToken = (payload: JWTPayload) => {
    const accessToken = jwt.sign(payload, config.JWT_SECRET as Secret, {expiresIn: config.JWT_EXPIREY})
    return accessToken
}

export const generateRefreshToken = (payload: JWTPayload) => {
    const refreshToken = jwt.sign(payload, config.JWT_SECRET as Secret, {expiresIn: config.JWT_REFRESH_EXPIRY})
    return refreshToken
}

export const verifyRefreshToken = (refreshToken: string) => {
    try {
        const decodedToken = jwt.verify(refreshToken, config.JWT_SECRET as Secret)
        return decodedToken as JWTPayload
    } catch (error) {
        throw new RefreshTokenValidationError("Error on verifying refresh token")
    }
}