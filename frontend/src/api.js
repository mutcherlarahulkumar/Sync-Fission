export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export function getAuthConfig() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
}
