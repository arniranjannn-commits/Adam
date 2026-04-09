import { useState } from 'react';
import { anglesData } from '../data/mockData';
import type { AngleItem } from '../data/mockData';
import { Check, X, Sparkles, Loader2, TrendingUp, ChevronUp, Plus, LayoutGrid, List } from 'lucide-react';

interface Props {
  highlightId?: string | null;
  onDataChange?: (data: AngleItem[]) => void;
}

const COLUMNS: Array<{
  id: AngleItem['status'];
  label: string;
  headerColor: string;
  countColor: string;
  bgColor: string;
  emptyText: string;
}> = [
  {
    id: 'pending',
    label: 'Pending Review',
    headerColor: 'text-yellow-700',
    countColor: 'bg-yellow-100 text-yellow-700',
    bgColor: 'bg-yellow-50/40',
    emptyText: 'No angles pending review',
  },
  {
    id: 'approved',
    label: 'Approved',
    headerColor: 'text-green-700',
    countColor: 'bg-green-100 text-green-700',
    bgColor: 'bg-green-50/40',
    emptyText: 'No approved angles yet',
  },
  {
    id: 'rejected',
    label: 'Rejected',
    headerColor: 'text-red-600',
    countColor: 'bg-red-100 text-red-600',
    bgColor: 'bg-red-50/30',
    emptyText: 'No rejected angles',
  },
];

const scoreStyle = (n: number) =>
  n >= 85
    ? 'text-green-700 bg-green-50 border-green-200'
    : n >= 70
    ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
    : 'text-red-600 bg-red-50 border-red-200';

