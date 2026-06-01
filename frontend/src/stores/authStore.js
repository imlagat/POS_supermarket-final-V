import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    isLoading: false,

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const res = await api.post('/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
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
        localStorage.removeItem('user');
        set({ user: null, token: null });
    },

    // Call this on app start to validate token and refresh user if needed
    loadUser: async () => {
        const token = get().token;
        if (!token) return;
        try {
            const res = await api.get('/user');
            localStorage.setItem('user', JSON.stringify(res.data));
            set({ user: res.data });
        } catch (error) {
            // Token invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ user: null, token: null });
        }
    }
}));
