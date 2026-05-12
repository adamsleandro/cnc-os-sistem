import React from 'react';
import { Layers, Maximize, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface InventoryCardProps {
  materialName: string;
  count: number;
  thickness: number;
  wastePercentage: number;
  lowStock?: boolean;
  onAction?: () => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ materialName, count, thickness, wastePercentage, lowStock, onAction }) => {
  return (
    <div className={cn(
      "bg-white border p-5 rounded-xl transition-all",
      lowStock ? "border-red-200 bg-red-50/30" : "border-slate-200"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
          <Layers size={20} />
        </div>
        {lowStock && (
          <span className="flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-full uppercase">
            <AlertCircle size={10} /> Estoque Baixo
          </span>
        )}
      </div>

      <h3 className="font-bold text-slate-900 mb-1">{materialName}</h3>
      <p className="text-xs text-slate-500 mb-4">{thickness}mm • Chapa Padrão</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Disponível</div>
          <div className="text-2xl font-black text-slate-900">{count} <span className="text-sm font-normal text-slate-400">un</span></div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Perda Média</div>
          <div className="text-2xl font-black text-slate-900">{wastePercentage}%</div>
        </div>
      </div>

      <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full", lowStock ? "bg-red-500" : "bg-blue-600")} 
          style={{ width: `${Math.min(100, (count / 20) * 100)}%` }}
        />
      </div>
      
      <button 
        onClick={onAction}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <Maximize size={14} /> Registrar Consumo/Sobras
      </button>
    </div>
  );
}
