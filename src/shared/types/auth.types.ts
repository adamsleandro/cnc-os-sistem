export type UserRole = 'admin' | 'gerente' | 'programador' | 'operador' | 'acabamento';

export interface Profile {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  active: boolean;
  created_at: string;
}
