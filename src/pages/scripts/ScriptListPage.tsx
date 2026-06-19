import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
} from 'lucide-react';
import { useScriptStore } from '@/stores/scriptStore';
import DifficultyStars from '@/components/ui/DifficultyStars';
import { cn } from '@/lib/utils';
import { getGenreBadgeClass } from '@/utils/assignmentEngine';
import type { Script } from '@/types';

const GENRE_OPTIONS = [
  '情感',
  '硬核',
  '欢乐',
  '恐怖',
  '阵营',
  '本格',
  '变格',
  '还原',
  '机制',
  '古风',
  '现代',
  '民国',
  '科幻',
  '校园',
];

const PLAYER_COUNT_OPTIONS = [
  { label: '不限', value: undefined },
  { label: '2人', value: 2 },
  { label: '3人', value: 3 },
  { label: '4人', value: 4 },
  { label: '5人', value: 5 },
  { label: '6人', value: 6 },
  { label: '7人', value: 7 },
  { label: '8人+', value: 8 },
];

const DIFFICULTY_OPTIONS = [
  { label: '不限', value: undefined },
  { label: '1星', value: 1 },
  { label: '2星', value: 2 },
  { label: '3星', value: 3 },
  { label: '4星', value: 4 },
  { label: '5星', value: 5 },
];

const DURATION_OPTIONS = [
  { label: '不限', value: undefined },
  { label: '<3小时', value: 'short' },
  { label: '3-5小时', value: 'medium' },
  { label: '>5小时', value: 'long' },
] as const;

const ITEMS_PER_PAGE = 8;

function GenreChip({
  genre,
  selected,
  onClick,
}: {
  genre: string;
  selected: boolean;
  onClick: () => void;
}) {
  const badgeClass = getGenreBadgeClass(genre);
  const baseClass =
    'inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 border';
  return (
    <span
      onClick={onClick}
      className={cn(
        baseClass,
        selected
          ? badgeClass + ' ring-2 ring-amber-400/50 scale-105'
          : 'bg-ink-800/60 text-slate-400 border-ink-600/40 hover:border-amber-500/40 hover:text-amber-300'
      )}
    >
      {genre}
    </span>
  );
}

