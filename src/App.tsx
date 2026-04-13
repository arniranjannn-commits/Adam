import { useState, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Tooltip } from './components/Tooltip';
import { MessagingTab } from './tabs/MessagingTab';
import { AnglesTab } from './tabs/AnglesTab';
import { ICPTab } from './tabs/ICPTab';
import { AdBriefTab } from './tabs/AdBriefTab';
import { AdConceptsTab } from './tabs/AdConceptsTab';
import { AdAccountTab } from './tabs/AdAccountTab';
import type { AdConceptItem } from './data/mockData';
import {
  messagingData, anglesData, icpData, adBriefData, adConceptsData
} from './data/mockData';
import { BookOpen, ChevronDown, Search, MoreHorizontal, Filter } from 'lucide-react';

export type AppView = 'session' | 'account';
type TabId = 'brief' | 'concepts' | 'messaging' | 'icp' | 'angles';
interface NavEntry { tab: TabId; id: string }

export default function App() {
  const [appView, setAppView]   = useState<AppView>('session');
  const [activeTab, setActiveTab] = useState<TabId>('brief');
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [navHistory, setNavHistory] = useState<NavEntry[]>([]);
  const [extraConcepts, setExtraConcepts] = useState<AdConceptItem[]>([]);
  const hlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigateTo = useCallback((tab: string, id: string) => {
    setNavHistory(prev => [...prev.slice(-4), { tab: activeTab, id: '' }]);
    setActiveTab(tab as TabId);
    if (hlTimer.current) clearTimeout(hlTimer.current);
    setHighlightId(id || null);
    if (id) hlTimer.current = setTimeout(() => setHighlightId(null), 2000);
  }, [activeTab]);

  const goBack = useCallback(() => {
    const prev = navHistory[navHistory.length - 1];
    if (!prev) return;
    setNavHistory(h => h.slice(0, -1));
    setActiveTab(prev.tab);
  }, [navHistory]);

  const conceptCount = adConceptsData.length + extraConcepts.length;

  const TABS: Array<{ id: TabId; label: string; count: number; tooltip: string }> = [
    { id: 'brief',     label: 'Ad Brief',    count: adBriefData.length,  tooltip: 'Auto-generated briefs combining Messaging × Angle × ICP. Each brief drives Ad Concepts.' },
    { id: 'concepts',  label: 'Ad Concepts', count: conceptCount,         tooltip: 'Fully developed ad concepts — hook, body, CTA, visual direction, and script. Create AI variations.' },
    { id: 'messaging', label: 'Messaging',   count: messagingData.length, tooltip: 'Core messaging pillars — headlines, value propositions, and CTAs anchoring ad creative.' },
    { id: 'icp',       label: 'ICPs',        count: icpData.length,       tooltip: 'Ideal Customer Profiles — audience segments shaping how messaging and angles are tailored.' },
    { id: 'angles',    label: 'Angles',      count: anglesData.length,    tooltip: 'Creative angles defining the emotional strategy. Approve or reject to control what enters briefs.' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f2f5]">
      <Sidebar activeView={appView} onNavigate={setAppView} />

      {/* Ad Account view — full width beside sidebar */}
      {appView === 'account' && <AdAccountTab />}

      {/* Session view */}
      {appView === 'session' && (
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* ── Header ── */}
          <header className="bg-white border-b border-gray-200 px-6 flex-shrink-0">
            {/* Top bar */}
            <div className="flex items-center justify-between h-11">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-gray-700" strokeWidth={1.8} />
                <span className="font-semibold text-gray-900 text-[14px]">Angle Session</span>
              </div>
              <button className="btn btn-primary btn-sm px-4" style={{ background: '#0f1c3f' }}>
                New Session
              </button>
            </div>

            {/* Subtitle + controls */}
            <div className="flex items-end justify-between pb-2.5">
              <p className="text-[12.5px] text-gray-500 font-medium">
                Angle Session &nbsp;·&nbsp; March 15, 2026
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-xs text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">
                  <Filter size={11} /><span>Filters</span><ChevronDown size={10} className="text-gray-400" />
                </div>
                <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-xs text-gray-500 w-36">
                  <Search size={11} className="text-gray-400 flex-shrink-0" />
                  <input placeholder="Search…" className="border-none outline-none bg-transparent text-xs w-full placeholder-gray-400" />
                </div>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <MoreHorizontal size={14} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex -mb-px">
              {TABS.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium border-b-2 transition-all whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  {tab.label}
                  <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center
                    ${activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    {tab.count}
                  </span>
                  <Tooltip content={tab.tooltip} large />
                </button>
              ))}
            </div>
          </header>

          {/* ── Content ── */}
          <main className="flex-1 overflow-hidden bg-[#f0f2f5]">
            {activeTab === 'brief'     && <AdBriefTab onNavigate={navigateTo} navHistory={navHistory} onBack={goBack} onConceptsGenerated={setExtraConcepts} />}
            {activeTab === 'concepts'  && <AdConceptsTab highlightId={highlightId} extraConcepts={extraConcepts} />}
            {activeTab === 'messaging' && <MessagingTab highlightId={highlightId} />}
            {activeTab === 'icp'       && <ICPTab highlightId={highlightId} />}
            {activeTab === 'angles'    && <AnglesTab highlightId={highlightId} />}
          </main>
        </div>
      )}
    </div>
  );
}
