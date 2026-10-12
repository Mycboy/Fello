import React, { useState } from 'react';
import { Ghost, ShieldCheck, Volume2, VolumeX, LogOut, X, User } from 'lucide-react';

export default function Navbar({ 
  user, 
  onLogout, 
  soundMuted, 
  onToggleSound, 
  currentView, 
  isConnected = true 
}) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <>
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
        {/* Left Side: On Mobile, User Trigger + Website Name; On Desktop, Website Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Mobile-Only User Details Trigger (Left-most) */}
          {user && (
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="mobile-user-trigger"
              title="Open User Profile & Settings"
              style={{
                position: 'relative',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(139,92,246,0.18)',
                border: '1px solid rgba(139,92,246,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                cursor: 'pointer',
                padding: 0,
                outline: 'none',
                boxShadow: '0 0 12px rgba(139,92,246,0.25)',
                flexShrink: 0
              }}
            >
              <span>{user.avatar || '👻'}</span>
              <span style={{
                position: 'absolute',
                bottom: '-1px',
                right: '-1px',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                backgroundColor: isConnected ? '#10b981' : '#f59e0b',
                border: '2px solid #080a10',
                boxShadow: isConnected ? '0 0 6px #10b981' : '0 0 6px #f59e0b'
              }} />
            </button>
          )}

          {/* Website Name & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div className="navbar-desktop-logo" style={{
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
                <span className="navbar-anon-badge" style={{
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
        </div>

        {/* Desktop-Only Right Controls (Hidden on mobile) */}
        <div className="desktop-nav-controls" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
          </button>

          {/* User Persona Pill */}
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

      {/* Mobile User Profile Popup Page / Sheet */}
      {isProfileModalOpen && (
        <div 
          className="user-profile-modal-overlay"
          onClick={() => setIsProfileModalOpen(false)}
        >
          <div 
            className="user-profile-modal glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              paddingBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="#c084fc" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>
                  User Details & Settings
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: 'none',
                  color: '#94a3b8',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* User Identity Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '28px',
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.2))',
                border: '1px solid rgba(139,92,246,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {user?.avatar || '👻'}
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: '800', color: '#ffffff' }}>
                  {user?.nickname || 'Anonymous'}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '3px'
                }}>
                  <ShieldCheck size={13} color="#34d399" />
                  <span>{user?.isGuest ? 'Ephemeral Alias (No tracking)' : 'Verified User'}</span>
                </div>
              </div>
            </div>

            {/* Server Connection Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              marginBottom: '12px',
              fontSize: '13px'
            }}>
              <span style={{ color: '#94a3b8' }}>Connection Status</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isConnected ? '#10b981' : '#f59e0b',
                  boxShadow: isConnected ? '0 0 8px #10b981' : '0 0 8px #f59e0b',
                  display: 'inline-block'
                }} />
                <span style={{ color: isConnected ? '#34d399' : '#fbbf24', fontSize: '12px' }}>
                  {isConnected ? 'Connected' : 'Waking up server...'}
                </span>
              </div>
            </div>

            {/* Sound Effects Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              marginBottom: '16px'
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>Sound Effects</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Audio chimes & notifications</div>
              </div>
              <button
                type="button"
                onClick={onToggleSound}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: soundMuted ? 'rgba(255,255,255,0.06)' : 'rgba(6,182,212,0.15)',
                  border: soundMuted ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(6,182,212,0.3)',
                  color: soundMuted ? '#94a3b8' : '#38bdf8',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {soundMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                <span>{soundMuted ? 'Muted' : 'Enabled'}</span>
              </button>
            </div>

            {/* Change Persona / Logout */}
            {currentView !== 'chat' && (
              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  onLogout?.();
                }}
                className="btn-danger"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <LogOut size={16} />
                <span>Change Persona / Exit</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
