import { useState } from 'react';
import { messagingData } from '../data/mockData';
import type { MessagingItem } from '../data/mockData';
import { Plus, Check, Archive, Copy, Edit3, TrendingUp, Loader2 } from 'lucide-react';

const CHANNELS = ['Paid Social', 'Search', 'LinkedIn', 'Display', 'YouTube', 'Email'];
const TONES = [
  'Urgent / Practical',
  'Competitive / FOMO',
  'Aspirational / Clarity',
  'Social Proof / Trust',
  'Educational / Empowering',
];

const statusConfig = {
  active: { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700 hover:bg-green-200', label: 'Active' },
  draft: { dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200', label: 'Draft' },
  archived: { dot: 'bg-gray-300', badge: 'bg-gray-100 text-gray-500 hover:bg-gray-200', label: 'Archived' },
};

interface Props {
  highlightId?: string | null;
}

export function MessagingTab({ highlightId }: Props) {
  const [items, setItems] = useState<MessagingItem[]>(messagingData);
  const [selectedId, setSelectedId] = useState<string | null>(
    highlightId ?? messagingData[0]?.id ?? null
  );
  const [filter, setFilter] = useState<'all' | 'active' | 'draft'>('all');
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<MessagingItem | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = items.filter(m =>
    filter === 'all' ? true : m.status === filter
  );
  const selected = items.find(m => m.id === selectedId) ?? null;
  const current = editMode && draft ? draft : selected;

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
      setItems(prev => prev.map(m => m.id === draft.id ? draft : m));
      setEditMode(false);
      setDraft(null);
      setSaving(false);
    }, 600);
  };

  const handleDiscard = () => {
    setEditMode(false);
    setDraft(null);
  };

  const handleAdd = () => {
    const newItem: MessagingItem = {
      id: `msg-${Date.now()}`,
      headline: '',
      subheadline: '',
      valueProposition: '',
      cta: '',
      tone: '',
      channel: '',
      status: 'draft',
    };
    setItems(prev => [...prev, newItem]);
    setSelectedId(newItem.id);
    setDraft(newItem);
    setEditMode(true);
    setFilter('all');
  };

  const handleDelete = () => {
    if (!selected) return;
    const remaining = items.filter(m => m.id !== selected.id);
    setItems(remaining);
    setSelectedId(remaining[0]?.id ?? null);
    setEditMode(false);
    setDraft(null);
  };

  const handleDuplicate = () => {
    if (!selected) return;
    const copy: MessagingItem = {
      ...selected,
      id: `msg-${Date.now()}`,
      headline: selected.headline + ' (Copy)',
      status: 'draft',
    };
    setItems(prev => [...prev, copy]);
    setSelectedId(copy.id);
    setEditMode(false);
    setDraft(null);
  };

  const cycleStatus = (id: string) => {
    const order: MessagingItem['status'][] = ['active', 'draft', 'archived'];
    setItems(prev =>
      prev.map(m =>
        m.id === id ? { ...m, status: order[(order.indexOf(m.status) + 1) % 3] } : m
      )
    );
  };

  return (
    <div className="h-full flex">
      {/* ── Left sidebar ── */}
      <div className="w-72 border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
        {/* Sidebar header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-900 text-[13.5px]">Messaging</span>
            <button onClick={handleAdd} className="btn btn-primary btn-xs flex items-center gap-1">
              <Plus size={11} /> New
            </button>
          </div>
          {/* Filter tabs */}
          <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
            {(['all', 'active', 'draft'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 text-[11px] font-medium py-1 rounded-md transition-all capitalize
                  ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(msg => {
            const sc = statusConfig[msg.status];
            return (
              <button
                key={msg.id}
                onClick={() => handleSelect(msg.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors
                  ${selectedId === msg.id ? 'bg-blue-50 border-l-[3px] border-l-blue-500' : 'border-l-[3px] border-l-transparent'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-medium text-gray-900 truncate leading-snug">
                      {msg.headline || <span className="text-gray-400 italic">Untitled</span>}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5 truncate">{msg.channel || 'No channel'}</div>
                  </div>
                  <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${sc.dot}`} />
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-[12px] text-gray-400">No messages</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span>{items.filter(m => m.status === 'active').length} active</span>
          <span>{items.length} total</span>
        </div>
      </div>

      {/* ── Right detail panel ── */}
      {current ? (
        <div className="flex-1 flex flex-col min-w-0 bg-[#f0f2f5]">
          {/* Detail header */}
          <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
            <div>
              <div className="font-semibold text-gray-900 text-[14.5px] leading-snug">
                {current.headline || <span className="text-gray-400 font-normal italic">Untitled Messaging</span>}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {selected && !editMode && (
                  <button
                    onClick={() => cycleStatus(selected.id)}
                    className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full transition-colors ${statusConfig[current.status].badge}`}
                  >
                    {statusConfig[current.status].label}
                  </button>
                )}
                {current.tone && (
                  <span className="text-[11.5px] text-gray-400">{current.tone}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editMode ? (
                <>
                  <button onClick={handleDiscard} className="btn btn-secondary btn-sm">
                    Discard
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary btn-sm flex items-center gap-1.5"
                    style={{ background: '#0f1c3f' }}
                  >
                    {saving ? (
                      <><Loader2 size={12} className="animate-spin" /> Saving…</>
                    ) : (
                      <><Check size={12} /> Save</>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleDuplicate}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5"
                  >
                    <Copy size={12} /> Duplicate
                  </button>
                  <button
                    onClick={handleDelete}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5 text-red-500 hover:text-red-600"
                  >
                    <Archive size={12} /> Delete
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

          {/* Fields */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="space-y-4">

              {/* Headline card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Headline &amp; Subheadline
                </div>
                {editMode ? (
                  <div className="space-y-2">
                    <input
                      className="field text-[15px] font-semibold"
                      value={draft!.headline}
                      onChange={e => setDraft(d => d ? { ...d, headline: e.target.value } : d)}
                      placeholder="Primary headline…"
                    />
                    <input
                      className="field text-[13px]"
                      value={draft!.subheadline}
                      onChange={e => setDraft(d => d ? { ...d, subheadline: e.target.value } : d)}
                      placeholder="Subheadline…"
                    />
                  </div>
                ) : (
                  <>
                    <div className="text-[18px] font-semibold text-gray-900 leading-snug mb-1.5">
                      {current.headline || <span className="text-gray-300 font-normal">No headline</span>}
                    </div>
                    <div className="text-[13px] text-gray-500">{current.subheadline}</div>
                  </>
                )}
              </div>

              {/* Value proposition */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Value Proposition
                </div>
                {editMode ? (
                  <textarea
                    className="field resize-none"
                    rows={4}
                    value={draft!.valueProposition}
                    onChange={e => setDraft(d => d ? { ...d, valueProposition: e.target.value } : d)}
                    placeholder="Core benefit or promise to the audience…"
                  />
                ) : (
                  <div className="text-[13.5px] text-gray-700 leading-relaxed">
                    {current.valueProposition || <span className="text-gray-300">Not defined</span>}
                  </div>
                )}
              </div>

              {/* Tone + Channel + CTA */}
              <div className="grid grid-cols-3 gap-3 w-full">
                {[
                  { label: 'Tone', key: 'tone' as const, options: TONES, display: (v: string) => <span className="badge badge-blue">{v || '—'}</span> },
                  { label: 'Channel', key: 'channel' as const, options: CHANNELS, display: (v: string) => <span className="text-[13px] font-medium text-gray-800">{v || '—'}</span> },
                  { label: 'CTA', key: 'cta' as const, options: null, display: (v: string) => <span className="badge badge-gray">{v || '—'}</span> },
                ].map(({ label, key, options, display }) => (
                  <div key={key} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</div>
                    {editMode ? (
                      options ? (
                        <select
                          className="field text-[12px]"
                          value={(draft as any)[key]}
                          onChange={e => setDraft(d => d ? { ...d, [key]: e.target.value } : d)}
                        >
                          <option value="">Select…</option>
                          {options.map(o => <option key={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          className="field text-[12px]"
                          value={(draft as any)[key]}
                          onChange={e => setDraft(d => d ? { ...d, [key]: e.target.value } : d)}
                          placeholder={`${label}…`}
                        />
                      )
                    ) : (
                      display((current as any)[key])
                    )}
                  </div>
                ))}
              </div>

              {/* Usage info */}
              {!editMode && (
                <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
                  <div className="text-[10.5px] font-semibold text-blue-500 uppercase tracking-wide mb-2">Usage in Briefs</div>
                  <p className="text-[12.5px] text-blue-700">
                    This messaging pillar is referenced across multiple Ad Briefs. Changes here propagate to all linked briefs.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
          <div className="text-center">
            <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={20} className="text-gray-400" />
            </div>
            <p className="text-[13px] font-medium text-gray-500">Select a message to view details</p>
            <p className="text-[11.5px] text-gray-400 mt-1">or create a new one</p>
          </div>
        </div>
      )}
    </div>
  );
}
