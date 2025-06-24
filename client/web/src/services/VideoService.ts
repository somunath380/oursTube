import axios from 'axios';
import { auth } from '../../firebase';

const API_URL = import.meta.env.VITE_API_URL;

async function getAuthHeader() {
    const user = auth.currentUser;
    if (!user) return {};
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
}

export const getAllVideos = async () => {
    const response = await axios.get(`${API_URL}/video/all`, {
        headers: await getAuthHeader()
    });
    return response.data;
};

export const uploadVideo = async (formData: FormData) => {
    const response = await axios.post(`${API_URL}/video/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', ...(await getAuthHeader()) },
    });
    return response.data;
};

export const searchVideos = async (query: string) => {
    const response = await axios.get(`${API_URL}/video/search`, {
        params: { search: query },
        headers: await getAuthHeader()
    });
    return response.data;
};
