/**
 * PROJETO ARES — AI Assistant View (Minimalist)
 */
import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Trash2, Sparkles, AlertCircle } from 'lucide-react';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SYSTEM_PROMPT = `Você é o ARES AI, o assistente técnico especializado do Projeto Ares — um rover análogo a Marte para feira de ciências.

Seu conhecimento inclui:
- ESP32: pinout, GPIO, ADC, PWM, Wi-Fi AP/STA, programação Arduino
- Sensores: DHT11 (temp/umidade), LDR (luminosidade), HC-SR04 (ultrassônico)
- Atuadores: Ponte H L298N (4 motores DC), Servo SG90
- Energia: Baterias 18650 Li-ion, regulação de tensão
- Chassi: Kit robô 4WD acrílico
- Telemetria: WebSocket/HTTP JSON via Wi-Fi
- Navegação autônoma: Desvio de obstáculos

Responda sempre em português brasileiro, de forma clara e técnica.
Use emojis para ilustrar quando útil.
Se não souber algo, diga honestamente.`;

export default function AresAIView() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setApiError(null);

    try {
      // Build conversation history for API
      const conversationHistory = [...messages, userMsg].map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('VITE_GEMINI_API_KEY não configurada no .env.local');
      }

      const modelsToTry = [
        'gemini-3.8-flash', 
        'gemini-3.7-flash', 
        'gemini-3.6-flash',
        'antigravity-preview-latest'
      ];
      
      let response: Response | null = null;
      let lastError: Error | null = null;

      for (const model of modelsToTry) {
        try {
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }]
              },
              contents: conversationHistory,
            }),
          });

          if (response.ok) {
            lastError = null;
            break; // Success! Stop trying other models.
          } else {
            const errData = await response.json().catch(() => null);
            lastError = new Error(`Erro no ${model} (${response.status}): ${errData?.error?.message || response.statusText}`);
            
            // Only retry on 503 (Unavailable), 429 (Rate Limit), or 404 (Not Found)
            if (response.status !== 503 && response.status !== 429 && response.status !== 404) {
              break;
            }
          }
        } catch (err: any) {
          lastError = err;
        }
      }

      if (lastError || !response || !response.ok) {
        throw lastError || new Error("Todos os modelos de IA falharam ou estão sobrecarregados.");
      }

      const data = await response.json();
      const assistantText = data?.candidates?.[0]?.content?.parts?.[0]?.text
        || 'Desculpe, não consegui gerar uma resposta.';

      const assistantMsg: AIMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: assistantText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error('AI API Error:', error);
      setApiError(error.message || 'Não foi possível conectar à IA.');
      
      // Add fallback message
      const fallbackMsg: AIMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: `⚠️ Erro de Conexão: ${error.message}\n\nIsso geralmente acontece se o modelo estiver sobrecarregado (503) ou em manutenção.`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setApiError(null);
  };

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexShrink: 0 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-icon" style={{ background: 'var(--accent-purple-bg)', borderColor: 'var(--accent-purple)' }}>
            <Bot size={18} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div>
            <h2 className="section-title">ARES AI</h2>
            <p className="section-subtitle">Assistente Técnico • Powered by Gemini</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="btn btn-ghost" style={{ fontSize: '13px', gap: '6px' }}>
            <Trash2 size={16} /> Limpar
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="card" style={{
        flex: 1, padding: '20px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
          gap: '16px', paddingRight: '8px',
        }}>
          {messages.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', gap: '20px', color: 'var(--text-muted)',
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'var(--accent-purple-bg)', border: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={28} style={{ color: 'var(--accent-purple)' }} />
              </div>
              <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Olá, Tripulante! 🚀
                </div>
                <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                  Sou o ARES AI, seu assistente técnico para o Projeto Ares.<br />
                  Pergunte sobre ESP32, sensores, montagem ou código...
                </div>
              </div>
              {/* Suggestion chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '500px' }}>
                {[
                  'Como conectar o DHT11 no ESP32?',
                  'Qual pinout usar para o HC-SR04?',
                  'Código de desvio de obstáculos',
                  'Como montar o chassi 4WD?',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => { setInput(suggestion); }}
                    className="btn btn-ghost"
                    style={{
                      fontSize: '12px', padding: '8px 14px', borderRadius: '24px',
                      border: '1px solid var(--border-strong)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  background: msg.role === 'user' ? 'var(--accent-blue-bg)' : 'var(--accent-purple-bg)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(168, 85, 247, 0.3)'}`,
                }}>
                  {msg.role === 'user'
                    ? <span style={{ fontSize: '14px' }}>👤</span>
                    : <Bot size={16} style={{ color: 'var(--accent-purple)' }} />
                  }
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: '80%', padding: '12px 16px', borderRadius: '12px',
                  background: msg.role === 'user'
                    ? 'var(--accent-blue-bg)'
                    : 'var(--bg-surface-elevated)',
                  border: `1px solid ${msg.role === 'user'
                    ? 'rgba(59, 130, 246, 0.3)'
                    : 'var(--border-subtle)'}`,
                  borderTopRightRadius: msg.role === 'user' ? '2px' : '12px',
                  borderTopLeftRadius: msg.role === 'user' ? '12px' : '2px',
                }}>
                  <div style={{
                    fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6,
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {msg.content}
                  </div>
                  <div style={{
                    fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px',
                    textAlign: msg.role === 'user' ? 'right' : 'left',
                  }}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--accent-purple-bg)', border: '1px solid rgba(168, 85, 247, 0.3)',
              }}>
                <Bot size={16} style={{ color: 'var(--accent-purple)', animation: 'pulse 1s infinite' }} />
              </div>
              <div style={{
                padding: '12px 16px', borderRadius: '12px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderTopLeftRadius: '2px',
              }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: 'var(--accent-purple)',
                      opacity: 0.5,
                      animation: `pulse 1s ease-in-out ${i * 0.2}s infinite alternate`,
                    }} />
                  ))}
                  <style>{`@keyframes pulse { from { opacity: 0.3; transform: scale(0.8); } to { opacity: 1; transform: scale(1.1); } }`}</style>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* API Error Notice */}
        {apiError && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', marginTop: '12px', borderRadius: '8px',
            background: 'var(--accent-amber-bg)', border: '1px solid var(--accent-amber)',
            fontSize: '13px', color: 'var(--accent-amber)',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{apiError}</span>
          </div>
        )}

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
            placeholder="Pergunte ao ARES AI sobre o projeto..."
            disabled={loading}
            style={{ flex: 1, padding: '10px 14px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="btn"
            style={{
              padding: '10px 16px',
              opacity: input.trim() && !loading ? 1 : 0.4,
              background: 'var(--accent-purple-bg)',
              border: '1px solid var(--accent-purple)',
              color: 'var(--accent-purple)',
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
