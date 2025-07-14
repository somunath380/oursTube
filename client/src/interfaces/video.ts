export interface Video {
    id: string;
    filepath: string;
    status: string;
    resolution: string;
    thumbnail: string;
    title: string;
    description: string;
    duration: number;
    created_at: string;
    tags: string[];
}

export interface UploadVideoProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: () => void;
    onVideoUploaded: (videoId: string) => void;
}

export interface VideoCardProps extends Video {
    onClick: () => void;
}

export interface VideoPlayerProps {
    src: string;
    autoPlay?: boolean;
    controls?: boolean;
    style?: React.CSSProperties;
}

export interface TagInputProps {
    tags: string[];
    setTags: React.Dispatch<React.SetStateAction<string[]>>;
}