import React from 'react';
import { PlayCircle, Clock, BookOpen, ChevronRight } from 'lucide-react';

interface TrainingCardProps {
  title: string;
  duration: string;
  category: string;
  thumbnail?: string;
  onClick?: () => void;
}

export const TrainingCard: React.FC<TrainingCardProps> = ({ title, duration, category, thumbnail, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="aspect-video bg-slate-100 relative overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <PlayCircle size={48} strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          {duration}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase mb-2">
          <BookOpen size={12} />
          {category}
        </div>
        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight h-10">
          {title}
        </h4>
        <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            Assistir agora
          </div>
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
}