const statusBadge: Record<AngleItem['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

export function AnglesTab({ highlightId, onDataChange }: Props) {
  const [angles, setAngles] = useState<AngleItem[]>(anglesData);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  const updateStatus = (id: string, status: AngleItem['status']) => {
    const next = angles.map(a => (a.id === id ? { ...a, status } : a));
    setAngles(next);
    onDataChange?.(next);
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const newAngle: AngleItem = {
        id: `angle-${Date.now()}`,
        title: 'The Trust Deficit',
        hook: "When was the last time you trusted a number without double-checking it?",
        category: 'Credibility Play',
        targetEmotion: 'Skepticism → Confidence',
        supportingData:
          'AI-generated based on current ICP pain points. 81% of analysts say data trust is their top barrier to action.',
        status: 'pending',
        score: 76,
      };
      const next = [...angles, newAngle];
      setAngles(next);
      onDataChange?.(next);
      setGenerating(false);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col">
      {/* ── Toolbar ── */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-gray-900 text-[13.5px]">Creative Angles</span>
          <div className="flex items-center gap-3 text-[12px]">
            <span className="text-green-600 font-medium">
              {angles.filter(a => a.status === 'approved').length} approved
            </span>
            <span className="text-yellow-600 font-medium">
              {angles.filter(a => a.status === 'pending').length} pending
            </span>
            <span className="text-red-500 font-medium">
              {angles.filter(a => a.status === 'rejected').length} rejected
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 mr-1">
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11.5px] font-medium transition-all
                ${view === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutGrid size={12} /> Board
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11.5px] font-medium transition-all
                ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List size={12} /> List
            </button>
          </div>
          <button className="btn btn-secondary btn-sm flex items-center gap-1.5">
            <Plus size={12} /> Add Angle
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
            style={{ background: '#0f1c3f' }}
          >
            {generating ? (
              <><Loader2 size={12} className="animate-spin" /> Generating…</>
            ) : (
              <><Sparkles size={12} /> Generate with AI</>
            )}
          </button>
        </div>
      </div>

      {/* ── Views ── */}
      {view === 'kanban' ? (
        <KanbanView
          angles={angles}
          generating={generating}
          expanded={expanded}
          highlightId={highlightId}
          setExpanded={setExpanded}
          updateStatus={updateStatus}
        />
      ) : (
        <ListView
          angles={angles}
          expanded={expanded}
          highlightId={highlightId}
          setExpanded={setExpanded}
          updateStatus={updateStatus}
        />
      )}
    </div>
  );
}

/* ─────────────────── Kanban View ─────────────────── */
function KanbanView({
  angles, generating, expanded, highlightId, setExpanded, updateStatus,
}: {
  angles: AngleItem[];
  generating: boolean;
  expanded: string | null;
  highlightId?: string | null;
  setExpanded: (id: string | null) => void;
  updateStatus: (id: string, s: AngleItem['status']) => void;
}) {
  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden">
      <div className="h-full flex gap-0 min-w-[720px]">
        {COLUMNS.map((col, colIdx) => {
          const colAngles = angles.filter(a => a.status === col.id);
          return (
            <div
              key={col.id}
              className={`flex flex-col min-w-[280px] flex-1 ${colIdx < COLUMNS.length - 1 ? 'border-r border-gray-200' : ''}`}
            >
              {/* Column header */}
              <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-[12.5px] ${col.headerColor}`}>{col.label}</span>
                  <span className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded-full ${col.countColor}`}>
                    {colAngles.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className={`flex-1 overflow-y-auto p-3 space-y-2.5 ${col.bgColor}`}>
                {colAngles.map(angle => (
                  <AngleCard
                    key={angle.id}
                    angle={angle}
                    highlighted={highlightId === angle.id}
                    expanded={expanded === angle.id}
                    onToggle={() => setExpanded(expanded === angle.id ? null : angle.id)}
                    onApprove={() => updateStatus(angle.id, 'approved')}
                    onReject={() => updateStatus(angle.id, 'rejected')}
                    onReset={() => updateStatus(angle.id, 'pending')}
                  />
                ))}
                {colAngles.length === 0 && !generating && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-10 h-10 bg-white border border-dashed border-gray-200 rounded-xl flex items-center justify-center mb-3">
                      {col.id === 'approved' ? (
                        <Check size={16} className="text-gray-300" />
                      ) : col.id === 'rejected' ? (
                        <X size={16} className="text-gray-300" />
                      ) : (
                        <TrendingUp size={16} className="text-gray-300" />
                      )}
                    </div>
                    <p className="text-[12px] text-gray-400">{col.emptyText}</p>
                  </div>
                )}
                {generating && col.id === 'pending' && (
                  <div className="bg-white border border-dashed border-blue-200 rounded-xl p-4 animate-pulse">
                    <div className="flex items-center gap-2 mb-3">
                      <Loader2 size={13} className="animate-spin text-blue-400" />
                      <span className="text-[12px] text-blue-400 font-medium">Generating angle…</span>
                    </div>
                    <div className="h-3 bg-blue-50 rounded mb-2 w-3/4" />
                    <div className="h-3 bg-blue-50 rounded mb-2 w-full" />
                    <div className="h-3 bg-blue-50 rounded w-1/2" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────── List View ─────────────────── */
function ListView({
  angles, expanded, highlightId, setExpanded, updateStatus,
}: {
  angles: AngleItem[];
  expanded: string | null;
  highlightId?: string | null;
  setExpanded: (id: string | null) => void;
  updateStatus: (id: string, s: AngleItem['status']) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#f7f8fa]">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <tr>
            <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-[35%]">Angle</th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-[15%]">Category</th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-[18%]">Emotion Arc</th>
            <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-[8%]">Score</th>
            <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-[10%]">Status</th>
            <th className="text-right px-5 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-[14%]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {angles.map((angle) => (
            <>
              <tr
                key={angle.id}
                onClick={() => setExpanded(expanded === angle.id ? null : angle.id)}
                className={`cursor-pointer border-b border-gray-100 transition-colors
                  ${highlightId === angle.id ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}
                  ${angle.status === 'rejected' ? 'opacity-60' : ''}`}
              >
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-gray-900 text-[13px] leading-snug">{angle.title}</div>
                  <div className="text-[11.5px] text-gray-400 italic mt-0.5 line-clamp-1">"{angle.hook}"</div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="badge badge-purple text-[10.5px]">{angle.category}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1 text-[11.5px] text-blue-500">
                    <TrendingUp size={10} />
                    <span>{angle.targetEmotion}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`text-[12px] font-bold px-2 py-0.5 rounded-lg border inline-flex items-center gap-0.5 ${scoreStyle(angle.score)}`}>
                    {angle.score}
                    {angle.score >= 85 && <ChevronUp size={9} />}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusBadge[angle.status]}`}>
                    {angle.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                    {angle.status !== 'approved' && (
                      <button
                        onClick={() => updateStatus(angle.id, 'approved')}
                        className="btn btn-success btn-xs flex items-center gap-1"
                      >
                        <Check size={10} /> Approve
                      </button>
                    )}
                    {angle.status !== 'rejected' && (
                      <button
                        onClick={() => updateStatus(angle.id, 'rejected')}
                        className="btn btn-danger btn-xs flex items-center gap-1"
                      >
                        <X size={10} /> Reject
                      </button>
                    )}
                    {angle.status !== 'pending' && (
                      <button
                        onClick={() => updateStatus(angle.id, 'pending')}
                        className="btn btn-secondary btn-xs"
                      >
                        Pending
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              {expanded === angle.id && (
                <tr key={`${angle.id}-exp`} className="bg-blue-50/50 border-b border-blue-100">
                  <td colSpan={6} className="px-5 py-3">
                    <div className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Supporting Data</div>
                    <div className="text-[12.5px] text-gray-600 leading-relaxed">{angle.supportingData}</div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────── Angle Card (Kanban) ─────────────────── */
function AngleCard({
  angle, highlighted, expanded, onToggle, onApprove, onReject, onReset,
}: {
  angle: AngleItem;
  highlighted?: boolean;
  expanded: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: () => void;
  onReset: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl border transition-all cursor-pointer
        ${highlighted ? 'ring-2 ring-blue-400 border-blue-200' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}
        ${angle.status === 'rejected' ? 'opacity-60' : ''}`}
    >
      <div className="p-4" onClick={onToggle}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="font-semibold text-gray-900 text-[13px] leading-snug flex-1 min-w-0">
            {angle.title}
          </div>
          <div className={`flex-shrink-0 text-[12px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-0.5 ${scoreStyle(angle.score)}`}>
            {angle.score}
            {angle.score >= 85 && <ChevronUp size={10} />}
          </div>
        </div>
        <div className="text-[11.5px] text-gray-500 italic mb-2.5 leading-relaxed line-clamp-2">
          "{angle.hook}"
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="badge badge-purple text-[10px]">{angle.category}</span>
          <div className="flex items-center gap-1 text-[11px] text-blue-500">
            <TrendingUp size={9} />
            <span>{angle.targetEmotion}</span>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-3 border-t border-gray-50">
          <div className="pt-3 text-[11.5px] text-gray-500 leading-relaxed mb-3">
            <span className="font-semibold text-gray-400 uppercase text-[10px] tracking-wide block mb-1">Supporting Data</span>
            {angle.supportingData}
          </div>
        </div>
      )}

      <div className="px-4 pb-3 flex items-center gap-1.5">
        {angle.status !== 'approved' && (
          <button onClick={(e) => { e.stopPropagation(); onApprove(); }} className="btn btn-success btn-xs flex items-center gap-1 flex-1 justify-center">
            <Check size={10} /> Approve
          </button>
        )}
        {angle.status !== 'rejected' && (
          <button onClick={(e) => { e.stopPropagation(); onReject(); }} className="btn btn-danger btn-xs flex items-center gap-1 flex-1 justify-center">
            <X size={10} /> Reject
          </button>
        )}
        {angle.status !== 'pending' && (
          <button onClick={(e) => { e.stopPropagation(); onReset(); }} className="btn btn-secondary btn-xs flex-1 justify-center">
            Move to Pending
          </button>
        )}
      </div>
    </div>
  );
}
