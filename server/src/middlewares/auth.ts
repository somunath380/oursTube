import { Request, Response, NextFunction } from "express";
import admin from "../config/firebase";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        (req as any).user = decodedToken
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

