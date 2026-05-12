import React from 'react';
import { WorkOrder } from '../shared/types/order.types';
import { Layers, ChevronRight, Package, Truck } from 'lucide-react';
import { cn } from '../lib/utils';

export function SmartPlanner({ orders }: { orders: WorkOrder[] }) {
  // Group orders by Material + Thickness
  const groups = orders.reduce((acc: Record<string, WorkOrder[]>, order) => {
    if (order.status === 'concluido' || order.status === 'cancelado') return acc;
    
    const key = `${order.material_type || 'Desconhecido'} - ${order.thickness_mm || 0}mm`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {});

  const groupKeys = Object.keys(groups).sort();

  return (
    <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="text-blue-400" size={24} />
          <h3 className="text-lg font-black uppercase tracking-widest italic">Sequenciamento Inteligente</h3>
        </div>
        <span className="bg-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
          {groupKeys.length} Lotes Sugeridos
        </span>
      </div>

      <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic border-l-2 border-blue-500 pl-4 py-1">
        Otimização automática de setup baseada em Material + Espessura. Reduza trocas de ferramenta e ajuste de parâmetros agrupando estas ordens.
      </p>

      <div className="space-y-3">
        {groupKeys.map(key => (
          <div key={key} className="group bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all cursor-default">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400">
                  <Package size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight">{key}</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">
                    {groups[key].length} OS neste lote • {groups[key].reduce((sum, o) => sum + (o.estimated_minutes || 0), 0)} min total
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {groups[key].map(os => (
                <div key={os.id} className="text-[8px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-2 py-1 rounded text-slate-400">
                  #{os.number}
                </div>
              ))}
            </div>
          </div>
        ))}

        {groupKeys.length === 0 && (
          <div className="text-center py-8 opacity-20 italic">
            <p>Nenhuma ordem pendente para agrupamento.</p>
          </div>
        )}
      </div>

      <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-slate-500">
           <Truck size={14} /> Logística de Peças
        </div>
        <button className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:underline">
          Imprimir Etiquetas de Lote
        </button>
      </div>
    </div>
  );
}
