export interface AuthUser {
  id: number;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  status: string;
  email_verified_at?: Date | null;
  phone_verified_at?: Date | null;
  last_login_at?: Date | null;
  created_at: Date;
  updated_at: Date;
  [key: string]: any;
}


