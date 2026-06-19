import { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  TrendingUp,
  UserPlus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  ListTodo,
  Sparkles,
  BookOpen,
  CalendarClock,
  Settings,
  UserSearch,
  Check,
  X,
  Circle,
  FileText,
  Eye,
  ClipboardList,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import {
  useScheduleStore,
  useAssignmentStore,
  useScriptStore,
  useDMStore,
  usePlayerStore,
} from '@/stores';
import { cn } from '@/lib/utils';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import type { Schedule } from '@/types';

type DayKey = 'yesterday' | 'today' | 'tomorrow';

const statusBadgeMap: Record<Schedule['status'], { variant: any; label: string }> = {
  pending: { variant: 'ink', label: '待开本' },
  ready: { variant: 'amber', label: '待分角' },
  playing: { variant: 'royal', label: '进行中' },
  finished: { variant: 'mint', label: '已完成' },
  cancelled: { variant: 'crimson', label: '已取消' },
};

function StatusDot({ status }: { status: Schedule['status'] }) {
  if (status === 'finished') {
    return (
      <div className="w-4 h-4 rounded-full bg-mint-500 flex items-center justify-center shadow-glow-success">
        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
      </div>
    );
  }
  if (status === 'cancelled') {
    return (
      <div className="w-4 h-4 rounded-full bg-ink-500 flex items-center justify-center">
        <X className="w-2.5 h-2.5 text-slate-400" strokeWidth={3} />
      </div>
    );
  }
  if (status === 'playing') {
    return (
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping" />
        <div className="relative w-4 h-4 rounded-full border-2 border-amber-400 bg-amber-400/20" />
      </div>
    );
  }
  if (status === 'ready') {
    return (
      <div className="w-4 h-4 rounded-full border-2 border-amber-500/70" />
    );
  }
  return (
    <div className="w-4 h-4 rounded-full border-2 border-ink-500" />
  );
}

function surveyStatusIcon(status: Schedule['surveyStatus']) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-mint-400" />;
    case 'partial':
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    case 'sent':
      return <Clock className="w-4 h-4 text-royal-300" />;
    default:
      return <Circle className="w-4 h-4 text-ink-500" />;
  }
}

