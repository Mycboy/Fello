import React, { useState } from 'react';
import { 
  Ghost, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Shuffle, 
  ArrowRight, 
  UserCheck, 
  KeyRound, 
  Mail, 
  Zap,
  EyeOff
} from 'lucide-react';

const RANDOM_NICKNAMES = [
  'ShadowDrifter', 'NeonVoyager', 'CyberPhantom', 'CosmicEcho', 
  'MysticFox', 'MidnightRaven', 'VaporGhost', 'QuantumNomad',
  'SolarSpectre', 'EchoChaser', 'PixelNinja', 'AstralWanderer',
  'ZenithSeeker', 'GlitchSurfer', 'HyperRogue', 'VelvetShade'
];

const AVATAR_OPTIONS = ['👻', '🦊', '⚡', '🥷', '👾', '🌌', '🎭', '🔮', '🐺', '🛡️', '🌙', '🪐'];

export default function AuthPage({ onAuthenticate }) {
  const [authMode, setAuthMode] = useState('anonymous'); // 'anonymous' | 'login' | 'signup'
  
  // Anonymous State
  const [nickname, setNickname] = useState(() => 
    RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)]
  );
  const [selectedAvatar, setSelectedAvatar] = useState('👻');

  // Credential State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRandomizeNickname = () => {
    const random = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
    const suffix = Math.floor(10 + Math.random() * 89);
    setNickname(`${random}_${suffix}`);
  };

  const handleAnonymousSubmit = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setAuthError('Please enter a nickname or generate one!');
      return;
    }
    setAuthError('');
    onAuthenticate({
      nickname: nickname.trim(),
      avatar: selectedAvatar,
      isGuest: true
    });
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
    const payload = authMode === 'signup' 
      ? { email, password, nickname: nickname.trim() || undefined, avatar: selectedAvatar }
      : { identifier: email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.message || 'Authentication failed. Please verify credentials.');
      } else {
        onAuthenticate({
          ...data.user,
          isGuest: false
        });
      }
    } catch {
      setAuthError('Network error connecting to authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('test@fello.chat');
    setPassword('password123');
    setAuthError('');
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative'
    }}>
      {/* Background Decorative Glows */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(6,182,212,0.05) 50%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '560px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header Tagline */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.3)',
            padding: '6px 14px',
            borderRadius: '9999px',
            color: '#c084fc',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '16px'
          }}>
            <Sparkles size={15} />
            Pure Anonymous 1-on-1 Encounters
          </div>

          <h1 style={{
            fontSize: '38px',
            fontWeight: '800',
            lineHeight: 1.15,
            marginBottom: '10px',
            color: '#ffffff'
          }}>
            Talk to Strangers with <span className="gradient-text-purple">Absolute Freedom</span>
          </h1>

          <p style={{
            color: '#94a3b8',
            fontSize: '15px',
            lineHeight: 1.5,
            maxWidth: '460px',
            margin: '0 auto'
          }}>
            No phone numbers, no tracking, no footprints. Choose instant anonymous persona or create an account.
          </p>
        </div>

        {/* Main Card */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(0,0,0,0.35)',
            padding: '4px',
            borderRadius: '14px',
            marginBottom: '26px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <button
              type="button"
              onClick={() => { setAuthMode('anonymous'); setAuthError(''); }}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: authMode === 'anonymous' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'transparent',
                color: authMode === 'anonymous' ? '#fff' : '#94a3b8',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Zap size={16} />
              Quick Anonymous
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: authMode !== 'anonymous' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'transparent',
                color: authMode !== 'anonymous' ? '#fff' : '#94a3b8',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Lock size={15} />
              Login / Sign Up
            </button>
          </div>

          {/* Form Content */}
          {authMode === 'anonymous' ? (
            /* ANONYMOUS GUEST MODE */
            <form onSubmit={handleAnonymousSubmit}>
              {/* Nickname Input with Randomizer */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#e2e8f0',
                  marginBottom: '8px'
                }}>
                  <span>Anonymous Nickname</span>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>Visible to strangers</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{
                    position: 'relative',
                    flex: 1
                  }}>
                    <input
                      type="text"
                      maxLength={24}
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="e.g. NeonSpectre, MysteryPilot"
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        background: 'var(--bg-input)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '15px',
                        fontWeight: '600',
                        fontFamily: 'var(--font-heading)',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-purple)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                    />
                    <Ghost 
                      size={18} 
                      color="#8b5cf6" 
                      style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} 
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleRandomizeNickname}
                    title="Generate Random Nickname"
                    style={{
                      background: 'rgba(139,92,246,0.15)',
                      border: '1px solid rgba(139,92,246,0.3)',
                      borderRadius: '12px',
                      padding: '0 16px',
                      color: '#c084fc',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139,92,246,0.25)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(139,92,246,0.15)'}
                  >
                    <Shuffle size={15} />
                    Random
                  </button>
                </div>
              </div>

              {/* Avatar Selector */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#e2e8f0',
                  marginBottom: '10px'
                }}>
                  Choose Incognito Mask
                </label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedAvatar(emoji)}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        fontSize: '20px',
                        border: selectedAvatar === emoji 
                          ? '2px solid #8b5cf6' 
                          : '1px solid rgba(255,255,255,0.08)',
                        background: selectedAvatar === emoji 
                          ? 'rgba(139,92,246,0.25)' 
                          : 'rgba(255,255,255,0.04)',
                        cursor: 'pointer',
                        transform: selectedAvatar === emoji ? 'scale(1.08)' : 'scale(1)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {authError && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(244,63,94,0.15)',
                  border: '1px solid rgba(244,63,94,0.3)',
                  color: '#fb7185',
                  fontSize: '13px',
                  marginBottom: '18px'
                }}>
                  {authError}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '16px' }}
              >
                <span>Enter Shadows & Chat</span>
                <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            /* CREDENTIAL LOGIN / SIGNUP MODE */
            <form onSubmit={handleAccountSubmit}>
              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '18px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                paddingBottom: '10px'
              }}>
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: authMode === 'login' ? '#c084fc' : '#94a3b8',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    paddingBottom: '4px',
                    borderBottom: authMode === 'login' ? '2px solid #8b5cf6' : 'none'
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: authMode === 'signup' ? '#c084fc' : '#94a3b8',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    paddingBottom: '4px',
                    borderBottom: authMode === 'signup' ? '2px solid #8b5cf6' : 'none'
                  }}
                >
                  Create Account
                </button>
              </div>

              {/* Email */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#e2e8f0', marginBottom: '6px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 40px',
                      background: 'var(--bg-input)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#e2e8f0', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 40px',
                      background: 'var(--bg-input)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <KeyRound size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {/* Signup Nickname Option */}
              {authMode === 'signup' && (
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#e2e8f0', marginBottom: '6px' }}>
                    Anonymous Alias
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. NeonSpectre"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'var(--bg-input)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              )}

              {authError && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(244,63,94,0.15)',
                  border: '1px solid rgba(244,63,94,0.3)',
                  color: '#fb7185',
                  fontSize: '13px',
                  marginBottom: '18px'
                }}>
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '15px', marginBottom: '14px' }}
              >
                <span>{isLoading ? 'Authenticating...' : authMode === 'login' ? 'Sign In to Dashboard' : 'Register Account'}</span>
                <ArrowRight size={17} />
              </button>

              {authMode === 'login' && (
                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={fillDemoAccount}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Quick fill demo credentials (test@fello.chat)
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Privacy Guarantee footer */}
          <div style={{
            marginTop: '26px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            fontSize: '12px',
            color: '#64748b'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <EyeOff size={14} color="#10b981" />
              <span>Zero IP Logs</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Zap size={14} color="#8b5cf6" />
              <span>Burn on Exit</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheck size={14} color="#06b6d4" />
              <span>Encrypted WS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
