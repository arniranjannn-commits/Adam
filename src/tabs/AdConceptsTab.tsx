import { useState, useEffect } from 'react';
import { adConceptsData } from '../data/mockData';
import type { AdConceptItem } from '../data/mockData';
import { Tooltip } from '../components/Tooltip';
import {
  LayoutGrid, List, Archive, Shuffle, Send,
  Calendar, Layers, Loader2, MessageSquare, User, Bot,
  CheckCircle2, Clock, ChevronRight, X, Monitor, Sparkles, Search,
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  ts: number;
}

interface Props {
  highlightId?: string | null;
  extraConcepts?: AdConceptItem[];
}

const statusConfig = {
  approved: { label: 'Approved', badge: 'bg-green-100 text-green-700', icon: CheckCircle2, iconColor: 'text-green-500' },
  draft: { label: 'Draft', badge: 'bg-yellow-100 text-yellow-700', icon: Clock, iconColor: 'text-yellow-500' },
  archived: { label: 'Archived', badge: 'bg-gray-100 text-gray-500', icon: Archive, iconColor: 'text-gray-400' },
};

export function AdConceptsTab({ highlightId, extraConcepts = [] }: Props) {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [concepts, setConcepts] = useState<AdConceptItem[]>([...adConceptsData, ...extraConcepts]);
  const [selected, setSelected] = useState<AdConceptItem | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [variationMode, setVariationMode] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | AdConceptItem['status']>('all');
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [filterFormat, setFilterFormat] = useState('All');

  useEffect(() => {
    const allIds = new Set(concepts.map(c => c.id));
    const newOnes = extraConcepts.filter(c => !allIds.has(c.id));
    if (newOnes.length > 0) setConcepts(prev => [...prev, ...newOnes]);
  }, [extraConcepts]);

  const openDetail = (concept: AdConceptItem) => {
    setSelected(concept);
    setVariationMode(false);
    setChatMessages([{
      role: 'ai',
      content: `I've loaded "${concept.title}" as context. What variation would you like to explore?\n\n• Different emotional tone\n• Alternative hook angle\n• Platform-specific version\n• New CTA direction`,
      ts: Date.now(),
    }]);
  };

  const handleApprove = (id: string) => {
    setConcepts(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' as const } : c));
    if (selected?.id === id) setSelected(s => s ? { ...s, status: 'approved' } : s);
  };

  const handleArchive = (id: string) => {
    setConcepts(prev => prev.map(c => c.id === id ? { ...c, status: 'archived' as const } : c));
    setSelected(null);
  };

  const handleSendChat = () => {
    if (!chatInput.trim() || !selected) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput, ts: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    setTimeout(() => {
      const responses = [
        `Here's a variation with a different emotional hook:\n\n**New Hook:** "Every day without this insight, you're leaving money on the table."\n\n**Body:** Same core message around ${selected.cta}, but leading with loss aversion instead of frustration. This version tends to perform 12–18% better with finance-adjacent audiences.\n\n**CTA:** Keep "${selected.cta}" — it's proven.`,
        `Trying a platform-optimized version for TikTok:\n\n**Hook (3s):** "${selected.hook.split(' ').slice(0, 6).join(' ')}..."\n\n**Format:** 9:16 vertical, text overlay, trending audio. Keep first 2s silent with bold text only.\n\n**CTA:** "Try free" (shorter = higher CTR on mobile).`,
        `Here's a trust-first variation:\n\n**Opening:** Customer testimonial still frame — "We saved 8 hours/week in month one."\n\n**Middle:** Social proof stacking — logos, user count, star rating.\n\n**End:** Same CTA with 30-day free trial offer.\n\nSocial proof variants often outperform problem-agitation for enterprise ICPs.`,
      ];
      setChatMessages(prev => [...prev, {
        role: 'ai',
        content: responses[Math.floor(Math.random() * responses.length)],
        ts: Date.now(),
      }]);
      setChatLoading(false);
    }, 1600);
  };

  const visible = concepts.filter(c => {
    if (filterStatus === 'all' ? c.status === 'archived' : c.status !== filterStatus) return false;
    if (filterPlatform !== 'All' && c.platform !== filterPlatform) return false;
    if (filterFormat !== 'All' && c.format !== filterFormat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!c.title.toLowerCase().includes(q) && !c.hook.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      {/* ── Toolbar ── */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900 text-[13.5px]">Ad Concepts</span>
          <Tooltip content="Each concept includes hook, body copy, CTA, visual direction, and script. Generate variations via AI chat." large />
          {/* Search input */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search concepts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-[12px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 w-40"
            />
          </div>
          {/* Platform filter */}
          <select
            value={filterPlatform}
            onChange={e => setFilterPlatform(e.target.value)}
            className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12px] text-gray-700 bg-white focus:outline-none focus:border-blue-400 cursor-pointer"
          >
            {['All', 'Meta', 'YouTube', 'TikTok', 'LinkedIn'].map(p => (
              <option key={p} value={p}>{p === 'All' ? 'All Platforms' : p}</option>
            ))}
          </select>
          {/* Format filter */}
          <select
            value={filterFormat}
            onChange={e => setFilterFormat(e.target.value)}
            className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12px] text-gray-700 bg-white focus:outline-none focus:border-blue-400 cursor-pointer"
          >
            {['All', 'Video', 'Carousel', 'Static'].map(f => (
              <option key={f} value={f}>{f === 'All' ? 'All Formats' : f}</option>
            ))}
          </select>
          {/* Status filter pills */}
          <div className="flex items-center gap-1">
            {(['all', 'approved', 'draft'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors capitalize
                  ${filterStatus === f
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {f === 'all' ? `All ${concepts.filter(c => c.status !== 'archived').length}` : f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 flex items-center gap-1.5 text-[11.5px] font-medium transition-colors
                ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <LayoutGrid size={12} /> Grid
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1.5 flex items-center gap-1.5 text-[11.5px] font-medium transition-colors
                ${view === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <List size={12} /> Table
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-hidden flex">
        {/* ── Main content ── */}
        <div className={`flex flex-col min-w-0 transition-all ${selected ? 'flex-[2]' : 'flex-1'}`}>
          <div className="flex-1 overflow-y-auto">
            {/* Empty */}
            {visible.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-14 h-14 bg-white border border-dashed border-gray-300 rounded-xl flex items-center justify-center mb-4">
                  <Layers size={22} className="text-gray-300" />
                </div>
                <p className="text-[13.5px] font-medium text-gray-500">No concepts yet</p>
                <p className="text-xs text-gray-400 mt-1">Generate concepts from Ad Briefs to see them here</p>
              </div>
            )}

            {/* GRID */}
            {view === 'grid' && visible.length > 0 && (
              <div className="p-5 grid grid-cols-2 gap-4 xl:grid-cols-3 2xl:grid-cols-4 auto-rows-min">
                {visible.map(concept => (
                  <ConceptCard
                    key={concept.id}
                    concept={concept}
                    isSelected={selected?.id === concept.id}
                    highlighted={highlightId === concept.id}
                    onClick={() => openDetail(concept)}
                    onApprove={() => handleApprove(concept.id)}
                    onArchive={() => handleArchive(concept.id)}
                  />
                ))}
              </div>
            )}

            {/* TABLE */}
            {view === 'table' && visible.length > 0 && (
              <div className="p-5">
                <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                  <table className="data-table" style={{ minWidth: '760px' }}>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Hook</th>
                        <th>Format</th>
                        <th>Platform</th>
                        <th><span className="flex items-center gap-1">Variations <Tooltip content="AI-generated variations for this concept." /></span></th>
                        <th>Created</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map(concept => {
                        const sc = statusConfig[concept.status];
                        return (
                          <tr
                            key={concept.id}
                            onClick={() => openDetail(concept)}
                            className={`${highlightId === concept.id ? 'row-hl' : ''} ${selected?.id === concept.id ? 'bg-blue-50' : ''}`}
                          >
                            <td>
                              <div className="font-medium text-gray-900 text-[12.5px]">{concept.title}</div>
                              <div className="text-[11px] text-gray-400 mt-0.5">{concept.cta}</div>
                            </td>
                            <td>
                              <div className="text-[12px] text-gray-600 italic line-clamp-2">"{concept.hook}"</div>
                            </td>
                            <td><span className="badge badge-blue text-[11px]">{concept.format}</span></td>
                            <td><span className="text-[12px] text-gray-700">{concept.platform}</span></td>
                            <td><span className="text-[13px] font-semibold text-gray-700">{concept.variations}</span></td>
                            <td>
                              <div className="flex items-center gap-1 text-[11.5px] text-gray-400">
                                <Calendar size={10} /> {concept.createdAt}
                              </div>
                            </td>
                            <td>
                              <span className={`badge text-[10.5px] ${sc.badge}`}>{sc.label}</span>
                            </td>
                            <td><ChevronRight size={13} className="text-gray-300" /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right detail panel ── */}
        {selected && (
          <div className="w-[400px] flex-shrink-0 border-l border-gray-200 bg-white flex flex-col">
            {/* Detail header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 text-[13px] leading-snug">{selected.title}</div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className={`badge text-[10.5px] ${statusConfig[selected.status].badge}`}>
                    {statusConfig[selected.status].label}
                  </span>
                  <span className="badge badge-blue text-[10.5px]">{selected.format}</span>
                  <span className="badge badge-gray text-[10.5px]">{selected.platform}</span>
                </div>
              </div>
              <button
                onClick={() => { setSelected(null); setVariationMode(false); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setVariationMode(false)}
                className={`flex-1 py-2.5 text-[12px] font-medium transition-colors border-b-2
                  ${!variationMode ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Details
              </button>
              <button
                onClick={() => setVariationMode(true)}
                className={`flex-1 py-2.5 text-[12px] font-medium transition-colors border-b-2 flex items-center justify-center gap-1.5
                  ${variationMode ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <Sparkles size={11} /> AI Variations
              </button>
            </div>

            {/* Details pane */}
            {!variationMode && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Hook</div>
                    <div className="text-[13.5px] font-medium text-gray-900 italic leading-relaxed">"{selected.hook}"</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Body Copy</div>
                    <div className="text-[12.5px] text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-3 border border-gray-100">
                      {selected.body}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">CTA</div>
                      <span className="badge badge-blue">{selected.cta}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Variations</div>
                      <div className="flex items-center gap-1 text-[13px] font-semibold text-gray-800">
                        <Layers size={12} className="text-gray-400" />
                        {selected.variations}
                      </div>
                    </div>
                  </div>
                  {selected.visualDirection && (
                    <div>
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Visual Direction</div>
                      <div className="text-[12px] text-gray-600 leading-relaxed bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                        {selected.visualDirection}
                      </div>
                    </div>
                  )}
                  {selected.script && (
                    <div>
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Script</div>
                      <pre className="text-[11.5px] text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-3 border border-gray-100">
                        {selected.script}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Footer actions */}
                <div className="p-3 border-t border-gray-100 flex gap-2 bg-white">
                  {selected.status !== 'approved' && (
                    <button
                      onClick={() => handleApprove(selected.id)}
                      className="btn btn-success btn-sm flex items-center gap-1.5 flex-1 justify-center"
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                  )}
                  <button
                    onClick={() => setVariationMode(true)}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5 flex-1 justify-center"
                  >
                    <Shuffle size={13} /> Try Variation
                  </button>
                  <button
                    onClick={() => handleArchive(selected.id)}
                    className="btn btn-secondary btn-sm text-red-400 hover:text-red-500 flex items-center gap-1.5"
                  >
                    <Archive size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Chat / Variation pane */}
            {variationMode && (
              <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                        ${msg.role === 'user' ? 'bg-blue-600' : 'bg-white border border-gray-200'}`}>
                        {msg.role === 'user'
                          ? <User size={11} className="text-white" />
                          : <Bot size={11} className="text-gray-500" />}
                      </div>
                      <div className={msg.role === 'user' ? 'chat-user' : 'chat-ai'} style={{ whiteSpace: 'pre-line' }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                        <Bot size={11} className="text-gray-500" />
                      </div>
                      <div className="chat-ai flex items-center gap-1.5">
                        <Loader2 size={11} className="animate-spin text-gray-400" />
                        <span className="text-gray-400 text-[12px]">Generating…</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      className="field text-[12.5px] flex-1"
                      placeholder="Describe the variation you want…"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                    />
                    <button
                      onClick={handleSendChat}
                      disabled={!chatInput.trim() || chatLoading}
                      className="btn btn-primary px-3"
                    >
                      <Send size={13} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5 text-[10.5px] text-gray-400">
                    <MessageSquare size={9} /> Context: {selected.title.slice(0, 24)}… · Enter to send
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ConceptCard({
  concept,
  isSelected,
  highlighted,
  onClick,
  onApprove,
  onArchive,
}: {
  concept: AdConceptItem;
  isSelected: boolean;
  highlighted?: boolean;
  onClick: () => void;
  onApprove: () => void;
  onArchive: () => void;
}) {
  const sc = statusConfig[concept.status];
  const StatusIcon = sc.icon;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border cursor-pointer flex flex-col transition-all
        ${isSelected ? 'border-blue-400 ring-2 ring-blue-200 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}
        ${highlighted ? 'ring-2 ring-blue-400' : ''}
        ${concept.status === 'archived' ? 'opacity-50' : ''}`}
    >
      {/* Card top */}
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="font-semibold text-gray-900 text-[13px] leading-snug flex-1">{concept.title}</div>
          <StatusIcon size={14} className={`${sc.iconColor} flex-shrink-0 mt-0.5`} />
        </div>
        <div className="text-[12px] text-gray-500 italic mb-3 line-clamp-2">"{concept.hook}"</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="badge badge-blue text-[10px]">{concept.format}</span>
          <span className="badge badge-gray text-[10px]">{concept.platform}</span>
        </div>
      </div>

      {/* Card footer */}
      <div className="px-4 pb-3 border-t border-gray-50 pt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Monitor size={10} />
          <span>{concept.cta}</span>
        </div>
        <div className="flex items-center gap-1">
          {concept.status !== 'approved' && (
            <button
              onClick={(e) => { e.stopPropagation(); onApprove(); }}
              className="btn btn-success btn-xs py-0.5 px-1.5 text-[10px]"
            >
              Approve
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onArchive(); }}
            className="btn btn-secondary btn-xs py-0.5 px-1.5 text-[10px] text-red-400"
          >
            <Archive size={9} />
          </button>
        </div>
      </div>
    </div>
  );
}
