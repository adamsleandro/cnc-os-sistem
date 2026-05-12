import React, { useState, useEffect } from 'react';
import { cn } from '@/src/lib/utils';
import { Material } from '@/src/types';
import { Wrench, ShieldCheck, RefreshCw, Save, RotateCcw } from 'lucide-react';

interface EngineTechnicalProps {
  material: Material;
  machineType: string;
}

export function TechEngine({ material, machineType }: EngineTechnicalProps) {
  const [params, setParams] = useState(material.tech_params);
  const [originalParams] = useState(JSON.parse(JSON.stringify(material.tech_params)));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setParams(material.tech_params);
  }, [material]);

  const hasChanges = JSON.stringify(params) !== JSON.stringify(originalParams);

  const resetParams = () => {
    setParams(originalParams);
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-2xl border border-slate-800 transition-all duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-900/20">
            <Wrench size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Engine Técnica Sugerida</h2>
              {hasChanges && <span className="bg-amber-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full animate-pulse">Personalizado</span>}
            </div>
            <p className="text-slate-400 text-sm">{machineType} • {material.name} {material.thickness}mm</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button 
              onClick={resetParams}
              className="p-2 text-slate-500 hover:text-white transition-colors"
              title="Resetar parâmetros"
            >
              <RotateCcw size={18} />
            </button>
          )}
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
              isEditing ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            )}
          >
            {isEditing ? 'Salvar Ajuste' : 'Ajustar Manual'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EditableStat 
          label="Rotação (RPM)" 
          value={params.rpm || 0} 
          unit=""
          isEditing={isEditing}
          onChange={(v) => setParams({ ...params, rpm: parseInt(v) })}
        />
        <EditableStat 
          label="Avanço (Feed)" 
          value={params.feed_rate} 
          unit="mm/s"
          isEditing={isEditing}
          onChange={(v) => setParams({ ...params, feed_rate: parseInt(v) })}
        />
        <EditableStat 
          label="Mergulho (Plunge)" 
          value={params.plunge_rate || (params.feed_rate / 2)} 
          unit="mm/s"
          isEditing={isEditing}
          onChange={(v) => setParams({ ...params, plunge_rate: parseInt(v) })}
        />
        <EditableStat 
          label="Potência" 
          value={params.power} 
          unit="%"
          color="text-amber-400"
          isEditing={isEditing}
          onChange={(v) => setParams({ ...params, power: parseInt(v) })}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <ShieldCheck className="text-emerald-400 shrink-0" size={20} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Restrições</p>
            <div className="flex gap-2 flex-wrap">
              {!material.can_rotate && <RestrictionBadge label="Não rotacionar" />}
              {!material.can_mirror && <RestrictionBadge label="Não espelhar" />}
              {material.grain_direction !== 'none' && <RestrictionBadge label={`Veio: ${material.grain_direction}`} />}
              {(material.can_rotate && material.can_mirror && material.grain_direction === 'none') && <span className="text-xs text-slate-300">Sem restrições físicas</span>}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <Wrench className="text-blue-400 shrink-0" size={20} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Ferramenta Recomendada</p>
            <p className="text-lg font-mono font-bold text-white uppercase">{params.tool_suggested || 'Consultar Catálogo'}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
        <div className="text-xs text-slate-500 max-w-xs leading-relaxed">
          * Parâmetros sugeridos com base em testes laboratoriais. 
          Ajuste fino pode ser necessário conforme o desgaste da ferramenta.
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all">
          <RefreshCw size={16} /> Recalcular para Laser
        </button>
      </div>
    </div>
  );
}

function EditableStat({ label, value, unit, isEditing, onChange, color = "text-white" }: { 
  label: string, 
  value: number | string, 
  unit: string, 
  isEditing: boolean, 
  onChange: (v: string) => void,
  color?: string 
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className={cn("bg-slate-800 border-b-2 border-blue-600 outline-none w-24 text-2xl font-mono font-black", color)}
          />
          <span className="text-xs text-slate-500 font-bold">{unit}</span>
        </div>
      ) : (
        <p className={cn("text-3xl font-mono font-black", color)}>
          {typeof value === 'number' ? value.toLocaleString() : value} <span className="text-xs font-normal opacity-40">{unit}</span>
        </p>
      )}
    </div>
  );
}

function RestrictionBadge({ label }: { label: string }) {
  return (
    <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
      {label}
    </span>
  );
}
