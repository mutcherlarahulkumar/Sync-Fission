import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const TOKEN_KEY = 'token';
const ROLE_KEY = 'role';

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getRole() {
    return localStorage.getItem(ROLE_KEY);
}

export function isSignedIn() {
    return Boolean(getToken());
}

export function setAuth(token, role) {
    localStorage.setItem(TOKEN_KEY, token);
    if (role) localStorage.setItem(ROLE_KEY, role);
}

export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
}

export function getAuthConfig() {
    return { headers: { Authorization: `Bearer ${getToken()}` } };
}

// Every page imports axios directly and shares this default instance, so one
// interceptor covers the whole app without touching twenty call sites.
//
// Tokens last a while but they do expire, and until now an expired one left you
// on a dashboard where every panel silently failed to load. Now the session is
// cleared and you land back on sign-in.
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const isAuthFailure = status === 401 || status === 403;

        // Only treat this as an expired session if we actually had a token.
        // A failed login attempt is also a 401, and bouncing the user off the
        // sign-in page would throw away the error message they need to read.
        if (isAuthFailure && getToken() && !window.location.pathname.startsWith('/signin')) {
            clearAuth();
            window.location.assign('/signin?expired=1');
        }

        return Promise.reject(error);
    },
);
