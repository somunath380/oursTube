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
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const console_1 = require("console");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const index_1 = __importDefault(require("./routes/index"));
const elasticsearch_service_1 = require("./services/elasticsearch.service");
const notifyConsumer_1 = require("./jobs/notifyConsumer");
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const app = (0, express_1.default)();
const esService = new elasticsearch_service_1.EsService(env_1.config.ELASTICSEARCH_INDEX);
const port = env_1.config.PORT || 3000;
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Your API Title',
            version: '1.0.0',
            description: 'API documentation',
        },
    },
    apis: [
        path_1.default.join(__dirname, './routes/*.js'),
        path_1.default.join(process.cwd(), 'src/routes/*.ts')
    ],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
const corsOptions = {
    origin: "*",
    methods: ["*"]
};
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    app.use((0, cors_1.default)(corsOptions));
    app.use(express_1.default.json());
    app.use(body_parser_1.default.json());
    app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
    try {
        app.use('/videos', express_1.default.static(path_1.default.join(__dirname, "../uploads/hls")));
        app.use("/api/v1", index_1.default);
        app.get("/health", (req, res) => {
            res.status(200).json({
                success: true
            });
        });
        (0, console_1.log)("Setting up Elasticsearch...");
        yield esService.createIndexIfNotExists();
        (0, console_1.log)("Elasticsearch setup complete");
        (0, console_1.log)("Starting HTTP server...");
        app.listen(port, '0.0.0.0', () => {
            (0, console_1.log)(`Server started successfully on port ${port}`);
        }).on('error', (error) => {
            (0, console_1.log)(`Server failed to start: ${error.message}`);
            process.exit(1);
        });
    }
    catch (error) {
        (0, console_1.log)(`Failed to start server: ${error}`);
        process.exit(1);
    }
});
process.on('uncaughtException', (error) => {
    (0, console_1.log)(`Uncaught Exception: ${error}`);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    (0, console_1.log)(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    process.exit(1);
});
(0, console_1.log)("Starting application...");
startServer().catch((error) => {
    (0, console_1.log)(`Failed to start application: ${error}`);
    process.exit(1);
});
(0, console_1.log)("Starting notification consumer...");
(0, notifyConsumer_1.connectAndProcess)().catch((error) => {
    (0, console_1.log)(`Failed to start notification consumer: ${error}`);
});
//# sourceMappingURL=index.js.map