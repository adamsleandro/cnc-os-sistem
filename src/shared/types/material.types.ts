import { Tool } from './machine.types';

export type MaterialCategory = 'acm' | 'mdf' | 'madeira' | 'acrilico' | 'inox' | 'aluminio' | 'pvc' | 'corian' | 'vidro' | 'outro';

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
  company_id: string;
  name: string;
  category: MaterialCategory;
  thickness: number;
  tech_params: TechParams;
  can_rotate: boolean;
  can_mirror: boolean;
  grain_direction?: 'horizontal' | 'vertical' | 'none';
  stock_quantity?: number;
  min_stock?: number;
  avg_waste?: number;
  active: boolean;
}

export interface MaterialParameter {
  id: string;
  company_id: string;
  material_id: string;
  machine_type: string;
  thickness_mm: number;
  // CNC Params
  feed_rate_mm_min?: number;
  spindle_rpm?: number;
  depth_per_pass_mm?: number;
  total_passes?: number;
  // Laser Params
  power_pct?: number;
  speed_mm_s?: number;
  passes?: number;
  suggested_tool_id?: string;
  expected_quality?: string;
  notes?: string;
}
