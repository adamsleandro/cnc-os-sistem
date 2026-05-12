export interface NestingPart {
  id?: string;
  project_id: string;
  order_id?: string;
  name: string;
  width: number;
  height: number;
  quantity: number;
  rotation_allowed: boolean;
  grain_direction: 'horizontal' | 'vertical' | 'none';
}

export interface PlacedPart {
  part_id: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
}

export interface NestingProject {
  id?: string;
  title: string;
  material_id: string;
  thickness: number;
  plate_width: number;
  plate_height: number;
  status: 'draft' | 'optimizing' | 'ready' | 'mes';
  efficiency: number;
  waste: number;
  company_id: string;
  created_at: string;
}

export interface NestingLayout {
  id?: string;
  project_id: string;
  parts_placed: PlacedPart[];
  sheet_usage_mm2: number;
  efficiency: number;
}
