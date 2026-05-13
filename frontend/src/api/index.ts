import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const userService = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getUserAnalysis: async (userId: string) => {
    const response = await api.get(`/users/${userId}/analysis`);
    return response.data;
  },
};

export const analysisService = {
  uploadAudio: async (userId: string, audioFile: File) => {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('user_id', userId);
    
    const response = await api.post('/upload/audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const alertService = {
  getAlerts: async () => {
    const response = await api.get('/alerts');
    return response.data;
  },
};

export default api;
