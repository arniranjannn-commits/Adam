import { useState } from 'react';
import { adBriefData, messagingData, anglesData, icpData, hooksData, adConceptsData } from '../data/mockData';
import type { AdBriefItem, AdConceptItem, GeneratedScript } from '../data/mockData';
import { Tooltip } from '../components/Tooltip';
import {
  ChevronLeft, ChevronRight, Loader2, CheckCircle2,
  ArrowUpDown, Eye, Plus, Minus, Wand2, FileText,
  ChevronDown, ChevronUp,
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
  duration: 'AI' | 'Comedy' | 'Emotional' | 'Educational';
  tone: 'AI' | '15s' | '30s' | '45s' | '60s';
  language: 'AI' | 'English' | 'Hindi' | 'Kannada' | 'Tamil';
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
        duration: config.tone === 'AI' ? '30s' : config.tone,
        tone: config.duration === 'AI' ? 'Emotional' : config.duration,
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
          { num: 4, time: `25–${config.tone === 'AI' ? '30' : config.tone.replace('s', '')}s`, description: `CTA: "${msg.cta}" — brand lockup + URL` },
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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-5">
        {/* Sub-header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[12px] text-gray-500">
            {navHistory.length > 0 && (
              <button onClick={onBack} className="btn btn-secondary btn-xs flex items-center gap-1">
                <ChevronLeft size={12} /> Back
              </button>
            )}
            <span>{briefs.length} briefs</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm text-[12px]">Strength ↓</button>
            <button className="btn btn-secondary btn-sm text-[12px]">Priority ↓</button>
            <button className="btn btn-primary btn-sm">+ Add Brief</button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200">
          <table className="data-table w-full" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '36px' }} />
              <col style={{ width: '56px' }} />
              <col />
              <col style={{ width: '40%' }} />
              <col style={{ width: '52px' }} />
              <col style={{ width: '88px' }} />
              <col style={{ width: '80px' }} />
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
                  <span className="flex items-center gap-1">
                    Angle <Tooltip content="The creative angle applied in this brief." />
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    Situation <Tooltip content="Real-life scenario framing why this message is relevant." />
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    Pri <Tooltip content="P0 = highest priority." />
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    Strength <Tooltip content="AI-assessed creative strength." />
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    Concept <Tooltip content="Ad concepts generated from this brief." />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {briefs.map((brief, i) => {
                const angle = getAngle(brief.angleId);
                const isExpanded = expandedId === brief.id;
                const hasConceptsNow = generatedSet.has(brief.id) || brief.conceptsGenerated;
                const conceptNum = hasConceptsNow ? (brief.conceptCount || 1) : 0;
                const briefScripts = scripts[brief.id] ?? [];
                const genStep = genSteps[brief.id] ?? 'idle';
                const config = configFor(brief.id);

                return (
                  <>
                    {/* Main row */}
                    <tr
                      key={brief.id}
                      onClick={() => toggleExpand(brief.id)}
                      className={`cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-gray-50'}`}
                    >
                      <td className="text-center">
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-gray-400 transition-transform duration-150 ${isExpanded ? 'rotate-90 text-blue-500' : ''}`}>
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
                            <button
                              className="btn btn-ghost btn-xs text-blue-600 p-0.5"
                              onClick={(e) => { e.stopPropagation(); onNavigate('concepts', ''); }}
                            >
                              <Eye size={11} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[12px] text-gray-400">—</span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded inline panel */}
                    {isExpanded && (
                      <tr key={`${brief.id}-expand`}>
                        <td colSpan={7} className="p-0 border-b-2 border-blue-200">
                          <BriefExpansion
                            brief={brief}
                            config={config}
                            genStep={genStep}
                            scripts={briefScripts}
                            expandedScript={expandedScript}
                            setExpandedScript={setExpandedScript}
                            onConfigChange={(fn) => setConfig(brief.id, fn)}
                            onGenerate={() => handleGenerate(brief)}
                            onNavigate={onNavigate}
                            getMsg={getMsg}
                            getAngle={getAngle}
                            getICP={getICP}
                            getHook={getHook}
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
          <span>1–{briefs.length} of {briefs.length}</span>
          <span>Rows per page: 20</span>
        </div>
      </div>
    </div>
  );
}

// ─── Inline expanded brief panel ─────────────────────────────────────────────

interface ExpansionProps {
  brief: AdBriefItem;
  config: GenConfig;
  genStep: GenStep;
  scripts: GeneratedScript[];
  expandedScript: string | null;
  setExpandedScript: (id: string | null) => void;
  onConfigChange: (fn: (c: GenConfig) => GenConfig) => void;
  onGenerate: () => void;
  onNavigate: (tab: string, id: string) => void;
  getMsg: (id: string) => ReturnType<typeof messagingData['find']> & {};
  getAngle: (id: string) => ReturnType<typeof anglesData['find']> & {};
  getICP: (id: string) => ReturnType<typeof icpData['find']> & {};
  getHook: (id: string) => ReturnType<typeof hooksData['find']> & {};
}

function BriefExpansion({
  brief, config, genStep, scripts, expandedScript, setExpandedScript,
  onConfigChange, onGenerate, onNavigate,
  getMsg, getAngle, getICP, getHook,
}: ExpansionProps) {
  const angle = getAngle(brief.angleId);
  const isDone = genStep === 'done';

  return (
    <div className="bg-blue-50/40 border-t border-blue-100">
      <div className="flex min-h-0 overflow-x-auto" style={{ minHeight: '280px' }}>

        {/* ── Left: Brief details ── */}
        <div className="w-[230px] flex-shrink-0 border-r border-blue-100 p-4 bg-white/60">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Brief Details</div>
          <div className="space-y-3">
            <DetailRow label="Angle">
              <span className="text-[12.5px] font-semibold text-gray-900">{angle.title}</span>
            </DetailRow>
            <DetailRow label="Situation">
              <span className="text-[12px] text-gray-600 leading-relaxed">{brief.situation}</span>
            </DetailRow>
            <DetailRow label="ICP">
              {brief.icpIds.map(id => {
                const icp = getICP(id);
                return icp ? (
                  <button key={id} onClick={() => onNavigate('icp', icp.id)}
                    className="text-[11.5px] text-blue-600 hover:underline font-medium block">
                    ICP_{icpData.findIndex(i => i.id === id) + 1}: {icp.segment.split('—')[0].trim()}
                  </button>
                ) : null;
              })}
            </DetailRow>
            <DetailRow label="Messaging">
              {brief.messagingIds.map(id => {
                const msg = getMsg(id);
                return msg ? (
                  <button key={id} onClick={() => onNavigate('messaging', msg.id)}
                    className="text-[11.5px] text-blue-600 hover:underline text-left block">
                    {msg.headline.split(' ').slice(0, 4).join(' ')}…
                  </button>
                ) : null;
              })}
            </DetailRow>
            <DetailRow label="Hooks">
              {brief.hookIds.map(id => {
                const h = getHook(id);
                return h ? (
                  <span key={id} className="text-[11px] text-blue-600 block">{id}: {h.text.slice(0, 35)}…</span>
                ) : null;
              })}
            </DetailRow>
          </div>
        </div>

        {/* ── Middle: Generate config ── */}
        <div className="flex-1 p-4 flex flex-col gap-3 min-w-0">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Script Config</div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {/* Variation Mode */}
            <div>
              <div className="text-[10.5px] font-semibold text-gray-500 mb-1.5">Variation Mode</div>
              <div className="flex gap-1.5">
                {(['Tight', 'Moderate', 'Wide'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => onConfigChange(c => ({ ...c, variationMode: v }))}
                    className={`flex-1 py-1 rounded-lg text-[11.5px] font-medium border transition-all
                      ${config.variationMode === v
                        ? 'bg-[#0f1c3f] border-[#0f1c3f] text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Variations count */}
            <div>
              <div className="text-[10.5px] font-semibold text-gray-500 mb-1.5">Variations</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onConfigChange(c => ({ ...c, numVariations: Math.max(1, c.numVariations - 1) }))}
                  className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus size={12} className="text-gray-500" />
                </button>
                <div className="w-10 h-7 rounded-lg border border-blue-300 bg-blue-50 flex items-center justify-center text-[13px] font-bold text-blue-700">
                  {config.numVariations}
                </div>
                <button
                  onClick={() => onConfigChange(c => ({ ...c, numVariations: Math.min(9, c.numVariations + 1) }))}
                  className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus size={12} className="text-gray-500" />
                </button>
                <span className="text-[11px] text-gray-400">of 9 max</span>
              </div>
            </div>

            {/* Tone */}
            <div>
              <div className="text-[10.5px] font-semibold text-gray-500 mb-1.5">Tone</div>
              <div className="flex gap-1">
                {(['AI', '15s', '30s', '45s', '60s'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => onConfigChange(c => ({ ...c, tone: t }))}
                    className={`px-1.5 py-0.5 rounded-md text-[11px] font-medium border transition-all
                      ${config.tone === t
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}
                  >
                    {t === 'AI' ? 'Auto' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <div className="text-[10.5px] font-semibold text-gray-500 mb-1.5">Duration Style</div>
              <div className="flex gap-1">
                {(['AI', 'Comedy', 'Emotional', 'Educational'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => onConfigChange(c => ({ ...c, duration: d }))}
                    className={`px-1.5 py-0.5 rounded-md text-[11px] font-medium border transition-all
                      ${config.duration === d
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}
                  >
                    {d === 'AI' ? 'Auto' : d}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="col-span-2">
              <div className="text-[10.5px] font-semibold text-gray-500 mb-1.5">Language</div>
              <div className="flex gap-1.5">
                {(['AI', 'English', 'Hindi', 'Kannada', 'Tamil'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => onConfigChange(c => ({ ...c, language: l }))}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all
                      ${config.language === l
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}
                  >
                    {l === 'AI' ? 'Auto' : l}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div className="col-span-2">
              <div className="text-[10.5px] font-semibold text-gray-500 mb-1.5">Additional Direction</div>
              <textarea
                className="field resize-none text-[12px]"
                rows={2}
                placeholder="Any extra creative direction…"
                value={config.prompt}
                onChange={e => onConfigChange(c => ({ ...c, prompt: e.target.value }))}
              />
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={onGenerate}
            disabled={genStep === 'generating'}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-2 transition-all mt-auto"
            style={{ background: genStep === 'generating' ? '#374151' : '#0f1c3f' }}
          >
            {genStep === 'generating' ? (
              <><Loader2 size={14} className="animate-spin" /> Generating {config.numVariations} script{config.numVariations > 1 ? 's' : ''}…</>
            ) : (
              <><Wand2 size={14} /> Generate {config.numVariations} Script{config.numVariations > 1 ? 's' : ''}</>
            )}
          </button>
        </div>

        {/* ── Right: Generated scripts ── */}
        {isDone && scripts.length > 0 && (
          <div className="w-[300px] flex-shrink-0 border-l border-blue-100 p-4 overflow-y-auto bg-white/60">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <FileText size={11} />
              Generated Scripts
              <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto">
                {scripts.length}
              </span>
            </div>
            <div className="space-y-2">
              {scripts.map(script => {
                const isOpen = expandedScript === script.id;
                return (
                  <div key={script.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                      onClick={() => setExpandedScript(isOpen ? null : script.id)}
                    >
                      <span className="text-[11.5px] font-semibold text-gray-800 flex-1">
                        V{script.version}: {script.angleTitle.split(' ').slice(0, 3).join(' ')}…
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="badge badge-gray text-[9.5px]">{script.duration}</span>
                        {isOpen ? <ChevronUp size={11} className="text-gray-400" /> : <ChevronDown size={11} className="text-gray-400" />}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-3 border-t border-gray-50 space-y-2 pt-2">
                        {[
                          { label: 'Hook', value: script.hook },
                          { label: 'Headline', value: script.headline },
                          { label: 'CTA', value: script.cta },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <div className="text-[9.5px] font-semibold text-gray-400 uppercase tracking-wide">{label}</div>
                            <div className="text-[11.5px] text-gray-800 leading-snug mt-0.5">{value}</div>
                          </div>
                        ))}
                        <div>
                          <div className="text-[9.5px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Scenes</div>
                          {script.scenes.map(s => (
                            <div key={s.num} className="flex gap-1.5 text-[11px] text-gray-600 mb-1">
                              <span className="text-[10px] text-gray-400 font-mono flex-shrink-0 mt-0.5">{s.time}</span>
                              <span className="leading-snug">{s.description.slice(0, 60)}…</span>
                            </div>
                          ))}
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
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="text-[10.5px] text-gray-400 font-medium w-16 flex-shrink-0 pt-0.5">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

