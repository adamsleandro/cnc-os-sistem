import React, { useState, useEffect } from 'react';
import { Settings, Wrench, AlertTriangle, CheckCircle2, Clock, Plus, PenTool } from 'lucide-react';
import { useAuth } from '../../core/auth';
import { useDashboardData } from '../../shared/hooks/useDashboardData';
import { cn } from '../../lib/utils';

interface MaintenanceRecord {
  id: string;
  machineId: string;
  type: 'preventive' | 'corrective' | 'predictive';
  description: string;
  status: 'pending' | 'completed';
  date: string;
}

export function MaintenancePage() {
  const { machines } = useDashboardData();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const maintenanceRecords: MaintenanceRecord[] = [
    { id: '1', machineId: machines[0]?.id || '1', type: 'preventive', description: 'Lubrificação fuso de esferas e guias lineares', status: 'pending', date: '2024-05-15' },
    { id: '2', machineId: machines[1]?.id || '2', type: 'predictive', description: 'Substituição escovas coletoras motor de passo', status: 'pending', date: '2024-05-20' },
    { id: '3', machineId: machines[0]?.id || '1', type: 'corrective', description: 'Troca de correia de transmissão eixo Y', status: 'completed', date: '2024-04-10' },
  ];

  const pending = maintenanceRecords.filter(r => r.status === 'pending');
  const history = maintenanceRecords.filter(r => r.status === 'completed');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Manutenção de Ativos</h1>
          <p className="text-slate-500 mt-1">Controle de intervenções preventivas, corretivas e preditivas.</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2">
          <Plus size={18} /> Programar Manutenção
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-4 border-b border-slate-200">
             <button 
              onClick={() => setActiveTab('pending')}
              className={cn(
                "pb-4 text-xs font-black uppercase tracking-widest transition-all px-2",
                activeTab === 'pending' ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400"
              )}
             >
               Pendentes ({pending.length})
             </button>
             <button 
              onClick={() => setActiveTab('history')}
              className={cn(
                "pb-4 text-xs font-black uppercase tracking-widest transition-all px-2",
                activeTab === 'history' ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400"
              )}
             >
               Histórico
             </button>
          </div>

          <div className="space-y-4">
             {(activeTab === 'pending' ? pending : history).map((record) => {
               const machine = machines.find(m => m.id === record.machineId);
               return (
                 <div key={record.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6 hover:border-slate-300 transition-all">
                    <div className="flex gap-4">
                       <div className={cn(
                         "w-12 h-12 rounded-xl flex items-center justify-center",
                         record.type === 'preventive' ? "bg-blue-50 text-blue-600" :
                         record.type === 'corrective' ? "bg-red-50 text-red-600" :
                         "bg-purple-50 text-purple-600"
                       )}>
                         <PenTool size={20} />
                       </div>
                       <div className="space-y-1">
                          <h4 className="font-bold text-slate-900">{record.description}</h4>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black uppercase text-slate-400">{machine?.name || 'Máquina Geral'}</span>
                             <span className="w-1 h-1 bg-slate-300 rounded-full" />
                             <span className="text-[10px] font-black uppercase text-blue-500">{record.type}</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="text-right">
                          <p className="text-[10px] font-black uppercase text-slate-400">Data Limite</p>
                          <p className="text-sm font-bold text-slate-900">{record.date}</p>
                       </div>
                       <button className={cn(
                         "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                         record.status === 'completed' 
                          ? "bg-emerald-50 text-emerald-600" 
                          : "bg-slate-100 text-slate-600 hover:bg-emerald-600 hover:text-white"
                       )}>
                         {record.status === 'completed' ? 'Realizado' : 'Concluir'}
                       </button>
                    </div>
                 </div>
               );
             })}
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6">
              <h3 className="text-lg font-black uppercase tracking-widest italic">Saúde da Frota</h3>
              <div className="space-y-4">
                 <HealthIndicator label="Router CNC" value={92} />
                 <HealthIndicator label="Laser CO2" value={78} warning />
                 <HealthIndicator label="Laser Fibra" value={100} />
              </div>
              <div className="pt-4 border-t border-white/10 mt-6">
                 <p className="text-[10px] font-medium text-white/50 leading-relaxed italic">
                   Frota operando em capacidade nominal. 1 manutenção crítica agendada para as próximas 48h.
                 </p>
              </div>
           </div>

           <div className="bg-white border border-slate-200 rounded-[32px] p-8 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Alertas Preditivos</h3>
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                 <AlertTriangle size={18} className="text-amber-600 mt-1" />
                 <div>
                    <p className="text-xs font-bold text-amber-900">Vibração Excessiva</p>
                    <p className="text-[10px] text-amber-700">Detectada no eixo Z da Router #HMC-204.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function HealthIndicator({ label, value, warning }: { label: string, value: number, warning?: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
         <span className="text-white/60">{label}</span>
         <span className={cn(warning ? "text-amber-400" : "text-emerald-400")}>{value}%</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
         <div 
          className={cn("h-full rounded-full transition-all duration-1000", warning ? "bg-amber-400" : "bg-emerald-400")} 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
}
