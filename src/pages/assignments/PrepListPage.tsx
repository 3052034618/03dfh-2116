import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Home,
  Calendar,
  ChevronRight,
  Printer,
  ArrowLeft,
  AlertTriangle,
  Users,
  Heart,
  UserCheck,
  Mars,
  Venus,
  UserCircle2,
  Info,
  ClipboardList,
  Sparkles,
  Swords,
  Briefcase,
  UserPlus,
  Smile,
  Meh,
  Frown,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useScriptStore } from '@/stores/scriptStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useDMStore } from '@/stores/dmStore';
import { useAssignmentStore } from '@/stores/assignmentStore';
import { getHeatColorClass, getGenderLabel, getDifficultyLabel } from '@/utils/assignmentEngine';
import RoleAvatar from '@/components/ui/RoleAvatar';
import Badge from '@/components/ui/Badge';
import type {
  Schedule,
  Script,
  DM,
  PlayerProfile,
  Role,
  AssignmentPair,
  AssignmentWarning,
  SchedulePlayer,
  RoleRelation,
  PlayerSurvey,
} from '@/types';

const severityConfig = {
  high: {
    border: 'border-crimson-500/60',
    bg: 'bg-crimson-500/10',
    text: 'text-crimson-300',
    badge: 'crimson' as const,
    glow: 'shadow-[0_0_20px_rgba(201,58,78,0.3)]',
    leftBar: 'bg-crimson-500',
    icon: '🔴',
  },
  medium: {
    border: 'border-sunset-500/60',
    bg: 'bg-sunset-500/10',
    text: 'text-sunset-300',
    badge: 'sunset' as const,
    glow: '',
    leftBar: 'bg-sunset-500',
    icon: '🟠',
  },
  low: {
    border: 'border-amber-500/50',
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
    badge: 'amber' as const,
    glow: '',
    leftBar: 'bg-amber-500',
    icon: '🟡',
  },
};

const socialStyleMap = {
  social: { icon: Smile, label: '社牛', color: 'text-mint-400', emoji: '🐮' },
  normal: { icon: Meh, label: '正常', color: 'text-amber-400', emoji: '😐' },
  introvert: { icon: Frown, label: '社恐', color: 'text-royal-400', emoji: '🐢' },
};

const relationTypeMap = {
  lover: { icon: Heart, label: '情侣', color: 'text-crimson-400', emoji: '❤️' },
  friend: { icon: Users, label: '朋友', color: 'text-mint-400', emoji: '👬' },
  family: { icon: Users, label: '家人', color: 'text-royal-400', emoji: '👪' },
  colleague: { icon: Briefcase, label: '同事', color: 'text-amber-400', emoji: '💼' },
  stranger: { icon: UserPlus, label: '拼车', color: 'text-slate-400', emoji: '🧑‍🤝‍🧑' },
};

const roleRelationMap = {
  lover: { icon: Heart, label: '情侣', color: 'text-crimson-400', emoji: '❤️', badge: 'crimson' as const },
  enemy: { icon: Swords, label: '对立', color: 'text-crimson-400', emoji: '⚔️', badge: 'crimson' as const },
  family: { icon: Users, label: '家族', color: 'text-royal-400', emoji: '👪', badge: 'royal' as const },
  partner: { icon: UserCheck, label: '伙伴', color: 'text-mint-400', emoji: '🤝', badge: 'mint' as const },
  secret: { icon: Info, label: '秘密关系', color: 'text-amber-400', emoji: '🔐', badge: 'amber' as const },
};

const warningTypeMap = {
  conflict: { label: '冲突风险', variant: 'crimson' as const },
  risk: { label: '体验风险', variant: 'sunset' as const },
  manual_check: { label: '人工确认', variant: 'amber' as const },
};

