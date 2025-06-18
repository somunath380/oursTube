"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signOut = exports.getRefreshToken = exports.signIn = void 0;
const firebase_1 = __importDefault(require("../config/firebase"));
const env_1 = require("../config/env");
const tokens_1 = require("../utils/tokens");
const errors_1 = require("../utils/errors");
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        const decodedToken = yield firebase_1.default.auth().verifyIdToken(token);
        const { email, uid, name } = decodedToken;
        if (!email || !uid || !name) {
            throw new errors_1.RefreshTokenValidationError("Invalid token data", 401);
        }
        const tokenPayload = { email, uid, name };
        const jwtToken = (0, tokens_1.generateToken)(tokenPayload);
        const refreshToken = (0, tokens_1.generateRefreshToken)(tokenPayload);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "prod",
            maxAge: env_1.config.JWT_REFRESH_EXPIRY * 1000,
            sameSite: "strict"
        });
        res.status(200).json(jwtToken);
    }
    catch (error) {
        if (error instanceof errors_1.RefreshTokenValidationError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
});
exports.signIn = signIn;
const getRefreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            throw new errors_1.RefreshTokenNotExistError("Please provide refresh token", 401);
        }
        const decodedRefreshToken = (0, tokens_1.verifyRefreshToken)(refreshToken);
        const tokenPayload = {
            email: decodedRefreshToken.email,
            uid: decodedRefreshToken.uid,
            name: decodedRefreshToken.name
        };
        const jwtToken = (0, tokens_1.generateToken)(tokenPayload);
        res.status(200).json(jwtToken);
    }
    catch (error) {
        if (error instanceof errors_1.RefreshTokenNotExistError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else if (error instanceof errors_1.RefreshTokenValidationError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
});
exports.getRefreshToken = getRefreshToken;
const signOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("refreshToken");
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.signOut = signOut;
//# sourceMappingURL=auth.controller.js.map