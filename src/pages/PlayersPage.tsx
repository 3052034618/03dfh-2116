import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Star,
  Eye,
  User,
  Users,
  Sparkles,
  Award,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { usePlayerStore, useScriptStore } from '@/stores';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import RoleAvatar from '@/components/ui/RoleAvatar';
import Modal from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import type { PlayerProfile } from '@/types';

type GenderFilter = 'all' | 'male' | 'female';
type GamesFilter = 'all' | 'new' | 'regular' | 'veteran';

const genreBarKeys = ['emotion', 'deduction', 'horror', 'joy', 'camp'];
const genreBarLabels: Record<string, string> = {
  emotion: '情感',
  deduction: '硬核',
  horror: '恐怖',
  joy: '欢乐',
  camp: '阵营',
};
const genreBarColors: Record<string, string> = {
  emotion: 'from-crimson-500 to-crimson-300',
  deduction: 'from-royal-500 to-royal-300',
  horror: 'from-slate-600 to-slate-400',
  joy: 'from-sunset-500 to-sunset-300',
  camp: 'from-mint-500 to-mint-300',
};

const expertTagPool: Record<string, { chips: string[]; color: string }> = {
  emotion: { chips: ['水龙头', '共情力强', '哭哭包'], color: 'crimson' },
  deduction: { chips: ['推土机', '菠萝头', '逻辑怪'], color: 'royal' },
  horror: { chips: ['坦王', '毒奶', '尖叫机'], color: 'ink' },
  joy: { chips: ['气氛组', '沙雕', '搞笑担当'], color: 'sunset' },
  camp: { chips: ['老骗子', '摇摆位', '控场王'], color: 'mint' },
};

