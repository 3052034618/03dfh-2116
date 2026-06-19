import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  Home,
  Calendar,
  UserCheck,
  Users,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRightLeft,
  Star as StarIcon,
  Clock,
  ArrowLeft,
  FileText,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useScriptStore } from '@/stores/scriptStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useDMStore } from '@/stores/dmStore';
import { useAssignmentStore } from '@/stores/assignmentStore';
import { generateTagAdjustments, getDifficultyLabel, getGenderLabel } from '@/utils/assignmentEngine';
import RoleAvatar from '@/components/ui/RoleAvatar';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import type {
  AssignmentReview,
  PlayerRoleFeedback,
  PlayerProfile,
  Role,
  Schedule,
  Script,
  DM,
  TagAdjustment,
} from '@/types';

const statusBadgeMap: Record<string, { variant: any; label: string }> = {
  pending: { variant: 'amber', label: '待确认' },
  ready: { variant: 'mint', label: '就绪' },
  playing: { variant: 'royal', label: '进行中' },
  finished: { variant: 'ink', label: '已结束' },
  cancelled: { variant: 'crimson', label: '已取消' },
};

const positiveTags = [
  { key: '沉浸', emoji: '🎭', label: '沉浸' },
  { key: '感动', emoji: '😭', label: '感动' },
  { key: '烧脑', emoji: '🧠', label: '烧脑' },
  { key: '爆笑', emoji: '😂', label: '爆笑' },
  { key: '刺激', emoji: '😱', label: '刺激' },
  { key: '意难平', emoji: '💘', label: '意难平' },
  { key: '反转', emoji: '🤯', label: '反转' },
];

const neutralTags = [
  { key: '一般', emoji: '😐', label: '一般' },
  { key: '懵', emoji: '🫠', label: '懵' },
  { key: '无聊', emoji: '😴', label: '无聊' },
  { key: '思考', emoji: '🤔', label: '思考' },
];

const negativeTags = [
  { key: '无语', emoji: '😡', label: '无语' },
  { key: '落差大', emoji: '😢', label: '落差大' },
  { key: '坐牢', emoji: '💀', label: '坐牢' },
  { key: '不适', emoji: '🙅‍♀️', label: '不适' },
];

const allExpTags = [...positiveTags, ...neutralTags, ...negativeTags];

interface PlayerFeedbackState {
  score: 1 | 2 | 3 | 4 | 5;
  experienceTags: string[];
  notes: string;
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const getScheduleById = useScheduleStore((s) => s.getScheduleById);
  const getScriptById = useScriptStore((s) => s.getScriptById);
  const getPlayerById = usePlayerStore((s) => s.getPlayerById);
  const getDMById = useDMStore((s) => s.getDMById);
  const { getSuggestion, getReview, saveReview } = useAssignmentStore();

  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const [overallScore, setOverallScore] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [playerFeedbacks, setPlayerFeedbacks] = useState<Record<string, PlayerFeedbackState>>({});
  const [bestExperience, setBestExperience] = useState<string[]>([]);
  const [disappointingExperience, setDisappointingExperience] = useState<string[]>([]);
  const [dmNotes, setDmNotes] = useState('');
  const [selectedAdjustments, setSelectedAdjustments] = useState<Set<string>>(new Set());

  const schedule: Schedule | undefined = id ? getScheduleById(id) : undefined;
  const script: Script | undefined = schedule ? getScriptById(schedule.scriptId) : undefined;
  const dm: DM | undefined = schedule ? getDMById(schedule.dmId) : undefined;
  const suggestion = id ? getSuggestion(id) : undefined;
  const existingReview = id ? getReview(id) : undefined;

  const finalPlan = suggestion?.finalPlan || [];
  const roles = script?.roles || [];

  const playerRolePairs = useMemo(() => {
    return finalPlan
      .map((pair) => {
        const player = getPlayerById(pair.playerId);
        const role = roles.find((r) => r.id === pair.roleId);
        if (!player || !role) return null;
        return { playerId: pair.playerId, roleId: pair.roleId, player, role };
      })
      .filter(Boolean) as Array<{
      playerId: string;
      roleId: string;
      player: PlayerProfile;
      role: Role;
    }>;
  }, [finalPlan, roles, getPlayerById]);

