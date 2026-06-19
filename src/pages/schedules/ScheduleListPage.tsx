import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  List,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  isSameDay,
  parseISO,
  eachDayOfInterval,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useScriptStore } from '@/stores/scriptStore';
import { useDMStore } from '@/stores/dmStore';
import type { Schedule, Script, DM } from '@/types';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Empty from '@/components/ui/Empty';
import { cn } from '@/lib/utils';

const TIME_SLOTS = ['10:00', '13:00', '14:00', '15:00', '19:00', '20:00'];

const ROOM_OPTIONS = ['A厅', 'B厅', 'C厅', 'D厅', '搜证室'];

const GENRE_GRADIENTS: Record<string, string> = {
  情感: 'linear-gradient(135deg, rgba(139,92,246,0.35), rgba(168,85,247,0.2))',
  古风: 'linear-gradient(135deg, rgba(139,92,246,0.35), rgba(168,85,247,0.2))',
  硬核: 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(37,99,235,0.2))',
  刑侦: 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(37,99,235,0.2))',
  推理: 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(37,99,235,0.2))',
  恐怖: 'linear-gradient(135deg, rgba(185,28,28,0.35), rgba(153,27,27,0.2))',
  中式: 'linear-gradient(135deg, rgba(185,28,28,0.35), rgba(153,27,27,0.2))',
  欢乐: 'linear-gradient(135deg, rgba(245,158,11,0.35), rgba(217,119,6,0.2))',
  机制: 'linear-gradient(135deg, rgba(245,158,11,0.35), rgba(217,119,6,0.2))',
  爆笑: 'linear-gradient(135deg, rgba(245,158,11,0.35), rgba(217,119,6,0.2))',
  阵营: 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(22,163,74,0.2))',
  谍战: 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(22,163,74,0.2))',
  民国: 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(22,163,74,0.2))',
};

const STATUS_STYLES: Record<string, { variant: 'ink' | 'amber' | 'mint' | 'royal'; label: string; pulse?: boolean }> = {
  pending: { variant: 'ink', label: '待开始' },
  ready: { variant: 'amber', label: '已就绪' },
  playing: { variant: 'mint', label: '进行中', pulse: true },
  finished: { variant: 'royal', label: '已结束' },
  cancelled: { variant: 'ink', label: '已取消' },
};

const RELATION_LABELS: Record<string, string> = {
  lover: '情侣',
  friend: '朋友',
  family: '家人',
  colleague: '同事',
  stranger: '陌生',
};

interface CreateFormState {
  scriptId: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  dmId: string;
  playerCount: number;
  notes: string;
}

const defaultForm: CreateFormState = {
  scriptId: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  startTime: '13:00',
  endTime: '18:00',
  room: '',
  dmId: '',
  playerCount: 6,
  notes: '',
};

function getGenreGradient(script?: Script): string {
  if (!script) return GENRE_GRADIENTS['情感'];
  for (const g of script.genre) {
    if (GENRE_GRADIENTS[g]) return GENRE_GRADIENTS[g];
  }
  return 'linear-gradient(135deg, rgba(107,114,128,0.3), rgba(75,85,99,0.2))';
}

function getGenreBadgeVariant(genre: string): 'royal' | 'amber' | 'mint' | 'crimson' | 'sunset' | 'ink' {
  if (['情感', '古风', '治愈'].includes(genre)) return 'royal';
  if (['硬核', '刑侦', '推理'].includes(genre)) return 'amber';
  if (['恐怖', '中式', '变格'].includes(genre)) return 'crimson';
  if (['欢乐', '机制', '爆笑'].includes(genre)) return 'sunset';
  if (['阵营', '谍战', '民国'].includes(genre)) return 'mint';
  return 'ink';
}

