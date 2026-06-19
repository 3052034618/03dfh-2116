import { Inbox } from 'lucide-react';

interface EmptyProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function Empty({
  icon,
  title,
  description,
  action,
}: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 relative"
        style={{
          background: 'linear-gradient(135deg, rgba(75, 46, 122, 0.25), rgba(212, 168, 75, 0.08))',
          border: '1px solid rgba(110, 94, 138, 0.3)',
        }}
      >
        <div
          className="absolute inset-0 rounded-3xl opacity-40"
          style={{
            background: 'radial-gradient(circle at center, rgba(212,168,75,0.15), transparent 70%)',
          }}
        />
        <div className="relative text-slate-500">
          {icon || <Inbox className="w-10 h-10" />}
        </div>
      </div>

      <h3 className="text-lg font-serif font-semibold text-slate-300 mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}
