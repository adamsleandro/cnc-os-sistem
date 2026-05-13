import React from 'react';
import { useAuth } from '../../core/auth';
import { usePermissions } from '../../core/permissions';
import { LayoutDashboard, ClipboardList, PenTool, Library, Settings, Bell, LogOut, Package, Layers, Clock, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick: () => void;
  permission?: boolean;
}

export function Sidebar({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  const { profile, signOut } = useAuth();
  const permissions = usePermissions(profile);

  const navItems = [
    { id: 'dashboard', label: 'Monitor', icon: LayoutDashboard, permission: true },
    { id: 'orders', label: 'Ordens de Serviço', icon: ClipboardList, permission: true },
    { id: 'production', label: 'Modo Operador', icon: PenTool, permission: permissions.isOperator() || permissions.isAdmin() },
    { id: 'inventory', label: 'Estoque Chapas', icon: Package, permission: permissions.canEdit() },
    { id: 'tech_library', label: 'Biblio. Técnica', icon: Library, permission: true },
    { id: 'nesting', label: 'Nesting IA', icon: Layers, permission: permissions.canEdit() },
    { id: 'vsm', label: 'Fluxo (VSM)', icon: Clock, permission: permissions.canEdit() },
    { id: 'mes', label: 'MES / KPIs', icon: Activity, permission: true },
    { id: 'tech_params', label: 'Engine de Corte', icon: Settings, permission: permissions.isAdmin() },
    { id: 'maintenance', label: 'Manutenção', icon: Settings, permission: permissions.isAdmin() },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen flex flex-col shrink-0 z-40">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-black text-xl tracking-tighter">CNC</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white font-black text-lg tracking-tighter leading-none">OS-System</h1>
            <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mt-1">Industrial MES</span>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.filter(item => item.permission).map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all",
                activeTab === item.id 
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-900/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <item.icon size={18} />
              <span className="uppercase tracking-widest text-[10px]">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold overflow-hidden">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : profile?.full_name.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-white text-xs font-black truncate tracking-tight">{profile?.full_name}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-blue-500">{profile?.role}</p>
          </div>
        </div>
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all font-black text-[10px] uppercase tracking-widest"
        >
          <LogOut size={16} />
          Sair do Sistema
        </button>
      </div>
    </div>
  );
}
