import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  LogOut, 
  RotateCw, 
  ShieldCheck, 
  AlertTriangle,
  Home,
  Image as ImageIcon,
  Mic,
  MicOff,
  Trash2,
  Play,
  Pause,
  X,
  ZoomIn,
  Download,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';

const ICEBREAKERS = [
  "What's an unpopular opinion you would defend to the death?",
  "If you could have dinner with anyone in history, dead or alive, who?",
  "What's the best piece of advice you've ever received?",
  "If you had to restart life in any country, where would you go?",
  "What's a weird rabbit hole you recently fell down?",
  "Would you rather know the date of your death or the cause?",
  "What is a movie or book that changed how you view the world?",
  "If you could instantly master any one skill, what would it be?",
  "What's your biggest comfort food or late-night guilty pleasure?"
];

const QUICK_REACTIONS = ['🔥', '😂', '💀', '🤯', '👏', '❤️', '🤔', '🚀'];

// Helper to compress images on a canvas
function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// In-Bubble Audio Voice Player
function AudioBubblePlayer({ src, duration, isMe }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatSeconds = (sec) => {
    const s = Math.floor(sec || 0);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '220px', padding: '2px 0' }}>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
      />
      <button
        type="button"
        onClick={togglePlay}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: 'none',
          background: isMe ? '#ffffff' : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
          color: isMe ? '#8b5cf6' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" style={{ marginLeft: '2px' }} />}
      </button>

      {/* Visualizer Wave Bars */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '3px', height: '22px' }}>
        {[6, 12, 18, 10, 16, 22, 14, 8, 20, 15, 9, 18, 12, 7].map((h, i) => {
          const totalDur = audioRef.current?.duration || 1;
          const played = currentTime / totalDur > i / 14;
          return (
            <div
              key={i}
              style={{
                width: '3px',
                height: isPlaying ? `${Math.max(4, Math.sin(i + currentTime * 4) * 10 + 12)}px` : `${h}px`,
                borderRadius: '3px',
                backgroundColor: played 
                  ? (isMe ? '#ffffff' : '#38bdf8') 
                  : (isMe ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.18)'),
                transition: isPlaying ? 'height 0.1s ease, background-color 0.1s' : 'background-color 0.1s'
              }}
            />
          );
        })}
      </div>

      <span style={{
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        color: isMe ? '#f1f5f9' : '#cbd5e1',
        flexShrink: 0
      }}>
        {isPlaying ? formatSeconds(currentTime) : (duration || '0:05')}
      </span>
    </div>
  );
}

