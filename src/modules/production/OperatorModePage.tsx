import React, { useState, useEffect } from 'react';
import { IndustrialCuttingCanvas } from '../../components/IndustrialCuttingCanvas';
import { useDashboardData } from '../../shared/hooks/useDashboardData';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { PriorityIndicator } from '../../shared/components/PriorityIndicator';
import { ClipboardList, AlertCircle, CheckCircle2, Zap, Settings, ShieldAlert, Cpu } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, Timestamp, query, where, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../core/auth';
import { handleFirestoreError, OperationType } from '../../lib/firestore-utils';
import { cn } from '../../lib/utils';
import { CuttingEngineService } from '../../services/cuttingEngine';
import { motion, AnimatePresence } from 'motion/react';

export function OperatorModePage() {
  const { profile } = useAuth();
  const { orders, machines, technologies } = useDashboardData();
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  
  const currentMachine = machines.find(m => m.id === selectedMachineId) || machines[0];
  const activeOS = orders.find(os => (os.status === 'em_producao' || os.status === 'setup') && os.machine_id === currentMachine?.id) || orders.find(os => os.machine_id === currentMachine?.id) || orders[0];
  
  // Find applicable technology automatically
  const activeTech = technologies.find(t => 
    t.material === activeOS?.material_type && 
    t.thickness === activeOS?.thickness_mm && 
    t.machine_type === currentMachine?.type
  );

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [status, setStatus] = useState<'Running' | 'Setting' | 'Inspection' | 'Maintenance' | 'Breakdown' | 'Offline' | 'Tooling' | 'Material'>('Offline');
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [showOccurrenceModal, setShowOccurrenceModal] = useState(false);
  const [occurrenceType, setOccurrenceType] = useState<'breakdown' | 'material_fail' | 'file_error' | 'tool_break' | 'other'>('other');
  const [occurrenceDesc, setOccurrenceDesc] = useState('');

  useEffect(() => {
    if (machines.length > 0 && !selectedMachineId) {
      setSelectedMachineId(machines[0].id);
    }
  }, [machines, selectedMachineId]);

  // Sync state based on machine status
  useEffect(() => {
    if (currentMachine) {
      if (currentMachine.status === 'em_operacao') setStatus('Running');
      else if (currentMachine.status === 'setup') setStatus('Setting');
      else if (currentMachine.status === 'manutencao') setStatus('Maintenance');
      else if (currentMachine.status === 'parada') setStatus('Breakdown');
      else setStatus('Offline');
    }
  }, [currentMachine]);

  // Sync active timer from Firestore
  useEffect(() => {
    if (!profile?.id || !currentMachine?.id) return;

    const q = query(
      collection(db, 'time_records'),
      where('machine_id', '==', currentMachine.id),
      where('ended_at', '==', null),
      orderBy('started_at', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const record = snapshot.docs[0].data();
        setCurrentRecordId(snapshot.docs[0].id);
        setIsTimerActive(true);
        
        const startTime = record.started_at.toDate().getTime();
        const now = new Date().getTime();
        setTimerSeconds(Math.floor((now - startTime) / 1000));
      } else {
        setIsTimerActive(false);
        setTimerSeconds(0);
        setCurrentRecordId(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'time_records');
    });

    return () => unsubscribe();
  }, [currentMachine?.id, profile?.id]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerActive && !isTimerPaused) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTimerActive, isTimerPaused]);

  const handleAction = async (newStatus: typeof status, mode?: 'setup' | 'producao') => {
    if (!profile || !currentMachine) return;
    
    try {
      // 1. Stop current timer if exists
      if (currentRecordId) {
        await updateDoc(doc(db, 'time_records', currentRecordId), {
          ended_at: Timestamp.now(),
          duration_seconds: timerSeconds
        });
      }

      // 2. Update Machine status
      const firestoreStatus = 
        newStatus === 'Running' ? 'em_operacao' :
        (newStatus === 'Setting' || newStatus === 'Inspection' || newStatus === 'Tooling') ? 'setup' :
        (newStatus === 'Maintenance' || newStatus === 'Breakdown' || newStatus === 'Material') ? 'parada' : 
        'disponivel';

      await updateDoc(doc(db, 'machines', currentMachine.id), { 
        status: firestoreStatus,
        operator_id: profile.id
      });

      // 3. Start new timer if needed
      if (mode || newStatus !== 'Offline') {
        const startMode = mode || (
          newStatus === 'Running' ? 'producao' : 
          (newStatus === 'Setting' || newStatus === 'Inspection' || newStatus === 'Tooling') ? 'setup' : 
          'parada'
        );
        const recordRef = await addDoc(collection(db, 'time_records'), {
          company_id: profile.company_id,
          order_id: activeOS?.id || 'none',
          operator_id: profile.id,
          machine_id: currentMachine.id,
          type: startMode,
          started_at: Timestamp.now(),
          ended_at: null,
          created_at: Timestamp.now()
        });
        setCurrentRecordId(recordRef.id);
      } else {
        setCurrentRecordId(null);
      }

      setStatus(newStatus);

    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `machines/${currentMachine.id}`);
    }
  };

  const handleFinishOS = async () => {
    if (!profile || !currentMachine || !activeOS) return;
    if (!window.confirm(`Finalizar OS #${activeOS.number}?`)) return;

    try {
      // 1. Stop current timer
      if (currentRecordId) {
        await updateDoc(doc(db, 'time_records', currentRecordId), {
          ended_at: Timestamp.now(),
          duration_seconds: timerSeconds
        });
      }

      // 2. Update Machine to available
      await updateDoc(doc(db, 'machines', currentMachine.id), { 
        status: 'disponivel',
        operator_id: null
      });

      // 3. Update OS to finished
      await updateDoc(doc(db, 'orders', activeOS.id), { 
        status: 'concluido'
      });

      // Reset local state
      setStatus('Offline');
      setCurrentRecordId(null);
      setTimerSeconds(0);
      setIsTimerActive(false);

    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${activeOS.id}`);
    }
  };

  const handleReportOccurrence = async () => {
    if (!activeOS || !profile || !currentMachine) return;
    
    try {
      const occurrence = {
        type: occurrenceType,
        description: occurrenceDesc,
        timestamp: new Date().toISOString(),
        operator_id: profile.id
      };

      // Add to OS
      const orderRef = doc(db, 'orders', activeOS.id);
      await updateDoc(orderRef, {
        occurrences: [
          ...(activeOS.occurrences || []),
          occurrence
        ]
      });

      // Also create a standalone machine event if it's a breakdown
      if (occurrenceType === 'breakdown') {
        await addDoc(collection(db, 'machine_events'), {
          machine_id: currentMachine.id,
          status: 'parada',
          reason: occurrenceDesc,
          started_at: Timestamp.now(),
          company_id: profile.company_id
        });
        
        // Update machine status
        await updateDoc(doc(db, 'machines', currentMachine.id), {
          status: 'parada'
        });
        setStatus('Breakdown');
      }

      setShowOccurrenceModal(false);
      setOccurrenceDesc('');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'orders');
    }
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#D0D0D0] flex flex-col font-sans">
      {/* Top Header Mockup Style */}
      <div className="bg-[#808080] border-b border-white p-1 flex gap-2 overflow-x-auto shadow-[inset_0_-1px_0_rgba(0,0,0,0.2)]">
        {['Screens', 'Real Time', 'Operator Screen'].map((btn, i) => (
          <button key={i} className="bg-[#C0C0C0] px-4 py-1 text-[12px] font-bold border-2 border-slate-400 flex items-center gap-2 shadow-[2px_2px_0_white,-2px_-2px_0_#4a4a4a]">
            {btn} {i > 0 && <span className="opacity-50">X</span>}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Machine List */}
        <div className="w-48 bg-[#C0C0C0] border-r-4 border-slate-400 p-2 space-y-1">
           {machines.map(m => (
             <button 
              key={m.id}
              onClick={() => setSelectedMachineId(m.id)}
              className={cn(
                "w-full text-left p-3 text-sm font-bold border-2 transition-all",
                selectedMachineId === m.id 
                  ? "bg-blue-600/20 border-blue-600 text-blue-900" 
                  : "bg-transparent border-transparent hover:bg-white/20"
              )}
             >
               {m.name}
             </button>
           ))}
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
          {/* Status Banner */}
          <div className={cn(
            "w-full py-8 flex items-center justify-center rounded-sm border-4 border-slate-800 shadow-[4px_4px_0_rgba(0,0,0,0.2)]",
            status === 'Running' ? "bg-[#008000]" : 
            status === 'Setting' ? "bg-blue-600" :
            status === 'Breakdown' ? "bg-red-600" :
            status === 'Inspection' ? "bg-orange-500" : 
            status === 'Tooling' ? "bg-cyan-600" :
            status === 'Maintenance' ? "bg-fuchsia-600" :
            status === 'Material' ? "bg-yellow-500" : "bg-slate-600"
          )}>
             <h2 className="text-5xl font-black text-white italic tracking-widest drop-shadow-lg">{status}</h2>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-12 gap-8 flex-1">
             {/* Action Buttons */}
             <div className="col-span-5 space-y-4">
                {[
                  { id: 'Setting', color: 'bg-blue-500' },
                  { id: 'Inspection', color: 'bg-orange-500' },
                  { id: 'Tooling', color: 'bg-cyan-500' },
                  { id: 'Maintenance', color: 'bg-fuchsia-500' },
                  { id: 'Breakdown', color: 'bg-red-600' },
                  { id: 'Material', color: 'bg-yellow-500' },
                  { id: 'OK to Run', color: 'bg-green-500', status: 'Running' },
                  { id: 'Finish Job', color: 'bg-emerald-500', status: 'Finish' }
                ].map((btn) => (
                  <div key={btn.id} className="flex gap-4 items-center">
                    <div className={cn("w-10 h-10 border-4 border-slate-700 rounded-lg shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5)]", 
                      btn.id === 'Finish Job' ? 'bg-[#00A36C]' : btn.color
                    )} />
                    <button 
                      onClick={() => btn.status === 'Finish' ? handleFinishOS() : handleAction((btn.status || btn.id) as any)}
                      className="flex-1 bg-[#E0E0E0] border-4 border-slate-400 py-3 font-bold text-slate-700 active:translate-y-0.5 active:shadow-none shadow-[4px_4px_0_rgba(0,0,0,0.3)] hover:bg-white transition-all uppercase tracking-widest text-sm"
                    >
                      {btn.id}
                    </button>
                  </div>
                ))}
             </div>

             {/* Details Panel */}
             <div className="col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2">
                      <IndustrialCuttingCanvas 
                        machineType={currentMachine?.type || 'laser_fiber'} 
                        svgDataUrl={(activeOS as any)?.svgDataUrl || (activeOS as any)?.thumbnail_url || undefined}
                      />
                   </div>
                   
                   <div className="bg-white border-2 border-slate-400 p-4 rounded-sm shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                      <div className="flex items-center gap-2 mb-2">
                         <Zap size={14} className="text-blue-600" />
                         <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Engine Technology</span>
                      </div>
                      <p className="text-xl font-black italic uppercase text-slate-900 leading-none">
                         {activeTech ? `${activeTech.material} ${activeTech.thickness}mm` : 'Manual / S/ Tech'}
                      </p>
                      <div className="flex gap-4 mt-4">
                         <TechBit label="Veloc." value={activeTech?.speed || '-'} unit="mm/m" />
                         <TechBit label="Power" value={activeTech?.power || '-'} unit="%" />
                         <TechBit label="Gas" value={activeTech?.gas_pressure || '-'} unit="bar" />
                      </div>
                   </div>

                   <div className="bg-white border-2 border-slate-400 p-4 rounded-sm shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                      <div className="flex items-center gap-2 mb-2">
                         <Cpu size={14} className="text-blue-600" />
                         <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Cálculos Industriais</span>
                      </div>
                      <div className="space-y-3">
                         <CalcBit label="Perímetro" value={(activeOS?.cutting_perimeter_mm || 0) / 1000} unit="m" />
                         <CalcBit label="Furações" value={activeOS?.total_pierces || 0} unit="pts" />
                         <CalcBit label="Previsto" value={CuttingEngineService.estimateTime(activeOS?.cutting_perimeter_mm || 0, activeOS?.total_pierces || 0, activeTech?.speed || 1000)} unit="min" />
                      </div>
                   </div>

                   <div className="col-span-2">
                      <PerformanceMonitor 
                        plannedMinutes={CuttingEngineService.estimateTime(activeOS?.cutting_perimeter_mm || 0, activeOS?.total_pierces || 0, activeTech?.speed || 1000)}
                        currentSeconds={timerSeconds}
                        isActive={status === 'Running'}
                      />
                   </div>

                   <div className="col-span-2">
                      <QualityControlMonitor 
                        orderId={activeOS?.id || ''} 
                        machineId={currentMachine?.id || ''} 
                      />
                   </div>

                   <div className="col-span-2">
                      <DetailRow label="Machine" value={currentMachine?.name || '-'} />
                   </div>
                   <div className="col-span-2">
                      <DetailRow label="Job" value={activeOS?.number || activeOS?.title || '-'} />
                   </div>
                   <div className="col-span-1">
                      <DetailRow label="Operator" value={profile?.full_name || '-'} />
                   </div>
                   <div className="col-span-1">
                      <DetailRow label="Running Time" value={formatTime(timerSeconds)} highlight />
                   </div>
                </div>

                <div className="mt-4 flex gap-4">
                   <button 
                    onClick={() => handleAction('Running')}
                    className="flex-1 bg-emerald-600 border-4 border-emerald-800 py-4 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[4px_4px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
                   >
                     <Zap size={20} /> START PRODUCTION ENGINE
                   </button>
                   <button 
                    className="bg-red-600 border-4 border-red-800 p-4 text-white shadow-[4px_4px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none"
                    onClick={() => setShowOccurrenceModal(true)}
                   >
                      <ShieldAlert size={24} />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>

       {/* Occurrence Modal */}
      <AnimatePresence>
        {showOccurrenceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowOccurrenceModal(false)}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-[#C0C0C0] border-4 border-slate-400 p-8 w-full max-w-md shadow-[8px_8px_0_rgba(0,0,0,0.5)]"
              >
                 <h2 className="text-2xl font-black italic uppercase text-slate-900 mb-6 flex items-center gap-3">
                    <AlertCircle className="text-red-600" /> Reportar Ocorrência
                 </h2>

                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Tipo de Falha</label>
                       <select 
                         value={occurrenceType}
                         onChange={(e) => setOccurrenceType(e.target.value as any)}
                         className="w-full bg-white border-4 border-slate-400 p-3 font-bold text-slate-700 outline-none focus:border-blue-600"
                       >
                          <option value="breakdown">Quebra / Falha Mecânica</option>
                          <option value="material_fail">Problema com Material</option>
                          <option value="file_error">Erro no Arquivo (CAM)</option>
                          <option value="tool_break">Quebra de Ferramenta</option>
                          <option value="other">Outro / Parada Operacional</option>
                       </select>
                    </div>

                    <div>
                       <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Descrição Detalhada</label>
                       <textarea 
                         value={occurrenceDesc}
                         onChange={(e) => setOccurrenceDesc(e.target.value)}
                         className="w-full bg-white border-4 border-slate-400 p-3 font-bold text-slate-700 outline-none focus:border-blue-600 h-32"
                         placeholder="Descreva o que aconteceu..."
                       />
                    </div>

                    <div className="flex gap-4">
                       <button 
                         onClick={() => setShowOccurrenceModal(false)}
                         className="flex-1 bg-slate-400 border-4 border-slate-600 py-4 font-black uppercase text-sm text-white shadow-[4px_4px_0_rgba(0,0,0,0.2)]"
                       >
                          Cancelar
                       </button>
                       <button 
                         onClick={handleReportOccurrence}
                         className="flex-2 bg-red-600 border-4 border-red-800 py-4 font-black uppercase text-sm text-white shadow-[4px_4px_0_rgba(0,0,0,0.2)]"
                       >
                          Confirmar Parada
                       </button>
                    </div>
                 </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PerformanceMonitor({ plannedMinutes, currentSeconds, isActive }: { plannedMinutes: number, currentSeconds: number, isActive: boolean }) {
  const currentMinutes = currentSeconds / 60;
  const progress = plannedMinutes > 0 ? (currentMinutes / plannedMinutes) * 100 : 0;
  const isDelayed = currentMinutes > plannedMinutes;

  return (
    <div className="bg-slate-900 border-4 border-slate-700 p-4 rounded shadow-xl">
      <div className="flex justify-between items-end mb-2">
         <div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Aderência ao Tempo (Real vs Previsto)</p>
            <p className={cn("text-2xl font-black italic uppercase", isDelayed ? "text-red-500" : "text-emerald-500")}>
               {isActive ? (isDelayed ? 'Produção Atrasada' : 'Em Ritmo') : 'Aguardando Início'}
            </p>
         </div>
         <div className="text-right">
            <p className="text-[8px] font-black text-slate-500 uppercase">Eficiência Atual</p>
            <p className={cn("text-xl font-mono font-black", isDelayed ? "text-red-500" : "text-emerald-500")}>
               {plannedMinutes > 0 ? Math.max(0, Math.round(100 - (progress - (isDelayed ? 0 : 0)))) : 0}%
            </p>
         </div>
      </div>

      <div className="h-4 bg-slate-800 rounded-full overflow-hidden border-2 border-slate-700 relative">
         <div 
           className={cn("h-full transition-all duration-1000", isDelayed ? "bg-red-600" : "bg-emerald-600")}
           style={{ width: `${Math.min(100, progress)}%` }}
         />
         {isDelayed && (
            <div className="absolute top-0 right-0 h-full bg-red-400 opacity-30 animate-pulse" style={{ width: `${progress - 100}%` }} />
         )}
      </div>
      
      <div className="flex justify-between mt-1">
         <span className="text-[8px] font-black text-slate-500 uppercase">0 min</span>
         <span className="text-[8px] font-black text-slate-500 uppercase">{plannedMinutes} min (Meta)</span>
      </div>
    </div>
  );
}

function QualityControlMonitor({ orderId, machineId }: { orderId: string, machineId: string }) {
  const { profile } = useAuth();
  const [good, setGood] = useState(0);
  const [rejects, setRejects] = useState(0);

  const handleLog = async (type: 'aprovado' | 'rejeito') => {
    if (!profile || !orderId) return;
    try {
      await addDoc(collection(db, 'quality_records'), {
        order_id: orderId,
        machine_id: machineId,
        operator_id: profile.id,
        type,
        quantity: 1,
        company_id: profile.company_id,
        created_at: Timestamp.now()
      });
      
      if (type === 'aprovado') setGood(g => g + 1);
      else setRejects(r => r + 1);

      // Increment counters in the order too
      const orderRef = doc(db, 'orders', orderId);
      const field = type === 'aprovado' ? 'good_count' : 'reject_count';
      await updateDoc(orderRef, {
        [field]: (type === 'aprovado' ? good : rejects) + 1
      });

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'quality_records');
    }
  };

  return (
    <div className="bg-[#1e293b] border-4 border-slate-700 p-4 rounded shadow-xl flex items-center justify-between text-white">
      <div>
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">Controle de Qualidade</p>
        <p className="text-[8px] font-bold text-slate-400 uppercase italic">Registro de Peças Boas vs Rejeitadas</p>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col items-center">
            <button 
              onClick={() => handleLog('aprovado')}
              className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-500 transition-all shadow-[0_4px_0_#065f46] active:translate-y-1 active:shadow-none"
            >
               <CheckCircle2 size={18} />
            </button>
            <span className="text-[10px] font-black mt-2 text-emerald-400">{good} OK</span>
        </div>
        <div className="flex flex-col items-center">
            <button 
              onClick={() => handleLog('rejeito')}
              className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-500 transition-all shadow-[0_4px_0_#991b1b] active:translate-y-1 active:shadow-none"
            >
               <AlertCircle size={18} />
            </button>
            <span className="text-[10px] font-black mt-2 text-red-400">{rejects} REJ</span>
        </div>
      </div>
    </div>
  );
}

function TechBit({ label, value, unit }: { label: string, value: any, unit: string }) {
   return (
      <div className="flex-1">
         <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
         <p className="text-xs font-black italic">{value}<span className="text-[9px] not-italic opacity-50 ml-0.5">{unit}</span></p>
      </div>
   );
}

function CalcBit({ label, value, unit }: { label: string, value: any, unit: string }) {
   return (
      <div className="flex justify-between items-center bg-slate-50 px-2 py-1 border border-slate-100 italic">
         <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest leading-none mt-0.5">{label}</span>
         <span className="text-xs font-black text-slate-900">{value} {unit}</span>
      </div>
   );
}

function DetailRow({ label, value, highlight, input }: { label: string, value: string, highlight?: boolean, input?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">{label}</label>
      <div className={cn(
        "flex gap-2 items-center",
        input ? "" : "bg-[#F5F5F5] border-2 border-slate-400 p-3 italic font-bold min-h-[48px]",
        highlight && "text-blue-600 font-mono text-2xl not-italic"
      )}>
        {input ? (
          <>
            <input className="flex-1 bg-white border-2 border-slate-400 p-2 font-bold outline-none" />
            <button className="bg-[#C0C0C0] px-4 h-full min-h-[44px] border-2 border-slate-400 font-bold">{'>'}</button>
          </>
        ) : (
          value
        )}
      </div>
    </div>
  );
}
