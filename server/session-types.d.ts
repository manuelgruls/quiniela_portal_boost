declare module 'express-session' {
    interface SessionData {
        csrfToken?: string;
        userId?: string;
        loginTime?: number;
        userAgent?: string;
        ipAddress?: string;
    }
}