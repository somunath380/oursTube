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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EsService = void 0;
const db_1 = require("../db");
class EsService {
    constructor(indexName = "videos") {
        this.client = db_1.esClient;
        this.indexName = indexName;
    }
    createIndexIfNotExists() {
        return __awaiter(this, void 0, void 0, function* () {
            const exists = yield this.client.indices.exists({ index: this.indexName });
            if (!exists) {
                console.log(`index ${this.indexName} does not exist. creating index`);
                yield this.client.indices.create({
                    index: this.indexName,
                    settings: {
                        number_of_shards: 1,
                        number_of_replicas: 1
                    },
                    mappings: {
                        properties: {
                            title: { type: "text" },
                            description: { type: "text" },
                            tags: { type: "keyword" },
                            upload_date: { type: "date" }
                        }
                    }
                });
                console.log(`Created index: ${this.indexName}`);
            }
            console.log(`index ${this.indexName} already exists`);
        });
    }
    indexDocument(video) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.index({
                index: this.indexName,
                id: video.id,
                document: video
            });
        });
    }
    search(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.search({
                index: this.indexName,
                query: {
                    multi_match: {
                        query,
                        fields: ["title^2", "description", "tags"],
                        fuzziness: "AUTO"
                    }
                }
            });
            return result.hits.hits.map(hit => (Object.assign(Object.assign({}, hit._source), { score: hit._score || undefined })));
        });
    }
    getAllDocuments() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield this.client.search({
                    index: this.indexName,
                    query: {
                        match_all: {}
                    },
                    sort: [
                        { upload_date: { order: "desc" } }
                    ]
                });
                return results.hits.hits.map((video) => (Object.assign({ id: video._id }, video._source)));
            }
            catch (error) {
                console.error('Elasticsearch getAllDocuments error:', error);
                throw error;
            }
        });
    }
    deleteDocument(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.delete({
                index: this.indexName,
                id
            });
        });
    }
}
exports.EsService = EsService;
//# sourceMappingURL=elasticsearch.service.js.map