function ScheduleCard({
  schedule,
  script,
  dm,
  compact = false,
}: {
  schedule: Schedule;
  script?: Script;
  dm?: DM;
  compact?: boolean;
}) {
  const navigate = useNavigate();
  const status = STATUS_STYLES[schedule.status] || STATUS_STYLES.pending;
  const gradient = getGenreGradient(script);
  const playerCount = schedule.players.length;
  const maxPlayers = script?.playerCount || playerCount;

  return (
    <div
      onClick={() => navigate(`/schedules/${schedule.id}`)}
      className={cn(
        'rounded-lg p-2 cursor-pointer transition-all duration-300 overflow-hidden border relative group',
        'hover:-translate-y-0.5 hover:shadow-lg',
        compact ? 'text-xs' : 'text-sm'
      )}
      style={{
        background: gradient,
        borderColor: 'rgba(212, 168, 75, 0.25)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {status.pulse && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-400 animate-ping" />
      )}

      <div className="font-bold text-slate-100 mb-1 truncate" style={{ fontSize: compact ? '11px' : '12px' }}>
        {script?.name || '未知剧本'}
      </div>

      {!compact && (
        <div className="space-y-0.5 text-slate-300/90 mb-1.5">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 shrink-0" />
            <span className="truncate">{schedule.startTime}-{schedule.endTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{schedule.room}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3 h-3 shrink-0" />
            <span className="truncate">{dm?.name || '未分配'}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-0.5">
          <Users className="w-3 h-3 text-slate-300" />
          <span className="text-[11px] text-slate-200 font-medium">
            {playerCount}/{maxPlayers}
          </span>
        </div>
        <Badge variant={status.variant} className="scale-[0.85] origin-right">
          {status.label}
        </Badge>
      </div>
    </div>
  );
}

export default function ScheduleListPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date('2026-06-20'), { weekStartsOn: 1 })
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<CreateFormState>(defaultForm);
  const [scriptSearch, setScriptSearch] = useState('');
  const [playerSearch, setPlayerSearch] = useState('');

  const getSchedulesByDateRange = useScheduleStore((s) => s.getSchedulesByDateRange);
  const createSchedule = useScheduleStore((s) => s.createSchedule);
  const scripts = useScriptStore((s) => s.scripts);
  const getScriptById = useScriptStore((s) => s.getScriptById);
  const dms = useDMStore((s) => s.dms);
  const getDMById = useDMStore((s) => s.getDMById);

  const weekStart = currentWeekStart;
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const today = new Date('2026-06-20');

  const schedules = useMemo(
    () => getSchedulesByDateRange(format(weekStart, 'yyyy-MM-dd'), format(weekEnd, 'yyyy-MM-dd')),
    [weekStart, weekEnd, getSchedulesByDateRange]
  );

  const filteredScripts = useMemo(() => {
    if (!scriptSearch.trim()) return scripts;
    const q = scriptSearch.toLowerCase();
    return scripts.filter(
      (s) => s.name.toLowerCase().includes(q) || s.genre.some((g) => g.toLowerCase().includes(q))
    );
  }, [scripts, scriptSearch]);

  const weekTitle = useMemo(() => {
    const startStr = format(weekStart, 'yyyy年M月d日', { locale: zhCN });
    const endMonth = format(weekEnd, 'M');
    const endDay = format(weekEnd, 'd日', { locale: zhCN });
    if (format(weekStart, 'M') === endMonth) {
      return `${startStr.slice(0, -1)}月${format(weekStart, 'd')}日 - ${endDay}`;
    }
    return `${startStr} - ${endMonth}月${endDay}`;
  }, [weekStart, weekEnd]);

  const getSchedulesForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedules.filter((s) => s.date === dateStr);
  };

  const handlePrevWeek = () => setCurrentWeekStart((d) => addWeeks(d, -1));
  const handleNextWeek = () => setCurrentWeekStart((d) => addWeeks(d, 1));
  const handleToday = () => setCurrentWeekStart(startOfWeek(new Date('2026-06-20'), { weekStartsOn: 1 }));

  const handleCreateSubmit = () => {
    if (!form.scriptId || !form.dmId || !form.room) return;
    createSchedule({
      scriptId: form.scriptId,
      dmId: form.dmId,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      room: form.room,
      notes: form.notes,
    });
    setShowCreateModal(false);
    setForm(defaultForm);
  };

  const sortedListSchedules = useMemo(() => {
    return [...schedules].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
  }, [schedules]);

  const surveyStatusBadge = (status: string) => {
    switch (status) {
      case 'not_sent':
        return <Badge variant="ink">未发送</Badge>;
      case 'sent':
        return <Badge variant="amber">已发送</Badge>;
      case 'partial':
        return <Badge variant="sunset">部分回收</Badge>;
      case 'completed':
        return <Badge variant="mint">全部回收</Badge>;
      default:
        return <Badge variant="ink">-</Badge>;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="title-gold text-xl">车次排班</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('week')}
            className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200',
              viewMode === 'week'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 hover:text-amber-400 hover:bg-ink-700/50 border border-ink-600/50'
            )}
            title="周视图"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200',
              viewMode === 'list'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 hover:text-amber-400 hover:bg-ink-700/50 border border-ink-600/50'
            )}
            title="列表视图"
          >
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn-gold flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>创建车次</span>
          </button>
        </div>
      </div>

      <div className="card-dark p-4 flex flex-wrap items-center gap-3">
        <button
          onClick={handlePrevWeek}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-ink-700/50 border border-ink-600/50 transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="title-gold text-base font-medium min-w-[220px] text-center">
          {weekTitle}
        </span>

        <button
          onClick={handleNextWeek}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-ink-700/50 border border-ink-600/50 transition-all duration-200"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleToday}
          className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-amber-400 border border-amber-500/40 hover:bg-amber-500/10 transition-all duration-200"
        >
          今天
        </button>
      </div>

      {viewMode === 'week' ? (
        <div className="card-dark overflow-hidden">
          <div className="grid grid-cols-[80px_repeat(7,1fr)]">
            <div className="border-b border-r border-ink-600/40 p-2" />
            {weekDays.map((day, idx) => {
              const isToday = isSameDay(day, today);
              const weekDayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
              return (
                <div
                  key={idx}
                  className={cn(
                    'border-b border-ink-600/40 p-2.5 text-center',
                    idx < 6 && 'border-r',
                    isToday && 'bg-amber-500/5 border-amber-500/30'
                  )}
                >
                  <div className={cn('text-xs mb-1', isToday ? 'text-amber-400' : 'text-slate-500')}>
                    {weekDayNames[idx]}
                  </div>
                  <div
                    className={cn(
                      'text-lg font-serif font-semibold',
                      isToday ? 'text-amber-400' : 'text-slate-200'
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}

            {TIME_SLOTS.map((time, tIdx) => (
              <>
                <div
                  key={`t-${tIdx}`}
                  className={cn(
                    'border-r border-ink-600/40 p-2 text-xs text-slate-500 font-mono text-right',
                    tIdx < TIME_SLOTS.length - 1 && 'border-b'
                  )}
                  style={{ minHeight: '130px' }}
                >
                  {time}
                </div>
                {weekDays.map((day, dIdx) => {
                  const daySchedules = getSchedulesForDay(day).filter((s) => {
                    const sHour = parseInt(s.startTime.split(':')[0]);
                    const tHour = parseInt(time.split(':')[0]);
                    return Math.abs(sHour - tHour) < 3;
                  });
                  const isToday = isSameDay(day, today);
                  return (
                    <div
                      key={`c-${tIdx}-${dIdx}`}
                      className={cn(
                        'p-2 space-y-2',
                        dIdx < 6 && 'border-r',
                        tIdx < TIME_SLOTS.length - 1 && 'border-b border-ink-600/40',
                        isToday && 'bg-amber-500/[0.03]'
                      )}
                      style={{ minHeight: '130px' }}
                    >
                      {daySchedules.map((schedule) => (
                        <ScheduleCard
                          key={schedule.id}
                          schedule={schedule}
                          script={getScriptById(schedule.scriptId)}
                          dm={getDMById(schedule.dmId)}
                          compact
                        />
                      ))}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      ) : (
        <div className="card-dark overflow-hidden">
          {sortedListSchedules.length === 0 ? (
            <Empty title="本周暂无车次" description="点击右上角「创建车次」来添加新的排班" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-600/40 text-slate-400 text-xs">
                    <th className="text-left font-medium p-4">日期时间</th>
                    <th className="text-left font-medium p-4">剧本</th>
                    <th className="text-left font-medium p-4">房间</th>
                    <th className="text-left font-medium p-4">DM</th>
                    <th className="text-left font-medium p-4">玩家数</th>
                    <th className="text-left font-medium p-4">问卷状态</th>
                    <th className="text-left font-medium p-4">状态</th>
                    <th className="text-left font-medium p-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedListSchedules.map((schedule) => {
                    const script = getScriptById(schedule.scriptId);
                    const dm = getDMById(schedule.dmId);
                    const status = STATUS_STYLES[schedule.status] || STATUS_STYLES.pending;
                    return (
                      <tr
                        key={schedule.id}
                        onClick={() => navigate(`/schedules/${schedule.id}`)}
                        className="border-b border-ink-700/30 hover:bg-ink-700/30 cursor-pointer transition-colors"
                      >
                        <td className="p-4">
                          <div className="text-slate-200 font-medium">
                            {format(parseISO(schedule.date), 'M月d日', { locale: zhCN })}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-serif text-slate-100 font-medium">
                            {script?.name || '未知'}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {script?.genre.slice(0, 2).map((g) => (
                              <Badge key={g} variant={getGenreBadgeVariant(g)}>
                                {g}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-slate-300">{schedule.room}</td>
                        <td className="p-4 text-slate-300">{dm?.name || '未分配'}</td>
                        <td className="p-4">
                          <span className="text-slate-200">
                            {schedule.players.length}
                            <span className="text-slate-500">/{script?.playerCount || '?'}</span>
                          </span>
                        </td>
                        <td className="p-4">{surveyStatusBadge(schedule.surveyStatus)}</td>
                        <td className="p-4">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/schedules/${schedule.id}`);
                            }}
                            className="px-3 py-1 text-xs rounded-md bg-ink-700/50 text-amber-400 hover:bg-amber-500/15 border border-amber-500/30 transition-all"
                          >
                            查看详情
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setForm(defaultForm);
          setScriptSearch('');
          setPlayerSearch('');
        }}
        title="创建车次"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setShowCreateModal(false)}
              className="btn-ghost"
            >
              取消
            </button>
            <button
              onClick={handleCreateSubmit}
              disabled={!form.scriptId || !form.dmId || !form.room}
              className={cn('btn-gold', (!form.scriptId || !form.dmId || !form.room) && 'opacity-50 cursor-not-allowed')}
            >
              创建
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              选择剧本 <span className="text-crimson-400">*</span>
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={scriptSearch}
                onChange={(e) => setScriptSearch(e.target.value)}
                placeholder="搜索剧本名称或题材..."
                className="input-dark pl-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredScripts.map((script) => (
                <div
                  key={script.id}
                  onClick={() => {
                    setForm({ ...form, scriptId: script.id, playerCount: script.playerCount });
                  }}
                  className={cn(
                    'p-2.5 rounded-lg cursor-pointer border transition-all duration-200',
                    form.scriptId === script.id
                      ? 'bg-amber-500/10 border-amber-500/50'
                      : 'bg-ink-900/50 border-ink-600/40 hover:border-amber-500/30'
                  )}
                >
                  <div className="font-serif font-medium text-slate-100 text-sm">{script.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">
                      {script.playerCount}人 · {Math.floor(script.duration / 60)}h
                    </span>
                    <div className="flex gap-1">
                      {script.genre.slice(0, 2).map((g) => (
                        <Badge key={g} variant={getGenreBadgeVariant(g)}>
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                日期 <span className="text-crimson-400">*</span>
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input-dark"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">预计人数</label>
              <select
                value={form.playerCount}
                onChange={(e) => setForm({ ...form, playerCount: Number(e.target.value) })}
                className="input-dark"
              >
                {[4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>{n}人</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">开始时间</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="input-dark"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">结束时间</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="input-dark"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              房间号 <span className="text-crimson-400">*</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ROOM_OPTIONS.map((room) => (
                <button
                  key={room}
                  type="button"
                  onClick={() => setForm({ ...form, room })}
                  className={cn(
                    'py-2 rounded-lg text-sm border transition-all duration-200',
                    form.room === room
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-400'
                      : 'bg-ink-900/50 border-ink-600/40 text-slate-400 hover:border-amber-500/30 hover:text-slate-200'
                  )}
                >
                  {room}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              DM 分配 <span className="text-crimson-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {dms.map((dm) => (
                <div
                  key={dm.id}
                  onClick={() => setForm({ ...form, dmId: dm.id })}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer border transition-all duration-200 flex items-center gap-3',
                    form.dmId === dm.id
                      ? 'bg-amber-500/10 border-amber-500/50'
                      : 'bg-ink-900/50 border-ink-600/40 hover:border-amber-500/30'
                  )}
                >
                  <div
                    className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-serif font-bold text-sm"
                    style={{
                      background: 'linear-gradient(135deg, #4B2E7A, #3D3352)',
                      border: '1.5px solid rgba(212,168,75,0.5)',
                    }}
                  >
                    <span className="text-amber-300">{dm.name[0]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-slate-200 font-medium text-sm">{dm.name}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dm.specialty.slice(0, 2).map((s) => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-ink-700/60 text-slate-400">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">备注</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="可选..."
              rows={3}
              className="input-dark resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
