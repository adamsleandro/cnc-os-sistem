import React from 'react';
import { Monitor, Circle } from 'lucide-react';
import { cn } from '../lib/utils';
import { StatusBadge } from '../shared/components/StatusBadge';

interface MachineStatusCardProps {
  name: string;
  type: string;
  status: string; // fallback to string to avoid complex overlap issues
  currentJob?: string;
  operator?: string;
  onReconnect?: () => void;
}

export const MachineStatusCard: React.FC<MachineStatusCardProps> = ({ name, type, status, currentJob, operator, onReconnect }) => {
  const getPulseColor = (s: string) => {
    switch (s) {
      case 'production': return 'bg-emerald-500';
      case 'setup': return 'bg-amber-500';
      case 'idle': return 'bg-slate-400';
      case 'maintenance': return 'bg-red-500';
      default: return 'bg-slate-200';
    }
  };

  return (
    <div className={cn(
      "bg-white border p-6 rounded-2xl transition-all duration-300",
      status === 'production' ? "border-emerald-200 shadow-lg shadow-emerald-50" : "border-slate-200"
    )}>
      <div className="flex items-start justify-between mb-6">
        <div className="bg-slate-50 p-2.5 rounded-xl text-slate-600">
          <Monitor size={22} />
        </div>
        <StatusBadge status={status as any} />
      </div>

      <div className="mb-4">
        <h3 className="font-bold text-slate-900 text-lg leading-tight">{name}</h3>
        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{type}</p>
      </div>

      {status === 'production' || status === 'setup' ? (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Trabalho Atual</span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">75%</span>
            </div>
            <div className="text-xs font-bold text-slate-700 truncate mb-2">{currentJob}</div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-xs font-black text-blue-600">
               {operator?.charAt(0)}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-xs font-black text-slate-900 truncate tracking-tight">{operator}</p>
               <p className="text-[10px] text-slate-400 font-bold">Em Operação</p>
             </div>
             <div className="flex items-center gap-1.5">
                <span className={cn("w-2 h-2 rounded-full animate-pulse", getPulseColor(status))}></span>
                <span className="text-[10px] font-black text-slate-400 uppercase">Live</span>
             </div>
          </div>
        </div>
      ) : status === 'offline' ? (
        <div className="py-2 text-center">
          <p className="text-[10px] font-black text-red-500 uppercase mb-3">Erro de Comunicação</p>
          <button 
            onClick={onReconnect}
            className="w-full py-2 bg-red-100 text-red-600 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-red-200 transition-colors"
          >
            Reconectar
          </button>
        </div>
      ) : (
        <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-lg">
          <p className="text-xs text-slate-400 font-medium">Máquina Disponível</p>
        </div>
      )}
    </div>
  );
}
