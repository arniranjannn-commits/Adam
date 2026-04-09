import { useState } from 'react';
import { icpData } from '../data/mockData';
import type { ICPItem } from '../data/mockData';
import { Tooltip } from '../components/Tooltip';
import { Users, Target, Heart, Zap, Radio, Plus, Edit3, Check, Loader2, Copy, Trash2, Search, X, ChevronRight } from 'lucide-react';

interface Props { highlightId?: string | null }

const ICP_COLORS = [
  { bg: 'bg-blue-600',    light: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  { bg: 'bg-violet-600',  light: 'bg-violet-50',  border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500' },
  { bg: 'bg-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700',dot: 'bg-emerald-500' },
  { bg: 'bg-orange-500',  light: 'bg-orange-50',  border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
];

const FIELDS: Array<{ key: keyof ICPItem; label: string; icon: React.ElementType; tooltip: string; multiline?: boolean }> = [
  { key: 'demographics',   label: 'Demographics',  icon: Users,   tooltip: 'Age, location, company stage, firmographics.' },
  { key: 'psychographics', label: 'Psychographics', icon: Heart,   tooltip: 'Mindset, values, reading habits, aspirational identity.' },
  { key: 'painPoints',     label: 'Pain Points',    icon: Zap,     tooltip: 'Core frustrations your product solves.', multiline: true },
  { key: 'goals',          label: 'Goals',          icon: Target,  tooltip: 'What this person is trying to achieve.', multiline: true },
  { key: 'channels',       label: 'Channels',       icon: Radio,   tooltip: 'Where this ICP spends attention.' },
];

export function ICPTab({ highlightId }: Props) {
  const [items, setItems]         = useState<ICPItem[]>(icpData);
  const [overlayId, setOverlayId] = useState<string | null>(highlightId ?? null);
  const [editMode, setEditMode]   = useState(false);
  const [draft, setDraft]         = useState<ICPItem | null>(null);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState('');

  const overlayItem = items.find(i => i.id === overlayId) ?? null;
  const current = editMode && draft ? draft : overlayItem;
  const colorOf = (id: string) => ICP_COLORS[items.findIndex(i => i.id === id) % ICP_COLORS.length];

  const openOverlay = (id: string) => { setOverlayId(id); setEditMode(false); setDraft(null); };
  const closeOverlay = () => { setOverlayId(null); setEditMode(false); setDraft(null); };

  const handleSave = () => {
    if (!draft) return; setSaving(true);
    setTimeout(() => { setItems(p => p.map(i => i.id === draft.id ? draft : i)); setEditMode(false); setDraft(null); setSaving(false); }, 500);
  };
  const handleAdd = () => {
    const n: ICPItem = { id: `icp-${Date.now()}`, segment: '', demographics: '', psychographics: '', painPoints: '', goals: '', channels: '', size: '' };
    setItems(p => [...p, n]); setOverlayId(n.id); setDraft(n); setEditMode(true);
  };
  const handleDuplicate = () => {
    if (!overlayItem) return;
    const copy = { ...overlayItem, id: `icp-${Date.now()}`, segment: overlayItem.segment + ' (Copy)' };
    setItems(p => [...p, copy]); openOverlay(copy.id);
  };
  const handleDelete = () => {
    if (!overlayItem) return;
    setItems(p => p.filter(i => i.id !== overlayItem.id)); closeOverlay();
  };

  const visibleItems = items.filter(icp => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return icp.segment.toLowerCase().includes(q) || icp.demographics.toLowerCase().includes(q);
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 flex-shrink-0">
        <span className="font-semibold text-gray-900 text-[13px] mr-1">ICPs</span>
        <div className="relative">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search segments…"
            className="border border-gray-200 rounded-lg pl-7 pr-3 py-1 text-[12px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 w-44" />
        </div>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-gray-400">
          <span>{items.length} segment{items.length !== 1 ? 's' : ''}</span>
          <button onClick={handleAdd} className="btn btn-primary btn-xs flex items-center gap-1"><Plus size={10} /> New ICP</button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-y-auto bg-white">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide w-[22%]">Segment</th>
              <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide w-[8%]">Size</th>
              <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide w-[22%]">
                <span className="flex items-center gap-1">Demographics <Tooltip content="Age, location, company stage, firmographics." /></span>
              </th>
              <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide w-[22%]">
                <span className="flex items-center gap-1">Pain Points <Tooltip content="Core frustrations." /></span>
              </th>
              <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide w-[18%]">Channels</th>
              <th className="text-right px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide w-[8%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((icp, idx) => {
              const c = ICP_COLORS[idx % ICP_COLORS.length];
              const isActive = overlayId === icp.id;
              return (
                <tr key={icp.id} onClick={() => openOverlay(icp.id)}
                  className={`border-b border-gray-100 cursor-pointer transition-colors text-[12px]
                    ${isActive ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-gray-50'}`}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                      <div>
                        <div className="font-medium text-gray-900 truncate">{icp.segment.split('—')[0].trim() || <span className="text-gray-400 italic">Untitled</span>}</div>
                        {icp.segment.includes('—') && <div className="text-[10.5px] text-gray-400 truncate">{icp.segment.split('—')[1]?.trim()}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-[10.5px] font-medium px-1.5 py-0.5 rounded ${c.light} ${c.text}`}>{icp.size || '—'}</span>
                  </td>
                  <td className="px-3 py-2 text-gray-500 max-w-0"><span className="block truncate text-[11.5px]">{icp.demographics || '—'}</span></td>
                  <td className="px-3 py-2 text-gray-500 max-w-0"><span className="block truncate text-[11.5px]">{icp.painPoints || '—'}</span></td>
                  <td className="px-3 py-2 text-gray-500 max-w-0"><span className="block truncate text-[11.5px]">{icp.channels || '—'}</span></td>
                  <td className="px-4 py-2 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { openOverlay(icp.id); setTimeout(() => { setDraft({ ...icp }); setEditMode(true); }, 0); }}
                        className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                        <Edit3 size={11} />
                      </button>
                      <button onClick={() => { const copy = { ...icp, id: `icp-${Date.now()}`, segment: icp.segment + ' (Copy)' }; setItems(p => [...p, copy]); openOverlay(copy.id); }}
                        className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                        <Copy size={11} />
                      </button>
                      <button onClick={() => { setItems(p => p.filter(i => i.id !== icp.id)); if (overlayId === icp.id) closeOverlay(); }}
                        className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={11} />
                      </button>
                      <ChevronRight size={12} className={`text-gray-300 ml-1 transition-transform ${isActive ? 'rotate-90 text-blue-500' : ''}`} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {visibleItems.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-[12px] text-gray-400">No segments found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Right overlay panel ── */}
      {current && (
        <>
          <div className="fixed inset-0 bg-black/10 z-30" onClick={closeOverlay} />
          <div className="fixed top-0 right-0 h-full w-[520px] bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0">
              {overlayItem && <div className={`w-8 h-8 rounded-xl ${colorOf(overlayItem.id).bg} flex items-center justify-center flex-shrink-0`}><Users size={14} className="text-white" /></div>}
              <div className="flex-1 min-w-0">
                {editMode ? (
                  <input className="field text-[13px] font-semibold" value={draft!.segment}
                    onChange={e => setDraft(d => d ? { ...d, segment: e.target.value } : d)} placeholder="Segment name — Role / Title" />
                ) : (
                  <div className="font-semibold text-gray-900 text-[13.5px] truncate">{current.segment || <span className="text-gray-400 italic">Untitled ICP</span>}</div>
                )}
                {!editMode && current.size && <div className="text-[11px] text-gray-400 mt-0.5">{current.size}</div>}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
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
                    <button onClick={handleDelete} className="btn btn-secondary btn-xs text-red-500"><Trash2 size={10} /></button>
                    <button onClick={() => { if (overlayItem) { setDraft({ ...overlayItem }); setEditMode(true); } }}
                      className="btn btn-primary btn-xs flex items-center gap-1" style={{ background: '#0f1c3f' }}><Edit3 size={10} />Edit</button>
                  </>
                )}
                <button onClick={closeOverlay} className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center ml-1"><X size={13} className="text-gray-400" /></button>
              </div>
            </div>

            {/* TAM size in edit mode */}
            {editMode && (
              <div className="px-4 pt-3 flex-shrink-0">
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">TAM / Audience Size</div>
                  <input className="field text-[12.5px]" value={draft!.size}
                    onChange={e => setDraft(d => d ? { ...d, size: e.target.value } : d)} placeholder="e.g. ~85,000 in TAM" />
                </div>
              </div>
            )}

            {/* Fields */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {FIELDS.map(({ key, label, icon: Icon, tooltip, multiline }) => {
                  const c = overlayItem ? colorOf(overlayItem.id) : ICP_COLORS[0];
                  return (
                    <div key={key} className={`bg-gray-50 rounded-xl border border-gray-200 p-3 ${key === 'painPoints' || key === 'goals' ? '' : ''}`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className={`w-5 h-5 rounded-md ${c.light} flex items-center justify-center flex-shrink-0`}>
                          <Icon size={11} className={c.text} />
                        </div>
                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
                        <Tooltip content={tooltip} />
                      </div>
                      {editMode ? (
                        multiline ? (
                          <textarea className="field resize-none text-[12px]" rows={3} value={(draft as any)[key]}
                            onChange={e => setDraft(d => d ? { ...d, [key]: e.target.value } : d)} placeholder={`${label}…`} />
                        ) : (
                          <input className="field text-[12px]" value={(draft as any)[key]}
                            onChange={e => setDraft(d => d ? { ...d, [key]: e.target.value } : d)} placeholder={`${label}…`} />
                        )
                      ) : (
                        <p className="text-[12px] text-gray-700 leading-relaxed">{(current as any)[key] || <span className="text-gray-300">Not defined</span>}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
