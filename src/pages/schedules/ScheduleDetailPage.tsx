import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  User,
  Clock,
  Users,
  Plus,
  Search,
  Send,
  Copy,
  ChevronDown,
  ChevronUp,
  FileText,
  Edit3,
  XCircle,
  ArrowRight,
  Sparkles,
  ClipboardList,
  CheckCircle2,
  X,
  Eye,
  AlertTriangle,
  Lock,
  Heart,
  Smile,
  Meh,
  Frown,
  Mars,
  Venus,
  UserCircle2,
  Link2,
  Link2Off,
  ArrowLeft,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useScriptStore } from '@/stores/scriptStore';
import { useDMStore } from '@/stores/dmStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useAssignmentStore } from '@/stores/assignmentStore';
import type {
  Schedule,
  Script,
  DM,
  PlayerProfile,
  SchedulePlayer,
  PlayerSurvey,
} from '@/types';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import RoleAvatar from '@/components/ui/RoleAvatar';
import Empty from '@/components/ui/Empty';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<
  string,
  { variant: 'ink' | 'amber' | 'mint' | 'royal' | 'crimson'; label: string; pulse?: boolean; size?: 'lg' }
> = {
  pending: { variant: 'ink', label: '待开始', size: 'lg' },
  ready: { variant: 'amber', label: '已就绪', size: 'lg' },
  playing: { variant: 'mint', label: '进行中', pulse: true, size: 'lg' },
  finished: { variant: 'royal', label: '已结束', size: 'lg' },
  cancelled: { variant: 'crimson', label: '已取消', size: 'lg' },
};

const SURVEY_STATUS_CONFIG: Record<string, { label: string; variant: 'ink' | 'amber' | 'sunset' | 'mint' }> = {
  not_sent: { label: '未发送', variant: 'ink' },
  sent: { label: '已发送', variant: 'amber' },
  partial: { label: '部分回收', variant: 'sunset' },
  completed: { label: '全部回收', variant: 'mint' },
};

const RELATION_BADGE: Record<string, { label: string; variant: 'royal' | 'amber' | 'mint' | 'ink' }> = {
  lover: { label: '情侣', variant: 'royal' },
  friend: { label: '朋友', variant: 'amber' },
  family: { label: '家人', variant: 'mint' },
  colleague: { label: '同事', variant: 'ink' },
  stranger: { label: '陌生', variant: 'ink' },
};

const ASSIGNMENT_STAGES = [
  { key: 'none', label: '未开始' },
  { key: 'suggested', label: '已生成建议' },
  { key: 'adjusted', label: '已人工调整' },
  { key: 'finalized', label: '已最终确认' },
];

function getGenreBadgeVariant(genre: string): 'royal' | 'amber' | 'mint' | 'crimson' | 'sunset' | 'ink' {
  if (['情感', '古风', '治愈'].includes(genre)) return 'royal';
  if (['硬核', '刑侦', '推理'].includes(genre)) return 'amber';
  if (['恐怖', '中式', '变格'].includes(genre)) return 'crimson';
  if (['欢乐', '机制', '爆笑'].includes(genre)) return 'sunset';
  if (['阵营', '谍战', '民国'].includes(genre)) return 'mint';
  return 'ink';
}

function LargeStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <div
      className={cn(
        'relative px-4 py-2 rounded-lg font-serif font-semibold text-sm border',
        cfg.variant === 'ink' && 'bg-ink-800/80 text-slate-300 border-ink-600/60',
        cfg.variant === 'amber' && 'bg-amber-500/15 text-amber-300 border-amber-500/40',
        cfg.variant === 'mint' && 'bg-mint-600/20 text-mint-300 border-mint-500/40',
        cfg.variant === 'royal' && 'bg-royal-700/40 text-royal-100 border-royal-600/50',
        cfg.variant === 'crimson' && 'bg-crimson-700/30 text-crimson-300 border-crimson-500/40'
      )}
    >
      {cfg.pulse && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
      )}
      {cfg.label}
    </div>
  );
}

function SurveyProgressBar({ responded, total }: { responded: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((responded / total) * 100);
  const color =
    pct === 100
      ? 'from-green-500 to-mint-400'
      : pct >= 50
      ? 'from-amber-500 to-yellow-400'
      : 'from-crimson-500 to-orange-400';
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-2 rounded-full bg-ink-700/60 overflow-hidden">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-slate-400 w-10 text-right">{pct}%</span>
    </div>
  );
}

