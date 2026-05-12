import React from 'react';
import { cn } from '../../lib/utils';
import { OrderStatus } from '../types/order.types';
import { MachineStatus } from '../types/machine.types';

type StatusType = OrderStatus | MachineStatus;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, size = 'md' }) => {
  const getStatusStyles = (s: string) => {
    switch (s) {
      case 'em_producao':
      case 'production':
      case 'concluido':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'setup':
      case 'aguardando':
      case 'fila':
      case 'programacao':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'manutencao':
      case 'parada':
      case 'cancelado':
      case 'offline':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'acabamento':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'disponivel':
      case 'idle':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (s: string) => {
    return s.replace(/_/g, ' ').charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full font-black uppercase tracking-widest border",
      size === 'sm' ? "px-1.5 py-0.5 text-[8px]" : "px-2.5 py-1 text-[10px]",
      getStatusStyles(status),
      className
    )}>
      {getStatusLabel(status)}
    </span>
  );
};
