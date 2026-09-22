/**
 * PROJETO ARES — Dashboard (Minimalist Overview)
 */
import { useMission } from '../../store/missionStore';
import { PartStatus } from '../../types/mission';
import {
  Cpu, ListChecks, Activity, Radio, Zap, ShieldCheck,
  AlertTriangle, TrendingUp,
} from 'lucide-react';

export default function DashboardView() {
  const { data, chatMessages, setActiveView } = useMission();

  // Stats
  const totalTasks = data.phases.reduce((s, p) => s + p.tasks.length, 0);
  const completedTasks = data.phases.reduce((s, p) => s + p.tasks.filter((t) => t.completed).length, 0);
  const pendingTasks = totalTasks - completedTasks;
  const totalBOM = data.bom.length;
  const testedBOM = data.bom.filter((i) => i.status === PartStatus.TESTED).length;
  const boughtBOM = data.bom.filter((i) => i.status === PartStatus.BOUGHT || i.status === PartStatus.TESTED).length;
  const toBuyBOM = totalBOM - boughtBOM;
  const minCost = data.bom.reduce((s, i) => s + (i.costMin || 0) * (i.qty || 1), 0);
  const maxCost = data.bom.reduce((s, i) => s + (i.costMax || i.costMin || 0) * (i.qty || 1), 0);
  const taskRatio = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const bomRatio = totalBOM > 0 ? testedBOM / totalBOM : 0;
  const overallPct = Math.min(100, Math.round((taskRatio * 0.6 + bomRatio * 0.4) * 100));

  // Upcoming tasks
  const upcomingTasks = data.phases
    .flatMap((p) => p.tasks.filter((t) => !t.completed).map((t) => ({ ...t, phaseTitle: p.title })))
    .slice(0, 5);

  // Systems status
  const systems = [
    { name: 'Chassi 4WD', status: data.bom.some((i) => i.category === 'Estrutura' && i.status === PartStatus.TESTED) ? 'nominal' : data.bom.some((i) => i.category === 'Estrutura' && i.status === PartStatus.BOUGHT) ? 'warning' : 'offline' },
    { name: 'ESP32 (Cérebro)', status: data.bom.some((i) => i.category === 'Cérebro' && i.status === PartStatus.TESTED) ? 'nominal' : 'warning' },
    { name: 'Sensores', status: data.bom.filter((i) => i.category === 'Sensores' && i.status === PartStatus.TESTED).length >= 2 ? 'nominal' : 'warning' },
    { name: 'Energia', status: data.bom.some((i) => i.category === 'Energia' && i.status === PartStatus.TESTED) ? 'nominal' : 'offline' },
    { name: 'Telemetria Wi-Fi', status: completedTasks >= totalTasks * 0.8 ? 'nominal' : 'warning' },
    { name: 'Comunicações', status: chatMessages.length > 0 ? 'nominal' : 'warning' },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Title */}
      <div className="section-header">
        <div className="section-icon"><Zap size={18} /></div>
        <div>
          <h2 className="section-title">Dashboard</h2>
          <p className="section-subtitle">Visão geral do Projeto Ares</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Progress */}
        <div className="kpi-card cyan animate-fade-in stagger-1" style={{ opacity: 0 }}>
          <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} style={{ color: 'var(--accent-blue)' }} /> Progresso Geral
          </div>
          <div className="kpi-value" style={{ marginTop: '8px' }}>{overallPct}%</div>
          <div className="progress-bar" style={{ marginTop: '16px' }}>
            <div className="progress-bar-fill" style={{ width: `${overallPct}%`, background: 'var(--accent-blue)' }} />
          </div>
        </div>

        {/* Tasks */}
        <div className="kpi-card amber animate-fade-in stagger-2" style={{ opacity: 0, cursor: 'pointer' }} onClick={() => setActiveView('phases')}>
          <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ListChecks size={14} style={{ color: 'var(--accent-amber)' }} /> Tarefas
          </div>
          <div className="kpi-value" style={{ marginTop: '8px' }}>{completedTasks}<span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>/{totalTasks}</span></div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            {pendingTasks} pendentes
          </div>
        </div>

        {/* BOM */}
        <div className="kpi-card emerald animate-fade-in stagger-3" style={{ opacity: 0, cursor: 'pointer' }} onClick={() => setActiveView('bom')}>
          <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} style={{ color: 'var(--accent-green)' }} /> Peças
          </div>
          <div className="kpi-value" style={{ marginTop: '8px' }}>{testedBOM}<span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>/{totalBOM}</span></div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            {toBuyBOM} a comprar
          </div>
        </div>

        {/* Budget */}
        <div className="kpi-card animate-fade-in stagger-4" style={{ opacity: 0 }}>
          <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            💰 Orçamento
          </div>
          <div className="kpi-value" style={{ marginTop: '8px', fontSize: '24px' }}>
            R$ {minCost === maxCost ? minCost : `${minCost}-${maxCost}`}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            estimado total
          </div>
        </div>
      </div>

      {/* Two columns: Upcoming tasks + Systems Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Upcoming Tasks */}
        <div className="card animate-fade-in stagger-5" style={{ padding: '24px', opacity: 0 }}>
          <h3 style={{
            fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <AlertTriangle size={16} style={{ color: 'var(--accent-amber)' }} /> Próximas Tarefas
          </h3>
          {upcomingTasks.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Todas as tarefas concluídas!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingTasks.map((task) => (
                <div key={task.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '12px', borderRadius: '6px',
                  background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: 'var(--accent-amber)', marginTop: '6px', flexShrink: 0,
                  }} />
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{task.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {task.phaseTitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Systems Status */}
        <div className="card animate-fade-in stagger-6" style={{ padding: '24px', opacity: 0 }}>
          <h3 style={{
            fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <ShieldCheck size={16} style={{ color: 'var(--accent-blue)' }} /> Status dos Sistemas
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {systems.map((sys) => (
              <div key={sys.name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: '6px',
                background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)',
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{sys.name}</span>
                <span className={`status-badge ${sys.status === 'nominal' ? 'status-nominal' : sys.status === 'warning' ? 'status-warning' : 'status-critical'}`}>
                  {sys.status === 'nominal' ? 'Online' : sys.status === 'warning' ? 'Standby' : 'Offline'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 768px) { div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
