import React from 'react';
import { useAuth } from '../../core/auth';
import { Bell, Search, User } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';
import { AppNotification } from '../types/notification.types';

export function Topbar({ notifications }: { notifications: AppNotification[] }) {
  const { profile } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex-1 max-w-xl">
           <div className="relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Pesquisar ordens, materiais ou máquinas..." 
                className="w-full bg-slate-50 border-transparent rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
              >
                <Bell size={20} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              <NotificationPanel 
                isOpen={isNotificationsOpen} 
                onClose={() => setIsNotificationsOpen(false)} 
                notifications={notifications}
              />
           </div>

           <div className="h-8 w-px bg-slate-100"></div>

           <div className="flex items-center gap-3 pl-2">
              <div className="flex flex-col items-end">
                 <span className="text-xs font-black text-slate-900 tracking-tight leading-none">{profile?.full_name}</span>
                 <span className="text-[9px] font-black uppercase text-blue-600 tracking-widest mt-1">{profile?.role}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white text-xs font-black">
                 {profile?.full_name.charAt(0)}
              </div>
           </div>
        </div>
    </header>
  );
}
