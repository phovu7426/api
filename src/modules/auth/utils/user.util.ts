import { Prisma } from '@prisma/client';

type User = Prisma.UserGetPayload<{}>;

export function safeUser(user: User | any) {
  const { password, remember_token, ...rest } = user as any;
  // Convert BigInt fields to number for API compatibility
  return {
    ...rest,
    id: typeof rest.id === 'bigint' ? Number(rest.id) : rest.id,
    created_user_id: rest.created_user_id ? (typeof rest.created_user_id === 'bigint' ? Number(rest.created_user_id) : rest.created_user_id) : null,
    updated_user_id: rest.updated_user_id ? (typeof rest.updated_user_id === 'bigint' ? Number(rest.updated_user_id) : rest.updated_user_id) : null,
  } as Omit<User, 'password' | 'remember_token'> & {
    id: number;
    created_user_id: number | null;
    updated_user_id: number | null;
  };
}



