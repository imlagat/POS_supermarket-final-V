import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isLoading: false,

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const res = await api.post('/login', { email, password });
            localStorage.setItem('token', res.data.token);
            set({ user: res.data.user, token: res.data.token, isLoading: false });
            return true;
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        try { await api.post('/logout'); } catch (e) {}
        localStorage.removeItem('token');
        set({ user: null, token: null });
    }
}));
