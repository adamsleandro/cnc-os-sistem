import React, { useState, useRef, useEffect } from 'react';
import { 
  Layers, Zap, Maximize2, RotateCcw, Save, Trash2, Cpu, 
  BarChart3, AlertCircle, MousePointer2, Move, Scissors, 
  ChevronRight, Play, Settings, Download, Plus, LayoutGrid,
  History, Package
} from 'lucide-react';
import { Stage, Layer, Rect, Group, Text, Image } from 'react-konva';
import { useDashboardData } from '../../shared/hooks/useDashboardData';
import { GeminiNestingService } from '../../services/geminiNesting';
import { ProductionService } from '../../services/production';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Helper } from 'dxf';
import { useAuth } from '../../core/auth';

const SvgImage = ({ url, width, height }: { url: string, width: number, height: number }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = url;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      setImage(img);
    };
  }, [url]);

  if (!image) return null;
  return <Image image={image} width={width} height={height} />;
};

interface NestedPart {
  id: string;
  orderId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  color: string;
  status: 'pending' | 'placed' | 'locked';
  svgDataUrl?: string;
}


export function NestingPage() {
  const { orders } = useDashboardData();
  const [selectedSheet, setSelectedSheet] = useState({ w: 2000, h: 1000, margin: 10 });
  const [nestedParts, setNestedParts] = useState<NestedPart[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [scale, setScale] = useState(0.4);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();
  const [activeSidebar, setActiveSidebar] = useState<'parts' | 'scraps' | 'history'>('parts');
  const [historyProjects, setHistoryProjects] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // At the top level near the other refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportDxf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let svgContent = '';
        let w = 150 + Math.random() * 150;
        let h = 100 + Math.random() * 100;

        if (file.name.toLowerCase().endsWith('.dxf')) {
          const helper = new Helper(content);
          
          if (helper.parsed?.header?.extMin && helper.parsed?.header?.extMax) {
            const { extMin, extMax } = helper.parsed.header;
            const parsedW = Math.abs(extMax.x - extMin.x);
            const parsedH = Math.abs(extMax.y - extMin.y);
            if (parsedW > 0 && parsedH > 0) {
              w = parsedW;
              h = parsedH;
            }
          }

          const rawSvg = helper.toSVG();
          // Inject viewBox and styling to make it visible
          const styledSvg = rawSvg.replace('<svg', '<svg width="100%" height="100%" ');
          svgContent = styledSvg;
        } else if (file.name.toLowerCase().endsWith('.svg')) {
          svgContent = content;
        }

        const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);

        const newPart: NestedPart = {
          id: Math.random().toString(36).substr(2, 9),
          orderId: 'IMPORTED',
          x: selectedSheet.margin,
          y: selectedSheet.margin,
          w: w,
          h: h,
          rotation: 0,
          color: '#ec4899', // Pink for imported items
          status: 'placed',
          svgDataUrl: dataUrl
        };

        setNestedParts(prev => [...prev, newPart]);
        alert(`O arquivo '${file.name}' foi importado com sucesso.`);
      } catch (err) {
        console.error(err);
        alert('Erro ao processar o arquivo DXF/SVG. Talvez o formato não seja suportado ou esteja corrompido.');
      }
    };
    reader.readAsText(file);

    e.target.value = ''; // Reset input
  };

  // Filter pending orders
  const pendingOrders = orders.filter(o => o.status === 'aguardando' || o.status === 'programacao');

  // Adjust scale to fit container
  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth - 100;
      const s = width / selectedSheet.w;
      setScale(s);
    }
  }, [selectedSheet.w]);

  const fetchHistory = async () => {
    if (!profile?.company_id) return;
    setIsLoadingHistory(true);
    try {
      const projects = await ProductionService.getNestingProjects(profile.company_id);
      setHistoryProjects(projects);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeSidebar === 'history') {
      fetchHistory();
    }
  }, [activeSidebar, profile?.company_id]);

  const loadProject = async (project: any) => {
    try {
      const parts = await ProductionService.getNestingProjectParts(project.id);
      setSelectedSheet({ w: project.plate_width, h: project.plate_height, margin: 10 });
      setNestedParts(parts as NestedPart[]);
      alert('Projeto carregado com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Erro ao carregar projeto.');
    }
  };

  const handleAutoNesting = () => {
    setIsOptimizing(true);
    
    // Heuristic: First-Fit Decreasing Height (FFDH)
    const sortedParts = [...pendingOrders]
      .map(os => ({
        id: Math.random().toString(36).substr(2, 9),
        orderId: os.id,
        w: 200 + (Math.random() * 300), // Mock dimensions
        h: 150 + (Math.random() * 200),
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)]
      }))
      .sort((a, b) => b.h - a.h);

    const placed: NestedPart[] = [];
    let currentX = selectedSheet.margin;
    let currentY = selectedSheet.margin;
    let maxHInRow = 0;

    sortedParts.forEach(part => {
      if (currentX + part.w + selectedSheet.margin > selectedSheet.w) {
        currentX = selectedSheet.margin;
        currentY += maxHInRow + selectedSheet.margin;
        maxHInRow = 0;
      }

      if (currentY + part.h + selectedSheet.margin <= selectedSheet.h) {
        placed.push({
          ...part,
          x: currentX,
          y: currentY,
          rotation: 0,
          status: 'placed'
        });
        currentX += part.w + selectedSheet.margin;
        maxHInRow = Math.max(maxHInRow, part.h);
      }
    });

    setNestedParts(placed);
    setIsOptimizing(false);
  };

  const handleSendToProduction = async () => {
    if (nestedParts.length === 0) return;
    setIsOptimizing(true);
    
    try {
      const orderIds = Array.from(new Set(nestedParts.map(p => p.orderId)));
      await ProductionService.updateOrdersStatus(orderIds, 'programacao');
      
      await ProductionService.saveNestingProject({
        title: `Nesting ${new Date().toLocaleDateString()}`,
        material_id: 'auto_detected',
        thickness: 0,
        plate_width: selectedSheet.w,
        plate_height: selectedSheet.h,
        status: 'ready',
        efficiency: yieldPercent,
        waste: wastePercent,
        company_id: profile?.company_id
      }, nestedParts);

      alert('Enviado para produção e salvo com sucesso!');
      setNestedParts([]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAiOptimize = async () => {
    setIsOptimizing(true);
    setAiAnalysis(null);

    const parts = pendingOrders.map(o => ({
      id: o.id,
      width: 200, 
      height: 150,
      quantity: 1
    }));

    const analysis = await GeminiNestingService.getOptimizationSuggestions(
      parts,
      selectedSheet.w,
      selectedSheet.h
    );

    setAiAnalysis(analysis);
    handleAutoNesting();
    setIsOptimizing(false);
  };

  const totalArea = selectedSheet.w * selectedSheet.h;
  const usedArea = nestedParts.reduce((acc, p) => acc + (p.w * p.h), 0);
  const yieldPercent = totalArea > 0 ? (usedArea / totalArea) * 100 : 0;
  const wastePercent = 100 - yieldPercent;

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Top Header/Toolbar */}
      <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded-lg">
            <LayoutGrid className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tight text-slate-900">Nesting Industrial v1.0</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Central de Otimização de Chapas</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleAiOptimize}
            disabled={isOptimizing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
          >
            <Cpu size={14} className={cn(isOptimizing && "animate-spin")} />
            IA Optimizer
          </button>
          <button 
            onClick={handleAutoNesting}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Play size={14} />
            Auto Nest
          </button>
          <div className="h-8 w-px bg-slate-200 mx-2" />
          <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
            <Save size={18} />
          </button>
          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Industrial Sidebar */}
        <div className="w-16 border-r border-slate-200 bg-slate-900 flex flex-col items-center py-4 gap-4 shrink-0">
          <button 
            onClick={() => setActiveSidebar('parts')}
            className={cn("p-3 rounded-xl transition-all", activeSidebar === 'parts' ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-800")}
          >
            <Layers size={20} />
          </button>
          <button 
            onClick={() => setActiveSidebar('scraps')}
            className={cn("p-3 rounded-xl transition-all", activeSidebar === 'scraps' ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-800")}
          >
            <Package size={20} />
          </button>
          <button 
            onClick={() => setActiveSidebar('history')}
            className={cn("p-3 rounded-xl transition-all", activeSidebar === 'history' ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-800")}
          >
            <History size={20} />
          </button>
        </div>

        {/* Left Drawer */}
        <div className="w-72 border-r border-slate-200 bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              {activeSidebar === 'parts' && <><Layers size={14} /> Biblioteca de Peças</>}
              {activeSidebar === 'scraps' && <><Package size={14} /> Banco de Retalhos</>}
              {activeSidebar === 'history' && <><History size={14} /> Histórico Nesting</>}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeSidebar === 'parts' && pendingOrders.map(os => (
              <div key={os.id} className="group p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 transition-all cursor-move">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded">OS #{os.number}</span>
                  <Plus size={14} className="text-slate-300 group-hover:text-blue-500" />
                </div>
                <p className="text-xs font-bold text-slate-700 leading-tight mb-2 truncate">{os.title}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-1.5 rounded border border-slate-100">
                    <p className="text-[8px] uppercase text-slate-400 font-bold">Dim.</p>
                    <p className="text-[10px] font-black text-slate-900">400x300mm</p>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-100">
                    <p className="text-[8px] uppercase text-slate-400 font-bold">Material</p>
                    <p className="text-[10px] font-black text-slate-900 truncate">{os.material_type}</p>
                  </div>
                </div>
              </div>
            ))}

            {activeSidebar === 'scraps' && (
              <div className="space-y-3">
                 <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-[10px] font-black text-amber-900 uppercase">Retalho #A-421</p>
                    <p className="text-[9px] font-bold text-amber-600 mb-2">ACM 3mm - 800x400mm</p>
                    <button className="w-full py-1.5 bg-white border border-amber-200 rounded-lg text-[8px] font-black uppercase text-amber-700">Usar Retalho</button>
                 </div>
              </div>
            )}
            
            {activeSidebar === 'history' && (
              <div className="space-y-3">
                 {isLoadingHistory ? (
                   <p className="text-xs text-slate-400 text-center italic py-10">Carregando histórico...</p>
                 ) : historyProjects.length === 0 ? (
                   <p className="text-xs text-slate-400 text-center italic py-10">Nenhum projeto salvo.</p>
                 ) : (
                   historyProjects.map(proj => (
                     <div key={proj.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 transition-all">
                       <p className="text-[10px] font-black text-slate-900 uppercase">{proj.title || 'Projeto sem nome'}</p>
                       <p className="text-[9px] font-bold text-slate-500 mb-2">Aproveitamento: {proj.efficiency?.toFixed(1)}%</p>
                       <button 
                         onClick={() => loadProject(proj)}
                         className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[8px] font-black uppercase transition-all"
                       >
                         Carregar Projeto
                       </button>
                     </div>
                   ))
                 )}
              </div>
            )}
            
            {activeSidebar === 'parts' && pendingOrders.length === 0 && (
              <div className="text-center py-20 opacity-20 italic text-xs">Fila de nesting vazia.</div>
            )}
          </div>
          {activeSidebar === 'parts' && (
            <div className="p-4 border-t border-slate-100">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".dxf,.svg"
                onChange={handleImportDxf}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-all"
              >
                Importar DXF/SVG
              </button>
            </div>
          )}
        </div>

        {/* Center: Canvas Workspace */}
        <div className="flex-1 bg-slate-100 flex flex-col relative" ref={containerRef}>
          {/* Canvas Controls */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur shadow-sm border border-slate-200 rounded-full px-4 py-2 flex items-center gap-4 z-10">
            <div className="flex items-center gap-1 border-r border-slate-200 pr-4">
              <button className="p-1 text-slate-600 hover:bg-slate-100 rounded"><MousePointer2 size={16} /></button>
              <button className="p-1 text-slate-600 hover:bg-slate-100 rounded"><Move size={16} /></button>
              <button className="p-1 text-slate-600 hover:bg-slate-100 rounded"><RotateCcw size={16} /></button>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-[10px] font-black text-slate-600" onClick={() => setScale(s => s * 0.8)}>-</button>
              <span className="text-[10px] font-black text-slate-900">{(scale * 100).toFixed(0)}%</span>
              <button className="text-[10px] font-black text-slate-600" onClick={() => setScale(s => s * 1.2)}>+</button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center overflow-auto p-20 cursor-grab active:cursor-grabbing">
            <div className="bg-slate-900 shadow-2xl relative" style={{ 
              width: selectedSheet.w * scale, 
              height: selectedSheet.h * scale,
              backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)',
              backgroundSize: `${40 * scale}px ${40 * scale}px`
            }}>
              <Stage 
                width={selectedSheet.w * scale} 
                height={selectedSheet.h * scale}
                ref={stageRef}
              >
                <Layer>
                  {/* The Sheet Border */}
                  <Rect
                    width={selectedSheet.w * scale}
                    height={selectedSheet.h * scale}
                    stroke="#444"
                    strokeWidth={2}
                  />
                  
                  {/* Margins */}
                  <Rect
                    x={selectedSheet.margin * scale}
                    y={selectedSheet.margin * scale}
                    width={(selectedSheet.w - (selectedSheet.margin * 2)) * scale}
                    height={(selectedSheet.h - (selectedSheet.margin * 2)) * scale}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={1}
                    dash={[5, 5]}
                  />

                  {nestedParts.map((part) => (
                    <Group
                      key={part.id}
                      id={part.id}
                      x={part.x * scale}
                      y={part.y * scale}
                      draggable
                      onDragEnd={(e) => {
                        const newX = e.target.x() / scale;
                        const newY = e.target.y() / scale;
                        setNestedParts(prev => prev.map(p => 
                          p.id === part.id ? { ...p, x: newX, y: newY } : p
                        ));
                      }}
                      onClick={() => setSelectedId(part.id)}
                    >
                      <Rect
                        width={part.w * scale}
                        height={part.h * scale}
                        fill={part.color}
                        opacity={part.svgDataUrl ? 0.1 : 0.3}
                        stroke={selectedId === part.id ? '#fff' : part.color}
                        strokeWidth={selectedId === part.id ? 2 : 1}
                        cornerRadius={4}
                      />
                      {part.svgDataUrl && (
                        <SvgImage 
                          url={part.svgDataUrl} 
                          width={part.w * scale} 
                          height={part.h * scale} 
                        />
                      )}
                      {/* Industrial Detail: Cutting sequence number */}
                      <Text
                        text={nestedParts.indexOf(part) + 1 + ""}
                        fontSize={10 * scale}
                        fill="#fff"
                        x={5 * scale}
                        y={5 * scale}
                        fontStyle="bold"
                      />
                    </Group>
                  ))}
                </Layer>
              </Stage>
            </div>
          </div>
        </div>

        {/* Right: Info & KPIs */}
        <div className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-100 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <BarChart3 size={14} /> KPI de Eficiência
            </h3>
            
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-2xl text-white">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Aproveitamento Final</p>
                <div className="flex items-end justify-between">
                  <h4 className={cn(
                    "text-3xl font-black italic",
                    yieldPercent > 80 ? "text-emerald-400" : "text-amber-400"
                  )}>{yieldPercent.toFixed(1)}%</h4>
                  <p className="text-[10px] text-slate-500 font-bold mb-1">ALVO: 85%</p>
                </div>
                <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${yieldPercent}%` }}
                    className={cn(
                      "h-full rounded-full",
                      yieldPercent > 80 ? "bg-emerald-500" : "bg-amber-500"
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                  <p className="text-[10px] font-black uppercase text-red-400 mb-1">Desperdício</p>
                  <p className="text-xl font-black text-red-600">{wastePercent.toFixed(1)}%</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-black uppercase text-blue-400 mb-1">Tempo Est.</p>
                  <p className="text-xl font-black text-blue-600">14m</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Configurações da Chapa</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">Chapa X (mm)</label>
                    <input 
                      type="number" 
                      value={selectedSheet.w} 
                      onChange={e => setSelectedSheet(s => ({ ...s, w: Number(e.target.value) }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">Chapa Y (mm)</label>
                    <input 
                      type="number" 
                      value={selectedSheet.h}
                      onChange={e => setSelectedSheet(s => ({ ...s, h: Number(e.target.value) }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Margem Segurança (mm)</label>
                  <input 
                    type="number" 
                    value={selectedSheet.margin}
                    onChange={e => setSelectedSheet(s => ({ ...s, margin: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Legenda de Tecnologia</h3>
              <div className="grid grid-cols-1 gap-2">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500 opacity-40 border border-blue-500" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Velocidade Alta (Fiber)</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-500 opacity-40 border border-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Velocidade Média</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-amber-500 opacity-40 border border-amber-500" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Velocidade Baixa</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500 opacity-40 border border-red-500" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Gravação / Marcação</span>
                 </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between">
                <span>Contorno Selecionado</span>
                {selectedId && <button onClick={() => setSelectedId(null)} className="text-red-500"><Trash2 size={12} /></button>}
              </h3>
              {selectedId ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                   <div className="flex items-center justify-between">
                     <p className="text-[10px] font-black text-slate-900">PEÇA #{selectedId.substr(0,4).toUpperCase()}</p>
                     <button className="p-1 hover:bg-slate-200 rounded"><RotateCcw size={12} /></button>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-white rounded border border-slate-100 text-center">
                        <p className="text-[8px] font-bold text-slate-400">POS. X</p>
                        <p className="text-[10px] font-black">42.5</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-100 text-center">
                        <p className="text-[8px] font-bold text-slate-400">POS. Y</p>
                        <p className="text-[10px] font-black">118.2</p>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                   <p className="text-[10px] font-bold text-slate-300 italic uppercase">Nenhuma peça selecionada</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-slate-100">
            <button 
              onClick={handleSendToProduction}
              disabled={isOptimizing || nestedParts.length === 0}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <ChevronRight size={16} /> Enviar para Produção
            </button>
          </div>
        </div>
      </div>
      
      {/* AI Intelligence Drawer Overlay (Optional) */}
      <AnimatePresence>
        {aiAnalysis && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[600px] z-50 pointer-events-none"
          >
            <div className="bg-blue-600 rounded-3xl p-6 shadow-2xl text-white pointer-events-auto border border-blue-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Zap className="text-amber-300" size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest">Recomendação do AI Optimizer</h4>
                  <p className="text-[9px] font-bold text-blue-200 uppercase tracking-tighter">Gemini Insight Engine</p>
                </div>
                <button onClick={() => setAiAnalysis(null)} className="ml-auto opacity-50 hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
              </div>
              <p className="text-sm font-medium leading-relaxed italic mb-4">
                "{aiAnalysis.ai_advice}"
              </p>
              <div className="flex gap-2">
                {aiAnalysis.strategies.map((s: string, i: number) => (
                  <span key={i} className="text-[8px] font-black uppercase bg-blue-700 px-3 py-1 rounded-full border border-blue-500/50">{s}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
