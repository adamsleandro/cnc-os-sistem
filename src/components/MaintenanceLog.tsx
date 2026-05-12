import React from 'react';
import { Wrench, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LogEntry {
  id: string;
  date: string;
  machine: string;
  type: 'Preventiva' | 'Corretiva' | 'Troca de Fresa';
  description: string;
  status: 'concluido' | 'agendado';
  operator: string;
}

const MOCK_LOGS: LogEntry[] = [
  { id: '1', date: '10/05/2024', machine: 'Router 2030 X1', type: 'Preventiva', description: 'Lubrificação de guias lineares e limpeza de pinças.', status: 'concluido', operator: 'Ricardo M.' },
  { id: '2', date: '12/05/2024', machine: 'Laser CO2 1390', type: 'Troca de Fresa', description: 'Substituição de lente focal (limpeza mensal).', status: 'concluido', operator: 'Leandro A.' },
  { id: '3', date: '15/05/2024', machine: 'Router 1313 Mini', type: 'Corretiva', description: 'Ajuste de tensão na correia do eixo Y.', status: 'agendado', operator: 'Ricardo M.' },
];

export function MaintenanceLog() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Wrench size={18} className="text-blue-600" /> Histórico de Manutenção
        </h3>
        <button className="text-xs font-bold text-blue-600 hover:underline">+ Registrar Manutenção</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Máquina</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Responsável</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {MOCK_LOGS.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{log.date}</td>
                <td className="px-6 py-4 font-bold text-slate-900 text-sm">{log.machine}</td>
                <td className="px-6 py-4">
                  <span className="text-xs text-slate-600 font-medium">{log.type}</span>
                </td>
                <td className="px-6 py-4">
                   {log.status === 'concluido' ? (
                     <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase">
                       <CheckCircle2 size={12} /> Concluído
                     </span>
                   ) : (
                     <span className="flex items-center gap-1 text-amber-600 text-[10px] font-black uppercase">
                       <Calendar size={12} /> Agendado
                     </span>
                   )}
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">{log.operator}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-6 bg-blue-50/50 flex items-center gap-4">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <AlertCircle size={20} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-blue-900">Próxima Manutenção Geral em 5 dias</p>
          <p className="text-[10px] text-blue-600">Verificação de exaustão e filtros na Laser Fiber 3015.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg shadow-lg shadow-blue-200">
          Confirmar Agenda
        </button>
      </div>
    </div>
  );
}
