import { CutTechnology, ContourRule } from '../shared/types/industrial.types';

export class CuttingEngineService {
  /**
   * Machine limits and capabilities.
   */
  static readonly MACHINE_LIMITS = {
    laser_fiber: { min_hole: 0.5, max_speed: 60000, max_accel: 20000 },
    laser_co2: { min_hole: 0.8, max_speed: 30000, max_accel: 10000 },
    cnc_router: { min_hole: 2.0, max_speed: 15000, max_accel: 5000 },
    impressora_uv: { min_hole: 0, max_speed: 10000, max_accel: 2000 }
  };

  /**
   * Quality modifiers for speed and precision.
   */
  static readonly QUALITY_MODIFIERS = {
    economico: { speed: 1.2, precision: 0.8 },
    producao: { speed: 1.0, precision: 1.0 },
    precisao: { speed: 0.7, precision: 1.5 }
  };

  /**
   * Estimates production time based on geometry and technical parameters.
   */
  static estimateTime(
    perimeter_mm: number,
    pierces: number,
    base_speed_mm_min: number,
    quality: 'economico' | 'producao' | 'precisao' = 'producao',
    pierce_time_sec: number = 2
  ): number {
    if (base_speed_mm_min <= 0) return 0;
    
    const modifier = this.QUALITY_MODIFIERS[quality].speed;
    const actual_speed = base_speed_mm_min * modifier;
    
    const cut_time_min = perimeter_mm / actual_speed;
    const pierce_time_min = (pierces * pierce_time_sec) / 60;
    
    // Add dynamic overhead based on complexity (more pierces = more overhead)
    const complexity_factor = 1.1 + (pierces * 0.005);
    const total_time_min = (cut_time_min + pierce_time_min) * complexity_factor;
    
    return Math.round(total_time_min);
  }

  /**
   * Validates if a geometry is viable for a specific machine.
   */
  static validateGeometry(machineType: string, minFeatureSize: number): {
    ok: boolean;
    reason?: string;
  } {
    const limits = this.MACHINE_LIMITS[machineType as keyof typeof this.MACHINE_LIMITS];
    if (!limits) return { ok: true };

    if (minFeatureSize < limits.min_hole) {
      return { 
        ok: false, 
        reason: `Geometria (${minFeatureSize}mm) menor que o limite da máquina (${limits.min_hole}mm)` 
      };
    }

    return { ok: true };
  }

  /**
   * Returns the color and parameters for a contour based on its size.
   */
  static getContourClassification(size_mm: number, machineType: string): { 
    label: string, 
    color: string, 
    speedModifier: number 
  } {
    // Large Contour
    if (size_mm > 100) {
      return { label: 'GRANDE', color: '#22c55e', speedModifier: 1.0 }; // green
    }
    // Medium Contour
    if (size_mm > 30) {
      return { label: 'MÉDIO', color: '#eab308', speedModifier: 0.8 }; // yellow
    }
    // Small Contour / Precise
    if (size_mm > 5) {
      return { label: 'MICRO', color: '#f97316', speedModifier: 0.5 }; // orange
    }
    // Critical / Pin point
    return { label: 'CRÍTICO', color: '#ef4444', speedModifier: 0.3 }; // red
  }

  /**
   * Logic to suggest microjoints for unstable parts
   */
  static suggestMicrojoints(width_mm: number, height_mm: number): {
    needed: boolean,
    count: number,
    size_mm: number
  } {
    const area = width_mm * height_mm;
    
    // If area is smaller than 20x20mm, it's very unstable
    if (area < 400) {
      return { needed: true, count: 2, size_mm: 0.5 };
    }
    
    // If one dimension is very thin (aspect ratio)
    if (width_mm < 10 || height_mm < 10) {
      return { needed: true, count: 3, size_mm: 0.8 };
    }

    return { needed: false, count: 0, size_mm: 0 };
  }

  /**
   * Calculates the raw and net yield of a nesting layout.
   */
  static calculateIndustrialYield(
    sheetArea: number,
    partsArea: number,
    kerf_mm: number = 2
  ): {
    rawYield: number;
    netYield: number;
    wasteArea: number;
  } {
    if (sheetArea <= 0) return { rawYield: 0, netYield: 0, wasteArea: 0 };

    const rawYield = (partsArea / sheetArea) * 100;
    // Net yield accounts for material lost due to laser kerf (simplified)
    const kerfLossEstimate = (partsArea * (kerf_mm / 100)); // Rough estimation
    const netYield = ((partsArea - kerfLossEstimate) / sheetArea) * 100;

    return {
      rawYield,
      netYield,
      wasteArea: sheetArea - partsArea
    };
  }

