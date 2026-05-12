import React, { useState } from 'react';
import { Download, AlertTriangle, ChevronRight, Settings } from 'lucide-react';
import { ProductionStats } from '../../shared/components/ProductionStats';
import { MachineStatusCard } from '../../shared/components/MachineStatusCard';
import { OSCard } from '../../shared/components/OSCard';
import { ProductionTimeline } from '../../shared/components/ProductionTimeline';
import { EfficiencyChart } from '../../shared/components/EfficiencyChart';
import { useDashboardData } from '../../shared/hooks/useDashboardData';
import { useAuth } from '../../core/auth';
import { seedInitialData } from '../../lib/seed';
import { MachineManagement } from './components/MachineManagement';
import { CuttingEngineService } from '../../services/cuttingEngine';

export function DashboardPage() {
  const { profile } = useAuth();
  const { machines, orders, isLoading } = useDashboardData();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    if (!profile?.company_id || !profile?.id) return;
    setIsSeeding(true);
    await seedInitialData(profile.company_id, profile.id);
    setIsSeeding(false);
  };

  const activeOrders = orders.filter(os => !['concluido', 'cancelado'].includes(os.status));
  const finishedOrders = orders.filter(os => os.status === 'concluido');
  const efficiency = machines.length > 0 ? Math.round((machines.filter(m => m.status === 'em_operacao').length / machines.length) * 100) : 0;
  
  const criticalOrders = activeOrders.filter(os => {
    const validation = CuttingEngineService.validateGeometry(os.machine_id || 'laser_fiber', os.thickness_mm || 1);
    return !validation.ok;
  });

  const isEmpty = !isLoading && machines.length === 0 && orders.length === 0;

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">Monitor Central</h1>
          <p className="text-slate-500 mt-2 font-medium">
            Bem-vindo, <span className="text-blue-600 font-bold">{profile?.full_name}</span>. Status em tempo real.
          </p>
        </div>
        <div className="flex gap-2">
          {criticalOrders.length > 0 && (
            <div className="flex items-center gap-3 bg-red-50 border-2 border-red-200 px-4 py-2 rounded-xl text-red-600 animate-pulse">
               <AlertTriangle size={18} />
               <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                  {criticalOrders.length} Geometrias Críticas Detetadas
               </span>
            </div>
          )}
          {profile?.role === 'admin' && isEmpty && (
            <button 
              onClick={handleSeed}
              disabled={isSeeding}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
            >
              <Settings size={16} /> {isSeeding ? 'Configurando...' : 'Configurar Demo'}
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Download size={16} /> Relatório OEE
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-20 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
             <Settings size={40} />
          </div>
          <div className="max-w-md space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sistema Pronto para Iniciar</h2>
            <p className="text-slate-500 font-medium italic">Seu ambiente de produção está vazio. Comece configurando suas máquinas ou use o botão 'Configurar Demo' acima para carregar exemplos.</p>
          </div>
        </div>
      ) : (
        <>
          <ProductionStats 
            activeMachines={machines.filter(m => m.status === 'em_operacao' || m.status === 'setup').length}
            pendingOS={activeOrders.length}
            efficiency={efficiency || 82} 
          />
          
          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest text-[10px]">Status das Máquinas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {machines.map(machine => (
                <MachineStatusCard 
                  key={machine.id}
                  name={machine.name}
                  type={machine.type}
                  status={machine.status}
                  currentJob={machine.status === 'em_operacao' ? 'OS Ativa' : undefined}
                  operator="Autenticado"
                />
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Linha do Tempo</h2>
                </div>
                <ProductionTimeline events={finishedOrders.slice(0, 5).map(os => ({
                   id: os.id,
                   title: `OS #${os.number} Concluída`,
                   time: 'Recentemente',
                   status: 'concluido'
                }))} />
              </section>
              
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Eficiência de Célula</h2>
                <EfficiencyChart />
              </section>
            </div>

            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Fila Prioritária</h2>
                  <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">Ver Todos</button>
                </div>
                <div className="flex flex-col gap-4">
                  {activeOrders.slice(0, 3).map(os => (
                    <OSCard key={os.id} order={os} compact />
                  ))}
                </div>
              </section>

              {profile?.role === 'admin' && <MachineManagement />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
