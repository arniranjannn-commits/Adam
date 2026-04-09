import { useState } from 'react';
import { icpData } from '../data/mockData';
import type { ICPItem } from '../data/mockData';
import { Tooltip } from '../components/Tooltip';
import { Users, Target, Heart, Zap, Radio, Plus, Edit3, Check, Loader2, Copy, Trash2, Search } from 'lucide-react';

interface Props {
  highlightId?: string | null;
}

const ICP_COLORS = [
  { bg: 'bg-blue-600', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', ring: 'ring-blue-400' },
  { bg: 'bg-violet-600', light: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', ring: 'ring-violet-400' },
  { bg: 'bg-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', ring: 'ring-emerald-400' },
  { bg: 'bg-orange-500', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', ring: 'ring-orange-400' },
];

const FIELDS: Array<{ key: keyof ICPItem; label: string; icon: React.ElementType; tooltip: string; multiline?: boolean }> = [
  { key: 'demographics', label: 'Demographics', icon: Users, tooltip: 'Age, location, company stage, and firmographic details.' },
  { key: 'psychographics', label: 'Psychographics', icon: Heart, tooltip: 'Mindset, values, reading habits, and aspirational identity.' },
  { key: 'painPoints', label: 'Pain Points', icon: Zap, tooltip: 'Core frustrations your product solves for this ICP.', multiline: true },
  { key: 'goals', label: 'Goals', icon: Target, tooltip: 'What this person is trying to achieve.', multiline: true },
  { key: 'channels', label: 'Channels', icon: Radio, tooltip: 'Where this ICP spends attention — best places to reach them.' },
];

export function ICPTab({ highlightId }: Props) {
  const [items, setItems] = useState<ICPItem[]>(icpData);
  const [selectedId, setSelectedId] = useState<string | null>(
    highlightId ?? icpData[0]?.id ?? null
  );
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<ICPItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const selected = items.find(i => i.id === selectedId) ?? null;
  const current = editMode && draft ? draft : selected;
  const colorIdx = (id: string) => items.findIndex(i => i.id === id) % ICP_COLORS.length;
  const color = (id: string) => ICP_COLORS[colorIdx(id)];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setEditMode(false);
    setDraft(null);
  };

  const handleEdit = () => {
    if (!selected) return;
    setDraft({ ...selected });
    setEditMode(true);
  };

  const handleSave = () => {
    if (!draft) return;
    setSaving(true);
    setTimeout(() => {
      setItems(prev => prev.map(i => i.id === draft.id ? draft : i));
      setEditMode(false);
      setDraft(null);
      setSaving(false);
    }, 500);
  };

  const handleAdd = () => {
    const newItem: ICPItem = {
      id: `icp-${Date.now()}`,
      segment: '',
      demographics: '',
      psychographics: '',
      painPoints: '',
      goals: '',
      channels: '',
      size: '',
    };
    setItems(prev => [...prev, newItem]);
    setSelectedId(newItem.id);
    setDraft(newItem);
    setEditMode(true);
  };

  const handleDuplicate = () => {
    if (!selected) return;
    const copy: ICPItem = {
      ...selected,
      id: `icp-${Date.now()}`,
      segment: selected.segment + ' (Copy)',
    };
    setItems(prev => [...prev, copy]);
    setSelectedId(copy.id);
    setEditMode(false);
    setDraft(null);
  };

  const handleDelete = () => {
    if (!selected) return;
    const remaining = items.filter(i => i.id !== selected.id);
    setItems(remaining);
    setSelectedId(remaining[0]?.id ?? null);
    setEditMode(false);
    setDraft(null);
  };

  return (
    <div className="h-full flex">
      {/* ── Left: ICP cards list ── */}
      <div className="w-72 border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-900 text-[13.5px]">ICPs</span>
            <button onClick={handleAdd} className="btn btn-primary btn-xs flex items-center gap-1">
              <Plus size={11} /> New ICP
            </button>
          </div>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search ICPs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-[12px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 w-full"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {items.filter(icp => {
            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return icp.segment.toLowerCase().includes(q) || icp.demographics.toLowerCase().includes(q);
          }).map(icp => {
            const c = color(icp.id);
            const isSelected = selectedId === icp.id;
            return (
              <button
                key={icp.id}
                onClick={() => handleSelect(icp.id)}
                className={`w-full text-left rounded-xl border p-3.5 transition-all
                  ${isSelected
                    ? `${c.border} ring-2 ${c.ring} bg-white`
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                  }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
                    <Users size={14} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-semibold text-gray-900 leading-snug truncate">
                      {icp.segment.split('—')[0].trim() || <span className="text-gray-400 font-normal italic">Untitled ICP</span>}
                    </div>
                    {icp.segment.includes('—') && (
                      <div className="text-[10.5px] text-gray-400 truncate">{icp.segment.split('—')[1]?.trim()}</div>
                    )}
                  </div>
                </div>
                <div className={`text-[11px] font-medium ${c.text} ${c.light} px-2 py-0.5 rounded-full inline-block`}>
                  {icp.size || 'Size TBD'}
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-4 py-2.5 border-t border-gray-100 text-[11px] text-gray-400">
          {items.length} segment{items.length !== 1 ? 's' : ''} defined
        </div>
      </div>

      {/* ── Right: detail view ── */}
      {current ? (
        <div className="flex-1 flex flex-col min-w-0 bg-[#f0f2f5]">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {selected && (
                <div className={`w-9 h-9 rounded-xl ${color(selected.id).bg} flex items-center justify-center flex-shrink-0`}>
                  <Users size={16} className="text-white" />
                </div>
              )}
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 text-[14.5px] truncate">
                  {editMode ? (
                    <input
                      className="field text-[14px] font-semibold"
                      value={draft!.segment}
                      onChange={e => setDraft(d => d ? { ...d, segment: e.target.value } : d)}
                      placeholder="Segment name — Role / Title"
                    />
                  ) : (
                    current.segment || <span className="text-gray-400 font-normal italic">Untitled ICP</span>
                  )}
                </div>
                {!editMode && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11.5px] text-gray-400">{current.size}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {editMode ? (
                <>
                  <button onClick={() => { setEditMode(false); setDraft(null); }} className="btn btn-secondary btn-sm">Discard</button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary btn-sm flex items-center gap-1.5"
                    style={{ background: '#0f1c3f' }}
                  >
                    {saving ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : <><Check size={12} /> Save</>}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleDuplicate} className="btn btn-secondary btn-sm flex items-center gap-1.5">
                    <Copy size={12} /> Duplicate
                  </button>
                  <button onClick={handleDelete} className="btn btn-secondary btn-sm flex items-center gap-1.5 text-red-500">
                    <Trash2 size={12} /> Delete
                  </button>
                  <button
                    onClick={handleEdit}
                    className="btn btn-primary btn-sm flex items-center gap-1.5"
                    style={{ background: '#0f1c3f' }}
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Fields grid */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Size field in edit mode */}
            {editMode && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <div className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide mb-2">TAM / Audience Size</div>
                <input
                  className="field text-[13px]"
                  value={draft!.size}
                  onChange={e => setDraft(d => d ? { ...d, size: e.target.value } : d)}
                  placeholder="e.g. ~85,000 in TAM"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {FIELDS.map(({ key, label, icon: Icon, tooltip, multiline }) => {
                const c = selected ? color(selected.id) : ICP_COLORS[0];
                return (
                  <div
                    key={key}
                    className={`bg-white rounded-xl border border-gray-200 p-4
                      ${key === 'painPoints' || key === 'goals' ? 'col-span-2 md:col-span-1' : ''}`}
                  >
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <div className={`w-6 h-6 rounded-md ${c.light} flex items-center justify-center`}>
                        <Icon size={12} className={c.text} />
                      </div>
                      <span className="text-[10.5px] font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
                      <Tooltip content={tooltip} />
                    </div>
                    {editMode ? (
                      multiline ? (
                        <textarea
                          className="field resize-none text-[12.5px]"
                          rows={3}
                          value={(draft as any)[key]}
                          onChange={e => setDraft(d => d ? { ...d, [key]: e.target.value } : d)}
                          placeholder={`${label}…`}
                        />
                      ) : (
                        <input
                          className="field text-[12.5px]"
                          value={(draft as any)[key]}
                          onChange={e => setDraft(d => d ? { ...d, [key]: e.target.value } : d)}
                          placeholder={`${label}…`}
                        />
                      )
                    ) : (
                      <p className="text-[12.5px] text-gray-700 leading-relaxed">
                        {(current as any)[key] || <span className="text-gray-300">Not defined</span>}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
          <div className="text-center">
            <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users size={20} className="text-gray-400" />
            </div>
            <p className="text-[13px] font-medium text-gray-500">Select an ICP to view details</p>
          </div>
        </div>
      )}
    </div>
  );
}
