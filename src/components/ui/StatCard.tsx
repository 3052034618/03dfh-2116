import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  accentColor?: 'gold' | 'mint' | 'royal' | 'crimson' | 'sunset';
}

const accentColors: Record<NonNullable<StatCardProps['accentColor']>, string> = {
  gold: 'rgba(212, 168, 75, 0.18)',
  mint: 'rgba(76, 184, 110, 0.18)',
  royal: 'rgba(107, 70, 193, 0.22)',
  crimson: 'rgba(201, 58, 78, 0.2)',
  sunset: 'rgba(232, 135, 58, 0.2)',
};

const iconBorderColors: Record<NonNullable<StatCardProps['accentColor']>, string> = {
  gold: 'rgba(212, 168, 75, 0.35)',
  mint: 'rgba(76, 184, 110, 0.35)',
  royal: 'rgba(107, 70, 193, 0.4)',
  crimson: 'rgba(201, 58, 78, 0.4)',
  sunset: 'rgba(232, 135, 58, 0.35)',
};

const iconColors: Record<NonNullable<StatCardProps['accentColor']>, string> = {
  gold: 'text-amber-400',
  mint: 'text-mint-300',
  royal: 'text-royal-100',
  crimson: 'text-crimson-300',
  sunset: 'text-sunset-300',
};

export default function StatCard({
  icon,
  title,
  value,
  subValue,
  trend,
  trendValue,
  accentColor = 'gold',
}: StatCardProps) {
  return (
    <div className="card-dark card-hover p-5 grain-overlay">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
            iconColors[accentColor]
          )}
          style={{
            background: accentColors[accentColor],
            border: `1px solid ${iconBorderColors[accentColor]}`,
            boxShadow: `0 0 24px ${accentColors[accentColor]}`,
          }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-400 font-medium">{title}</p>
          <p className="text-2xl font-serif font-bold mt-1 text-gradient-gold">
            {value}
          </p>
          {(subValue || trend) && (
            <div className="flex items-center gap-2 mt-2">
              {trend && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 text-xs font-medium',
                    trend === 'up' && 'text-mint-300',
                    trend === 'down' && 'text-crimson-300',
                    trend === 'flat' && 'text-slate-400'
                  )}
                >
                  {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                  {trend === 'down' && <TrendingDown className="w-3 h-3" />}
                  {trend === 'flat' && <Minus className="w-3 h-3" />}
                  {trendValue}
                </span>
              )}
              {subValue && (
                <span className="text-xs text-slate-500">{subValue}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
