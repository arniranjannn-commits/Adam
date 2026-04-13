import React, { useState, useRef, useEffect } from 'react';
import {
  Tag, ChevronDown, Search, Plus, X, GripVertical,
  BarChart2, Copy, Save, MoreHorizontal, Calendar, SlidersHorizontal,
  Filter, Layers, CheckCheck, TrendingUp, ChevronRight,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface FilterRow {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface FilterGroup {
  id: string;
  label: string;
  matchMode: 'all' | 'any';
  rows: FilterRow[];
}

type FilterPanelType = 'tag' | 'metric' | 'dimension' | null;

interface HeadlineRow {
  id: string;
  headline: string;
  activeAds: number;
  launchDate: string;
  ctr: number;
  impressions: number;
  amountSpent: number;
  purchaseRoas: number;
  conversions: number;
  angleType: string;
}

// ── Mock data ────────────────────────────────────────────────────────────────

const HEADLINE_DATA: HeadlineRow[] = [
  { id: '1', headline: 'Why I Created This Jap Counter — A Note From Our Founder', activeAds: 1, launchDate: '2026-01-26', ctr: 6.61, impressions: 824880, amountSpent: 100520, purchaseRoas: 3.03, conversions: 145, angleType: 'Fresh Angles' },
  { id: '2', headline: 'Stay Present. Let the Journey Unfold Naturally', activeAds: 2, launchDate: '2025-12-10', ctr: 4.20, impressions: 1240000, amountSpent: 780000, purchaseRoas: 3.18, conversions: 210, angleType: 'Clone Angles' },
  { id: '3', headline: 'New Year, New Bhakti Practice — Start Today', activeAds: 1, launchDate: '2026-01-01', ctr: 3.80, impressions: 380000, amountSpent: 220000, purchaseRoas: 2.60, conversions: 88, angleType: 'Iteration Angles' },
  { id: '4', headline: 'Why I Created This Journey — Founder Story', activeAds: 3, launchDate: '2025-11-15', ctr: 5.20, impressions: 980000, amountSpent: 460000, purchaseRoas: 2.40, conversions: 175, angleType: 'Clone Angles' },
  { id: '5', headline: 'COD Available | 24 Hour Delivery Guaranteed', activeAds: 1, launchDate: '2026-02-05', ctr: 7.10, impressions: 220000, amountSpent: 150000, purchaseRoas: 1.80, conversions: 62, angleType: 'Fresh Angles' },
  { id: '6', headline: 'Stay Focused While the World Rushes', activeAds: 1, launchDate: '2026-02-14', ctr: 3.10, impressions: 110000, amountSpent: 90000, purchaseRoas: 1.50, conversions: 40, angleType: 'Iteration Angles' },
  { id: '7', headline: 'The Practice That Changed 10,000 Lives', activeAds: 2, launchDate: '2026-01-10', ctr: 4.80, impressions: 560000, amountSpent: 310000, purchaseRoas: 2.90, conversions: 128, angleType: 'Clone Angles' },
  { id: '8', headline: 'Build a Daily Habit in 7 Days — Proven Method', activeAds: 1, launchDate: '2026-02-20', ctr: 5.50, impressions: 340000, amountSpent: 190000, purchaseRoas: 2.20, conversions: 96, angleType: 'Iteration Angles' },
  { id: '9', headline: 'From Chaos to Clarity — A Simple Morning Ritual', activeAds: 2, launchDate: '2025-12-28', ctr: 6.20, impressions: 720000, amountSpent: 410000, purchaseRoas: 3.40, conversions: 188, angleType: 'Fresh Angles' },
  { id: '10', headline: 'Trusted by 500+ Fast-Growing Spiritual Communities', activeAds: 1, launchDate: '2025-11-30', ctr: 2.90, impressions: 460000, amountSpent: 270000, purchaseRoas: 1.90, conversions: 72, angleType: 'Clone Angles' },
  { id: '11', headline: 'What Happens When You Chant Daily for 30 Days', activeAds: 3, launchDate: '2026-03-01', ctr: 5.90, impressions: 890000, amountSpent: 510000, purchaseRoas: 2.75, conversions: 162, angleType: 'Iteration Angles' },
  { id: '12', headline: 'Stop Wasting Time on Manual Tracking', activeAds: 1, launchDate: '2026-02-08', ctr: 4.40, impressions: 190000, amountSpent: 115000, purchaseRoas: 2.10, conversions: 54, angleType: 'Fresh Angles' },
];

const DEFAULT_REPORTS = [
  { id: 'top-headlines', label: 'Top Headlines' },
  { id: 'top-landing', label: 'Top Landing Pages' },
  { id: 'top-ctas', label: 'Top CTAs' },
  { id: 'top-copies', label: 'Top Ad Copies' },
];

const TAG_FIELDS = ['Angle Type', 'Campaign Type', 'Creator', 'Season', 'Product Line'];
const DIMENSION_FIELDS = ['Platform', 'Format', 'Placement', 'Audience Age', 'Region'];
const METRIC_FIELDS = ['CTR (All)', 'Purchase ROAS', 'Amount Spent', 'Impressions', 'Conversions'];
const OPERATORS = ['equals', 'not equals', 'contains', 'greater than', 'less than'];

const ANGLE_TABS = ['All', 'Clone Angles', 'Iteration Angles', 'Fresh Angles'];

function mkId() { return Math.random().toString(36).slice(2, 8); }

const DEFAULT_TAG_GROUPS: FilterGroup[] = [
  {
    id: 'tg1', label: 'Tags', matchMode: 'all',
    rows: [
      { id: 'tr1', field: 'Angle Type', operator: 'equals', value: 'Fresh Angles' },
      { id: 'tr2', field: 'Campaign Type', operator: 'equals', value: 'Awareness' },
    ],
  },
];

const DEFAULT_DIMENSION_GROUPS: FilterGroup[] = [
  {
    id: 'dg1', label: 'Dimensions', matchMode: 'any',
    rows: [
      { id: 'dr1', field: 'Platform', operator: 'equals', value: 'Facebook' },
      { id: 'dr2', field: 'Format', operator: 'equals', value: 'Video' },
    ],
  },
];

// ── Scatter Chart (SVG) ───────────────────────────────────────────────────────

function ScatterChart({ data }: { data: HeadlineRow[] }) {
  const W = 380, H = 220, PAD = { t: 12, r: 12, b: 36, l: 48 };
  const cw = W - PAD.l - PAD.r;
  const ch = H - PAD.t - PAD.b;

  const maxX = Math.max(...data.map(d => d.amountSpent));
  const maxY = Math.max(...data.map(d => d.purchaseRoas));
  const maxC = Math.max(...data.map(d => d.conversions));

  const sx = (v: number) => PAD.l + (v / maxX) * cw;
  const sy = (v: number) => PAD.t + ch - (v / maxY) * ch;
  const sr = (v: number) => 4 + (v / maxC) * 8;

  const colors = ['#7c3aed', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  const xTicks = [0, maxX * 0.25, maxX * 0.5, maxX * 0.75, maxX].map(v => ({
    v, label: v === 0 ? '0' : `${Math.round(v / 1000)}K`,
  }));

  const yTicks = [0, 1, 2, 3, maxY].map(v => ({ v, label: v.toFixed(1) }));

  return (
    <svg width={W} height={H} className="overflow-visible">
      {/* Grid lines */}
      {yTicks.map(t => (
        <g key={t.v}>
          <line x1={PAD.l} y1={sy(t.v)} x2={PAD.l + cw} y2={sy(t.v)} stroke="#f0f0f0" strokeWidth={1} />
          <text x={PAD.l - 6} y={sy(t.v) + 4} textAnchor="end" fontSize={9} fill="#9ca3af">{t.label}</text>
        </g>
      ))}
      {xTicks.map(t => (
        <g key={t.v}>
          <line x1={sx(t.v)} y1={PAD.t} x2={sx(t.v)} y2={PAD.t + ch} stroke="#f0f0f0" strokeWidth={1} />
          <text x={sx(t.v)} y={PAD.t + ch + 14} textAnchor="middle" fontSize={9} fill="#9ca3af">{t.label}</text>
        </g>
      ))}

      {/* Axes labels */}
      <text x={PAD.l + cw / 2} y={H - 2} textAnchor="middle" fontSize={10} fill="#6b7280">Amount Spent</text>
      <text x={12} y={PAD.t + ch / 2} textAnchor="middle" fontSize={10} fill="#6b7280"
        transform={`rotate(-90, 12, ${PAD.t + ch / 2})`}>Purchase ROAS</text>

      {/* Dots */}
      {data.map((d, i) => (
        <circle key={d.id} cx={sx(d.amountSpent)} cy={sy(d.purchaseRoas)}
          r={sr(d.conversions)} fill={colors[i % colors.length]}
          fillOpacity={0.75} stroke="white" strokeWidth={1.5}>
          <title>{d.headline.slice(0, 30)} — ROAS: {d.purchaseRoas}</title>
        </circle>
      ))}
    </svg>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────

function BarChart({ data }: { data: HeadlineRow[] }) {
  const sorted = [...data].sort((a, b) => b.amountSpent - a.amountSpent).slice(0, 10);
  const maxVal = sorted[0]?.amountSpent ?? 1;

  return (
    <div className="space-y-1.5 pt-1">
      {sorted.map(row => (
        <div key={row.id} className="flex items-center gap-2">
          <div className="w-[120px] text-[10.5px] text-gray-600 text-right truncate flex-shrink-0">
            {row.headline.split(' ').slice(0, 4).join(' ')}…
          </div>
          <div className="flex-1 h-4 bg-gray-100 rounded-sm overflow-hidden">
            <div
              className="h-full rounded-sm bg-indigo-500 transition-all"
              style={{ width: `${(row.amountSpent / maxVal) * 100}%` }}
            />
          </div>
          <div className="text-[10.5px] text-gray-500 w-16 flex-shrink-0">
            {(row.amountSpent / 1000).toFixed(0)}K
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Small select-like dropdown ────────────────────────────────────────────────

function QuickSelect({ value, options, onChange, icon }: {
  value: string; options: string[]; onChange: (v: string) => void; icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-[12px] text-gray-700 hover:bg-gray-50 transition-colors">
        {icon}
        <span className="font-medium">{value}</span>
        <ChevronDown size={11} className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[140px] py-1 overflow-hidden">
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-[12px] transition-colors
                ${value === opt ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Filter row inside the advanced panel ─────────────────────────────────────

function FilterRowEditor({ row, fieldOptions, onUpdate, onRemove }: {
  row: FilterRow;
  fieldOptions: string[];
  onUpdate: (fn: (r: FilterRow) => FilterRow) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5 group">
      <GripVertical size={13} className="text-gray-300 cursor-grab flex-shrink-0" />
      <select value={row.field} onChange={e => onUpdate(r => ({ ...r, field: e.target.value }))}
        className="border border-gray-200 rounded-lg px-2 py-1 text-[11.5px] text-gray-700 bg-white focus:outline-none focus:border-blue-400 cursor-pointer">
        {fieldOptions.map(f => <option key={f}>{f}</option>)}
      </select>
      <select value={row.operator} onChange={e => onUpdate(r => ({ ...r, operator: e.target.value }))}
        className="border border-gray-200 rounded-lg px-2 py-1 text-[11.5px] text-gray-700 bg-white focus:outline-none focus:border-blue-400 cursor-pointer">
        {OPERATORS.map(o => <option key={o}>{o}</option>)}
      </select>
      <input value={row.value} onChange={e => onUpdate(r => ({ ...r, value: e.target.value }))}
        className="border border-gray-200 rounded-lg px-2 py-1 text-[11.5px] text-gray-700 bg-white focus:outline-none focus:border-blue-400 w-28"
        placeholder="Value…" />
      <button onClick={onRemove}
        className="w-5 h-5 rounded hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <X size={11} className="text-red-400" />
      </button>
    </div>
  );
}

// ── Filter Group ─────────────────────────────────────────────────────────────

function FilterGroupEditor({ group, fieldOptions, onUpdate, onRemoveGroup }: {
  group: FilterGroup;
  fieldOptions: string[];
  onUpdate: (fn: (g: FilterGroup) => FilterGroup) => void;
  onRemoveGroup: () => void;
}) {
  const addRow = () => onUpdate(g => ({
    ...g,
    rows: [...g.rows, { id: mkId(), field: fieldOptions[0], operator: 'equals', value: '' }],
  }));

  const removeRow = (id: string) => onUpdate(g => ({ ...g, rows: g.rows.filter(r => r.id !== id) }));

  const updateRow = (id: string, fn: (r: FilterRow) => FilterRow) =>
    onUpdate(g => ({ ...g, rows: g.rows.map(r => r.id === id ? fn(r) : r) }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[12px] font-semibold text-gray-800">{group.label}</div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500">Match</span>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['all', 'any'] as const).map(m => (
              <button key={m} onClick={() => onUpdate(g => ({ ...g, matchMode: m }))}
                className={`px-2.5 py-1 text-[11px] font-medium transition-colors
                  ${group.matchMode === m ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                {m}
              </button>
            ))}
          </div>
          <button onClick={onRemoveGroup} className="w-5 h-5 rounded hover:bg-red-50 flex items-center justify-center ml-1">
            <X size={11} className="text-red-400" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {group.rows.map(row => (
          <FilterRowEditor key={row.id} row={row} fieldOptions={fieldOptions}
            onUpdate={fn => updateRow(row.id, fn)}
            onRemove={() => removeRow(row.id)} />
        ))}
      </div>

      <button onClick={addRow}
        className="mt-3 flex items-center gap-1.5 text-[11.5px] text-blue-600 font-medium hover:text-blue-700 transition-colors">
        <Plus size={12} /> Add Filter
      </button>
    </div>
  );
}

// ── Advanced Filter Panel ─────────────────────────────────────────────────────

function FilterPanel({ type, groups, setGroups, fieldOptions, onClose, activeTab, setActiveTab, search, setSearch }: {
  type: FilterPanelType;
  groups: FilterGroup[];
  setGroups: (fn: (g: FilterGroup[]) => FilterGroup[]) => void;
  fieldOptions: string[];
  onClose: () => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  search: string;
  setSearch: (s: string) => void;
}) {
  const addGroup = () => setGroups(g => [...g, {
    id: mkId(),
    label: type === 'tag' ? 'Tags' : type === 'metric' ? 'Metrics' : 'Dimensions',
    matchMode: 'all',
    rows: [{ id: mkId(), field: fieldOptions[0], operator: 'equals', value: '' }],
  }]);

  const removeGroup = (id: string) => setGroups(g => g.filter(x => x.id !== id));

  const updateGroup = (id: string, fn: (g: FilterGroup) => FilterGroup) =>
    setGroups(gs => gs.map(g => g.id === id ? fn(g) : g));

  const angleCounts = { 'All': 12, 'Clone Angles': 4, 'Iteration Angles': 4, 'Fresh Angles': 4 };
  const activeCount = groups.reduce((sum, g) => sum + g.rows.filter(r => r.value).length, 0);

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-white border-l border-gray-200">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          {type === 'tag' && <Tag size={14} className="text-blue-600" />}
          {type === 'metric' && <BarChart2 size={14} className="text-purple-600" />}
          {type === 'dimension' && <Layers size={14} className="text-green-600" />}
          <span className="font-semibold text-gray-900 text-[13px]">
            {type === 'tag' ? 'Tag Filters' : type === 'metric' ? 'Metric Filters' : 'Dimension Filters'}
          </span>
          {activeCount > 0 && (
            <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeCount} active</span>
          )}
        </div>
        <button onClick={onClose} className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center">
          <X size={13} className="text-gray-400" />
        </button>
      </div>

      {/* Angle type tabs */}
      <div className="flex items-center gap-0.5 px-5 pt-3 pb-0 flex-shrink-0">
        {ANGLE_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-t-lg border-b-2 transition-all
              ${activeTab === tab
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold
              ${activeTab === tab ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
              {angleCounts[tab as keyof typeof angleCounts]}
            </span>
          </button>
        ))}
      </div>

      {/* Sub-toolbar */}
      <div className="flex items-center gap-2 px-5 py-2.5 border-y border-gray-100 bg-gray-50/60 flex-shrink-0 flex-wrap">
        <div className="relative flex-shrink-0">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="border border-gray-200 rounded-lg pl-7 pr-3 py-1 text-[11.5px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 w-36 bg-white" />
        </div>
        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-[11.5px] text-gray-600 hover:bg-gray-50">
          <Calendar size={11} /> Date Last 30 days <ChevronDown size={10} className="text-gray-400 ml-0.5" />
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-[11.5px] text-gray-600 hover:bg-gray-50">
          Group by Content <ChevronDown size={10} className="text-gray-400 ml-0.5" />
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-[11.5px] text-gray-600 hover:bg-gray-50">
          Group by Tag <ChevronDown size={10} className="text-gray-400 ml-0.5" />
        </button>
        <span className="text-[11px] text-gray-400 ml-1 flex-shrink-0">·&nbsp;{groups.reduce((s, g) => s + g.rows.length, 0)} conditions</span>
      </div>

      {/* Filter groups */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {/* Top-level match mode */}
        <div className="flex items-center justify-between mb-1">
          <div className="text-[11.5px] font-semibold text-gray-600">Match conditions</div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['all', 'any'] as const).map(m => (
              <button key={m}
                className={`px-2.5 py-1 text-[11px] font-medium transition-colors bg-white text-gray-500 hover:bg-gray-50`}>
                Match {m}
              </button>
            ))}
          </div>
        </div>

        {groups.map(group => (
          <FilterGroupEditor key={group.id} group={group} fieldOptions={fieldOptions}
            onUpdate={fn => updateGroup(group.id, fn)}
            onRemoveGroup={() => removeGroup(group.id)} />
        ))}

        <button onClick={addGroup}
          className="flex items-center gap-1.5 text-[11.5px] text-blue-600 font-medium hover:text-blue-700 transition-colors py-1">
          <Plus size={13} /> Add Group
        </button>
      </div>

      {/* Footer actions */}
      <div className="flex-shrink-0 px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <button onClick={() => setGroups(() => [])}
          className="text-[12px] text-gray-500 hover:text-red-500 font-medium transition-colors">
          Clear all
        </button>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="btn btn-secondary btn-sm text-[12px]">Cancel</button>
          <button onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-semibold text-white transition-all"
            style={{ background: '#0f1c3f' }}>
            <CheckCheck size={12} /> Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AdAccountTab() {
  const [activeReport, setActiveReport] = useState('top-headlines');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [activeAdsOnly, setActiveAdsOnly] = useState(true);
  const [groupBy, setGroupBy] = useState('Headline');
  const [groupByTag, setGroupByTag] = useState('Select a group');
  const [showCharts, setShowCharts] = useState(true);
  const [filterPanel, setFilterPanel] = useState<FilterPanelType>(null);
  const [search, setSearch] = useState('');

  // Filter state per panel type
  const [tagGroups, setTagGroups] = useState<FilterGroup[]>(DEFAULT_TAG_GROUPS);
  const [metricGroups, setMetricGroups] = useState<FilterGroup[]>([]);
  const [dimensionGroups, setDimensionGroups] = useState<FilterGroup[]>(DEFAULT_DIMENSION_GROUPS);

  // Filter panel inner state
  const [panelTab, setPanelTab] = useState('All');
  const [panelSearch, setPanelSearch] = useState('');

  // Bar chart metric selector
  const [barMetric] = useState('Amount Spent');
  const [barSort, setBarSort] = useState('Amount Spent');
  const [topN, setTopN] = useState(10);

  const activeTagCount = tagGroups.reduce((s, g) => s + g.rows.filter(r => r.value).length, 0);
  const activeMetricCount = metricGroups.reduce((s, g) => s + g.rows.filter(r => r.value).length, 0);
  const activeDimCount = dimensionGroups.reduce((s, g) => s + g.rows.filter(r => r.value).length, 0);

  const filteredData = HEADLINE_DATA.filter(row => {
    if (activeAdsOnly && row.activeAds === 0) return false;
    if (panelTab !== 'All' && row.angleType !== panelTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!row.headline.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const openPanel = (type: FilterPanelType) => {
    setFilterPanel(prev => prev === type ? null : type);
  };

  const currentGroups = filterPanel === 'tag' ? tagGroups
    : filterPanel === 'metric' ? metricGroups
    : dimensionGroups;

  const setCurrentGroups = filterPanel === 'tag' ? setTagGroups
    : filterPanel === 'metric' ? setMetricGroups
    : setDimensionGroups;

  const currentFields = filterPanel === 'tag' ? TAG_FIELDS
    : filterPanel === 'metric' ? METRIC_FIELDS
    : DIMENSION_FIELDS;

  return (
    <div className="h-full flex overflow-hidden">

      {/* ── Left report sidebar ── */}
      <div className="w-60 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        {/* Account selector */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Selected account</div>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[9px] font-bold">M</span>
            </div>
            <span className="text-[12px] font-medium text-gray-800 truncate flex-1">Vibhor || Jaap Counter || Noorly</span>
            <ChevronDown size={12} className="text-gray-400 flex-shrink-0" />
          </button>
          <div className="text-[10.5px] text-gray-400 mt-1.5 pl-1">Last synced 7 days ago</div>
        </div>

        {/* Tag Management */}
        <div className="px-4 py-3 border-b border-gray-100">
          <button className="flex items-center gap-2 text-[12.5px] text-gray-600 hover:text-gray-900 transition-colors font-medium">
            <Tag size={14} strokeWidth={1.8} />
            Tag Management
          </button>
        </div>

        {/* Default Reports */}
        <div className="px-4 py-3 flex-1 overflow-y-auto">
          <button className="w-full flex items-center justify-between text-[11.5px] font-semibold text-gray-700 hover:text-gray-900 mb-1.5 group">
            Default Reports
            <ChevronDown size={12} className="text-gray-400 group-hover:text-gray-600" />
          </button>
          <div className="space-y-0.5">
            {DEFAULT_REPORTS.map(r => (
              <button key={r.id} onClick={() => setActiveReport(r.id)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-left transition-colors
                  ${activeReport === r.id
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}>
                <div className="w-4 h-4 rounded-full border-2 border-blue-400 flex items-center justify-center flex-shrink-0">
                  <div className={`w-1.5 h-1.5 rounded-full ${activeReport === r.id ? 'bg-blue-500' : 'bg-transparent'}`} />
                </div>
                {r.label}
              </button>
            ))}
          </div>

          {/* Custom Reports */}
          <div className="mt-4">
            <button className="w-full flex items-center justify-between text-[11.5px] font-semibold text-gray-700 hover:text-gray-900 mb-1.5">
              Custom Reports
              <ChevronRight size={12} className="text-gray-400" />
            </button>
          </div>

          <button className="flex items-center gap-2 text-[12px] text-blue-600 hover:text-blue-700 font-medium mt-2 transition-colors">
            <Plus size={13} /> Create New Report
          </button>
        </div>
      </div>

      {/* ── Main content + optional filter panel ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Report main area */}
        <div className={`flex flex-col overflow-hidden transition-all ${filterPanel ? 'w-[55%]' : 'flex-1'}`}>

          {/* Report header */}
          <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 flex-shrink-0">
            <div>
              <div className="font-semibold text-gray-900 text-[15px]">
                {DEFAULT_REPORTS.find(r => r.id === activeReport)?.label ?? 'Report'}
              </div>
              <div className="text-[11.5px] text-gray-400 mt-0.5">Default report grouped by {groupBy.toLowerCase()}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-secondary btn-sm text-[12px] flex items-center gap-1.5">
                <Copy size={12} /> Duplicate
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-white transition-all"
                style={{ background: '#0f1c3f' }}>
                <Save size={12} /> Save Report
              </button>
              <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                <MoreHorizontal size={14} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Quick filter bar row 1 */}
          <div className="flex items-center justify-between px-5 py-2 bg-white border-b border-gray-100 flex-shrink-0 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">
                <Calendar size={11} className="text-gray-400" />
                <span>Select Date</span>
                <ChevronDown size={10} className="text-gray-400" />
              </button>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" checked={activeAdsOnly} onChange={e => setActiveAdsOnly(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-blue-600 cursor-pointer" />
                <span className="text-[12px] text-gray-600 font-medium">Active Ads Only</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] text-gray-400">Observation Range</span>
              <QuickSelect value={dateRange} options={['Last 7 Days', 'Last 14 Days', 'Last 30 Days', 'Last 90 Days', 'All Time']}
                onChange={setDateRange} icon={<Calendar size={11} className="text-gray-400" />} />
            </div>
          </div>

          {/* Quick filter bar row 2 */}
          <div className="flex items-center gap-2 px-5 py-2 bg-white border-b border-gray-200 flex-shrink-0 flex-wrap">
            <QuickSelect value={`Group By ${groupBy}`}
              options={['Group By Headline', 'Group By Landing Page', 'Group By CTA', 'Group By Ad Copy']}
              onChange={v => setGroupBy(v.replace('Group By ', ''))} />
            <QuickSelect value={groupByTag}
              options={['Select a group', 'Angle Type', 'Campaign Type', 'Platform', 'Format']}
              onChange={setGroupByTag} icon={<Tag size={10} className="text-gray-400" />} />

            {/* Charts toggle */}
            <label className="flex items-center gap-2 cursor-pointer ml-1 select-none">
              <div onClick={() => setShowCharts(c => !c)}
                className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer ${showCharts ? 'bg-blue-600' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${showCharts ? 'left-4' : 'left-0.5'}`} />
              </div>
              <span className="text-[12px] text-gray-700 font-medium">Charts</span>
            </label>

            <div className="flex-1" />

            {/* Advanced filter buttons */}
            {([
              { type: 'tag' as const, label: 'Tag Filters', icon: <Tag size={11} />, count: activeTagCount },
              { type: 'metric' as const, label: 'Metric Filters', icon: <Filter size={11} />, count: activeMetricCount },
              { type: 'dimension' as const, label: 'Dimension Filters', icon: <SlidersHorizontal size={11} />, count: activeDimCount },
            ]).map(({ type, label, icon, count }) => (
              <button key={type} onClick={() => openPanel(type)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px] font-medium transition-all
                  ${filterPanel === type
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                {icon}
                {label}
                {count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filterPanel === type ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#f5f6f8] space-y-4">

            {/* Charts */}
            {showCharts && (
              <div className="grid grid-cols-2 gap-4">
                {/* Scatter chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-[12.5px] font-semibold text-gray-800 mb-3">Amount Spent vs Purchase ROAS</div>
                  <div className="flex items-center gap-2 mb-3 text-[11px] text-gray-500">
                    <span className="border border-gray-200 rounded-lg px-2 py-0.5">Amount Spent vs</span>
                    <QuickSelect value="Y-Axis: Purchase ROAS"
                      options={['Y-Axis: Purchase ROAS', 'Y-Axis: CTR', 'Y-Axis: Impressions']}
                      onChange={() => {}} />
                    <button className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-0.5 hover:bg-gray-50">
                      Size: Conversions <X size={9} className="text-gray-400 ml-0.5" />
                    </button>
                  </div>
                  <ScatterChart data={filteredData} />
                </div>

                {/* Bar chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-[12.5px] font-semibold text-gray-800 mb-3">Top {topN} by {barMetric}</div>
                  <div className="flex items-center gap-2 mb-3">
                    <QuickSelect value={`Metrics (1/${METRIC_FIELDS.length})`}
                      options={METRIC_FIELDS.map((_, i) => `Metrics (${i + 1}/${METRIC_FIELDS.length})`)}
                      onChange={() => {}} />
                    <QuickSelect value={`Sort: ${barSort}`}
                      options={METRIC_FIELDS.map(f => `Sort: ${f}`)}
                      onChange={v => setBarSort(v.replace('Sort: ', ''))} />
                    <button className="w-6 h-6 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50">
                      <TrendingUp size={11} className="text-gray-500" />
                    </button>
                    <QuickSelect value={`Top ${topN}`}
                      options={[5, 10, 20].map(n => `Top ${n}`)}
                      onChange={v => setTopN(Number(v.replace('Top ', '')))} />
                  </div>
                  <BarChart data={filteredData} />
                </div>
              </div>
            )}

            {/* Search bar above table */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search headlines…"
                  className="border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-[12px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 bg-white w-52" />
              </div>
              <span className="text-[11.5px] text-gray-400">{filteredData.length} results</span>
            </div>

            {/* Data table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '110px' }} />
                  <col style={{ width: '80px' }} />
                  <col style={{ width: '110px' }} />
                  <col style={{ width: '110px' }} />
                  <col style={{ width: '110px' }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Headline', 'Active Ads', 'Launch Date', 'CTR (All)', 'Impressions', 'Amount Spent', 'Purchase ROAS'].map(col => (
                      <th key={col} className="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                        <span className="flex items-center gap-1">
                          {col}
                          <TrendingUp size={9} className="text-gray-300" />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(row => (
                    <tr key={row.id}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="text-[12px] font-medium text-gray-800 truncate">{row.headline}</div>
                        <div className="text-[10.5px] text-gray-400 mt-0.5">{row.activeAds} Ad{row.activeAds > 1 ? 's' : ''}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                          <span className="text-[12px] text-gray-600">{row.activeAds} Active Ads</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-[12px] text-gray-600">{row.launchDate}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-[12.5px] font-semibold text-gray-800">{row.ctr.toFixed(2)}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-[12px] text-gray-600">{row.impressions.toLocaleString()}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-[12px] text-gray-600">{row.amountSpent.toLocaleString()}</span>
                      </td>
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

        {/* ── Advanced filter panel ── */}
        {filterPanel && (
          <FilterPanel
            type={filterPanel}
            groups={currentGroups}
            setGroups={setCurrentGroups}
            fieldOptions={currentFields}
            onClose={() => setFilterPanel(null)}
            activeTab={panelTab}
            setActiveTab={setPanelTab}
            search={panelSearch}
            setSearch={setPanelSearch}
          />
        )}
      </div>
    </div>
  );
}
