import React, { useState } from 'react';
import { Search, Book, FileText, Download, Eye, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Document {
  id: string;
  title: string;
  category: 'manual' | 'guia' | 'checklist' | 'software';
  machine?: string;
  format: 'PDF' | 'DOC' | 'LINK';
  date: string;
}

export function TechLibraryPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'manual' | 'guia' | 'checklist'>('all');
  
  const documents: Document[] = [
    { id: '1', title: 'Manual de Operação Router 2030', category: 'manual', machine: 'Router CNC', format: 'PDF', date: '2023-10-12' },
    { id: '2', title: 'Configuração de Vácuo e Sucção', category: 'guia', machine: 'Router CNC', format: 'PDF', date: '2024-01-05' },
    { id: '3', title: 'Tabela de Velocidades Acrílico', category: 'guia', machine: 'Laser CO2', format: 'PDF', date: '2024-02-15' },
    { id: '4', title: 'Checklist de Manutenção Diária', category: 'checklist', format: 'DOC', date: '2024-03-01' },
    { id: '5', title: 'Tutorial Artcam - Ninho de Peças', category: 'software', format: 'LINK', date: '2024-01-20' },
  ];

  const filtered = documents.filter(doc => activeCategory === 'all' || doc.category === activeCategory);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Biblioteca Técnica</h1>
          <p className="text-slate-500 mt-1">Manuais, guias de parâmetros e checklists de operação.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por manual ou máquina..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 w-fit rounded-2xl">
        {['all', 'manual', 'guia', 'checklist'].map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat as any)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeCategory === cat ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
          >
            {cat === 'all' ? 'Ver Todos' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((doc) => (
          <div key={doc.id} className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-6">
              <div className={cn(
                "p-4 rounded-2xl",
                doc.category === 'manual' ? "bg-blue-50 text-blue-600" :
                doc.category === 'guia' ? "bg-emerald-50 text-emerald-600" :
                "bg-amber-50 text-amber-600"
              )}>
                {doc.category === 'manual' ? <Book size={24} /> : <FileText size={24} />}
              </div>
              <span className="bg-slate-100 text-[9px] font-black uppercase px-2 py-1 rounded text-slate-500 tracking-tighter">
                {doc.format}
              </span>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                {doc.title}
              </h3>
              {doc.machine && (
                <div className="inline-block bg-slate-50 border border-slate-100 text-slate-500 text-[9px] font-black uppercase px-2 py-1 rounded">
                   Máquina: {doc.machine}
                </div>
              )}
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
                Atualizado em: {doc.date}
              </p>
            </div>

            <div className="flex gap-2 mt-8 opacity-0 group-hover:opacity-100 transition-all">
              <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800">
                <Download size={14} /> Baixar
              </button>
              <button className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200">
                {doc.format === 'LINK' ? <ExternalLink size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
