import React, { useState } from 'react';
import { useAuth } from '../../core/auth';
import { UserRole } from '../../shared/types/auth.types';
import { ArrowRight, Lock, Mail, ShieldCheck, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const { signIn } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (role: UserRole) => {
    try {
      setErrorMsg('');
      await signIn(role);
    } catch (e: any) {
      setErrorMsg(e.message || 'Erro ao fazer login. Verifique os domínios autorizados no Firebase.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-emerald-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[32px] overflow-hidden shadow-2xl relative z-10">
        <div className="p-12 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
              <span className="text-white font-black text-2xl tracking-tighter">CNC</span>
            </div>
            <h1 className="text-slate-900 font-black text-3xl tracking-tighter leading-none">OS-System</h1>
          </div>

          <div className="space-y-6">
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-red-800">Erro de Autenticação</h3>
                  <p className="text-xs text-red-600 mt-1">{errorMsg}</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Bem-vindo ao MES</h2>
              <p className="text-slate-500 font-medium italic">Selecione seu perfil de acesso para entrar no sistema operacional de produção.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-4">
              {[
                { role: 'admin', label: 'Administrador / Gerente', desc: 'Visão total, relatórios e financeiro' },
                { role: 'programador', label: 'Programador de CAM', desc: 'Liberação de ordens e parâmetros' },
                { role: 'operador', label: 'Operador de Máquina', desc: 'Interface simplificada para o chão de fábrica' },
                { role: 'acabamento', label: 'Setor de Acabamento', desc: 'Controle de qualidade e finalização' },
              ].map((item) => (
                <button 
                  key={item.role}
                  onClick={() => handleLogin(item.role as UserRole)}
                  className="group flex flex-col items-start p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-blue-600 hover:border-blue-500 transition-all text-left"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-black text-slate-900 group-hover:text-white uppercase text-[10px] tracking-widest">{item.label}</span>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                  </div>
                  <p className="text-xs text-slate-400 group-hover:text-blue-100 font-medium">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-12 flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
               <ShieldCheck size={14} /> Sistema Seguro
            </div>
            <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
            <div>Build v1.0.4-MVP</div>
          </div>
        </div>

        <div className="hidden lg:block relative bg-slate-100">
           <img 
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop" 
            alt="CNC Factory" 
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 mix-blend-multiply"
           />
           <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-slate-900/90 flex flex-col justify-end p-12 text-white">
              <blockquote className="space-y-4">
                <p className="text-2xl font-black italic tracking-tight leading-snug">
                  "Otimização não é sobre trabalhar mais pesado, é sobre remover a fricção entre o projeto e a peça final."
                </p>
                <footer className="flex items-center gap-3">
                  <div className="w-8 h-px bg-blue-400"></div>
                  <cite className="text-xs font-black uppercase tracking-widest text-blue-300 not-italic">Manual do Operador</cite>
                </footer>
              </blockquote>
           </div>
        </div>
      </div>
    </div>
  );
}
