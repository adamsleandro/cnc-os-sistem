import React from 'react';
import { cn } from '../../lib/utils';
import { AppNotification } from '../types/notification.types';
import { Bell, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';

export function NotificationPanel({ isOpen, onClose, notifications, onMarkAllRead }: { 
  isOpen: boolean, 
  onClose: () => void,
  notifications: AppNotification[],
  onMarkAllRead?: () => void
}) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black text-slate-900 flex items-center gap-2 text-xs uppercase tracking-widest">
            <Bell size={14} className="text-blue-600" /> Notificações
          </h3>
          <button 
            onClick={onMarkAllRead}
            className="text-[10px] font-black text-blue-600 uppercase hover:underline tracking-tighter"
          >
            Lidas
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-[10px] font-black uppercase tracking-widest">Sem alertas</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={cn(
                  "p-4 border-b border-slate-50 transition-colors hover:bg-slate-50 cursor-pointer relative",
                  !notif.read && "bg-blue-50/30"
                )}
              >
                {!notif.read && <div className="absolute left-1 top-4 w-1 h-2/3 bg-blue-500 rounded-full"></div>}
                <div className="flex gap-3">
                  <div className={cn(
                    "p-2 rounded-xl shrink-0",
                    notif.type === 'warning' ? "bg-amber-100 text-amber-600" :
                    notif.type === 'success' ? "bg-emerald-100 text-emerald-600" :
                    "bg-blue-100 text-blue-600"
                  )}>
                    {notif.type === 'warning' ? <AlertTriangle size={14} /> :
                     notif.type === 'success' ? <CheckCircle size={14} /> :
                     <Info size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 mb-0.5 tracking-tight">{notif.title}</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed mb-1.5 font-medium">{notif.message}</p>
                    <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      <Clock size={8} /> {notif.time}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 text-center bg-slate-50 border-t border-slate-100">
          <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Ver todas</button>
        </div>
    </div>
  );
}
