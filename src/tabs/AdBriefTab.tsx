import { useState, useRef, useEffect, useCallback } from 'react';
import { adBriefData, messagingData, anglesData, icpData, hooksData, adConceptsData } from '../data/mockData';
import type { AdBriefItem, AdConceptItem, GeneratedScript } from '../data/mockData';
import { Tooltip } from '../components/Tooltip';
import {
  ChevronLeft, ChevronRight, Loader2, CheckCircle2,
  ArrowUpDown, Eye, Plus, Minus, FileText,
  ChevronDown, ChevronUp, X, Filter,
  SlidersHorizontal, CheckCheck, Play, Search,
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string, id: string) => void;
  navHistory: Array<{ tab: string; id: string }>;
  onBack: () => void;
  onConceptsGenerated: (concepts: AdConceptItem[]) => void;
}

type GenStep = 'idle' | 'generating' | 'done';

interface GenConfig {
  variationMode: 'Tight' | 'Moderate' | 'Wide';
  numVariations: number;
  duration: 'Auto' | 'Comedy' | 'Emotional' | 'Educational';
  tone: 'Auto' | '15s' | '30s' | '45s' | '60s';
  language: 'Auto' | 'English' | 'Hindi' | 'Kannada' | 'Tamil';
  prompt: string;
}

interface Toast {
  id: string;
  briefId: string;
  angleTitle: string;
  count: number;
}

const DEFAULT_CONFIG: GenConfig = {
  variationMode: 'Tight',
  numVariations: 1,
  duration: 'Emotional',
  tone: '30s',
  language: 'English',
  prompt: '',
};

