import { useState } from 'react';
import { messagingData } from '../data/mockData';
import type { MessagingItem } from '../data/mockData';
import { Plus, Check, Archive, Copy, Edit3, Loader2, Search, X, ChevronRight } from 'lucide-react';

const CHANNELS = ['Paid Social', 'Search', 'LinkedIn', 'Display', 'YouTube', 'Email'];
const TONES = ['Urgent / Practical', 'Competitive / FOMO', 'Aspirational / Clarity', 'Social Proof / Trust', 'Educational / Empowering'];

const statusConfig = {
  active:   { dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700',  label: 'Active' },
  draft:    { dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700', label: 'Draft' },
  archived: { dot: 'bg-gray-300',   badge: 'bg-gray-100 text-gray-400',    label: 'Archived' },
};

interface Props { highlightId?: string | null }

export function MessagingTab({ highlightId }: Props) {
  const [items, setItems]           = useState<MessagingItem[]>(messagingData);
  const [overlayId, setOverlayId]   = useState<string | null>(highlightId ?? null);
  const [filter, setFilter]         = useState<'all' | 'active' | 'draft'>('all');
  const [search, setSearch]         = useState('');
  const [filterChannel, setFilterChannel] = useState('All');
  const [filterTone, setFilterTone]       = useState('All');
  const [editMode, setEditMode]     = useState(false);
  const [draft, setDraft]           = useState<MessagingItem | null>(null);
  const [saving, setSaving]         = useState(false);

  const overlayItem = items.find(m => m.id === overlayId) ?? null;
  const current = editMode && draft ? draft : overlayItem;

  const filtered = items.filter(m => {
    if (filter !== 'all' && m.status !== filter) return false;
    if (filterChannel !== 'All' && m.channel !== filterChannel) return false;
    if (filterTone !== 'All' && m.tone !== filterTone) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!m.headline.toLowerCase().includes(q) && !m.channel.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const openOverlay = (id: string) => { setOverlayId(id); setEditMode(false); setDraft(null); };
  const closeOverlay = () => { setOverlayId(null); setEditMode(false); setDraft(null); };

  const handleEdit = () => { if (!overlayItem) return; setDraft({ ...overlayItem }); setEditMode(true); };
  const handleSave = () => {
    if (!draft) return; setSaving(true);
    setTimeout(() => { setItems(p => p.map(m => m.id === draft.id ? draft : m)); setEditMode(false); setDraft(null); setSaving(false); }, 500);
  };
  const handleAdd = () => {
    const n: MessagingItem = { id: `msg-${Date.now()}`, headline: '', subheadline: '', valueProposition: '', cta: '', tone: '', channel: '', status: 'draft' };
    setItems(p => [...p, n]); setOverlayId(n.id); setDraft(n); setEditMode(true); setFilter('all');
  };
  const handleDelete = () => {
    if (!overlayItem) return;
    setItems(p => p.filter(m => m.id !== overlayItem.id)); closeOverlay();
  };
  const handleDuplicate = () => {
    if (!overlayItem) return;
    const copy = { ...overlayItem, id: `msg-${Date.now()}`, headline: overlayItem.headline + ' (Copy)', status: 'draft' as const };
    setItems(p => [...p, copy]); openOverlay(copy.id);
  };
  const cycleStatus = (id: string) => {
    const order: MessagingItem['status'][] = ['active', 'draft', 'archived'];
    setItems(p => p.map(m => m.id === id ? { ...m, status: order[(order.indexOf(m.status) + 1) % 3] } : m));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 flex-shrink-0">
        <span className="font-semibold text-gray-900 text-[13px] mr-1">Messaging</span>
        <div className="relative">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            className="border border-gray-200 rounded-lg pl-7 pr-3 py-1 text-[12px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 w-36" />
        </div>
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
          {(['all','active','draft'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all capitalize ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {f}
            </button>
          ))}
        </div>
        <select value={filterChannel} onChange={e => setFilterChannel(e.target.value)}
          className="border border-gray-200 rounded-lg px-2 py-1 text-[11.5px] text-gray-700 bg-white focus:outline-none focus:border-blue-400 cursor-pointer">
          <option value="All">All Channels</option>
          {CHANNELS.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterTone} onChange={e => setFilterTone(e.target.value)}
          className="border border-gray-200 rounded-lg px-2 py-1 text-[11.5px] text-gray-700 bg-white focus:outline-none focus:border-blue-400 cursor-pointer">
          <option value="All">All Tones</option>
          {TONES.map(t => <option key={t}>{t}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-gray-400">
          <span>{items.filter(m => m.status === 'active').length} active · {items.length} total</span>
          <button onClick={handleAdd} className="btn btn-primary btn-xs flex items-center gap-1">
            <Plus size={10} /> New
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-y-auto bg-white">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide w-[28%]">Headline</th>
              <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide w-[20%]">Subheadline</th>
              <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide w-[12%]">Channel</th>
              <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide w-[18%]">Tone</th>
              <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide w-[10%]">CTA</th>
              <th className="text-center px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide w-[8%]">Status</th>
              <th className="text-right px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide w-[4%]"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(msg => {
              const sc = statusConfig[msg.status];
              const isActive = overlayId === msg.id;
              return (
                <tr key={msg.id} onClick={() => openOverlay(msg.id)}
                  className={`border-b border-gray-100 cursor-pointer transition-colors text-[12px]
                    ${isActive ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-gray-50'}`}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                      <span className="font-medium text-gray-900 truncate">{msg.headline || <span className="text-gray-400 italic">Untitled</span>}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-500 truncate max-w-0"><span className="block truncate">{msg.subheadline || '—'}</span></td>
                  <td className="px-3 py-2"><span className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{msg.channel || '—'}</span></td>
                  <td className="px-3 py-2 text-gray-500 truncate max-w-0"><span className="block truncate text-[11.5px]">{msg.tone || '—'}</span></td>
                  <td className="px-3 py-2 text-gray-500 text-[11.5px]">{msg.cta || '—'}</td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={e => { e.stopPropagation(); cycleStatus(msg.id); }}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${sc.badge}`}>
                      {sc.label}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <ChevronRight size={13} className={`text-gray-400 inline-block transition-transform ${isActive ? 'rotate-90 text-blue-500' : ''}`} />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 text-[12px] text-gray-400">No messages match filters</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Right overlay panel ── */}
      {current && (
        <>
          <div className="fixed inset-0 bg-black/10 z-30" onClick={closeOverlay} />
          <div className="fixed top-0 right-0 h-full w-[480px] bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col">
            {/* Overlay header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-900 text-[13.5px] truncate">
                  {current.headline || <span className="text-gray-400 font-normal italic">Untitled</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {overlayItem && !editMode && (
                    <button onClick={() => cycleStatus(overlayItem.id)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusConfig[current.status].badge}`}>
                      {statusConfig[current.status].label}
                    </button>
                  )}
                  {current.tone && <span className="text-[11px] text-gray-400">{current.tone}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                {editMode ? (
                  <>
                    <button onClick={() => { setEditMode(false); setDraft(null); }} className="btn btn-secondary btn-xs">Discard</button>
                    <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-xs flex items-center gap-1" style={{ background: '#0f1c3f' }}>
                      {saving ? <><Loader2 size={10} className="animate-spin" />Saving…</> : <><Check size={10} />Save</>}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleDuplicate} className="btn btn-secondary btn-xs flex items-center gap-1"><Copy size={10} />Dup</button>
                    <button onClick={handleDelete} className="btn btn-secondary btn-xs text-red-500"><Archive size={10} /></button>
                    <button onClick={handleEdit} className="btn btn-primary btn-xs flex items-center gap-1" style={{ background: '#0f1c3f' }}><Edit3 size={10} />Edit</button>
                  </>
                )}
                <button onClick={closeOverlay} className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center ml-1"><X size={13} className="text-gray-400" /></button>
              </div>
            </div>

            {/* Overlay body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Headline & Sub */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-3.5">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Headline & Subheadline</div>
                {editMode ? (
                  <div className="space-y-1.5">
                    <input className="field text-[14px] font-semibold" value={draft!.headline} onChange={e => setDraft(d => d ? { ...d, headline: e.target.value } : d)} placeholder="Primary headline…" />
                    <input className="field text-[12.5px]" value={draft!.subheadline} onChange={e => setDraft(d => d ? { ...d, subheadline: e.target.value } : d)} placeholder="Subheadline…" />
                  </div>
                ) : (
                  <>
                    <div className="text-[16px] font-semibold text-gray-900 leading-snug mb-1">{current.headline || <span className="text-gray-300 font-normal">No headline</span>}</div>
                    <div className="text-[12.5px] text-gray-500">{current.subheadline || <span className="text-gray-300">—</span>}</div>
                  </>
                )}
              </div>

              {/* Value Prop */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-3.5 flex flex-col" style={{ minHeight: '120px' }}>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Value Proposition</div>
                {editMode ? (
                  <textarea className="field resize-none flex-1 text-[12.5px]" rows={4} value={draft!.valueProposition}
                    onChange={e => setDraft(d => d ? { ...d, valueProposition: e.target.value } : d)} placeholder="Core benefit or promise…" />
                ) : (
                  <div className="text-[12.5px] text-gray-700 leading-relaxed">{current.valueProposition || <span className="text-gray-300">Not defined</span>}</div>
                )}
              </div>

              {/* Tone + Channel + CTA */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { label: 'Tone', key: 'tone' as const, opts: TONES, isSelect: true },
                  { label: 'Channel', key: 'channel' as const, opts: CHANNELS, isSelect: true },
                  { label: 'CTA', key: 'cta' as const, opts: null, isSelect: false },
                ].map(({ label, key, opts, isSelect }) => (
                  <div key={key} className="bg-gray-50 rounded-xl border border-gray-200 p-3">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{label}</div>
                    {editMode ? (
                      isSelect && opts ? (
                        <select className="field text-[11.5px]" value={(draft as any)[key]}
                          onChange={e => setDraft(d => d ? { ...d, [key]: e.target.value } : d)}>
                          <option value="">Select…</option>
                          {opts.map(o => <option key={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input className="field text-[11.5px]" value={(draft as any)[key]}
                          onChange={e => setDraft(d => d ? { ...d, [key]: e.target.value } : d)} placeholder={`${label}…`} />
                      )
                    ) : (
                      <span className="text-[12px] font-medium text-gray-800">{(current as any)[key] || '—'}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Usage */}
              {!editMode && (
                <div className="bg-blue-50 rounded-xl border border-blue-100 p-3">
                  <div className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide mb-1">Usage in Briefs</div>
                  <p className="text-[12px] text-blue-700 leading-relaxed">Referenced across multiple Ad Briefs. Changes propagate to all linked briefs.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