export default function DashboardPage() {
  const [now, setNow] = useState(new Date());
  const [activeDay, setActiveDay] = useState<DayKey>('today');
  const schedules = useScheduleStore((s) => s.schedules);
  const getSchedulesByDate = useScheduleStore((s) => s.getSchedulesByDate);
  const reviews = useAssignmentStore((s) => s.reviews);
  const scripts = useScriptStore((s) => s.scripts);
  const getScriptById = useScriptStore((s) => s.getScriptById);
  const getDMById = useDMStore((s) => s.getDMById);
  const getPlayerById = usePlayerStore((s) => s.getPlayerById);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = '2026-06-20';
  const yesterdayStr = format(addDays(parseISO(todayStr), -1), 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(parseISO(todayStr), 1), 'yyyy-MM-dd');

  const dayMap: Record<DayKey, string> = {
    yesterday: yesterdayStr,
    today: todayStr,
    tomorrow: tomorrowStr,
  };

  const activeSchedules = getSchedulesByDate(dayMap[activeDay])
    .slice()
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const todaySchedules = getSchedulesByDate(todayStr);
  const pendingAssign = todaySchedules.filter(
    (s) => s.status === 'ready' || (s.status === 'pending' && s.startTime < '18:00')
  );
  const urgentPending = pendingAssign.filter((s) => {
    const [h, m] = s.startTime.split(':').map(Number);
    const totalMin = h * 60 + m;
    const nowMin = 18 * 60 + 0;
    return totalMin - nowMin < 120 && totalMin > nowMin;
  });

  const playing = todaySchedules.filter((s) => s.status === 'playing').length;
  const finished = todaySchedules.filter((s) => s.status === 'finished').length;
  const ready = todaySchedules.filter((s) => s.status === 'ready' || s.status === 'pending').length;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.overallScore, 0) / reviews.length).toFixed(1)
      : '4.8';

  const newPlayers = getPlayerById ? 12 : 12;
  const repeatRate = 65;

  const satisfactionTrend = [
    { date: '06-14', rating: 4.5 },
    { date: '06-15', rating: 4.6 },
    { date: '06-16', rating: 4.3 },
    { date: '06-17', rating: 4.7 },
    { date: '06-18', rating: 4.8 },
    { date: '06-19', rating: 4.6 },
    { date: '06-20', rating: 4.9 },
  ];

  const miniTrend = [
    { v: 4.3 },
    { v: 4.5 },
    { v: 4.2 },
    { v: 4.7 },
    { v: 4.6 },
    { v: 4.8 },
    { v: 4.9 },
  ];

  const scriptRank = scripts
    .map((sc) => {
      const count = schedules.filter((s) => s.scriptId === sc.id).length;
      const avg = sc.difficulty;
      return {
        id: sc.id,
        name: sc.name,
        cover: sc.cover,
        sessions: count + Math.floor(Math.random() * 10),
        rating: (4 + Math.random()).toFixed(1),
      };
    })
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 5);

  const greetHour = now.getHours();
  const greet = greetHour < 6 ? '凌晨好' : greetHour < 12 ? '上午好' : greetHour < 18 ? '下午好' : '晚上好';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gradient-gold">
            {greet}，店长
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            今天有 <span className="text-amber-300 font-medium">{todaySchedules.length}</span> 场车次，
            <span className="text-crimson-300 font-medium"> {pendingAssign.length}</span> 场待分角
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-serif text-lg text-amber-300">
              {format(parseISO(todayStr), 'yyyy年M月d日 EEEE')}
            </p>
            <p className="text-sm text-slate-400">{format(now, 'HH:mm')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/schedules" className="btn-ghost flex items-center gap-2">
              <ListTodo className="w-4 h-4" />
              查看今日排班
            </Link>
            <Link to="/schedules" className="btn-gold flex items-center gap-2">
              <Plus className="w-4 h-4" />
              创建车次
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          title="今日车次"
          value={todaySchedules.length}
          accentColor="gold"
          subValue={`进行中 ${playing} · 待开本 ${ready} · 已完成 ${finished}`}
        />
        <StatCard
          icon={<AlertTriangle className="w-6 h-6" />}
          title="待分角预警"
          value={pendingAssign.length}
          accentColor="crimson"
          trend={urgentPending.length > 0 ? 'up' : 'flat'}
          trendValue={urgentPending.length > 0 ? `紧急 ${urgentPending.length} 场(<2h开)` : '暂无紧急'}
        />
        <div className="card-dark card-hover p-5 grain-overlay relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-mint-300"
              style={{
                background: 'rgba(76, 184, 110, 0.18)',
                border: '1px solid rgba(76, 184, 110, 0.35)',
                boxShadow: '0 0 24px rgba(76, 184, 110, 0.18)',
              }}
            >
              <Star className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-400 font-medium">本周满意度</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-serif font-bold text-gradient-gold">{avgRating}</p>
                <span className="text-xs text-mint-300 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +12%
                </span>
              </div>
              <div className="h-10 mt-2 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={miniTrend}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="#4CB86E"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <StatCard
          icon={<UserPlus className="w-6 h-6" />}
          title="本月新客"
          value={newPlayers}
          accentColor="royal"
          trend="up"
          trendValue={`复购率 ${repeatRate}%`}
          subValue="vs 上月 +4人"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card-dark p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="title-gold text-lg">今日车次时间轴</h2>
            <div className="flex items-center gap-1 rounded-lg bg-ink-700/50 p-1">
              {(['yesterday', 'today', 'tomorrow'] as DayKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setActiveDay(k)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                    activeDay === k
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  {k === 'yesterday' ? '昨天' : k === 'today' ? '今天' : '明天'}
                </button>
              ))}
            </div>
          </div>

          {activeSchedules.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <CalendarClock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>当日暂无车次安排</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-[68px] top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-amber-500/40 to-transparent" />
              <div className="space-y-5">
                {activeSchedules.map((sched, idx) => {
                  const script = getScriptById(sched.scriptId);
                  const dm = getDMById(sched.dmId);
                  const hasConflict = idx > 0 && activeSchedules[idx - 1].endTime > sched.startTime;
                  const badge = statusBadgeMap[sched.status];
                  return (
                    <div key={sched.id} className="relative flex gap-4">
                      <div className="w-14 shrink-0 text-right pt-1">
                        <p className="font-mono text-sm text-slate-300 font-medium">
                          {sched.startTime}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          ~{sched.endTime}
                        </p>
                      </div>
                      <div className="pt-1.5 relative z-10 w-6 flex justify-center shrink-0">
                        <StatusDot status={sched.status} />
                      </div>
                      <div
                        className={cn(
                          'flex-1 rounded-xl p-4 border transition-all bg-ink-700/40',
                          hasConflict
                            ? 'border-crimson-500/40 shadow-glow-danger/50'
                            : 'border-ink-600/50 hover:border-amber-500/30'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-ink-500/50">
                              {script?.cover && (
                                <img
                                  src={script.cover}
                                  alt={script.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-serif font-semibold text-amber-200 truncate">
                                  {script?.name || '未知剧本'}
                                </h3>
                                <Badge variant={badge.variant}>{badge.label}</Badge>
                                {hasConflict && (
                                  <Badge variant="crimson">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    时间冲突
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400/60" />
                                  DM: {dm?.name || '-'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5 text-royal-300/70" />
                                  {sched.room}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5 text-mint-300/70" />
                                  玩家 {sched.players.length}/{script?.playerCount || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {sched.status === 'ready' && (
                              <>
                                {surveyStatusIcon(sched.surveyStatus)}
                                <Link
                                  to={`/schedules/${sched.id}/assign`}
                                  className="btn-gold py-1.5 px-3 text-xs flex items-center gap-1"
                                >
                                  <Settings className="w-3.5 h-3.5" />
                                  去分角
                                </Link>
                              </>
                            )}
                            {sched.status === 'pending' && (
                              <>
                                {surveyStatusIcon(sched.surveyStatus)}
                                <Link
                                  to={`/schedules/${sched.id}/assign`}
                                  className="btn-ghost py-1.5 px-3 text-xs"
                                >
                                  去分角
                                </Link>
                              </>
                            )}
                            {sched.status === 'playing' && (
                              <Link
                                to={`/schedules/${sched.id}/assign`}
                                className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1"
                              >
                                <ClipboardList className="w-3.5 h-3.5" />
                                查看分角表
                              </Link>
                            )}
                            {sched.status === 'finished' && (
                              <Link
                                to={`/schedules/${sched.id}/review`}
                                className="btn-gold py-1.5 px-3 text-xs flex items-center gap-1"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                填写复盘
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card-dark p-5">
            <h2 className="title-gold text-lg mb-4">满意度趋势（近7日）</h2>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={satisfactionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4A84B" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#D4A84B" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(61, 51, 82, 0.5)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#6E5E8A', fontSize: 11 }}
                    axisLine={{ stroke: '#3D3352' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[3, 5]}
                    tick={{ fill: '#6E5E8A', fontSize: 11 }}
                    axisLine={{ stroke: '#3D3352' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#251E30',
                      border: '1px solid rgba(212, 168, 75, 0.3)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#D4A84B' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rating"
                    stroke="#D4A84B"
                    strokeWidth={2}
                    fill="url(#goldGrad)"
                    dot={(props: any) => {
                      const isToday = props.index === satisfactionTrend.length - 1;
                      return (
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={isToday ? 6 : 3}
                          fill={isToday ? '#D4A84B' : '#DDB753'}
                          stroke={isToday ? '#F8EDC8' : 'none'}
                          strokeWidth={isToday ? 2 : 0}
                          style={isToday ? { filter: 'drop-shadow(0 0 8px rgba(212,168,75,0.6))' } : {}}
                        />
                      );
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-dark p-5">
            <h2 className="title-gold text-lg mb-4">热门剧本排行 TOP5</h2>
            <div className="space-y-3">
              {scriptRank.map((item, idx) => {
                const medals = [
                  'linear-gradient(135deg, #F8EDC8, #D4A84B, #8F7222)',
                  'linear-gradient(135deg, #E2E8F0, #A0AEC0, #718096)',
                  'linear-gradient(135deg, #F4A96F, #CF6D1F, #8B4513)',
                ];
                const isTop3 = idx < 3;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center gap-3 p-2.5 rounded-lg transition-all',
                      isTop3 ? 'relative overflow-hidden' : 'hover:bg-ink-700/40'
                    )}
                    style={
                      isTop3
                        ? {
                            background: `linear-gradient(90deg, ${medals[idx]}22, transparent 70%)`,
                            border: `1px solid ${medals[idx]}44`,
                          }
                        : {}
                    }
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 font-serif"
                      style={{
                        background: isTop3 ? medals[idx] : 'rgba(61, 51, 82, 0.6)',
                        color: isTop3 ? '#1A1620' : '#94a3b8',
                        boxShadow: isTop3 ? `0 0 12px ${medals[idx]}55` : 'none',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 border border-ink-500/50">
                      <img src={item.cover} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-200 truncate">{item.name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>场次 {item.sessions}</span>
                        <span className="flex items-center gap-0.5 text-amber-300">
                          <Star className="w-3 h-3 fill-current" />
                          {item.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card-dark p-5">
            <h2 className="title-gold text-lg mb-4">快捷操作</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/scripts"
                className="group relative p-4 rounded-xl border border-ink-600/50 bg-ink-700/30 hover:border-amber-500/40 transition-all hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(212,168,75,0.15), transparent 60%)' }}
                />
                <div className="relative">
                  <BookOpen className="w-7 h-7 text-amber-400 mb-2" />
                  <p className="font-medium text-sm text-slate-200">剧本库</p>
                  <p className="text-xs text-slate-500 mt-0.5">{scripts.length} 本</p>
                </div>
              </Link>
              <Link
                to="/schedules"
                className="group relative p-4 rounded-xl border border-ink-600/50 bg-ink-700/30 hover:border-amber-500/40 transition-all hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(212,168,75,0.15), transparent 60%)' }}
                />
                <div className="relative">
                  <Calendar className="w-7 h-7 text-amber-400 mb-2" />
                  <p className="font-medium text-sm text-slate-200">排班</p>
                  <p className="text-xs text-slate-500 mt-0.5">{schedules.length} 场</p>
                </div>
              </Link>
              <Link
                to="/history"
                className="group relative p-4 rounded-xl border border-ink-600/50 bg-ink-700/30 hover:border-amber-500/40 transition-all hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(212,168,75,0.15), transparent 60%)' }}
                />
                <div className="relative">
                  <RefreshCw className="w-7 h-7 text-amber-400 mb-2" />
                  <p className="font-medium text-sm text-slate-200">分角</p>
                  <p className="text-xs text-slate-500 mt-0.5">历史记录</p>
                </div>
              </Link>
              <Link
                to="/players"
                className="group relative p-4 rounded-xl border border-ink-600/50 bg-ink-700/30 hover:border-amber-500/40 transition-all hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(212,168,75,0.15), transparent 60%)' }}
                />
                <div className="relative">
                  <UserSearch className="w-7 h-7 text-amber-400 mb-2" />
                  <p className="font-medium text-sm text-slate-200">玩家</p>
                  <p className="text-xs text-slate-500 mt-0.5">档案库</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
