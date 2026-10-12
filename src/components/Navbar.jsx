import React from 'react';
import { Ghost, ShieldCheck, Volume2, VolumeX, LogOut, Radio } from 'lucide-react';

export default function Navbar({ user, onLogout, soundMuted, onToggleSound, currentView, isConnected = true }) {
  return (
    <header className="app-navbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(8,10,16,0.85)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(139,92,246,0.4)',
          flexShrink: 0
        }}>
          <Ghost size={20} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '20px',
              fontWeight: '800',
              letterSpacing: '-0.03em',
              color: '#ffffff'
            }}>
              FELLO
            </span>
            <span style={{
              fontSize: '9px',
              padding: '2px 5px',
              borderRadius: '4px',
              background: 'rgba(139,92,246,0.2)',
              color: '#c084fc',
              fontWeight: '700',
              fontFamily: 'var(--font-mono)',
              border: '1px solid rgba(139,92,246,0.3)'
            }}>
              ANON
            </span>
          </div>
          <div className="navbar-brand-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#10b981' : '#f59e0b',
              boxShadow: isConnected ? '0 0 8px #10b981' : '0 0 8px #f59e0b',
              display: 'inline-block'
            }} />
            <span style={{ color: isConnected ? '#94a3b8' : '#fbbf24' }}>
              {isConnected ? 'Zero-Logs P2P Routing' : 'Connecting to server... (Waking up)'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Sound FX Toggle */}
        <button
          onClick={onToggleSound}
          title={soundMuted ? "Unmute audio effects" : "Mute audio effects"}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '8px 12px',
            color: soundMuted ? '#64748b' : '#38bdf8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontFamily: 'var(--font-heading)'
          }}
        >
          {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <span style={{ display: 'none' }}>Sound</span>
        </button>

        {/* User Persona Pill (If authenticated / guest active) */}
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 12px 4px 6px',
            borderRadius: '9999px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)'
          }}>
            <span style={{
              fontSize: '18px',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'rgba(139,92,246,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {user.avatar || '👻'}
            </span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                {user.nickname}
              </div>
              <div className="navbar-user-subtitle" style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={11} color="#34d399" />
                {user.isGuest ? 'Ephemeral Alias' : 'Verified'}
              </div>
            </div>

            {currentView !== 'chat' && (
              <button
                onClick={onLogout}
                title="Change Persona / Log Out"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '4px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#fb7185'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
