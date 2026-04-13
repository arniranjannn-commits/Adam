import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag, ChevronDown, ChevronRight, Search, Plus, X,
  Copy, Save, MoreHorizontal, Calendar, SlidersHorizontal,
  CheckCheck, TrendingUp, Trash2, GripVertical,
} from 'lucide-react';

// ── Meta logo icon ────────────────────────────────────────────────────────────
function MetaIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size * 0.65} viewBox="0 0 32 20" fill="currentColor" className={className}>
      <path d="M16 10C14.4 7.2 12.2 5.2 9.8 5.2C6.6 5.2 4 7.8 4 10C4 12.2 6.6 14.8 9.8 14.8C12.2 14.8 14.4 12.8 16 10Z"/>
      <path d="M16 10C17.6 7.2 19.8 5.2 22.2 5.2C25.4 5.2 28 7.8 28 10C28 12.2 25.4 14.8 22.2 14.8C19.8 14.8 17.6 12.8 16 10Z"/>
    </svg>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface FilterValue { id: string; text: string; }

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  values: FilterValue[];
  inputText: string;
}

interface FilterGroup {
  id: string;
  matchMode: 'All' | 'Any' | 'None';
  conditions: FilterCondition[];
}

interface HeadlineRow {
  id: string; headline: string; activeAds: number; launchDate: string;
  ctr: number; impressions: number; amountSpent: number; purchaseRoas: number;
  conversions: number; angleType: string;
}

// ── Constants & mock data ────────────────────────────────────────────────────

const mkId = () => Math.random().toString(36).slice(2, 8);

const TAB_FIELDS: Record<string, string[]> = {
  tag:       ['Angle Type', 'Campaign Type', 'Creator', 'Season', 'Product Line', 'Campaign Goal'],
  metric:    ['CTR (All)', 'Purchase ROAS', 'Amount Spent', 'Impressions', 'Conversions', 'CPC'],
  dimension: ['Platform', 'Format', 'Placement', 'Age Group', 'Gender', 'Region'],
};
const TAB_OPERATORS: Record<string, string[]> = {
  tag:       ['is', 'is not', 'contains', 'does not contain'],
  metric:    ['is', 'greater than', 'less than', 'greater than or equal to', 'between'],
  dimension: ['is', 'is not', 'contains', 'does not contain'],
};
const MATCH_JOINER: Record<string, string> = { All: 'AND', Any: 'OR', None: 'NOT' };