export default function ChatPage({ 
  user, 
  partner, 
  roomId, 
  messages, 
  onSendMessage, 
  onNextStranger, 
  onLeaveChat, 
  partnerTyping, 
  partnerLeft,
  onTyping,
  onReactMessage 
}) {
  const [inputText, setInputText] = useState('');
  const [showIcebreakers, setShowIcebreakers] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [selectedMsgReactionId, setSelectedMsgReactionId] = useState(null);

  // Photo & Lightbox State
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);
  const fileInputRef = useRef(null);

  // Voice Note Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordIntervalRef = useRef(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 3-second minimum stay cooldown timer on entering new chat
  const [nextCooldown, setNextCooldown] = useState(3);

  useEffect(() => {
    setNextCooldown(3);
    const interval = setInterval(() => {
      setNextCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [roomId]);

  // Trigger match celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#8b5cf6', '#06b6d4', '#10b981']
      });
    } catch {}
    inputRef.current?.focus();
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);

    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1500);
    }
  };

  const handleSendText = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || partnerLeft) return;

    if (onTyping) onTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    onSendMessage({ type: 'text', text: inputText.trim() });
    setInputText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const sendIcebreaker = (question) => {
    onSendMessage({ type: 'text', text: `🎲 Icebreaker: "${question}"` });
    setShowIcebreakers(false);
    inputRef.current?.focus();
  };

  const sendReaction = (emoji) => {
    onSendMessage({ type: 'text', text: emoji });
    inputRef.current?.focus();
  };

  // --- Photo Handling ---
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await compressImage(file);
      setSelectedPhotoPreview(base64);
      setPhotoCaption('');
    } catch {
      alert("Failed to load selected image. Please try another photo.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendPhoto = () => {
    if (!selectedPhotoPreview) return;
    onSendMessage({
      type: 'image',
      mediaUrl: selectedPhotoPreview,
      text: photoCaption.trim()
    });
    setSelectedPhotoPreview(null);
    setPhotoCaption('');
  };

  // --- Voice Note Recording Handling ---
  const startRecording = async () => {
    if (partnerLeft) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordSeconds(0);
      sound.playRecordStart();

      recordIntervalRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Microphone permission is required to record voice notes.");
    }
  };

  const stopRecording = (shouldSend = true) => {
    if (!mediaRecorderRef.current) return;
    if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);

    const durationSec = recordSeconds;
    setIsRecording(false);
    setRecordSeconds(0);
    sound.playRecordStop();

    const recorder = mediaRecorderRef.current;
    recorder.onstop = () => {
      recorder.stream.getTracks().forEach(track => track.stop());

      if (shouldSend && audioChunksRef.current.length > 0) {
        const mime = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mime });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result;
          const mins = Math.floor(durationSec / 60);
          const secs = durationSec % 60;
          const formatted = `${mins}:${secs.toString().padStart(2, '0')}`;
          onSendMessage({
            type: 'audio',
            mediaUrl: base64Audio,
            duration: formatted
          });
        };
        reader.readAsDataURL(audioBlob);
      }
    };

    recorder.stop();
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className="chat-page-root"
      onClick={() => setSelectedMsgReactionId(null)}
    >
      {/* Hidden File Input for Photos */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handlePhotoSelect}
      />

      {/* Top Stranger Info & Control Bar */}
      <div className="chat-top-header glass-panel">
        {/* Stranger Profile Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            position: 'relative',
            fontSize: '22px',
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'rgba(6,182,212,0.18)',
            border: '1px solid rgba(6,182,212,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {partner?.avatar || '👤'}
            <span style={{
              position: 'absolute',
              bottom: '-1px',
              right: '-1px',
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              backgroundColor: partnerLeft ? '#f43f5e' : '#10b981',
              border: '2px solid #07080d'
            }} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ 
                fontWeight: '700', 
                fontSize: '15px', 
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {partner?.nickname || 'Anonymous Stranger'}
              </span>
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '5px',
                background: partnerLeft ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
                color: partnerLeft ? '#fb7185' : '#34d399',
                fontWeight: '700',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap'
              }}>
                {partnerLeft ? 'DISCONNECTED' : 'ENCRYPTED'}
              </span>
            </div>

            <div className="chat-header-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: partnerLeft ? '#f43f5e' : '#10b981', display: 'inline-block' }}></span>
              <span>1-on-1 Anonymous Session • Photos & Audio</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="chat-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            disabled={nextCooldown > 0}
            onClick={onNextStranger}
            className="btn-primary"
            style={{
              padding: '7px 12px',
              fontSize: '12.5px',
              borderRadius: '9px',
              background: nextCooldown > 0 
                ? 'rgba(255,255,255,0.08)' 
                : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              border: nextCooldown > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              color: nextCooldown > 0 ? '#94a3b8' : '#ffffff',
              cursor: nextCooldown > 0 ? 'not-allowed' : 'pointer',
              opacity: nextCooldown > 0 ? 0.8 : 1,
              boxShadow: nextCooldown > 0 ? 'none' : '0 4px 15px rgba(6,182,212,0.3)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap'
            }}
            title={nextCooldown > 0 ? `Please stay in chat for at least ${nextCooldown}s before skipping` : "Find Next Stranger"}
          >
            {nextCooldown > 0 ? (
              <>
                <Clock size={13} />
                <span>Next ({nextCooldown}s)</span>
              </>
            ) : (
              <>
                <RotateCw size={13} />
                <span>Next<span className="chat-action-btn-text"> Stranger</span></span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="btn-danger"
            style={{ 
              padding: '7px 12px', 
              fontSize: '12.5px', 
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap'
            }}
          >
            <LogOut size={13} />
            <span><span className="chat-action-btn-text">End </span>Chat</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showExitConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '26px', background: '#0e111a', textAlign: 'center' }}>
            <AlertTriangle size={36} color="#fb7185" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#fff' }}>Leave This Conversation?</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', lineHeight: 1.5 }}>
              All messages, photos, and voice notes will be instantly and permanently wiped for both users.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="btn-secondary"
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                Stay in Chat
              </button>
              <button
                type="button"
                onClick={() => { setShowExitConfirm(false); onLeaveChat(); }}
                className="btn-danger"
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                Disconnect & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Preview Modal before sending */}
      {selectedPhotoPreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '460px',
            width: '100%',
            padding: '20px',
            background: '#0d101a',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>Send Anonymous Photo</span>
              <button
                type="button"
                onClick={() => setSelectedPhotoPreview(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '14px',
              maxHeight: '320px',
              background: '#000'
            }}>
              <img
                src={selectedPhotoPreview}
                alt="Selected preview"
                style={{ width: '100%', maxHeight: '320px', objectFit: 'contain' }}
              />
            </div>

            <input
              type="text"
              value={photoCaption}
              onChange={(e) => setPhotoCaption(e.target.value)}
              placeholder="Add an optional caption..."
              maxLength={200}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
                fontSize: '13.5px',
                marginBottom: '16px',
                outline: 'none'
              }}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedPhotoPreview(null)}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendPhoto}
                className="btn-primary"
                style={{ padding: '8px 20px', fontSize: '13px' }}
              >
                <Send size={15} />
                <span>Send Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* High-Res Photo Lightbox Modal */}
      {activeLightboxImg && (
        <div 
          className="lightbox-overlay"
          onClick={() => setActiveLightboxImg(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActiveLightboxImg(null)}
              style={{
                position: 'absolute',
                top: '-42px',
                right: '0',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#fff',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
            <img
              src={activeLightboxImg}
              alt="Enlarged photo"
              style={{
                maxWidth: '90vw',
                maxHeight: '85vh',
                borderRadius: '14px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      )}

      {/* Main Message Stream Container */}
      {/* Main Message Stream Container */}
      <div className="chat-message-stream glass-panel">
        {/* System Encryption Header Notice */}
        <div style={{
          textAlign: 'center',
          margin: '2px auto 12px',
          maxWidth: '520px',
          padding: '8px 14px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          fontSize: '11.5px',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '7px'
        }}>
          <ShieldCheck size={15} color="#10b981" />
          <span>
            Connected anonymously. Messages, photos, and voice notes vanish forever when either leaves.
          </span>
        </div>

        {/* Message Bubbles */}
        {messages.map((msg) => {
          const isMe = msg.isMe;
          const isSelected = selectedMsgReactionId === msg.id;

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isMe ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end',
                gap: '8px',
                width: '100%',
                position: 'relative'
              }}
            >
              {!isMe && (
                <div style={{
                  fontSize: '15px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(6,182,212,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginBottom: '2px'
                }}>
                  {partner?.avatar || '👤'}
                </div>
              )}

              <div style={{
                maxWidth: '82%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start',
                position: 'relative'
              }}>
                {/* Floating Reaction Picker Popover */}
                {isSelected && (
                  <div 
                    className={`message-reaction-picker ${isMe ? '' : 'partner-bubble'}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {['❤️', '🔥', '😂', '💀', '👍', '😮'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReactMessage?.(msg.id, emoji);
                          setSelectedMsgReactionId(null);
                        }}
                        title={`React with ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Bubble Container */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMsgReactionId(isSelected ? null : msg.id);
                  }}
                  title="Click or tap to react"
                  style={{
                    padding: msg.type === 'image' ? '6px' : '10px 14px',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isMe 
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' 
                      : 'rgba(25, 30, 45, 0.92)',
                    border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    fontSize: '14px',
                    lineHeight: '1.45',
                    wordBreak: 'break-word',
                    boxShadow: isMe ? '0 4px 14px rgba(139,92,246,0.25)' : '0 2px 8px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'transform 0.1s ease'
                  }}
                >
                  {/* Image Message Bubble */}
                  {msg.type === 'image' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div 
                        style={{ position: 'relative', cursor: 'pointer', borderRadius: '12px', overflow: 'hidden' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLightboxImg(msg.mediaUrl);
                        }}
                        title="Click to view full photo"
                      >
                        <img
                          src={msg.mediaUrl}
                          alt="Shared anonymous photo"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '260px',
                            borderRadius: '10px',
                            display: 'block',
                            objectFit: 'cover'
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          background: 'rgba(0,0,0,0.6)',
                          borderRadius: '6px',
                          padding: '3px 6px',
                          color: '#fff',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <ZoomIn size={12} />
                        </div>
                      </div>
                      {msg.text && (
                        <div style={{ padding: '4px 8px', fontSize: '13.5px' }}>
                          {msg.text}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Audio Voice Note Bubble */}
                  {msg.type === 'audio' && (
                    <AudioBubblePlayer
                      src={msg.mediaUrl}
                      duration={msg.duration}
                      isMe={isMe}
                    />
                  )}

                  {/* Standard Text Message */}
                  {(!msg.type || msg.type === 'text') && (
                    <div>{msg.text}</div>
                  )}
                </div>

                {/* Attached Reaction Badges */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="bubble-reactions-tray">
                    {Array.from(new Set(msg.reactions)).map((emoji, idx) => {
                      const count = msg.reactions.filter((r) => r === emoji).length;
                      return (
                        <span
                          key={idx}
                          className="reaction-badge"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReactMessage?.(msg.id, emoji);
                          }}
                          title={`Reacted ${count} time(s)`}
                        >
                          {emoji} {count > 1 ? count : ''}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Timestamp & Delivery Receipt */}
                <div style={{
                  fontSize: '10px',
                  color: '#64748b',
                  marginTop: '3px',
                  paddingLeft: '4px',
                  paddingRight: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>{formatTime(msg.timestamp)}</span>
                  {isMe && (
                    <span 
                      style={{ 
                        fontSize: '11px', 
                        color: msg.delivered ? '#38bdf8' : '#94a3b8',
                        fontWeight: msg.delivered ? '700' : '500'
                      }}
                      title={msg.delivered ? 'Delivered to partner' : 'Sent'}
                    >
                      {msg.delivered ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {partnerTyping && !partnerLeft && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '4px'
          }}>
            <div style={{
              fontSize: '14px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(6,182,212,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {partner?.avatar || '👤'}
            </div>
            <div style={{
              background: 'rgba(25, 30, 45, 0.75)',
              padding: '8px 14px',
              borderRadius: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px' }}>Stranger is typing...</span>
            </div>
          </div>
        )}

        {/* Partner Disconnected Banner */}
        {partnerLeft && (
          <div style={{
            marginTop: 'auto',
            padding: '20px',
            borderRadius: '16px',
            background: 'rgba(244,63,94,0.1)',
            border: '1px solid rgba(244,63,94,0.25)',
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease'
          }}>
            <h4 style={{ fontSize: '17px', color: '#fb7185', marginBottom: '6px' }}>
              Stranger has disconnected
            </h4>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
              Your partner has left the conversation. What would you like to do next?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={onNextStranger}
                className="btn-primary"
                style={{ padding: '10px 20px', fontSize: '14px' }}
              >
                <RotateCw size={16} />
                <span>Find Another Stranger</span>
              </button>
              <button
                type="button"
                onClick={onLeaveChat}
                className="btn-secondary"
                style={{ padding: '10px 18px', fontSize: '14px' }}
              >
                <Home size={16} />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reaction & Icebreaker Bar */}
      {!partnerLeft && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 4px 6px',
          gap: '8px'
        }}>
          {/* Reaction Tray */}
          <div className="no-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => sendReaction(emoji)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Icebreaker button */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowIcebreakers(!showIcebreakers)}
              style={{
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: '8px',
                padding: '5px 12px',
                color: '#c084fc',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Sparkles size={13} />
              <span>Break The Ice</span>
            </button>

            {/* Icebreaker popover dropdown */}
            {showIcebreakers && (
              <div className="glass-panel" style={{
                position: 'absolute',
                bottom: '36px',
                right: 0,
                width: '320px',
                padding: '12px',
                background: '#0d101a',
                zIndex: 40,
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
              }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#e2e8f0', marginBottom: '8px' }}>
                  Pick a Conversation Starter:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                  {ICEBREAKERS.map((question, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => sendIcebreaker(question)}
                      style={{
                        textAlign: 'left',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        color: '#cbd5e1',
                        fontSize: '12px',
                        cursor: 'pointer',
                        lineHeight: 1.35
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(139,92,246,0.2)';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.color = '#cbd5e1';
                      }}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input Bar or Live Voice Recording Console */}
      {!partnerLeft ? (
        isRecording ? (
          /* LIVE VOICE RECORDING CONSOLE */
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderRadius: '16px',
            background: 'rgba(22, 18, 32, 0.95)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            boxShadow: '0 0 20px rgba(244, 63, 94, 0.2)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Pulsing red dot */}
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                boxShadow: '0 0 10px #ef4444'
              }} className="animate-pulse" />

              <span style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#fff',
                fontFamily: 'var(--font-mono)'
              }}>
                {formatTimer(recordSeconds)}
              </span>

              {/* Animated Waveform */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
              </div>

              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Recording voice note...
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Trash/Cancel Button */}
              <button
                type="button"
                onClick={() => stopRecording(false)}
                title="Cancel Voice Note"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  color: '#fb7185',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                <Trash2 size={15} />
                <span>Discard</span>
              </button>

              {/* Send Voice Note Button */}
              <button
                type="button"
                onClick={() => stopRecording(true)}
                className="btn-primary"
                style={{
                  padding: '8px 18px',
                  fontSize: '13px',
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)'
                }}
              >
                <Send size={15} />
                <span>Send Audio</span>
              </button>
            </div>
          </div>
        ) : (
          /* STANDARD INPUT FORM WITH PHOTO & MIC BUTTONS */
          <form onSubmit={handleSendText} className="chat-composer-box" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Photo Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Share an Anonymous Photo"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#38bdf8',
                borderRadius: '13px',
                padding: '11px 13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <ImageIcon size={18} />
            </button>

            {/* Text Input */}
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message or share..."
                maxLength={1000}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '13px',
                  background: 'rgba(18, 20, 30, 0.9)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-purple)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>

            {/* Voice Note Recording Button */}
            <button
              type="button"
              onClick={startRecording}
              title="Record Voice Note"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#c084fc',
                borderRadius: '13px',
                padding: '11px 13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <Mic size={18} />
            </button>

            {/* Text Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="btn-primary"
              style={{
                padding: '11px 18px',
                borderRadius: '13px',
                fontSize: '14px',
                flexShrink: 0
              }}
            >
              <Send size={16} />
            </button>
          </form>
        )
      ) : null}
    </div>
  );
}
