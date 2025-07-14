"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const authRouter = express_1.default.Router();
authRouter.post("/signin", auth_controller_1.signIn);
authRouter.post("/refresh", auth_controller_1.getRefreshToken);
authRouter.post("/signout", auth_controller_1.signOut);
exports.default = authRouter;
//# sourceMappingURL=auth.js.map