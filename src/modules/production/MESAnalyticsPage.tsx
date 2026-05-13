import React, { useState, useEffect } from 'react';
import { useDashboardData } from '../../shared/hooks/useDashboardData';
import { KPIOverview } from '../../components/KPIOverview';
import { 
  Activity, 
  BarChart3, 
  Settings, 
  AlertTriangle, 
  Target, 
  ShieldCheck, 
  Users, 
  Gauge,
  Calendar,
  ChevronRight,
  Zap,
  Cpu,
  Sparkles,
  TrendingDown,
  Scaling
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { CuttingEngineService } from '../../services/cuttingEngine';
import { AIOperationService } from '../../services/aiOperations';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';

export function MESAnalyticsPage() {
  const { machines, orders, events } = useDashboardData();
  const [activeTab, setActiveTab] = useState<'oee' | 'ole' | 'quality' | 'lead_time'>('oee');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);

  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    const analysis = await AIOperationService.analyzeOperationalEfficiency({
      machines,
      kpis: { oee: 82, availability: 88, performance: 94, quality: 99 },
      pendingOrders: orders.filter(o => o.status === 'aguardando')
    });
    setAiInsights(analysis);
    setIsAnalyzing(false);
  };

  // Derive OEE from real data (Summary)
  const productionOrders = orders.filter(o => o.status === 'concluido' || o.status === 'em_producao');
  const goodPartsTotal = productionOrders.reduce((acc, o) => acc + (o.good_count || 0), 0);
  const rejectPartsTotal = productionOrders.reduce((acc, o) => acc + (o.reject_count || 0), 0);
  const actualParts = goodPartsTotal + rejectPartsTotal;

  const realOEE = CuttingEngineService.calculateOEE(
    28800, // 8h shift
    21500, // actual run estimated
    35, // 35s cycle
    actualParts > 0 ? actualParts : 500,
    goodPartsTotal > 0 ? goodPartsTotal : 480
  );

  const hourlyProduction = [
    { time: '08:00', parts: 12 },
    { time: '09:00', parts: 15 },
    { time: '10:00', parts: 8 },
    { time: '11:00', parts: 18 },
    { time: '12:00', parts: 22 },
    { time: '13:00', parts: 14 },
    { time: '14:00', parts: 17 },
  ];

  const leadTimeStages = [
    { name: 'Comercial', hours: 4, status: 'ok' },
    { name: 'Engenharia', hours: 2, status: 'ok' },
    { name: 'Nesting/CAM', hours: 1, status: 'warning' },
    { name: 'Produção', hours: 5, status: 'ok' },
    { name: 'Expedição', hours: 3, status: 'ok' },
  ];

  const realLeadTime = CuttingEngineService.calculateAverageLeadTime(orders);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Módulo MES Industrial</h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest italic">Monitoring • KPI • OEE • OLE • Lead Time</p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl border-2 border-slate-100 shadow-sm overflow-x-auto">
           <button 
             onClick={() => setActiveTab('oee')}
             className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'oee' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400")}
           >
              OEE
           </button>
           <button 
             onClick={() => setActiveTab('lead_time')}
             className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'lead_time' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400")}
           >
              Lead Time
           </button>
           <button 
             onClick={() => setActiveTab('ole')}
             className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'ole' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400")}
           >
              OLE
           </button>
           <button 
             onClick={() => setActiveTab('quality')}
             className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'quality' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400")}
           >
              Qualidade (CEP)
           </button>
        </div>
      </div>

      {activeTab === 'oee' ? (
        <>
          <KPIOverview oee={realOEE} hourlyProduction={hourlyProduction} />

          {/* AI Operational Insights Panel */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden my-8">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Sparkles size={160} />
            </div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center animate-pulse">
                        <Sparkles size={20} />
                     </div>
                     <h2 className="text-2xl font-black italic uppercase tracking-tight">AI Operational Insights</h2>
                  </div>
                  <p className="text-slate-400 text-sm max-w-xl italic">
                    Análise preditiva e monitoramento cognitivo de performance industrial. 
                    Utilizamos Gemini AI para processar tendências de eficiência e recomendar ações imediatas.
                  </p>
                  
                  <button 
                    onClick={handleRunAiAnalysis}
                    disabled={isAnalyzing}
                    className={cn(
                      "px-8 py-3 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all active:scale-95 disabled:opacity-50",
                      isAnalyzing && "animate-pulse"
                    )}
                  >
                    {isAnalyzing ? 'Processando Dados...' : 'Gerar Consultoria IA'}
                  </button>
               </div>

               <AnimatePresence>
                  {aiInsights && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex-1 bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                       <div className="space-y-4">
                          <div>
                             <p className="text-[10px] font-black uppercase text-blue-400 mb-2">Saúde Geral da Produção</p>
                             <div className="flex items-center gap-4">
                                <span className="text-5xl font-black italic text-emerald-400">{aiInsights.general_health_score}%</span>
                                <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                                   <div className="h-full bg-emerald-500" style={{ width: `${aiInsights.general_health_score}%` }} />
                                </div>
                             </div>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-4">
                             <p className="text-[10px] font-black uppercase text-amber-400 mb-2">Alertas Críticos</p>
                             <ul className="space-y-1">
                                {aiInsights.critical_alerts.map((a: string, i: number) => (
                                  <li key={i} className="text-[10px] font-medium italic text-slate-300 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-amber-500 rounded-full" /> {a}
                                  </li>
                                ))}
                             </ul>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="bg-blue-600 rounded-2xl p-4 shadow-lg shadow-blue-500/20">
                             <p className="text-[10px] font-black uppercase text-blue-200 mb-2">Plano de Otimização</p>
                             <ul className="space-y-2">
                                {aiInsights.optimization_plan.map((p: string, i: number) => (
                                  <li key={i} className="text-[10px] font-black uppercase tracking-tight flex items-center gap-2">
                                    <ChevronRight size={12} /> {p}
                                  </li>
                                ))}
                             </ul>
                          </div>
                          <p className="text-[10px] font-medium text-slate-400 italic">
                            "{aiInsights.executive_summary}"
                          </p>
                       </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Gauge size={14} /> Detalhamento por Recurso
               </h3>
               
               <div className="grid grid-cols-1 gap-4">
                  {machines.map(m => (
                    <div key={m.id} className="bg-white border-2 border-slate-100 rounded-[32px] p-6 hover:border-slate-900 transition-all group shadow-sm">
                       <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="flex items-center gap-6">
                             <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl italic font-black", 
                               m.status === 'em_operacao' ? "bg-emerald-500 shadow-emerald-500/20" : "bg-slate-400")}>
                                {m.type === 'laser_fiber' ? 'LB' : 'CN'}
                             </div>
                             <div>
                                <h4 className="text-xl font-black text-slate-900 uppercase italic leading-none">{m.name}</h4>
                                <div className="flex items-center gap-2 mt-2">
                                   <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded", 
                                     m.status === 'em_operacao' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                                      {m.status.replace('_', ' ')}
                                   </span>
                                   <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic">Disponibilidade: 92%</span>
                                </div>
                             </div>
                          </div>

                          <div className="grid grid-cols-3 gap-8">
                             <Indicator label="Performance" value="94%" trend="up" />
                             <Indicator label="Qualidade" value="100%" trend="stable" />
                             <Indicator label="OEE" value="86%" trend="up" color="text-blue-600" />
                          </div>

                          <button className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                             <ChevronRight size={20} />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <AlertTriangle size={14} /> Alertas de Parada
               </h3>
               
               <div className="space-y-3">
                  {events.length > 0 ? events.map(e => (
                    <AlertItem 
                      key={e.id}
                        type="Parada" 
                        machine={machines.find(m => m.id === e.machine_id)?.name || 'Máquina'} 
                        time={e.started_at ? new Date(e.started_at.toDate()).toLocaleTimeString() : '--:--'} 
                        msg={String(e.reason || 'Parada reportada via cockpit.')} 
                    />
                  )) : (
                    <div className="text-[10px] font-bold text-slate-400 italic p-4 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                      Nenhuma anomalia crítica detectada.
                    </div>
                  )}
               </div>
            </div>
          </div>
        </>
      ) : activeTab === 'lead_time' ? (
        <LeadTimeView stages={leadTimeStages} leadTime={realLeadTime} />
      ) : activeTab === 'quality' ? (
        <CEPView />
      ) : (
        <div className="bg-white border-2 border-slate-100 rounded-[32px] p-20 text-center italic text-slate-400">
           Módulo de Eficiência de Mão de Obra em Processamento...
        </div>
      )}
    </div>
  );
}

function LeadTimeView({ stages, leadTime }: { stages: any[], leadTime: number }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 rounded-[32px] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <Calendar size={120} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
           <div className="space-y-2">
              <h3 className="text-4xl font-black italic tracking-tighter uppercase">{leadTime} HORAS</h3>
              <p className="text-blue-400 text-xs font-black uppercase tracking-widest">Tempo Médio de Atravessamento (Lead Time)</p>
           </div>
           <div className="flex gap-4">
              <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 text-center">
                 <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Previsão</p>
                 <p className="text-lg font-black text-emerald-400 italic">No Prazo</p>
              </div>
              <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 text-center">
                 <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Confiança</p>
                 <p className="text-lg font-black text-blue-400 italic">98%</p>
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        {stages.map((stage, i) => (
          <React.Fragment key={i}>
            <div className={cn(
              "flex-1 bg-white border-2 p-6 rounded-[32px] shadow-sm transition-all hover:scale-105",
              stage.status === 'warning' ? "border-amber-200 bg-amber-50" : "border-slate-100"
            )}>
               <div className="flex justify-between items-start mb-4">
                  <span className="text-[8px] font-black uppercase bg-slate-900 text-white px-2 py-0.5 rounded italic">ETAPA {i+1}</span>
                  {stage.status === 'warning' && <AlertTriangle size={14} className="text-amber-500 animate-pulse" />}
               </div>
               <h4 className="text-[10px] font-black uppercase text-slate-900 mb-1">{stage.name}</h4>
               <p className="text-2xl font-black italic text-slate-900 tracking-tighter">{stage.hours}h</p>
            </div>
            {i < stages.length - 1 && (
               <ChevronRight className="text-slate-200 hidden md:block" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function CEPView() {
  const { orders } = useDashboardData();
  const [metric, setMetric] = useState<'time' | 'precision'>('time');
  
  // Calculate process variability
  const finishedOrders = orders.filter(o => o.status === 'concluido');
  
  const processData = finishedOrders.map((o, i) => {
    const variation = o.time_execution && o.time_cam 
      ? Math.round((o.time_execution / o.time_cam) * 100) 
      : 100;
    
    // Simulating precision if not in DB for visual context
    const precision = (o as any).metrics?.avg_dimensional_deviation || (Math.random() * 0.15);
    
    return {
      index: i + 1,
      id: o.number,
      variation,
      precision: Math.round(precision * 100) / 100
    };
  }).slice(-20);

  const activeValues = processData.map(d => metric === 'time' ? d.variation : d.precision);
  const cepStats = CuttingEngineService.calculateCEP(activeValues, metric === 'time' ? 100 : 0);

  // Pareto Data (Reasons for Rejections/Problems)
  const allOccurrences = orders.flatMap(o => o.occurrences || []);
  const reasonCounts = allOccurrences.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const paretoData = Object.entries(reasonCounts)
    .map(([name, value]) => ({ name, value: Number(value) }))
    .sort((a, b) => b.value - a.value);

  const isAnomalous = activeValues.some(v => cepStats && (v > cepStats.ucl || v < cepStats.lcl));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-[24px] border-2 border-slate-100 shadow-sm">
          <div className="flex gap-2">
             <button 
               onClick={() => setMetric('time')}
               className={cn(
                 "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                 metric === 'time' ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
               )}
             >
                Estabilidade de Tempo
             </button>
             <button 
               onClick={() => setMetric('precision')}
               className={cn(
                 "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                 metric === 'precision' ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
               )}
             >
                Precisão Dimensional
             </button>
          </div>
          <div className="flex items-center gap-4 px-4">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[9px] font-bold text-slate-500 uppercase">UCL/LCL (3σ)</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[9px] font-bold text-slate-500 uppercase">Média</span>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Média (X-Bar)" value={`${cepStats?.mean || 0}${metric === 'time' ? '%' : 'mm'}`} sub={metric === 'time' ? "Eficiência Média" : "Erro Médio"} color="text-blue-600" />
          <StatCard label="Desvio Padrão (σ)" value={`${cepStats?.stdDev || 0}`} sub="Variabilidade" color="text-purple-600" />
          <StatCard label="Índice Cpk" value={`${cepStats?.cpk || 1.2}`} sub={cepStats?.cpk && cepStats.cpk > 1.33 ? "Processo Capaz" : "Atenção Requerida"} color={cepStats?.cpk && cepStats.cpk > 1.33 ? "text-emerald-500" : "text-amber-500"} />
          <StatCard label="Limites (UCL/LCL)" value={`${cepStats?.ucl} / ${cepStats?.lcl}`} sub="Intervalo de Controle" color="text-red-500" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border-2 border-slate-100 rounded-[32px] p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 italic">Carta de Controle X-Bar</h3>
                   <p className="text-[10px] font-bold text-slate-400">{metric === 'time' ? 'Variação Real vs CAM (%)' : 'Desvio Dimensional (mm)'}</p>
                </div>
                <ShieldCheck size={20} className={cn(isAnomalous ? "text-red-500 animate-pulse" : "text-emerald-500")} />
             </div>
             
             <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={processData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="index" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                      />
                      {cepStats && (
                        <>
                          <ReferenceLine y={cepStats.mean} stroke="#3b82f6" strokeDasharray="3 3" />
                          <ReferenceLine y={cepStats.ucl} stroke="#ef4444" strokeDasharray="5 5" />
                          <ReferenceLine y={cepStats.lcl} stroke="#ef4444" strokeDasharray="5 5" />
                        </>
                      )}
                      <Line 
                        type="monotone" 
                        dataKey={metric === 'time' ? "variation" : "precision"} 
                        stroke="#0f172a" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8, fill: '#3b82f6' }}
                      />
                   </LineChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white border-2 border-slate-100 rounded-[32px] p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 italic">Análise de Pareto</h3>
                   <p className="text-[10px] font-bold text-slate-400">Principais Causas de Parada/Falha</p>
                </div>
                <TrendingDown size={20} className="text-blue-600" />
             </div>

             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={paretoData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900, fill: '#64748b' }} width={80} />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                         {paretoData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#3b82f6'} />
                         ))}
                      </Bar>
                   </BarChart>
                </ResponsiveContainer>
             </div>

             <div className="mt-8 p-4 bg-slate-50 rounded-2xl">
                <h4 className="text-[10px] font-black uppercase text-slate-900 flex items-center gap-2">
                   <Zap size={14} className="text-amber-500" /> Insight Industrial
                </h4>
                <p className="text-[10px] font-medium text-slate-500 leading-tight mt-2 italic">
                   {paretoData[0] 
                     ? `O evento "${paretoData[0].name}" representa o maior gargalo operacional. Focar em melhoria contínua nesta área.`
                     : "Nenhuma causa de falha frequente detectada para análise de Pareto."}
                </p>
             </div>
          </div>
       </div>

       {isAnomalous && (
          <div className="bg-red-50 border-2 border-red-200 rounded-[32px] p-6 flex items-start gap-4 animate-bounce">
             <AlertTriangle size={24} className="text-red-600 mt-1" />
             <div>
                <h4 className="text-xs font-black uppercase text-red-900">Processo Fora de Controle Estatístico</h4>
                <p className="text-xs font-medium text-red-700 leading-relaxed mt-1 italic">
                   Foram detectados desvios além de 3σ. Verifique se houve troca de operador, variação no lote de matéria-prima ou necessidade de manutenção preventiva.
                </p>
             </div>
          </div>
       )}
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string, value: string, sub: string, color: string }) {
  return (
    <div className="bg-white border-2 border-slate-100 rounded-[32px] p-6 shadow-sm">
       <p className="text-[8px] font-black uppercase text-slate-400 mb-1">{label}</p>
       <h4 className={cn("text-2xl font-black italic tracking-tighter", color)}>{value}</h4>
       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{sub}</p>
    </div>
  );
}

interface IndicatorProps { label: string; value: string; trend: 'up' | 'down' | 'stable'; color?: string; }
const Indicator: React.FC<IndicatorProps> = ({ label, value, trend, color = "text-slate-900" }) => {
  return (
    <div className="text-center">
       <p className="text-[8px] font-black uppercase text-slate-400 mb-1">{label}</p>
       <p className={cn("text-lg font-black italic", color)}>{value}</p>
    </div>
  );
};

interface AlertItemProps { type: string; machine: string; time: string; msg: string; }
const AlertItem: React.FC<AlertItemProps> = ({ type, machine, time, msg }) => {
  return (
    <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-2">
       <div className="flex justify-between items-center">
          <span className="text-[8px] font-black uppercase bg-red-50 text-red-600 px-2 py-0.5 rounded italic">
             {type}
          </span>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{time}</span>
       </div>
       <p className="text-[10px] font-black uppercase text-slate-900 tracking-tight">{machine}</p>
       <p className="text-[10px] font-medium text-slate-500 leading-tight italic">{msg}</p>
    </div>
  );
};
