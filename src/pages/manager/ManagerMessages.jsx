import React, { useState, useEffect } from 'react';
import { Search, Send, Settings, User, Bell, Phone, Mail, MoreHorizontal, Globe, Trash, Info, Sparkles, Smile, Paperclip, ChevronDown, Check, X, ShieldAlert, Download, Eye, MessageSquare } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';

export const ManagerMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [activeChatId, setActiveChatId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = React.useRef(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);
  const [fetchedProfiles, setFetchedProfiles] = useState({});
  const messagesEndRef = React.useRef(null);
  const prevMessagesLengthRef = React.useRef(0);
  const prevActiveChatIdRef = React.useRef('');

  const fetchMessages = () => {
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 3 seconds to keep chat live!
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real profile details dynamically from backend
  useEffect(() => {
    const myId = user?.id || 'partner1';
    const customerIds = [...new Set(messages.map(msg => {
      const isMyChat = msg.senderId === myId || msg.recipientId === myId;
      if (!isMyChat) return null;
      return msg.senderRole === 'customer' ? msg.senderId : msg.recipientId;
    }).filter(Boolean))];

    customerIds.forEach(id => {
      if (id && !fetchedProfiles[id]) {
        setFetchedProfiles(prev => {
          if (prev[id]) return prev;
          return {
            ...prev,
            [id]: {
              name: 'Customar',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
              phone: '+1 (555) 000-0000',
              email: `${id}@example.com`,
              status: 'Guest',
              country: 'United Kingdom',
              isPlaceholder: true
            }
          };
        });

        fetch(`/api/users/${id}`)
          .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
          })
          .then(data => {
            if (data && data.id) {
              setFetchedProfiles(prev => ({
                ...prev,
                [data.id]: {
                  name: data.name,
                  avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                  phone: data.phone || '+1 (555) 000-0000',
                  email: data.email || `${data.id}@example.com`,
                  status: 'Guest • Online',
                  country: data.country || 'United Kingdom'
                }
              }));
            }
          })
          .catch(() => {});
      }
    });
  }, [messages, user?.id]);

  // Default hardcoded profiles for display info
  const defaultProfiles = {};

  // Group messages by customer
  const chatGroups = {};

  messages.forEach(msg => {
    const myId = user?.id || 'partner1';
    const isMyChat = msg.senderId === myId || msg.recipientId === myId;
    if (!isMyChat) return;

    const customerId = msg.senderRole === 'customer' ? msg.senderId : msg.recipientId;
    const customerName = msg.senderRole === 'customer' ? msg.senderName : msg.recipientName;
    const customerAvatar = msg.senderRole === 'customer' ? msg.senderAvatar : null;
    
    const resolvedProfile = fetchedProfiles[customerId] || defaultProfiles[customerId] || {
      name: customerName || 'Customar',
      avatar: customerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      phone: '+1 (555) 000-0000',
      email: `${customerId}@example.com`,
      status: 'Guest',
      country: 'United Kingdom'
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
    } else {
      if (fetchedProfiles[customerId] && !fetchedProfiles[customerId].isPlaceholder) {
        chatGroups[customerId].name = fetchedProfiles[customerId].name;
        chatGroups[customerId].avatar = fetchedProfiles[customerId].avatar;
        chatGroups[customerId].phone = fetchedProfiles[customerId].phone;
        chatGroups[customerId].email = fetchedProfiles[customerId].email;
        chatGroups[customerId].country = fetchedProfiles[customerId].country;
      }
    }

    chatGroups[customerId].messages.push({
      sender: msg.senderRole === 'customer' ? customerId : 'manager',
      text: msg.text,
      time: msg.time,
      read: msg.read,
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
  const markMessagesAsRead = (customerId) => {
    if (!user || !customerId) return;
    fetch('/api/messages/read', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: customerId,
        recipientId: user.id || 'partner1'
      })
    })
      .catch(() => {});
  };

  useEffect(() => {
    if (activeChatId) {
      markMessagesAsRead(activeChatId);
    }
  }, [activeChatId, messages]);

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

    const myId = user?.id || 'partner1';
    const myName = user?.name || 'Shariful Islam';
    const myRole = user?.role || 'manager';

    const sendPayload = (textValue) => {
      const payload = {
        senderId: myId,
        senderName: myName,
        senderRole: myRole,
        senderAvatar: user?.avatar || '',
        recipientId: activeChatId,
        recipientName: activeChatData.name,
        text: textValue,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(savedMsg => {
          setMessages(prev => [...prev, savedMsg]);
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
      <div className="max-w-7xl mx-auto font-sans text-slate-800 animate-fade-in pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-[80vh]">
          
          {/* LEFT PANEL: Chat List Channels (3/12 cols) */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/70 shadow-md p-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-base font-extrabold text-slate-900">Messages</h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase">
                  Active Chats
                </span>
              </div>

              {/* Search chat */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search name, chat, etc"
                  className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 text-xs bg-slate-50 outline-none focus:bg-white font-medium"
                />
              </div>

              {/* Channels List */}
              <div className="space-y-1 overflow-y-auto max-h-[60vh] pr-1">
                {Object.values(chatGroups).map((chat) => {
                  const isActive = activeChatId === chat.id;
                  const lastMsg = chat.messages[chat.messages.length - 1];
                  const unreadMsgs = chat.messages.filter(m => m.sender !== 'manager' && !m.read);
                  const hasUnread = unreadMsgs.length > 0;
                  return (
                    <div 
                      key={chat.id}
                      onClick={() => setActiveChatId(chat.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                        isActive ? 'bg-[#e2f896] text-slate-950 font-extrabold shadow-sm' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <img src={chat.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black truncate block flex items-center gap-1.5">
                            {chat.name}
                            {hasUnread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse" title="Unread Message" />
                            )}
                          </span>
                          <span className={`text-[9px] font-bold ${hasUnread ? 'text-rose-500 font-black' : 'text-slate-400'}`}>{lastMsg?.time || '10:00 AM'}</span>
                        </div>
                        <p className={`text-[11px] font-medium truncate mt-0.5 ${hasUnread ? 'text-slate-950 font-bold' : 'text-slate-500'}`}>{lastMsg?.text || 'No messages yet'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MIDDLE PANEL: Active Chat Thread (6/12 cols) */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/70 shadow-md p-4 flex flex-col justify-between h-full">
            {!activeChatData ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <MessageSquare className="w-12 h-12 text-slate-300 animate-bounce" />
                <h4 className="text-sm font-extrabold text-slate-900">No active conversations</h4>
                <p className="text-xs text-slate-400 font-semibold max-w-xs">There are no guest messages matching this manager's properties in the database right now.</p>
              </div>
            ) : (
              <>
                {/* Thread Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img src={activeChatData.avatar} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{activeChatData.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{activeChatData.status}</p>
                    </div>
                  </div>
                  <button className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Message History */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh]">
                  {activeChatData.messages.map((msg, idx) => {
                    const isGuest = msg.sender === activeChatData.id;
                    const isImage = msg.text.startsWith('data:image/');
                    return (
                      <div key={idx} className={`flex items-end gap-2 ${isGuest ? 'justify-start' : 'justify-end'}`}>
                        {isGuest && (
                          <img 
                            src={msg.senderAvatar || activeChatData.avatar} 
                            className="w-7 h-7 rounded-full object-cover border border-slate-100 flex-shrink-0 mb-1" 
                            alt="" 
                          />
                        )}
                        
                        <div className={isImage ? "max-w-[70%]" : `max-w-[70%] p-3.5 rounded-3xl text-xs ${
                          isGuest 
                            ? 'bg-[#e2f896] text-slate-950 font-bold rounded-tl-none shadow-2xs' 
                            : 'bg-slate-50 text-slate-800 border border-slate-200/50 font-medium rounded-tr-none'
                        }`}>
                          {isImage ? (
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
                            <p className="leading-relaxed">{msg.text}</p>
                          )}
                          <span className={`text-[8px] mt-1 block text-right font-bold ${isGuest ? 'text-slate-500' : 'text-slate-400'}`}>
                            {msg.time}
                          </span>
                        </div>

                        {!isGuest && (
                          <img 
                            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
                            className="w-7 h-7 rounded-full object-cover border border-slate-100 flex-shrink-0 mb-1" 
                            alt="" 
                          />
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Controls Panel */}
                <div className="pt-3 border-t border-slate-100 bg-slate-50/50 p-2.5 rounded-2xl relative space-y-2">
                  {/* Emoji Picker Box */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-16 left-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-lg flex items-center gap-1.5 z-20 animate-fade-in text-sm select-none">
                      {['😊', '👍', '❤️', '👏', '🔥', '🎉', '🌟', '😮', '🙌', '🙏'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleEmojiSelect(emoji)}
                          className="hover:scale-125 transition-transform cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Attachment indicator banner */}
                  {attachment && (
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-[#e2f896]/30 border border-[#e2f896]/60 w-fit max-w-full text-[10px] font-extrabold text-slate-800">
                      <span>📎 Attachment Ready: {attachment.name.substring(0, 20)}...</span>
                      <button
                        type="button"
                        onClick={() => setAttachment(null)}
                        className="text-rose-600 hover:text-rose-800 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => setShowEmojiPicker(prev => !prev)}
                      className={`p-2 rounded-full border text-slate-400 hover:text-slate-700 transition-colors cursor-pointer ${showEmojiPicker ? 'border-slate-300 text-slate-700 bg-slate-100' : 'border-slate-200'}`}
                      title="Add Emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
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
                      placeholder="Write your response message here..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        if (showEmojiPicker) setShowEmojiPicker(false);
                      }}
                      className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 text-xs outline-none bg-slate-50 focus:bg-white text-slate-800 font-medium"
                    />

                    <button 
                      type="submit"
                      className="p-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer shadow-xs"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>

          {/* RIGHT PANEL: Guest Details & Shared Assets (3/12 cols) */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/70 shadow-md p-4 flex flex-col justify-between">
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
