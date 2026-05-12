import { Timestamp } from 'firebase/firestore';

export interface CutTechnology {
  id: string;
  material: string;
  thickness: number;
  machine_type: 'cnc_router' | 'laser_co2' | 'laser_fiber' | 'impressora_uv';
  quality: 'economico' | 'producao' | 'precisao';
  speed: number;
  power: number;
  gas_pressure?: number;
  lead_in?: number;
  lead_out?: number;
  pierce_time?: number;
  company_id: string;
  created_at?: Timestamp;
}

export interface ContourRule {
  id: string;
  machine_type: string;
  name: string;
  min_size: number;
  max_size: number;
  tech_modifier: number; // multiplier for speed
  color: string;
  description: string;
}

export interface EngravingEngineState {
  material: string;
  thickness: number;
  machineType: string;
  selectedTech: CutTechnology | null;
}
