import React, { useState } from 'react';
import { Search, Plus, Filter, LayoutGrid, List, X, Layers } from 'lucide-react';
import { OSCard } from '../../shared/components/OSCard';
import { SmartPlanner } from '../../components/SmartPlanner';
import { useDashboardData } from '../../shared/hooks/useDashboardData';
import { cn } from '../../lib/utils';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../core/auth';
import { handleFirestoreError, OperationType } from '../../lib/firestore-utils';
import { OrderPriority } from '../../shared/types/order.types';
import { CuttingEngineService } from '../../services/cuttingEngine';

export function ProductionQueuePage() {
  const { profile } = useAuth();
  const { orders, machines, isLoading } = useDashboardData();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOS, setNewOS] = useState({
    number: '',
    title: '',
    client_name: '',
    priority: 'normal' as OrderPriority,
    machine_id: '',
    material_type: 'Aço Carbono',
    thickness_mm: 1.5,
    cutting_perimeter_mm: 5000,
    total_pierces: 20,
    sheet_yield_percent: 85,
    quality: 'producao' as 'economico' | 'producao' | 'precisao',
    estimated_minutes: 30
  });

  const handleCreateOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const machine = machines.find(m => m.id === newOS.machine_id);
      const estimated_minutes = CuttingEngineService.estimateTime(
        newOS.cutting_perimeter_mm,
        newOS.total_pierces,
        1000, // Base speed placeholder
        newOS.quality
      );

      await addDoc(collection(db, 'orders'), {
        ...newOS,
        estimated_minutes,
        company_id: profile.company_id,
        status: 'aguardando',
        created_by: profile.id,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });
      setIsModalOpen(false);
      setNewOS({
        number: '',
        title: '',
        client_name: '',
        priority: 'normal',
        machine_id: '',
        material_type: 'Aço Carbono',
        thickness_mm: 1.5,
        cutting_perimeter_mm: 5000,
        total_pierces: 20,
        quality: 'producao',
        estimated_minutes: 30
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">PCP Industrial</h1>
              <p className="text-slate-500 mt-1">Planejamento e controle de produção inteligente.</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                <button 
                  onClick={() => setView('kanban')}
                  className={cn("p-2 rounded-lg transition-all", view === 'kanban' ? "bg-slate-900 text-white shadow-md" : "text-slate-400")}
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setView('list')}
                  className={cn("p-2 rounded-lg transition-all", view === 'list' ? "bg-slate-900 text-white shadow-md" : "text-slate-400")}
                >
                  <List size={18} />
                </button>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100 flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} /> Nova OS
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filtrar por OS, Cliente ou Material..." 
                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600">
              <Filter size={16} /> Filtros
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-3xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.length === 0 ? (
                <div className="col-span-full py-20 text-center space-y-4">
                  <p className="text-slate-400 font-bold italic">Nenhuma OS encontrada para os critérios selecionados.</p>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-blue-600 font-black uppercase text-[10px] tracking-widest border-b-2 border-blue-600 pb-1"
                  >
                    Criar minha primeira OS
                  </button>
                </div>
              ) : (
                orders.map(os => (
                  <OSCard key={os.id} order={os} />
                ))
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <SmartPlanner orders={orders} />
        </div>
      </div>

      {/* New OS Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white w-full max-w-xl rounded-[32px] overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">CRIAR NOVA OS</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateOS} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Número da OS</label>
                  <input 
                    required
                    value={newOS.number}
                    onChange={e => setNewOS({...newOS, number: e.target.value})}
                    placeholder="ex: 1045"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Prioridade</label>
                  <select 
                    value={newOS.priority}
                    onChange={e => setNewOS({...newOS, priority: e.target.value as OrderPriority})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Título do Projeto</label>
                <input 
                  required
                  value={newOS.title}
                  onChange={e => setNewOS({...newOS, title: e.target.value})}
                  placeholder="ex: Letreiro Fachada Loja X"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cliente</label>
                <input 
                  value={newOS.client_name}
                  onChange={e => setNewOS({...newOS, client_name: e.target.value})}
                  placeholder="Nome do Cliente"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Material</label>
                  <input 
                    required
                    value={newOS.material_type}
                    onChange={e => setNewOS({...newOS, material_type: e.target.value})}
                    placeholder="ex: Inox 304"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Espessura (mm)</label>
                  <input 
                    required
                    type="number"
                    step="0.1"
                    value={newOS.thickness_mm}
                    onChange={e => setNewOS({...newOS, thickness_mm: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Perímetro de Corte (mm)</label>
                  <input 
                    required
                    type="number"
                    value={newOS.cutting_perimeter_mm}
                    onChange={e => setNewOS({...newOS, cutting_perimeter_mm: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Total Furações (Pierces)</label>
                  <input 
                    required
                    type="number"
                    value={newOS.total_pierces}
                    onChange={e => setNewOS({...newOS, total_pierces: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                {newOS.machine_id && (
                  <div className="col-span-2">
                    <p className="text-[9px] font-bold text-slate-400 italic">
                      * Tempo estimado automático: {CuttingEngineService.estimateTime(newOS.cutting_perimeter_mm || 0, newOS.total_pierces || 0, 1000, newOS.quality as any)} min
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Estratégia / Qualidade</label>
                  <select 
                    value={newOS.quality}
                    onChange={e => setNewOS({...newOS, quality: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="economico">Econômico</option>
                    <option value="producao">Produção</option>
                    <option value="precisao">Precisão</option>
                  </select>
                </div>
                <div className="col-span-1 space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Aproveitamento Chapas (%)</label>
                   <input 
                    required
                    type="number"
                    max="100"
                    value={newOS.sheet_yield_percent}
                    onChange={e => setNewOS({...newOS, sheet_yield_percent: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Máquina Destino</label>
                <select 
                  value={newOS.machine_id}
                  onChange={e => setNewOS({...newOS, machine_id: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Selecione uma máquina...</option>
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-blue-100 mt-4 hover:bg-blue-700 transition-all active:scale-[0.98]"
              >
                Confirmar e Lançar OS
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
