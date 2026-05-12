import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ProductionTimerProps {
  orderId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  realtime?: boolean;
  seconds: number;
  isActive: boolean;
  isPaused: boolean;
  mode: 'setup' | 'producao';
  onStart: (type: 'setup' | 'producao') => void;
  onPause: (paused: boolean) => void;
  onStop: () => void;
  onModeChange: (mode: 'setup' | 'producao') => void;
  className?: string;
}

export const ProductionTimer: React.FC<ProductionTimerProps> = ({ 
  orderId,
  size = 'lg',
  realtime = false,
  seconds, 
  isActive, 
  isPaused, 
  mode, 
  onStart, 
  onPause, 
  onStop, 
  onModeChange,
  className 
}) => {
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isGiant = size === 'xl' || size === 'lg';

  return (
    <div className={cn(
      "bg-white rounded-2xl shadow-sm border border-slate-200", 
      isGiant ? "p-10" : "p-4",
      className
    )}>
      <div className="flex flex-col items-center gap-8">
        {isGiant && (
          <div className="flex items-center gap-4 w-full max-w-md">
            <button 
              onClick={() => onModeChange('setup')} 
              disabled={isActive}
              className={cn(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all",
                mode === 'setup' ? "bg-amber-50 border-amber-500 text-amber-700 shadow-md shadow-amber-100" : "bg-white border-slate-100 text-slate-400 hover:text-slate-600"
              )}
            >
              Setup / Ajuste
            </button>
            <button 
              onClick={() => onModeChange('producao')} 
              disabled={isActive}
              className={cn(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all",
                mode === 'producao' ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md shadow-emerald-100" : "bg-white border-slate-100 text-slate-400 hover:text-slate-600"
              )}
            >
              Produção / Corte
            </button>
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px]">
            <Clock size={14} className="text-blue-500" />
            {isPaused ? 'Pausado' : isActive ? `Em ${mode === 'setup' ? 'Setup' : 'Produção'}` : 'Aguardando Início'}
          </div>
          <div className={cn(
            "font-mono font-black tracking-tighter text-slate-900",
            size === 'xl' ? "text-9xl" : size === 'lg' ? "text-7xl" : "text-4xl"
          )}>
            {formatTime(seconds)}
          </div>
        </div>

        <div className="flex gap-4 w-full max-w-md">
          {!isActive ? (
            <button
              onClick={() => onStart(mode)}
              className={cn(
                "flex-1 flex items-center justify-center gap-3 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl disabled:opacity-50",
                mode === 'setup' ? "bg-amber-500 hover:bg-amber-600 shadow-amber-100" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
              )}
            >
              <Play size={24} fill="currentColor" />
              Iniciar {mode}
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={() => onPause(false)}
                  className="flex-1 flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-100"
                >
                  <Play size={24} fill="currentColor" />
                  Retomar
                </button>
              ) : (
                <button
                  onClick={() => onPause(true)}
                  className="flex-1 flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-600 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-slate-200"
                >
                  <Pause size={24} fill="currentColor" />
                  Pausar
                </button>
              )}
              <button
                onClick={onStop}
                className="flex-1 flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-slate-200"
              >
                <Square size={24} fill="currentColor" />
                Finalizar
              </button>
            </>
          )}
        </div>

        {isActive && isGiant && (
          <button className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600 font-black uppercase tracking-widest text-[10px] transition-colors">
            <AlertTriangle size={16} />
            Informar Problema / Parada Técnica
          </button>
        )}
      </div>
    </div>
  );
}
