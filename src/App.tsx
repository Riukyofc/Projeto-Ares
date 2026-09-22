/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider, AuthGuard } from './lib/auth';
import { MissionProvider, useMission } from './store/missionStore';
import LoginPage from './components/auth/LoginPage';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ToastContainer from './components/ui/Toast';
import DashboardView from './components/dashboard/DashboardView';
import BOMView from './components/bom/BOMView';
import PhasesView from './components/phases/PhasesView';
import TelemetryView from './components/telemetry/TelemetryView';
import ChatView from './components/chat/ChatView';
import DocsView from './components/docs/DocsView';
import AresAIView from './components/ai/AresAIView';

function AppContent() {
  const { activeView, loading } = useMission();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', width: '100vw', background: 'var(--bg-base)',
        flexDirection: 'column', gap: '16px',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          border: '2px solid var(--border-strong)',
          borderTopColor: 'var(--text-primary)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'bom':
        return <BOMView />;
      case 'phases':
        return <PhasesView />;
      case 'telemetry':
        return <TelemetryView />;
      case 'chat':
        return <ChatView />;
      case 'docs':
        return <DocsView />;
      case 'ai':
        return <AresAIView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Header />
        <div className="app-content">
          {renderView()}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGuard fallback={<LoginPage />}>
        <MissionProvider>
          <AppContent />
        </MissionProvider>
      </AuthGuard>
    </AuthProvider>
  );
}
