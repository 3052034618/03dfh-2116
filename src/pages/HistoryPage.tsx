import { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
  Sparkles,
  Users,
  Star,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import {
  useAssignmentStore,
  useScheduleStore,
  useScriptStore,
  useDMStore,
  usePlayerStore,
} from '@/stores';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import RoleAvatar from '@/components/ui/RoleAvatar';
import Modal from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import type { AssignmentReview } from '@/types';

type RatingFilter = 0 | 3 | 4 | 4.5;

interface ReviewRow {
  review: AssignmentReview;
  scheduleId: string;
  scriptId: string;
  scriptName: string;
  scriptCover: string;
  dmName: string;
  dmAvatar: string;
  date: string;
  time: string;
  playerCount: number;
  surveyRate: number;
  matchRate: number;
  adjustCount: number;
}

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [scriptFilter, setScriptFilter] = useState('all');
  const [dmFilter, setDmFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailReview, setDetailReview] = useState<ReviewRow | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const reviews = useAssignmentStore((s) => s.reviews);
  const getScheduleById = useScheduleStore((s) => s.getScheduleById);
  const scripts = useScriptStore((s) => s.scripts);
  const getScriptById = useScriptStore((s) => s.getScriptById);
  const dms = useDMStore((s) => s.dms);
  const getDMById = useDMStore((s) => s.getDMById);
  const getPlayerById = usePlayerStore((s) => s.getPlayerById);
  const getRoleById = useScriptStore((s) => s.getRoleById);

  const rows: ReviewRow[] = useMemo(() => {
    return reviews
      .map((review) => {
        const sched = getScheduleById(review.scheduleId);
        const script = getScriptById(review.scriptId || (sched?.scriptId ?? ''));
        const dm = getDMById(review.dmId);
        const overallScore = (review as any).overallScore ?? (review as any).overallRating ?? 4;
        return {
          review: { ...review, overallScore } as AssignmentReview,
          scheduleId: review.scheduleId,
          scriptId: script?.id || '',
          scriptName: script?.name || '未知剧本',
          scriptCover: script?.cover || '',
          dmName: dm?.name || '-',
          dmAvatar: dm?.avatar || '',
          date: (review as any).createdAt || review.reviewedAt || sched?.date || '2026-06-15',
          time: sched?.startTime || '19:00',
          playerCount: sched?.players.length || review.perPlayerFeedback?.length || 6,
          surveyRate: Math.floor(60 + Math.random() * 40),
          matchRate: Math.floor(70 + Math.random() * 28),
          adjustCount: Math.floor(Math.random() * 5),
        } as ReviewRow;
      })
      .filter((row) => {
        if (search && !row.scriptName.toLowerCase().includes(search.toLowerCase()) && !row.dmName.includes(search)) {
          return false;
        }
        if (scriptFilter !== 'all' && row.scriptId !== scriptFilter) return false;
        if (dmFilter !== 'all' && row.review.dmId !== dmFilter) return false;
        if (ratingFilter > 0 && (row.review as any).overallScore < ratingFilter) return false;
        const rowDate = row.date.split('T')[0];
        if (dateStart && rowDate < dateStart) return false;
        if (dateEnd && rowDate > dateEnd) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [reviews, search, scriptFilter, dmFilter, ratingFilter, dateStart, dateEnd, getScheduleById, getScriptById, getDMById]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const paginatedRows = rows.slice((page - 1) * pageSize, page * pageSize);

  function matchRateColor(rate: number) {
    if (rate >= 85) return 'heat-high';
    if (rate >= 70) return 'heat-mid';
    return 'heat-low';
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gradient-gold">分角历史记录</h1>
          <p className="text-sm text-slate-400 mt-1">共 <span className="text-amber-300 font-medium">{rows.length}</span> 条记录</p>
        </div>
      </div>

      <div className="card-dark p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="搜索剧本名 / DM名"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-dark pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="date"
              value={dateStart}
              onChange={(e) => { setDateStart(e.target.value); setPage(1); }}
              className="input-dark text-sm"
            />
          </div>
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => { setDateEnd(e.target.value); setPage(1); }}
            className="input-dark text-sm"
          />
          <select
            value={scriptFilter}
            onChange={(e) => { setScriptFilter(e.target.value); setPage(1); }}
            className="input-dark text-sm"
          >
            <option value="all">全部剧本</option>
            {scripts.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={dmFilter}
            onChange={(e) => { setDmFilter(e.target.value); setPage(1); }}
            className="input-dark text-sm"
          >
            <option value="all">全部DM</option>
            {dms.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="divider-gold my-4" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-400">评分范围：</span>
            {([0, 3, 4, 4.5] as RatingFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => { setRatingFilter(r); setPage(1); }}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all border',
                  ratingFilter === r
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-ink-700/40 text-slate-400 border-ink-600/50 hover:text-slate-200'
                )}
              >
                {r === 0 ? '全部' : `≥ ${r}`}
              </button>
            ))}
          </div>
          <button className="btn-ghost flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            导出数据
          </button>
        </div>
      </div>

      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs bg-ink-700/40">
                <th className="px-5 py-3 font-medium w-8"></th>
                <th className="px-5 py-3 font-medium">日期时间</th>
                <th className="px-5 py-3 font-medium">剧本</th>
                <th className="px-5 py-3 font-medium">DM</th>
                <th className="px-5 py-3 font-medium">玩家数</th>
                <th className="px-5 py-3 font-medium">问卷回收率</th>
                <th className="px-5 py-3 font-medium">整体评分</th>
                <th className="px-5 py-3 font-medium">分角匹配率</th>
                <th className="px-5 py-3 font-medium">人工调整</th>
                <th className="px-5 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-600/40">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-16 text-center text-slate-500">
                    暂无符合条件的记录
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => {
                  const isExpanded = expandedId === row.scheduleId;
                  const displayDate = row.date.includes('T') ? format(parseISO(row.date), 'yyyy-MM-dd HH:mm') : `${row.date} ${row.time}`;
                  return (
                    <>
                      <tr
                        key={row.scheduleId}
                        className={cn(
                          'hover:bg-ink-700/30 transition-colors cursor-pointer',
                          isExpanded && 'bg-ink-700/40'
                        )}
                        onClick={() => setExpandedId(isExpanded ? null : row.scheduleId)}
                      >
                        <td className="px-5 py-4">
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4 text-amber-400" />
                            : <ChevronDown className="w-4 h-4 text-slate-500" />
                          }
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-slate-200 font-mono">{displayDate}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 border border-ink-500/50">
                              {row.scriptCover && (
                                <img src={row.scriptCover} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <span className="font-medium text-slate-200 truncate">{row.scriptName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <RoleAvatar name={row.dmName} avatar={row.dmAvatar} size="sm" />
                            <span className="text-slate-200">{row.dmName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-200">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-royal-300/70" />
                            {row.playerCount}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="w-28">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-400">回收</span>
                              <span className="text-slate-200">{row.surveyRate}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-ink-600/60 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-royal-500 to-royal-300"
                                style={{ width: `${row.surveyRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <StarRating value={(row.review as any).overallScore} readOnly size="sm" />
                        </td>
                        <td className="px-5 py-4">
                          <div className={cn(
                            'heat-cell w-24 h-8 rounded-md flex items-center justify-center font-mono text-sm',
                            matchRateColor(row.matchRate)
                          )}>
                            {row.matchRate}%
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {row.adjustCount > 0 ? (
                            <Badge variant={row.adjustCount >= 3 ? 'crimson' : 'amber'}>
                              {row.adjustCount} 次
                            </Badge>
                          ) : (
                            <span className="text-slate-500 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setDetailReview(row); }}
                            className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            查看详情
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={row.scheduleId + '-exp'}>
                          <td colSpan={10} className="bg-ink-700/20 px-5 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="p-4 rounded-lg bg-ink-800/60 border border-ink-600/50">
                                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                                  <RefreshCw className="w-3 h-3" /> 分角方案回顾
                                </p>
                                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                  {row.review.perPlayerFeedback.slice(0, 4).map((fb) => {
                                    const p = getPlayerById(fb.playerId);
                                    return (
                                      <div key={fb.playerId} className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-ink-700/40">
                                        <span className="text-slate-300">{p?.name || fb.playerId}</span>
                                        <span className="text-amber-300 font-mono text-[10px]">→ {fb.roleId}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="p-4 rounded-lg bg-ink-800/60 border border-ink-600/50">
                                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> 警告回顾
                                </p>
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2 text-xs py-1 px-2 rounded bg-crimson-700/20 border border-crimson-500/30 text-crimson-300">
                                    <AlertTriangle className="w-3 h-3 shrink-0" />
                                    <span>2条潜在冲突风险</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs py-1 px-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                                    <AlertTriangle className="w-3 h-3 shrink-0" />
                                    <span>1条新人匹配建议</span>
                                  </div>
                                </div>
                              </div>
                              <div className="p-4 rounded-lg bg-ink-800/60 border border-ink-600/50">
                                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> 复盘摘要
                                </p>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <StarRating value={(row.review as any).overallScore} readOnly size="sm" />
                                  </div>
                                  {row.review.bestExperience.length > 0 && (
                                    <p className="text-xs text-mint-300">
                                      最佳体验 {row.review.bestExperience.length} 人
                                    </p>
                                  )}
                                  {row.review.disappointingExperience.length > 0 && (
                                    <p className="text-xs text-crimson-300">
                                      落差体验 {row.review.disappointingExperience.length} 人
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="p-4 rounded-lg bg-ink-800/60 border border-ink-600/50">
                                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> 标签调整
                                </p>
                                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                  {row.review.suggestedTagAdjustments.slice(0, 3).map((adj, i) => (
                                    <div key={i} className="text-xs py-1 px-2 rounded bg-ink-700/40">
                                      <div className="flex items-center justify-between">
                                        <span className="text-amber-300">{adj.tagName}</span>
                                        <span className="font-mono text-slate-400">
                                          {adj.currentWeight} → {adj.suggestedWeight}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                  {row.review.suggestedTagAdjustments.length === 0 && (
                                    <p className="text-xs text-slate-500 italic">无需调整</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {rows.length > pageSize && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-ink-600/40">
            <p className="text-sm text-slate-400">
              第 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, rows.length)} / 共 {rows.length} 条
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-amber-300 hover:bg-ink-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'w-8 h-8 rounded-md text-sm font-medium transition-all',
                    page === p
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-ink-700/50'
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-amber-300 hover:bg-ink-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={!!detailReview} onClose={() => setDetailReview(null)} size="xl" title="分角详情回顾">
        {detailReview && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-ink-700/40 border border-ink-600/50">
              <div className="w-16 h-20 rounded-lg overflow-hidden shrink-0 border border-ink-500/50">
                <img src={detailReview.scriptCover} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-xl font-semibold text-amber-200">{detailReview.scriptName}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-400 flex-wrap">
                  <span>DM: {detailReview.dmName}</span>
                  <span>{format(parseISO(detailReview.date.split('T')[0]), 'yyyy-MM-dd')} {detailReview.time}</span>
                  <span>玩家 {detailReview.playerCount} 人</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <StarRating value={(detailReview.review as any).overallScore} readOnly />
                  <span className="text-xs text-slate-400">匹配率 {detailReview.matchRate}%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="title-gold text-base mb-3">分角方案回顾</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {detailReview.review.perPlayerFeedback.map((fb) => {
                  const p = getPlayerById(fb.playerId);
                  const script = getScriptById(detailReview.scriptId);
                  const role = script ? getRoleById(script.id, fb.roleId) : null;
                  return (
                    <div
                      key={fb.playerId}
                      className="flex items-center gap-3 p-3 rounded-lg bg-ink-800/60 border border-ink-600/50"
                    >
                      <RoleAvatar name={p?.name || '?'} avatar={p?.avatar} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-200 font-medium">{p?.name || fb.playerId}</span>
                          <span className="text-amber-400">→</span>
                          <span className="text-amber-300 font-serif">{role?.name || fb.roleId}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating value={fb.score} readOnly size="sm" />
                          <div className="flex gap-1 flex-wrap">
                            {fb.experienceTags.slice(0, 3).map((t) => (
                              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-ink-700/60 text-slate-400">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {detailReview.review.dmNotes && (
              <div>
                <h4 className="title-gold text-base mb-3">DM 备注</h4>
                <p className="p-4 rounded-lg bg-ink-800/60 border border-ink-600/50 text-slate-300 text-sm leading-relaxed">
                  {detailReview.review.dmNotes}
                </p>
              </div>
            )}

            {detailReview.review.suggestedTagAdjustments.length > 0 && (
              <div>
                <h4 className="title-gold text-base mb-3">建议标签调整</h4>
                <div className="space-y-2">
                  {detailReview.review.suggestedTagAdjustments.map((adj, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg bg-ink-800/60 border border-ink-600/50"
                    >
                      <Badge variant="amber" className="shrink-0">{adj.tagName}</Badge>
                      <div className="flex-1 h-2 rounded-full bg-ink-700/60 overflow-hidden relative">
                        <div
                          className="absolute left-0 top-0 h-full bg-royal-500/50"
                          style={{ width: `${adj.currentWeight}%` }}
                        />
                        <div
                          className="absolute top-0 h-full bg-amber-400/70 border-r-2 border-amber-300"
                          style={{ left: `${adj.suggestedWeight}%`, width: '2px' }}
                        />
                      </div>
                      <span className="text-xs font-mono text-slate-400 shrink-0 w-20 text-right">
                        {adj.currentWeight} → {adj.suggestedWeight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
