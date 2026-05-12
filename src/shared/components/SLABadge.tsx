import React from 'react';
import { cn } from '../../lib/utils';
import { differenceInDays, isToday, isPast, parseISO } from 'date-fns';

interface SLABadgeProps {
  deadline: string;
  className?: string;
}

export const SLABadge: React.FC<SLABadgeProps> = ({ deadline, className }) => {
  const date = parseISO(deadline);
  
  const getLabelAndStyles = () => {
    if (isToday(date)) {
      return { label: 'Hoje', styles: 'bg-red-50 text-red-600 border-red-200 animate-pulse' };
    }
    
    const days = differenceInDays(date, new Date());
    
    if (isPast(date)) {
      return { label: `${Math.abs(days)} dias atraso`, styles: 'bg-red-600 text-white border-red-700' };
    }
    
    if (days <= 2) {
      return { label: `${days} dias`, styles: 'bg-amber-100 text-amber-700 border-amber-200' };
    }
    
    return { label: `${days} dias`, styles: 'bg-slate-100 text-slate-600 border-slate-200' };
  };

  const { label, styles } = getLabelAndStyles();

  return (
    <span className={cn(
      "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border",
      styles,
      className
    )}>
      {label}
    </span>
  );
};
