import { SearchX, ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20">
      <div className="text-center max-w-md px-6">
        <div className="relative w-40 h-40 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/10 to-transparent animate-pulse-slow" />
          <div className="absolute inset-6 rounded-full border border-amber-500/30" />
          <div className="absolute inset-12 rounded-full border border-amber-500/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <Compass className="w-24 h-24 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <SearchX className="w-10 h-10 text-crimson-400" />
              </div>
            </div>
          </div>
        </div>

        <h1 className="font-serif text-5xl font-bold text-gradient-gold mb-3">
          404
        </h1>
        <h2 className="font-serif text-2xl font-semibold text-amber-200 mb-4">
          此线索似乎消失在迷雾中...
        </h2>
        <p className="text-slate-400 mb-2 text-sm leading-relaxed">
          你寻找的页面可能已被转移、删除，
          <br />
          或从未存在于这个时空之中。
        </p>

        <div className="mt-2 mb-6 flex items-center justify-center gap-1 text-xs text-slate-500 opacity-60">
          <span className="font-mono">//</span>
          <span>线索追踪失败</span>
          <span className="font-mono">//</span>
        </div>

        <div className="divider-gold w-40 mx-auto mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/dashboard" className="btn-gold flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回控制台
          </Link>
          <Link to="/" className="btn-ghost flex items-center justify-center gap-2">
            <Compass className="w-4 h-4" />
            回到首页
          </Link>
        </div>

        <div className="mt-12 text-xs text-slate-600 space-y-1">
          <p className="font-serif italic text-slate-500">
            「有些真相，注定只能在记忆中追寻...」
          </p>
        </div>
      </div>
    </div>
  );
}
