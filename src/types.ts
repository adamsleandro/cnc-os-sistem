export type UserRole = 'admin' | 'gerente' | 'programador' | 'operador' | 'acabamento';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'production' | 'setup' | 'maintenance' | 'offline';
}

export interface TechParams {
  rpm?: number;
  feed_rate?: number;
  plunge_rate?: number;
  power?: number;
  passes?: number;
  tool_suggested?: string;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  thickness: number;
  tech_params: TechParams;
  can_rotate: boolean;
  can_mirror: boolean;
  grain_direction?: 'horizontal' | 'vertical' | 'none';
  stock_quantity?: number;
  min_stock?: number;
  avg_waste?: number;
}

export interface WorkOrder {
  id: string;
  order_number: number;
  client_name: string;
  description: string;
  priority: number;
  status: 'pending' | 'programming' | 'production' | 'finishing' | 'completed' | 'cancelled';
  due_date: string;
  created_at: string;
}

export interface ProductionLog {
  id: string;
  os_id: string;
  machine_id: string;
  user_id: string;
  log_type: 'setup' | 'production' | 'pause' | 'adjustment';
  started_at: string;
  ended_at?: string;
  notes?: string;
  waste_material_m2?: number;
}

export interface AppNotification {
  id: string;
  type: 'warning' | 'success' | 'info' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}
