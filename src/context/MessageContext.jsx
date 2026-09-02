import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const { user } = useAuth();
  const [toast, setToast] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevMessagesRef = useRef([]);
  const isFirstLoadRef = useRef(true);
  const navigate = useNavigate();

  const fetchMessages = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      if (!Array.isArray(data)) return;

      const myId = user.id || 'alice';
      const myRole = user.role || 'customer';

      // Find new messages sent to me
      const incomingMessages = data.filter(msg => {
        if (myRole === 'manager') {
          return msg.recipientId === myId || msg.recipientId === 'partner1';
        }
        return msg.recipientId === myId;
      });

      // Update unread count
      const unread = incomingMessages.filter(m => !m.read).length;
      setUnreadCount(unread);

      if (!isFirstLoadRef.current && incomingMessages.length > prevMessagesRef.current.length) {
        // Find which messages are new
        const prevIds = prevMessagesRef.current.map(m => m.id);
        const newMsgs = incomingMessages.filter(m => !prevIds.includes(m.id));

        if (newMsgs.length > 0 && !window.location.pathname.includes('/messages')) {
          const newest = newMsgs[newMsgs.length - 1];
          
          // Trigger Toast notification
          setToast({
            senderName: newest.senderName || 'LuxeStay Manager',
            text: newest.text,
            avatar: newest.senderRole === 'manager' 
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' 
              : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
            link: myRole === 'manager' ? '/manager/messages' : '/customer/messages'
          });

          // Play audio alert
          try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(880, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.12);
          } catch (e) {}
        }
      }

      prevMessagesRef.current = incomingMessages;
      isFirstLoadRef.current = false;
    } catch (err) {
      // safe fallback on polling failure
    }
  };

  useEffect(() => {
    isFirstLoadRef.current = true;
    prevMessagesRef.current = [];
    setToast(null);
    setUnreadCount(0);
    
    if (user) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Auto hide toast after 2 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const closeToast = () => setToast(null);

  return (
    <MessageContext.Provider value={{ toast, closeToast, unreadCount, fetchMessages }}>
      {children}
      
      {/* Side-Sliding Message Toast Component */}
      {toast && (
        <div 
          onClick={() => {
            navigate(toast.link);
            closeToast();
          }}
          className="fixed bottom-6 right-6 z-[999] max-w-sm w-80 p-4 rounded-3xl bg-[var(--bg-card)]/90 dark:bg-slate-900/90 border border-amber-500/30 backdrop-blur-xl shadow-2xl flex items-start gap-3 cursor-pointer animate-slide-in hover:border-amber-500 transition-all hover:scale-[1.02]"
        >
          <img 
            src={toast.avatar} 
            alt={toast.senderName} 
            className="w-10 h-10 rounded-full object-cover border border-amber-500/20"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-xs font-black text-[var(--text-primary)] truncate flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                {toast.senderName}
              </span>
              <span className="text-[9px] uppercase font-black text-rose-500 tracking-wider">
                New Reply
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed truncate">
              {toast.text}
            </p>
            <span className="text-[8px] font-bold text-amber-500 mt-1 flex items-center gap-1">
              <span>Click to reply</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      )}
    </MessageContext.Provider>
  );
};

export const useMessages = () => useContext(MessageContext);
