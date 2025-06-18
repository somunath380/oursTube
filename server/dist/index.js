"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const console_1 = require("console");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const index_1 = __importDefault(require("./routes/index"));
const app = (0, express_1.default)();
const port = Number(env_1.config.PORT);
const hlsPath = path_1.default.resolve(__dirname, "../uploads/hls");
const corsOptions = {
    origin: "*",
    methods: ["*"]
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use("/hls", express_1.default.static(hlsPath));
app.use("/api/v1", index_1.default);
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true
    });
});
app.listen(port, 'localhost', () => {
    (0, console_1.log)(`started server on port ${env_1.config.PORT}. ENV: ${env_1.config.NODE_ENV}`);
});
//# sourceMappingURL=index.js.map