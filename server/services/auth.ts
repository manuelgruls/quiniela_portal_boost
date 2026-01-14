import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { pool } from '../db';
import type { Profile } from '@shared/schema';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  mustChangePassword: boolean;
}

export interface LoginResult {
  user: AuthUser;
  sessionId: string;
}

// Helper: Snake -> Camel
const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

// Helper: Map profile row to Profile object
const mapProfile = (row: any): Profile => ({
  id: row.id,
  email: row.email,
  password: row.password,
  fullName: row.full_name,
  role: row.role,
  mustChangePassword: !!row.must_change_password,
  isActive: !!row.is_active,
  lastAccess: row.last_access,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async login(email: string, password: string): Promise<LoginResult | null> {
    try {
      // 1. Fetch user
      const [results]: any = await pool.execute('SELECT * FROM profiles WHERE email = ?', [email]);
      const user = results[0];

      if (!user) {
        return null;
      }

      if (!user.is_active) return null;

      // 2. Verify Password
      if (!user.password) {
        return null;
      }

      const isValid = await AuthService.verifyPassword(password, user.password);
      if (!isValid) {
        return null;
      }

      // 3. Create Session
      const sessionId = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      try {
        await pool.execute(
          'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
          [sessionId, user.id, expiresAt]
        );
      } catch (sessError) {
        console.error('[Auth] CRITICAL: Failed to create session:', sessError);
        throw sessError; // We cannot log in without a session
      }

      // 4. Update Last Access (Non-critical)
      try {
        await pool.execute(
          'UPDATE profiles SET last_access = ? WHERE id = ?',
          [new Date(), user.id]
        );
      } catch (updateError) {
        // Do not throw, allow login to proceed
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role as 'admin' | 'user',
          mustChangePassword: !!user.must_change_password
        },
        sessionId
      };

    } catch (error) {
      console.error('[Auth] UNEXPECTED ERROR during login:', error);
      throw error;
    }
  }

  static async logout(sessionId: string): Promise<void> {
    await pool.execute('DELETE FROM sessions WHERE id = ?', [sessionId]);
  }

  static async validateSession(sessionId: string): Promise<AuthUser | null> {
    // Use Standard SQL with joins to get session and user data
    const [result]: any = await pool.execute(`
      SELECT s.id as session_id, s.expires_at, p.id, p.email, p.full_name, p.role, p.must_change_password, p.is_active
      FROM sessions s
      INNER JOIN profiles p ON s.user_id = p.id
      WHERE s.id = ?
    `, [sessionId]);

    if (!result.length) {
      return null;
    }

    const sessionData = result[0];

    // Check if session is expired
    if (sessionData.expires_at < new Date()) {
      await pool.execute('DELETE FROM sessions WHERE id = ?', [sessionId]);
      return null;
    }

    // Check if user is still active
    if (!sessionData.is_active) {
      await pool.execute('DELETE FROM sessions WHERE id = ?', [sessionId]);
      return null;
    }

    return {
      id: sessionData.id,
      email: sessionData.email,
      fullName: sessionData.full_name,
      role: sessionData.role as 'admin' | 'user',
      mustChangePassword: !!sessionData.must_change_password
    };
  }

  static async changePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await AuthService.hashPassword(newPassword);

    await pool.execute(
      'UPDATE profiles SET password = ?, must_change_password = ?, updated_at = ? WHERE id = ?',
      [hashedPassword, false, new Date(), userId]
    );
  }
}
