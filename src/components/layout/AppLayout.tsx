import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-ink-900">
      <Sidebar />
      <Header />
      <main className="ml-[248px] mt-16 p-6 min-h-[calc(100vh-64px)]">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
