import type { Video } from "./video";

export interface SearchProps {
    setVideos: (videos: Video[]) => void;
    setLoading: (loading: boolean) => void;
}

export interface NotificationCardProps {
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
    onClose: () => void;
    autoClose?: boolean;
    duration?: number;
}