const HEADLINE_DATA: HeadlineRow[] = [
  { id: '1',  headline: 'Why I Created This Jap Counter — A Note From Our Founder', activeAds: 1, launchDate: '2026-01-26', ctr: 6.61, impressions: 824880,  amountSpent: 100520, purchaseRoas: 3.03, conversions: 145, angleType: 'Fresh Angles' },
  { id: '2',  headline: 'Stay Present. Let the Journey Unfold Naturally',            activeAds: 2, launchDate: '2025-12-10', ctr: 4.20, impressions: 1240000, amountSpent: 780000, purchaseRoas: 3.18, conversions: 210, angleType: 'Clone Angles' },
  { id: '3',  headline: 'New Year, New Bhakti Practice — Start Today',               activeAds: 1, launchDate: '2026-01-01', ctr: 3.80, impressions: 380000,  amountSpent: 220000, purchaseRoas: 2.60, conversions: 88,  angleType: 'Iteration Angles' },
  { id: '4',  headline: 'Why I Created This Journey — Founder Story',                activeAds: 3, launchDate: '2025-11-15', ctr: 5.20, impressions: 980000,  amountSpent: 460000, purchaseRoas: 2.40, conversions: 175, angleType: 'Clone Angles' },
  { id: '5',  headline: 'COD Available | 24 Hour Delivery Guaranteed',               activeAds: 1, launchDate: '2026-02-05', ctr: 7.10, impressions: 220000,  amountSpent: 150000, purchaseRoas: 1.80, conversions: 62,  angleType: 'Fresh Angles' },
  { id: '6',  headline: 'Stay Focused While the World Rushes',                       activeAds: 1, launchDate: '2026-02-14', ctr: 3.10, impressions: 110000,  amountSpent: 90000,  purchaseRoas: 1.50, conversions: 40,  angleType: 'Iteration Angles' },
  { id: '7',  headline: 'The Practice That Changed 10,000 Lives',                    activeAds: 2, launchDate: '2026-01-10', ctr: 4.80, impressions: 560000,  amountSpent: 310000, purchaseRoas: 2.90, conversions: 128, angleType: 'Clone Angles' },
  { id: '8',  headline: 'Build a Daily Habit in 7 Days — Proven Method',             activeAds: 1, launchDate: '2026-02-20', ctr: 5.50, impressions: 340000,  amountSpent: 190000, purchaseRoas: 2.20, conversions: 96,  angleType: 'Iteration Angles' },
  { id: '9',  headline: 'From Chaos to Clarity — A Simple Morning Ritual',           activeAds: 2, launchDate: '2025-12-28', ctr: 6.20, impressions: 720000,  amountSpent: 410000, purchaseRoas: 3.40, conversions: 188, angleType: 'Fresh Angles' },
  { id: '10', headline: 'Trusted by 500+ Fast-Growing Spiritual Communities',        activeAds: 1, launchDate: '2025-11-30', ctr: 2.90, impressions: 460000,  amountSpent: 270000, purchaseRoas: 1.90, conversions: 72,  angleType: 'Clone Angles' },
  { id: '11', headline: 'What Happens When You Chant Daily for 30 Days',             activeAds: 3, launchDate: '2026-03-01', ctr: 5.90, impressions: 890000,  amountSpent: 510000, purchaseRoas: 2.75, conversions: 162, angleType: 'Iteration Angles' },
  { id: '12', headline: 'Stop Wasting Time on Manual Tracking',                      activeAds: 1, launchDate: '2026-02-08', ctr: 4.40, impressions: 190000,  amountSpent: 115000, purchaseRoas: 2.10, conversions: 54,  angleType: 'Fresh Angles' },
];

const DEFAULT_REPORTS = [
  { id: 'top-headlines', label: 'Top Headlines' },
  { id: 'top-landing',   label: 'Top Landing Pages' },
  { id: 'top-ctas',      label: 'Top CTAs' },
  { id: 'top-copies',    label: 'Top Ad Copies' },
];

const ANGLE_TABS = ['All', 'Clone Angles', 'Iteration Angles', 'Fresh Angles'];
const ANGLE_COUNTS: Record<string, number> = { All: 12, 'Clone Angles': 4, 'Iteration Angles': 4, 'Fresh Angles': 4 };

// ── Charts ────────────────────────────────────────────────────────────────────

