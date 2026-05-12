import React from 'react';
import { CuttingEngineService } from '../services/cuttingEngine';
import { cn } from '../lib/utils';

interface GearShape {
  id: string;
  size_mm: number;
  x: number;
  y: number;
  type: 'circle' | 'square' | 'complex';
}

export function IndustrialCuttingCanvas({ machineType }: { machineType: string }) {
  // Mock geometry for visualization
  const shapes: GearShape[] = [
    { id: '1', size_mm: 120, x: 50, y: 50, type: 'square' },
    { id: '2', size_mm: 45, x: 220, y: 80, type: 'circle' },
    { id: '3', size_mm: 15, x: 150, y: 150, type: 'circle' },
    { id: '4', size_mm: 3, x: 80, y: 180, type: 'complex' },
    { id: '5', size_mm: 60, x: 280, y: 160, type: 'square' },
  ];

  return (
    <div className="bg-slate-900 border-4 border-slate-700 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Visualização de Percurso CAM</h3>
        <div className="flex gap-4">
          <LegendItem color="#22c55e" label="Grande (Rápido)" />
          <LegendItem color="#eab308" label="Médio" />
          <LegendItem color="#f97316" label="Micro (Lento)" />
          <LegendItem color="#ef4444" label="Crítico (Ultra)" />
        </div>
      </div>

      <div className="relative aspect-video bg-[#0a0a0k} border-2 border-slate-800 overflow-hidden rounded overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #444 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <svg className="w-full h-full p-8" viewBox="0 0 400 250">
          {shapes.map((shape) => {
            const classification = CuttingEngineService.getContourClassification(shape.size_mm, machineType);
            const scale = shape.size_mm / 2;
            
            return (
              <g key={shape.id} className="cursor-help group">
                {shape.type === 'circle' && (
                  <circle 
                    cx={shape.x} 
                    cy={shape.y} 
                    r={scale} 
                    fill="none" 
                    stroke={classification.color} 
                    strokeWidth={4}
                    className="transition-all hover:stroke-white"
                  />
                )}
                {shape.type === 'square' && (
                  <rect 
                    x={shape.x - scale/2} 
                    y={shape.y - scale/2} 
                    width={scale} 
                    height={scale} 
                    fill="none" 
                    stroke={classification.color} 
                    strokeWidth={4}
                    className="transition-all hover:stroke-white"
                  />
                )}
                {shape.type === 'complex' && (
                  <path 
                    d={`M ${shape.x} ${shape.y} l 5 10 l 10 -5 l -5 -10 z`}
                    fill="none" 
                    stroke={classification.color} 
                    strokeWidth={4}
                    transform={`scale(${scale/5}) translate(${-shape.x * (scale/5-1)}, ${-shape.y * (scale/5-1)})`}
                  />
                )}
                
                {/* Microjoint simulation for small parts */}
                {CuttingEngineService.suggestMicrojoints(shape.size_mm, shape.size_mm).needed && (
                  <g>
                    <rect x={shape.x - 2} y={shape.y - scale - 2} width={4} height={4} fill="#0ea5e9" />
                    <rect x={shape.x - 2} y={shape.y + scale - 2} width={4} height={4} fill="#0ea5e9" />
                  </g>
                )}

                <text 
                  x={shape.x} y={shape.y - scale - 10} 
                  className="fill-white text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity text-center"
                  textAnchor="middle"
                >
                  {classification.label} • {shape.size_mm}mm
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 italic">Engine Stats:</p>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="Aproveitamento" value="84.2%" />
            <StatBox label="Microjuntas" value="12" />
            <StatBox label="Tecnologia" value="Automática" highlight />
            <StatBox label="Lead-in" value="Padrão 2mm" />
         </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500">{label}</span>
    </div>
  );
}

function StatBox({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div>
      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <p className={cn("text-xs font-black uppercase", highlight ? "text-blue-500" : "text-white")}>{value}</p>
    </div>
  );
}
