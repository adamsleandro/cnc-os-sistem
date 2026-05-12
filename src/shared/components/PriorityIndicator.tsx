import React from 'react';
import { cn } from '../../lib/utils';

interface PriorityIndicatorProps {
  priority: 'baixa' | 'normal' | 'alta' | 'urgente';
  label?: boolean;
}

export const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({ priority, label = false }) => {
  const getStyles = () => {
    switch (priority) {
      case 'urgente': return 'bg-red-600';
      case 'alta': return 'bg-amber-500';
      case 'normal': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full", getStyles())}></div>
      {label && (
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
          {priority}
        </span>
      )}
    </div>
  );
};
