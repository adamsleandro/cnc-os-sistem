import React from 'react';
import { cn } from '../../lib/utils';

export interface TimelineEvent {
  id: string;
  label: string;
  machine: string;
  startHour: number;
  duration: number;
  status: 'completed' | 'ongoing' | 'pending' | 'concluido';
}

interface ProductionTimelineProps {
  events?: TimelineEvent[];
}

export function ProductionTimeline({ events = [] }: ProductionTimelineProps) {
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 08:00 to 18:00

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Cronograma de Produção</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">12 de Maio, 2024</span>
      </div>
      
      <div className="p-6">
        <div className="flex mb-4 ml-24">
          {hours.map(hour => (
            <div key={hour} className="flex-1 text-[10px] font-black text-slate-400 border-l border-slate-100 pl-2">
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {['Router 2030', 'Laser CO2', 'Laser Fiber'].map((machine) => (
            <div key={machine} className="flex items-center gap-4 group">
              <div className="w-20 text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">
                {machine}
              </div>
              <div className="flex-1 flex h-10 bg-slate-50 rounded-xl relative overflow-hidden group-hover:bg-slate-100 transition-colors">
                {events.filter(e => e.machine.includes(machine)).map(event => {
                  const startPos = ((event.startHour - 8) / 10) * 100;
                  const width = (event.duration / 10) * 100;
                  
                  return (
                    <div 
                      key={event.id}
                      className={cn(
                        "absolute h-full rounded-lg border-x-2 border-white/20 transition-all flex items-center px-3 z-10",
                        event.status === 'completed' ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : 
                        event.status === 'ongoing' ? "bg-blue-500 animate-pulse shadow-lg shadow-blue-500/20" : 
                        "bg-slate-300"
                      )}
                      style={{ left: `${startPos}%`, width: `${width}%` }}
                    >
                      <span className="text-[9px] font-black text-white truncate uppercase tracking-tighter">
                        {event.label}
                      </span>
                    </div>
                  );
                })}
                {/* Visual grid lines */}
                {hours.map((_, i) => (
                  <div key={i} className="absolute h-full w-px bg-white/50" style={{ left: `${(i / 10) * 100}%` }}></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
