import { User } from '@/shared/entities/user.entity';

export function safeUser(user: User) {
  const { password, remember_token, ...rest } = user as any;
  return rest as Omit<User, 'password' | 'remember_token'>;
}



