export type MachineType = 'cnc_router' | 'laser_co2' | 'laser_fiber' | 'router_dupla' | 'plasma' | 'outro';
export type MachineStatus = 'disponivel' | 'em_operacao' | 'setup' | 'manutencao' | 'parada' | 'desativada';

export interface Machine {
  id: string;
  company_id: string;
  name: string;
  type: MachineType;
  brand?: string;
  model?: string;
  work_area_x_mm?: number;
  work_area_y_mm?: number;
  max_thickness_mm?: number;
  max_power_w?: number;
  max_rpm?: number;
  status: MachineStatus;
  active: boolean;
  notes?: string;
  created_at: string;
}

export interface Tool {
  id: string;
  company_id: string;
  name: string;
  type: 'fresa_espiral' | 'fresa_v' | 'broca' | 'bico_laser' | 'fresa_formatada' | 'outro';
  diameter_mm?: number;
  cutting_edges?: number;
  compatible_machines?: string[];
  active: boolean;
  notes?: string;
}
