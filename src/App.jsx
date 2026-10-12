import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import { socket } from './utils/socket';
import { sound } from './utils/sound';

export default function App() {
  // Navigation & User State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fello_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState('auth'); // 'auth' | 'dashboard' | 'chat'
  const [soundMuted, setSoundMuted] = useState(false);
  const [rateLimitNotice, setRateLimitNotice] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const rateLimitTimeoutRef = useRef(null);

  // Matchmaking & Chat State
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const searchTimerRef = useRef(null);

  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentPartner, setCurrentPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerLeft, setPartnerLeft] = useState(false);

  // Platform Telemetry
  const [stats, setStats] = useState({
    onlineCount: 24,
    waitingCount: 0,
    activeChats: 12
  });

  // Socket Connection and Global Listeners
  useEffect(() => {
    socket.connect();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Fetch initial stats
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(prev => ({ ...prev, ...data })))
      .catch(() => {});

    // Socket Event: Telemetry Update
    socket.on('stats_update', (data) => {
      setStats(data);
    });

    // Socket Event: Rate Limiting Alert
    socket.on('rate_limited', ({ type, message }) => {
      setRateLimitNotice(message);
      if (rateLimitTimeoutRef.current) clearTimeout(rateLimitTimeoutRef.current);
      rateLimitTimeoutRef.current = setTimeout(() => {
        setRateLimitNotice(null);
      }, 3500);
    });

    // Socket Event: Partner Matched!
    socket.on('chat_start', ({ roomId, partner }) => {
      // Clear search timer
      if (searchTimerRef.current) clearInterval(searchTimerRef.current);
      setIsSearching(false);
      setSearchTime(0);

      // Play audio notification
      sound.playMatchFound();

      // Configure room
      setCurrentRoom(roomId);
      setCurrentPartner(partner);
      setMessages([]);
      setPartnerLeft(false);
      setPartnerTyping(false);

      // Transition to chat page
      setCurrentView('chat');
    });

    // Socket Event: Incoming Message
    socket.on('receive_message', (msg) => {
      sound.playMessageReceived();
      setMessages((prev) => [
        ...prev,
        {
          id: msg.id,
          type: msg.type || 'text',
          text: msg.text,
          mediaUrl: msg.mediaUrl,
          duration: msg.duration,
          timestamp: msg.timestamp,
          isMe: false
        }
      ]);
    });

    // Socket Event: Partner Typing Status
    socket.on('partner_typing', ({ isTyping }) => {
      setPartnerTyping(isTyping);
    });

    // Socket Event: Partner Left Chat
    socket.on('partner_left', () => {
      sound.playDisconnect();
      setPartnerLeft(true);
      setPartnerTyping(false);
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('stats_update');
      socket.off('rate_limited');
      socket.off('chat_start');
      socket.off('receive_message');
      socket.off('partner_typing');
      socket.off('partner_left');
    };
  }, []);

  // Sync user state with socket profile
  useEffect(() => {
    if (currentUser) {
      if (currentView === 'auth') {
        setCurrentView('dashboard');
      }
      socket.emit('set_profile', currentUser);
    } else {
      setCurrentView('auth');
    }
  }, [currentUser]);

  // Handle Search Timer ticking
  useEffect(() => {
    if (isSearching) {
      setSearchTime(0);
      searchTimerRef.current = setInterval(() => {
        setSearchTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (searchTimerRef.current) clearInterval(searchTimerRef.current);
      setSearchTime(0);
    }
    return () => {
      if (searchTimerRef.current) clearInterval(searchTimerRef.current);
    };
  }, [isSearching]);

  // Auth Handlers
  const handleAuthenticate = (userData) => {
    setCurrentUser(userData);
    try {
      localStorage.setItem('fello_user', JSON.stringify(userData));
    } catch {}
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    if (currentRoom) {
      socket.emit('leave_chat', { roomId: currentRoom });
    }
    if (isSearching) {
      socket.emit('cancel_search');
      setIsSearching(false);
    }
    localStorage.removeItem('fello_user');
    setCurrentUser(null);
    setCurrentRoom(null);
    setCurrentPartner(null);
    setMessages([]);
    setCurrentView('auth');
  };

  const handleUpdateUser = (updated) => {
    setCurrentUser(updated);
    try {
      localStorage.setItem('fello_user', JSON.stringify(updated));
    } catch {}
    socket.emit('set_profile', updated);
  };

  // Sound Toggle
  const handleToggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundMuted(!sound.enabled);
  };

  // Matchmaking Handlers
  const handleStartSearch = () => {
    setIsSearching(true);
    socket.emit('find_partner', {
      nickname: currentUser.nickname,
      avatar: currentUser.avatar
    });
  };

  const handleDemoSearch = () => {
    socket.emit('request_demo_stranger', {
      nickname: currentUser?.nickname,
      avatar: currentUser?.avatar
    });
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
    socket.emit('cancel_search');
  };

  // Chat Handlers (supports text, photo, audio voice note)
  const handleSendMessage = (payload) => {
    if (!currentRoom) return;

    // Normal string passed or object { text, type, mediaUrl, duration }
    const isObject = typeof payload === 'object' && payload !== null;
    const type = isObject ? (payload.type || 'text') : 'text';
    const text = isObject ? (payload.text || '') : payload;
    const mediaUrl = isObject ? (payload.mediaUrl || null) : null;
    const duration = isObject ? (payload.duration || null) : null;

    if (type === 'text' && (!text || !text.trim())) return;
    if ((type === 'image' || type === 'audio') && !mediaUrl) return;

    const msgObj = {
      id: `msg_me_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      text: text ? text.trim() : '',
      mediaUrl,
      duration,
      timestamp: Date.now(),
      isMe: true
    };

    setMessages((prev) => [...prev, msgObj]);
    sound.playMessageSent();
    socket.emit('send_message', {
      roomId: currentRoom,
      type,
      text: text ? text.trim() : '',
      mediaUrl,
      duration
    });
  };

  const handleTyping = (isTyping) => {
    if (!currentRoom) return;
    socket.emit('typing', { roomId: currentRoom, isTyping });
  };

  const handleLeaveChat = () => {
    if (currentRoom) {
      socket.emit('leave_chat', { roomId: currentRoom });
    }
    setCurrentRoom(null);
    setCurrentPartner(null);
    setMessages([]);
    setPartnerLeft(false);
    setPartnerTyping(false);
    setCurrentView('dashboard');
  };

  const handleNextStranger = () => {
    if (currentRoom) {
      socket.emit('leave_chat', { roomId: currentRoom });
    }
    setCurrentRoom(null);
    setCurrentPartner(null);
    setMessages([]);
    setPartnerLeft(false);
    setPartnerTyping(false);
    setCurrentView('dashboard');
    handleStartSearch();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* App Navbar */}
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
        currentView={currentView}
        isConnected={isConnected}
      />

      {/* Floating Rate Limit Alert */}
      {rateLimitNotice && (
        <div style={{
          position: 'fixed',
          top: '76px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: 'rgba(239, 68, 68, 0.95)',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(239, 68, 68, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13.5px',
          fontWeight: '700',
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease-out',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <AlertTriangle size={18} color="#fef08a" />
          <span>{rateLimitNotice}</span>
        </div>
      )}

      {/* Pages Container */}
      <main style={{ flex: 1 }}>
        {currentView === 'auth' && (
          <AuthPage onAuthenticate={handleAuthenticate} />
        )}

        {currentView === 'dashboard' && currentUser && (
          <DashboardPage
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            onStartSearch={handleStartSearch}
            onDemoSearch={handleDemoSearch}
            onCancelSearch={handleCancelSearch}
            isSearching={isSearching}
            searchTime={searchTime}
            stats={stats}
          />
        )}

        {currentView === 'chat' && currentUser && (
          <ChatPage
            user={currentUser}
            partner={currentPartner}
            roomId={currentRoom}
            messages={messages}
            onSendMessage={handleSendMessage}
            onNextStranger={handleNextStranger}
            onLeaveChat={handleLeaveChat}
            partnerTyping={partnerTyping}
            partnerLeft={partnerLeft}
            onTyping={handleTyping}
          />
        )}
      </main>
    </div>
  );
}