  const tagAdjustments = useMemo<TagAdjustment[]>(() => {
    if (!script || !schedule) return [];

    const perPlayerFeedback: PlayerRoleFeedback[] = playerRolePairs.map(({ playerId, roleId }) => {
      const fb = playerFeedbacks[playerId] || { score: 3, experienceTags: [], notes: '' };
      return {
        playerId,
        roleId,
        experienceTags: fb.experienceTags,
        score: fb.score,
        notes: fb.notes,
      };
    });

    if (perPlayerFeedback.length === 0) return [];

    const mockReview: AssignmentReview = {
      id: `temp_${Date.now()}`,
      scheduleId: id || '',
      scriptId: script?.id,
      dmId: schedule?.dmId || '',
      reviewedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      overallScore,
      overallRating: overallScore,
      bestExperience,
      disappointingExperience,
      perPlayerFeedback,
      dmNotes,
      suggestedTagAdjustments: [],
    };

    return generateTagAdjustments(mockReview, script);
  }, [script, schedule, playerRolePairs, playerFeedbacks, overallScore, bestExperience, disappointingExperience, dmNotes, id]);

  useEffect(() => {
    if (!schedule || !script || !suggestion) {
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }

    const initFeedbacks: Record<string, PlayerFeedbackState> = {};
    playerRolePairs.forEach(({ playerId }) => {
      initFeedbacks[playerId] = {
        score: 4,
        experienceTags: [],
        notes: '',
      };
    });

    if (existingReview) {
      setOverallScore(existingReview.overallScore);
      setBestExperience(existingReview.bestExperience);
      setDisappointingExperience(existingReview.disappointingExperience);
      setDmNotes(existingReview.dmNotes);

      existingReview.perPlayerFeedback.forEach((fb) => {
        initFeedbacks[fb.playerId] = {
          score: fb.score,
          experienceTags: fb.experienceTags,
          notes: fb.notes,
        };
      });
    }

    setPlayerFeedbacks(initFeedbacks);

    const adjustments = generateTagAdjustments(
      {
        id: `temp_${Date.now()}`,
        scheduleId: id || '',
        scriptId: script?.id,
        dmId: schedule?.dmId || '',
        reviewedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        overallScore: existingReview?.overallScore || 4,
        overallRating: existingReview?.overallRating || existingReview?.overallScore || 4,
        bestExperience: existingReview?.bestExperience || [],
        disappointingExperience: existingReview?.disappointingExperience || [],
        perPlayerFeedback: existingReview?.perPlayerFeedback || playerRolePairs.map(({ playerId, roleId }) => ({
          playerId,
          roleId,
          experienceTags: [],
          score: 4,
          notes: '',
        })),
        dmNotes: existingReview?.dmNotes || '',
        suggestedTagAdjustments: [],
      },
      script
    );
    setSelectedAdjustments(new Set(adjustments.map((a) => `${a.roleId}-${a.tagName}`)));

    setLoading(false);
  }, [schedule, script, suggestion, existingReview, playerRolePairs, id]);

  function updatePlayerFeedback(playerId: string, updates: Partial<PlayerFeedbackState>) {
    setPlayerFeedbacks((prev) => ({
      ...prev,
      [playerId]: {
        ...(prev[playerId] || { score: 3, experienceTags: [], notes: '' }),
        ...updates,
      },
    }));
  }

  function toggleExperienceTag(playerId: string, tagKey: string) {
    const current = playerFeedbacks[playerId]?.experienceTags || [];
    const next = current.includes(tagKey)
      ? current.filter((t) => t !== tagKey)
      : [...current, tagKey];
    updatePlayerFeedback(playerId, { experienceTags: next });
  }

  function toggleBestPlayer(playerId: string) {
    setBestExperience((prev) =>
      prev.includes(playerId)
        ? prev.filter((p) => p !== playerId)
        : [...prev, playerId]
    );
  }

  function toggleDisappointingPlayer(playerId: string) {
    setDisappointingExperience((prev) =>
      prev.includes(playerId)
        ? prev.filter((p) => p !== playerId)
        : [...prev, playerId]
    );
  }

