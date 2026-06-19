import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  RefreshCw,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRightLeft,
  Shuffle,
  Heart,
  Users,
  Sparkles,
  Home,
  Calendar,
  Gauge,
  UserCheck,
  X,
  Check,
  Lock as LockIcon,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useScriptStore } from '@/stores/scriptStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useDMStore } from '@/stores/dmStore';
import { useAssignmentStore } from '@/stores/assignmentStore';
import { generateAssignment, getHeatColorClass, getDifficultyLabel, getGenderLabel } from '@/utils/assignmentEngine';
import RoleAvatar from '@/components/ui/RoleAvatar';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import type { AssignmentPair, AssignmentWarning, MatchCell, PlayerProfile, Role, Schedule, SchedulePlayer, Script, DM } from '@/types';

const statusBadgeMap: Record<string, { variant: any; label: string }> = {
  pending: { variant: 'amber', label: '待确认' },
  ready: { variant: 'mint', label: '就绪' },
  playing: { variant: 'royal', label: '进行中' },
  finished: { variant: 'ink', label: '已结束' },
  cancelled: { variant: 'crimson', label: '已取消' },
};

const severityConfig = {
  high: {
    border: 'border-crimson-500/60',
    bg: 'bg-crimson-500/10',
    text: 'text-crimson-300',
    badge: 'crimson' as const,
    glow: 'shadow-[0_0_20px_rgba(201,58,78,0.3)]',
    pulse: 'animate-pulse',
    icon: '🔴',
  },
  medium: {
    border: 'border-sunset-500/60',
    bg: 'bg-sunset-500/10',
    text: 'text-sunset-300',
    badge: 'sunset' as const,
    glow: '',
    pulse: '',
    icon: '🟠',
  },
  low: {
    border: 'border-amber-500/50',
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
    badge: 'amber' as const,
    glow: '',
    pulse: '',
    icon: '🟡',
  },
};

const socialStyleMap = {
  social: { icon: '🐮', label: '社牛' },
  normal: { icon: '😐', label: '正常' },
  introvert: { icon: '🐢', label: '社恐' },
};

interface SortableAssignmentCardProps {
  pair: AssignmentPair;
  player: PlayerProfile | undefined;
  role: Role | undefined;
  schedulePlayer: SchedulePlayer | undefined;
  score: number;
}

function SortableAssignmentCard({
  pair,
  player,
  role,
  schedulePlayer,
  score,
}: SortableAssignmentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pair.playerId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const useAssignmentStoreState = useAssignmentStore.getState();
  const { id: scheduleId } = useParams();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'card-dark p-4 min-w-[240px] shrink-0 cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 scale-105 z-50',
        pair.isLocked && 'border-amber-500/50'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <RoleAvatar
            name={player?.name || '?'}
            avatar={player?.avatar}
            gender={player?.gender}
            size="sm"
          />
          <div>
            <div className="text-sm font-medium text-slate-200">{player?.name || '未知玩家'}</div>
            <div className="text-xs text-slate-400">
              {schedulePlayer?.surveyResponse?.socialStyle &&
                `${socialStyleMap[schedulePlayer.surveyResponse.socialStyle].icon} ${socialStyleMap[schedulePlayer.surveyResponse.socialStyle].label}`}
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (scheduleId) useAssignmentStoreState.toggleLock(scheduleId, pair.playerId);
          }}
          className={cn(
            'p-1.5 rounded-lg transition-all',
            pair.isLocked
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
              : 'bg-ink-700/50 text-slate-400 hover:text-slate-300'
          )}
        >
          {pair.isLocked ? <LockIcon className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center justify-center py-2">
        <ArrowRightLeft className="w-5 h-5 text-amber-500/60" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RoleAvatar
            name={role?.name || '?'}
            avatar={role?.avatar}
            gender={role?.gender}
            size="sm"
          />
          <div>
            <div className="text-sm font-serif font-medium text-slate-200">{role?.name || '未知角色'}</div>
            <div className="text-xs text-slate-400">
              {getGenderLabel(role?.gender || 'any')} · 难度{role?.difficulty || 0}
            </div>
          </div>
        </div>
        <Badge variant={score >= 75 ? 'mint' : score >= 50 ? 'amber' : 'crimson'}>
          {score}分
        </Badge>
      </div>
    </div>
  );
}

