import React, { useState, useEffect } from 'react';
import { useDashboardData } from '../../shared/hooks/useDashboardData';
import { 
  SquarePen, 
  MonitorPlay, 
  Cpu, 
  Zap, 
  Clock, 
  Play, 
  Pause, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-utils';

const STAGES = [
  { id: 'cad', label: 'PROJETO CAD 3D', icon: SquarePen, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'cam', label: 'PROGRAMAÇÃO CAM', icon: MonitorPlay, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'setup', label: 'CONTROLADOR CNC', icon: Cpu, color: 'text-sky-600', bg: 'bg-sky-50' },
  { id: 'execution', label: 'EXECUÇÃO DO CORTE', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50' }
] as const;

export function ProcessTimelinePage() {
  const { orders, isLoading } = useDashboardData();
  const [activeOSId, setActiveOSId] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const activeOS = orders.find(o => o.id === activeOSId);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStartStage = async (osId: string, stage: string) => {
    setActiveOSId(osId);
    setIsRunning(true);
    setTimer(0);
    
    try {
      await updateDoc(doc(db, 'orders', osId), {
        current_stage: stage,
        status: 'em_producao'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'orders');
    }
  };

  const handleFinishStage = async () => {
    if (!activeOS) return;

    const currentStage = activeOS.current_stage || 'cad';
    const timeField = `time_${currentStage}`;
    
    try {
      const nextStageIndex = STAGES.findIndex(s => s.id === currentStage) + 1;
      const nextStage = nextStageIndex < STAGES.length ? STAGES[nextStageIndex].id : 'finished';

      await updateDoc(doc(db, 'orders', activeOS.id), {
        [timeField]: (activeOS[timeField as keyof typeof activeOS] as number || 0) + timer,
        current_stage: nextStage,
        status: nextStage === 'finished' ? 'concluido' : 'em_producao'
      });

      setIsRunning(false);
      setTimer(0);
      if (nextStage === 'finished') setActiveOSId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'orders');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Fluxo de Valor (VSM)</h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest">Controle de tempo real por etapa do processo industrial</p>
        </div>

        <div className="bg-white border-2 border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-6 shadow-sm">
           <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" />
              <span className="text-xs font-black uppercase text-slate-900">Eficiência: 94%</span>
           </div>
           <div className="w-px h-8 bg-slate-100" />
           <div className="flex items-center gap-2">
              <Clock size={18} className="text-blue-500" />
              <span className="text-xs font-black uppercase text-slate-900">Lead Time: 42m</span>
           </div>
        </div>
      </div>

      {/* Active Timer Bar */}
      {activeOS && (
        <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border-4 border-slate-800">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                 {(() => {
                   const StageIcon = STAGES.find(s => s.id === activeOS.current_stage)?.icon || SquarePen;
                   return <StageIcon size={32} />;
                 })()}
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] mb-1">Executando Agora:</p>
                 <h2 className="text-2xl font-black italic uppercase italic">OS #{activeOS.number} • {STAGES.find(s => s.id === activeOS.current_stage)?.label}</h2>
              </div>
           </div>

           <div className="flex items-center gap-8">
              <div className="text-center">
                 <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Tempo Gasto</p>
                 <p className="text-5xl font-mono font-black italic text-blue-400 tracking-tighter">
                    {formatTime(timer)}
                 </p>
              </div>
              <div className="flex gap-3">
                 <button 
                  onClick={() => setIsRunning(!isRunning)}
                  className="bg-white text-slate-900 p-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                 >
                   {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                 </button>
                 <button 
                  onClick={handleFinishStage}
                  className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                 >
                   Concluir Etapa <CheckCircle2 size={18} />
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Grid of OS by Stage */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {STAGES.map((stage, idx) => (
          <div key={stage.id} className="space-y-4">
            <div className={cn("px-4 py-3 rounded-2xl border-2 flex items-center gap-3", 
              activeOS?.current_stage === stage.id ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-100 text-slate-400")}>
               <stage.icon size={18} className={activeOS?.current_stage === stage.id ? "text-blue-400" : stage.color} />
               <span className="text-[10px] font-black uppercase tracking-widest">{stage.label}</span>
               <div className="ml-auto w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-900">
                  {orders.filter(o => o.current_stage === stage.id).length}
               </div>
            </div>

            <div className="space-y-3 min-h-[400px] bg-slate-50/50 rounded-[32px] p-3 border-2 border-dashed border-slate-200">
               {orders
                 .filter(o => (o.current_stage || 'cad') === stage.id && o.status !== 'concluido')
                 .map(os => (
                   <div 
                    key={os.id} 
                    className={cn(
                      "group bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer",
                      activeOSId === os.id && "ring-2 ring-blue-500 border-transparent shadow-blue-100"
                    )}
                    onClick={() => handleStartStage(os.id, stage.id)}
                   >
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] font-black uppercase text-slate-400">#{os.number}</span>
                        {os.priority === 'urgente' && <AlertCircle size={14} className="text-red-500" />}
                     </div>
                     <h4 className="text-xs font-black uppercase text-slate-900 leading-tight mb-3">
                        {os.client_name || os.title}
                     </h4>
                     
                     <div className="grid grid-cols-2 gap-2 mt-auto">
                        <div className="bg-slate-50 p-2 rounded-lg text-center">
                           <p className="text-[7px] font-black text-slate-400 uppercase">Perímetro</p>
                           <p className="text-[10px] font-bold">{(os.cutting_perimeter_mm || 0) / 1000}m</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg text-center">
                           <p className="text-[7px] font-black text-slate-400 uppercase">Meta</p>
                           <p className="text-[10px] font-bold">{os.estimated_minutes || 0}m</p>
                        </div>
                     </div>
                   </div>
                 ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Table */}
      <div className="bg-white border-2 border-slate-200 rounded-[40px] overflow-hidden shadow-xl">
         <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest italic">Análise de Gargalos por OS</h3>
            <span className="text-[8px] font-black uppercase text-blue-400">Tempo Total vs Estimado</span>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-slate-100">
                     <th className="p-6 text-[9px] font-black uppercase text-slate-400 tracking-widest">Ordem de Serviço</th>
                     <th className="p-6 text-[9px] font-black uppercase text-slate-400 tracking-widest">CAD</th>
                     <th className="p-6 text-[9px] font-black uppercase text-slate-400 tracking-widest">CAM</th>
                     <th className="p-6 text-[9px] font-black uppercase text-slate-400 tracking-widest">CNC Setup</th>
                     <th className="p-6 text-[9px] font-black uppercase text-slate-400 tracking-widest">Corte</th>
                     <th className="p-6 text-[9px] font-black uppercase text-slate-400 tracking-widest">Total</th>
                  </tr>
               </thead>
               <tbody>
                  {orders.slice(0, 10).map(os => {
                    const total = (os.time_cad || 0) + (os.time_cam || 0) + (os.time_setup || 0) + (os.time_execution || 0);
                    return (
                      <tr key={os.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                        <td className="p-6">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-black text-[10px]">
                                 {os.number?.toString().padStart(2, '0')}
                              </div>
                              <span className="text-xs font-bold text-slate-900">{os.client_name || os.title}</span>
                           </div>
                        </td>
                        <td className="p-6 text-xs font-mono font-bold text-slate-600">{os.time_cad ? formatTime(os.time_cad) : '--'}</td>
                        <td className="p-6 text-xs font-mono font-bold text-slate-600">{os.time_cam ? formatTime(os.time_cam) : '--'}</td>
                        <td className="p-6 text-xs font-mono font-bold text-slate-600">{os.time_setup ? formatTime(os.time_setup) : '--'}</td>
                        <td className="p-6 text-xs font-mono font-bold text-slate-600">{os.time_execution ? formatTime(os.time_execution) : '--'}</td>
                        <td className="p-6">
                           <span className={cn("inline-block px-3 py-1 rounded-full text-[10px] font-black italic", 
                             total > (os.estimated_minutes || 0) * 60 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600")}>
                              {formatTime(total)}
                           </span>
                        </td>
                      </tr>
                    );
                  })}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
