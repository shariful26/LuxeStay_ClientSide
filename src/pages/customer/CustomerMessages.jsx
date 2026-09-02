import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, User, Bell, Phone, Mail, Building2, Globe, MessageSquare, ShieldAlert, Smile, Paperclip, Download, Eye, X, ArrowLeft, ThumbsUp, Heart, Sparkles, Star, Check } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { getInstantData } from '../../utils/instantCache';

export const CustomerMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => getInstantData('messages', []));
  const [activeChatId, setActiveChatId] = useState('manager');
  const [mobileTab, setMobileTab] = useState('chat'); // 'list' | 'chat'
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const prevActiveChatIdRef = useRef('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);
  const [fetchedProfiles, setFetchedProfiles] = useState({});

  const fetchMessages = () => {
    fetch('/api/messages')
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
    // Fast real-time polling every 1.5 seconds
    const interval = setInterval(fetchMessages, 1500);
    return () => clearInterval(interval);
  }, []);

  // Fetch real profile details dynamically from backend
  useEffect(() => {
    const myId = user?.id ? String(user.id) : 'customer';
    const partnerIds = [...new Set(messages.map(msg => {
      if (msg.senderRole === 'manager') return msg.senderId;
      if (msg.recipientRole === 'manager') return msg.recipientId;
      return null;
    }).filter(id => Boolean(id) && id !== 'manager' && id !== myId))];

    partnerIds.forEach(id => {
      if (id && !fetchedProfiles[id]) {
        // Mark as requested immediately to prevent loop
        setFetchedProfiles(prev => ({ ...prev, [id]: { loading: true } }));
        fetch(`/api/users/${id}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.name) {
              setFetchedProfiles(prev => ({
                ...prev,
                [id]: {
                  name: data.name || 'Hotel Host',
                  avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                  phone: data.phone || '+1 (555) 000-1122',
                  email: data.email || 'manager@luxestay.com',
                  status: 'Property Host • Online'
                }
              }));
            }
          })
          .catch(() => {});
      }
    });
  }, [messages, user?.id]);

  // Group messages for the customer
  const chatGroups = {
    manager: {
      id: 'manager',
      name: 'LuxeStay Hotel Management',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      phone: '+1 (555) 000-1122',
      email: 'manager@luxestay.com',
      status: 'Property Host • Online',
      messages: []
    }
  };

  messages.forEach(msg => {
    const isCustomerMsg = msg.senderRole === 'customer' || (user?.id && String(msg.senderId) === String(user.id));
    const isManagerMsg = msg.senderRole === 'manager' || msg.recipientRole === 'customer' || (user?.id && String(msg.recipientId) === String(user.id));

    if (!isCustomerMsg && !isManagerMsg) return;

    // Direct into default manager thread or specific partner thread
    const targetKey = 'manager';

    chatGroups[targetKey].messages.push({
      sender: isCustomerMsg ? 'customer' : 'manager',
      senderRole: msg.senderRole,
      senderName: msg.senderName,
      text: msg.text,
      time: msg.time,
      status: msg.status || 'read',
      attachment: msg.attachment || null
    });
  });

  const activeChatData = chatGroups[activeChatId] || Object.values(chatGroups)[0] || null;

  const handleSelectQuickQuestion = (question) => {
    setNewMessage(question);
    setShowEmojiPicker(false);
  };

  // Set first chat active if none is selected
  useEffect(() => {
    if (!activeChatId && Object.keys(chatGroups).length > 0) {
      setActiveChatId(Object.keys(chatGroups)[0]);
    }
  }, [chatGroups, activeChatId]);

  // Mark active chat messages as read
  const markMessagesAsRead = (partnerId) => {
    if (!user || !partnerId) return;
    fetch('/api/messages/read', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: partnerId,
        recipientId: user?.id || 'customer'
      })
    }).catch(() => {});
  };

  useEffect(() => {
    if (activeChatId) {
      markMessagesAsRead(activeChatId);
    }
  }, [activeChatId, messages]);

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

    const myId = user?.id ? String(user.id) : 'customer';
    const myName = user?.name || 'Verified Customer';
    const myRole = 'customer';
    const myAvatar = user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

    const sendPayload = (textValue) => {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const optimisticMsg = {
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        senderId: myId,
        senderName: myName,
        senderRole: myRole,
        senderAvatar: myAvatar,
        recipientId: activeChatId || 'manager',
        recipientName: activeChatData ? activeChatData.name : 'Hotel Management',
        recipientRole: 'manager',
        text: textValue,
        time: nowTime,
        read: false,
        createdAt: new Date().toISOString()
      };

      // 0ms Optimistic UI Update: Render in UI immediately!
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
    <PortalLayout role="customer" title="My Guest Messages">
      <div className="max-w-7xl mx-auto font-sans text-slate-800 dark:text-slate-100 animate-fade-in pb-4">
        
        {/* Mobile Tab Switcher Pills */}
        <div className="lg:hidden flex items-center gap-2 mb-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'list' ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-xs' : 'text-slate-500'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> All Hosts ({Object.keys(chatGroups).length})
          </button>
          <button
            onClick={() => setMobileTab('chat')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'chat' ? 'bg-amber-500 text-slate-950 shadow-xs font-black' : 'text-slate-500'
            }`}
          >
            <Send className="w-3.5 h-3.5" /> Active Conversation
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch h-[calc(100vh-140px)] min-h-[550px] max-h-[820px]">
          
          {/* LEFT PANEL: Channels List (3/12 cols) */}
          <div className={`lg:col-span-3 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-light)] shadow-md p-4 flex flex-col justify-between h-full ${
            mobileTab === 'list' ? 'flex' : 'hidden lg:flex'
          }`}>
            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-light)] shrink-0">
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Messages</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase">
                  Property Hosts
                </span>
              </div>

              {/* Search chat */}
              <div className="relative shrink-0">
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search chats..."
                  className="w-full pl-9 pr-4 py-2 rounded-2xl border border-[var(--border-light)] text-xs bg-[var(--bg-tertiary)] outline-none focus:bg-[var(--bg-card)] font-medium text-[var(--text-primary)]"
                />
              </div>

              {/* Channels List */}
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
                {Object.values(chatGroups).length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 font-bold">No active host chats</div>
                ) : (
                  Object.values(chatGroups).map((chat) => {
                    const isActive = activeChatId === chat.id;
                    const lastMsg = chat.messages[chat.messages.length - 1];
                    const unreadMsgs = chat.messages.filter(m => m.sender !== 'customer' && !m.read);
                    const hasUnread = unreadMsgs.length > 0;
                    return (
                      <div 
                        key={chat.id}
                        onClick={() => {
                          setActiveChatId(chat.id);
                          setMobileTab('chat');
                        }}
                        className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                          isActive 
                            ? 'bg-amber-500/15 border border-amber-500 text-amber-500 font-extrabold shadow-xs' 
                            : 'hover:bg-[var(--bg-tertiary)] border border-transparent text-[var(--text-secondary)]'
                        }`}
                      >
                        <img src={chat.avatar} className="w-10 h-10 rounded-full object-cover border border-[var(--border-light)] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black truncate block text-[var(--text-primary)] flex items-center gap-1.5">
                              {chat.name}
                              {hasUnread && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-ping-once" title="Unread Message" />
                              )}
                            </span>
                            <span className={`text-[9px] font-bold shrink-0 ml-1 ${hasUnread ? 'text-amber-500' : 'text-[var(--text-muted)]'}`}>{lastMsg?.time || ''}</span>
                          </div>
                          <p className={`text-[11px] font-medium truncate mt-0.5 ${hasUnread ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-muted)]'}`}>{lastMsg?.text || 'No messages yet'}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* MIDDLE PANEL: Chat Window (6/12 cols) */}
          <div className={`lg:col-span-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-light)] shadow-md flex flex-col justify-between h-full overflow-hidden ${
            mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}>
            {!activeChatData ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <MessageSquare className="w-12 h-12 text-amber-500 animate-bounce" />
                <h4 className="text-sm font-extrabold text-[var(--text-primary)]">No active conversation</h4>
                <button
                  onClick={() => setMobileTab('list')}
                  className="lg:hidden px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold"
                >
                  View All Hosts
                </button>
              </div>
            ) : (
              <>
                {/* Header info */}
                <div className="p-3 sm:p-4 border-b border-[var(--border-light)] flex items-center justify-between bg-[var(--bg-tertiary)]/30 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setMobileTab('list')}
                      className="lg:hidden p-1.5 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] flex items-center gap-1 text-xs font-black mr-1"
                      title="Back to all hosts"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <img src={activeChatData.avatar} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-[var(--border-light)] shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)] leading-none">{activeChatData.name}</h4>
                      <span className="text-[9px] text-emerald-500 font-bold block mt-0.5">{activeChatData.status}</span>
                    </div>
                  </div>
                </div>

                {/* Conversation Messages */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 bg-[var(--bg-tertiary)]/20 min-h-0">
                  {activeChatData.messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 opacity-60">
                      <MessageSquare className="w-10 h-10 text-amber-500" />
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">Start Conversation</h4>
                      <p className="text-[11px] text-[var(--text-muted)] max-w-xs">Ask questions about suites, special prices, dietary requirements, or shuttle pickups.</p>
                    </div>
                  ) : (
                    activeChatData.messages.map((msg, index) => {
                      const isMe = msg.sender === 'customer';
                      return (
                        <div 
                          key={index}
                          className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isMe && (
                            <img 
                              src={msg.senderAvatar || activeChatData.avatar} 
                              className="w-7 h-7 rounded-full object-cover border border-[var(--border-light)] flex-shrink-0 mb-0.5" 
                              alt="" 
                            />
                          )}
                          
                          <div className={msg.text.startsWith('data:image/') ? "max-w-[78%]" : `max-w-[78%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 text-xs font-medium shadow-xs ${
                            isMe 
                              ? 'bg-amber-600 text-white rounded-tr-none' 
                              : 'bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-tl-none'
                          }`}>
                            {msg.text.startsWith('data:image/') ? (
                              <div className="relative group/image overflow-hidden rounded-2xl">
                                <img 
                                  src={msg.text} 
                                  className="w-48 h-36 sm:w-56 sm:h-40 object-cover rounded-2xl shadow-md transition-all group-hover/image:opacity-90" 
                                  alt="Attachment" 
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setActiveLightboxImage(msg.text);
                                    }}
                                    className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all cursor-pointer"
                                    title="View Fullscreen"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <a
                                    href={msg.text}
                                    download={`attachment_${index}.png`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all cursor-pointer"
                                    title="Download File"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <span className="break-words leading-relaxed">{msg.text}</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Bottom Input Area (LOCKED & STICKY AT BOTTOM) */}
                <div className="p-2 sm:p-3 border-t border-[var(--border-light)] bg-[var(--bg-tertiary)]/20 space-y-2 relative shrink-0">
                  {/* Emoji / Reaction Picker Overlay */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-16 left-4 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl p-2.5 shadow-2xl flex items-center gap-2 z-50 animate-fade-in text-xs select-none">
                      {[
                        { label: 'Thank You', icon: <Smile className="w-4 h-4 text-amber-500" />, text: 'Thank you!' },
                        { label: 'Sounds Great', icon: <ThumbsUp className="w-4 h-4 text-blue-500" />, text: 'Sounds great!' },
                        { label: 'Much Appreciated', icon: <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />, text: 'Much appreciated!' },
                        { label: 'Looking Forward', icon: <Sparkles className="w-4 h-4 text-amber-400" />, text: 'Looking forward to our stay!' },
                        { label: '5-Star Quality', icon: <Star className="w-4 h-4 text-amber-500 fill-amber-400" />, text: 'Excellent service!' },
                        { label: 'Confirmed', icon: <Check className="w-4 h-4 text-emerald-500" />, text: 'Confirmed, thank you!' }
                      ].map(item => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setNewMessage(prev => (prev ? prev + ' ' : '') + item.text);
                            setShowEmojiPicker(false);
                          }}
                          className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer flex items-center justify-center"
                          title={item.label}
                        >
                          {item.icon}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Attachment Preview */}
                  {attachment && (
                    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 w-fit max-w-full animate-fade-in text-[10px] font-extrabold text-amber-600">
                      <span className="flex items-center gap-1"><Paperclip className="w-3.5 h-3.5 text-amber-500" /> Attachment: {attachment.name.substring(0, 15)}...</span>
                      <button
                        type="button"
                        onClick={() => setAttachment(null)}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer p-0.5"
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
                      className={`p-2 rounded-xl border text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-amber-500 transition-all cursor-pointer shrink-0 ${showEmojiPicker ? 'border-amber-500 text-amber-500 bg-amber-500/10' : 'border-[var(--border-light)]'}`}
                      title="Add Emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-xl border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-amber-500 transition-all cursor-pointer shrink-0"
                      title="Attach File"
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
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 min-w-0 p-2.5 rounded-xl border border-[var(--border-light)] text-xs bg-[var(--bg-card)] outline-none focus:border-amber-500 text-[var(--text-primary)] font-medium"
                    />
                    <button 
                      type="submit" 
                      className="p-2.5 rounded-xl bg-amber-600 text-white flex items-center justify-center hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/20 cursor-pointer shrink-0"
                      title="Send Message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>

          {/* RIGHT PANEL: Host Profile details (3/12 cols, desktop only) */}
          <div className="hidden lg:flex lg:col-span-3 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-light)] shadow-md p-6 flex-col justify-between overflow-y-auto h-full">
            {!activeChatData ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-[var(--text-muted)]">
                <User className="w-10 h-10 mb-2 opacity-50 text-amber-500" />
                <span className="text-[10px] uppercase font-bold tracking-wider">No Profile Selected</span>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  <div className="text-center">
                    <img 
                      src={activeChatData.avatar} 
                      alt="" 
                      className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-amber-500 shadow-lg" 
                    />
                    <h4 className="text-xs font-black text-[var(--text-primary)] mt-3">{activeChatData.name}</h4>
                    <span className="text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wide mt-1 block">Property Representative</span>
                  </div>

                  <div className="border-t border-[var(--border-light)] pt-4 space-y-3.5 text-xs">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-[var(--text-muted)] font-bold block leading-none">Phone</span>
                        <span className="font-extrabold text-[var(--text-primary)] text-[11px] truncate block">{activeChatData.phone}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-[var(--text-muted)] font-bold block leading-none">Email</span>
                        <span className="font-extrabold text-[var(--text-primary)] text-[11px] truncate block">{activeChatData.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-[var(--text-muted)] font-bold block leading-none">Entity</span>
                        <span className="font-extrabold text-[var(--text-primary)] text-[11px] truncate block">LuxeStay Hospitality</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed flex gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>For security and safety, always communicate and complete transactions within the official LuxeStay portal.</span>
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