export default function AssignmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const getScheduleById = useScheduleStore((s) => s.getScheduleById);
  const getScriptById = useScriptStore((s) => s.getScriptById);
  const getPlayerById = usePlayerStore((s) => s.getPlayerById);
  const getDMById = useDMStore((s) => s.getDMById);
  const { generateSuggestion, getSuggestion, toggleLock, swapRoles, finalizeAssignment } = useAssignmentStore();

  const [loading, setLoading] = useState(true);
  const [warningsExpanded, setWarningsExpanded] = useState(true);
  const [confirmedWarnings, setConfirmedWarnings] = useState<Set<string>>(new Set());
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [pendingCell, setPendingCell] = useState<{ playerId: string; roleId: string } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ playerId: string; roleId: string; x: number; y: number } | null>(null);

  const schedule: Schedule | undefined = id ? getScheduleById(id) : undefined;
  const script: Script | undefined = schedule ? getScriptById(schedule.scriptId) : undefined;
  const dm: DM | undefined = schedule ? getDMById(schedule.dmId) : undefined;

  const suggestion = id ? getSuggestion(id) : undefined;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!schedule || !script) return;

    const timer = setTimeout(() => {
      const playerProfiles = schedule.players
        .map((sp) => getPlayerById(sp.playerId))
        .filter(Boolean) as PlayerProfile[];

      const existingSuggestion = id ? getSuggestion(id) : undefined;
      if (!existingSuggestion) {
        const newSuggestion = generateAssignment(schedule, script, playerProfiles);
        useAssignmentStore.setState((state) => ({
          suggestions: {
            ...state.suggestions,
            [id!]: newSuggestion,
          },
        }));
      }
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [schedule, script, id, getSuggestion, generateAssignment, getPlayerById]);

  const finalPlan = suggestion?.finalPlan || [];
  const warnings = suggestion?.warnings || [];
  const matchMatrix = suggestion?.matchMatrix || [];

  const playersData = useMemo(() => {
    if (!schedule) return [];
    return schedule.players.map((sp) => ({
      schedulePlayer: sp,
      profile: getPlayerById(sp.playerId),
    }));
  }, [schedule, getPlayerById]);

  const roles = script?.roles || [];

  const groupedWarnings = useMemo(() => {
    return {
      high: warnings.filter((w) => w.severity === 'high' && !confirmedWarnings.has(createWarningKey(w))),
      medium: warnings.filter((w) => w.severity === 'medium' && !confirmedWarnings.has(createWarningKey(w))),
      low: warnings.filter((w) => w.severity === 'low' && !confirmedWarnings.has(createWarningKey(w))),
    };
  }, [warnings, confirmedWarnings]);

  const totalRemainingWarnings = groupedWarnings.high.length + groupedWarnings.medium.length + groupedWarnings.low.length;

  function createWarningKey(w: AssignmentWarning): string {
    return `${w.severity}-${w.playerIds.join(',')}-${w.roleIds.join(',')}`;
  }

  function getCellScore(playerId: string, roleId: string): number {
    const row = matchMatrix.find((r) => r[0]?.playerId === playerId);
    const cell = row?.find((c) => c.roleId === roleId);
    return cell?.score || 0;
  }

  function getCellData(playerId: string, roleId: string): MatchCell | undefined {
    const row = matchMatrix.find((r) => r[0]?.playerId === playerId);
    return row?.find((c) => c.roleId === roleId);
  }

  function isRecommendedPair(playerId: string, roleId: string): boolean {
    return suggestion?.recommendedPlan.some((p) => p.playerId === playerId && p.roleId === roleId) || false;
  }

  function isFinalPair(playerId: string, roleId: string): boolean {
    return finalPlan.some((p) => p.playerId === playerId && p.roleId === roleId);
  }

  function isPlayerLocked(playerId: string): boolean {
    return finalPlan.find((p) => p.playerId === playerId)?.isLocked || false;
  }

  function isRoleAssigned(roleId: string): string | null {
    const pair = finalPlan.find((p) => p.roleId === roleId);
    return pair ? pair.playerId : null;
  }

  function hasCellConflict(playerId: string, roleId: string): boolean {
    const cell = getCellData(playerId, roleId);
    return cell && cell.warnings.length > 0;
  }

  function handleCellClick(playerId: string, roleId: string) {
    if (isPlayerLocked(playerId)) return;

    const existingOwner = isRoleAssigned(roleId);
    if (existingOwner && existingOwner !== playerId && isPlayerLocked(existingOwner)) {
      return;
    }

    if (hasCellConflict(playerId, roleId)) {
      setPendingCell({ playerId, roleId });
      setShowConflictModal(true);
      return;
    }

    applyAssignment(playerId, roleId);
  }

  function applyAssignment(playerId: string, roleId: string) {
    if (!id) return;

    const newPlan = finalPlan.map((p) => {
      if (p.playerId === playerId) {
        return { ...p, roleId };
      }
      if (p.roleId === roleId) {
        const otherRole = finalPlan.find((pp) => pp.playerId === playerId)?.roleId;
        return { ...p, roleId: otherRole || p.roleId };
      }
      return p;
    });

    useAssignmentStore.setState((state) => ({
      suggestions: {
        ...state.suggestions,
        [id]: {
          ...state.suggestions[id],
          finalPlan: newPlan,
          manualAdjusted: true,
        },
      },
    }));
  }

  function handleRegenerate() {
    if (!id || !schedule || !script) return;
    setLoading(true);
    setConfirmedWarnings(new Set());
    const playerProfiles = schedule.players
      .map((sp) => getPlayerById(sp.playerId))
      .filter(Boolean) as PlayerProfile[];
    const newSuggestion = generateAssignment(schedule, script, playerProfiles);
    useAssignmentStore.setState((state) => ({
      suggestions: {
        ...state.suggestions,
        [id]: newSuggestion,
      },
    }));
    setTimeout(() => setLoading(false), 500);
  }

  function handleConfirmWarning(warning: AssignmentWarning) {
    setConfirmedWarnings((prev) => new Set([...prev, createWarningKey(warning)]));
  }

  function handleSuggestAdjustment(warning: AssignmentWarning) {
    if (!id || warning.playerIds.length < 2) return;
    const [pA, pB] = warning.playerIds;
    swapRoles(id, pA, pB);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !id) return;

    const idxA = finalPlan.findIndex((p) => p.playerId === active.id);
    const idxB = finalPlan.findIndex((p) => p.playerId === over.id);
    if (idxA === -1 || idxB === -1) return;
    if (finalPlan[idxA].isLocked || finalPlan[idxB].isLocked) return;

    const newPlan = arrayMove(finalPlan, idxA, idxB);
    const roleIdA = finalPlan[idxA].roleId;
    const roleIdB = finalPlan[idxB].roleId;
    newPlan[idxA] = { ...newPlan[idxA], roleId: roleIdB };
    newPlan[idxB] = { ...newPlan[idxB], roleId: roleIdA };

    useAssignmentStore.setState((state) => ({
      suggestions: {
        ...state.suggestions,
        [id]: {
          ...state.suggestions[id],
          finalPlan: newPlan,
          manualAdjusted: true,
        },
      },
    }));
  }

  function handleUnlockAll() {
    if (!id) return;
    const newPlan = finalPlan.map((p) => ({ ...p, isLocked: false }));
    useAssignmentStore.setState((state) => ({
      suggestions: {
        ...state.suggestions,
        [id]: {
          ...state.suggestions[id],
          finalPlan: newPlan,
        },
      },
    }));
  }

  function handleLockHighScores() {
    if (!id) return;
    const newPlan = finalPlan.map((p) => {
      const score = getCellScore(p.playerId, p.roleId);
      return { ...p, isLocked: score >= 80 };
    });
    useAssignmentStore.setState((state) => ({
      suggestions: {
        ...state.suggestions,
        [id]: {
          ...state.suggestions[id],
          finalPlan: newPlan,
        },
      },
    }));
  }

  function handleShuffleUnlocked() {
    if (!id) return;
    const unlockedIndices: number[] = [];
    const unlockedRoleIds: string[] = [];

    finalPlan.forEach((p, idx) => {
      if (!p.isLocked) {
        unlockedIndices.push(idx);
        unlockedRoleIds.push(p.roleId);
      }
    });

    for (let i = unlockedRoleIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unlockedRoleIds[i], unlockedRoleIds[j]] = [unlockedRoleIds[j], unlockedRoleIds[i]];
    }

    const newPlan = [...finalPlan];
    unlockedIndices.forEach((planIdx, i) => {
      newPlan[planIdx] = { ...newPlan[planIdx], roleId: unlockedRoleIds[i] };
    });

    useAssignmentStore.setState((state) => ({
      suggestions: {
        ...state.suggestions,
        [id]: {
          ...state.suggestions[id],
          finalPlan: newPlan,
          manualAdjusted: true,
        },
      },
    }));
  }

  const stats = useMemo(() => {
    const scores = finalPlan.map((p) => getCellScore(p.playerId, p.roleId));
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return {
      avgScore,
      warningCount: totalRemainingWarnings,
      lockedCount: finalPlan.filter((p) => p.isLocked).length,
      totalCount: finalPlan.length,
    };
  }, [finalPlan, getCellScore, totalRemainingWarnings]);

  if (loading) {
    return <AssignmentSkeleton />;
  }

  if (!schedule || !script || !suggestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-dark p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-crimson-400 mx-auto mb-4" />
          <div className="title-gold text-xl mb-2">数据加载失败</div>
          <p className="text-slate-400">无法找到车次或分角数据</p>
          <Link to="/" className="btn-ghost inline-block mt-6">返回首页</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* ========== 面包屑 ========== */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link to="/" className="flex items-center gap-1 hover:text-amber-400 transition-colors">
            <Home className="w-4 h-4" />
            <span>首页</span>
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/schedules" className="flex items-center gap-1 hover:text-amber-400 transition-colors">
            <Calendar className="w-4 h-4" />
            <span>车次排班</span>
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-500">{id}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-amber-400 font-medium">智能分角</span>
        </nav>

        {/* ========== 顶部信息栏 ========== */}
        <div className="card-dark p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <img
                src={script.cover}
                alt={script.name}
                className="w-24 h-32 rounded-lg object-cover border border-ink-500/50 shadow-lg"
              />
              <div className="space-y-3">
                <div>
                  <h1 className="title-gold text-2xl mb-1">{script.name}</h1>
                  <div className="flex flex-wrap gap-2">
                    {script.genre.map((g) => (
                      <Badge key={g} variant="royal">{g}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-4 h-4 text-amber-500/70" />
                    <span>{schedule.date} {schedule.startTime}-{schedule.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <UserCheck className="w-4 h-4 text-amber-500/70" />
                    <span>DM：{dm?.name || '未安排'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Users className="w-4 h-4 text-amber-500/70" />
                    <span>{schedule.players.length}位玩家</span>
                  </div>
                  <div>
                    <Badge variant={statusBadgeMap[schedule.status]?.variant || 'ink'}>
                      {statusBadgeMap[schedule.status]?.label || schedule.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRegenerate}
                className="btn-ghost flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                重新生成建议
              </button>
              <button
                onClick={handleLockHighScores}
                className="btn-ghost flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                锁定高分分配
              </button>
              <button
                onClick={() => {
                  if (id) finalizeAssignment(id);
                  navigate(`/assignments/${id}/review`);
                }}
                className="btn-gold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                确认分角完成
              </button>
            </div>
          </div>
        </div>

        {/* ========== Part 1: 冲突警告面板 ========== */}
        {totalRemainingWarnings > 0 && (
          <div className={cn(
            'card-dark mb-6 overflow-hidden transition-all duration-300',
            groupedWarnings.high.length > 0 && 'border-crimson-500/40'
          )}>
            <button
              onClick={() => setWarningsExpanded((v) => !v)}
              className="w-full flex items-center justify-between p-5 hover:bg-ink-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className={cn(
                  'w-6 h-6',
                  groupedWarnings.high.length > 0 ? 'text-crimson-400 animate-pulse' : 'text-sunset-400'
                )} />
                <div className="text-left">
                  <div className={cn(
                    'text-lg font-semibold',
                    groupedWarnings.high.length > 0 ? 'text-crimson-400' : groupedWarnings.medium.length > 0 ? 'text-sunset-400' : 'text-amber-400'
                  )}>
                    需人工判断 - {totalRemainingWarnings}项
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    高警告 {groupedWarnings.high.length}项 · 中警告 {groupedWarnings.medium.length}项 · 低警告 {groupedWarnings.low.length}项
                  </div>
                </div>
              </div>
              <ChevronRight className={cn(
                'w-5 h-5 text-slate-400 transition-transform',
                warningsExpanded && 'rotate-90'
              )} />
            </button>

            {warningsExpanded && (
              <div className="px-5 pb-5 space-y-4 border-t border-ink-600/50 pt-4">
                {(['high', 'medium', 'low'] as const).map((sev) =>
                  groupedWarnings[sev].length > 0 && (
                    <div key={sev} className="space-y-3">
                      {groupedWarnings[sev].map((warning, idx) => {
                        const cfg = severityConfig[sev];
                        const involvedPlayers = warning.playerIds
                          .map((pid) => getPlayerById(pid))
                          .filter(Boolean) as PlayerProfile[];
                        const involvedRoles = warning.roleIds
                          .map((rid) => roles.find((r) => r.id === rid))
                          .filter(Boolean) as Role[];

                        return (
                          <div
                            key={`${sev}-${idx}`}
                            className={cn(
                              'p-4 rounded-xl border',
                              cfg.border,
                              cfg.bg,
                              cfg.glow,
                              cfg.pulse
                            )}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <span className="text-xl">{cfg.icon}</span>
                              <div className="flex-1">
                                <div className={cn('font-medium mb-1', cfg.text)}>
                                  {warning.message}
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                                  <span>玩家：</span>
                                  {involvedPlayers.map((p, pi) => (
                                    <span key={p.id} className="inline-flex items-center gap-1">
                                      <RoleAvatar name={p.name} avatar={p.avatar} gender={p.gender} size="sm" />
                                      <span className="text-slate-300">{p.name}</span>
                                      {pi < involvedPlayers.length - 1 && <span className="mx-1">、</span>}
                                    </span>
                                  ))}
                                  <span className="mx-2">|</span>
                                  <span>角色：</span>
                                  {involvedRoles.map((r, ri) => (
                                    <span key={r.id} className="inline-flex items-center gap-1">
                                      <RoleAvatar name={r.name} avatar={r.avatar} gender={r.gender} size="sm" />
                                      <span className="text-slate-300 font-serif">{r.name}</span>
                                      {ri < involvedRoles.length - 1 && <span className="mx-1">、</span>}
                                    </span>
                                  ))}
                                </div>
                                {warning.suggestion && (
                                  <div className="mt-2 text-xs text-slate-500 flex items-start gap-1.5">
                                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                    <span>{warning.suggestion}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleSuggestAdjustment(warning)}
                                className="btn-ghost text-sm px-3 py-1.5 flex items-center gap-1.5"
                                disabled={warning.playerIds.length < 2}
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                建议调整
                              </button>
                              <button
                                onClick={() => handleConfirmWarning(warning)}
                                className={cn(
                                  'text-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all',
                                  sev === 'high'
                                    ? 'bg-crimson-500/20 text-crimson-300 border border-crimson-500/40 hover:bg-crimson-500/30'
                                    : sev === 'medium'
                                    ? 'bg-sunset-500/20 text-sunset-300 border border-sunset-500/40 hover:bg-sunset-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                                )}
                              >
                                <Check className="w-3.5 h-3.5" />
                                已确认，保持
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* ========== Part 2: 匹配矩阵热力图 ========== */}
        <div className="card-dark p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="title-gold text-xl mb-1">匹配矩阵热力图</h2>
              <p className="text-sm text-slate-400">
                点击单元格可手动分配 · 琥珀色粗边框为系统推荐 · 🔒表示已锁定
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded heat-high" />
                <span>高分 (≥75)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded heat-mid" />
                <span>中等 (50-74)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded heat-low" />
                <span>低分 (＜50)</span>
              </div>
            </div>
          </div>

          <div className="relative overflow-x-auto pb-4">
            <table className="w-full border-separate" style={{ borderSpacing: '4px' }}>
              <thead>
                <tr>
                  <th className="w-48" />
                  {roles.map((role) => (
                    <th key={role.id} className="align-bottom pb-2">
                      <div className="flex flex-col items-center gap-2 min-w-[100px]">
                        <RoleAvatar
                          name={role.name}
                          avatar={role.avatar}
                          gender={role.gender}
                          size="md"
                        />
                        <div className="text-center">
                          <div className="font-serif text-sm text-slate-200">{role.name}</div>
                          <div className="flex flex-col items-center gap-0.5 mt-1">
                            <Badge variant="ink" className="text-[10px]">
                              {getGenderLabel(role.gender)}
                            </Badge>
                            <Badge variant="amber" className="text-[10px] mt-0.5">
                              {getDifficultyLabel(role.difficulty)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {playersData.map(({ schedulePlayer, profile }) => {
                  if (!profile) return null;
                  return (
                    <tr key={profile.id}>
                      <td className="pr-2">
                        <div className="flex items-center gap-3 py-2">
                          <div className="relative">
                            <RoleAvatar
                              name={profile.name}
                              avatar={profile.avatar}
                              gender={profile.gender}
                              size="md"
                            />
                            {schedulePlayer.relationType === 'lover' && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-crimson-500 rounded-full flex items-center justify-center border-2 border-ink-800">
                                <Heart className="w-3 h-3 text-white fill-current" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                              {profile.name}
                              {schedulePlayer.relationType === 'lover' && (
                                <Badge variant="crimson" className="text-[10px] py-0 px-1.5">情侣</Badge>
                              )}
                              {schedulePlayer.relationType === 'friend' && (
                                <Badge variant="mint" className="text-[10px] py-0 px-1.5">朋友</Badge>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              {schedulePlayer.surveyResponse?.socialStyle && (
                                <span>{socialStyleMap[schedulePlayer.surveyResponse.socialStyle].icon}</span>
                              )}
                              <span>{profile.totalGames}场</span>
                              <span>·</span>
                              <Gauge className="w-3 h-3" />
                              <span>{Math.round(profile.averageSatisfaction * 20)}%</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      {roles.map((role) => {
                        const score = getCellScore(profile.id, role.id);
                        const cellData = getCellData(profile.id, role.id);
                        const isFinal = isFinalPair(profile.id, role.id);
                        const isRecommended = isRecommendedPair(profile.id, role.id);
                        const isLocked = isPlayerLocked(profile.id);
                        const roleOwner = isRoleAssigned(role.id);
                        const hasConflict = hasCellConflict(profile.id, role.id);
                        const heatClass = getHeatColorClass(score);

                        return (
                          <td key={role.id} className="text-center">
                            <div
                              onClick={() => handleCellClick(profile.id, role.id)}
                              onMouseEnter={(e) => {
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                setHoveredCell({
                                  playerId: profile.id,
                                  roleId: role.id,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top,
                                });
                              }}
                              onMouseLeave={() => setHoveredCell(null)}
                              className={cn(
                                'heat-cell rounded-lg p-3 min-h-[80px] flex flex-col items-center justify-center relative group',
                                heatClass,
                                hasConflict && 'heat-conflict',
                                isFinal && 'ring-2 ring-amber-500 ring-offset-2 ring-offset-ink-800',
                                isRecommended && !isFinal && 'ring-2 ring-amber-400/60 ring-offset-1 ring-offset-ink-800/50',
                                isLocked && 'cursor-not-allowed opacity-70',
                                !isLocked && roleOwner && roleOwner !== profile.id && 'hover:opacity-80'
                              )}
                              style={isLocked ? { cursor: 'not-allowed' } : undefined}
                            >
                              <span className={cn(
                                'text-2xl font-bold',
                                score >= 75 ? 'text-mint-300' : score >= 50 ? 'text-amber-300' : 'text-crimson-300'
                              )}>
                                {score}
                              </span>
                              {isRecommended && !isFinal && (
                                <Check className="w-4 h-4 text-amber-400 mt-1" />
                              )}
                              {isFinal && isLocked && (
                                <LockIcon className="absolute top-1 right-1 w-3.5 h-3.5 text-amber-400" />
                              )}
                              {hasConflict && (
                                <div className="absolute top-1 left-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-crimson-400" />
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tooltip */}
          {hoveredCell && (() => {
            const cellData = getCellData(hoveredCell.playerId, hoveredCell.roleId);
            const player = getPlayerById(hoveredCell.playerId);
            const role = roles.find((r) => r.id === hoveredCell.roleId);
            if (!cellData) return null;

            return (
              <div
                className="fixed z-[100] pointer-events-none"
                style={{
                  left: Math.min(hoveredCell.x, window.innerWidth - 320),
                  top: Math.max(10, hoveredCell.y - 10),
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <div className="card-dark p-4 w-80 shadow-2xl border-amber-500/30">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-ink-600/50">
                    <RoleAvatar name={player?.name || '?'} avatar={player?.avatar} gender={player?.gender} size="sm" />
                    <ArrowRightLeft className="w-4 h-4 text-amber-500/60" />
                    <RoleAvatar name={role?.name || '?'} avatar={role?.avatar} gender={role?.gender} size="sm" />
                  </div>
                  {cellData.reasons.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-mint-400 font-medium mb-1.5 flex items-center gap-1">
                        <Check className="w-3 h-3" /> 匹配理由
                      </div>
                      <ul className="space-y-1">
                        {cellData.reasons.slice(0, 4).map((r, i) => (
                          <li key={i} className="text-xs text-slate-300 pl-3 relative">
                            <span className="absolute left-0 text-mint-400">·</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {cellData.warnings.length > 0 && (
                    <div>
                      <div className="text-xs text-crimson-400 font-medium mb-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> 风险提示
                      </div>
                      <ul className="space-y-1">
                        {cellData.warnings.slice(0, 3).map((w, i) => (
                          <li key={i} className="text-xs text-slate-300 pl-3 relative">
                            <span className="absolute left-0 text-crimson-400">!</span>
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 分配结果行 */}
          <div className="mt-6 pt-6 border-t border-ink-600/50">
            <div className="text-sm text-slate-400 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-500/70" />
              当前分配方案
            </div>
            <div className="flex flex-wrap gap-4">
              {finalPlan.map((pair) => {
                const player = getPlayerById(pair.playerId);
                const role = roles.find((r) => r.id === pair.roleId);
                const score = getCellScore(pair.playerId, pair.roleId);

                return (
                  <div
                    key={pair.playerId}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-xl border',
                      pair.isLocked
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-ink-700/40 border-ink-500/40'
                    )}
                  >
                    <RoleAvatar name={player?.name || '?'} avatar={player?.avatar} gender={player?.gender} size="sm" />
                    <div>
                      <div className="text-sm text-slate-200">{player?.name}</div>
                    </div>
                    <ArrowRightLeft className="w-4 h-4 text-amber-500/60" />
                    <RoleAvatar name={role?.name || '?'} avatar={role?.avatar} gender={role?.gender} size="sm" />
                    <div>
                      <div className="text-sm font-serif text-slate-200">{role?.name}</div>
                    </div>
                    <Badge variant={score >= 75 ? 'mint' : score >= 50 ? 'amber' : 'crimson'}>
                      {score}
                    </Badge>
                    {pair.isLocked && <LockIcon className="w-4 h-4 text-amber-400" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========== Part 3: 人工调整工具 ========== */}
        <div className="card-dark p-6">
          <h2 className="title-gold text-xl mb-2">人工调整工具</h2>
          <p className="text-sm text-slate-400 mb-6">
            拖拽下方卡片交换角色分配 · 已锁定的分配不会被改动
          </p>

          {/* 快捷操作按钮 */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={handleUnlockAll}
              className="btn-ghost flex items-center gap-2 text-sm px-4 py-2"
            >
              <Unlock className="w-4 h-4" />
              解锁全部
            </button>
            <button
              onClick={handleLockHighScores}
              className="btn-ghost flex items-center gap-2 text-sm px-4 py-2"
            >
              <Lock className="w-4 h-4" />
              锁定高分分配 (≥80分)
            </button>
            <button
              className="btn-ghost flex items-center gap-2 text-sm px-4 py-2"
            >
              <Heart className="w-4 h-4 text-crimson-400" />
              优先情侣CP角色
            </button>
            <button
              className="btn-ghost flex items-center gap-2 text-sm px-4 py-2"
            >
              <Users className="w-4 h-4 text-mint-400" />
              避免熟人对立
            </button>
            <button
              onClick={handleShuffleUnlocked}
              className="btn-ghost flex items-center gap-2 text-sm px-4 py-2"
            >
              <Shuffle className="w-4 h-4" />
              随机打乱 (未锁定部分)
            </button>
          </div>

          {/* 拖拽交换区域 */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={finalPlan.map((p) => p.playerId)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex gap-4 overflow-x-auto pb-4 px-1">
                {finalPlan.map((pair) => {
                  const player = getPlayerById(pair.playerId);
                  const role = roles.find((r) => r.id === pair.roleId);
                  const sp = schedule.players.find((p) => p.playerId === pair.playerId);
                  const score = getCellScore(pair.playerId, pair.roleId);

                  return (
                    <SortableAssignmentCard
                      key={pair.playerId}
                      pair={pair}
                      player={player}
                      role={role}
                      schedulePlayer={sp}
                      score={score}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* ========== 底部统计 ========== */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-amber-500/70" />
              <span className="text-slate-400">方案匹配率：</span>
              <span className={cn(
                'font-semibold',
                stats.avgScore >= 75 ? 'text-mint-400' : stats.avgScore >= 50 ? 'text-amber-400' : 'text-crimson-400'
              )}>
                {stats.avgScore}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500/70" />
              <span className="text-slate-400">警告数：</span>
              <span className={cn(
                'font-semibold',
                stats.warningCount === 0 ? 'text-mint-400' : 'text-crimson-400'
              )}>
                {stats.warningCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500/70" />
              <span className="text-slate-400">已锁定：</span>
              <span className="font-semibold text-amber-400">
                {stats.lockedCount}/{stats.totalCount}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (id) finalizeAssignment(id);
              navigate(`/assignments/${id}/review`);
            }}
            className="btn-gold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            确认分角，进入复盘
          </button>
        </div>
      </div>

      {/* 冲突确认弹窗 */}
      {showConflictModal && pendingCell && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="card-dark w-full max-w-md p-6 m-4">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-crimson-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-crimson-400" />
              </div>
              <div>
                <h3 className="title-gold text-lg mb-2">存在潜在冲突</h3>
                <p className="text-sm text-slate-400">
                  该分配存在以下风险，是否继续？
                </p>
              </div>
              <button
                onClick={() => {
                  setShowConflictModal(false);
                  setPendingCell(null);
                }}
                className="ml-auto p-1 text-slate-400 hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-crimson-500/10 border border-crimson-500/30 rounded-xl p-4 mb-6">
              <ul className="space-y-2">
                {(() => {
                  const cellData = getCellData(pendingCell.playerId, pendingCell.roleId);
                  return cellData?.warnings.map((w, i) => (
                    <li key={i} className="text-sm text-crimson-300 flex items-start gap-2">
                      <span>!</span>
                      <span>{w}</span>
                    </li>
                  ));
                })()}
              </ul>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConflictModal(false);
                  setPendingCell(null);
                }}
                className="btn-ghost"
              >
                取消分配
              </button>
              <button
                onClick={() => {
                  applyAssignment(pendingCell.playerId, pendingCell.roleId);
                  setShowConflictModal(false);
                  setPendingCell(null);
                }}
                className="btn-danger"
              >
                确认分配
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AssignmentSkeleton() {
  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="h-6 w-96 bg-ink-700/50 rounded animate-pulse mb-6" />

        <div className="card-dark p-6 mb-6">
          <div className="flex gap-5">
            <div className="w-24 h-32 bg-ink-700/50 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-7 w-64 bg-ink-700/50 rounded animate-pulse" />
              <div className="h-5 w-48 bg-ink-700/50 rounded animate-pulse" />
              <div className="flex gap-3 pt-2">
                <div className="h-5 w-32 bg-ink-700/50 rounded animate-pulse" />
                <div className="h-5 w-24 bg-ink-700/50 rounded animate-pulse" />
                <div className="h-5 w-20 bg-ink-700/50 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="card-dark p-6 mb-6">
          <div className="h-8 w-48 bg-ink-700/50 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-ink-700/50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>

        <div className="card-dark p-6 mb-6">
          <div className="h-8 w-48 bg-ink-700/50 rounded animate-pulse mb-6" />
          <div className="overflow-hidden">
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
              {Array.from({ length: 7 * 7 }).map((_, i) => (
                <div key={i} className="h-20 bg-ink-700/50 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        <div className="card-dark p-6">
          <div className="h-8 w-48 bg-ink-700/50 rounded animate-pulse mb-6" />
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-60 h-40 bg-ink-700/50 rounded-xl animate-pulse shrink-0" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
