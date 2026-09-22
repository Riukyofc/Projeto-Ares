/**
 * PROJETO ARES — Chat View (Rádio da Missão)
 */
import { useState, useRef, useEffect } from 'react';
import { useMission } from '../../store/missionStore';
import { useAuth } from '../../lib/auth';
import { Radio, Send } from 'lucide-react';

const ROLE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
];

function getColorForUid(uid: string): string {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ROLE_COLORS[Math.abs(hash) % ROLE_COLORS.length];
}

export default function ChatView() {
  const { chatMessages, fbSendChat } = useMission();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !user) return;

    await fbSendChat({
      sender: user.displayName || 'Tripulante',
      senderPhoto: user.photoURL,
      uid: user.uid,
      role: 'Tripulante',
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
      color: getColorForUid(user.uid),
    });
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (msg: { timestamp?: string; createdAt?: number }) => {
    if (msg.timestamp) return msg.timestamp;
    if (msg.createdAt) return new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return '';
  };

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '16px', flexShrink: 0 }}>
        <div className="section-icon"><Radio size={18} /></div>
        <div>
          <h2 className="section-title">Comunicações</h2>
          <p className="section-subtitle">Canal da equipe • {chatMessages.length} transmissões</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="card" style={{
        flex: 1, padding: '20px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
          gap: '12px', paddingRight: '8px',
        }}>
          {chatMessages.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', gap: '16px', color: 'var(--text-muted)',
            }}>
              <Radio size={40} style={{ opacity: 0.2 }} />
              <div style={{ fontSize: '13px', textAlign: 'center' }}>
                Nenhuma transmissão ainda.<br />Envie a primeira mensagem para a equipe!
              </div>
            </div>
          ) : (
            chatMessages.map((msg, idx) => {
              const isOwn = msg.uid === user?.uid;
              return (
                <div
                  key={msg.id || idx}
                  className="animate-fade-in"
                  style={{
                    opacity: 0,
                    animationDelay: `${Math.min(idx * 0.02, 0.5)}s`,
                    display: 'flex',
                    flexDirection: isOwn ? 'row-reverse' : 'row',
                    gap: '12px',
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Avatar */}
                  {msg.senderPhoto ? (
                    <img
                      src={msg.senderPhoto}
                      alt=""
                      style={{
                         width: '32px', height: '32px', borderRadius: '50%',
                        border: `2px solid ${msg.color || 'var(--border-strong)'}`,
                        flexShrink: 0,
                      }}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div style={{
                       width: '32px', height: '32px', borderRadius: '50%',
                      background: msg.color || 'var(--bg-surface-elevated)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 600, color: '#fff', flexShrink: 0,
                    }}>
                      {(msg.sender || '?')[0].toUpperCase()}
                    </div>
                  )}

                  {/* Bubble */}
                  <div style={{
                    maxWidth: '75%', padding: '10px 14px', borderRadius: '12px',
                    background: isOwn ? 'var(--accent-blue-bg)' : 'var(--bg-surface-elevated)',
                    border: `1px solid ${isOwn ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-subtle)'}`,
                    borderTopRightRadius: isOwn ? '2px' : '12px',
                    borderTopLeftRadius: isOwn ? '12px' : '2px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '12px', fontWeight: 600,
                        color: msg.color || 'var(--accent-blue)',
                      }}>
                        {msg.sender}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        color: 'var(--text-muted)',
                      }}>
                        {formatTime(msg)}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          display: 'flex', gap: '10px', paddingTop: '16px', marginTop: '12px',
          borderTop: '1px solid var(--border-subtle)', flexShrink: 0,
        }}>
          <input
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mensagem..."
            style={{ flex: 1, fontSize: '13px', padding: '10px 14px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="btn btn-primary"
            style={{
              padding: '10px 16px',
              opacity: input.trim() ? 1 : 0.4,
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
