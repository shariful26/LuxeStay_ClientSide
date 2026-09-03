import React, { useState, useEffect } from 'react';
import { Search, Send, Settings, User, Bell, Phone, Mail, MoreHorizontal, Globe, Trash, Info, Sparkles, Smile, Paperclip, ChevronDown, Check, X, ShieldAlert, Download, Eye, MessageSquare, ArrowLeft, ThumbsUp, Heart, Star, Edit2, Trash2 } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../context/MessageContext';
import { getInstantData } from '../../utils/instantCache';

export const ManagerMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => getInstantData('messages', []));
  const [activeChatId, setActiveChatId] = useState('');
  const [mobileTab, setMobileTab] = useState('chat'); // 'list' | 'chat'
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = React.useRef(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);
  const [fetchedProfiles, setFetchedProfiles] = useState({});
  const messagesEndRef = React.useRef(null);
  const prevMessagesLengthRef = React.useRef(0);
  const prevActiveChatIdRef = React.useRef('');

  const { fetchMessages: contextFetchMessages, messages: contextMessages, markChatAsRead, setUnreadCount, deleteMessageFromContext, clearConversationFromContext } = useMessages();
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState('');
  const [isThreadMenuOpen, setIsThreadMenuOpen] = useState(false);

  // Sync with centralized messages when updated
  useEffect(() => {
    if (Array.isArray(contextMessages) && contextMessages.length > 0) {
      setMessages(prev => {
        const serverIds = new Set(contextMessages.map(m => m.id));
        const pending = prev.filter(m => !serverIds.has(m.id));
        const merged = [...contextMessages, ...pending];
        try { localStorage.setItem('luxestay_cache_messages', JSON.stringify(merged)); } catch (e) {}
        return merged;
      });
    }
  }, [contextMessages]);

  const fetchMessages = () => {
    if (typeof document !== 'undefined' && document.hidden) return;
    const myId = user?.id || 'manager';
    fetch(`/api/messages?userId=${encodeURIComponent(myId)}&role=manager&limit=50`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages(prev => {
            const serverIds = new Set(data.map(m => m.id));
            const pending = prev.filter(m => !serverIds.has(m.id));
            const merged = [...data, ...pending];
            try { localStorage.setItem('luxestay_cache_messages', JSON.stringify(merged)); } catch (e) {}
            return merged;
          });
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchMessages();
    // Reasonable 30-second background refresh (reduced from aggressive 1.5s)
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch real profile details dynamically ONLY for the active chat guest (lazy-load instead of bulk loop)
  useEffect(() => {
    if (!activeChatId || activeChatId === 'customer' || activeChatId === 'manager' || activeChatId === 'admin') return;
    if (fetchedProfiles[activeChatId]) return;

    setFetchedProfiles(prev => ({ ...prev, [activeChatId]: { loading: true } }));
    fetch(`/api/users/${encodeURIComponent(activeChatId)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.name) {
          setFetchedProfiles(prev => ({
            ...prev,
            [activeChatId]: {
              name: data.name || 'Guest Customer',
              avatar: data.avatar && !data.avatar.includes('photo-1534528741775')
                ? data.avatar
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'Guest')}&background=0284c7&color=fff&bold=true`,
              phone: data.phone || '+1 (555) 000-0000',
              email: data.email || `${activeChatId}@example.com`,
              status: 'Guest • Online',
              country: data.country || 'United States'
            }
          }));
        }
      })
      .catch(() => {});
  }, [activeChatId, fetchedProfiles]);

  // Group messages by customer and include admin channel
  const chatGroups = {
    admin: {
      id: 'admin',
      name: 'LuxeStay Super Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      phone: '+1 (800) 555-LUXE',
      email: 'admin@luxestay.com',
      status: 'Super Admin • Online',
      country: 'United States',
      role: 'admin',
      messages: []
    }
  };

  messages.forEach(msg => {
    const isAdminMsg = msg.senderRole === 'admin' || msg.recipientRole === 'admin' || msg.recipientId === 'admin';
    if (isAdminMsg) {
      chatGroups.admin.messages.push({
        id: msg.id,
        sender: msg.senderRole === 'admin' ? 'admin' : 'manager',
        senderRole: msg.senderRole,
        senderName: msg.senderName,
        text: msg.text,
        time: msg.time,
        read: msg.read,
        edited: msg.edited,
        senderAvatar: msg.senderAvatar
      });
      return;
    }

    const customerId = msg.senderRole === 'customer' 
      ? (msg.senderId || 'customer') 
      : (msg.recipientRole === 'customer' ? (msg.recipientId || 'customer') : 'customer');
    const customerName = msg.senderRole === 'customer' ? msg.senderName : msg.recipientName;
    const customerAvatar = msg.senderRole === 'customer' ? msg.senderAvatar : null;

    const resolvedProfile = fetchedProfiles[customerId] || {
      name: customerName || 'Verified Guest',
      avatar: customerAvatar && !customerAvatar.includes('photo-1534528741775')
        ? customerAvatar
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName || 'Guest')}&background=0284c7&color=fff&bold=true`,
      phone: '+1 (555) 000-0000',
      email: `${customerId}@example.com`,
      status: 'Guest • Online',
      country: 'United States'
    };

    if (!chatGroups[customerId]) {
      chatGroups[customerId] = {
        id: customerId,
        name: resolvedProfile.name,
        avatar: resolvedProfile.avatar,
        phone: resolvedProfile.phone,
        email: resolvedProfile.email,
        status: resolvedProfile.status,
        country: resolvedProfile.country || 'United Kingdom',
        messages: []
      };
    }

    const isCustomer = msg.senderRole === 'customer' || msg.senderId === customerId;

    chatGroups[customerId].messages.push({
      id: msg.id,
      sender: isCustomer ? customerId : 'manager',
      senderRole: msg.senderRole,
      senderName: msg.senderName,
      text: msg.text,
      time: msg.time,
      read: msg.read,
      edited: msg.edited,
      senderAvatar: msg.senderAvatar
    });
  });

  // Set first chat active if none is selected
  useEffect(() => {
    if (!activeChatId && Object.keys(chatGroups).length > 0) {
      setActiveChatId(Object.keys(chatGroups)[0]);
    }
  }, [chatGroups, activeChatId]);

  // Mark active chat messages as read
  const markMessagesAsRead = (partnerId) => {
    if (!partnerId) return;
    const pId = String(partnerId).trim();

    // 1. Optimistic UI update for instant decrement
    setMessages(prev => prev.map(m => {
      const match = String(m.senderId) === pId || m.senderRole === pId;
      if (match && !m.read) return { ...m, read: true };
      return m;
    }));

    if (markChatAsRead) {
      markChatAsRead(pId);
    }

    // 2. Persist to MongoDB Atlas
    fetch('/api/messages/read', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: pId,
        recipientId: user?.id || 'manager',
        role: 'manager'
      })
    }).catch(() => {});
  };

  useEffect(() => {
    if (activeChatId) {
      markMessagesAsRead(activeChatId);
    }
  }, [activeChatId]);

  // Individual message Edit Handler (Strict single message edit)
  const handleSaveEdit = async (msgId) => {
    if (!editMessageText.trim() || !msgId) return;
    const cleanText = editMessageText.trim();
    const targetId = String(msgId).trim();

    setMessages(prev => {
      const updated = prev.map(m => {
        const match = String(m.id || m._id) === targetId;
        return match ? { ...m, text: cleanText, edited: true } : m;
      });
      try { localStorage.setItem('luxestay_cache_messages', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    setEditingMessageId(null);
    setEditMessageText('');

    try {
      await fetch(`/api/messages/${encodeURIComponent(targetId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText })
      });
    } catch (e) {
      console.error('Failed to edit message:', e);
    }
  };

  // Individual message Delete Handler (Strict single message deletion)
  const handleDeleteMessage = async (msgId) => {
    if (!msgId) return;
    if (!window.confirm('Delete this message?')) return;
    const targetId = String(msgId).trim();

    setMessages(prev => {
      const updated = prev.filter(m => String(m.id || m._id) !== targetId);
      try { localStorage.setItem('luxestay_cache_messages', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    if (deleteMessageFromContext) deleteMessageFromContext(targetId);

    try {
      await fetch(`/api/messages/${encodeURIComponent(targetId)}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.error('Failed to delete message:', e);
    }
  };

  // Clear Conversation Handler (3-dot menu Action - Deletes from MongoDB Atlas permanently)
  const handleClearConversation = async () => {
    if (!window.confirm(`Delete all messages with ${activeChatData?.name || 'this contact'}?`)) return;

    const partnerId = activeChatId;
    setIsThreadMenuOpen(false);

    setMessages(prev => {
      const updated = prev.filter(m => {
        const match = (String(m.senderId) === partnerId || m.senderRole === partnerId) ||
                      (String(m.recipientId) === partnerId || m.recipientRole === partnerId);
        return !match;
      });
      try { localStorage.setItem('luxestay_cache_messages', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    if (clearConversationFromContext) clearConversationFromContext(partnerId);

    try {
      await fetch('/api/messages/clear-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user1: user?.id || 'manager',
          user2: partnerId
        })
      });
    } catch (e) {
      console.error('Failed to clear conversation:', e);
    }
  };

  // Mark all messages in active thread as read
  const handleMarkAllAsRead = () => {
    markMessagesAsRead(activeChatId);
    setIsThreadMenuOpen(false);
  };

  // Export Chat transcript to text file
  const handleExportChat = () => {
    setIsThreadMenuOpen(false);
    const msgs = activeChatData?.messages || [];
    if (msgs.length === 0) return alert('No messages to export.');

    const content = msgs.map(m => `[${m.time}] ${m.senderName || m.sender}: ${m.text}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chat_${activeChatData?.name || 'Conversation'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeChatData = chatGroups[activeChatId] || Object.values(chatGroups)[0] || null;

  // Scroll to bottom on chat switch or actual new messages
  useEffect(() => {
    const activeMessages = activeChatData?.messages || [];
    const currentLength = activeMessages.length;
    if (activeChatId !== prevActiveChatIdRef.current || currentLength > prevMessagesLengthRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      prevActiveChatIdRef.current = activeChatId;
      prevMessagesLengthRef.current = currentLength;
    }
  }, [messages, activeChatId, activeChatData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setAttachment({
        name: file.name,
        data: evt.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachment) return;

    const myId = user?.id ? String(user.id) : 'manager';
    const myName = user?.name || 'Hotel Manager';
    const myRole = 'manager';
    const myAvatar = user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

    const sendPayload = (textValue) => {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const optimisticMsg = {
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        senderId: myId,
        senderName: myName,
        senderRole: myRole,
        senderAvatar: myAvatar,
        recipientId: activeChatId === 'admin' ? 'admin' : (activeChatData?.id || 'customer'),
        recipientName: activeChatData ? activeChatData.name : (activeChatId === 'admin' ? 'LuxeStay Super Admin' : 'Guest Customer'),
        recipientRole: activeChatId === 'admin' ? 'admin' : 'customer',
        text: textValue,
        time: nowTime,
        read: false,
        createdAt: new Date().toISOString()
      };

      // 0ms Optimistic UI Update: Render immediately!
      setMessages(prev => {
        const updated = [...prev, optimisticMsg];
        try { localStorage.setItem('luxestay_cache_messages', JSON.stringify(updated)); } catch (e) {}
        return updated;
      });

      // Background persistence to MongoDB Atlas
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(optimisticMsg)
      })
        .then(res => res.json())
        .then(savedMsg => {
          if (savedMsg && savedMsg.id) {
            setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? savedMsg : m));
          }
        })
        .catch(() => {});
    };

    if (newMessage.trim()) {
      sendPayload(newMessage.trim());
      setNewMessage('');
    }

    if (attachment) {
      sendPayload(attachment.data);
      setAttachment(null);
    }
  };

  return (
    <PortalLayout role="manager" title="LuxStay Guest Messages">
      <div className="max-w-7xl mx-auto font-sans text-slate-800 animate-fade-in pb-4">
        
        {/* Mobile Tab Switcher Pills */}
        <div className="lg:hidden flex items-center gap-2 mb-3 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> All Chats ({Object.keys(chatGroups).length})
          </button>
          <button
            onClick={() => setMobileTab('chat')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'chat' ? 'bg-[#e2f896] text-slate-950 shadow-xs' : 'text-slate-500'
            }`}
          >
            <Send className="w-3.5 h-3.5" /> Active Conversation
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch h-[calc(100vh-140px)] min-h-[550px] max-h-[820px]">
          
          {/* LEFT PANEL: Chat List Channels (3/12 cols) */}
          <div className={`lg:col-span-3 bg-white rounded-3xl border border-slate-200/70 shadow-md p-4 flex flex-col justify-between h-full ${
            mobileTab === 'list' ? 'flex' : 'hidden lg:flex'
          }`}>
            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
                <h3 className="text-base font-extrabold text-slate-900">Messages</h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase">
                  Active Chats
                </span>
              </div>

              {/* Search chat */}
              <div className="relative shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search name, chat, etc"
                  className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 text-xs bg-slate-50 outline-none focus:bg-white font-medium"
                />
              </div>

              {/* Channels List */}
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
                {Object.values(chatGroups).length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 font-bold">No active conversations</div>
                ) : (
                  Object.values(chatGroups).map((chat) => {
                    const isActive = activeChatId === chat.id;
                    const lastMsg = chat.messages[chat.messages.length - 1];
                    const unreadMsgs = chat.messages.filter(m => m.sender !== 'manager' && !m.read);
                    const hasUnread = unreadMsgs.length > 0;
                    return (
                      <div 
                        key={chat.id}
                        onClick={() => {
                          setActiveChatId(chat.id);
                          setMobileTab('chat');
                        }}
                        className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                          isActive ? 'bg-[#e2f896] text-slate-950 font-extrabold shadow-sm' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <img src={chat.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black truncate block flex items-center gap-1.5">
                              {chat.name}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0 ml-1">
                              {hasUnread && (
                                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black shrink-0 animate-pulse shadow-xs" title="Unread Messages">
                                  {unreadMsgs.length}
                                </span>
                              )}
                              <span className={`text-[9px] font-bold ${hasUnread ? 'text-rose-500 font-black' : 'text-slate-400'}`}>{lastMsg?.time || '10:00 AM'}</span>
                            </div>
                          </div>
                          <p className={`text-[11px] font-medium truncate mt-0.5 ${hasUnread ? 'text-slate-950 font-bold' : 'text-slate-500'}`}>{lastMsg?.text || 'No messages yet'}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* MIDDLE PANEL: Active Chat Thread (6/12 cols) */}
          <div className={`lg:col-span-6 bg-white rounded-3xl border border-slate-200/70 shadow-md p-3 sm:p-4 flex flex-col justify-between h-full overflow-hidden ${
            mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}>
            {!activeChatData ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <MessageSquare className="w-12 h-12 text-slate-300 animate-bounce" />
                <h4 className="text-sm font-extrabold text-slate-900">No active conversation selected</h4>
                <button
                  onClick={() => setMobileTab('list')}
                  className="lg:hidden px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  View All Chats
                </button>
              </div>
            ) : (
              <>
                {/* Thread Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setMobileTab('list')}
                      className="lg:hidden p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 text-xs font-black mr-1"
                      title="Back to all chats"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <img src={activeChatData.avatar} className="w-9 h-9 rounded-full object-cover shrink-0" />
                    <div>
                      <h4 className="text-sm font-black text-slate-900 leading-none">{activeChatData.name}</h4>
                      <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{activeChatData.status}</p>
                    </div>
                  </div>

                  {/* 3-Dot Thread Action Menu */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsThreadMenuOpen(prev => !prev)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                      title="More options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {isThreadMenuOpen && (
                      <div className="absolute right-0 top-9 w-48 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xl z-50 animate-fade-in text-xs font-bold space-y-1">
                        <button
                          onClick={handleMarkAllAsRead}
                          className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-all cursor-pointer text-left"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Mark as Read</span>
                        </button>
                        <button
                          onClick={handleExportChat}
                          className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-all cursor-pointer text-left"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-500" />
                          <span>Export Transcript</span>
                        </button>
                        <div className="border-t border-slate-100 my-1" />
                        <button
                          onClick={handleClearConversation}
                          className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-all cursor-pointer text-left font-black"
                        >
                          <Trash className="w-3.5 h-3.5 text-rose-500" />
                          <span>Clear All Messages</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message History */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 min-h-0">
                  {activeChatData.messages.map((msg, idx) => {
                    const isGuest = msg.sender === activeChatData.id || msg.sender === 'customer';
                    const isImage = msg.text && msg.text.startsWith('data:image/');
                    const msgKey = String(msg.id || msg.raw?.id || msg.raw?._id || `msg-${idx}`);

                    return (
                      <div key={msgKey} className={`flex items-end gap-2 group/msg relative ${isGuest ? 'justify-start' : 'justify-end'}`}>
                        {isGuest && (
                          <img 
                            src={msg.senderAvatar || activeChatData.avatar} 
                            className="w-7 h-7 rounded-full object-cover border border-slate-100 flex-shrink-0 mb-1" 
                            alt="" 
                          />
                        )}

                        {/* Hover Action Bar for Message Edit & Delete */}
                        <div className={`opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center gap-1 mb-1 self-center ${isGuest ? 'order-last' : 'order-first'}`}>
                          {!isGuest && !isImage && (
                            <button
                              onClick={() => {
                                setEditingMessageId(msgKey);
                                setEditMessageText(msg.text);
                              }}
                              className="p-1 rounded-lg bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-500 transition-all cursor-pointer shadow-xs"
                              title="Edit message"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMessage(msgKey)}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-500 transition-all cursor-pointer shadow-xs"
                            title="Delete message"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className={isImage ? "max-w-[78%]" : `max-w-[78%] sm:max-w-[70%] p-3 sm:p-3.5 rounded-3xl text-xs ${
                          isGuest 
                            ? 'bg-[#e2f896] text-slate-950 font-bold rounded-tl-none shadow-2xs' 
                            : 'bg-slate-900 text-white font-medium rounded-tr-none'
                        }`}>
                          {editingMessageId === msgKey ? (
                            <div className="space-y-1.5 min-w-[200px]">
                              <input
                                type="text"
                                value={editMessageText}
                                onChange={(e) => setEditMessageText(e.target.value)}
                                className="w-full p-2 text-xs rounded-xl bg-slate-800 text-white outline-none border border-amber-500 font-medium"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(msgKey);
                                  if (e.key === 'Escape') setEditingMessageId(null);
                                }}
                              />
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setEditingMessageId(null)}
                                  className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-[10px] cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleSaveEdit(msgKey)}
                                  className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] cursor-pointer"
                                  title="Save edit"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : isImage ? (
                            <div className="relative group/image overflow-hidden rounded-2xl">
                              <img 
                                src={msg.text} 
                                className="w-48 h-36 sm:w-56 sm:h-40 object-cover rounded-2xl shadow-md transition-all group-hover/image:opacity-90" 
                                alt="Attachment" 
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setActiveLightboxImage(msg.text);
                                  }}
                                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all scale-90 hover:scale-100 cursor-pointer"
                                  title="View Full Size"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <a 
                                  href={msg.text} 
                                  download={`LuxeStay_Attachment_${idx}.png`}
                                  className="p-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white transition-all scale-90 hover:scale-100 cursor-pointer flex items-center justify-center"
                                  title="Download Image"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          ) : (
                            <p className="leading-relaxed break-words">
                              {msg.text}
                              {msg.edited && <span className="text-[9px] opacity-60 italic ml-1">(edited)</span>}
                            </p>
                          )}
                          <span className={`text-[8px] mt-1 block text-right font-bold ${isGuest ? 'text-slate-500' : 'text-slate-400'}`}>
                            {msg.time}
                          </span>
                        </div>

                        {!isGuest && (
                          <img 
                            src={user?.avatar && !user.avatar.includes('photo-1534528741775') ? user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Manager')}&background=0284c7&color=fff&bold=true`} 
                            className="w-7 h-7 rounded-full object-cover border border-slate-100 flex-shrink-0 mb-1" 
                            alt="" 
                          />
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Controls Panel (ALWAYS VISIBLE & LOCKED AT BOTTOM) */}
                <div className="pt-2 border-t border-slate-100 bg-slate-50/80 p-2 sm:p-2.5 rounded-2xl relative shrink-0 space-y-2">
                  {/* Emoji / Reaction Picker Box */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-16 left-2 bg-white border border-slate-200 rounded-2xl p-2 shadow-lg flex items-center gap-1.5 z-20 animate-fade-in text-xs select-none">
                      {[
                        { label: 'Thank You', icon: <Smile className="w-4 h-4 text-amber-500" />, text: 'Thank you!' },
                        { label: 'Sounds Great', icon: <ThumbsUp className="w-4 h-4 text-blue-500" />, text: 'Sounds great!' },
                        { label: 'Much Appreciated', icon: <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />, text: 'Much appreciated!' },
                        { label: 'Looking Forward', icon: <Sparkles className="w-4 h-4 text-amber-400" />, text: 'Looking forward to hosting you!' },
                        { label: '5-Star Quality', icon: <Star className="w-4 h-4 text-amber-500 fill-amber-400" />, text: '5-Star Hospitality guaranteed!' },
                        { label: 'Confirmed', icon: <Check className="w-4 h-4 text-emerald-500" />, text: 'Reservation verified and confirmed!' }
                      ].map(item => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => handleEmojiSelect(item.text)}
                          className="p-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center"
                          title={item.label}
                        >
                          {item.icon}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Attachment indicator banner */}
                  {attachment && (
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-[#e2f896]/30 border border-[#e2f896]/60 w-fit max-w-full text-[10px] font-extrabold text-slate-800">
                      <span className="flex items-center gap-1"><Paperclip className="w-3.5 h-3.5 text-slate-600" /> Attachment: {attachment.name.substring(0, 15)}...</span>
                      <button
                        type="button"
                        onClick={() => setAttachment(null)}
                        className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer"
                        title="Remove attachment"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2">
                    <button 
                      type="button" 
                      onClick={() => setShowEmojiPicker(prev => !prev)}
                      className={`p-2 rounded-full border text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0 ${showEmojiPicker ? 'border-slate-300 text-slate-700 bg-slate-100' : 'border-slate-200'}`}
                      title="Add Emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange} 
                    />
                    
                    <input 
                      type="text" 
                      placeholder="Type your response..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        if (showEmojiPicker) setShowEmojiPicker(false);
                      }}
                      className="flex-1 min-w-0 px-3.5 py-2.5 rounded-full border border-slate-200 text-xs outline-none bg-white focus:border-amber-400 text-slate-800 font-medium"
                    />

                    <button 
                      type="submit"
                      className="p-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer shadow-xs shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>

          {/* RIGHT PANEL: Guest Details & Shared Assets (3/12 cols, desktop only) */}
          <div className="hidden lg:flex lg:col-span-3 bg-white rounded-3xl border border-slate-200/70 shadow-md p-4 flex-col justify-between overflow-y-auto h-full">
            {!activeChatData ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-slate-300">
                <User className="w-10 h-10 mb-2 opacity-50 text-[#e2f896]" />
                <span className="text-[10px] uppercase font-bold tracking-wider">No Profile Selected</span>
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Guest Profile</h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#e2f896] text-[9px] font-black text-slate-900">Popular</span>
                  </div>

                  {/* Headshot */}
                  <div className="text-center space-y-2">
                    <img src={activeChatData.avatar} className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-amber-500/10 shadow-sm" />
                    <div>
                      <h4 className="text-base font-black text-slate-950">{activeChatData.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">ID: LG-{activeChatData.id.toUpperCase()}-09</p>
                    </div>
                  </div>

                  {/* Guest Details */}
                  <div className="space-y-3.5 text-xs font-bold text-slate-700">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider">Phone</span>
                      <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {activeChatData.phone}</p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider">Email Address</span>
                      <p className="flex items-center gap-1.5 max-w-[200px] truncate"><Mail className="w-3.5 h-3.5 text-slate-400" /> {activeChatData.email}</p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider">Location</span>
                      <p className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-slate-400" /> London, United Kingdom</p>
                    </div>
                  </div>

                  {/* Shared Media Assets */}
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-400 uppercase">Shared Media (12)</span>
                      <span className="text-amber-600 cursor-pointer">Show All</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="h-12 rounded-lg overflow-hidden bg-slate-100">
                        <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=100&q=80" className="w-full h-full object-cover" />
                      </div>
                      <div className="h-12 rounded-lg overflow-hidden bg-slate-100">
                        <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=100&q=80" className="w-full h-full object-cover" />
                      </div>
                      <div className="h-12 rounded-lg overflow-hidden bg-slate-100">
                        <img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=100&q=80" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
      {/* Fullscreen Lightbox Modal */}
      {activeLightboxImage && (
        <div 
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <button 
            onClick={() => setActiveLightboxImage(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close Preview"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={activeLightboxImage} 
            alt="Fullscreen preview" 
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/15 animate-scale-in"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </PortalLayout>
  );
};

export const PartnerMessages = ManagerMessages;
export default ManagerMessages;
