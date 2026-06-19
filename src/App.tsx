import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import DashboardPage from '@/pages/DashboardPage';
import HistoryPage from '@/pages/HistoryPage';
import PlayersPage from '@/pages/PlayersPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ScriptListPage from '@/pages/scripts/ScriptListPage';
import ScriptEditPage from '@/pages/scripts/ScriptEditPage';
import ScheduleListPage from '@/pages/schedules/ScheduleListPage';
import ScheduleDetailPage from '@/pages/schedules/ScheduleDetailPage';
import AssignmentPage from '@/pages/assignments/AssignmentPage';
import ReviewPage from '@/pages/assignments/ReviewPage';
import SurveyFillPage from '@/pages/survey/SurveyFillPage';

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
        </Route>
        <Route path="/survey/:scheduleId/:playerId" element={<SurveyFillPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
