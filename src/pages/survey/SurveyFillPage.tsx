import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, BookOpen, CheckCircle2 } from 'lucide-react';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useScriptStore } from '@/stores/scriptStore';
import { usePlayerStore } from '@/stores/playerStore';
import type { PlayerSurvey } from '@/types';
import { cn } from '@/lib/utils';

const GENRE_OPTIONS = [
  '情感', '硬核', '恢复', '恐怖', '欢乐', '阵营',
  '机制', '古风', '现代', '民国', '科幻', '校园',
];

const TABOO_OPTIONS = [
  '恐怖画面', '血腥暴力', '情感纠葛', '单人任务',
  'NPC惊吓', '跳跃惊吓', '都可以接受',
];

const SOCIAL_STYLES: { value: PlayerSurvey['socialStyle']; emoji: string; label: string; desc: string }[] = [
  { value: 'social', emoji: '🐮', label: '社牛', desc: '我爱互动，带节奏！' },
  { value: 'normal', emoji: '😐', label: '正常', desc: '随缘交流' },
  { value: 'introvert', emoji: '🐢', label: '社恐', desc: '比较安静，请温柔' },
];

const LEAD_OPTIONS: { value: boolean | 'maybe'; label: string }[] = [
  { value: true, label: '愿意 ✨' },
  { value: 'maybe', label: '看情况' },
  { value: false, label: '不太想' },
];

const GENDER_OPTIONS: { value: PlayerSurvey['genderPreference']; label: string }[] = [
  { value: 'match', label: '想拿同性角色' },
  { value: 'any', label: '随便都可以' },
  { value: 'cross', label: '想试试反串' },
];

function Chip({
  label,
  selected,
  color,
  onClick,
}: {
  label: string;
  selected: boolean;
  color: 'amber' | 'crimson';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3.5 py-2 rounded-lg text-sm font-medium border transition-all duration-200',
        color === 'amber' && selected
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/10'
          : color === 'amber'
          ? 'bg-ink-800/60 text-slate-400 border-ink-600/40 hover:border-amber-500/30 hover:text-amber-400/70'
          : color === 'crimson' && selected
          ? 'bg-crimson-700/25 text-crimson-300 border-crimson-500/50 shadow-sm shadow-crimson-500/10'
          : 'bg-ink-800/60 text-slate-400 border-ink-600/40 hover:border-crimson-500/30 hover:text-crimson-400/70'
      )}
    >
      {label}
    </button>
  );
}

function RadioCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 p-4 rounded-xl border text-left transition-all duration-200',
        selected
          ? 'bg-amber-500/10 border-amber-500/40 shadow-sm shadow-amber-500/5'
          : 'bg-ink-800/50 border-ink-600/40 hover:border-amber-500/20'
      )}
    >
      {children}
    </button>
  );
}

