import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { useAuth } from './lib/auth';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { ApplicationsScreen } from './components/applications/ApplicationsScreen';
import { ApplicationDetail } from './components/detail/ApplicationDetail';
import { Referrals } from './components/referrals/Referrals';
import { CompensationScreen } from './components/compensation/CompensationScreen';
import { CommandPalette } from './components/common/CommandPalette';
import { RoleBanner } from './components/common/RoleBanner';
import { LoginScreen } from './components/auth/LoginScreen';

export default function App() {
  const { view, selectedAppId, commandPaletteOpen, setCommandPaletteOpen, darkMode, fetchAll, loading } = useStore();
  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    if (session) fetchAll();
  }, [session]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar />
      <main className="pl-14">
        <RoleBanner />
        <div className="max-w-7xl mx-auto px-6 py-6">
          {loading && view === 'dashboard' ? (
            <div className={`text-center py-24 text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              Loading...
            </div>
          ) : (
            <>
              {view === 'dashboard' && <Dashboard />}
              {view === 'applications' && <ApplicationsScreen />}
              {view === 'detail' && selectedAppId && <ApplicationDetail appId={selectedAppId} />}
              {view === 'referrals' && <Referrals />}
              {view === 'compensation' && <CompensationScreen />}
            </>
          )}
        </div>
      </main>
      {commandPaletteOpen && <CommandPalette />}
    </div>
  );
}
