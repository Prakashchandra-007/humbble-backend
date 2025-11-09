export interface User {
  id: number;
  email: string;
  password: string;
  name?: string | null;
  phone?: string | null;
  gender?: string | null;
  role: 'admin' | 'user';
  created_at: Date;
  updated_at: Date;
}

export type UserWithoutPassword = Omit<User, 'password'>;

export interface JwtPayload {
  sub: number;
  email: string;
  user_metadata: {
    role: string;
  };
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
    userRole: string;
  };
}