  function toggleTagAdjustment(roleId: string, tagName: string) {
    const key = `${roleId}-${tagName}`;
    setSelectedAdjustments((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function getTagVariant(tagKey: string): 'mint' | 'ink' | 'crimson' {
    if (positiveTags.some((t) => t.key === tagKey)) return 'mint';
    if (negativeTags.some((t) => t.key === tagKey)) return 'crimson';
    return 'ink';
  }

  function handleSubmit() {
    if (!schedule || !script) return;

    const perPlayerFeedback: PlayerRoleFeedback[] = playerRolePairs.map(({ playerId, roleId }) => {
      const fb = playerFeedbacks[playerId] || { score: 3, experienceTags: [], notes: '' };
      return {
        playerId,
        roleId,
        experienceTags: fb.experienceTags,
        score: fb.score,
        notes: fb.notes,
      };
    });

    const appliedAdjustments = tagAdjustments.filter((a) =>
      selectedAdjustments.has(`${a.roleId}-${a.tagName}`)
    );

    const review: AssignmentReview = {
      id: `review_${Date.now()}`,
      scheduleId: id || '',
      scriptId: script?.id,
      dmId: schedule.dmId,
      reviewedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      overallScore,
      overallRating: overallScore,
      bestExperience,
      disappointingExperience,
      perPlayerFeedback,
      dmNotes,
      suggestedTagAdjustments: appliedAdjustments,
    };

    saveReview(review);
    setSubmitted(true);
  }

  if (loading) {
    return <ReviewSkeleton />;
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="card-dark p-10 w-full max-w-lg text-center">
          <div className="w-20 h-20 rounded-full bg-mint-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-mint-400" />
          </div>
          <h1 className="title-gold text-2xl mb-3">复盘已提交 ✓</h1>
          <p className="text-slate-400 mb-2">
            感谢您的反馈，智能分角算法将根据您的评分和标签建议持续优化。
          </p>
          {tagAdjustments.length > 0 && (
            <p className="text-sm text-amber-400/80 mb-6">
              {selectedAdjustments.size} 项标签调整已应用，将在下次分角时生效
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/schedules"
              className="btn-ghost flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              返回车次列表
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="btn-gold flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回上一页
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!schedule || !script) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-dark p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-crimson-400 mx-auto mb-4" />
          <div className="title-gold text-xl mb-2">数据加载失败</div>
          <p className="text-slate-400">无法找到车次数据</p>
          <Link to="/" className="btn-ghost inline-block mt-6">返回首页</Link>
        </div>
      </div>
    );
  }

  const steps = [
    { label: '创建车次', done: true },
    { label: '收集问卷', done: true },
    { label: '智能分角', done: true },
    { label: '填写复盘', done: false },
  ];

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
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
          <span className="text-amber-400 font-medium">分角复盘</span>
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

            <div className="flex flex-col items-end gap-4">
              {/* 进度指示器 */}
              <div className="flex items-center gap-2">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all',
                        step.done
                          ? 'bg-mint-500/20 border-mint-500/60 text-mint-300'
                          : idx === steps.length - 1
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_16px_rgba(212,168,75,0.3)]'
                          : 'bg-ink-700/50 border-ink-500 text-slate-400'
                      )}
                    >
                      {step.done ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={cn(
                        'text-sm hidden sm:inline',
                        step.done
                          ? 'text-mint-400'
                          : idx === steps.length - 1
                          ? 'text-amber-400 font-medium'
                          : 'text-slate-500'
                      )}
                    >
                      {step.label}
                    </span>
                    {idx < steps.length - 1 && (
                      <div
                        className={cn(
                          'w-10 h-0.5',
                          step.done ? 'bg-mint-500/50' : 'bg-ink-600'
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                className="btn-gold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                提交复盘
              </button>
            </div>
          </div>
        </div>

        {/* ========== Part 1: 整体满意度评分 ========== */}
        <div className="card-dark p-8 mb-6">
          <div className="text-center max-w-xl mx-auto">
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
                <StarIcon className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm text-amber-300">整体评分</span>
              </div>
            </div>
            <h2 className="title-gold text-2xl mb-3">本次分角满意度</h2>
            <p className="text-sm text-slate-400 mb-6">
              您的评分将用于优化智能分角算法，帮助我们提供更精准的角色匹配
            </p>
            <div className="flex justify-center mb-3">
              <StarRating
                value={overallScore}
                onChange={(v) => setOverallScore(Math.max(1, Math.min(5, v)) as 1 | 2 | 3 | 4 | 5)}
                size="lg"
              />
            </div>
            <div className="text-sm text-slate-400">
              当前评分：<span className="text-amber-400 font-semibold text-base">{overallScore}</span> / 5 星
            </div>
          </div>
        </div>

        {/* ========== Part 2: 玩家体验反馈 ========== */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="title-gold text-xl mb-1">玩家体验反馈</h2>
              <p className="text-sm text-slate-400">
                为每位玩家的角色体验打分并选择体验标签
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {playerRolePairs.map(({ playerId, roleId, player, role }) => {
              const fb = playerFeedbacks[playerId] || { score: 3, experienceTags: [], notes: '' };
              const scoreColorClass =
                fb.score >= 4
                  ? 'border-mint-500/50 bg-mint-500/5'
                  : fb.score === 3
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : 'border-crimson-500/50 bg-crimson-500/5';

              return (
                <div
                  key={playerId}
                  className={cn(
                    'card-dark p-5 transition-all',
                    bestExperience.includes(playerId) && 'ring-2 ring-mint-500/50',
                    disappointingExperience.includes(playerId) && 'ring-2 ring-crimson-500/50'
                  )}
                >
                  {/* 卡片头部 */}
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-ink-600/50">
                    <RoleAvatar
                      name={player.name}
                      avatar={player.avatar}
                      gender={player.gender}
                      size="md"
                    />
                    <ArrowRightLeft className="w-4 h-4 text-amber-500/60 shrink-0" />
                    <RoleAvatar
                      name={role.name}
                      avatar={role.avatar}
                      gender={role.gender}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-200 truncate">
                        {player.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span>饰演</span>
                        <span className="font-serif text-slate-200">{role.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* 体验星级 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">玩家体验</span>
                      <Badge
                        variant={
                          fb.score >= 4 ? 'mint' : fb.score === 3 ? 'amber' : 'crimson'
                        }
                        className="text-[10px]"
                      >
                        {fb.score >= 4 ? '良好' : fb.score === 3 ? '一般' : '不佳'}
                      </Badge>
                    </div>
                    <div
                      className={cn(
                        'p-3 rounded-lg border transition-all',
                        scoreColorClass
                      )}
                    >
                      <StarRating
                        value={fb.score}
                        onChange={(v) =>
                          updatePlayerFeedback(playerId, {
                            score: Math.max(1, Math.min(5, v)) as 1 | 2 | 3 | 4 | 5,
                          })
                        }
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* 体验标签 */}
                  <div className="mb-4">
                    <div className="text-xs text-slate-400 mb-2">体验标签（可多选）</div>
                    <div className="flex flex-wrap gap-1.5">
                      {allExpTags.map((tag) => {
                        const selected = fb.experienceTags.includes(tag.key);
                        const variant = getTagVariant(tag.key);
                        return (
                          <button
                            key={tag.key}
                            onClick={() => toggleExperienceTag(playerId, tag.key)}
                            className={cn(
                              'px-2.5 py-1 rounded-md text-xs border transition-all',
                              selected
                                ? variant === 'mint'
                                  ? 'bg-mint-500/20 border-mint-500/50 text-mint-300'
                                  : variant === 'crimson'
                                  ? 'bg-crimson-500/20 border-crimson-500/50 text-crimson-300'
                                  : 'bg-ink-600/50 border-ink-400/60 text-slate-200'
                                : 'bg-ink-800/50 border-ink-600/50 text-slate-400 hover:border-ink-500/70 hover:text-slate-300'
                            )}
                          >
                            <span className="mr-0.5">{tag.emoji}</span>
                            {tag.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 文字备注 */}
                  <div>
                    <textarea
                      value={fb.notes}
                      onChange={(e) => updatePlayerFeedback(playerId, { notes: e.target.value })}
                      placeholder="补充体验细节..."
                      className="input-dark text-xs resize-none h-20 py-2"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========== Part 3: 突出标记 ========== */}
        <div className="card-dark p-6 mb-6">
          <h2 className="title-gold text-xl mb-5">突出标记</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* 最佳体验玩家 */}
            <div className="p-5 rounded-xl bg-mint-500/5 border border-mint-500/30">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-mint-500/15 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-mint-400" />
                </div>
                <div>
                  <div className="text-mint-300 font-medium mb-1">最佳体验玩家</div>
                  <div className="text-xs text-slate-400">
                    选择体验特别好的玩家，后续将优先推荐此类角色
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {playerRolePairs.map(({ playerId, player }) => {
                  const selected = bestExperience.includes(playerId);
                  return (
                    <button
                      key={playerId}
                      onClick={() => toggleBestPlayer(playerId)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
                        selected
                          ? 'bg-mint-500/20 border-mint-500/60 text-mint-300'
                          : 'bg-ink-800/50 border-ink-600/50 text-slate-300 hover:border-mint-500/40 hover:text-mint-400'
                      )}
                    >
                      <RoleAvatar
                        name={player.name}
                        avatar={player.avatar}
                        gender={player.gender}
                        size="sm"
                      />
                      <span className="text-sm">{player.name}</span>
                      {selected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 落差较大玩家 */}
            <div className="p-5 rounded-xl bg-crimson-500/5 border border-crimson-500/30">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-crimson-500/15 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-crimson-400" />
                </div>
                <div>
                  <div className="text-crimson-300 font-medium mb-1">落差较大玩家</div>
                  <div className="text-xs text-slate-400">
                    ⚠️ 红色警示：这些玩家下次分角需特别注意避免同类角色
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {playerRolePairs.map(({ playerId, player }) => {
                  const selected = disappointingExperience.includes(playerId);
                  return (
                    <button
                      key={playerId}
                      onClick={() => toggleDisappointingPlayer(playerId)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
                        selected
                          ? 'bg-crimson-500/20 border-crimson-500/60 text-crimson-300'
                          : 'bg-ink-800/50 border-ink-600/50 text-slate-300 hover:border-crimson-500/40 hover:text-crimson-400'
                      )}
                    >
                      <RoleAvatar
                        name={player.name}
                        avatar={player.avatar}
                        gender={player.gender}
                        size="sm"
                      />
                      <span className="text-sm">{player.name}</span>
                      {selected && <X className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* DM 自由笔记 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-amber-500/70" />
              <span className="text-sm text-slate-300 font-medium">DM 备注</span>
            </div>
            <textarea
              value={dmNotes}
              onChange={(e) => setDmNotes(e.target.value)}
              placeholder="记录本场整体氛围、亮点、不足，以及任何想备注的内容..."
              className="input-dark resize-none h-32 py-3"
            />
          </div>
        </div>

        {/* ========== Part 4: 系统建议的标签调整 ========== */}
        {tagAdjustments.length > 0 && (
          <div className="card-dark p-6 mb-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h2 className="title-gold text-xl mb-1">系统建议的标签调整</h2>
                <p className="text-sm text-slate-400">
                  基于本次反馈，系统将自动调整角色标签权重，用于优化后续分角匹配
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {tagAdjustments.map((adj) => {
                const role = roles.find((r) => r.id === adj.roleId);
                const key = `${adj.roleId}-${adj.tagName}`;
                const selected = selectedAdjustments.has(key);
                const isIncrease = adj.suggestedWeight > adj.currentWeight;

                return (
                  <div
                    key={key}
                    className={cn(
                      'p-4 rounded-xl border transition-all flex items-center gap-4',
                      selected
                        ? 'bg-amber-500/5 border-amber-500/40'
                        : 'bg-ink-800/30 border-ink-600/50 opacity-60'
                    )}
                  >
                    {/* 勾选框 */}
                    <label className="shrink-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleTagAdjustment(adj.roleId, adj.tagName)}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          'w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all',
                          selected
                            ? 'bg-amber-500 border-amber-500'
                            : 'bg-ink-800 border-ink-500 hover:border-amber-500/50'
                        )}
                      >
                        {selected && <Check className="w-4 h-4 text-ink-900" />}
                      </div>
                    </label>

                    {/* 角色头像 + 名称 */}
                    <div className="flex items-center gap-3 shrink-0 w-44">
                      <RoleAvatar
                        name={role?.name || '?'}
                        avatar={role?.avatar}
                        gender={role?.gender}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-serif text-slate-200 truncate">
                          {role?.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {getGenderLabel(role?.gender || 'any')} · {getDifficultyLabel(role?.difficulty || 1)}
                        </div>
                      </div>
                    </div>

                    {/* 标签 + 进度条 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={isIncrease ? 'mint' : 'crimson'}
                          className="text-[11px]"
                        >
                          {adj.tagName}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          权重 {adj.currentWeight}%
                          <span className="mx-1">→</span>
                          <span
                            className={cn(
                              'font-semibold',
                              isIncrease ? 'text-mint-400' : 'text-crimson-400'
                            )}
                          >
                            {adj.suggestedWeight}%
                          </span>
                        </span>
                      </div>
                      <div className="relative h-2.5 bg-ink-700/80 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-600/40 to-amber-500/40 rounded-full"
                          style={{ width: `${adj.currentWeight}%` }}
                        />
                        <div
                          className={cn(
                            'absolute top-0 h-full rounded-full',
                            isIncrease
                              ? 'bg-gradient-to-r from-mint-500/60 to-mint-400/80'
                              : 'bg-gradient-to-r from-crimson-500/60 to-crimson-400/80'
                          )}
                          style={{
                            left: isIncrease ? `${adj.currentWeight}%` : `${adj.suggestedWeight}%`,
                            width: `${Math.abs(adj.suggestedWeight - adj.currentWeight)}%`,
                          }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(212,168,75,0.6)]"
                          style={{ left: `${adj.currentWeight}%` }}
                        />
                        <div
                          className={cn(
                            'absolute top-1/2 -translate-y-1/2 w-1 h-4 rounded-full shadow-lg',
                            isIncrease
                              ? 'bg-mint-400 shadow-[0_0_8px_rgba(76,184,110,0.6)]'
                              : 'bg-crimson-400 shadow-[0_0_8px_rgba(201,58,78,0.6)]'
                          )}
                          style={{ left: `${adj.suggestedWeight}%` }}
                        />
                      </div>
                    </div>

                    {/* 调整理由 */}
                    <div className="shrink-0 w-64 text-xs text-slate-500 hidden md:block">
                      {adj.reason}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-500 bg-ink-800/50 rounded-lg px-3 py-2.5">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500/70" />
              <span>复盘提交后，勾选的 {selectedAdjustments.size} 项调整将在下次分角时自动生效</span>
            </div>
          </div>
        )}

        {/* ========== 底部提交栏 ========== */}
        <div className="sticky bottom-4 z-40">
          <div className="card-dark p-4 flex flex-wrap items-center justify-between gap-4 border-amber-500/30">
            <div className="flex flex-wrap items-center gap-5 text-sm">
              <div className="flex items-center gap-2">
                <StarIcon className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-slate-400">整体评分：</span>
                <span className="text-amber-400 font-semibold">{overallScore} 星</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500/70" />
                <span className="text-slate-400">已反馈：</span>
                <span className="text-mint-400 font-semibold">
                  {Object.keys(playerFeedbacks).length}/{playerRolePairs.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500/70" />
                <span className="text-slate-400">标签调整：</span>
                <span className="text-amber-400 font-semibold">{selectedAdjustments.size} 项</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="btn-gold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              提交复盘
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
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
              </div>
            </div>
          </div>
        </div>

        <div className="card-dark p-8 mb-6">
          <div className="max-w-md mx-auto text-center space-y-4">
            <div className="h-6 w-24 bg-ink-700/50 rounded-full animate-pulse mx-auto" />
            <div className="h-7 w-40 bg-ink-700/50 rounded animate-pulse mx-auto" />
            <div className="h-4 w-72 bg-ink-700/50 rounded animate-pulse mx-auto" />
            <div className="h-10 w-40 bg-ink-700/50 rounded animate-pulse mx-auto mt-6" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card-dark p-5 h-72">
              <div className="h-16 bg-ink-700/50 rounded-lg animate-pulse mb-4" />
              <div className="h-10 bg-ink-700/50 rounded-lg animate-pulse mb-4" />
              <div className="grid grid-cols-4 gap-1.5 mb-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-6 bg-ink-700/50 rounded animate-pulse" />
                ))}
              </div>
              <div className="h-16 bg-ink-700/50 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>

        <div className="card-dark p-6">
          <div className="h-7 w-48 bg-ink-700/50 rounded animate-pulse mb-5" />
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-ink-700/50 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-28 bg-ink-700/50 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
