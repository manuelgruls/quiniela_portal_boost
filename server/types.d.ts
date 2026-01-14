import 'express-session';

// AuthUser type definition
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  mustChangePassword: boolean;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Extend express-session SessionData interface
declare module 'express-session' {
  interface SessionData {
    sessionId?: string;
  }
}