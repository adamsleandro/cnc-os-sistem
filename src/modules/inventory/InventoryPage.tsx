import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Filter, ArrowDownRight, ArrowUpRight, X } from 'lucide-react';
import { useAuth } from '../../core/auth';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { cn } from '../../lib/utils';
import { handleFirestoreError, OperationType } from '../../lib/firestore-utils';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  company_id: string;
}

export function InventoryPage() {
  const { profile } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'ACM',
    quantity: 0,
    unit: 'un',
    min_quantity: 5
  });

  useEffect(() => {
    if (!profile?.company_id) return;

    const q = query(
      collection(db, 'inventory'),
      where('company_id', '==', profile.company_id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
      setItems(itemList);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'inventory');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.company_id]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await addDoc(collection(db, 'inventory'), {
        ...newItem,
        company_id: profile.company_id,
        created_at: Timestamp.now()
      });
      setIsModalOpen(false);
      setNewItem({ name: '', category: 'ACM', quantity: 0, unit: 'un', min_quantity: 5 });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'inventory');
    }
  };

  const filteredItems = items.filter(i => activeCategory === 'all' || i.category === activeCategory);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Estoque de Chapas</h1>
          <p className="text-slate-500 mt-1">Gestão de materiais, sobras e aproveitamento de retalhos.</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
            <ArrowUpRight size={16} className="text-red-500" /> Registrar Consumo
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-100 flex items-center gap-2"
          >
            <Plus size={18} /> Entrada de Lote
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InventoryStatCard label="Total em Estoque" value={items.reduce((acc, i) => acc + i.quantity, 0).toString()} subValue="Unidades" icon={Package} color="text-blue-600" />
          <InventoryStatCard label="Aproveitamento" value="84%" subValue="+2.1% este mês" icon={ArrowUpRight} color="text-emerald-600" />
          <InventoryStatCard label="Abaixo do Mínimo" value={items.filter(i => i.quantity < i.min_quantity).length.toString()} subValue="Materiais" icon={Filter} color="text-amber-600" />
          <InventoryStatCard label="Valor em Estoque" value="R$ 42k" subValue="Estimado" icon={Package} color="text-slate-600" />
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
             <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Buscar material..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
             </div>
             <div className="flex gap-2">
                {['all', 'ACM', 'Acrílico', 'PVC'].map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      activeCategory === cat ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="px-8 py-4">Nome do Material</th>
                <th className="px-8 py-4">Categoria</th>
                <th className="px-8 py-4">Estoque</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center animate-pulse text-slate-400 font-bold">Carregando estoque...</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-slate-400 font-bold italic">Nenhum material no estoque.</td>
                </tr>
              ) : filteredItems.map((mat) => (
                <tr key={mat.id} className="hover:bg-slate-50/50 group transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">{mat.name}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">ID: #{mat.id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 capitalize text-xs font-bold text-slate-600">{mat.category}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-black text-lg", mat.quantity < mat.min_quantity ? "text-amber-600" : "text-slate-900")}>
                        {mat.quantity}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase">{mat.unit}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {mat.quantity < mat.min_quantity ? (
                       <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase px-2 py-1 rounded">Critico</span>
                    ) : (
                       <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-2 py-1 rounded">Ok</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-all">
                      <ArrowDownRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white w-full max-w-xl rounded-[32px] overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">ENTRADA DE MATERIAL</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateItem} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome do Material</label>
                <input 
                  required
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  placeholder="ex: ACM Branco 3mm"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Categoria</label>
                  <select 
                    value={newItem.category}
                    onChange={e => setNewItem({...newItem, category: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none"
                  >
                    <option value="ACM">ACM</option>
                    <option value="Acrílico">Acrílico</option>
                    <option value="PVC">PVC</option>
                    <option value="Madeira">Madeira</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Unidade</label>
                  <select 
                    value={newItem.unit}
                    onChange={e => setNewItem({...newItem, unit: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none"
                  >
                    <option value="un">Unidade (Chapa)</option>
                    <option value="m2">m²</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Quantidade</label>
                   <input type="number" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mínimo (Alerta)</label>
                   <input type="number" value={newItem.min_quantity} onChange={e => setNewItem({...newItem, min_quantity: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold" />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-emerald-100 mt-4 hover:bg-emerald-700 transition-all"
              >
                Registrar Entrada
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InventoryStatCard({ label, value, subValue, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className={cn("p-3 rounded-2xl bg-slate-50 w-fit", color)}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h4>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{subValue}</span>
        </div>
      </div>
    </div>
  );
}
