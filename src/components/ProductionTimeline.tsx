import React from 'react';
import { cn } from '@/src/lib/utils';

export interface TimelineEvent {
  id: string;
  label: string;
  machine: string;
  startHour: number; // 0-24
  duration: number;
  status: 'completed' | 'ongoing' | 'pending';
}

interface ProductionTimelineProps {
  events?: TimelineEvent[];
}

export function ProductionTimeline({ events = [] }: ProductionTimelineProps) {
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 08:00 to 18:00

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900">Timeline de Produção (Hoje)</h3>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carga Horária: 08:00 - 18:00</div>
      </div>

      <div className="relative">
        {/* Time Header */}
        <div className="flex border-b border-slate-100 pb-2 mb-4 ml-24">
          {hours.map(h => (
            <div key={h} className="flex-1 text-[10px] font-bold text-slate-400 text-center">
              {h}h
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-4">
          {['Router 2030', 'Laser CO2', 'Laser Fiber'].map(machine => (
            <div key={machine} className="flex items-center group">
              <div className="w-24 shrink-0 text-[10px] font-black text-slate-500 uppercase truncate pr-4">
                {machine}
              </div>
              <div className="flex-1 flex h-8 bg-slate-50 rounded-lg relative overflow-hidden">
                {events.filter(e => e.machine.includes(machine)).map(event => {
                  const startPos = ((event.startHour - 8) / 10) * 100;
                  const width = (event.duration / 10) * 100;
                  
                  return (
                    <div 
                      key={event.id}
                      className={cn(
                        "absolute top-1 bottom-1 rounded-md flex items-center justify-center px-2 text-[9px] font-bold shadow-sm transition-all hover:scale-[1.02] cursor-pointer",
                        event.status === 'completed' ? "bg-slate-200 text-slate-600 border border-slate-300" :
                        event.status === 'ongoing' ? "bg-emerald-500 text-white shadow-emerald-200" :
                        "bg-blue-100 text-blue-700 border border-blue-200"
                      )}
                      style={{ left: `${startPos}%`, width: `${width}%` }}
                    >
                      <span className="truncate">{event.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 flex items-center gap-4 pt-4 border-t border-slate-50">
        <LegendItem color="bg-slate-200" label="Finalizado" />
        <LegendItem color="bg-emerald-500" label="Executando" />
        <LegendItem color="bg-blue-100" label="Agendado" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("w-2 h-2 rounded-full", color)}></div>
      <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
    </div>
  );
}
