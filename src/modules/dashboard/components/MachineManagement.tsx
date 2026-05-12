import React, { useState } from 'react';
import { Settings, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../core/auth';
import { useDashboardData } from '../../../shared/hooks/useDashboardData';
import { handleFirestoreError, OperationType } from '../../../lib/firestore-utils';
import { Machine } from '../../../shared/types/machine.types';
import { cn } from '../../../lib/utils';

export function MachineManagement() {
  const { profile } = useAuth();
  const { machines } = useDashboardData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'cnc_router' as Machine['type'],
    status: 'disponivel' as Machine['status']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.company_id) return;

    try {
      if (editingId) {
        await updateDoc(doc(db, 'machines', editingId), {
           ...formData,
           updated_at: Timestamp.now()
        });
      } else {
        await addDoc(collection(db, 'machines'), {
          ...formData,
          company_id: profile.company_id,
          active: true,
          created_at: Timestamp.now()
        });
      }
      resetForm();
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'machines');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir esta máquina?')) return;
    try {
      await deleteDoc(doc(db, 'machines', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `machines/${id}`);
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', type: 'cnc_router', status: 'disponivel' });
  };

  const startEdit = (machine: Machine) => {
    setEditingId(machine.id);
    setFormData({
      name: machine.name,
      type: machine.type,
      status: machine.status
    });
    setIsAdding(true);
  };

  if (profile?.role !== 'admin') return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Settings size={20} className="text-slate-400" />
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Gestão de Ativos</h3>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="p-6">
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Máquina</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl font-bold outline-none focus:border-blue-500 transition-all"
                  placeholder="Ex: HMC-204"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData(p => ({ ...p, type: e.target.value as any }))}
                  className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl font-bold outline-none focus:border-blue-500 transition-all"
                >
                  <option value="cnc_router">Router CNC</option>
                  <option value="laser_co2">Laser CO2</option>
                  <option value="laser_fiber">Laser Fibra</option>
                  <option value="impressora_uv">Impressora UV</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button 
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <Check size={14} /> {editingId ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 gap-3">
          {machines.map(machine => (
            <div key={machine.id} className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center border-2",
                  machine.status === 'em_operacao' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                  machine.status === 'setup' ? "bg-blue-50 border-blue-100 text-blue-600" :
                  "bg-slate-50 border-slate-100 text-slate-400"
                )}>
                  <Settings size={20} className={cn(machine.status === 'em_operacao' && "animate-spin-slow")} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 tracking-tight">{machine.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{machine.type.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => startEdit(machine)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(machine.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {machines.length === 0 && (
             <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-slate-400 font-medium italic">Nenhuma máquina cadastrada.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
