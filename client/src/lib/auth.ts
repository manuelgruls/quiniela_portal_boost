import { apiRequest } from "./queryClient";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  mustChangePassword: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const response = await apiRequest('POST', '/api/auth/login', credentials);
  return response.json();
}

export async function logout(): Promise<void> {
  await apiRequest('POST', '/api/auth/logout');
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await apiRequest('GET', '/api/auth/user');
    return response.json();
  } catch {
    return null;
  }
}

export async function changePassword(data: ChangePasswordData): Promise<void> {
  await apiRequest('PATCH', '/api/auth/change-password', data);
}

export async function resetPassword(email: string): Promise<void> {
  await apiRequest('POST', '/api/auth/reset-password', { email });
}
