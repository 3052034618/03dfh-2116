import { cn } from '@/lib/utils';

type BadgeVariant = 'royal' | 'amber' | 'mint' | 'crimson' | 'sunset' | 'ink';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  royal: 'badge-royal',
  amber: 'badge-amber',
  mint: 'badge-mint',
  crimson: 'badge-crimson',
  sunset: 'badge-sunset',
  ink: 'badge-ink',
};

export default function Badge({ variant = 'ink', children, className }: BadgeProps) {
  return (
    <span className={cn('badge', variantClasses[variant], className)}>
      {children}
    </span>
  );
}
