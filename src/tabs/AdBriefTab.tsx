import { useState, useRef, useEffect } from 'react';
import { adBriefData, messagingData, anglesData, icpData, hooksData, adConceptsData } from '../data/mockData';
import type { AdBriefItem, AdConceptItem, GeneratedScript } from '../data/mockData';
import { Tooltip } from '../components/Tooltip';
import {
  ChevronLeft, ChevronRight, Loader2, CheckCircle2,
  ArrowUpDown, Eye, Plus, Minus, Wand2, FileText,
  ChevronDown, ChevronUp, Sparkles, X, Filter,
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

const DEFAULT_CONFIG: GenConfig = {
  variationMode: 'Tight',
  numVariations: 1,
  duration: 'Emotional',
  tone: '30s',
  language: 'English',
  prompt: '',
};

// ── Dropdown filter component ─────────────────────────────────────
function FilterDropdown({
  label, options, value, onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = value !== 'All';

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className={`flex items-center gap-0.5 rounded transition-colors ${
          isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <Filter size={10} className={isActive ? 'text-blue-500' : ''} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[110px] py-1">
          {['All', ...options].map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-50 transition-colors
                ${value === opt ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-700'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdBriefTab({ onNavigate, navHistory, onBack, onConceptsGenerated }: Props) {
  const [briefs, setBriefs] = useState(adBriefData);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [configs, setConfigs] = useState<Record<string, GenConfig>>({});
  const [genSteps, setGenSteps] = useState<Record<string, GenStep>>({});
  const [scripts, setScripts] = useState<Record<string, GeneratedScript[]>>({});
  const [expandedScript, setExpandedScript] = useState<string | null>(null);
  const [generatedSet, setGeneratedSet] = useState<Set<string>>(
    new Set(adConceptsData.map(c => c.briefId))
  );
  // Drawer state — which brief is open in the generator drawer
  const [drawerBriefId, setDrawerBriefId] = useState<string | null>(null);

  // Column filters
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStrength, setFilterStrength] = useState('All');
  const [filterConcept, setFilterConcept] = useState('All');

  const getMsg = (id: string) => messagingData.find(m => m.id === id)!;
  const getAngle = (id: string) => anglesData.find(a => a.id === id)!;
  const getICP = (id: string) => icpData.find(i => i.id === id)!;
  const getHook = (id: string) => hooksData.find(h => h.id === id)!;

  const configFor = (id: string): GenConfig => configs[id] ?? DEFAULT_CONFIG;
  const setConfig = (id: string, fn: (c: GenConfig) => GenConfig) =>
    setConfigs(prev => ({ ...prev, [id]: fn(configFor(id)) }));

  const toggleExpand = (id: string) =>
    setExpandedId(prev => (prev === id ? null : id));

  const handleGenerate = (brief: AdBriefItem) => {
    const config = configFor(brief.id);
    setGenSteps(s => ({ ...s, [brief.id]: 'generating' }));

    setTimeout(() => {
      const angle = getAngle(brief.angleId);
      const msg = getMsg(brief.messagingId);
      const icp = getICP(brief.icpId);

      const generated: GeneratedScript[] = Array.from({ length: config.numVariations }, (_, i) => ({
        id: `script-${brief.id}-v${i + 1}`,
        version: i + 1,
        angleTitle: angle.title,
        duration: config.tone === 'Auto' ? '30s' : config.tone,
        tone: config.duration === 'Auto' ? 'Emotional' : config.duration,
        headline: [
          msg.headline,
          `${icp.segment.split('—')[0].trim()} — Meet Your Analytics Fix`,
          'Stop the Madness. Start the Clarity.',
        ][i % 3],
        hook: angle.hook.slice(0, 60) + '…',
        cta: msg.cta,
        scenes: [
          { num: 1, time: '0–5s', description: `Opening hook: "${angle.hook.slice(0, 50)}..."` },
          { num: 2, time: '5–15s', description: `Pain agitation — show ${icp.segment.split('—')[0].trim()} struggling with the problem` },
          { num: 3, time: '15–25s', description: `Solution demo — product dashboard, key benefit highlighted` },
          { num: 4, time: `25–${config.tone === 'Auto' ? '30' : config.tone.replace('s', '')}s`, description: `CTA: "${msg.cta}" — brand lockup + URL` },
        ],
      }));

      setScripts(s => ({ ...s, [brief.id]: generated }));
      setGenSteps(s => ({ ...s, [brief.id]: 'done' }));
      setExpandedScript(generated[0]?.id ?? null);
      setBriefs(prev => prev.map(b => b.id === brief.id ? { ...b, conceptsGenerated: true } : b));
      setGeneratedSet(prev => new Set([...prev, brief.id]));

      const newConcept: AdConceptItem = {
        id: `concept-gen-${brief.id}`,
        briefId: brief.id,
        title: `${angle.title} — ${brief.format} for ${icp.segment.split('—')[0].trim()}`,
        hook: angle.hook,
        body: `Creative concept targeting ${icp.segment}.\n\nMessaging: ${msg.headline}\n\n${msg.valueProposition}\n\nDelivered via ${brief.format} on ${brief.platform} (${brief.duration}).`,
        cta: msg.cta,
        format: brief.format,
        platform: brief.platform,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        variations: config.numVariations,
        visualDirection: `Target emotion: ${angle.targetEmotion}. Tone: ${msg.tone}. Audience: ${icp.demographics}.`,
      };
      onConceptsGenerated([newConcept]);
    }, 2000);
  };

  const priorityColor = (p: string) =>
    p === 'P0' ? 'bg-red-100 text-red-700' : p === 'P1' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500';
  const strengthDot = (s: string) =>
    s === 'Strong' ? 'bg-green-500' : s === 'Moderate' ? 'bg-yellow-500' : 'bg-red-400';

  // Apply filters
  const filteredBriefs = briefs.filter(b => {
    if (filterPriority !== 'All' && b.priority !== filterPriority) return false;
    if (filterStrength !== 'All' && b.strength !== filterStrength) return false;
    if (filterConcept === 'Generated' && !(generatedSet.has(b.id) || b.conceptsGenerated)) return false;
    if (filterConcept === 'Pending' && (generatedSet.has(b.id) || b.conceptsGenerated)) return false;
    return true;
  });

  const activeFilterCount = [filterPriority, filterStrength, filterConcept].filter(v => v !== 'All').length;
  const drawerBrief = drawerBriefId ? briefs.find(b => b.id === drawerBriefId) : null;

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
            {activeFilterCount > 0 && (
              <span className="bg-blue-100 text-blue-600 text-[10.5px] font-semibold px-1.5 py-0.5 rounded-full">
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
              </span>
            )}
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
              <col style={{ width: '56px' }} />
              <col />
              <col style={{ width: '38%' }} />
              <col style={{ width: '64px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '88px' }} />
            </colgroup>
            <thead>
              <tr>
                <th></th>
                <th>
                  <span className="flex items-center gap-1">ID
                    <ArrowUpDown size={10} className="text-gray-400 cursor-pointer" />
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1.5">
                    Angle <Tooltip content="The creative angle applied in this brief." />
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1.5">
                    Situation <Tooltip content="Real-life scenario framing why this message is relevant." />
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1.5">
                    Priority <Tooltip content="P0 = highest priority." />
                    <FilterDropdown
                      label="Priority"
                      options={['P0', 'P1', 'P2']}
                      value={filterPriority}
                      onChange={setFilterPriority}
                    />
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1.5">
                    Strength <Tooltip content="AI-assessed creative strength." />
                    <FilterDropdown
                      label="Strength"
                      options={['Strong', 'Moderate', 'Weak']}
                      value={filterStrength}
                      onChange={setFilterStrength}
                    />
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1.5">
                    Concepts <Tooltip content="Ad concepts generated from this brief." />
                    <FilterDropdown
                      label="Concepts"
                      options={['Generated', 'Pending']}
                      value={filterConcept}
                      onChange={setFilterConcept}
                    />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBriefs.map((brief, i) => {
                const angle = getAngle(brief.angleId);
                const isExpanded = expandedId === brief.id;
                const hasConceptsNow = generatedSet.has(brief.id) || brief.conceptsGenerated;
                const conceptNum = hasConceptsNow ? (brief.conceptCount || 1) : 0;

                return (
                  <>
                    {/* Main row */}
                    <tr
                      key={brief.id}
                      onClick={() => toggleExpand(brief.id)}
                      className={`cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="text-center">
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-blue-500' : ''}`}>
                          <ChevronRight size={13} />
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-[11.5px] text-gray-500">
                          AB{String(i + 1).padStart(2, '0')}
                        </span>
                      </td>
                      <td>
                        <div className="font-medium text-gray-900 text-[12.5px] truncate">{angle.title}</div>
                        <div className="text-[11px] text-gray-400 truncate mt-0.5">{angle.category}</div>
                      </td>
                      <td>
                        <div className="text-[12px] text-gray-500 truncate">{brief.situation}</div>
                      </td>
                      <td>
                        <span className={`badge text-[10.5px] font-bold ${priorityColor(brief.priority)}`}>
                          {brief.priority}
                        </span>
                      </td>
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
                              onClick={(e) => { e.stopPropagation(); onNavigate('concepts', ''); }}>
                              <Eye size={11} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[12px] text-gray-400">—</span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded inline detail */}
                    {isExpanded && (
                      <tr key={`${brief.id}-expand`}>
                        <td colSpan={7} className="p-0 border-b-2 border-blue-200">
                          <BriefDetail
                            brief={brief}
                            onNavigate={onNavigate}
                            getMsg={getMsg}
                            getAngle={getAngle}
                            getICP={getICP}
                            getHook={getHook}
                            hasScripts={genSteps[brief.id] === 'done'}
                            scriptCount={scripts[brief.id]?.length ?? 0}
                            onOpenGenerator={() => setDrawerBriefId(brief.id)}
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

      {/* ── Script Generator Drawer ── */}
      {drawerBrief && (
        <ScriptGeneratorDrawer
          brief={drawerBrief}
          config={configFor(drawerBrief.id)}
          genStep={genSteps[drawerBrief.id] ?? 'idle'}
          scripts={scripts[drawerBrief.id] ?? []}
          expandedScript={expandedScript}
          setExpandedScript={setExpandedScript}
          onConfigChange={(fn) => setConfig(drawerBrief.id, fn)}
          onGenerate={() => handleGenerate(drawerBrief)}
          onClose={() => setDrawerBriefId(null)}
          getAngle={getAngle}
        />
      )}
    </div>
  );
}

// ─── Brief detail expansion (read-only) ──────────────────────────────────────

function BriefDetail({
  brief, onNavigate, getMsg, getAngle, getICP, getHook, hasScripts, scriptCount, onOpenGenerator,
}: {
  brief: AdBriefItem;
  onNavigate: (tab: string, id: string) => void;
  getMsg: (id: string) => any;
  getAngle: (id: string) => any;
  getICP: (id: string) => any;
  getHook: (id: string) => any;
  hasScripts: boolean;
  scriptCount: number;
  onOpenGenerator: () => void;
}) {
  const angle = getAngle(brief.angleId);

  return (
    <div className="bg-gradient-to-b from-blue-50/60 to-white border-t border-blue-100 px-5 py-4">
      <div className="grid grid-cols-4 gap-4 mb-4">

        {/* Card 1: Angle */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Angle</div>
          <div className="font-semibold text-gray-900 text-[13px] leading-snug mb-1">{angle.title}</div>
          <div className="text-[11px] text-gray-400">{angle.category}</div>
          {angle.hook && (
            <div className="mt-2 text-[11.5px] text-gray-500 italic leading-relaxed line-clamp-2 border-t border-gray-50 pt-2">
              "{angle.hook}"
            </div>
          )}
        </div>

        {/* Card 2: Situation */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Situation</div>
          <div className="text-[12.5px] text-gray-700 leading-relaxed">{brief.situation}</div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-[10.5px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{brief.format}</span>
            <span className="text-[10.5px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{brief.platform}</span>
            <span className="text-[10.5px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{brief.duration}</span>
          </div>
        </div>

        {/* Card 3: ICP & Messaging */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">ICP & Messaging</div>
          <div className="space-y-2.5">
            <div>
              <div className="text-[10px] text-gray-400 font-medium mb-1">Target Audiences</div>
              {brief.icpIds.map(id => {
                const icp = getICP(id);
                return icp ? (
                  <button key={id} onClick={() => onNavigate('icp', icp.id)}
                    className="text-[11.5px] text-blue-600 hover:underline font-medium block truncate w-full text-left">
                    {icp.segment.split('—')[0].trim()}
                  </button>
                ) : null;
              })}
            </div>
            <div className="border-t border-gray-50 pt-2">
              <div className="text-[10px] text-gray-400 font-medium mb-1">Messaging Pillars</div>
              {brief.messagingIds.map(id => {
                const msg = getMsg(id);
                return msg ? (
                  <button key={id} onClick={() => onNavigate('messaging', msg.id)}
                    className="text-[11.5px] text-blue-600 hover:underline text-left block truncate w-full">
                    {msg.headline.split(' ').slice(0, 5).join(' ')}…
                  </button>
                ) : null;
              })}
            </div>
          </div>
        </div>

        {/* Card 4: Hooks */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Hooks</div>
          <div className="space-y-2">
            {brief.hookIds.map(id => {
              const h = getHook(id);
              return h ? (
                <div key={id} className="text-[11.5px] text-gray-600 leading-relaxed line-clamp-2 pb-2 border-b border-gray-50 last:border-b-0">
                  <span className="font-mono text-[10px] text-gray-400 mr-1">{id}</span>
                  "{h.text.slice(0, 60)}…"
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center justify-end gap-3">
        {hasScripts && (
          <span className="text-[12px] text-green-600 font-medium flex items-center gap-1">
            <CheckCircle2 size={13} /> {scriptCount} script{scriptCount > 1 ? 's' : ''} generated
          </span>
        )}
        <button
          onClick={onOpenGenerator}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold text-white transition-all"
          style={{ background: '#0f1c3f' }}
        >
          <Sparkles size={13} />
          {hasScripts ? 'View & Regenerate Scripts' : 'Generate Scripts'}
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Script Generator Drawer ──────────────────────────────────────────────────

function ScriptGeneratorDrawer({
  brief, config, genStep, scripts, expandedScript, setExpandedScript,
  onConfigChange, onGenerate, onClose, getAngle,
}: {
  brief: AdBriefItem;
  config: GenConfig;
  genStep: GenStep;
  scripts: GeneratedScript[];
  expandedScript: string | null;
  setExpandedScript: (id: string | null) => void;
  onConfigChange: (fn: (c: GenConfig) => GenConfig) => void;
  onGenerate: () => void;
  onClose: () => void;
  getAngle: (id: string) => any;
}) {
  const angle = getAngle(brief.angleId);
  const isDone = genStep === 'done';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-30 backdrop-blur-[1px]"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[440px] bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col overflow-hidden">

        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <div>
            <div className="font-semibold text-gray-900 text-[13.5px]">Script Generator</div>
            <div className="text-[11.5px] text-gray-400 mt-0.5">{angle.title}</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable config + results */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Variation Mode */}
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Variation Mode</div>
            <div className="grid grid-cols-3 gap-2">
              {(['Tight', 'Moderate', 'Wide'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => onConfigChange(c => ({ ...c, variationMode: v }))}
                  className={`py-2 rounded-xl text-[12px] font-medium border transition-all
                    ${config.variationMode === v
                      ? 'bg-[#0f1c3f] border-[#0f1c3f] text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-gray-400 mt-1.5">
              {config.variationMode === 'Tight' && 'Minor headline/hook tweaks — same core message'}
              {config.variationMode === 'Moderate' && 'Different angles on the same theme'}
              {config.variationMode === 'Wide' && 'Significantly different approaches & formats'}
            </div>
          </div>

          {/* Variations count */}
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Number of Scripts</div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onConfigChange(c => ({ ...c, numVariations: Math.max(1, c.numVariations - 1) }))}
                className="w-8 h-8 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Minus size={13} className="text-gray-500" />
              </button>
              <div className="text-[22px] font-bold text-gray-900 w-8 text-center leading-none">
                {config.numVariations}
              </div>
              <button
                onClick={() => onConfigChange(c => ({ ...c, numVariations: Math.min(9, c.numVariations + 1) }))}
                className="w-8 h-8 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Plus size={13} className="text-gray-500" />
              </button>
              <span className="text-[11.5px] text-gray-400">of 9 max</span>
            </div>
          </div>

          {/* Duration + Style side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Duration</div>
              <div className="flex flex-wrap gap-1.5">
                {(['Auto', '15s', '30s', '45s', '60s'] as const).map(t => (
                  <button key={t}
                    onClick={() => onConfigChange(c => ({ ...c, tone: t }))}
                    className={`px-2.5 py-1 rounded-lg text-[11.5px] font-medium border transition-all
                      ${config.tone === t ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}
                  >{t}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Style</div>
              <div className="flex flex-wrap gap-1.5">
                {(['Auto', 'Comedy', 'Emotional', 'Educational'] as const).map(d => (
                  <button key={d}
                    onClick={() => onConfigChange(c => ({ ...c, duration: d }))}
                    className={`px-2.5 py-1 rounded-lg text-[11.5px] font-medium border transition-all
                      ${config.duration === d ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}
                  >{d}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Language */}
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Language</div>
            <div className="flex flex-wrap gap-1.5">
              {(['Auto', 'English', 'Hindi', 'Kannada', 'Tamil'] as const).map(l => (
                <button key={l}
                  onClick={() => onConfigChange(c => ({ ...c, language: l }))}
                  className={`px-3 py-1 rounded-lg text-[11.5px] font-medium border transition-all
                    ${config.language === l ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}
                >{l}</button>
              ))}
            </div>
          </div>

          {/* Additional Direction */}
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Additional Direction</div>
            <textarea
              className="field resize-none text-[12.5px] w-full"
              rows={3}
              placeholder="Any extra creative direction or constraints…"
              value={config.prompt}
              onChange={e => onConfigChange(c => ({ ...c, prompt: e.target.value }))}
            />
          </div>

          {/* Generated scripts */}
          {isDone && scripts.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                <FileText size={12} /> Generated Scripts
                <span className="bg-green-100 text-green-700 text-[10.5px] font-bold px-1.5 py-0.5 rounded-full ml-auto">
                  {scripts.length} ready
                </span>
              </div>
              <div className="space-y-2">
                {scripts.map(script => {
                  const isOpen = expandedScript === script.id;
                  return (
                    <div key={script.id} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left"
                        onClick={() => setExpandedScript(isOpen ? null : script.id)}
                      >
                        <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-600 flex-shrink-0">
                          V{script.version}
                        </div>
                        <span className="text-[12.5px] font-medium text-gray-800 flex-1 truncate">
                          {script.headline}
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="badge badge-gray text-[10px]">{script.duration}</span>
                          {isOpen ? <ChevronUp size={12} className="text-gray-400" /> : <ChevronDown size={12} className="text-gray-400" />}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                          {[{ label: 'Hook', value: script.hook }, { label: 'CTA', value: script.cta }].map(({ label, value }) => (
                            <div key={label}>
                              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
                              <div className="text-[12px] text-gray-800 leading-snug">{value}</div>
                            </div>
                          ))}
                          <div>
                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Scene Breakdown</div>
                            <div className="space-y-1.5">
                              {script.scenes.map(s => (
                                <div key={s.num} className="flex gap-2 text-[11.5px]">
                                  <span className="font-mono text-[10px] text-gray-400 flex-shrink-0 mt-0.5 w-10">{s.time}</span>
                                  <span className="text-gray-600 leading-snug">{s.description}</span>
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
          )}
        </div>

        {/* Sticky generate button */}
        <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
          <button
            onClick={onGenerate}
            disabled={genStep === 'generating'}
            className="w-full py-3 rounded-xl text-[13.5px] font-semibold text-white flex items-center justify-center gap-2 transition-all"
            style={{ background: genStep === 'generating' ? '#6b7280' : '#0f1c3f' }}
          >
            {genStep === 'generating' ? (
              <><Loader2 size={15} className="animate-spin" /> Generating {config.numVariations} script{config.numVariations > 1 ? 's' : ''}…</>
            ) : isDone ? (
              <><Wand2 size={15} /> Regenerate {config.numVariations} Script{config.numVariations > 1 ? 's' : ''}</>
            ) : (
              <><Wand2 size={15} /> Generate {config.numVariations} Script{config.numVariations > 1 ? 's' : ''}</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