function ScriptCard({
  script,
  onClick,
  onEditClick,
  onViewRolesClick,
}: {
  script: Script;
  onClick: () => void;
  onEditClick: () => void;
  onViewRolesClick: () => void;
}) {
  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h${m}m` : `${h}h`;
  };

  return (
    <div
      className="card-dark card-hover grain-overlay group cursor-pointer overflow-hidden flex flex-col"
      onClick={onClick}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
        <img
          src={script.cover}
          alt={script.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/20 to-transparent" />
        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 max-w-[70%] justify-end">
          {script.genre.slice(0, 3).map((g) => (
            <span
              key={g}
              className={cn(
                'badge text-[10px] px-2 py-0.5',
                getGenreBadgeClass(g)
              )}
            >
              {g}
            </span>
          ))}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-3">
        <h3 className="font-serif text-xl text-gradient-gold line-clamp-1">
          {script.name}
        </h3>

        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-500/70" />
            <span>{script.playerCount}人</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500/70" />
            <span>{formatDuration(script.duration)}</span>
          </div>
          <DifficultyStars level={script.difficulty} />
        </div>

        <div className="flex items-center gap-2">
          <span className="badge badge-royal text-[11px]">
            {script.roles.length} 个角色
          </span>
        </div>

        <p className="text-sm text-slate-500 line-clamp-2 flex-1">
          {script.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-ink-700/40">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditClick();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all duration-200"
          >
            <Edit3 className="w-3.5 h-3.5" />
            编辑角色
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewRolesClick();
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-ink-700/50 transition-all duration-200"
            title="查看角色"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScriptListPage() {
  const navigate = useNavigate();
  const { scripts } = useScriptStore();

  const [searchName, setSearchName] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [playerCountFilter, setPlayerCountFilter] = useState<
    number | undefined
  >(undefined);
  const [difficultyFilter, setDifficultyFilter] = useState<
    number | undefined
  >(undefined);
  const [durationFilter, setDurationFilter] = useState<
    string | undefined
  >(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredScripts = useMemo(() => {
    return scripts.filter((script) => {
      if (
        searchName &&
        !script.name.toLowerCase().includes(searchName.toLowerCase().trim())
      ) {
        return false;
      }
      if (
        selectedGenres.length > 0 &&
        !selectedGenres.some((g) => script.genre.includes(g))
      ) {
        return false;
      }
      if (playerCountFilter !== undefined) {
        if (playerCountFilter === 8) {
          if (script.playerCount < 8) return false;
        } else if (script.playerCount !== playerCountFilter) {
          return false;
        }
      }
      if (
        difficultyFilter !== undefined &&
        script.difficulty !== difficultyFilter
      ) {
        return false;
      }
      if (durationFilter) {
        if (durationFilter === 'short' && script.duration >= 180) return false;
        if (
          durationFilter === 'medium' &&
          (script.duration < 180 || script.duration > 300)
        )
          return false;
        if (durationFilter === 'long' && script.duration <= 300) return false;
      }
      return true;
    });
  }, [
    scripts,
    searchName,
    selectedGenres,
    playerCountFilter,
    difficultyFilter,
    durationFilter,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredScripts.length / ITEMS_PER_PAGE));
  const paginatedScripts = filteredScripts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="card-dark grain-overlay p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <h1 className="title-gold text-2xl mb-1">剧本角色库</h1>
            <p className="text-sm text-slate-500">
              共 <span className="text-amber-400 font-medium">{filteredScripts.length}</span> 个剧本
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="按名称搜索..."
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-dark pl-10 pr-4 w-full sm:w-64"
              />
            </div>
            <button
              onClick={() => {}}
              className="btn-gold flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新增剧本
            </button>
          </div>
        </div>

        <div className="divider-gold my-5" />

        <div className="space-y-4">
          <div>
            <div className="text-xs text-slate-500 mb-2 font-medium">
              题材筛选
            </div>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((genre) => (
                <GenreChip
                  key={genre}
                  genre={genre}
                  selected={selectedGenres.includes(genre)}
                  onClick={() => toggleGenre(genre)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <div className="text-xs text-slate-500 mb-1.5 font-medium">
                玩家人数
              </div>
              <select
                value={playerCountFilter ?? ''}
                onChange={(e) => {
                  setPlayerCountFilter(
                    e.target.value ? Number(e.target.value) : undefined
                  );
                  setCurrentPage(1);
                }}
                className="input-dark w-36 text-sm"
              >
                {PLAYER_COUNT_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.value ?? ''}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1.5 font-medium">
                整体难度
              </div>
              <select
                value={difficultyFilter ?? ''}
                onChange={(e) => {
                  setDifficultyFilter(
                    e.target.value ? Number(e.target.value) : undefined
                  );
                  setCurrentPage(1);
                }}
                className="input-dark w-36 text-sm"
              >
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.value ?? ''}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1.5 font-medium">
                剧本时长
              </div>
              <select
                value={durationFilter ?? ''}
                onChange={(e) => {
                  setDurationFilter(e.target.value || undefined);
                  setCurrentPage(1);
                }}
                className="input-dark w-36 text-sm"
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.value ?? ''}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {(selectedGenres.length > 0 ||
              playerCountFilter !== undefined ||
              difficultyFilter !== undefined ||
              durationFilter !== undefined ||
              searchName) && (
              <button
                onClick={() => {
                  setSelectedGenres([]);
                  setPlayerCountFilter(undefined);
                  setDifficultyFilter(undefined);
                  setDurationFilter(undefined);
                  setSearchName('');
                  setCurrentPage(1);
                }}
                className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
              >
                清除所有筛选
              </button>
            )}
          </div>
        </div>
      </div>

      {paginatedScripts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedScripts.map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              onClick={() => navigate(`/scripts/${script.id}/edit`)}
              onEditClick={() => navigate(`/scripts/${script.id}/edit`)}
              onViewRolesClick={() => navigate(`/scripts/${script.id}/edit`)}
            />
          ))}
        </div>
      ) : (
        <div className="card-dark grain-overlay p-16 text-center">
          <div className="text-slate-500 mb-2">暂无符合条件的剧本</div>
          <div className="text-xs text-slate-600">尝试调整筛选条件或新增剧本</div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200',
              currentPage === 1
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:text-amber-400 hover:bg-ink-700/50'
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={cn(
                  'w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200',
                  page === currentPage
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-glow'
                    : 'text-slate-400 hover:text-amber-400 hover:bg-ink-700/50'
                )}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200',
              currentPage === totalPages
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:text-amber-400 hover:bg-ink-700/50'
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
