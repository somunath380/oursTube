"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.generateRefreshToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const generateToken = (payload) => {
    const accessToken = jsonwebtoken_1.default.sign(payload, env_1.config.JWT_SECRET, { expiresIn: env_1.config.JWT_EXPIREY });
    return accessToken;
};
exports.generateToken = generateToken;
const generateRefreshToken = (payload) => {
    const refreshToken = jsonwebtoken_1.default.sign(payload, env_1.config.JWT_SECRET, { expiresIn: env_1.config.JWT_REFRESH_EXPIRY });
    return refreshToken;
};
exports.generateRefreshToken = generateRefreshToken;
const verifyRefreshToken = (refreshToken) => {
    try {
        const decodedToken = jsonwebtoken_1.default.verify(refreshToken, env_1.config.JWT_SECRET);
        return decodedToken;
    }
    catch (error) {
        throw new errors_1.RefreshTokenValidationError("Error on verifying refresh token");
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=tokens.js.map