import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../core/auth';
import { CutTechnology } from '../../shared/types/industrial.types';
import { handleFirestoreError, OperationType } from '../../lib/firestore-utils';
import { Search, Plus, Save, Trash2, Zap, Settings, Thermometer } from 'lucide-react';
import { cn } from '../../lib/utils';

export function TechnologyLibraryPage() {
  const { profile } = useAuth();
  const [techs, setTechs] = useState<CutTechnology[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState<Partial<CutTechnology>>({
    material: '',
    thickness: 1,
    machine_type: 'laser_fiber',
    quality: 'producao',
    speed: 1000,
    power: 100,
    gas_pressure: 0,
    lead_in: 5,
    lead_out: 2,
    pierce_time: 1
  });

  useEffect(() => {
    if (!profile?.company_id) return;

    const q = query(
      collection(db, 'technologies'),
      where('company_id', '==', profile.company_id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTechs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CutTechnology)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'technologies');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.company_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.company_id) return;

    try {
      await addDoc(collection(db, 'technologies'), {
        ...formData,
        company_id: profile.company_id,
        created_at: Timestamp.now()
      });
      setIsAdding(false);
      setFormData({ material: '', thickness: 1, machine_type: 'laser_fiber', quality: 'producao', speed: 1000, power: 100 });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'technologies');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir esta configuração tecnológica?')) return;
    try {
      await deleteDoc(doc(db, 'technologies', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `technologies/${id}`);
    }
  };

  const filtered = techs.filter(t => 
    t.material.toLowerCase().includes(search.toLowerCase()) ||
    t.machine_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic underline decoration-blue-600 decoration-8 underline-offset-8">Technology Library</h1>
          <p className="text-slate-500 mt-4 font-medium uppercase text-[10px] tracking-widest bg-slate-100 w-fit px-2 py-1 rounded">
            Engine de Corte Industrial • Parâmetros de Alta Precisão
          </p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Pesquisar material..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center gap-2 transition-all"
          >
            <Plus size={18} /> {isAdding ? 'Fechar' : 'Nova Tech'}
          </button>
        </div>
      </div>

      {isAdding && (
         <div className="bg-white border-4 border-slate-900 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 mb-8">
               <Zap size={24} className="text-blue-600" />
               <h2 className="text-2xl font-black italic uppercase tracking-tight">Configuração de Processo</h2>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Material</label>
                  <input 
                    required
                    value={formData.material}
                    onChange={e => setFormData(p => ({ ...p, material: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Ex: Inox 304"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Espessura (mm)</label>
                  <input 
                    required
                    type="number"
                    step="0.1"
                    value={formData.thickness}
                    onChange={e => setFormData(p => ({ ...p, thickness: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Máquina</label>
                  <select 
                    value={formData.machine_type}
                    onChange={e => setFormData(p => ({ ...p, machine_type: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="laser_fiber">Laser Fibra</option>
                    <option value="laser_co2">Laser CO2</option>
                    <option value="cnc_router">CNC Router</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Qualidade</label>
                  <select 
                    value={formData.quality}
                    onChange={e => setFormData(p => ({ ...p, quality: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="economico">Econômico</option>
                    <option value="producao">Produção</option>
                    <option value="precisao">Precisão</option>
                  </select>
               </div>
               
               <div className="md:col-span-4 h-px bg-slate-100 my-2" />

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 text-blue-600">Velocidade (mm/min)</label>
                  <input 
                    required
                    type="number"
                    value={formData.speed}
                    onChange={e => setFormData(p => ({ ...p, speed: Number(e.target.value) }))}
                    className="w-full bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl font-bold text-blue-600 focus:bg-white transition-all underline decoration-blue-200"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 text-red-600">Potência (%)</label>
                  <input 
                    required
                    type="number"
                    value={formData.power}
                    onChange={e => setFormData(p => ({ ...p, power: Number(e.target.value) }))}
                    className="w-full bg-red-50 border border-red-100 px-4 py-3 rounded-xl font-bold text-red-600 focus:bg-white transition-all"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Furo Incial (Lead-in)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={formData.lead_in}
                    onChange={e => setFormData(p => ({ ...p, lead_in: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Tempo Pierce (s)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={formData.pierce_time}
                    onChange={e => setFormData(p => ({ ...p, pierce_time: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none"
                  />
               </div>

               <div className="md:col-span-4 flex justify-end gap-3 mt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)}
                    className="px-8 py-3 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 rounded-xl"
                  >
                    Descartar
                  </button>
                  <button 
                    type="submit"
                    className="px-10 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
                  >
                    <Save size={16} /> Salvar Engine
                  </button>
               </div>
            </form>
         </div>
      )}

      <div className="grid grid-cols-1 gap-12">
        {['laser_fiber', 'laser_co2', 'cnc_router'].map(machineType => {
           const machineTechs = filtered.filter(t => t.machine_type === machineType);
           if (machineTechs.length === 0 && !isAdding) return null;

           return (
             <div key={machineType} className="space-y-6">
                <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-2">
                   <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center rounded-xl">
                      <Settings size={24} />
                   </div>
                   <h2 className="text-2xl font-black uppercase italic tracking-tight underline decoration-blue-500 underline-offset-4">
                      {machineType.replace('_', ' ')}
                   </h2>
                   <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {machineTechs.length} Configurações
                   </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {machineTechs.map(tech => (
                    <div key={tech.id} className="group bg-white border border-slate-200 rounded-[28px] p-6 hover:border-slate-900 hover:shadow-2xl transition-all flex flex-col md:flex-row items-center justify-between gap-6 cursor-default">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-900 shadow-[4px_4px_0_rgba(0,0,0,0.1)]">
                          <span className="text-xl font-black">{tech.thickness}</span>
                          <span className="text-[8px] font-black uppercase tracking-tighter opacity-60">mm</span>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-slate-900 uppercase italic leading-none">{tech.material}</h3>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                              tech.quality === 'precisao' ? "bg-amber-100 text-amber-600" :
                              tech.quality === 'producao' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600"
                            )}>
                              {tech.quality}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-8 bg-slate-900 text-white px-8 py-4 rounded-[28px] shadow-xl">
                         <div className="text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Velocidade</p>
                            <p className="font-black text-blue-400 italic">{tech.speed} <span className="text-[10px] not-italic opacity-60">mm/min</span></p>
                         </div>
                         <div className="text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Potência</p>
                            <p className="font-black text-red-400 italic">{tech.power}%</p>
                         </div>
                         <div className="text-center hidden md:block">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pierce</p>
                            <p className="font-black text-white italic">{tech.pierce_time}s</p>
                         </div>
                         <div className="text-center hidden md:block">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gas</p>
                            <p className="font-black text-white italic">{tech.gas_pressure || '-'} <span className="text-[10px] not-italic opacity-60">bar</span></p>
                         </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleDelete(tech.id)}
                          className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
           );
        })}

        {filtered.length === 0 && !loading && (
           <div className="text-center py-20 border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/50">
              <Settings size={48} className="mx-auto text-slate-200 mb-4 animate-spin-slow" />
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Nenhuma biblioteca tecnológica configurada.</p>
           </div>
        )}
      </div>
    </div>
  );
}
