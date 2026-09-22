/**
 * PROJETO ARES — Mission Control Header
 */
import { useMission } from '../../store/missionStore';
import { PartStatus } from '../../types/mission';
import { Download } from 'lucide-react';

export default function Header() {
  const { data, addToast } = useMission();

  // Stats
  const totalTasks = data.phases.reduce((s, p) => s + p.tasks.length, 0);
  const completedTasks = data.phases.reduce((s, p) => s + p.tasks.filter((t) => t.completed).length, 0);
  const totalBOM = data.bom.length;
  const testedBOM = data.bom.filter((i) => i.status === PartStatus.TESTED).length;
  const minCost = data.bom.reduce((s, i) => s + (i.costMin || 0) * (i.qty || 1), 0);
  const maxCost = data.bom.reduce((s, i) => s + (i.costMax || i.costMin || 0) * (i.qty || 1), 0);
  const taskRatio = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const bomRatio = totalBOM > 0 ? testedBOM / totalBOM : 0;
  const overallPct = Math.min(100, Math.round((taskRatio * 0.6 + bomRatio * 0.4) * 100));

  const exportMission = () => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `projeto-ares-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast('Missão exportada com sucesso!', 'success');
    } catch { addToast('Erro ao exportar.', 'error'); }
  };

  return (
    <header className="app-header">
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '16px', flexWrap: 'wrap',
      }}>
        {/* Progress section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minWidth: '200px' }}>
          <div style={{ flex: 1, maxWidth: '360px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '6px',
            }}>
              <span style={{
                fontSize: '11px', fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                color: 'var(--text-muted)',
              }}>
                Progresso Geral
              </span>
              <span style={{
                fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
              }}>
                {overallPct}%
              </span>
            </div>
            <div className="progress-bar" style={{ height: '6px' }}>
              <div className="progress-bar-fill" style={{ width: `${overallPct}%`, background: 'var(--text-primary)' }} />
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          fontSize: '13px', color: 'var(--text-muted)',
        }}>
          <span>Tarefas: <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{completedTasks}/{totalTasks}</strong></span>
          <span style={{ color: 'var(--border-strong)' }}>|</span>
          <span>Testadas: <strong style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{testedBOM}/{totalBOM}</strong></span>
          <span style={{ color: 'var(--border-strong)' }}>|</span>
          <span>Orçado: <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            R$ {minCost === maxCost ? minCost : `${minCost}-${maxCost}`}
          </strong></span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={exportMission} className="btn btn-ghost" style={{ fontSize: '13px', padding: '8px 12px' }}>
            <Download size={16} />
            <span className="hide-mobile">Exportar</span>
          </button>
        </div>
      </div>

      <style>{`.hide-mobile { } @media (max-width: 768px) { .hide-mobile { display: none; } }`}</style>
    </header>
  );
}
