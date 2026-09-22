/**
 * PROJETO ARES — Phases / Cronograma View
 */
import { useState } from 'react';
import { useMission } from '../../store/missionStore';
import type { Task } from '../../types/mission';
import {
  ListChecks, ChevronDown, ChevronUp, Plus, Trash2,
  CheckCircle, Circle, StickyNote, ChevronsUpDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PhasesView() {
  const {
    data, fbToggleTask, fbUpdateTaskNotes, fbAddTask, fbDeleteTask,
    fbTogglePhaseExpand, dispatch,
  } = useMission();

  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});

  const totalTasks = data.phases.reduce((s, p) => s + p.tasks.length, 0);
  const completedTasks = data.phases.reduce((s, p) => s + p.tasks.filter((t) => t.completed).length, 0);
  const overallPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleToggleTask = async (phaseId: string, taskId: string, completed: boolean) => {
    const phase = data.phases.find((p) => p.id === phaseId);
    if (phase) await fbToggleTask(phaseId, phase, taskId, completed);
  };

  const handleNotesBlur = async (phaseId: string, taskId: string, notes: string) => {
    const phase = data.phases.find((p) => p.id === phaseId);
    if (phase) await fbUpdateTaskNotes(phaseId, phase, taskId, notes);
  };

  const handleAddTask = async (phaseId: string) => {
    const title = (newTaskInputs[phaseId] || '').trim();
    if (!title) return;
    const phase = data.phases.find((p) => p.id === phaseId);
    if (!phase) return;
    const task: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      completed: false,
      notes: '',
    };
    await fbAddTask(phaseId, phase, task);
    setNewTaskInputs((prev) => ({ ...prev, [phaseId]: '' }));
  };

  const handleDeleteTask = async (phaseId: string, taskId: string) => {
    const phase = data.phases.find((p) => p.id === phaseId);
    if (phase && confirm('Excluir esta tarefa?')) {
      await fbDeleteTask(phaseId, phase, taskId);
    }
  };

  const handleExpandAll = (expand: boolean) => {
    dispatch({ type: 'EXPAND_ALL_PHASES', payload: expand });
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-icon"><ListChecks size={18} /></div>
          <div>
            <h2 className="section-title">Cronograma da Missão</h2>
            <p className="section-subtitle">5 Fases — {completedTasks}/{totalTasks} tarefas concluídas ({overallPct}%)</p>
          </div>
        </div>
        <button onClick={() => handleExpandAll(!data.phases.every((p) => p.expanded))} className="btn btn-ghost" style={{ gap: '6px', fontSize: '13px' }}>
          <ChevronsUpDown size={16} />
          {data.phases.every((p) => p.expanded) ? 'Recolher Tudo' : 'Expandir Tudo'}
        </button>
      </div>

      {/* Overall Progress */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Progresso Geral da Missão
          </span>
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {overallPct}%
          </span>
        </div>
        <div className="progress-bar" style={{ height: '6px' }}>
          <div className="progress-bar-fill" style={{ width: `${overallPct}%`, background: 'var(--text-primary)' }} />
        </div>
      </div>

      {/* Phases Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {data.phases.map((phase, idx) => {
          const phaseCompleted = phase.tasks.filter((t) => t.completed).length;
          const phaseTotal = phase.tasks.length;
          const phasePct = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
          const isComplete = phasePct === 100 && phaseTotal > 0;

          return (
            <div
              key={phase.id}
              className="card animate-fade-in"
              style={{
                padding: 0,
                opacity: 0,
                animationDelay: `${idx * 0.05}s`,
                borderColor: isComplete ? 'var(--accent-green)' : 'var(--border-subtle)',
              }}
            >
              {/* Phase Header */}
              <button
                onClick={() => fbTogglePhaseExpand(phase.id, !phase.expanded)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '20px', background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 600,
                    background: isComplete ? 'var(--accent-green-bg)' : 'var(--bg-surface-elevated)',
                    color: isComplete ? 'var(--accent-green)' : 'var(--text-primary)',
                    border: `1px solid ${isComplete ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-strong)'}`,
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{phase.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{phase.description}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '13px', fontWeight: 600,
                    color: isComplete ? 'var(--accent-green)' : 'var(--text-muted)',
                  }}>
                    {phaseCompleted}/{phaseTotal}
                  </span>
                  <div className="progress-bar" style={{ width: '80px', height: '4px' }}>
                    <div className="progress-bar-fill" style={{
                      width: `${phasePct}%`,
                      background: isComplete ? 'var(--accent-green)' : 'var(--text-primary)',
                    }} />
                  </div>
                  {phase.expanded ? <ChevronUp size={20} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={20} style={{ color: 'var(--text-muted)' }} />}
                </div>
              </button>

              {/* Phase Content (Tasks) */}
              <AnimatePresence>
                {phase.expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                    <AnimatePresence>
                      {phase.tasks.map((task) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0, padding: 0, overflow: 'hidden' }}
                          layout
                          style={{
                            display: 'flex', flexDirection: 'column', gap: '6px',
                            padding: '12px 14px', borderRadius: '8px',
                            background: task.completed ? 'var(--bg-base)' : 'var(--bg-surface-hover)',
                            border: `1px solid ${task.completed ? 'var(--border-subtle)' : 'var(--border-strong)'}`,
                          }}
                        >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            onClick={() => handleToggleTask(phase.id, task.id, !task.completed)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                          >
                            {task.completed
                              ? <CheckCircle size={20} style={{ color: 'var(--text-muted)' }} />
                              : <Circle size={20} style={{ color: 'var(--text-primary)' }} />
                            }
                          </button>
                          <span style={{
                            fontSize: '14px', flex: 1, fontWeight: 500,
                            color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: task.completed ? 'line-through' : 'none',
                          }}>
                            {task.title}
                          </span>
                          <button
                            onClick={() => handleDeleteTask(phase.id, task.id)}
                            className="btn btn-ghost"
                            style={{ padding: '4px', opacity: 0.5 }}
                            title="Excluir tarefa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {/* Notes */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginLeft: '30px' }}>
                          <StickyNote size={14} style={{ color: 'var(--text-muted)', marginTop: '4px', flexShrink: 0 }} />
                          <input
                            className="input"
                            defaultValue={task.notes}
                            onBlur={(e) => handleNotesBlur(phase.id, task.id, e.target.value)}
                            placeholder="Adicionar notas ou observações..."
                            style={{ fontSize: '13px', padding: '4px 8px', background: 'transparent', border: '1px solid transparent', borderRadius: '4px' }}
                            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-strong)'; (e.target as HTMLInputElement).style.background = 'var(--bg-base)'; }}
                          />
                        </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Add Task */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <input
                      className="input"
                      placeholder="Adicionar nova tarefa..."
                      value={newTaskInputs[phase.id] || ''}
                      onChange={(e) => setNewTaskInputs((prev) => ({ ...prev, [phase.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTask(phase.id)}
                      style={{ flex: 1, fontSize: '13px', padding: '10px 12px' }}
                    />
                    <button onClick={() => handleAddTask(phase.id)} className="btn btn-primary" style={{ padding: '10px 16px' }}>
                      <Plus size={18} />
                    </button>
                  </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
