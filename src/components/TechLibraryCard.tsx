import React from 'react';
import { Settings, Wrench, Cpu, Droplets, Zap, Activity } from 'lucide-react';
import { Material, TechParams } from '@/src/types';

interface TechLibraryCardProps {
  material: Material;
  onSelect?: (material: Material) => void;
}

export const TechLibraryCard: React.FC<TechLibraryCardProps> = ({ material, onSelect }) => {
  const params = material.tech_params;

  return (
    <div 
      onClick={() => onSelect?.(material)}
      className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {material.name}
          </h3>
          <p className="text-sm text-slate-500">{material.category} • {material.thickness}mm</p>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg text-slate-400 group-hover:text-blue-500 transition-colors">
          <Settings size={18} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ParamItem icon={Zap} label="RPM" value={params.rpm} unit="" />
        <ParamItem icon={Activity} label="Avanço" value={params.feed_rate} unit="mm/s" />
        <ParamItem icon={Droplets} label="Potência" value={params.power} unit="%" />
        <ParamItem icon={Cpu} label="Passadas" value={params.passes} unit="x" />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-600">
        <Wrench size={14} className="text-slate-400" />
        Fresa: <span className="text-slate-900 uppercase">{params.tool_suggested || 'Não definida'}</span>
      </div>
    </div>
  );
}

function ParamItem({ icon: Icon, label, value, unit }: { icon: any, label: string, value?: number, unit: string }) {
  return (
    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 mb-0.5">
        <Icon size={12} />
        {label}
      </div>
      <div className="text-sm font-mono font-bold text-slate-700">
        {value || '--'} <span className="text-[10px] font-normal opacity-60">{unit}</span>
      </div>
    </div>
  );
}
