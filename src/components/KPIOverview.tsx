import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, Target, ShieldCheck, Clock, Zap, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface KPIOverviewProps {
  oee: {
    oee: number;
    availability: number;
    performance: number;
    quality: number;
  };
  hourlyProduction: { time: string; parts: number }[];
}

export function KPIOverview({ oee, hourlyProduction }: KPIOverviewProps) {
  const oeeData = [
    { name: 'Eficiência', value: oee.oee, color: '#3b82f6' },
    { name: 'Restante', value: 100 - oee.oee, color: '#1e293b' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* OEE Main Gauge */}
      <div className="bg-slate-900 rounded-[32px] p-8 text-white flex flex-col items-center justify-center relative overflow-hidden h-[320px] shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-50" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-6 italic">OEE Global Industrial</h3>
        
        <div className="w-full h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={oeeData}
                innerRadius={60}
                outerRadius={80}
                startAngle={180}
                endAngle={0}
                paddingAngle={0}
                dataKey="value"
              >
                {oeeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
            <span className="text-4xl font-black italic tracking-tighter">{oee.oee}%</span>
            <span className="text-[8px] font-black uppercase text-slate-500">Eficiência Geral</span>
          </div>
        </div>

        <div className="grid grid-cols-3 w-full gap-4 mt-2">
           <KPIMini label="Dispon." value={oee.availability} color="text-emerald-400" />
           <KPIMini label="Perf." value={oee.performance} color="text-blue-400" />
           <KPIMini label="Qualidade" value={oee.quality} color="text-amber-400" />
        </div>
      </div>

      {/* Production Trend */}
      <div className="md:col-span-2 bg-white border-2 border-slate-100 rounded-[32px] p-8 shadow-sm h-[320px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 italic">Volume de Produção (Peças/h)</h3>
            <p className="text-[10px] font-bold text-slate-400">Monitoramento de performance em tempo real</p>
          </div>
          <TrendingUp size={20} className="text-blue-600" />
        </div>

        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyProduction}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} 
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
              />
              <Bar dataKey="parts" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function KPIMini({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="text-center">
      <p className="text-[7px] font-black uppercase text-slate-500 mb-1">{label}</p>
      <p className={cn("text-xs font-black italic", color)}>{value}%</p>
      <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
        <div 
          className={cn("h-full", color.replace('text-', 'bg-'))} 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
}
