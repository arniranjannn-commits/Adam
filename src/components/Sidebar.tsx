import { Home, Layers, BarChart2, MapPin, Film, Target, Bell, User } from 'lucide-react';
import { Tooltip } from './Tooltip';
import type { AppView } from '../App';

interface Props {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

export function Sidebar({ activeView, onNavigate }: Props) {
  return (
    <aside className="w-14 bg-[#141b2d] flex flex-col items-center py-3 flex-shrink-0 border-r border-[#1e2a3b]">
      {/* Logo / collapse toggle */}
      <div className="w-8 h-8 flex items-center justify-center mb-5 cursor-pointer text-gray-500 hover:text-gray-300 transition-colors">
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
          <rect width="18" height="2" rx="1" fill="currentColor" />
          <rect y="6" width="18" height="2" rx="1" fill="currentColor" />
          <rect y="12" width="18" height="2" rx="1" fill="currentColor" />
        </svg>
      </div>

      <div className="flex flex-col gap-0.5 flex-1 w-full px-2">
        {/* Home → session view */}
        <Tooltip content="Home">
          <button onClick={() => onNavigate('session')}
            className={`w-full h-9 rounded-lg flex items-center justify-center transition-colors
              ${activeView === 'session' ? 'text-gray-500 hover:bg-[#1e2a3b] hover:text-gray-200' : 'text-gray-500 hover:bg-[#1e2a3b] hover:text-gray-200'}`}>
            <Home size={16} strokeWidth={1.8} />
          </button>
        </Tooltip>

        {/* Ad Account → account view (second icon, active when in account view) */}
        <Tooltip content="Ad Account">
          <button onClick={() => onNavigate('account')}
            className={`w-full h-9 rounded-lg flex items-center justify-center transition-colors
              ${activeView === 'account' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-[#1e2a3b] hover:text-gray-200'}`}>
            <BarChart2 size={16} strokeWidth={activeView === 'account' ? 2.5 : 1.8} />
          </button>
        </Tooltip>

        {/* Other nav items */}
        {([
          { icon: Layers, label: 'Brands' },
          { icon: MapPin, label: 'Track' },
          { icon: Film, label: 'Studio' },
          { icon: Target, label: 'Angle', active: activeView === 'session' },
        ] as Array<{ icon: React.ComponentType<{ size: number; strokeWidth: number }>; label: string; active?: boolean }>).map(({ icon: Icon, label, active }) => (
          <Tooltip key={label} content={label}>
            <button onClick={() => label === 'Angle' ? onNavigate('session') : undefined}
              className={`w-full h-9 rounded-lg flex items-center justify-center transition-colors
                ${active ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-[#1e2a3b] hover:text-gray-200'}`}>
              <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
            </button>
          </Tooltip>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2 pb-1">
        <Tooltip content="Notifications">
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-[#1e2a3b] hover:text-gray-200 transition-colors relative">
            <Bell size={15} strokeWidth={1.8} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
        </Tooltip>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer">
          <User size={13} />
        </div>
      </div>
    </aside>
  );
}
