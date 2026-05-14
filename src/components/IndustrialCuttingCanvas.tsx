import React, { useState, useEffect } from 'react';
import { CuttingEngineService } from '../services/cuttingEngine';
import { cn } from '../lib/utils';
import { Box, Layers, Play, Settings } from 'lucide-react';

interface GearShape {
  id: string;
  size_mm: number;
  x: number;
  y: number;
  type: 'circle' | 'square' | 'complex';
}

export function IndustrialCuttingCanvas({ machineType, svgDataUrl }: { machineType: string, svgDataUrl?: string }) {
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [isSimulating, setIsSimulating] = useState(true);

  // Mock geometry for visualization if no external CAM provided
  const shapes: GearShape[] = [
    { id: '1', size_mm: 120, x: 50, y: 50, type: 'square' },
    { id: '2', size_mm: 45, x: 220, y: 80, type: 'circle' },
    { id: '3', size_mm: 15, x: 150, y: 150, type: 'circle' },
    { id: '4', size_mm: 30, x: 80, y: 180, type: 'complex' },
    { id: '5', size_mm: 60, x: 280, y: 160, type: 'square' },
  ];

  return (
    <div className="bg-slate-900 border-4 border-slate-700 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Visualização CAM Real-time</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode('2D')} 
            className={cn("px-3 py-1 text-[10px] font-black uppercase flex items-center gap-1", viewMode === '2D' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400')}
          >
            <Layers size={12} /> 2D
          </button>
          <button 
            onClick={() => setViewMode('3D')} 
            className={cn("px-3 py-1 text-[10px] font-black uppercase flex items-center gap-1", viewMode === '3D' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400')}
          >
            <Box size={12} /> 3D
          </button>
        </div>
      </div>

      <div className="relative aspect-video bg-[#0a0a0a] border-2 border-slate-800 rounded overflow-hidden perspective-1000">
        {/* Grid lines */}
        <div className={cn(
          "absolute inset-0 opacity-20 pointer-events-none transition-all duration-700 ease-in-out",
          viewMode === '3D' && "transform rotate-x-60 scale-125 translate-y-10"
        )} style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <svg 
          className={cn(
            "w-full h-full p-8 transition-transform duration-700 ease-in-out transform-gpu",
            viewMode === '3D' && "rotate-x-60 scale-125 translate-y-10 drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)]"
          )} 
          viewBox="0 0 400 250"
        >
          {/* Base Plate Simulation */}
          <rect x="-10" y="-10" width="420" height="270" fill="#1a1a1a" stroke="#444" strokeWidth="2" opacity="0.5" />

          {/* Laser Head Glow Effect Def */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Generate Paths for AnimateMotion */}
            {shapes.map(shape => {
              const scale = shape.size_mm / 2;
              let d = '';
              if (shape.type === 'circle') {
                d = `M ${shape.x - scale}, ${shape.y} a ${scale},${scale} 0 1,0 ${scale*2},0 a ${scale},${scale} 0 1,0 ${-scale*2},0`;
              } else if (shape.type === 'square') {
                d = `M ${shape.x - scale/2},${shape.y - scale/2} h ${scale} v ${scale} h ${-scale} v ${-scale}`;
              } else if (shape.type === 'complex') {
                const s = scale/5;
                const ox = shape.x;
                const oy = shape.y;
                d = `M ${ox},${oy} l ${5*s},${10*s} l ${10*s},${-5*s} l ${-5*s},${-10*s} z`;
              }
              return <path key={`path-${shape.id}`} id={`animPath-${shape.id}`} d={d} />;
            })}
          </defs>

          {svgDataUrl ? (
             <image href={svgDataUrl} width="400" height="250" opacity="0.8" />
          ) : (
            shapes.map((shape, index) => {
              const classification = CuttingEngineService.getContourClassification(shape.size_mm, machineType);
              const scale = shape.size_mm / 2;
              
              // Sequence timing for simulation
              const dur = Math.max(2, shape.size_mm / 20); // Faster for small, slower for big
              const beginDelay = index * 2; // Staggered start
              
              return (
                <g key={shape.id} className="group">
                  {/* The cut path (revealed gradually via stroke-dasharray if we wanted, but let's keep it simple) */}
                  <use 
                    href={`#animPath-${shape.id}`} 
                    fill="none" 
                    stroke={classification.color} 
                    strokeWidth={viewMode === '3D' ? 6 : 3}
                    strokeDasharray="1000"
                    strokeDashoffset={isSimulating ? "0" : "1000"} 
                    style={{ transition: 'stroke-dashoffset 2s linear' }}
                    className="opacity-40 group-hover:opacity-100 transition-opacity"
                  />
                  
                  {/* Laser Head Animation */}
                  {isSimulating && (
                    <g>
                       {/* Laser Beam Base */}
                       <circle r="4" fill="#ef4444" filter="url(#glow)">
                         <animateMotion 
                            dur={`${dur}s`} 
                            repeatCount="indefinite" 
                            begin={`${beginDelay}s`}
                            path={
                              shape.type === 'circle' ? `M ${shape.x - scale}, ${shape.y} a ${scale},${scale} 0 1,0 ${scale*2},0 a ${scale},${scale} 0 1,0 ${-scale*2},0` :
                              shape.type === 'square' ? `M ${shape.x - scale/2},${shape.y - scale/2} h ${scale} v ${scale} h ${-scale} v ${-scale}` :
                              `M ${shape.x},${shape.y} l ${5*(scale/5)},${10*(scale/5)} l ${10*(scale/5)},${-5*(scale/5)} l ${-5*(scale/5)},${-10*(scale/5)} z`
                            }
                         />
                       </circle>
                       <circle r="2" fill="#ffffff">
                         <animateMotion 
                            dur={`${dur}s`} 
                            repeatCount="indefinite" 
                            begin={`${beginDelay}s`}
                            path={
                              shape.type === 'circle' ? `M ${shape.x - scale}, ${shape.y} a ${scale},${scale} 0 1,0 ${scale*2},0 a ${scale},${scale} 0 1,0 ${-scale*2},0` :
                              shape.type === 'square' ? `M ${shape.x - scale/2},${shape.y - scale/2} h ${scale} v ${scale} h ${-scale} v ${-scale}` :
                              `M ${shape.x},${shape.y} l ${5*(scale/5)},${10*(scale/5)} l ${10*(scale/5)},${-5*(scale/5)} l ${-5*(scale/5)},${-10*(scale/5)} z`
                            }
                         />
                       </circle>
                    </g>
                  )}

                  {/* Microjoint simulation for small parts */}
                  {CuttingEngineService.suggestMicrojoints(shape.size_mm, shape.size_mm).needed && (
                    <g transform={viewMode === '3D' ? "translate(0,-1)" : ""}>
                      <rect x={shape.x - 2} y={shape.y - scale - 2} width={4} height={4} fill="#0ea5e9" opacity={0.8} />
                      <rect x={shape.x - 2} y={shape.y + scale - 2} width={4} height={4} fill="#0ea5e9" opacity={0.8} />
                    </g>
                  )}

                  <text 
                    x={shape.x} y={shape.y - scale - 10} 
                    className="fill-white text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity text-center drop-shadow-md"
                    textAnchor="middle"
                  >
                    {classification.label} • {shape.size_mm}mm
                  </text>
                </g>
              );
            })
          )}
          
          {/* Interactive laser positioning (if we wanted to let the user click) */}
        </svg>
      </div>
      
      <div className="bg-slate-800/50 p-4 rounded border border-slate-700 flex justify-between items-center">
         <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 italic">Engine Stats:</p>
            <div className="flex gap-6">
              <StatBox label="Progress" value="Em Andamento" highlight />
               <StatBox label="Vetor Atual" value="G01 X150 Y50" />
               <StatBox label="Potência" value="85%" />
            </div>
         </div>
         
         <button 
           onClick={() => setIsSimulating(!isSimulating)}
           className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-all", isSimulating ? "bg-slate-700 text-slate-400" : "bg-emerald-600 text-white")}
         >
           {isSimulating ? <div className="w-4 h-4 bg-slate-400" /> : <Play size={20} fill="currentColor" />}
         </button>
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
      <p className={cn("text-xs font-black uppercase", highlight ? "text-emerald-500" : "text-white")}>{value}</p>
    </div>
  );
}

