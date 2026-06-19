import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  History,
  Users,
  Ghost,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: '仪表盘', icon: <LayoutDashboard className="w-5 h-5" /> },
  { to: '/scripts', label: '剧本角色库', icon: <BookOpen className="w-5 h-5" /> },
  { to: '/schedules', label: '车次排班', icon: <CalendarDays className="w-5 h-5" /> },
  { to: '/history', label: '分角历史', icon: <History className="w-5 h-5" /> },
  { to: '/players', label: '玩家管理', icon: <Users className="w-5 h-5" /> },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[248px] bg-ink-900/80 backdrop-blur-xl border-r border-ink-700/60 flex flex-col z-50"
      style={{ backgroundImage: 'linear-gradient(180deg, rgba(26,22,32,0.95) 0%, rgba(15,13,20,0.98) 100%)' }}
    >
      <div className="px-5 py-5 border-b border-ink-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(212,168,75,0.25), rgba(107,70,193,0.2))', border: '1px solid rgba(212,168,75,0.3)' }}>
            <Ghost className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-gradient-gold leading-tight">
              剧本杀分角系统
            </h1>
            <p className="text-[10px] text-slate-500 mt-0.5 tracking-wider">SCRIPT ROLE ASSIGN</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'nav-item',
                isActive || location.pathname === item.to ? 'nav-item-active' : ''
              )
            }
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-ink-700/50">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-ink-700/30 transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-serif font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #553C9A, #6B46C1)', border: '2px solid rgba(212,168,75,0.5)' }}>
            <span className="text-white">店</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">李明轩</p>
            <Badge variant="royal" className="mt-0.5">
              店长
            </Badge>
          </div>
        </div>
      </div>
    </aside>
  );
}
