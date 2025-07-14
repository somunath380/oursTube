interface videoMetadataInterface {
    title: string;
    description: string;
    filepath: string;
    duration: number;
    resolution: string;
}
export type {videoMetadataInterface}

export interface VideoDocument {
    id: string;
    title: string;
    description: string;
    tags: string[];
    upload_date: string;
}