export default function SurveyFillPage() {
  const { scheduleId, playerId } = useParams<{ scheduleId: string; playerId: string }>();

  const getScheduleById = useScheduleStore((s) => s.getScheduleById);
  const updatePlayerSurvey = useScheduleStore((s) => s.updatePlayerSurvey);
  const updateSchedule = useScheduleStore((s) => s.updateSchedule);
  const getScriptById = useScriptStore((s) => s.getScriptById);
  const getPlayerById = usePlayerStore((s) => s.getPlayerById);

  const schedule = scheduleId ? getScheduleById(scheduleId) : undefined;
  const schedulePlayer = schedule?.players.find((p) => p.playerId === playerId);
  const script = schedule ? getScriptById(schedule.scriptId) : undefined;
  const player = playerId ? getPlayerById(playerId) : undefined;

  const existingSurvey = schedulePlayer?.surveyResponse;

  const [preferredGenres, setPreferredGenres] = useState<string[]>([]);
  const [tabooContent, setTabooContent] = useState<string[]>([]);
  const [socialStyle, setSocialStyle] = useState<PlayerSurvey['socialStyle']>('normal');
  const [willingToLead, setWillingToLead] = useState<boolean | 'maybe'>(false);
  const [genderPreference, setGenderPreference] = useState<PlayerSurvey['genderPreference']>('any');
  const [extraNotes, setExtraNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (existingSurvey) {
      setPreferredGenres(existingSurvey.preferredGenres);
      setTabooContent(existingSurvey.tabooContent);
      setSocialStyle(existingSurvey.socialStyle);
      setWillingToLead(existingSurvey.willingToLead);
      setGenderPreference(existingSurvey.genderPreference);
      setExtraNotes(existingSurvey.extraNotes);
      setSubmitted(true);
    }
  }, [existingSurvey]);

  const toggleGenre = (genre: string) => {
    setPreferredGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const toggleTaboo = (taboo: string) => {
    if (taboo === '都可以接受') {
      setTabooContent((prev) => (prev.includes('都可以接受') ? [] : ['都可以接受']));
      return;
    }
    setTabooContent((prev) => {
      const next = prev.filter((t) => t !== '都可以接受');
      return next.includes(taboo) ? next.filter((t) => t !== taboo) : [...next, taboo];
    });
  };

  const handleSubmit = () => {
    if (!scheduleId || !playerId || !schedule) return;

    const surveyData: PlayerSurvey = {
      submittedAt: new Date().toISOString(),
      preferredGenres,
      tabooContent,
      socialStyle,
      willingToLead: willingToLead === true,
      genderPreference,
      extraNotes,
    };

    updatePlayerSurvey(scheduleId, playerId, surveyData);

    const updatedSchedule = getScheduleById(scheduleId);
    if (updatedSchedule) {
      const allResponded = updatedSchedule.players.every((p) =>
        p.playerId === playerId ? true : !!p.surveyResponse
      );
      updateSchedule(scheduleId, {
        surveyStatus: allResponded ? 'completed' : 'partial',
      });
    }

    setSubmitted(true);
  };

  if (!schedule || !schedulePlayer || !player) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center p-6">
        <div className="card-dark p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-crimson-700/20 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-crimson-400" />
          </div>
          <h2 className="font-serif text-xl text-slate-100 mb-2">找不到对应信息</h2>
          <p className="text-sm text-slate-400">找不到对应的车次或玩家信息，请确认链接是否正确。</p>
        </div>
      </div>
    );
  }

  if (submitted && !existingSurvey) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center p-6">
        <div className="card-dark p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-mint-600/15 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-mint-400" />
          </div>
          <h2 className="font-serif text-2xl text-slate-100 mb-3">偏好已提交！</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            感谢你的配合，DM 会根据你的偏好分配最适合的角色～
          </p>
          <p className="text-xs text-slate-500 mt-5">你可以安全关闭此页面</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-900 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="card-dark overflow-hidden">
          <div className="relative h-48 overflow-hidden">
            <img
              src={script?.cover}
              alt={script?.name}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, transparent 20%, rgba(18,12,30,0.9) 100%)',
              }}
            />
            <div className="absolute bottom-4 left-5 right-5">
              <h1 className="font-serif text-3xl font-bold text-slate-100 mb-2">
                {script?.name || '未知剧本'}
              </h1>
              <div className="flex flex-wrap gap-1.5">
                {script?.genre.map((g) => (
                  <span key={g} className="badge badge-amber">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {existingSurvey && submitted && (
          <div className="px-1 flex items-center gap-2 text-sm text-mint-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>你已提交过问卷，可以修改后重新提交</span>
          </div>
        )}

        <div className="card-dark p-6 space-y-7">
          <div className="flex items-center gap-2 text-sm text-slate-300 mb-1">
            <Send className="w-4 h-4 text-amber-500/70" />
            <span>
              <span className="text-amber-400 font-medium">{player.name}</span>，请填写你的偏好问卷
            </span>
          </div>

          <div className="divider-gold" />

          <div>
            <h3 className="title-gold text-base mb-3">你想玩什么类型的本？</h3>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((genre) => (
                <Chip
                  key={genre}
                  label={genre}
                  selected={preferredGenres.includes(genre)}
                  color="amber"
                  onClick={() => toggleGenre(genre)}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="title-gold text-base mb-3">有没有忌讳的内容？</h3>
            <div className="flex flex-wrap gap-2">
              {TABOO_OPTIONS.map((taboo) => (
                <Chip
                  key={taboo}
                  label={taboo}
                  selected={tabooContent.includes(taboo)}
                  color="crimson"
                  onClick={() => toggleTaboo(taboo)}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="title-gold text-base mb-3">你的社交风格？</h3>
            <div className="flex gap-3">
              {SOCIAL_STYLES.map((opt) => (
                <RadioCard
                  key={opt.value}
                  selected={socialStyle === opt.value}
                  onClick={() => setSocialStyle(opt.value)}
                >
                  <div className="text-2xl mb-1">{opt.emoji}</div>
                  <div className="font-medium text-slate-200 text-sm">{opt.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                </RadioCard>
              ))}
            </div>
          </div>

          <div>
            <h3 className="title-gold text-base mb-3">你愿意带动气氛吗？</h3>
            <div className="flex gap-3">
              {LEAD_OPTIONS.map((opt) => (
                <RadioCard
                  key={String(opt.value)}
                  selected={willingToLead === opt.value}
                  onClick={() => setWillingToLead(opt.value)}
                >
                  <div className="text-sm font-medium text-slate-200">{opt.label}</div>
                </RadioCard>
              ))}
            </div>
          </div>

          <div>
            <h3 className="title-gold text-base mb-3">角色性别偏好？</h3>
            <div className="flex gap-3">
              {GENDER_OPTIONS.map((opt) => (
                <RadioCard
                  key={opt.value}
                  selected={genderPreference === opt.value}
                  onClick={() => setGenderPreference(opt.value)}
                >
                  <div className="text-sm font-medium text-slate-200">{opt.label}</div>
                </RadioCard>
              ))}
            </div>
          </div>

          <div>
            <h3 className="title-gold text-base mb-3">还有啥想说的？</h3>
            <textarea
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              placeholder="对角色、剧本、队友有什么想法都可以写～"
              rows={3}
              className="input-dark resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="btn-gold w-full py-3.5 text-base font-semibold flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          <span>提交我的偏好</span>
        </button>
      </div>
    </div>
  );
}
