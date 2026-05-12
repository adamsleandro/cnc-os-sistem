import React from 'react';
import { Zap, Activity, ShieldCheck, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export function TechEngine() {
  const params = [
    { label: 'Fresa Sugerida', value: 'Upcut 6mm 2 Cortes', icon: ShieldCheck, color: 'text-blue-500' },
    { label: 'Rotação (RPM)', value: '18.000', icon: Zap, color: 'text-amber-500' },
    { label: 'Avanço (mm/min)', value: '8.000', icon: Activity, color: 'text-emerald-500' },
    { label: 'Prof. Passada', value: '1.5 mm', icon: Info, color: 'text-slate-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h3 className="text-lg font-black text-white uppercase tracking-widest">Engine Técnica</h3>
         <span className="text-[8px] font-black bg-blue-600 text-white px-2 py-1 rounded uppercase tracking-tighter">Auto-Sugerido</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {params.map((param, i) => (
          <div key={i} className="p-5 bg-slate-900/50 rounded-2xl border border-white/5 space-y-2 group hover:border-blue-500/30 transition-all">
            <div className={cn("p-2 rounded-lg bg-white/5 w-fit", param.color)}>
              <param.icon size={18} />
            </div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{param.label}</p>
            <p className="text-sm font-black text-white tracking-tight">{param.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
