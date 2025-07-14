import type { Video } from "./video";

export interface NavbarProps {
    onUpload: () => void;
    setVideos: (videos: Video[]) => void;
    setLoading: (loading: boolean) => void;
}