export default function PrepListPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const getScheduleById = useScheduleStore((s) => s.getScheduleById);
  const getScriptById = useScriptStore((s) => s.getScriptById);
  const getRoleById = useScriptStore((s) => s.getRoleById);
  const getPlayerById = usePlayerStore((s) => s.getPlayerById);
  const getDMById = useDMStore((s) => s.getDMById);
  const getSuggestion = useAssignmentStore((s) => s.getSuggestion);

  const schedule: Schedule | undefined = id ? getScheduleById(id) : undefined;
  const script: Script | undefined = schedule ? getScriptById(schedule.scriptId) : undefined;
  const dm: DM | undefined = schedule ? getDMById(schedule.dmId) : undefined;
  const suggestion = id ? getSuggestion(id) : undefined;
  const finalPlan = suggestion?.finalPlan || [];
  const warnings = suggestion?.warnings || [];
  const matchMatrix = suggestion?.matchMatrix || [];

  const hasFinalPlan = finalPlan.length > 0;

  const sortedWarnings = useMemo(() => {
    const order = { high: 0, medium: 1, low: 2 };
    return [...warnings].sort((a, b) => order[a.severity] - order[b.severity]);
  }, [warnings]);

  const playersWithSurvey = useMemo(() => {
    if (!schedule) return [];
    return schedule.players
      .map((sp) => ({
        schedulePlayer: sp,
        profile: getPlayerById(sp.playerId),
        survey: sp.surveyResponse,
      }))
      .filter((item) => item.profile);
  }, [schedule, getPlayerById]);

  const sortedPlayersForSurvey = useMemo(() => {
    return [...playersWithSurvey].sort((a, b) => {
      const aHasTaboo = (a.survey?.tabooContent?.length || 0) > 0;
      const bHasTaboo = (b.survey?.tabooContent?.length || 0) > 0;
      if (aHasTaboo !== bHasTaboo) return aHasTaboo ? -1 : 1;
      return 0;
    });
  }, [playersWithSurvey]);

  const acquaintanceGroups = useMemo(() => {
    if (!schedule) return { lovers: [], friendGroups: [], familyGroups: [], colleagueGroups: [], strangers: [] };

    const lovers: { p1: PlayerProfile; p2: PlayerProfile }[] = [];
    const friendGroups: PlayerProfile[][] = [];
    const familyGroups: PlayerProfile[][] = [];
    const colleagueGroups: PlayerProfile[][] = [];
    const strangers: PlayerProfile[] = [];

    const visited = new Set<string>();
    const relationGroups: Record<string, PlayerProfile[]> = { friend: [], family: [], colleague: [] };

    schedule.players.forEach((sp) => {
      const profile = getPlayerById(sp.playerId);
      if (!profile) return;

      if (visited.has(sp.playerId)) return;

      if (sp.relationType === 'lover' && sp.acquaintanceWith.length > 0) {
        const partnerId = sp.acquaintanceWith[0];
        const partner = getPlayerById(partnerId);
        if (partner && !visited.has(partnerId)) {
          lovers.push({ p1: profile, p2: partner });
          visited.add(sp.playerId);
          visited.add(partnerId);
        }
      } else if (sp.relationType && ['friend', 'family', 'colleague'].includes(sp.relationType)) {
        const groupType = sp.relationType;
        if (!relationGroups[groupType].some((p) => p.id === profile.id)) {
          relationGroups[groupType].push(profile);
        }
        visited.add(sp.playerId);

        sp.acquaintanceWith.forEach((acqId) => {
          const acq = getPlayerById(acqId);
          if (acq && !relationGroups[groupType].some((p) => p.id === acq.id)) {
            relationGroups[groupType].push(acq);
          }
          visited.add(acqId);
        });
      } else if (!visited.has(sp.playerId) && (!sp.relationType || sp.relationType === 'stranger')) {
        strangers.push(profile);
      }
    });

    if (relationGroups.friend.length > 0) friendGroups.push(relationGroups.friend);
    if (relationGroups.family.length > 0) familyGroups.push(relationGroups.family);
    if (relationGroups.colleague.length > 0) colleagueGroups.push(relationGroups.colleague);

    return { lovers, friendGroups, familyGroups, colleagueGroups, strangers };
  }, [schedule, getPlayerById]);

  function getCellScore(playerId: string, roleId: string): number {
    const row = matchMatrix.find((r) => r[0]?.playerId === playerId);
    const cell = row?.find((c) => c.roleId === roleId);
    return cell?.score || 0;
  }

  function renderGenderIcon(gender?: 'male' | 'female' | 'any') {
    if (gender === 'male') return <Mars className="w-4 h-4 text-blue-400" />;
    if (gender === 'female') return <Venus className="w-4 h-4 text-pink-400" />;
    return <UserCircle2 className="w-4 h-4 text-slate-400" />;
  }

  function handlePrint() {
    window.print();
  }

  if (!schedule || !script) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-dark p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-crimson-400 mx-auto mb-4" />
          <div className="title-gold text-xl mb-2">数据加载失败</div>
          <p className="text-slate-400">无法找到车次数据</p>
          <Link to="/schedules" className="btn-ghost inline-block mt-6">
            返回车次列表
          </Link>
        </div>
      </div>
    );
  }

  if (!hasFinalPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card-dark p-10 text-center max-w-lg">
          <ClipboardList className="w-16 h-16 text-amber-500/60 mx-auto mb-6" />
          <div className="title-gold text-2xl mb-3">尚未生成分角方案</div>
          <p className="text-slate-400 mb-8 leading-relaxed">
            请先生成分角建议并确认分配方案，<br />
            系统会自动整理开本准备清单。
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate(`/schedules/${id}/assign`)}
              className="btn-gold flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              前往分角页面
            </button>
            <button
              onClick={() => navigate(`/schedules/${id}`)}
              className="btn-ghost flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回车次详情
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
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
          <Link to={`/schedules/${id}`} className="hover:text-amber-400 transition-colors">
            车次详情
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-amber-400 font-medium">开本准备清单</span>
        </nav>

        <div className="card-dark grain-overlay p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <img
                src={script.cover}
                alt={script.name}
                className="w-28 h-36 rounded-lg object-cover border border-ink-500/50 shadow-lg"
              />
              <div className="space-y-3">
                <div>
                  <h1 className="font-serif text-3xl md:text-4xl text-gradient-gold font-bold mb-2">
                    {script.name}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    {script.genre.map((g) => (
                      <Badge key={g} variant="royal">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-4 h-4 text-amber-500/70" />
                    <span>
                      {schedule.date} {schedule.startTime}-{schedule.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <UserCheck className="w-4 h-4 text-amber-500/70" />
                    <span>DM：{dm?.name || '未安排'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Users className="w-4 h-4 text-amber-500/70" />
                    <span>{schedule.players.length}位玩家</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={handlePrint} className="btn-ghost flex items-center gap-2">
                <Printer className="w-4 h-4" />
                打印 / 导出
              </button>
              <button
                onClick={() => navigate(`/schedules/${id}/assign`)}
                className="btn-ghost flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                返回分角
              </button>
              <button
                onClick={() => navigate(`/schedules/${id}`)}
                className="btn-ghost flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回车次
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="card-dark grain-overlay p-6">
            <h2 className="title-gold text-xl mb-2">📋 角色分配总表</h2>
            <p className="text-sm text-slate-400 mb-5">最终确认的玩家-角色分配方案</p>

            <div className="overflow-x-auto">
              <table className="w-full border-separate" style={{ borderSpacing: '0' }}>
                <thead>
                  <tr className="bg-ink-700/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-300 rounded-l-lg">
                      玩家
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                      角色
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                      性别
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">
                      匹配分
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">
                      历史场次
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-300 rounded-r-lg">
                      备注
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {finalPlan.map((pair: AssignmentPair, idx: number) => {
                    const profile = getPlayerById(pair.playerId);
                    const role = getRoleById(schedule.scriptId, pair.roleId);
                    const schedulePlayer = schedule.players.find(
                      (p) => p.playerId === pair.playerId
                    );
                    const score = getCellScore(pair.playerId, pair.roleId);
                    const heatClass = getHeatColorClass(score);
                    const scoreColor =
                      score >= 75
                        ? 'text-mint-300'
                        : score >= 50
                        ? 'text-amber-300'
                        : 'text-crimson-300';

                    const remarks: { text: string; variant: any }[] = [];
                    if (schedulePlayer?.isNew) {
                      remarks.push({ text: '新客', variant: 'amber' });
                    }
                    if ((profile?.totalGames || 0) < 5) {
                      remarks.push({ text: '新手', variant: 'ink' });
                    }
                    if (schedulePlayer?.surveyResponse?.socialStyle === 'introvert') {
                      remarks.push({ text: '社恐', variant: 'royal' });
                    }
                    if (schedulePlayer?.relationType === 'lover') {
                      remarks.push({ text: '有CP', variant: 'crimson' });
                    }

                    return (
                      <tr
                        key={pair.playerId}
                        className={cn(
                          idx % 2 === 0 ? 'bg-ink-800/30' : 'bg-transparent',
                          'hover:bg-ink-700/30 transition-colors'
                        )}
                      >
                        <td className="px-4 py-3 border-t border-ink-600/40">
                          <div className="flex items-center gap-3">
                            <RoleAvatar
                              name={profile?.name || '?'}
                              avatar={profile?.avatar}
                              gender={profile?.gender}
                              size="sm"
                            />
                            <div>
                              <div className="font-medium text-slate-200">
                                {profile?.name || '未知'}
                              </div>
                              {schedulePlayer?.surveyResponse?.socialStyle && (
                                <div className="text-xs text-slate-500">
                                  {socialStyleMap[schedulePlayer.surveyResponse.socialStyle].emoji}{' '}
                                  {socialStyleMap[schedulePlayer.surveyResponse.socialStyle].label}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-t border-ink-600/40">
                          <div className="flex items-center gap-3">
                            <RoleAvatar
                              name={role?.name || '?'}
                              avatar={role?.avatar}
                              gender={role?.gender}
                              size="sm"
                            />
                            <div>
                              <div className="font-serif font-medium text-slate-200">
                                {role?.name || '未知'}
                              </div>
                              <div className="text-xs text-slate-500">
                                {getDifficultyLabel(role?.difficulty || 1)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-t border-ink-600/40">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            {renderGenderIcon(role?.gender)}
                            <span className="text-sm">{getGenderLabel(role?.gender || 'any')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-t border-ink-600/40 text-center">
                          <div
                            className={cn(
                              'inline-flex items-center justify-center w-14 h-8 rounded-lg font-bold text-sm',
                              heatClass,
                              scoreColor
                            )}
                          >
                            {score}分
                          </div>
                        </td>
                        <td className="px-4 py-3 border-t border-ink-600/40 text-center">
                          <span className="font-mono text-slate-300">
                            {profile?.totalGames || 0}场
                          </span>
                        </td>
                        <td className="px-4 py-3 border-t border-ink-600/40">
                          <div className="flex flex-wrap gap-1.5">
                            {remarks.map((r, i) => (
                              <Badge key={i} variant={r.variant}>
                                {r.text}
                              </Badge>
                            ))}
                            {remarks.length === 0 && (
                              <span className="text-slate-600 text-xs">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {sortedWarnings.length > 0 && (
            <section className="card-dark grain-overlay p-6">
              <h2 className="title-gold text-xl mb-2">⚠️ 重点风险提醒</h2>
              <p className="text-sm text-slate-400 mb-5">开场前必须注意以下风险点，提前做好准备</p>

              <div className="space-y-4">
                {sortedWarnings.map((warning: AssignmentWarning, idx: number) => {
                  const cfg = severityConfig[warning.severity];
                  const involvedPlayers = warning.playerIds
                    .map((pid) => getPlayerById(pid))
                    .filter(Boolean) as PlayerProfile[];
                  const involvedRoles = warning.roleIds
                    .map((rid) => getRoleById(schedule.scriptId, rid))
                    .filter(Boolean) as Role[];

                  return (
                    <div
                      key={idx}
                      className={cn(
                        'p-4 rounded-xl border relative overflow-hidden',
                        cfg.border,
                        cfg.bg,
                        cfg.glow
                      )}
                    >
                      <div
                        className={cn('absolute left-0 top-0 bottom-0 w-1', cfg.leftBar)}
                      />
                      <div className="pl-3">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xl">{cfg.icon}</span>
                            <Badge variant={warningTypeMap[warning.type].variant}>
                              {warningTypeMap[warning.type].label}
                            </Badge>
                            <Badge variant={cfg.badge}>
                              {warning.severity === 'high'
                                ? '高风险'
                                : warning.severity === 'medium'
                                ? '中风险'
                                : '低风险'}
                            </Badge>
                          </div>
                        </div>

                        <div className={cn('font-medium mb-3', cfg.text)}>
                          {warning.message}
                        </div>

                        {(involvedPlayers.length > 0 || involvedRoles.length > 0) && (
                          <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-3">
                            {involvedPlayers.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>涉及玩家：</span>
                                {involvedPlayers.map((p, pi) => (
                                  <span key={p.id} className="inline-flex items-center gap-1">
                                    <span className="text-slate-300 font-medium">{p.name}</span>
                                    {pi < involvedPlayers.length - 1 && (
                                      <span className="text-slate-600">、</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            )}
                            {involvedRoles.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>对应角色：</span>
                                {involvedRoles.map((r, ri) => (
                                  <span key={r.id} className="inline-flex items-center gap-1">
                                    <span className="text-slate-300 font-serif font-medium">
                                      {r.name}
                                    </span>
                                    {ri < involvedRoles.length - 1 && (
                                      <span className="text-slate-600">、</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {warning.suggestion && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-ink-900/50 border border-ink-600/40">
                            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs text-amber-400 font-medium mb-0.5">
                                DM建议处理方式
                              </div>
                              <div className="text-sm text-slate-300">{warning.suggestion}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="card-dark grain-overlay p-6">
            <h2 className="title-gold text-xl mb-2">📊 玩家问卷重点整理</h2>
            <p className="text-sm text-slate-400 mb-5">
              按玩家整理的问卷要点，<span className="text-crimson-400">有忌讳内容的玩家已优先排列</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sortedPlayersForSurvey.map(
                ({ profile, schedulePlayer, survey }: any, idx: number) => {
                  const hasExtraNotes = survey?.extraNotes && survey.extraNotes.trim().length > 0;
                  const hasTaboo = (survey?.tabooContent?.length || 0) > 0;

                  return (
                    <div
                      key={profile.id}
                      className={cn(
                        'p-4 rounded-xl border transition-all',
                        hasExtraNotes
                          ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent'
                          : 'border-ink-600/40 bg-ink-800/40',
                        hasTaboo && 'border-crimson-500/30'
                      )}
                    >
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-ink-600/40">
                        <RoleAvatar
                          name={profile.name}
                          avatar={profile.avatar}
                          gender={profile.gender}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-slate-200">{profile.name}</span>
                            {schedulePlayer?.isNew && (
                              <Badge variant="amber">新客</Badge>
                            )}
                            {hasExtraNotes && (
                              <Badge variant="amber">有备注</Badge>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            历史 {profile.totalGames} 场 · 满意度{' '}
                            {Math.round((profile.averageSatisfaction || 0) * 20)}%
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {survey?.preferredGenres?.length > 0 && (
                          <div>
                            <div className="text-xs text-slate-500 mb-1.5 flex items-center gap-1.5">
                              <ThumbsUp className="w-3.5 h-3.5" />
                              想玩类型
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {survey.preferredGenres.map((g: string) => (
                                <Badge key={g} variant="amber">
                                  {g}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {survey?.tabooContent?.length > 0 && (
                          <div>
                            <div className="text-xs text-slate-500 mb-1.5 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-crimson-400" />
                              <span className="text-crimson-400 font-medium">忌讳内容（重点）</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {survey.tabooContent.map((t: string) => (
                                <Badge key={t} variant="crimson">
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-slate-500 mb-1">社交风格</div>
                            {survey?.socialStyle ? (
                              <div className="flex items-center gap-1.5">
                                {(() => {
                                  const s = socialStyleMap[survey.socialStyle];
                                  const Icon = s.icon;
                                  return (
                                    <>
                                      <Icon className={cn('w-4 h-4', s.color)} />
                                      <span className="text-sm text-slate-300">
                                        {s.emoji} {s.label}
                                      </span>
                                    </>
                                  );
                                })()}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-600">未填写</span>
                            )}
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 mb-1">带动气氛</div>
                            <span
                              className={cn(
                                'text-sm font-medium',
                                survey?.willingToLead
                                  ? 'text-mint-400'
                                  : 'text-slate-500'
                              )}
                            >
                              {survey?.willingToLead ? '✅ 愿意' : '— 一般'}
                            </span>
                          </div>
                        </div>

                        {hasExtraNotes && (
                          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            <div className="text-xs text-amber-400 font-medium mb-1 flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5" />
                              玩家备注
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              {survey.extraNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>

          <section className="card-dark grain-overlay p-6">
            <h2 className="title-gold text-xl mb-2">👥 熟人关系图谱</h2>
            <p className="text-sm text-slate-400 mb-5">
              玩家之间的现实关系，避免信息位给到场外抱团组
            </p>

            <div className="space-y-4">
              {acquaintanceGroups.lovers.length > 0 && (
                <div className="p-4 rounded-xl bg-crimson-500/10 border border-crimson-500/30">
                  <div className="text-sm text-crimson-400 font-medium mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    情侣关系
                  </div>
                  <div className="space-y-2">
                    {acquaintanceGroups.lovers.map((pair, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg bg-ink-800/50"
                      >
                        <RoleAvatar
                          name={pair.p1.name}
                          avatar={pair.p1.avatar}
                          gender={pair.p1.gender}
                          size="sm"
                        />
                        <span className="text-slate-200 font-medium">{pair.p1.name}</span>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-crimson-500/20 text-crimson-400 text-sm">
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          <span>情侣</span>
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <span className="text-slate-200 font-medium">{pair.p2.name}</span>
                        <RoleAvatar
                          name={pair.p2.name}
                          avatar={pair.p2.avatar}
                          gender={pair.p2.gender}
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {acquaintanceGroups.friendGroups.length > 0 && (
                <div className="p-4 rounded-xl bg-mint-500/10 border border-mint-500/30">
                  <div className="text-sm text-mint-400 font-medium mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    朋友关系
                  </div>
                  {acquaintanceGroups.friendGroups.map((group, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg bg-ink-800/50 flex-wrap"
                    >
                      {group.map((player, pi) => (
                        <div key={player.id} className="flex items-center gap-2">
                          <RoleAvatar
                            name={player.name}
                            avatar={player.avatar}
                            gender={player.gender}
                            size="sm"
                          />
                          <span className="text-slate-200 font-medium">{player.name}</span>
                          {pi < group.length - 1 && (
                            <span className="text-mint-400 text-lg">↔</span>
                          )}
                        </div>
                      ))}
                      <Badge variant="mint">好友圈 · {group.length}人</Badge>
                    </div>
                  ))}
                </div>
              )}

              {acquaintanceGroups.familyGroups.length > 0 && (
                <div className="p-4 rounded-xl bg-royal-700/20 border border-royal-600/40">
                  <div className="text-sm text-royal-300 font-medium mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    家人关系
                  </div>
                  {acquaintanceGroups.familyGroups.map((group, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg bg-ink-800/50 flex-wrap"
                    >
                      {group.map((player, pi) => (
                        <div key={player.id} className="flex items-center gap-2">
                          <RoleAvatar
                            name={player.name}
                            avatar={player.avatar}
                            gender={player.gender}
                            size="sm"
                          />
                          <span className="text-slate-200 font-medium">{player.name}</span>
                          {pi < group.length - 1 && (
                            <span className="text-royal-400 text-lg">↔</span>
                          )}
                        </div>
                      ))}
                      <Badge variant="royal">家人组 · {group.length}人</Badge>
                    </div>
                  ))}
                </div>
              )}

              {acquaintanceGroups.colleagueGroups.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="text-sm text-amber-400 font-medium mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    同事关系
                  </div>
                  {acquaintanceGroups.colleagueGroups.map((group, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg bg-ink-800/50 flex-wrap"
                    >
                      {group.map((player, pi) => (
                        <div key={player.id} className="flex items-center gap-2">
                          <RoleAvatar
                            name={player.name}
                            avatar={player.avatar}
                            gender={player.gender}
                            size="sm"
                          />
                          <span className="text-slate-200 font-medium">{player.name}</span>
                          {pi < group.length - 1 && (
                            <span className="text-amber-400 text-lg">↔</span>
                          )}
                        </div>
                      ))}
                      <Badge variant="amber">同事组 · {group.length}人</Badge>
                    </div>
                  ))}
                </div>
              )}

              {acquaintanceGroups.strangers.length > 0 && (
                <div className="p-4 rounded-xl bg-ink-800/40 border border-ink-600/40">
                  <div className="text-sm text-slate-400 font-medium mb-3 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    拼车玩家（互不相识）
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-ink-900/30 flex-wrap">
                    {acquaintanceGroups.strangers.map((player) => (
                      <div key={player.id} className="flex items-center gap-2">
                        <RoleAvatar
                          name={player.name}
                          avatar={player.avatar}
                          gender={player.gender}
                          size="sm"
                        />
                        <span className="text-slate-300">{player.name}</span>
                      </div>
                    ))}
                    <Badge variant="ink">
                      拼车 · {acquaintanceGroups.strangers.length}人
                    </Badge>
                  </div>
                </div>
              )}

              {acquaintanceGroups.lovers.length === 0 &&
                acquaintanceGroups.friendGroups.length === 0 &&
                acquaintanceGroups.familyGroups.length === 0 &&
                acquaintanceGroups.colleagueGroups.length === 0 &&
                acquaintanceGroups.strangers.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    暂无熟人关系信息，所有玩家均为陌生拼车
                  </div>
                )}
            </div>
          </section>

          {script.relations && script.relations.length > 0 && (
            <section className="card-dark grain-overlay p-6">
              <h2 className="title-gold text-xl mb-2">🎭 角色关系速览</h2>
              <p className="text-sm text-slate-400 mb-5">
                剧本中的角色关系，结合上方熟人关系交叉参考
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['lover', 'enemy', 'family', 'partner', 'secret'] as const).map((relType) => {
                  const relations = script.relations.filter((r) => r.type === relType);
                  if (relations.length === 0) return null;
                  const cfg = roleRelationMap[relType];

                  const getPlayerForRole = (roleId: string) => {
                    const pair = finalPlan.find((p) => p.roleId === roleId);
                    return pair ? getPlayerById(pair.playerId) : null;
                  };

                  return (
                    <div
                      key={relType}
                      className={cn(
                        'p-4 rounded-xl border',
                        relType === 'enemy' || relType === 'lover'
                          ? 'bg-crimson-500/5 border-crimson-500/20'
                          : 'bg-ink-800/40 border-ink-600/40'
                      )}
                    >
                      <div
                        className={cn(
                          'text-sm font-medium mb-3 flex items-center gap-2',
                          cfg.color
                        )}
                      >
                        <span className="text-lg">{cfg.emoji}</span>
                        <span>{cfg.label}关系</span>
                        <Badge variant={cfg.badge}>{relations.length}组</Badge>
                      </div>

                      <div className="space-y-2.5">
                        {relations.map((rel: RoleRelation, idx: number) => {
                          const roleA = getRoleById(script.id, rel.roleA);
                          const roleB = getRoleById(script.id, rel.roleB);
                          const playerA = getPlayerForRole(rel.roleA);
                          const playerB = getPlayerForRole(rel.roleB);

                          return (
                            <div
                              key={idx}
                              className="p-3 rounded-lg bg-ink-900/40 border border-ink-600/30"
                            >
                              <div className="flex items-center gap-3 justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                  <RoleAvatar
                                    name={roleA?.name || '?'}
                                    avatar={roleA?.avatar}
                                    gender={roleA?.gender}
                                    size="sm"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-serif text-sm text-slate-200 truncate">
                                      {roleA?.name}
                                    </div>
                                    {playerA && (
                                      <div className="text-xs text-slate-500 truncate">
                                        → {playerA.name}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div
                                  className={cn(
                                    'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
                                    relType === 'lover' &&
                                      'bg-crimson-500/20 text-crimson-400',
                                    relType === 'enemy' &&
                                      'bg-crimson-500/15 text-crimson-400',
                                    relType === 'family' &&
                                      'bg-royal-700/30 text-royal-300',
                                    relType === 'partner' &&
                                      'bg-mint-600/20 text-mint-300',
                                    relType === 'secret' &&
                                      'bg-amber-500/15 text-amber-400'
                                  )}
                                >
                                  <span>{cfg.emoji}</span>
                                  {rel.intensity >= 3 && '深度'}
                                  {rel.intensity === 2 && '中度'}
                                  {rel.intensity === 1 && '轻度'}
                                </div>

                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="min-w-0 text-right">
                                    <div className="font-serif text-sm text-slate-200 truncate">
                                      {roleB?.name}
                                    </div>
                                    {playerB && (
                                      <div className="text-xs text-slate-500 truncate">
                                        → {playerB.name}
                                      </div>
                                    )}
                                  </div>
                                  <RoleAvatar
                                    name={roleB?.name || '?'}
                                    avatar={roleB?.avatar}
                                    gender={roleB?.gender}
                                    size="sm"
                                  />
                                </div>
                              </div>

                              {playerA &&
                                playerB &&
                                schedule.players.some(
                                  (sp) =>
                                    sp.playerId === playerA.id &&
                                    sp.acquaintanceWith.includes(playerB.id)
                                ) && (
                                  <div className="mt-2 pt-2 border-t border-ink-600/30 flex items-center gap-1.5 text-xs">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="text-amber-400 font-medium">
                                      ⚠️ 注意：这两位玩家现实中是熟人关系
                                    </span>
                                  </div>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <button onClick={handlePrint} className="btn-gold flex items-center gap-2">
              <Printer className="w-4 h-4" />
              打印准备清单
            </button>
            <button
              onClick={() => navigate(`/schedules/${id}/review`)}
              className="btn-ghost flex items-center gap-2"
            >
              <ClipboardList className="w-4 h-4" />
              前往复盘页面
            </button>
            <button
              onClick={() => navigate(`/schedules/${id}`)}
              className="btn-ghost flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回车次详情
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
