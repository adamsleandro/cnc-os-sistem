import React from 'react';
import { Scissors } from 'lucide-react';

export function NestingPreview() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-900">Mapa de Aproveitamento</h3>
          <p className="text-xs text-slate-500">Representação visual do nesting em chapa 1.20m x 2.20m</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-black uppercase">
          82% Eficiência
        </div>
      </div>

      {/* Visual Nesting Canvas */}
      <div className="aspect-[1.2/2.2] bg-slate-100 rounded-lg border-2 border-slate-200 relative p-1">
         {/* Peças cortadas */}
         <div className="absolute top-0 left-0 w-[40%] h-[30%] bg-blue-500/20 border border-blue-500 rounded m-1 flex items-center justify-center text-[8px] font-bold text-blue-700">OS #1024</div>
         <div className="absolute top-0 left-[40%] w-[30%] h-[40%] bg-blue-500/20 border border-blue-500 rounded m-1 flex items-center justify-center text-[8px] font-bold text-blue-700">OS #1024</div>
         <div className="absolute top-[30%] left-0 w-[40%] h-[50%] bg-blue-500/20 border border-blue-500 rounded m-1 flex items-center justify-center text-[8px] font-bold text-blue-700">OS #1025</div>
         
         {/* Sobra / Retalho */}
         <div className="absolute bottom-0 right-0 w-[30%] h-[60%] bg-amber-500/10 border-2 border-dashed border-amber-500/40 rounded m-1 flex flex-col items-center justify-center text-center">
            <Scissors size={14} className="text-amber-500 mb-1" />
            <span className="text-[8px] font-black text-amber-600 uppercase leading-tight">Sobra Reaproveitável<br/>(Retalho)</span>
            <span className="text-[7px] text-amber-500/60 mt-1">Reg. Aut. no Estoque</span>
         </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between bg-slate-50 p-3 rounded-lg">
        <div className="text-[10px] font-black text-slate-400 uppercase">Estimativa de Perda</div>
        <div className="text-lg font-black text-slate-700">1.2 m² <span className="text-xs font-normal text-slate-400">(Retalhos)</span></div>
      </div>
    </div>
  );
}
