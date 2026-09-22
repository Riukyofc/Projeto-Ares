/**
 * PROJETO ARES — Minimalist Sidebar Navigation
 */
import { useAuth } from '../../lib/auth';
import { useMission } from '../../store/missionStore';
import type { ViewId } from '../../types/mission';
import aresLogo from '../../assets/logo.png';
import {
  LayoutDashboard, Cpu, ListChecks, Activity,
  Radio, BookOpen, Bot, LogOut, ChevronLeft, ChevronRight, Menu,
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS: { id: ViewId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'bom', label: 'Peças (BOM)', icon: Cpu },
  { id: 'phases', label: 'Cronograma', icon: ListChecks },
  { id: 'telemetry', label: 'Telemetria', icon: Activity },
  { id: 'chat', label: 'Comunicações', icon: Radio },
  { id: 'docs', label: 'Documentação', icon: BookOpen },
  { id: 'ai', label: 'ARES AI', icon: Bot },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const { activeView, setActiveView, data, chatMessages } = useMission();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Mission progress
  const totalTasks = data.phases.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = data.phases.reduce((sum, p) => sum + p.tasks.filter((t) => t.completed).length, 0);
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="btn-ghost"
        style={{
          position: 'fixed', top: 12, left: 12, zIndex: 51,
          display: 'none', padding: '8px', borderRadius: '6px',
          background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
        }}
        id="mobile-menu-btn"
      >
        <Menu size={18} />
      </button>
      <style>{`@media (max-width: 768px) { #mobile-menu-btn { display: flex !important; } }`}</style>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay visible" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo & Title */}
        <div style={{
          padding: '24px 20px',
          display: 'flex', alignItems: 'center', gap: '12px',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <img 
            src={aresLogo} 
            alt="Ares Logo" 
            style={{ width: '28px', height: '28px', flexShrink: 0, objectFit: 'contain' }} 
          />
          {!collapsed && (
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 600,
              fontSize: '14px', color: 'var(--text-primary)', letterSpacing: '-0.02em',
            }}>
              Ares <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Mission Control</span>
            </div>
          )}
        </div>

        {/* User Profile */}
        {user && (
          <div style={{
            padding: collapsed ? '0 12px 16px' : '0 20px 16px',
            display: 'flex', alignItems: 'center', gap: '12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}>
            <img
              src={user.photoURL || ''}
              alt=""
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                border: '1px solid var(--border-subtle)', flexShrink: 0,
              }}
              referrerPolicy="no-referrer"
            />
            {!collapsed && (
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div className="truncate" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {user.displayName || 'Tripulante'}
                </div>
                <div className="truncate" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {user.email}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setMobileOpen(false);
                }}
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={{
                  width: '100%',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '10px' : undefined,
                  background: 'none',
                  cursor: 'pointer',
                }}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="nav-icon" />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.id === 'chat' && chatMessages.length > 0 && (
                  <span className="nav-badge">{chatMessages.length}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mission Progress */}
        <div style={{ padding: '20px' }}>
          {!collapsed && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '8px',
            }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Progresso Geral
              </span>
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                {progressPct}%
              </span>
            </div>
          )}
          <div className="progress-bar" style={{ height: '4px' }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{
          padding: '16px 20px', borderTop: '1px solid var(--border-subtle)',
          display: 'flex', gap: '8px',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}>
          {!collapsed && (
            <button
              onClick={signOut}
              className="btn btn-ghost"
              style={{ fontSize: '12px', padding: '6px 12px', gap: '6px', flex: 1, justifyContent: 'center' }}
            >
              <LogOut size={14} />
              Sign Out
            </button>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="btn btn-ghost"
            style={{ padding: '6px 10px' }}
            title="Toggle Sidebar"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>
    </>
  );
}
