/**
 * PROJETO ARES — Audit Logs View
 */
import { useMission } from '../../store/missionStore';
import { History, Cpu, FileText, CheckSquare, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export default function AuditLogsView() {
  const { data } = useMission();

  const getIcon = (type: string) => {
    switch (type) {
      case 'bom': return <Cpu size={16} style={{ color: 'var(--accent-blue)' }} />;
      case 'phase': return <CheckSquare size={16} style={{ color: 'var(--accent-green)' }} />;
      case 'doc': return <FileText size={16} style={{ color: 'var(--accent-amber)' }} />;
      default: return <Settings size={16} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-icon"><History size={18} /></div>
          <div>
            <h2 className="section-title">Logs de Auditoria</h2>
            <p className="section-subtitle">Histórico de ações e alterações da missão</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {data.logs.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <History size={24} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ fontSize: '14px' }}>Nenhum evento registrado ainda.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {data.logs.map((log, idx) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  borderBottom: idx < data.logs.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'var(--bg-surface-hover)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {getIcon(log.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{log.user}</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{log.action}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{log.details}</div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  {' • '}
                  {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
