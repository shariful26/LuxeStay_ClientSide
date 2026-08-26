import React, { useState, useEffect } from 'react';
import { Search, Send, Settings, User, Bell, Phone, Mail, MoreHorizontal, Globe, Trash, Info, Sparkles, Smile, Paperclip, ChevronDown, Check, X, ShieldAlert } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';

export const PartnerMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [activeChatId, setActiveChatId] = useState('alice');
  const [newMessage, setNewMessage] = useState('');

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

  // Default hardcoded profiles for display info
  const defaultProfiles = {
    alice: { name: 'Alice Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', phone: '+1 (555) 789-1234', email: 'alice.johnson@example.com', status: 'Guest • Last active yesterday' },
    michael: { name: 'Michael Brown', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', phone: '+1 (555) 456-7890', email: 'michael.b@example.com', status: 'Guest • Checked In' },
    emily: { name: 'Emily Davis', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', phone: '+1 (555) 123-4567', email: 'emily.davis@example.com', status: 'Guest • Pre-arrival' },
    john: { name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', phone: '+1 (555) 987-6543', email: 'john.doe@example.com', status: 'Guest • Past Stay' }
  };

  // Group messages by customer
  const chatGroups = {};

  messages.forEach(msg => {
    const customerId = msg.senderRole === 'customer' ? msg.senderId : msg.recipientId;
    const customerName = msg.senderRole === 'customer' ? msg.senderName : msg.recipientName;
    
    if (!chatGroups[customerId]) {
      chatGroups[customerId] = {
        id: customerId,
        name: customerName || defaultProfiles[customerId]?.name || customerId,
        avatar: defaultProfiles[customerId]?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        phone: defaultProfiles[customerId]?.phone || '+1 (555) 000-0000',
        email: defaultProfiles[customerId]?.email || `${customerId}@example.com`,
        status: defaultProfiles[customerId]?.status || 'Guest',
        messages: []
      };
    }
    chatGroups[customerId].messages.push({
      sender: msg.senderRole === 'customer' ? customerId : 'manager',
      text: msg.text,
      time: msg.time
    });
  });

  // Ensure defaults exist
  Object.keys(defaultProfiles).forEach(id => {
    if (!chatGroups[id]) {
      chatGroups[id] = {
        id,
        ...defaultProfiles[id],
        messages: []
      };
    }
  });

  const activeChatData = chatGroups[activeChatId] || chatGroups['alice'];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const payload = {
      senderId: user?.id || 'partner1',
      senderName: user?.name || 'Shariful Islam',
      senderRole: 'partner',
      recipientId: activeChatId,
      recipientName: activeChatData.name,
      text: newMessage,
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
        setNewMessage('');
      })
      .catch(() => {});
  };

  return (
    <PortalLayout role="partner" title="LuxStay Guest Messages">
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
                  return (
                    <div 
                      key={chat.id}
                      onClick={() => setActiveChatId(chat.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                        isActive ? 'bg-[#e2f896] text-slate-950 font-extrabold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <img src={chat.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black truncate block">{chat.name}</span>
                          <span className="text-[9px] text-slate-400 font-bold">{lastMsg?.time || '10:00 AM'}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{lastMsg?.text || 'No messages yet'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MIDDLE PANEL: Active Chat Thread (6/12 cols) */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/70 shadow-md p-4 flex flex-col justify-between h-full">
            
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
                return (
                  <div key={idx} className={`flex ${isGuest ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[70%] p-3.5 rounded-3xl text-xs ${
                      isGuest 
                        ? 'bg-[#e2f896] text-slate-950 font-bold rounded-tl-none shadow-2xs' 
                        : 'bg-slate-50 text-slate-800 border border-slate-200/50 font-medium rounded-tr-none'
                    }`}>
                      <p className="leading-relaxed">{msg.text}</p>
                      <span className="text-[9px] text-slate-400 font-bold mt-1.5 block text-right">{msg.time}</span>
                    </div>
                  </div>
                );
              })}

              {activeChatData.messages.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  Send a message to start conversation with {activeChatData.name}.
                </div>
              )}
            </div>

            {/* Input Form Box */}
            <form onSubmit={handleSendMessage} className="border-t border-slate-100 pt-3 flex items-center gap-2">
              <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Smile className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              
              <input 
                type="text" 
                placeholder="Write your response message here..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
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

          {/* RIGHT PANEL: Guest Details & Shared Assets (3/12 cols) */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/70 shadow-md p-4 flex flex-col justify-between">
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
          </div>

        </div>
      </div>
    </PortalLayout>
  );
};
