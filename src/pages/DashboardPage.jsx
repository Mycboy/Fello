import React, { useState } from 'react';
import { 
  Radio, 
  Users, 
  Zap, 
  Shield, 
  Flame, 
  Clock, 
  Sparkles, 
  XCircle, 
  Lock,
  UserCheck,
  Trash2,
  MessageSquare
} from 'lucide-react';

export default function DashboardPage({ 
  user, 
  onUpdateUser, 
  onStartSearch, 
  onDemoSearch,
  onCancelSearch, 
  isSearching, 
  searchTime,
  stats,
  savedConnections = [],
  onRemoveConnection
}) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editNickname, setEditNickname] = useState(user.nickname || '');
  const [editAvatar, setEditAvatar] = useState(user.avatar || '👻');

  const AVATARS = ['👻', '🦊', '⚡', '🥷', '👾', '🌌', '🎭', '🔮', '🐱‍👤', '🛡️', '🌙', '🪐'];

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editNickname.trim()) return;
    onUpdateUser({
      ...user,
      nickname: editNickname.trim(),
      avatar: editAvatar
    });
    setIsEditingProfile(false);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      maxWidth: '1080px',
      margin: '0 auto',
      padding: '30px 20px 60px',
      minHeight: 'calc(100vh - 70px)'
    }}>
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#34d399',
              fontSize: '12px',
              fontWeight: '700',
              fontFamily: 'var(--font-mono)'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
              RADAR ACTIVE
            </span>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>
              Connected to anonymous matchmaking pool
            </span>
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: '#fff' }}>
            Anonymous <span className="gradient-text-purple">Command Hub</span>
          </h1>
        </div>

        {/* Current User Card */}
        <div className="glass-panel" style={{
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          borderRadius: '16px'
        }}>
          <div style={{
            fontSize: '28px',
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'rgba(139,92,246,0.2)',
            border: '1px solid rgba(139,92,246,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {user.avatar || '👻'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: '700', fontSize: '15px', color: '#fff' }}>{user.nickname}</span>
              <button
                onClick={() => setIsEditingProfile(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c084fc',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                edit
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              <span>Incognito Persona Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '28px', background: '#11131d' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', margin: 0 }}>Customize Incognito Mask</h3>
              <button 
                onClick={() => setIsEditingProfile(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                  Anonymous Nickname
                </label>
                <input
                  type="text"
                  maxLength={24}
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                  Choose Avatar Mask
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setEditAvatar(av)}
                      style={{
                        fontSize: '20px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        border: editAvatar === av ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                        background: editAvatar === av ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.04)',
                        cursor: 'pointer'
                      }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 18px', fontSize: '13px' }}
                >
                  Save Persona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: Matchmaking Radar Terminal */}
      <div className="dashboard-main-grid">
        {/* Left Column: Big Radar & Search Terminal */}
        <div className="glass-panel" style={{
          padding: '36px 30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '440px'
        }}>
          {/* Subtle Ambient Radial Glow */}
          <div style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: isSearching 
              ? 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(6,182,212,0.1) 60%, transparent 80%)'
              : 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }} />

          {/* Radar Circles Container */}
          <div style={{
            position: 'relative',
            width: '180px',
            height: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '28px',
            zIndex: 1
          }}>
            {isSearching && (
              <>
                <div className="radar-ring" style={{ width: '100%', height: '100%' }}></div>
                <div className="radar-ring" style={{ width: '100%', height: '100%' }}></div>
                <div className="radar-ring" style={{ width: '100%', height: '100%' }}></div>
              </>
            )}

            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: isSearching
                ? 'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(6,182,212,0.4))'
                : 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(30,35,50,0.8))',
              border: isSearching ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isSearching ? 'var(--glow-purple)' : 'none',
              transition: 'all 0.3s ease'
            }}>
              <span style={{ fontSize: '48px' }} className={isSearching ? 'animate-float' : ''}>
                {user.avatar || '👻'}
              </span>
            </div>
          </div>

          {/* Search Status & CTAs */}
          <div style={{ zIndex: 1, maxWidth: '420px', width: '100%' }}>
            {isSearching ? (
              <>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#38bdf8',
                  fontSize: '14px',
                  fontWeight: '700',
                  marginBottom: '8px'
                }}>
                  <Radio size={16} className="animate-spin" />
                  <span>Scanning the Shadows for a Stranger...</span>
                </div>

                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#fff',
                  marginBottom: '12px'
                }}>
                  {formatTimer(searchTime)}
                </div>

                <p style={{
                  fontSize: '13px',
                  color: '#94a3b8',
                  marginBottom: searchTime >= 4 ? '12px' : '24px'
                }}>
                  Searching for a 1-on-1 anonymous stranger to connect with...
                </p>

                {searchTime >= 4 && (
                  <div style={{ marginBottom: '16px' }}>
                    <button
                      type="button"
                      onClick={onDemoSearch}
                      style={{
                        background: 'rgba(6,182,212,0.15)',
                        border: '1px solid rgba(6,182,212,0.3)',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        color: '#38bdf8',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Sparkles size={13} />
                      <span>Testing solo? Connect to Instant Demo Stranger</span>
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onCancelSearch}
                  className="btn-danger"
                  style={{ width: '100%', maxWidth: '280px', padding: '12px 20px' }}
                >
                  <XCircle size={18} />
                  <span>Cancel Matchmaking</span>
                </button>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '26px', marginBottom: '8px', color: '#fff' }}>
                  Ready to Meet Someone New?
                </h2>
                <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
                  Click below to initiate an instant encrypted anonymous session with a random stranger.
                </p>

                <button
                  type="button"
                  onClick={() => onStartSearch()}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '16px 28px',
                    fontSize: '17px',
                    borderRadius: '16px'
                  }}
                >
                  <Zap size={20} />
                  <span>Find Random Stranger</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Live Telemetry & Guidelines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Live Telemetry Card */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Users size={18} color="#06b6d4" />
              <h3 style={{ fontSize: '16px', margin: 0 }}>Live Network Activity</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{
                background: 'rgba(0,0,0,0.25)',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                  Online Strangers
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                  {stats?.onlineCount || 18}
                </div>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.25)',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <Flame size={12} color="#f59e0b" />
                  Active Chats
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                  {stats?.activeChats || 8}
                </div>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.25)',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <Clock size={12} color="#a855f7" />
                  Avg Match Time
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                  ~1.5s
                </div>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.25)',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <Lock size={12} color="#10b981" />
                  Privacy Level
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#34d399', marginTop: '4px' }}>
                  100% Ephemeral
                </div>
              </div>
            </div>
          </div>

          {/* Saved Connections (Encounter History for Logged-In Accounts) */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={18} color="#c084fc" />
                <h3 style={{ fontSize: '16px', margin: 0, color: '#fff' }}>Saved Connections</h3>
              </div>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: user?.isGuest ? 'rgba(255,255,255,0.06)' : 'rgba(139,92,246,0.2)',
                color: user?.isGuest ? '#94a3b8' : '#c084fc',
                fontWeight: '700',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                {user?.isGuest ? 'Member Feature' : `${savedConnections.length} Saved`}
              </span>
            </div>

            {user?.isGuest ? (
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(139,92,246,0.08)',
                border: '1px dashed rgba(139,92,246,0.3)',
                textAlign: 'center'
              }}>
                <Lock size={22} color="#c084fc" style={{ margin: '0 auto 8px', display: 'block' }} />
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                  History Locked for Guests
                </div>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 auto', lineHeight: 1.5, maxWidth: '280px' }}>
                  Log in or sign up with an account to save people you meet and connect with them again in the future!
                </p>
              </div>
            ) : savedConnections.length === 0 ? (
              <div style={{
                padding: '20px 14px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center'
              }}>
                <UserCheck size={24} color="#64748b" style={{ margin: '0 auto 8px', display: 'block' }} />
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', marginBottom: '4px' }}>
                  No Saved Connections Yet
                </div>
                <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
                  When you chat with a stranger, click <strong>"Connect"</strong> to save them here!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }} className="no-scrollbar">
                {savedConnections.map((conn) => (
                  <div
                    key={conn.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        fontSize: '18px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(139,92,246,0.18)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {conn.avatar || '👻'}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                          {conn.nickname}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                          Met {new Date(conn.connectedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={onStartSearch}
                        className="btn-primary"
                        style={{
                          padding: '5px 10px',
                          fontSize: '11.5px',
                          borderRadius: '8px'
                        }}
                        title="Enter matchmaking to find or re-match"
                      >
                        <MessageSquare size={12} />
                        <span>Match</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveConnection?.(conn.id)}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          color: '#fb7185',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Remove from saved connections"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safety & Protocol Card */}
          <div className="glass-panel" style={{
            padding: '24px',
            background: 'rgba(15,18,28,0.6)',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Shield size={18} color="#34d399" />
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#e2e8f0' }}>Incognito Protocol</span>
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.55, margin: 0 }}>
              Never reveal passwords, real names, or personal financial details. All chats are completely peer-to-peer routed and are permanently destroyed when either participant leaves or closes the tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
