import { useLocation } from 'react-router-dom';
import { Search, Bell, Plus, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const routeTitles: Record<string, { title: string; breadcrumb: string[] }> = {
  '/dashboard': { title: '仪表盘', breadcrumb: ['首页', '仪表盘'] },
  '/scripts': { title: '剧本角色库', breadcrumb: ['首页', '剧本角色库'] },
  '/schedules': { title: '车次排班', breadcrumb: ['首页', '车次排班'] },
  '/history': { title: '分角历史', breadcrumb: ['首页', '分角历史'] },
  '/players': { title: '玩家管理', breadcrumb: ['首页', '玩家管理'] },
};

export default function Header() {
  const location = useLocation();
  const [searchFocused, setSearchFocused] = useState(false);

  const routeInfo = routeTitles[location.pathname] || {
    title: '未知页面',
    breadcrumb: ['首页'],
  };

  return (
    <header
      className="fixed top-0 right-0 left-[248px] h-16 bg-ink-900/70 backdrop-blur-xl border-b border-ink-700/50 z-40 flex items-center px-6"
      style={{ backgroundImage: 'linear-gradient(180deg, rgba(30,26,39,0.9) 0%, rgba(26,22,32,0.7) 100%)' }}
    >
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <div className="mr-6">
          <h2 className="text-lg font-serif font-semibold text-slate-100">
            {routeInfo.title}
          </h2>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
            {routeInfo.breadcrumb.map((item, index) => (
              <span key={index} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="w-3 h-3" />}
                <span className={index === routeInfo.breadcrumb.length - 1 ? 'text-amber-400/80' : ''}>
                  {item}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div
          className={`relative w-72 transition-all duration-200 ${
            searchFocused ? 'w-96' : ''
          }`}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="搜索剧本 / 车次 / 玩家..."
            className="input-dark pl-10 pr-4 py-2 text-sm"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        <button className="relative w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-ink-700/50 transition-all duration-200">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-crimson-500 shadow-glow-danger" />
        </button>

        <button className="btn-gold flex items-center gap-2 text-sm py-2 px-4">
          <Plus className="w-4 h-4" />
          新建车次
        </button>
      </div>
    </header>
  );
}
