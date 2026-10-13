export interface Peserta {
  nip: string;
  nama: string;
  kodeToko: string;
  namaToko: string;
  tanggalOjt: string;
  password?: string;
}

export type UserRole = 'user' | 'admin';

export interface UserSession {
  role: 'user';
  nip: string;
  nama: string;
  kodeToko: string;
  namaToko: string;
  tanggalOjt: string;
  token: string;
}

export interface AdminSession {
  role: 'admin';
  username: string;
  token: string;
}

export type AuthSession = UserSession | AdminSession | null;

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  token?: string;
  role?: UserRole;
  user?: Peserta;
  peserta?: Peserta;
  admin?: { username: string };
  data?: T;
  addedCount?: number;
  updatedCount?: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}
