import { Client } from "@elastic/elasticsearch";
import { esClient } from "../db";
import { VideoDocument } from "../interfaces/videoMetadataInterface";

export class EsService {
    private client: Client;
    private indexName: string;

    constructor(indexName: string = "videos") {
        this.client = esClient;
        this.indexName = indexName;
    }

    async createIndexIfNotExists(): Promise<void> {
        const exists = await this.client.indices.exists({ index: this.indexName });
        if (!exists) {
            console.log(`index ${this.indexName} does not exist. creating index`)
            await this.client.indices.create({
                index: this.indexName,
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
    }

    async indexDocument(video: VideoDocument): Promise<void> {
        await this.client.index({
            index: this.indexName,
            id: video.id,
            document: video
        });
    }

    async search(query: string): Promise<Array<VideoDocument & { score?: number }>> {
        const result = await this.client.search<VideoDocument>({
        index: this.indexName,
        query: {
            multi_match: {
                query,
                fields: ["title^2", "description", "tags"],
                fuzziness: "AUTO"
            }
        }
        });
        return result.hits.hits.map(hit => ({
            ...hit._source!,
            score: hit._score || undefined
        }));
    }

    async deleteDocument(id: string): Promise<void> {
        await this.client.delete({
            index: this.indexName,
            id
        });
    }
}