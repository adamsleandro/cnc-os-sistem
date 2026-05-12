export type OrderStatus = 'aguardando' | 'programacao' | 'fila' | 'setup' | 'em_producao' | 'pausado' | 'acabamento' | 'concluido' | 'cancelado';
export type OrderPriority = 'baixa' | 'normal' | 'alta' | 'urgente';

export interface WorkOrder {
  id: string;
  company_id: string;
  number: string;
  title: string;
  client_name?: string;
  machine_id?: string;
  material_id?: string;
  material_thickness_mm?: number;
  priority: OrderPriority;
  status: OrderStatus;
  estimated_minutes?: number;
  deadline?: string;
  file_url?: string;
  thumbnail_url?: string;
  notes?: string;
  
  // Industrial Engine Fields
  cutting_perimeter_mm?: number;
  total_pierces?: number;
  thickness_mm?: number;
  material_type?: string;
  programmed_tech_id?: string;
  estimated_speed?: number;
  
  // Process Stage Tracking (ms or seconds)
  time_cad?: number;
  time_cam?: number;
  time_setup?: number;
  time_execution?: number;
  time_shipping?: number;
  
  // Quality Tracking
  rework_count?: number;
  reject_count?: number;
  good_count?: number;
  
  // Occurrences and Alerts
  occurrences?: {
    type: 'breakdown' | 'material_fail' | 'file_error' | 'tool_break' | 'other';
    description: string;
    timestamp: string;
    operator_id: string;
  }[];
  
  current_stage?: 'cad' | 'cam' | 'setup' | 'execution' | 'shipping' | 'finished';
  
  programmed_by?: string;
  operator_id?: string;
  finishing_by?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface OEEMetrics {
  id: string;
  company_id: string;
  machine_id: string;
  date: string;
  availability: number; // %
  performance: number; // %
  quality: number; // %
  oee: number; // %
  total_working_seconds: number;
  planned_production_seconds: number;
  actual_production_seconds: number;
  total_parts: number;
  good_parts: number;
  avg_dimensional_deviation?: number;
}

export interface OLEMetrics {
  id: string;
  company_id: string;
  operator_id: string;
  date: string;
  productivity: number;
  execution_efficiency: number;
  setup_efficiency: number;
  rework_rate: number;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  from_status?: OrderStatus;
  to_status: OrderStatus;
  changed_by: string;
  notes?: string;
  created_at: string;
}

export interface TimeRecord {
  id: string;
  company_id: string;
  order_id: string;
  operator_id: string;
  machine_id: string;
  type: 'producao' | 'setup' | 'espera' | 'correcao';
  started_at: string;
  paused_at?: string;
  resumed_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  notes?: string;
  created_at: string;
}

export interface Stoppage {
  id: string;
  company_id: string;
  time_record_id: string;
  order_id: string;
  operator_id: string;
  machine_id: string;
  cause: 'manutencao' | 'falta_material' | 'ajuste_ferramenta' | 'problema_arquivo' | 'queda_energia' | 'refeicao' | 'reuniao' | 'setup' | 'aguardando_aprovacao' | 'outro';
  description?: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  created_at: string;
}
