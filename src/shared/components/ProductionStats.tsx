import React from 'react';
import { TrendingUp, Users, Clock, AlertTriangle, Layers } from 'lucide-react';

interface ProductionStatsProps {
  activeMachines: number;
  pendingOS: number;
  efficiency: number;
}

export function ProductionStats({ activeMachines, pendingOS, efficiency }: ProductionStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        label="Eficiência OEE" 
        value={`${efficiency}%`} 
        trend="+1.2%" 
        icon={TrendingUp} 
        color="text-emerald-600" 
        bgColor="bg-emerald-50" 
      />
      <StatCard 
        label="Máquinas Ativas" 
        value={activeMachines.toString()} 
        trend="Live" 
        icon={Users} 
        color="text-blue-600" 
        bgColor="bg-blue-50" 
      />
      <StatCard 
        label="Backlog de Produção" 
        value={pendingOS.toString()} 
        trend="OS Pendentes" 
        icon={Layers} 
        color="text-amber-600" 
        bgColor="bg-amber-50" 
      />
      <StatCard 
        label="Tempo de Setup Médio" 
        value="18m" 
        trend="-5%" 
        icon={Clock} 
        color="text-slate-600" 
        bgColor="bg-slate-100" 
      />
    </div>
  );
}

function StatCard({ label, value, trend, icon: Icon, color, bgColor }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
      <div className={`${bgColor} ${color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-xl font-black text-slate-900">{value}</h4>
          <span className={`text-[10px] font-bold ${trend.startsWith('+') ? 'text-emerald-500' : trend.startsWith('-') ? 'text-blue-500' : 'text-slate-400'}`}>
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
}
