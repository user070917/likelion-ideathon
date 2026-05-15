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
  updateUser: async (id: string, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  getUserAnalysis: async (userId: string) => {
    const response = await api.get(`/users/${userId}/analysis`);
    return response.data;
  },
  getGreeting: async (userId: string) => {
    // URL 끝에 타임스탬프를 붙여서 브라우저가 오디오 파일을 캐시(저장)하지 않도록 방지
    const response = await api.get(`/users/${userId}/greeting?t=${Date.now()}`, {
      responseType: 'blob'
    });
    // 헤더에서 텍스트 추출
    const text = decodeURIComponent(response.headers['x-carebot-text'] || '');
    return { audioBlob: response.data, text };
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

export const carebotService = {
  chat: async (history: { role: string; text: string }[], userId?: string) => {
    const response = await api.post('/carebot/chat', { history, user_id: userId });
    return response.data;
  },
  talk: async (history: { role: string; text: string }[], userId?: string) => {
    const response = await api.post('/carebot/talk', { history, user_id: userId }, {
      responseType: 'blob'
    });
    const text = decodeURIComponent(response.headers['x-carebot-text'] || '');
    return { audioBlob: response.data, text };
  },
};

export default api;
