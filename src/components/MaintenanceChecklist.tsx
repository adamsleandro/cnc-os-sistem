import React, { useState } from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
}

interface MaintenanceChecklistProps {
  title: string;
  items: string[];
  onFinish?: () => void;
}

export function MaintenanceChecklist({ title, items, onFinish }: MaintenanceChecklistProps) {
  const [tasks, setTasks] = useState<ChecklistItem[]>(
    items.map((item, index) => ({ id: String(index), task: item, completed: false }))
  );

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const allCompleted = tasks.every(t => t.completed);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-slate-900 p-4 flex items-center justify-between">
        <h3 className="text-white font-bold tracking-tight">{title}</h3>
        <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-400 uppercase">
          <AlertCircle size={12} /> Obrigatório
        </div>
      </div>
      
      <div className="p-4 space-y-2">
        {tasks.map(task => (
          <button
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
              task.completed 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                : "bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300"
            )}
          >
            {task.completed ? (
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
            ) : (
              <Circle size={20} className="text-slate-300 shrink-0" />
            )}
            <span className={cn("text-sm font-medium", task.completed && "line-through opacity-60")}>
              {task.task}
            </span>
          </button>
        ))}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <button
          disabled={!allCompleted}
          onClick={onFinish}
          className={cn(
            "w-full py-3 rounded-xl font-bold transition-all shadow-lg",
            allCompleted 
              ? "bg-slate-900 text-white shadow-slate-200 active:scale-95" 
              : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
          )}
        >
          {allCompleted ? "CONCLUIR CHECKLIST" : "COMPLETE TODOS OS ITENS"}
        </button>
      </div>
    </div>
  );
}