function ScatterChart({ data }: { data: HeadlineRow[] }) {
  const W = 380, H = 220, P = { t: 12, r: 12, b: 36, l: 48 };
  const cw = W - P.l - P.r, ch = H - P.t - P.b;
  const maxX = Math.max(...data.map(d => d.amountSpent));
  const maxY = Math.max(...data.map(d => d.purchaseRoas));
  const maxC = Math.max(...data.map(d => d.conversions));
  const sx = (v: number) => P.l + (v / maxX) * cw;
  const sy = (v: number) => P.t + ch - (v / maxY) * ch;
  const sr = (v: number) => 4 + (v / maxC) * 8;
  const COLORS = ['#7c3aed', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
  const yTicks = [0, 1, 2, 3].filter(v => v <= maxY + 0.5);
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map(r => ({ v: maxX * r, label: maxX * r === 0 ? '0' : `${Math.round(maxX * r / 1000)}K` }));
  return (
    <svg width={W} height={H} className="overflow-visible">
      {yTicks.map(t => (
        <g key={t}>
          <line x1={P.l} y1={sy(t)} x2={P.l + cw} y2={sy(t)} stroke="#f0f0f0" />
          <text x={P.l - 6} y={sy(t) + 4} textAnchor="end" fontSize={9} fill="#9ca3af">{t.toFixed(1)}</text>
        </g>
      ))}
      {xTicks.map(t => (
        <g key={t.v}>
          <line x1={sx(t.v)} y1={P.t} x2={sx(t.v)} y2={P.t + ch} stroke="#f0f0f0" />
          <text x={sx(t.v)} y={P.t + ch + 14} textAnchor="middle" fontSize={9} fill="#9ca3af">{t.label}</text>
        </g>
      ))}
      <text x={P.l + cw / 2} y={H - 2} textAnchor="middle" fontSize={10} fill="#6b7280">Amount Spent</text>
      <text x={12} y={P.t + ch / 2} textAnchor="middle" fontSize={10} fill="#6b7280" transform={`rotate(-90,12,${P.t + ch / 2})`}>Purchase ROAS</text>
      {data.map((d, i) => (
        <circle key={d.id} cx={sx(d.amountSpent)} cy={sy(d.purchaseRoas)} r={sr(d.conversions)}
          fill={COLORS[i % COLORS.length]} fillOpacity={0.75} stroke="white" strokeWidth={1.5}>
          <title>{d.headline.slice(0, 40)} — ROAS: {d.purchaseRoas}</title>
        </circle>
      ))}
    </svg>
  );
}

function BarChart({ data }: { data: HeadlineRow[] }) {
  const sorted = [...data].sort((a, b) => b.amountSpent - a.amountSpent).slice(0, 10);
  const maxVal = sorted[0]?.amountSpent ?? 1;
  return (
    <div className="space-y-1.5 pt-1">
      {sorted.map(row => (
        <div key={row.id} className="flex items-center gap-2">
          <div className="w-28 text-[10.5px] text-gray-600 text-right truncate flex-shrink-0">
            {row.headline.split(' ').slice(0, 3).join(' ')}…
          </div>
          <div className="flex-1 h-4 bg-gray-100 rounded-sm overflow-hidden">
            <div className="h-full rounded-sm bg-indigo-500" style={{ width: `${(row.amountSpent / maxVal) * 100}%` }} />
          </div>
          <div className="text-[10.5px] text-gray-500 w-14 flex-shrink-0">{(row.amountSpent / 1000).toFixed(0)}K</div>
        </div>
      ))}
    </div>
  );
}

// ── Pill input ────────────────────────────────────────────────────────────────

function PillInput({ condition, matchMode, onAddValue, onRemoveValue, onUpdateInput }: {
  condition: FilterCondition;
  matchMode: FilterGroup['matchMode'];
  onAddValue: (text: string) => void;
  onRemoveValue: (id: string) => void;
  onUpdateInput: (text: string) => void;
}) {
  const joiner = MATCH_JOINER[matchMode];
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && condition.inputText.trim()) {
      onAddValue(condition.inputText.trim());
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-1 min-h-[32px] px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white transition-colors">
      {condition.values.map((v, i) => (
        <React.Fragment key={v.id}>
          {i > 0 && <span className="text-[10px] font-bold text-gray-400">{joiner}</span>}
          <span className="flex items-center gap-1 bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[11px] font-medium">
            {v.text}
            <button onClick={() => onRemoveValue(v.id)} className="hover:text-blue-200 transition-colors ml-0.5">
              <X size={9} />
            </button>
          </span>
        </React.Fragment>
      ))}
      {condition.values.length > 0 && <span className="text-[10px] font-bold text-gray-400">{joiner}</span>}
      <input
        value={condition.inputText}
        onChange={e => onUpdateInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder={condition.values.length === 0 ? 'Type a value…' : 'Add another…'}
        className="flex-1 min-w-[80px] text-[12px] bg-transparent outline-none text-gray-700 placeholder-gray-400"
      />
      <button
        onClick={() => { if (condition.inputText.trim()) onAddValue(condition.inputText.trim()); }}
        className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-200 text-gray-500 flex-shrink-0 transition-colors">
        <Plus size={11} />
      </button>
    </div>
  );
}

// ── Condition row ─────────────────────────────────────────────────────────────

function ConditionRow({ condition, matchMode, fieldOptions, operatorOptions, onUpdate, onRemove }: {
  condition: FilterCondition;
  matchMode: FilterGroup['matchMode'];
  fieldOptions: string[];
  operatorOptions: string[];
  onUpdate: (fn: (c: FilterCondition) => FilterCondition) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-2 items-start group">
      <GripVertical size={13} className="text-gray-300 cursor-grab flex-shrink-0 mt-2" />
      <div className="flex gap-1.5 flex-shrink-0 pt-0.5">
        <select value={condition.field} onChange={e => onUpdate(c => ({ ...c, field: e.target.value }))}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11.5px] text-gray-700 bg-white focus:outline-none focus:border-blue-400 cursor-pointer">
          {fieldOptions.map(f => <option key={f}>{f}</option>)}
        </select>
        <select value={condition.operator} onChange={e => onUpdate(c => ({ ...c, operator: e.target.value }))}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11.5px] text-gray-700 bg-white focus:outline-none focus:border-blue-400 cursor-pointer">
          {operatorOptions.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="flex-1 min-w-0">
        <PillInput
          condition={condition} matchMode={matchMode}
          onAddValue={text => onUpdate(c => ({ ...c, inputText: '', values: [...c.values, { id: mkId(), text }] }))}
          onRemoveValue={id => onUpdate(c => ({ ...c, values: c.values.filter(v => v.id !== id) }))}
          onUpdateInput={text => onUpdate(c => ({ ...c, inputText: text }))}
        />
      </div>
      <button onClick={onRemove}
        className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
        <Trash2 size={12} className="text-red-400" />
      </button>
    </div>
  );
}

