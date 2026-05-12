import React from 'react';
import { ClipboardList, Calendar, User, ArrowRight, Clock, ShieldAlert } from 'lucide-react';
import { WorkOrder } from '../types/order.types';
import { StatusBadge } from './StatusBadge';
import { cn } from '../../lib/utils';
import { CuttingEngineService } from '../../services/cuttingEngine';

interface OSCardProps {
  order: WorkOrder;
  compact?: boolean;
  showTimer?: boolean;
  onClick?: (order: WorkOrder) => void;
  className?: string;
}

export const OSCard: React.FC<OSCardProps> = ({ 
  order, 
  compact = false, 
  showTimer = false, 
  onClick, 
  className 
}) => {
  const validation = CuttingEngineService.validateGeometry(order.machine_id || 'laser_fiber', order.thickness_mm || 1);
  const microjoints = CuttingEngineService.suggestMicrojoints(100, 100); // Placeholder
  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgente': return 'border-l-red-600 shadow-red-50';
      case 'alta': return 'border-l-amber-500 shadow-amber-50';
      case 'normal': return 'border-l-blue-500 shadow-blue-50';
      default: return 'border-l-slate-400 shadow-slate-50';
    }
  };

  if (compact) {
    return (
      <div 
        onClick={() => onClick?.(order)}
        className={cn(
          "bg-white border border-slate-200 rounded-xl p-3 cursor-pointer hover:shadow-md transition-all border-l-4",
          getPriorityColor(order.priority),
          className
        )}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 text-xs">#{order.number}</span>
            <h4 className="font-bold text-slate-700 text-xs truncate max-w-[120px]">{order.title}</h4>
          </div>
          <StatusBadge status={order.status} size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick?.(order)}
      className={cn(
        "bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all border-l-8",
        getPriorityColor(order.priority),
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
              OS #{order.number}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <h4 className="font-black text-slate-900 text-lg leading-tight mt-1">{order.client_name || order.title}</h4>
        </div>
        <div className="flex flex-col items-end gap-1">
          {order.material_type && (
            <span className="bg-blue-50 text-blue-700 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-blue-100">
              {order.material_type} {order.thickness_mm}mm
            </span>
          )}
          {order.deadline && (
            <div className="flex flex-col items-end">
            <span className="text-[8px] font-black uppercase text-slate-400">Prazo</span>
            <div className="flex items-center gap-1 text-slate-900 font-bold text-xs">
              <Calendar size={12} className="text-blue-600" />
              {new Date(order.deadline).toLocaleDateString('pt-BR')}
            </div>
          </div>
        )}
      </div>
    </div>

    <p className="text-xs text-slate-500 line-clamp-2 mb-6 leading-relaxed font-medium">
        {order.notes || order.title}
      </p>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex flex-col">
           <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Perímetro</span>
           <span className="text-[10px] font-bold text-slate-700">{(order.cutting_perimeter_mm || 0) / 1000}m</span>
        </div>
        <div className="flex flex-col">
           <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Pierces</span>
           <span className="text-[10px] font-bold text-slate-700">{order.total_pierces || 0} pts</span>
        </div>

        {!validation.ok && (
          <div className="ml-auto flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-lg border border-red-100">
             <ShieldAlert size={10} />
             <span className="text-[8px] font-black uppercase">Crítico</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
        <div className="flex items-center gap-2">
          {showTimer && order.status === 'em_producao' ? (
            <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase animate-pulse">
               <Clock size={12} />
               Produzindo...
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase">
              <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                <User size={12} />
              </div>
              {order.operator_id ? 'Vinculado' : 'Aguardando'}
            </div>
          )}
        </div>
        <div className="bg-slate-900 text-white p-1.5 rounded-lg">
          <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );
}