export default function PlayersPage() {
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
  const [gamesFilter, setGamesFilter] = useState<GamesFilter>('all');
  const [minRating, setMinRating] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [detailPlayer, setDetailPlayer] = useState<PlayerProfile | null>(null);

  const players = usePlayerStore((s) => s.players);
  const searchPlayers = usePlayerStore((s) => s.searchPlayers);
  const getScriptById = useScriptStore((s) => s.getScriptById);

  const filteredPlayers = useMemo(() => {
    let list = search ? searchPlayers(search) : players;
    if (genderFilter !== 'all') {
      list = list.filter((p) => p.gender === genderFilter);
    }
    if (gamesFilter === 'new') list = list.filter((p) => p.totalGames < 5);
    if (gamesFilter === 'regular') list = list.filter((p) => p.totalGames >= 5 && p.totalGames < 20);
    if (gamesFilter === 'veteran') list = list.filter((p) => p.totalGames >= 20);
    if (minRating > 0) list = list.filter((p) => p.averageSatisfaction >= minRating);
    return list;
  }, [players, search, genderFilter, gamesFilter, minRating, searchPlayers]);

  function getExpertChips(player: PlayerProfile): { tag: string; color: string }[] {
    const entries = Object.entries(player.tagWeights)
      .filter(([k]) => genreBarKeys.includes(k))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);
    const result: { tag: string; color: string }[] = [];
    entries.forEach(([key]) => {
      const info = expertTagPool[key];
      if (info && player.tagWeights[key] >= 70) {
        const chip = info.chips[Math.floor(Math.random() * info.chips.length)];
        if (!result.find((r) => r.tag === chip)) {
          result.push({ tag: chip, color: info.color });
        }
      }
    });
    return result.slice(0, 3);
  }

  function getGenreWeights(player: PlayerProfile): { key: string; label: string; weight: number; color: string }[] {
    return genreBarKeys.map((k) => ({
      key: k,
      label: genreBarLabels[k] || k,
      weight: player.tagWeights[k] || Math.floor(30 + Math.random() * 50),
      color: genreBarColors[k] || 'from-amber-500 to-amber-300',
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gradient-gold">玩家管理</h1>
          <p className="text-sm text-slate-400 mt-1">共 <span className="text-amber-300 font-medium">{filteredPlayers.length}</span> 位玩家档案</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-gold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新增玩家
        </button>
      </div>

      <div className="card-dark p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="搜索姓名 / 手机号"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-dark pl-9"
            />
          </div>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as GenderFilter)}
            className="input-dark text-sm"
          >
            <option value="all">全部性别</option>
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
          <select
            value={gamesFilter}
            onChange={(e) => setGamesFilter(e.target.value as GamesFilter)}
            className="input-dark text-sm"
          >
            <option value="all">全部场次</option>
            <option value="new">新人（{'<'}5场）</option>
            <option value="regular">常客（5-20场）</option>
            <option value="veteran">资深（≥20场）</option>
          </select>
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="input-dark text-sm"
          >
            <option value={0}>全部评分</option>
            <option value={4}>≥ 4.0 分</option>
            <option value={4.5}>≥ 4.5 分</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {filteredPlayers.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 card-dark">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无符合条件的玩家</p>
          </div>
        ) : (
          filteredPlayers.map((player) => {
            const expertChips = getExpertChips(player);
            const genres = getGenreWeights(player);
            const isOld = player.totalGames >= 10;
            const recentGames = player.pastAssignments.slice(0, 3);
            return (
              <div
                key={player.id}
                className="card-dark card-hover p-5 flex flex-col gap-4"
              >
                <div className="flex items-center gap-4">
                  <RoleAvatar name={player.name} avatar={player.avatar} gender={player.gender} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-semibold text-lg text-amber-200 truncate">
                      {player.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <Badge variant={player.gender === 'male' ? 'royal' : 'crimson'}>
                        {player.gender === 'male' ? '♂ 男' : '♀ 女'}
                      </Badge>
                      <Badge variant="ink">
                        <Award className="w-3 h-3 mr-1" />
                        {player.totalGames} 场
                      </Badge>
                      {isOld && (
                        <Badge variant="amber">老客</Badge>
                      )}
                      <span className="flex items-center gap-1 text-xs text-amber-300">
                        <Star className="w-3 h-3 fill-current" />
                        {player.averageSatisfaction.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> 题材偏好
                  </p>
                  <div className="space-y-1.5">
                    {genres.map((g) => (
                      <div key={g.key} className="flex items-center gap-2">
                        <span className="w-8 text-xs text-slate-400 shrink-0">{g.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-ink-700/60 overflow-hidden">
                          <div
                            className={cn('h-full rounded-full bg-gradient-to-r', g.color)}
                            style={{ width: `${Math.min(100, g.weight)}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs font-mono text-slate-500 shrink-0">{g.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {expertChips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {expertChips.map((c) => (
                      <Badge key={c.tag} variant={c.color as any}>
                        {c.tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div>
                  <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> 最近 {recentGames.length || 3} 场
                  </p>
                  <div className="flex items-center gap-2">
                    {recentGames.length > 0 ? recentGames.map((pa, i) => {
                      const sc = getScriptById(pa.scriptId);
                      return (
                        <div key={i} className="relative group">
                          <div className="w-12 h-12 rounded-md overflow-hidden border border-ink-500/50 shrink-0">
                            {sc?.cover ? (
                              <img src={sc.cover} alt={sc.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-ink-700" />
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-ink-800 border border-ink-600 flex items-center justify-center">
                            <Star className={cn('w-3 h-3', pa.satisfactionScore >= 4 ? 'text-amber-400 fill-current' : 'text-slate-500')} fill={pa.satisfactionScore >= 4 ? 'currentColor' : 'none'} />
                          </div>
                        </div>
                      );
                    }) : Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="w-12 h-12 rounded-md bg-ink-700/40 border border-ink-600/30 flex items-center justify-center text-xs text-slate-600">
                        -
                      </div>
                    ))}
                  </div>
                </div>

                <div className="divider-gold -mx-5" />

                <button
                  onClick={() => setDetailPlayer(player)}
                  className="btn-ghost py-2 text-sm flex items-center justify-center gap-2 w-full"
                >
                  <Eye className="w-4 h-4" />
                  查看详情
                </button>
              </div>
            );
          })
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="新增玩家档案" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">姓名</label>
              <input className="input-dark text-sm" placeholder="请输入姓名" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">手机号</label>
              <input className="input-dark text-sm" placeholder="请输入手机号" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">性别</label>
              <select className="input-dark text-sm">
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">头像（可选）</label>
              <input className="input-dark text-sm" placeholder="头像 URL" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">擅长标签（回车添加）</label>
            <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg bg-ink-900/60 border border-ink-500/50 min-h-[44px]">
              <input className="bg-transparent outline-none text-sm text-slate-200 flex-1 min-w-[100px]" placeholder="输入标签名..." />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            * 系统会根据后续的分角复盘自动完善该玩家的偏好画像与标签权重
          </p>
        </div>
        <footer className="flex items-center justify-end gap-3 pt-4">
          <button onClick={() => setAddOpen(false)} className="btn-ghost text-sm">取消</button>
          <button onClick={() => setAddOpen(false)} className="btn-gold text-sm">创建档案</button>
        </footer>
      </Modal>

      <Modal open={!!detailPlayer} onClose={() => setDetailPlayer(null)} title="玩家档案详情" size="xl">
        {detailPlayer && (
          <div className="space-y-5">
            <div className="flex items-start gap-5 p-5 rounded-xl bg-ink-700/40 border border-ink-600/50">
              <RoleAvatar name={detailPlayer.name} avatar={detailPlayer.avatar} gender={detailPlayer.gender} size="xl" />
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-2xl font-bold text-amber-200">{detailPlayer.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant={detailPlayer.gender === 'male' ? 'royal' : 'crimson'}>
                    {detailPlayer.gender === 'male' ? '男' : '女'}
                  </Badge>
                  <Badge variant="ink">{detailPlayer.phone}</Badge>
                  <Badge variant="amber">
                    <Award className="w-3 h-3 mr-1" />
                    {detailPlayer.totalGames} 场
                  </Badge>
                  {detailPlayer.totalGames >= 10 && <Badge variant="sunset">✨ 老客</Badge>}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-sm text-slate-400">平均满意度：</span>
                  <StarRating value={detailPlayer.averageSatisfaction} readOnly />
                  <span className="text-amber-300 font-mono font-bold">{detailPlayer.averageSatisfaction.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="title-gold text-base mb-3">题材偏好画像</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-xl bg-ink-700/30 border border-ink-600/40">
                {getGenreWeights(detailPlayer).map((g) => (
                  <div key={g.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{g.label}</span>
                      <span className="font-mono text-amber-300">{g.weight}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-ink-700/60 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full bg-gradient-to-r', g.color)}
                        style={{ width: `${Math.min(100, g.weight)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {getExpertChips(detailPlayer).length > 0 && (
              <div>
                <h4 className="title-gold text-base mb-3">擅长标签</h4>
                <div className="flex flex-wrap gap-2">
                  {getExpertChips(detailPlayer).map((c) => (
                    <Badge key={c.tag} variant={c.color as any} className="px-3 py-1.5 text-sm">
                      {c.tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {detailPlayer.pastAssignments.length > 0 && (
              <div>
                <h4 className="title-gold text-base mb-3">分角历史（共 {detailPlayer.pastAssignments.length} 场）</h4>
                <div className="space-y-2">
                  {detailPlayer.pastAssignments.map((pa, i) => {
                    const sc = getScriptById(pa.scriptId);
                    return (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-ink-800/50 border border-ink-600/40 hover:border-amber-500/30 transition-all">
                        <div className="w-14 h-14 rounded-md overflow-hidden shrink-0 border border-ink-500/50">
                          {sc?.cover && <img src={sc.cover} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-serif font-semibold text-amber-200">{pa.scriptName}</p>
                            <span className="text-xs text-slate-500">{pa.date}</span>
                          </div>
                          <p className="text-sm text-slate-400 mt-0.5">
                            饰演角色：<span className="text-amber-300">{pa.roleName}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating value={pa.satisfactionScore} readOnly size="sm" />
                            <div className="flex gap-1 flex-wrap">
                              {pa.experienceTags.map((t) => (
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
            )}
          </div>
        )}
        <footer className="flex items-center justify-end gap-3 pt-4">
          <button onClick={() => setDetailPlayer(null)} className="btn-ghost text-sm">关闭</button>
        </footer>
      </Modal>
    </div>
  );
}
