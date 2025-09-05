export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
export const SESSION_ID_COOKIE = 'session_id';

// TTLs
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const COOKIE_COMMON = {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
};


export const MAX_FAILED = 5;
export const LOCK_MINUTES = 15;