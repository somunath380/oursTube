"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const console_1 = require("console");
const express_1 = __importDefault(require("express"));
const video_1 = __importDefault(require("./video"));
const router = express_1.default.Router();
try {
    router.use("/video", video_1.default);
}
catch (error) {
    (0, console_1.log)(`error: ${error}`);
}
exports.default = router;
//# sourceMappingURL=index.js.map