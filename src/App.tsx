import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import DashboardPage from '@/pages/DashboardPage';
import HistoryPage from '@/pages/HistoryPage';
import PlayersPage from '@/pages/PlayersPage';
import NotFoundPage from '@/pages/NotFoundPage';

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20">
      <div className="text-center max-w-md px-6">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <svg className="w-12 h-12 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl font-bold text-gradient-gold mb-2">{title}</h2>
        <p className="text-slate-400 mb-8 text-sm">此页面正在筹备中，敬请期待...</p>
        <Link to="/dashboard" className="btn-gold inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回控制台
        </Link>
      </div>
    </div>
  );
}

function ScriptListPage() { return <ComingSoon title="剧本库列表" />; }
function ScriptEditPage() { return <ComingSoon title="剧本编辑" />; }
function ScheduleListPage() { return <ComingSoon title="排班列表" />; }
function ScheduleDetailPage() { return <ComingSoon title="车次详情" />; }
function AssignmentPage() { return <ComingSoon title="智能分角" />; }
function ReviewPage() { return <ComingSoon title="分角复盘" />; }

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/scripts" element={<ScriptListPage />} />
          <Route path="/scripts/:id/edit" element={<ScriptEditPage />} />
          <Route path="/schedules" element={<ScheduleListPage />} />
          <Route path="/schedules/:id" element={<ScheduleDetailPage />} />
          <Route path="/schedules/:id/assign" element={<AssignmentPage />} />
          <Route path="/schedules/:id/review" element={<ReviewPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
