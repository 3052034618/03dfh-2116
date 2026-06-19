import { cn } from '@/lib/utils';

const difficultyLabels = ['入门', '简单', '中等', '困难', '烧脑'];

interface DifficultyStarsProps {
  level: number;
  showLabel?: boolean;
}

export default function DifficultyStars({ level, showLabel = false }: DifficultyStarsProps) {
  const safeLevel = Math.max(1, Math.min(5, level));
  const label = difficultyLabels[safeLevel - 1];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-all duration-200',
              i < safeLevel
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(212,168,75,0.6)]'
                : 'bg-ink-600'
            )}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-slate-400">
          难度：<span className="text-amber-400">{label}</span>
        </span>
      )}
    </div>
  );
}
