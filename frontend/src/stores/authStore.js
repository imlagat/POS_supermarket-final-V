import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isLoading: true,

    // Call this on app start to validate token and fetch user
    loadUser: async () => {
        const token = get().token;
        if (!token) {
            set({ isLoading: false });
            return false;
        }
        try {
            const res = await api.get('/user');
            set({ user: res.data, isLoading: false });
            return true;
        } catch (error) {
            // Token invalid
            localStorage.removeItem('token');
            set({ token: null, user: null, isLoading: false });
            return false;
        }
    },

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
        set({ user: null, token: null, isLoading: false });
    }
}));
