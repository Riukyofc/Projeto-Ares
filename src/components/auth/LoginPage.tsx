/**
 * PROJETO ARES — Login Page (Ultra Premium Aurora/Mesh)
 */
import { useAuth } from '../../lib/auth';
import aresLogo from '../../assets/logo.png';
import { Rocket } from 'lucide-react';

export default function LoginPage() {
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Falha no login:', error);
    }
  };

  return (
    <div className="login-page" style={{ 
      position: 'relative', 
      overflow: 'hidden',
      padding: 0,
      background: '#000'
    }}>
      <style>{`
        @keyframes aurora-1 {
          0% { transform: translate(-30%, -30%) rotate(0deg) scale(1); opacity: 0.4; }
          50% { transform: translate(10%, 20%) rotate(180deg) scale(1.2); opacity: 0.6; }
          100% { transform: translate(-30%, -30%) rotate(360deg) scale(1); opacity: 0.4; }
        }
        @keyframes aurora-2 {
          0% { transform: translate(30%, 30%) rotate(0deg) scale(1.2); opacity: 0.5; }
          50% { transform: translate(-20%, -10%) rotate(-180deg) scale(0.9); opacity: 0.3; }
          100% { transform: translate(30%, 30%) rotate(-360deg) scale(1.2); opacity: 0.5; }
        }
        @keyframes aurora-3 {
          0% { transform: translate(-20%, 40%) rotate(0deg) scale(0.8); opacity: 0.3; }
          50% { transform: translate(40%, -20%) rotate(180deg) scale(1.3); opacity: 0.6; }
          100% { transform: translate(-20%, 40%) rotate(360deg) scale(0.8); opacity: 0.3; }
        }
        .aurora-blob {
          position: absolute;
          filter: blur(80px);
          border-radius: 50%;
          z-index: 0;
          pointer-events: none;
        }
        .glass-panel {
          background: rgba(10, 10, 10, 0.4);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 30px 60px rgba(0,0,0, 0.6), inset 0 1px 0 rgba(255,255,255,0.1);
        }
      `}</style>

      {/* Animated Aurora Background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <div className="aurora-blob" style={{
          top: '-20%', left: '-10%', width: '70vw', height: '70vw',
          background: 'linear-gradient(to right, rgba(59, 130, 246, 0.5), rgba(139, 92, 246, 0.4))',
          animation: 'aurora-1 25s linear infinite'
        }} />
        <div className="aurora-blob" style={{
          bottom: '-30%', right: '-20%', width: '80vw', height: '80vw',
          background: 'linear-gradient(to right, rgba(239, 68, 68, 0.3), rgba(245, 158, 11, 0.3))',
          animation: 'aurora-2 30s linear infinite'
        }} />
        <div className="aurora-blob" style={{
          top: '20%', right: '10%', width: '50vw', height: '50vw',
          background: 'linear-gradient(to right, rgba(16, 185, 129, 0.3), rgba(6, 182, 212, 0.4))',
          animation: 'aurora-3 35s linear infinite'
        }} />
      </div>

      {/* Grid Overlay for texture */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        maskImage: 'radial-gradient(ellipse 100% 100% at center, black 10%, transparent 90%)',
        WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at center, black 10%, transparent 90%)',
      }} />

      {/* Main Login Container */}
      <div style={{
        width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 10, padding: '24px'
      }}>
        
        <div className="glass-panel animate-fade-in-up" style={{
          display: 'flex', flexDirection: 'column',
          width: '100%', maxWidth: '480px',
          borderRadius: '32px',
          padding: '48px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* Top highlight line */}
          <div style={{
            position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)'
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
            <div style={{
              width: '88px', height: '88px', borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)',
              marginBottom: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Inner glow on logo box */}
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top left, rgba(255,255,255,0.3), transparent 70%)' }} />
              
              <img 
                src={aresLogo} 
                alt="Ares Logo" 
                style={{ width: '80px', height: '80px', position: 'relative', zIndex: 2, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))', objectFit: 'contain' }} 
              />
            </div>
            
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '34px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              Projeto Ares
            </h1>
            <p style={{
              fontSize: '16px',
              color: 'var(--text-secondary)',
              fontWeight: 400,
              textAlign: 'center',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              Mission Control Center <Rocket size={16} />
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            <button 
              onClick={handleSignIn} 
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                width: '100%', padding: '16px', borderRadius: '16px',
                background: '#ffffff', color: '#000000',
                fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-display)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px 0 rgba(255, 255, 255, 0.39)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <svg width="22" height="22" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue com Google
            </button>
            
            <div style={{
              fontSize: '13px', color: 'rgba(255,255,255,0.5)', textAlign: 'center',
              lineHeight: 1.6, marginTop: '8px', padding: '0 10px'
            }}>
              Acesso exclusivo à tripulação oficial e engenheiros autorizados.<br/>
              Toda telemetria e controle são estritamente confidenciais.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
