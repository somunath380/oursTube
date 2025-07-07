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