const API_BASE_URL = 'http://localhost:3000/api/v1';

export interface UploadVideoData {
  title: string;
  description: string;
  video: File;
}

export const uploadVideo = async (data: UploadVideoData): Promise<any> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('video', data.video);

  const response = await fetch(`${API_BASE_URL}/video/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
};