// ── Filter group card ─────────────────────────────────────────────────────────

function buildGroupPreview(group: FilterGroup): string {
  const j = ` ${MATCH_JOINER[group.matchMode]} `;
  const parts = group.conditions
    .filter(c => c.values.length > 0)
    .map(c => `${c.field}: ${c.values.map(v => `"${v.text}"`).join(j)}`);
  return parts.length ? `(${parts.join(j)})` : '';
}

function FilterGroupCard({ group, groupIndex, fieldOptions, operatorOptions, onUpdate, onRemove }: {
  group: FilterGroup;
  groupIndex: number;
  fieldOptions: string[];
  operatorOptions: string[];
  onUpdate: (fn: (g: FilterGroup) => FilterGroup) => void;
  onRemove: () => void;
}) {
  const preview = buildGroupPreview(group);
  const addCondition = () => onUpdate(g => ({
    ...g, conditions: [...g.conditions, { id: mkId(), field: fieldOptions[0], operator: operatorOptions[0], values: [], inputText: '' }],
  }));
  const removeCondition = (id: string) => onUpdate(g => ({ ...g, conditions: g.conditions.filter(c => c.id !== id) }));
  const updateCondition = (id: string, fn: (c: FilterCondition) => FilterCondition) =>
    onUpdate(g => ({ ...g, conditions: g.conditions.map(c => c.id === id ? fn(c) : c) }));

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Group header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-200">
        <GripVertical size={13} className="text-gray-300 cursor-grab flex-shrink-0" />
        <span className="text-[12px] font-semibold text-gray-700 flex-1">Group {groupIndex + 1}</span>
        <span className="text-[11.5px] text-gray-500">Include</span>
        <select value={group.matchMode}
          onChange={e => onUpdate(g => ({ ...g, matchMode: e.target.value as FilterGroup['matchMode'] }))}
          className="border border-gray-200 rounded-lg px-2 py-0.5 text-[11.5px] font-semibold text-gray-700 bg-white focus:outline-none focus:border-blue-400 cursor-pointer">
          {['All', 'Any', 'None'].map(m => <option key={m}>{m}</option>)}
        </select>
        <span className="text-[11.5px] text-gray-500">of these items</span>
        <button onClick={onRemove} className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center ml-1 flex-shrink-0 transition-colors">
          <Trash2 size={12} className="text-red-400" />
        </button>
      </div>

      {/* Conditions */}
      <div className="p-3 space-y-2 bg-white">
        {group.conditions.length > 0 && (
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Search term</div>
        )}
        {group.conditions.map(c => (
          <ConditionRow key={c.id}
            condition={c} matchMode={group.matchMode}
            fieldOptions={fieldOptions} operatorOptions={operatorOptions}
            onUpdate={fn => updateCondition(c.id, fn)}
            onRemove={() => removeCondition(c.id)}
          />
        ))}
        <button onClick={addCondition}
          className="flex items-center gap-1.5 text-[12px] text-blue-600 font-medium hover:text-blue-700 transition-colors mt-1">
          <Plus size={12} /> Add Filter
        </button>
      </div>

      {/* Per-group query preview */}
      {preview && (
        <div className="px-3 pb-3 bg-white">
          <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 font-mono text-[11px] text-gray-500 leading-relaxed break-all">
            {preview}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Advanced Filters popup ────────────────────────────────────────────────────

function AdvancedFiltersPopup({ onClose, onApply }: {
  onClose: () => void;
  onApply: (groups: FilterGroup[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<'tag' | 'metric' | 'dimension'>('tag');
  const [groups, setGroups] = useState<FilterGroup[]>([
    { id: mkId(), matchMode: 'All', conditions: [] },
  ]);

  const fieldOptions = TAB_FIELDS[activeTab];
  const operatorOptions = TAB_OPERATORS[activeTab];
  const globalPreview = groups.map(buildGroupPreview).filter(Boolean).join(' AND ');

  const addGroup = () => setGroups(g => [...g, {
    id: mkId(), matchMode: 'All',
    conditions: [{ id: mkId(), field: fieldOptions[0], operator: operatorOptions[0], values: [], inputText: '' }],
  }]);
  const removeGroup = (id: string) => setGroups(g => g.filter(x => x.id !== id));
  const updateGroup = (id: string, fn: (g: FilterGroup) => FilterGroup) =>
    setGroups(gs => gs.map(g => g.id === id ? fn(g) : g));

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute left-0 top-full mt-2 w-[540px] bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 flex flex-col overflow-hidden"
        style={{ maxHeight: '76vh' }}>

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <div className="font-semibold text-gray-900 text-[14px]">Advanced Filters</div>
            <div className="text-[11.5px] text-gray-400 mt-0.5">Type values and press Enter. Select include/exclude logic per group.</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center mt-0.5">
            <X size={14} className="text-gray-400" />
          </button>
        </div>

        {/* Type tabs */}
        <div className="flex border-b border-gray-100 px-5 flex-shrink-0">
          {(['tag', 'metric', 'dimension'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-[13px] font-medium border-b-2 capitalize transition-all
                ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Match conditions header */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-gray-50/60 border-b border-gray-100 flex-shrink-0">
          <span className="text-[12.5px] font-semibold text-gray-700">Match conditions</span>
          <select className="border border-gray-200 rounded-lg px-2.5 py-1 text-[12px] text-gray-700 bg-white focus:outline-none focus:border-blue-400 cursor-pointer">
            <option>Match all</option>
            <option>Match any</option>
          </select>
        </div>

        {/* Groups */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {groups.map((group, i) => (
            <FilterGroupCard key={group.id}
              group={group} groupIndex={i}
              fieldOptions={fieldOptions} operatorOptions={operatorOptions}
              onUpdate={fn => updateGroup(group.id, fn)}
              onRemove={() => removeGroup(group.id)}
            />
          ))}

          <button onClick={addGroup}
            className="flex items-center gap-2 text-[12.5px] text-blue-600 font-medium hover:text-blue-700 transition-colors py-1">
            <Plus size={13} /> Add group
          </button>

          {/* Resulting query preview */}
          {globalPreview && (
            <div className="mt-1">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">resulting search term:</div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 font-mono text-[11px] text-gray-600 leading-relaxed break-all">
                {globalPreview}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button onClick={() => setGroups([])}
            className="text-[12px] text-gray-500 hover:text-red-500 font-medium transition-colors">
            Clear
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn btn-secondary btn-sm text-[12px]">Cancel</button>
            <button onClick={() => { onApply(groups); onClose(); }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12.5px] font-semibold text-white transition-all"
              style={{ background: '#0f1c3f' }}>
              <CheckCheck size={12} /> Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AdAccountTab() {
  const [activeReport, setActiveReport] = useState('top-headlines');
  const [angleTab, setAngleTab]         = useState('All');
  const [search, setSearch]             = useState('');
  const [activeAdsOnly, setActiveAdsOnly] = useState(true);
  const [showCharts, setShowCharts]     = useState(true);
  const [showAdvFilter, setShowAdvFilter] = useState(false);
  const [appliedGroups, setAppliedGroups] = useState<FilterGroup[]>([]);
  const [topN, setTopN] = useState(10);
  const [leftCollapsed, setLeftCollapsed] = useState(false);

  const activeFilterCount = appliedGroups.reduce((s, g) => s + g.conditions.filter(c => c.values.length > 0).length, 0);

  const filteredData = HEADLINE_DATA.filter(row => {
    if (activeAdsOnly && row.activeAds === 0) return false;
    if (angleTab !== 'All' && row.angleType !== angleTab) return false;
    if (search.trim() && !row.headline.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const closeAdvFilter = useCallback(() => setShowAdvFilter(false), []);

  return (
    <div className="flex-1 flex overflow-hidden bg-[#f8f9fb]">

      {/* ── Left panel ── */}
      {!leftCollapsed && (
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
            <span className="font-semibold text-gray-900 text-[13.5px]">Ad Account analysis</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-[12px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              <MetaIcon size={14} className="text-blue-600" /> Connect
            </button>
          </div>

          {/* Account selector */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Selected account</div>
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-left">
              <MetaIcon size={16} className="text-blue-600 flex-shrink-0" />
              <span className="text-[12.5px] font-medium text-gray-800 flex-1 truncate">Vibhor || Jaap Counter || Noorly</span>
              <ChevronDown size={13} className="text-gray-400 flex-shrink-0" />
            </button>
            <div className="text-[11px] text-gray-400 mt-1.5 pl-0.5">Last synced 7 days ago</div>
          </div>

          {/* Tag Management */}
          <div className="px-4 py-3 border-b border-gray-100">
            <button className="flex items-center gap-2 text-[13px] text-gray-600 hover:text-gray-900 font-medium transition-colors">
              <Tag size={14} strokeWidth={1.8} className="text-gray-400" />
              Tag Management
            </button>
          </div>

          {/* Reports list */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <button className="flex items-center justify-between w-full text-[12.5px] font-semibold text-gray-700 hover:text-gray-900 mb-2">
              Default Reports <ChevronDown size={12} className="text-gray-400" />
            </button>
            <div className="space-y-0.5">
              {DEFAULT_REPORTS.map(r => (
                <button key={r.id} onClick={() => setActiveReport(r.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] text-left transition-colors
                    ${activeReport === r.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}>
                  <MetaIcon size={14} className={activeReport === r.id ? 'text-blue-600' : 'text-blue-400'} />
                  {r.label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <button className="flex items-center justify-between w-full text-[12.5px] font-semibold text-gray-700 hover:text-gray-900 mb-1">
                Custom Reports <ChevronRight size={12} className="text-gray-400" />
              </button>
            </div>

            <button className="flex items-center gap-2 text-[13px] text-blue-600 hover:text-blue-700 font-medium mt-3 transition-colors">
              <Plus size={13} /> Create New Report
            </button>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Report header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 flex-shrink-0">
          {/* Collapse toggle */}
          <button onClick={() => setLeftCollapsed(c => !c)}
            className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-400 flex-shrink-0 transition-colors">
            <ChevronRight size={12} className={`transition-transform ${leftCollapsed ? '' : 'rotate-180'}`} />
          </button>

          <MetaIcon size={20} className="text-blue-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-900 text-[18px]">
              {DEFAULT_REPORTS.find(r => r.id === activeReport)?.label}
            </div>
            <div className="text-[12px] text-gray-400 mt-0.5">Default report grouped by headline</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm text-[12px] flex items-center gap-1.5">
              <Copy size={12} /> Duplicate
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all">
              <Save size={12} /> Save Report
            </button>
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
              <MoreHorizontal size={14} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Published date row */}
        <div className="bg-white border-b border-gray-100 px-6 py-2.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-gray-500">Published Date</span>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">
              <Calendar size={11} className="text-gray-400" /> Select Date <ChevronDown size={10} className="text-gray-400" />
            </button>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input type="checkbox" checked={activeAdsOnly} onChange={e => setActiveAdsOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 accent-blue-600 cursor-pointer" />
              <span className="text-[12px] text-gray-600 font-medium">Active Ads Only</span>
            </label>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-gray-500">
            <span>Observation Range</span>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
              <Calendar size={11} className="text-gray-400" /> Last 30 Days <ChevronDown size={10} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Angle type tabs */}
        <div className="bg-white border-b border-gray-200 px-6 flex items-center flex-shrink-0">
          {ANGLE_TABS.map(tab => (
            <button key={tab} onClick={() => setAngleTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all whitespace-nowrap
                ${angleTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab}
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold
                ${angleTab === tab ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                {ANGLE_COUNTS[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-2 flex-shrink-0 flex-wrap">
          {/* Advanced filter button with popup */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowAdvFilter(f => !f)}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all relative
                ${showAdvFilter || activeFilterCount > 0
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>
              <SlidersHorizontal size={14} />
              {activeFilterCount > 0 && !showAdvFilter && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 border-2 border-white rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {showAdvFilter && (
              <AdvancedFiltersPopup
                onClose={closeAdvFilter}
                onApply={groups => setAppliedGroups(groups)}
              />
            )}
          </div>

          {/* Search */}
          <div className="relative flex-shrink-0">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="border border-gray-200 rounded-lg pl-7 pr-3 py-1.5 text-[12px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 w-36 bg-white" />
          </div>

          <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-[12px] text-gray-600 hover:bg-gray-50 flex-shrink-0">
            Date Last 30 days <ChevronDown size={10} className="text-gray-400 ml-0.5" />
          </button>
          <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-[12px] text-gray-600 hover:bg-gray-50 flex-shrink-0">
            Group by Content <ChevronDown size={10} className="text-gray-400 ml-0.5" />
          </button>
          <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-[12px] text-gray-600 hover:bg-gray-50 flex-shrink-0">
            Group by Tag <ChevronDown size={10} className="text-gray-400 ml-0.5" />
          </button>
          <span className="text-[12px] text-gray-400 font-medium flex-shrink-0">· {filteredData.length} items</span>

          <div className="flex-1" />

          <label className="flex items-center gap-1.5 cursor-pointer select-none flex-shrink-0">
            <input type="checkbox" checked={activeAdsOnly} onChange={e => setActiveAdsOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 accent-blue-600 cursor-pointer" />
            <span className="text-[12px] text-gray-600 font-medium">Active Ads Only</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none flex-shrink-0">
            <div onClick={() => setShowCharts(c => !c)}
              className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer ${showCharts ? 'bg-blue-600' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${showCharts ? 'left-4' : 'left-0.5'}`} />
            </div>
            <span className="text-[12px] text-gray-700 font-medium">Charts</span>
          </label>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Charts */}
          {showCharts && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-[13px] font-semibold text-gray-800 mb-3">Amount Spent vs Purchase ROAS</div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="border border-gray-200 rounded-lg px-2 py-0.5 text-[11.5px] text-gray-600">Amount Spent vs</span>
                  <button className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-0.5 text-[11.5px] text-gray-600 hover:bg-gray-50">
                    Y-Axis: Purchase ROAS <ChevronDown size={9} className="text-gray-400 ml-0.5" />
                  </button>
                  <button className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-0.5 text-[11.5px] text-gray-600 hover:bg-gray-50">
                    Size: Conversions <X size={9} className="text-gray-400 ml-0.5" />
                  </button>
                </div>
                <ScatterChart data={filteredData} />
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-[13px] font-semibold text-gray-800 mb-3">Top {topN} by Amount Spent</div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <button className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-0.5 text-[11.5px] text-gray-600 hover:bg-gray-50">
                    Metrics (1/3) <ChevronDown size={9} className="text-gray-400 ml-0.5" />
                  </button>
                  <button className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-0.5 text-[11.5px] text-gray-600 hover:bg-gray-50">
                    Sort: Amount Spent <ChevronDown size={9} className="text-gray-400 ml-0.5" />
                  </button>
                  <button className="w-6 h-6 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50">
                    <TrendingUp size={11} className="text-gray-500" />
                  </button>
                  <select value={topN} onChange={e => setTopN(Number(e.target.value))}
                    className="border border-gray-200 rounded-lg px-2 py-0.5 text-[11.5px] text-gray-700 bg-white focus:outline-none cursor-pointer">
                    {[5, 10, 20].map(n => <option key={n} value={n}>Top {n}</option>)}
                  </select>
                </div>
                <BarChart data={filteredData} />
              </div>
            </div>
          )}

          {/* Table controls */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-[12px] text-gray-600 hover:bg-gray-50 font-medium">
              Custom <ChevronDown size={11} className="text-gray-400" />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-[12px] text-gray-600 hover:bg-gray-50 font-medium">
              <SlidersHorizontal size={12} /> Table Settings
            </button>
          </div>

          {/* Data table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col /><col style={{ width: '100px' }} /><col style={{ width: '110px' }} />
                <col style={{ width: '78px' }} /><col style={{ width: '110px' }} />
                <col style={{ width: '110px' }} /><col style={{ width: '110px' }} />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-100">
                  {['Headline', 'Active Ads', 'Launch D...', 'CTR (All)', 'Impressi...', 'Amount ...', 'Purchase...'].map(col => (
                    <th key={col} className="px-3 py-2.5 text-left">
                      <span className="flex items-center gap-1 text-[10.5px] font-semibold text-gray-500 uppercase tracking-wide">
                        {col} <TrendingUp size={9} className="text-gray-300" />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map(row => (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="text-[12.5px] font-medium text-gray-800 truncate">{row.headline}</div>
                      <div className="text-[10.5px] text-blue-500 mt-0.5">{row.activeAds} Ad{row.activeAds > 1 ? 's' : ''}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                        <span className="text-[12px] text-gray-600">{row.activeAds} Active Ads</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5"><span className="text-[12px] text-gray-600">{row.launchDate}</span></td>
                    <td className="px-3 py-2.5"><span className="text-[12.5px] font-semibold text-gray-800">{row.ctr.toFixed(2)}</span></td>
                    <td className="px-3 py-2.5"><span className="text-[12px] text-gray-600">{row.impressions.toLocaleString()}</span></td>
                    <td className="px-3 py-2.5"><span className="text-[12px] text-gray-600">{row.amountSpent.toLocaleString()}</span></td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[12.5px] font-semibold ${row.purchaseRoas >= 3 ? 'text-green-600' : row.purchaseRoas >= 2 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {row.purchaseRoas.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