// ── Tiny column filter dropdown ───────────────────────────────────────────────
function ColFilter({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        className={`flex items-center justify-center w-4 h-4 rounded transition-colors ${value !== 'All' ? 'text-blue-500' : 'text-gray-300 hover:text-gray-500'}`}>
        <Filter size={9} />
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[120px] py-1 overflow-hidden">
          {['All', ...options].map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-[12px] transition-colors ${value === opt ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function AdBriefTab({ onNavigate, navHistory, onBack, onConceptsGenerated }: Props) {
  const [briefs, setBriefs] = useState(adBriefData);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [overlayBriefId, setOverlayBriefId] = useState<string | null>(null);
  const [configs, setConfigs] = useState<Record<string, GenConfig>>({});
  const [genSteps, setGenSteps] = useState<Record<string, GenStep>>({});
  const [scripts, setScripts] = useState<Record<string, GeneratedScript[]>>({});
  const [generatedSet, setGeneratedSet] = useState<Set<string>>(new Set(adConceptsData.map(c => c.briefId)));

  // UI state
  const [configModalId, setConfigModalId] = useState<string | null>(null);  // popup
  const [drawerBriefId, setDrawerBriefId] = useState<string | null>(null);   // scripts viewer
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Column filters
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStrength, setFilterStrength] = useState('All');
  const [filterConcept, setFilterConcept] = useState('All');
  const [search, setSearch] = useState('');

  const getMsg   = (id: string) => messagingData.find(m => m.id === id)!;
  const getAngle = (id: string) => anglesData.find(a => a.id === id)!;
  const getICP   = (id: string) => icpData.find(i => i.id === id)!;
  const getHook  = (id: string) => hooksData.find(h => h.id === id)!;

  const configFor = (id: string): GenConfig => configs[id] ?? DEFAULT_CONFIG;
  const setConfig = (id: string, fn: (c: GenConfig) => GenConfig) =>
    setConfigs(prev => ({ ...prev, [id]: fn(configFor(id)) }));

  const dismissToast = useCallback((id: string) => setToasts(t => t.filter(x => x.id !== id)), []);

  const handleGenerate = (brief: AdBriefItem) => {
    const config = configFor(brief.id);
    setGenSteps(s => ({ ...s, [brief.id]: 'generating' }));
    setConfigModalId(null); // close modal immediately

    setTimeout(() => {
      const angle  = getAngle(brief.angleId);
      const msg    = getMsg(brief.messagingId);
      const icp    = getICP(brief.icpId);

      const generated: GeneratedScript[] = Array.from({ length: config.numVariations }, (_, i) => ({
        id: `script-${brief.id}-v${i + 1}`,
        version: i + 1,
        angleTitle: angle.title,
        duration: config.tone === 'Auto' ? '30s' : config.tone,
        tone: config.duration === 'Auto' ? 'Emotional' : config.duration,
        headline: [msg.headline, `${icp.segment.split('—')[0].trim()} — Meet Your Fix`, 'Stop the Madness. Start the Clarity.'][i % 3],
        hook: angle.hook.slice(0, 60) + '…',
        cta: msg.cta,
        scenes: [
          { num: 1, time: '0–5s',   description: `Opening hook: "${angle.hook.slice(0, 50)}..."` },
          { num: 2, time: '5–15s',  description: `Pain agitation — show ${icp.segment.split('—')[0].trim()} struggling` },
          { num: 3, time: '15–25s', description: 'Solution demo — product dashboard, key benefit highlighted' },
          { num: 4, time: `25–${config.tone === 'Auto' ? '30' : config.tone.replace('s', '')}s`, description: `CTA: "${msg.cta}" — brand lockup + URL` },
        ],
      }));

      setScripts(s => ({ ...s, [brief.id]: generated }));
      setGenSteps(s => ({ ...s, [brief.id]: 'done' }));
      setBriefs(prev => prev.map(b => b.id === brief.id ? { ...b, conceptsGenerated: true } : b));
      setGeneratedSet(prev => new Set([...prev, brief.id]));

      // Add toast
      const toastId = `toast-${Date.now()}`;
      setToasts(t => [...t, { id: toastId, briefId: brief.id, angleTitle: angle.title, count: config.numVariations }]);
      setTimeout(() => dismissToast(toastId), 5000);

      onConceptsGenerated([{
        id: `concept-gen-${brief.id}`, briefId: brief.id,
        title: `${angle.title} — ${brief.format} for ${icp.segment.split('—')[0].trim()}`,
        hook: angle.hook,
        body: `${msg.headline}\n\n${msg.valueProposition}`,
        cta: msg.cta, format: brief.format, platform: brief.platform, status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        variations: config.numVariations,
        visualDirection: `Target emotion: ${angle.targetEmotion}. Tone: ${msg.tone}.`,
      }]);
    }, 2200);
  };

  const priorityColor = (p: string) =>
    p === 'P0' ? 'bg-red-100 text-red-700' : p === 'P1' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500';
  const strengthDot = (s: string) =>
    s === 'Strong' ? 'bg-green-500' : s === 'Moderate' ? 'bg-yellow-400' : 'bg-red-400';

  const filteredBriefs = briefs.filter(b => {
    if (filterPriority !== 'All' && b.priority !== filterPriority) return false;
    if (filterStrength !== 'All' && b.strength !== filterStrength) return false;
    const hasConcept = generatedSet.has(b.id) || b.conceptsGenerated;
    if (filterConcept === 'Generated' && !hasConcept) return false;
    if (filterConcept === 'Pending'   &&  hasConcept) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const angle = getAngle(b.angleId);
      if (!angle.title.toLowerCase().includes(q) && !b.situation.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const activeFilters = [filterPriority, filterStrength, filterConcept].filter(v => v !== 'All').length;
  const configBrief = configModalId ? briefs.find(b => b.id === configModalId) : null;
  const drawerBrief = drawerBriefId  ? briefs.find(b => b.id === drawerBriefId)  : null;

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-5">
        {/* Sub-header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[12px] text-gray-500">
            {navHistory.length > 0 && (
              <button onClick={onBack} className="btn btn-secondary btn-xs flex items-center gap-1">
                <ChevronLeft size={12} /> Back
              </button>
            )}
            <span className="font-medium text-gray-700">{filteredBriefs.length} briefs</span>
            {activeFilters > 0 && (
              <span className="bg-blue-100 text-blue-600 text-[10.5px] font-semibold px-1.5 py-0.5 rounded-full">
                {activeFilters} filter{activeFilters > 1 ? 's' : ''}
              </span>
            )}
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search briefs…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-[12px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 w-40"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm text-[12px]">Strength ↓</button>
            <button className="btn btn-secondary btn-sm text-[12px]">Priority ↓</button>
            <button className="btn btn-primary btn-sm">+ Add Brief</button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="data-table w-full" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '36px' }} />
              <col style={{ width: '54px' }} />
              <col />
              <col style={{ width: '38%' }} />
              <col style={{ width: '78px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '88px' }} />
            </colgroup>
            <thead>
              <tr>
                <th />
                <th><span className="flex items-center gap-1">ID <ArrowUpDown size={10} className="text-gray-400 cursor-pointer" /></span></th>
                <th><span className="flex items-center gap-1.5">Angle <Tooltip content="The creative angle applied in this brief." /></span></th>
                <th><span className="flex items-center gap-1.5">Situation <Tooltip content="Real-life scenario framing why this message is relevant." /></span></th>
                <th><span className="flex items-center gap-1.5">Priority <Tooltip content="P0 = highest priority." /><ColFilter options={['P0','P1','P2']} value={filterPriority} onChange={setFilterPriority} /></span></th>
                <th><span className="flex items-center gap-1.5">Strength <Tooltip content="AI-assessed creative strength." /><ColFilter options={['Strong','Moderate','Weak']} value={filterStrength} onChange={setFilterStrength} /></span></th>
                <th><span className="flex items-center gap-1.5">Concepts <Tooltip content="Ad concepts generated from this brief." /><ColFilter options={['Generated','Pending']} value={filterConcept} onChange={setFilterConcept} /></span></th>
              </tr>
            </thead>
            <tbody>
              {filteredBriefs.map((brief, i) => {
                const angle = getAngle(brief.angleId);
                const isExpanded = expandedId === brief.id;
                const hasConcepts = generatedSet.has(brief.id) || brief.conceptsGenerated;
                const conceptNum = hasConcepts ? (brief.conceptCount || 1) : 0;
                const genStep = genSteps[brief.id] ?? 'idle';

                return (
                  <>
                    <tr key={brief.id}
                      onClick={() => setOverlayBriefId(brief.id)}
                      className={`cursor-pointer transition-colors ${overlayBriefId === brief.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : isExpanded ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}>
                      <td className="text-center" onClick={e => { e.stopPropagation(); setExpandedId(prev => prev === brief.id ? null : brief.id); }}>
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-gray-400 transition-transform duration-200 hover:bg-gray-100 ${isExpanded ? 'rotate-90 text-blue-500' : ''}`}>
                          <ChevronRight size={13} />
                        </span>
                      </td>
                      <td><span className="font-mono text-[11.5px] text-gray-500">AB{String(i+1).padStart(2,'0')}</span></td>
                      <td>
                        <div className="font-medium text-gray-900 text-[12.5px] truncate">{angle.title}</div>
                        <div className="text-[11px] text-gray-400 truncate mt-0.5">{angle.category}</div>
                      </td>
                      <td><div className="text-[12px] text-gray-500 truncate">{brief.situation}</div></td>
                      <td><span className={`badge text-[10.5px] font-bold ${priorityColor(brief.priority)}`}>{brief.priority}</span></td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${strengthDot(brief.strength)}`} />
                          <span className="text-[12px] text-gray-600">{brief.strength}</span>
                        </div>
                      </td>
                      <td>
                        {conceptNum > 0 ? (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-[13px] text-gray-800">{conceptNum}</span>
                            <CheckCircle2 size={12} className="text-green-500" />
                            <button className="btn btn-ghost btn-xs text-blue-600 p-0.5"
                              onClick={e => { e.stopPropagation(); onNavigate('concepts', ''); }}>
                              <Eye size={11} />
                            </button>
                          </div>
                        ) : (
                          genStep === 'generating'
                            ? <Loader2 size={13} className="animate-spin text-blue-400" />
                            : <span className="text-[12px] text-gray-400">—</span>
                        )}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${brief.id}-exp`}>
                        <td colSpan={7} className="p-0 border-b-2 border-blue-100">
                          <BriefDetail
                            brief={brief}
                            genStep={genStep}
                            scriptCount={scripts[brief.id]?.length ?? 0}
                            onNavigate={onNavigate}
                            getMsg={getMsg} getAngle={getAngle} getICP={getICP} getHook={getHook}
                            onOpenConfig={() => setConfigModalId(brief.id)}
                            onViewScripts={() => setDrawerBriefId(brief.id)}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-2 text-[11.5px] text-gray-400">
          <span>1–{filteredBriefs.length} of {briefs.length}</span>
          <span>Rows per page: 20</span>
        </div>
      </div>

      {/* ── Brief overlay (right panel) ── */}
      {overlayBriefId && (() => {
        const ob = briefs.find(b => b.id === overlayBriefId);
        if (!ob) return null;
        return (
          <>
            <div className="fixed inset-0 bg-black/10 z-30" onClick={() => setOverlayBriefId(null)} />
            <BriefOverlay
              brief={ob}
              genStep={genSteps[ob.id] ?? 'idle'}
              config={configFor(ob.id)}
              scripts={scripts[ob.id] ?? []}
              onConfigChange={fn => setConfig(ob.id, fn)}
              onGenerate={() => handleGenerate(ob)}
              onClose={() => setOverlayBriefId(null)}
              onNavigate={onNavigate}
              getMsg={getMsg} getAngle={getAngle} getICP={getICP} getHook={getHook}
            />
          </>
        );
      })()}

      {/* ── Config modal (popup) ── */}
      {configBrief && (
        <ConfigModal
          brief={configBrief}
          config={configFor(configBrief.id)}
          genStep={genSteps[configBrief.id] ?? 'idle'}
          onConfigChange={fn => setConfig(configBrief.id, fn)}
          onGenerate={() => handleGenerate(configBrief)}
          onClose={() => setConfigModalId(null)}
          getAngle={getAngle}
        />
      )}

      {/* ── Scripts drawer ── */}
      {drawerBrief && (
        <ScriptsDrawer
          brief={drawerBrief}
          scripts={scripts[drawerBrief.id] ?? []}
          onClose={() => setDrawerBriefId(null)}
          getAngle={getAngle}
        />
      )}

      {/* ── Toast notifications ── */}
      <ToastBar
        toasts={toasts}
        onView={id => setDrawerBriefId(id)}
        onDismiss={dismissToast}
      />
    </div>
  );
}

// ─── Brief Detail (inline expansion) ─────────────────────────────────────────
function BriefDetail({ brief, genStep, scriptCount, onNavigate, getMsg, getAngle, getICP, getHook, onOpenConfig, onViewScripts }: {
  brief: AdBriefItem;
  genStep: GenStep;
  scriptCount: number;
  onNavigate: (tab: string, id: string) => void;
  getMsg: (id: string) => any;
  getAngle: (id: string) => any;
  getICP: (id: string) => any;
  getHook: (id: string) => any;
  onOpenConfig: () => void;
  onViewScripts: () => void;
}) {
  const angle = getAngle(brief.angleId);
  const isDone = genStep === 'done';
  const isGenerating = genStep === 'generating';

  return (
    <div className="bg-gradient-to-b from-blue-50/50 to-white border-t border-blue-100 px-5 py-4">
      {/* 4-card grid */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {/* Angle */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Angle</div>
          <div className="font-semibold text-gray-900 text-[13px] leading-snug mb-1">{angle.title}</div>
          <div className="text-[11px] text-gray-400 mb-2">{angle.category}</div>
          {angle.hook && <div className="text-[11.5px] text-gray-500 italic leading-relaxed line-clamp-2 border-t border-gray-50 pt-2">"{angle.hook}"</div>}
        </div>

        {/* Situation */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Situation</div>
          <div className="text-[12.5px] text-gray-700 leading-relaxed mb-3">{brief.situation}</div>
          <div className="flex flex-wrap gap-1.5">
            {[brief.format, brief.platform, brief.duration].map(tag => (
              <span key={tag} className="text-[10.5px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{tag}</span>
            ))}
          </div>
        </div>

        {/* ICP & Messaging */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">ICP & Messaging</div>
          <div className="text-[10px] text-gray-400 font-medium mb-1">Audiences</div>
          {brief.icpIds.map(id => {
            const icp = getICP(id);
            return icp ? (
              <button key={id} onClick={() => onNavigate('icp', icp.id)}
                className="text-[11.5px] text-blue-600 hover:underline font-medium block truncate w-full text-left mb-0.5">
                {icp.segment.split('—')[0].trim()}
              </button>
            ) : null;
          })}
          <div className="text-[10px] text-gray-400 font-medium mt-2 mb-1">Messaging</div>
          {brief.messagingIds.map(id => {
            const msg = getMsg(id);
            return msg ? (
              <button key={id} onClick={() => onNavigate('messaging', msg.id)}
                className="text-[11.5px] text-blue-600 hover:underline text-left block truncate w-full mb-0.5">
                {msg.headline.split(' ').slice(0, 5).join(' ')}…
              </button>
            ) : null;
          })}
        </div>

        {/* Hooks */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Hooks</div>
          <div className="space-y-2">
            {brief.hookIds.map(id => {
              const h = getHook(id);
              return h ? (
                <div key={id} className="text-[11.5px] text-gray-600 leading-relaxed pb-2 border-b border-gray-50 last:border-b-0">
                  <span className="font-mono text-[10px] text-gray-400 mr-1">{id}</span>
                  "{h.text.slice(0, 55)}…"
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isDone && (
            <span className="text-[12px] text-green-600 font-medium flex items-center gap-1.5 bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg">
              <CheckCircle2 size={13} /> {scriptCount} script{scriptCount > 1 ? 's' : ''} ready
            </span>
          )}
          {isGenerating && (
            <span className="text-[12px] text-blue-600 font-medium flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
              <Loader2 size={12} className="animate-spin" /> Generating scripts…
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isDone && (
            <button onClick={onViewScripts}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all">
              <FileText size={13} /> View Scripts
            </button>
          )}
          <button onClick={onOpenConfig} disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: '#0f1c3f' }}>
            {isGenerating ? <><Loader2 size={13} className="animate-spin" /> Generating…</> : <><SlidersHorizontal size={13} /> {isDone ? 'Reconfigure' : 'Configure & Generate'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Brief Overlay (right slide panel) ───────────────────────────────────────
function BriefOverlay({ brief, genStep, config, scripts, onConfigChange, onGenerate, onClose, onNavigate, getMsg, getAngle, getICP, getHook }: {
  brief: AdBriefItem;
  genStep: GenStep;
  config: GenConfig;
  scripts: GeneratedScript[];
  onConfigChange: (fn: (c: GenConfig) => GenConfig) => void;
  onGenerate: () => void;
  onClose: () => void;
  onNavigate: (tab: string, id: string) => void;
  getMsg: (id: string) => any;
  getAngle: (id: string) => any;
  getICP: (id: string) => any;
  getHook: (id: string) => any;
}) {
  const angle = getAngle(brief.angleId);
  const isGenerating = genStep === 'generating';
  const isDone = genStep === 'done';
  const [expandedScript, setExpandedScript] = useState<string | null>(scripts[0]?.id ?? null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick}
      className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-all
        ${active ? 'bg-[#0f1c3f] border-[#0f1c3f] text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'}`}>
      {label}
    </button>
  );

  return (
    <div className="fixed top-0 right-0 h-full w-[540px] bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-[#0f1c3f] flex items-center justify-center flex-shrink-0">
          <FileText size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-[13px] truncate">{angle.title}</div>
          <div className="text-[10.5px] text-gray-400 mt-0.5">{angle.category} · {brief.format} · {brief.platform}</div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`badge text-[10px] font-bold px-2 py-0.5 rounded
            ${brief.priority === 'P0' ? 'bg-red-100 text-red-700' : brief.priority === 'P1' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
            {brief.priority}
          </span>
          <button onClick={onClose} className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center ml-1">
            <X size={13} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">

        {/* Brief details — 2×2 compact grid */}
        <div className="p-4 border-b border-gray-100">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Brief Details</div>
          <div className="grid grid-cols-2 gap-2">
            {/* Angle */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
              <div className="text-[9.5px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Angle</div>
              <div className="font-medium text-gray-900 text-[12px] leading-snug mb-1">{angle.title}</div>
              {angle.hook && <div className="text-[11px] text-gray-500 italic leading-relaxed line-clamp-2">"{angle.hook.slice(0, 70)}…"</div>}
            </div>
            {/* Situation */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
              <div className="text-[9.5px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Situation</div>
              <div className="text-[11.5px] text-gray-700 leading-relaxed mb-2">{brief.situation}</div>
              <div className="flex flex-wrap gap-1">
                {[brief.format, brief.platform, brief.duration].map(tag => (
                  <span key={tag} className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{tag}</span>
                ))}
              </div>
            </div>
            {/* ICP & Messaging */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
              <div className="text-[9.5px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">ICP & Messaging</div>
              <div className="text-[9.5px] text-gray-400 font-medium mb-1">Audiences</div>
              {brief.icpIds.map(id => {
                const icp = getICP(id);
                return icp ? (
                  <button key={id} onClick={() => onNavigate('icp', icp.id)}
                    className="text-[11px] text-blue-600 hover:underline font-medium block truncate w-full text-left">
                    {icp.segment.split('—')[0].trim()}
                  </button>
                ) : null;
              })}
              <div className="text-[9.5px] text-gray-400 font-medium mt-2 mb-1">Messaging</div>
              {brief.messagingIds.map(id => {
                const msg = getMsg(id);
                return msg ? (
                  <button key={id} onClick={() => onNavigate('messaging', msg.id)}
                    className="text-[11px] text-blue-600 hover:underline text-left block truncate w-full">
                    {msg.headline.split(' ').slice(0, 5).join(' ')}…
                  </button>
                ) : null;
              })}
            </div>
            {/* Hooks */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
              <div className="text-[9.5px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Hooks</div>
              <div className="space-y-1.5">
                {brief.hookIds.map(id => {
                  const h = getHook(id);
                  return h ? (
                    <div key={id} className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">
                      <span className="font-mono text-[9.5px] text-gray-400 mr-1">{id}</span>
                      "{h.text.slice(0, 50)}…"
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Script Configurator */}
        <div className="p-4 border-b border-gray-100">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Script Configuration</div>
          <div className="space-y-3">
            {/* Variation Mode */}
            <div>
              <div className="text-[11px] font-semibold text-gray-700 mb-1.5">Variation Mode</div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Tight', 'Moderate', 'Wide'] as const).map(v => (
                  <button key={v} onClick={() => onConfigChange(c => ({ ...c, variationMode: v }))}
                    className={`py-1.5 rounded-lg text-[11.5px] font-semibold border transition-all
                      ${config.variationMode === v ? 'bg-[#0f1c3f] border-[#0f1c3f] text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            {/* Scripts count */}
            <div>
              <div className="text-[11px] font-semibold text-gray-700 mb-1.5">Number of Scripts</div>
              <div className="flex items-center gap-3">
                <button onClick={() => onConfigChange(c => ({ ...c, numVariations: Math.max(1, c.numVariations - 1) }))}
                  className="w-7 h-7 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center">
                  <Minus size={12} className="text-gray-500" />
                </button>
                <span className="text-[22px] font-bold text-gray-900 w-8 text-center leading-none">{config.numVariations}</span>
                <button onClick={() => onConfigChange(c => ({ ...c, numVariations: Math.min(9, c.numVariations + 1) }))}
                  className="w-7 h-7 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center">
                  <Plus size={12} className="text-gray-500" />
                </button>
                <div className="flex gap-1 ml-auto">
                  {[1, 3, 5, 9].map(n => (
                    <button key={n} onClick={() => onConfigChange(c => ({ ...c, numVariations: n }))}
                      className={`w-6 h-6 rounded text-[10.5px] font-semibold border transition-all
                        ${config.numVariations === n ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Duration + Style */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] font-semibold text-gray-700 mb-1.5">Duration</div>
                <div className="flex flex-wrap gap-1">
                  {(['Auto', '15s', '30s', '45s', '60s'] as const).map(t => (
                    <Chip key={t} label={t} active={config.tone === t} onClick={() => onConfigChange(c => ({ ...c, tone: t }))} />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-gray-700 mb-1.5">Style</div>
                <div className="flex flex-wrap gap-1">
                  {(['Auto', 'Comedy', 'Emotional', 'Educational'] as const).map(d => (
                    <Chip key={d} label={d} active={config.duration === d} onClick={() => onConfigChange(c => ({ ...c, duration: d }))} />
                  ))}
                </div>
              </div>
            </div>
            {/* Language */}
            <div>
              <div className="text-[11px] font-semibold text-gray-700 mb-1.5">Language</div>
              <div className="flex flex-wrap gap-1">
                {(['Auto', 'English', 'Hindi', 'Kannada', 'Tamil'] as const).map(l => (
                  <Chip key={l} label={l} active={config.language === l} onClick={() => onConfigChange(c => ({ ...c, language: l }))} />
                ))}
              </div>
            </div>
            {/* Prompt */}
            <div>
              <div className="text-[11px] font-semibold text-gray-700 mb-1.5">Additional Direction <span className="text-gray-400 font-normal">(optional)</span></div>
              <textarea className="field resize-none text-[11.5px] w-full" rows={2}
                placeholder="Any extra creative direction…"
                value={config.prompt}
                onChange={e => onConfigChange(c => ({ ...c, prompt: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Generated Scripts */}
        {(isDone || isGenerating) && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Generated Scripts</div>
              {isDone && <span className="text-[11px] text-green-600 font-medium flex items-center gap-1"><CheckCircle2 size={11} /> {scripts.length} ready</span>}
            </div>
            {isGenerating ? (
              <div className="flex items-center justify-center py-8 text-[12px] text-blue-500">
                <Loader2 size={16} className="animate-spin mr-2" /> Generating scripts…
              </div>
            ) : (
              <div className="space-y-2">
                {scripts.map(script => {
                  const isOpen = expandedScript === script.id;
                  return (
                    <div key={script.id} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                      <button onClick={() => setExpandedScript(isOpen ? null : script.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 transition-colors text-left">
                        <div className="w-7 h-7 rounded-lg bg-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-600 flex-shrink-0">
                          V{script.version}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-semibold text-gray-800 truncate">{script.headline}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{script.duration}</span>
                            <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-medium">{script.tone}</span>
                          </div>
                        </div>
                        {isOpen ? <ChevronUp size={12} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={12} className="text-gray-400 flex-shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="border-t border-gray-200 px-3 pb-3 pt-2 space-y-2 bg-white">
                          <div className="grid grid-cols-2 gap-2">
                            {[{ label: 'Hook', value: script.hook }, { label: 'CTA', value: script.cta }].map(({ label, value }) => (
                              <div key={label} className="bg-gray-50 rounded-lg p-2">
                                <div className="text-[9.5px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</div>
                                <div className="text-[11px] text-gray-800 leading-snug">{value}</div>
                              </div>
                            ))}
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <div className="text-[9.5px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Scene Breakdown</div>
                            <div className="space-y-1.5">
                              {script.scenes.map(s => (
                                <div key={s.num} className="flex gap-2">
                                  <span className="font-mono text-[10px] text-gray-400 flex-shrink-0 w-10 mt-0.5">{s.time}</span>
                                  <span className="text-[11px] text-gray-600 leading-snug">{s.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky footer — Generate button */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-gray-50">
        <button onClick={onGenerate} disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-60"
          style={{ background: '#0f1c3f' }}>
          {isGenerating
            ? <><Loader2 size={14} className="animate-spin" /> Generating…</>
            : <><Play size={13} /> {isDone ? 'Regenerate' : 'Generate'} {config.numVariations} Script{config.numVariations > 1 ? 's' : ''}</>
          }
        </button>
      </div>
    </div>
  );
}

// ─── Config Modal (popup) ─────────────────────────────────────────────────────
function ConfigModal({ brief, config, genStep, onConfigChange, onGenerate, onClose, getAngle }: {
  brief: AdBriefItem;
  config: GenConfig;
  genStep: GenStep;
  onConfigChange: (fn: (c: GenConfig) => GenConfig) => void;
  onGenerate: () => void;
  onClose: () => void;
  getAngle: (id: string) => any;
}) {
  const angle = getAngle(brief.angleId);
  const isGenerating = genStep === 'generating';

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-[12px] font-medium border transition-all
        ${active ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'}`}>
      {label}
    </button>
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40" onClick={onClose} />
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px] overflow-hidden pointer-events-auto">

          {/* Modal header */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <div className="font-semibold text-gray-900 text-[15px]">Script Configuration</div>
              <div className="text-[12px] text-gray-400 mt-0.5">{angle.title}</div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors mt-0.5">
              <X size={14} className="text-gray-400" />
            </button>
          </div>

          {/* Config body */}
          <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">

            {/* Variation Mode */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[12px] font-semibold text-gray-700">Variation Mode</div>
                <div className="text-[11px] text-gray-400">
                  {config.variationMode === 'Tight' && 'Minor tweaks, same core message'}
                  {config.variationMode === 'Moderate' && 'Different angles on same theme'}
                  {config.variationMode === 'Wide' && 'Significantly different approaches'}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['Tight', 'Moderate', 'Wide'] as const).map(v => (
                  <button key={v}
                    onClick={() => onConfigChange(c => ({ ...c, variationMode: v }))}
                    className={`py-2.5 rounded-xl text-[12.5px] font-semibold border transition-all
                      ${config.variationMode === v ? 'bg-[#0f1c3f] border-[#0f1c3f] text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of scripts */}
            <div>
              <div className="text-[12px] font-semibold text-gray-700 mb-3">Number of Scripts</div>
              <div className="flex items-center gap-4">
                <button onClick={() => onConfigChange(c => ({ ...c, numVariations: Math.max(1, c.numVariations - 1) }))}
                  className="w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <Minus size={14} className="text-gray-500" />
                </button>
                <div className="text-[28px] font-bold text-gray-900 w-10 text-center leading-none">{config.numVariations}</div>
                <button onClick={() => onConfigChange(c => ({ ...c, numVariations: Math.min(9, c.numVariations + 1) }))}
                  className="w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <Plus size={14} className="text-gray-500" />
                </button>
                <span className="text-[12px] text-gray-400">of 9 max</span>

                {/* Quick pick */}
                <div className="flex gap-1.5 ml-auto">
                  {[1, 3, 5, 9].map(n => (
                    <button key={n} onClick={() => onConfigChange(c => ({ ...c, numVariations: n }))}
                      className={`w-7 h-7 rounded-lg text-[11.5px] font-semibold border transition-all
                        ${config.numVariations === n ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Duration + Style */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <div className="text-[12px] font-semibold text-gray-700 mb-2">Duration</div>
                <div className="flex flex-wrap gap-1.5">
                  {(['Auto', '15s', '30s', '45s', '60s'] as const).map(t => (
                    <Chip key={t} label={t} active={config.tone === t} onClick={() => onConfigChange(c => ({ ...c, tone: t }))} />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[12px] font-semibold text-gray-700 mb-2">Style</div>
                <div className="flex flex-wrap gap-1.5">
                  {(['Auto', 'Comedy', 'Emotional', 'Educational'] as const).map(d => (
                    <Chip key={d} label={d} active={config.duration === d} onClick={() => onConfigChange(c => ({ ...c, duration: d }))} />
                  ))}
                </div>
              </div>
            </div>

            {/* Language */}
            <div>
              <div className="text-[12px] font-semibold text-gray-700 mb-2">Language</div>
              <div className="flex flex-wrap gap-1.5">
                {(['Auto', 'English', 'Hindi', 'Kannada', 'Tamil'] as const).map(l => (
                  <Chip key={l} label={l} active={config.language === l} onClick={() => onConfigChange(c => ({ ...c, language: l }))} />
                ))}
              </div>
            </div>

            {/* Additional direction */}
            <div>
              <div className="text-[12px] font-semibold text-gray-700 mb-2">Additional Direction <span className="text-gray-400 font-normal">(optional)</span></div>
              <textarea className="field resize-none text-[12.5px] w-full" rows={3}
                placeholder="Any extra creative direction or constraints…"
                value={config.prompt}
                onChange={e => onConfigChange(c => ({ ...c, prompt: e.target.value }))} />
            </div>
          </div>

          {/* Modal footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <button onClick={onClose} className="btn btn-secondary btn-sm">Cancel</button>
            <button onClick={onGenerate} disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: '#0f1c3f' }}>
              {isGenerating
                ? <><Loader2 size={14} className="animate-spin" /> Generating…</>
                : <><Play size={13} /> Generate {config.numVariations} Script{config.numVariations > 1 ? 's' : ''}</>
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Scripts Drawer ───────────────────────────────────────────────────────────
function ScriptsDrawer({ brief, scripts, onClose, getAngle }: {
  brief: AdBriefItem;
  scripts: GeneratedScript[];
  onClose: () => void;
  getAngle: (id: string) => any;
}) {
  const angle = getAngle(brief.angleId);
  const [filterDuration, setFilterDuration] = useState('All');
  const [filterStyle, setFilterStyle] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(scripts[0]?.id ?? null);

  const durations = [...new Set(scripts.map(s => s.duration))];
  const styles    = [...new Set(scripts.map(s => s.tone))];

  const filtered = scripts.filter(s => {
    if (filterDuration !== 'All' && s.duration !== filterDuration) return false;
    if (filterStyle    !== 'All' && s.tone     !== filterStyle)    return false;
    return true;
  });

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-30" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[460px] bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col">

        {/* Drawer header */}
        <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold text-gray-900 text-[14px]">Generated Scripts</div>
              <div className="text-[11.5px] text-gray-400 mt-0.5">{angle.title}</div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
              <X size={15} className="text-gray-500" />
            </button>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-gray-400 font-medium">Filter:</span>
            {/* Duration filter */}
            <div className="flex items-center gap-1">
              {['All', ...durations].map(d => (
                <button key={d} onClick={() => setFilterDuration(d)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-all
                    ${filterDuration === d ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                  {d}
                </button>
              ))}
            </div>
            <div className="w-px h-4 bg-gray-200" />
            {/* Style filter */}
            <div className="flex items-center gap-1">
              {['All', ...styles].map(s => (
                <button key={s} onClick={() => setFilterStyle(s)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-all
                    ${filterStyle === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                  {s}
                </button>
              ))}
            </div>
            <span className="ml-auto text-[11px] text-gray-400">{filtered.length}/{scripts.length}</span>
          </div>
        </div>

        {/* Scripts list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-gray-50">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[12px] text-gray-400">No scripts match the current filters.</div>
          )}
          {filtered.map(script => {
            const isOpen = expandedId === script.id;
            return (
              <div key={script.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <button onClick={() => setExpandedId(isOpen ? null : script.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-[12px] font-bold text-gray-600 flex-shrink-0">
                    V{script.version}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-gray-800 truncate">{script.headline}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10.5px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{script.duration}</span>
                      <span className="text-[10.5px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-medium">{script.tone}</span>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[{ label: 'Hook', value: script.hook }, { label: 'CTA', value: script.cta }].map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 rounded-lg p-3">
                          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</div>
                          <div className="text-[12px] text-gray-800 leading-snug">{value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Scene Breakdown</div>
                      <div className="space-y-2">
                        {script.scenes.map(s => (
                          <div key={s.num} className="flex gap-2.5">
                            <span className="font-mono text-[10.5px] text-gray-400 flex-shrink-0 w-11 mt-0.5">{s.time}</span>
                            <span className="text-[11.5px] text-gray-600 leading-snug">{s.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── Toast bar ────────────────────────────────────────────────────────────────
function ToastBar({ toasts, onView, onDismiss }: {
  toasts: Toast[];
  onView: (briefId: string) => void;
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id}
          className="flex items-center gap-3 bg-gray-900 text-white pl-4 pr-2 py-3 rounded-2xl shadow-2xl min-w-[320px]"
          style={{ animation: 'slideUp 0.2s ease' }}>
          <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCheck size={15} className="text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold">{t.count} script{t.count > 1 ? 's' : ''} generated</div>
            <div className="text-[11px] text-gray-400 truncate">{t.angleTitle}</div>
          </div>
          <button onClick={() => { onView(t.briefId); onDismiss(t.id); }}
            className="text-[12px] font-semibold text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0">
            View →
          </button>
          <button onClick={() => onDismiss(t.id)}
            className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0">
            <X size={12} className="text-gray-400" />
          </button>
        </div>
      ))}
    </div>
  );
}