export default function ScheduleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const getScheduleById = useScheduleStore((s) => s.getScheduleById);
  const addPlayerToSchedule = useScheduleStore((s) => s.addPlayerToSchedule);
  const removePlayerFromSchedule = useScheduleStore((s) => s.removePlayerFromSchedule);
  const sendSurvey = useScheduleStore((s) => s.sendSurvey);
  const updateSchedule = useScheduleStore((s) => s.updateSchedule);

  const getScriptById = useScriptStore((s) => s.getScriptById);
  const getRoleById = useScriptStore((s) => s.getRoleById);
  const getDMById = useDMStore((s) => s.getDMById);
  const playersAll = usePlayerStore((s) => s.players);
  const searchPlayers = usePlayerStore((s) => s.searchPlayers);
  const getPlayerById = usePlayerStore((s) => s.getPlayerById);

  const getSuggestion = useAssignmentStore((s) => s.getSuggestion);
  const generateSuggestion = useAssignmentStore((s) => s.generateSuggestion);
  const getReview = useAssignmentStore((s) => s.getReview);

  const schedule = id ? getScheduleById(id) : undefined;
  const script = schedule ? getScriptById(schedule.scriptId) : undefined;
  const dm = schedule ? getDMById(schedule.dmId) : undefined;

  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [playerSearch, setPlayerSearch] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [relationType, setRelationType] = useState<SchedulePlayer['relationType']>('stranger');
  const [acquaintanceWith, setAcquaintanceWith] = useState<string>('');

  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [expandedSurveys, setExpandedSurveys] = useState(false);

  const existingPlayerIds = useMemo(
    () => new Set(schedule?.players.map((p) => p.playerId) || []),
    [schedule]
  );

  const searchResults = useMemo(() => {
    const results = playerSearch.trim() ? searchPlayers(playerSearch) : playersAll;
    return results.filter((p) => !existingPlayerIds.has(p.id)).slice(0, 12);
  }, [playerSearch, playersAll, searchPlayers, existingPlayerIds]);

  const suggestion = id ? getSuggestion(id) : undefined;
  const review = id ? getReview(id) : undefined;

  const assignmentStage = useMemo(() => {
    if (!suggestion) return 'none';
    if (suggestion.manualAdjusted) return 'adjusted';
    return 'suggested';
  }, [suggestion]);

  const respondedCount = useMemo(
    () => schedule?.players.filter((p) => p.surveyResponse).length || 0,
    [schedule]
  );

  if (!schedule) {
    return (
      <div className="card-dark">
        <Empty title="车次不存在" description="找不到对应的车次记录" />
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[schedule.status] || STATUS_CONFIG.pending;
  const surveyCfg = SURVEY_STATUS_CONFIG[schedule.surveyStatus] || SURVEY_STATUS_CONFIG.not_sent;

  const handleAddPlayer = () => {
    if (!selectedPlayerId || !schedule) return;
    const acqList = acquaintanceWith ? [acquaintanceWith] : [];
    addPlayerToSchedule(schedule.id, {
      playerId: selectedPlayerId,
      isNew: (getPlayerById(selectedPlayerId)?.totalGames || 0) < 5,
      acquaintanceWith: acqList,
      relationType,
    });
    if (schedule.surveyStatus !== 'not_sent') {
      updateSchedule(schedule.id, { surveyStatus: 'not_sent' });
    }
    setShowAddPlayer(false);
    setSelectedPlayerId('');
    setPlayerSearch('');
    setAcquaintanceWith('');
    setRelationType('stranger');
  };

  const handleSendSurvey = () => {
    if (!schedule) return;
    sendSurvey(schedule.id);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/survey/${schedule.id}`;
    navigator.clipboard?.writeText(link);
  };

  const renderSocialStyleIcon = (style: PlayerSurvey['socialStyle']) => {
    switch (style) {
      case 'social':
        return <Smile className="w-4 h-4 text-mint-400" />;
      case 'introvert':
        return <Frown className="w-4 h-4 text-royal-400" />;
      default:
        return <Meh className="w-4 h-4 text-amber-400" />;
    }
  };

  const renderSocialStyleLabel = (style: PlayerSurvey['socialStyle']) => {
    switch (style) {
      case 'social':
        return '社牛 🐮';
      case 'introvert':
        return '社恐 🐢';
      default:
        return '正常 😐';
    }
  };

  const renderGenderIcon = (gender: 'male' | 'female' | 'any') => {
    if (gender === 'male') return <Mars className="w-3 h-3 text-blue-400" />;
    if (gender === 'female') return <Venus className="w-3 h-3 text-pink-400" />;
    return <UserCircle2 className="w-3 h-3 text-slate-400" />;
  };

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate('/schedules')}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回车次列表</span>
      </button>

      <div className="card-dark p-6">
        <div className="flex flex-wrap items-start gap-6">
          <div className="w-[120px] h-[80px] shrink-0 rounded-lg overflow-hidden border border-ink-600/50">
            <img
              src={script?.cover}
              alt={script?.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl md:text-3xl text-slate-100 font-bold mb-3">
              {script?.name || '未知剧本'}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-500/70" />
                <span>
                  {format(parseISO(schedule.date), 'yyyy年M月d日', { locale: zhCN })}
                  {' · '}
                  {schedule.startTime} - {schedule.endTime}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-500/70" />
                <span>{schedule.room}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-500/70" />
                <span>{dm?.name || '未分配DM'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500/70" />
                <span>{script?.duration ? `${Math.floor(script.duration / 60)}小时` : '-'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-500/70" />
                <span>
                  {schedule.players.length}/{script?.playerCount || '?'}人
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {script?.genre.map((g) => (
                <Badge key={g} variant={getGenreBadgeVariant(g)}>
                  {g}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0">
            <LargeStatusBadge status={schedule.status} />
            <div className="flex flex-wrap gap-2">
              {schedule.status === 'ready' && (
                <button
                  onClick={() => navigate(`/schedules/${schedule.id}/assign`)}
                  className="btn-gold flex items-center gap-1.5 text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>生成分角建议</span>
                </button>
              )}
              {schedule.status === 'finished' && (
                <button
                  onClick={() => navigate(`/schedules/${schedule.id}/review`)}
                  className="btn-gold flex items-center gap-1.5 text-sm"
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>填写复盘</span>
                </button>
              )}
              <button
                onClick={handleSendSurvey}
                className="btn-ghost flex items-center gap-1.5 text-sm"
              >
                <Send className="w-4 h-4" />
                <span>发送问卷</span>
              </button>
              <button className="btn-ghost flex items-center gap-1.5 text-sm">
                <Edit3 className="w-4 h-4" />
                <span>编辑</span>
              </button>
              <button className="btn-ghost flex items-center gap-1.5 text-sm text-crimson-400 hover:border-crimson-500/50">
                <XCircle className="w-4 h-4" />
                <span>取消</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card-dark p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="title-gold text-base mb-1">玩家名单</h2>
                <p className="text-xs text-slate-500">
                  已报名 {schedule.players.length} / {script?.playerCount || '?'} 人
                </p>
              </div>
              <button
                onClick={() => setShowAddPlayer(true)}
                className="btn-gold flex items-center gap-1.5 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>添加玩家</span>
              </button>
            </div>

            {schedule.players.length === 0 ? (
              <Empty title="暂无玩家" description="点击「添加玩家」来为本次车次添加参与者" />
            ) : (
              <div className="space-y-2">
                {schedule.players.map((sp, idx) => {
                  const profile = getPlayerById(sp.playerId);
                  if (!profile) return null;
                  const hasSurvey = !!sp.surveyResponse;
                  const isExpanded = expandedPlayer === sp.playerId;
                  const assignedRole = sp.finalRoleId
                    ? getRoleById(schedule.scriptId, sp.finalRoleId)
                    : null;
                  const acquaintanceName = sp.acquaintanceWith[0]
                    ? getPlayerById(sp.acquaintanceWith[0])?.name
                    : null;
                  return (
                    <div key={sp.playerId}>
                      <div
                        className={cn(
                          'flex items-center gap-4 p-3 rounded-lg border transition-all duration-200',
                          'bg-ink-800/40 border-ink-600/40 hover:border-amber-500/30'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <RoleAvatar
                            name={profile.name}
                            avatar={profile.avatar}
                            gender={profile.gender}
                            size="md"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-slate-100">{profile.name}</span>
                              {sp.isNew && <Badge variant="amber">新客</Badge>}
                              {profile.totalGames > 0 && (
                                <span className="text-xs text-slate-500">
                                  历史{profile.totalGames}场
                                </span>
                              )}
                              {acquaintanceName && (
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <Link2 className="w-3 h-3" />
                                  {acquaintanceName}的
                                  {sp.relationType && RELATION_BADGE[sp.relationType]?.label}
                                </span>
                              )}
                              {sp.relationType && RELATION_BADGE[sp.relationType] && (
                                <Badge variant={RELATION_BADGE[sp.relationType].variant}>
                                  {RELATION_BADGE[sp.relationType].label}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex-1 max-w-[200px]">
                                <SurveyProgressBar responded={hasSurvey ? 1 : 0} total={1} />
                              </div>
                              <span className="text-xs text-slate-500">
                                {hasSurvey ? '已完成问卷' : '待填写问卷'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {assignedRole && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-royal-700/30 border border-royal-600/40 text-xs">
                              <User className="w-3.5 h-3.5 text-royal-200" />
                              <span className="text-royal-100 font-medium">
                                {assignedRole.name}
                              </span>
                            </div>
                          )}
                          {hasSurvey && (
                            <button
                              onClick={() =>
                                setExpandedPlayer(isExpanded ? null : sp.playerId)
                              }
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-ink-700/50 transition-all"
                              title="查看问卷"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() =>
                              removePlayerFromSchedule(schedule.id, sp.playerId)
                            }
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-crimson-400 hover:bg-crimson-500/10 transition-all"
                            title="移除玩家"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {isExpanded && sp.surveyResponse && (
                        <div className="mt-2 ml-4 p-4 rounded-lg bg-ink-900/50 border-l-2 border-amber-500/40 border-r border-t border-b border-ink-600/30">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-xs text-slate-500 mb-1.5">想玩类型</div>
                              <div className="flex flex-wrap gap-1">
                                {sp.surveyResponse.preferredGenres.map((g) => (
                                  <Badge key={g} variant={getGenreBadgeVariant(g)}>
                                    {g}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 mb-1.5">忌讳内容</div>
                              <div className="flex flex-wrap gap-1">
                                {sp.surveyResponse.tabooContent.length === 0 ? (
                                  <span className="text-xs text-slate-500">无</span>
                                ) : (
                                  sp.surveyResponse.tabooContent.map((t) => (
                                    <Badge key={t} variant="crimson">
                                      {t}
                                    </Badge>
                                  ))
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 mb-1.5">社交风格</div>
                              <div className="flex items-center gap-1.5 text-slate-300">
                                {renderSocialStyleIcon(sp.surveyResponse.socialStyle)}
                                <span>{renderSocialStyleLabel(sp.surveyResponse.socialStyle)}</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 mb-1.5">愿带动气氛</div>
                              <span className={cn(
                                'text-sm',
                                sp.surveyResponse.willingToLead ? 'text-mint-400' : 'text-slate-400'
                              )}>
                                {sp.surveyResponse.willingToLead ? '是' : '否'}
                              </span>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 mb-1.5">性别偏好</div>
                              <span className="text-sm text-slate-300">
                                {sp.surveyResponse.genderPreference === 'match' && '匹配本人性别'}
                                {sp.surveyResponse.genderPreference === 'cross' && '接受反串'}
                                {sp.surveyResponse.genderPreference === 'any' && '不限'}
                              </span>
                            </div>
                            <div className="md:col-span-2">
                              <div className="text-xs text-slate-500 mb-1.5">备注</div>
                              <p className="text-sm text-slate-300">
                                {sp.surveyResponse.extraNotes || '无'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card-dark p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="title-gold text-base mb-1">问卷回收状态</h2>
                <Badge variant={surveyCfg.variant}>{surveyCfg.label}</Badge>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSendSurvey}
                  className="btn-ghost flex items-center gap-1.5 text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>重新发送</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="btn-ghost flex items-center gap-1.5 text-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span>复制链接</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              <div className="p-3 rounded-lg bg-ink-800/40 border border-ink-600/40">
                <div className="text-xs text-slate-500 mb-1">发送时间</div>
                <div className="text-sm text-slate-200 font-medium">
                  {schedule.surveyStatus === 'not_sent' ? '-' : format(parseISO(schedule.createdAt), 'M月d日 HH:mm')}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-ink-800/40 border border-ink-600/40">
                <div className="text-xs text-slate-500 mb-1">总人数</div>
                <div className="text-sm text-slate-200 font-medium">
                  {schedule.players.length}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-mint-600/10 border border-mint-500/30">
                <div className="text-xs text-slate-500 mb-1">已回收</div>
                <div className="text-sm text-mint-300 font-semibold">{respondedCount}</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="text-xs text-slate-500 mb-1">待回收</div>
                <div className="text-sm text-amber-300 font-semibold">
                  {schedule.players.length - respondedCount}
                </div>
              </div>
            </div>

            <div className="mb-5">
              <SurveyProgressBar
                responded={respondedCount}
                total={schedule.players.length}
              />
            </div>

            <div>
              <button
                onClick={() => setExpandedSurveys(!expandedSurveys)}
                className="flex items-center justify-between w-full py-2 text-sm text-slate-400 hover:text-amber-400 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>问卷回答详情</span>
                </span>
                {expandedSurveys ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {expandedSurveys && (
                <div className="space-y-3 mt-3">
                  {schedule.players.map((sp) => {
                    const profile = getPlayerById(sp.playerId);
                    if (!profile) return null;
                    const survey = sp.surveyResponse;
                    return (
                      <div
                        key={sp.playerId}
                        className={cn(
                          'p-4 rounded-lg border transition-all',
                          survey
                            ? 'bg-ink-800/40 border-ink-600/40'
                            : 'bg-ink-900/30 border-ink-700/30 opacity-60'
                        )}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <RoleAvatar
                            name={profile.name}
                            avatar={profile.avatar}
                            gender={profile.gender}
                            size="sm"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-200 font-medium">{profile.name}</span>
                              {survey ? (
                                <Badge variant="mint">已完成</Badge>
                              ) : (
                                <Badge variant="amber">待填写</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {survey ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pl-13">
                            <div>
                              <div className="text-slate-500 mb-1">想玩</div>
                              <div className="flex flex-wrap gap-1">
                                {survey.preferredGenres.map((g) => (
                                  <span
                                    key={g}
                                    className="px-1.5 py-0.5 rounded bg-ink-700/60 text-slate-300"
                                  >
                                    {g}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-500 mb-1">社交风格</div>
                              <div className="flex items-center gap-1 text-slate-300">
                                {renderSocialStyleIcon(survey.socialStyle)}
                                <span>{renderSocialStyleLabel(survey.socialStyle)}</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-500 mb-1">带动气氛</div>
                              <span className={survey.willingToLead ? 'text-mint-400' : 'text-slate-400'}>
                                {survey.willingToLead ? '愿意' : '一般'}
                              </span>
                            </div>
                            <div>
                              <div className="text-slate-500 mb-1">性别偏好</div>
                              <span className="text-slate-300">
                                {survey.genderPreference === 'match' && '匹配'}
                                {survey.genderPreference === 'cross' && '反串'}
                                {survey.genderPreference === 'any' && '不限'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 pl-13">玩家尚未填写问卷</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card-dark overflow-hidden">
            {script && (
              <>
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={script.cover}
                    alt={script.name}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(180deg, transparent 40%, rgba(18,12,30,0.85) 100%)',
                    }}
                  />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-serif font-bold text-lg text-slate-100">
                      {script.name}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {script.genre.map((g) => (
                        <Badge key={g} variant={getGenreBadgeVariant(g)}>
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm text-slate-300 font-medium">角色预览</h4>
                    <button
                      onClick={() => navigate(`/scripts/${script.id}`)}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <span>查看详情</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {script.roles.slice(0, 6).map((role) => (
                      <div
                        key={role.id}
                        className="flex flex-col items-center p-2 rounded-lg bg-ink-800/40 border border-ink-600/30"
                        title={role.name}
                      >
                        <RoleAvatar
                          name={role.name}
                          avatar={role.avatar}
                          gender={role.gender}
                          size="sm"
                        />
                        <div className="mt-1.5 text-xs text-slate-300 truncate w-full text-center flex items-center justify-center gap-0.5">
                          {renderGenderIcon(role.gender)}
                          <span className="truncate">{role.name}</span>
                        </div>
                      </div>
                    ))}
                    {script.roles.length > 6 && (
                      <div className="flex items-center justify-center p-2 rounded-lg bg-ink-800/40 border border-ink-600/30 text-xs text-slate-500">
                        +{script.roles.length - 6}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="card-dark p-5">
            <h2 className="title-gold text-base mb-4">分角进度</h2>

            <div className="space-y-3 mb-5">
              {ASSIGNMENT_STAGES.map((stage, idx) => {
                const isActive = ASSIGNMENT_STAGES.findIndex((s) => s.key === assignmentStage) >= idx;
                return (
                  <div key={stage.key} className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border-2 shrink-0 transition-all',
                        isActive
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-ink-800 border-ink-600 text-slate-500'
                      )}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={cn(
                        'text-sm',
                        isActive ? 'text-slate-200' : 'text-slate-500'
                      )}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {suggestion && (
              <div className="p-4 rounded-lg bg-ink-800/50 border border-ink-600/40 mb-4 space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">整体匹配率</span>
                  <span className="font-serif font-bold text-mint-400">85%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>警告数</span>
                  </span>
                  <span className="font-semibold text-amber-300">
                    {suggestion.warnings.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-royal-400" />
                    <span>锁定数</span>
                  </span>
                  <span className="font-semibold text-royal-200">
                    {suggestion.finalPlan?.filter((p) => p.isLocked).length || 0}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                if (!suggestion && schedule.status === 'ready') {
                  generateSuggestion(schedule.id);
                }
                navigate(`/schedules/${schedule.id}/assign`);
              }}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all text-sm',
                schedule.status === 'ready'
                  ? 'btn-gold'
                  : 'btn-ghost opacity-60 cursor-not-allowed'
              )}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {suggestion ? '查看分角方案' : '生成分角建议'}
              </span>
            </button>
          </div>

          {review && (
            <div className="card-dark p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="title-gold text-base">复盘记录</h2>
                <Badge variant="royal">已完成</Badge>
              </div>
              <div className="p-4 rounded-lg bg-royal-700/15 border border-royal-600/30 mb-3">
                <div className="text-xs text-slate-400 mb-1">综合评分</div>
                <div className="text-3xl font-serif font-bold text-royal-100">
                  {review.overallScore}
                  <span className="text-base text-slate-500">/5</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-4 line-clamp-3">{review.dmNotes}</p>
              <button
                onClick={() => navigate(`/schedules/${schedule.id}/review`)}
                className="w-full btn-ghost text-sm flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>查看完整复盘</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showAddPlayer}
        onClose={() => {
          setShowAddPlayer(false);
          setSelectedPlayerId('');
          setPlayerSearch('');
          setAcquaintanceWith('');
          setRelationType('stranger');
        }}
        title="添加玩家"
        size="lg"
        footer={
          <>
            <button
              onClick={() => {
                setShowAddPlayer(false);
                setSelectedPlayerId('');
              }}
              className="btn-ghost"
            >
              取消
            </button>
            <button
              onClick={handleAddPlayer}
              disabled={!selectedPlayerId}
              className={cn('btn-gold', !selectedPlayerId && 'opacity-50 cursor-not-allowed')}
            >
              添加
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">搜索玩家</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                placeholder="搜索姓名或手机号..."
                className="input-dark pl-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">选择玩家</label>
            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {searchResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlayerId(p.id)}
                  className={cn(
                    'p-2.5 rounded-lg cursor-pointer border transition-all duration-200 flex items-center gap-2.5',
                    selectedPlayerId === p.id
                      ? 'bg-amber-500/10 border-amber-500/50'
                      : 'bg-ink-900/50 border-ink-600/40 hover:border-amber-500/30'
                  )}
                >
                  <RoleAvatar
                    name={p.name}
                    avatar={p.avatar}
                    gender={p.gender}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-slate-200 font-medium text-sm truncate">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {p.totalGames} 场 · {p.phone.slice(0, 3)}****{p.phone.slice(-4)}
                    </div>
                  </div>
                  {selectedPlayerId === p.id && (
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                </div>
              ))}
              {searchResults.length === 0 && (
                <div className="col-span-2 py-8 text-center text-sm text-slate-500">
                  未找到匹配的玩家
                </div>
              )}
            </div>
          </div>

          {schedule.players.length > 0 && (
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                熟人关系（可选）
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <select
                  value={acquaintanceWith}
                  onChange={(e) => setAcquaintanceWith(e.target.value)}
                  className="input-dark text-sm"
                >
                  <option value="">选择熟人...</option>
                  {schedule.players.map((sp) => {
                    const profile = getPlayerById(sp.playerId);
                    return (
                      <option key={sp.playerId} value={sp.playerId}>
                        {profile?.name || sp.playerId}
                      </option>
                    );
                  })}
                </select>
                <select
                  value={relationType || 'friend'}
                  onChange={(e) =>
                    setRelationType(e.target.value as SchedulePlayer['relationType'])
                  }
                  className="input-dark text-sm"
                >
                  <option value="lover">情侣</option>
                  <option value="friend">朋友</option>
                  <option value="family">家人</option>
                  <option value="colleague">同事</option>
                  <option value="stranger">陌生</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