  /**
   * Calculates OEE (Overall Equipment Effectiveness).
   * OEE = Availability × Performance × Quality
   */
  static calculateOEE(
    plannedTimeSec: number,
    actualRunTimeSec: number,
    idealCycleTimeSec: number,
    totalProduced: number,
    goodProduced: number
  ): {
    oee: number;
    availability: number;
    performance: number;
    quality: number;
  } {
    const availability = plannedTimeSec > 0 ? (actualRunTimeSec / plannedTimeSec) * 100 : 0;
    
    // Performance = (Ideal Cycle Time × Total Count) / Actual Run Time
    const performance = (actualRunTimeSec > 0 && totalProduced > 0) 
      ? ((idealCycleTimeSec * totalProduced) / actualRunTimeSec) * 100 
      : 0;
    
    const quality = totalProduced > 0 ? (goodProduced / totalProduced) * 100 : 0;
    
    const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;
    
    return {
      oee: Math.min(100, Math.round(oee)),
      availability: Math.min(100, Math.round(availability)),
      performance: Math.min(100, Math.round(performance)),
      quality: Math.min(100, Math.round(quality))
    };
  }

  /**
   * Calculates OLE (Overall Labor Effectiveness).
   */
  static calculateOLE(
    workedTimeSec: number,
    producedValue: number,
    averageProducedValue: number
  ): number {
    if (workedTimeSec <= 0 || averageProducedValue <= 0) return 0;
    return Math.round((producedValue / (workedTimeSec * averageProducedValue)) * 100);
  }

  /**
   * Predicts potential delays based on historical data vs current progress.
   */
  static predictDelayRisk(
    elapsedSec: number,
    estimatedTotalSec: number,
    partsCompleted: number,
    totalParts: number
  ): 'low' | 'medium' | 'high' {
    if (elapsedSec <= 0 || estimatedTotalSec <= 0) return 'low';
    
    const progressPercent = (partsCompleted / totalParts) * 100;
    const timeUsedPercent = (elapsedSec / estimatedTotalSec) * 100;
    
    // If we've used 50% of the time but only done 30% of parts
    if (timeUsedPercent > progressPercent + 20) return 'high';
    if (timeUsedPercent > progressPercent + 10) return 'medium';
    return 'low';
  }

  /**
   * Calculates average lead time in hours.
   */
  static calculateAverageLeadTime(orders: any[]): number {
    const finished = orders.filter(o => o.status === 'concluido' && o.created_at && o.updated_at);
    if (finished.length === 0) return 15.5; // Default fallback

    const totalHours = finished.reduce((acc, o) => {
      const start = new Date(o.created_at).getTime();
      const end = new Date(o.updated_at).getTime();
      return acc + (end - start) / (1000 * 60 * 60);
    }, 0);

    return Math.round((totalHours / finished.length) * 10) / 10;
  }

  static readonly CEP_TARGET = 100;

  /**
   * Calculates process capability indices (Cp, Cpk) and control limits.
   */
  static calculateCEP(values: number[], target: number = 100) {
    if (values.length < 2) return null;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (values.length - 1);
    const stdDev = Math.sqrt(variance);

    // Control Limits (3-sigma)
    const ucl = mean + (3 * stdDev);
    const lcl = Math.max(0, mean - (3 * stdDev));

    return {
      mean: Math.round(mean * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      ucl: Math.round(ucl * 100) / 100,
      lcl: Math.round(lcl * 100) / 100,
      count: values.length,
      cp: Math.round((20 / (6 * stdDev)) * 100) / 100 || 0, // Tolerância arbitrária de 20%
      cpk: Math.round(Math.min((target - mean) / (3 * stdDev), (mean - target) / (3 * stdDev)) * 100) / 100 || 0
    };
  }

  /**
   * Static targets for CEP
   */
  static getCPK(mean: number, stdDev: number, usl: number, lsl: number) {
    if (stdDev === 0) return 1.33;
    const cpkUpper = (usl - mean) / (3 * stdDev);
    const cpkLower = (mean - lsl) / (3 * stdDev);
    const cpk = Math.min(cpkUpper, cpkLower);
    return Math.round(cpk * 100) / 100;
  }
}
