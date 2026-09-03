import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, User, Phone, Mail, Building2, Globe, MessageSquare, 
  Smile, Paperclip, Download, Eye, X, ArrowLeft, ThumbsUp, Heart, 
  Sparkles, Star, Check, Users, Shield, ShieldCheck, RefreshCw, Filter, ExternalLink,
  MoreHorizontal, Edit2, Trash2, Trash
} from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../context/MessageContext';

export const AdminMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'manager' | 'customer'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeContactId, setActiveContactId] = useState(null);
  const [mobileTab, setMobileTab] = useState('list'); // 'list' | 'chat' | 'profile'
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // 1. Fetch all users (Managers and Customers) from MongoDB
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users?limit=100');
      const data = await res.json();
      if (Array.isArray(data)) {
        // Exclude current admin from contact list
        const filtered = data.filter(u => u.role !== 'admin' && u.id !== user?.id && u.email !== user?.email);
        setUsersList(filtered);
        if (!activeContactId && filtered.length > 0) {
          setActiveContactId(filtered[0].id || filtered[0]._id);
        }
      }
    } catch (e) {
      console.error('Error fetching users for admin chat:', e);
    }
  };

  // 2. Fetch all messages across platform for Admin
  const fetchAllMessages = async () => {
    try {
      const res = await fetch('/api/messages?role=admin&limit=100');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (e) {
      console.error('Error fetching messages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAllMessages();
    const interval = setInterval(fetchAllMessages, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    if (mobileTab === 'chat' || window.innerWidth >= 1024) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeContactId, mobileTab]);

  // Filter contacts by active tab & search query
  const filteredUsers = usersList.filter(u => {
    const matchesTab = activeTab === 'all' || u.role === activeTab;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (u.name && u.name.toLowerCase().includes(q)) || 
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q));
    return matchesTab && matchesSearch;
  });

  // Active contact profile
  const activeContact = usersList.find(u => (u.id || u._id) === activeContactId) || usersList[0] || null;

  // Filter messages between Admin and Active Contact
  const activeContactMessages = messages.filter(m => {
    if (!activeContact) return false;
    const cId = String(activeContact.id || activeContact._id);
    const cEmail = activeContact.email ? activeContact.email.toLowerCase() : '';
    
    const isSentToContact = String(m.recipientId) === cId || (m.recipientName && m.recipientName.toLowerCase() === activeContact.name?.toLowerCase());
    const isSentByContact = String(m.senderId) === cId || (m.senderName && m.senderName.toLowerCase() === activeContact.name?.toLowerCase()) || (cEmail && m.senderEmail === cEmail);
    
    // Also match role aliases
    const isManagerAlias = activeContact.role === 'manager' && (m.recipientId === 'manager' || m.recipientRole === 'manager' || m.senderRole === 'manager');
    
    return isSentToContact || isSentByContact || (activeContact.role === 'manager' && isManagerAlias && (m.senderId === cId || m.recipientId === cId));
  });

  const { markChatAsRead, setUnreadCount } = useMessages();
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState('');
  const [isThreadMenuOpen, setIsThreadMenuOpen] = useState(false);

  // Mark active chat messages as read
  const markMessagesAsRead = (contactId) => {
    if (!contactId) return;
    const cId = String(contactId).trim();

    // 1. Optimistic UI update
    setMessages(prev => prev.map(m => {
      const match = String(m.senderId) === cId || m.senderRole === cId;
      if (match && !m.read) return { ...m, read: true };
      return m;
    }));

    if (markChatAsRead) {
      markChatAsRead(cId);
    }

    // 2. Persist to MongoDB Atlas
    fetch('/api/messages/read', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: cId,
        recipientId: user?.id || 'admin',
        role: 'admin'
      })
    }).catch(() => {});
  };

  useEffect(() => {
    if (activeContactId) {
      markMessagesAsRead(activeContactId);
    }
  }, [activeContactId]);

  // Individual message Edit Handler
  const handleSaveEdit = async (msgId) => {
    if (!editMessageText.trim()) return;
    const cleanText = editMessageText.trim();

    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: cleanText, edited: true } : m));
    setEditingMessageId(null);

    try {
      await fetch(`/api/messages/${encodeURIComponent(msgId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText })
      });
    } catch (e) {
      console.error('Failed to edit message:', e);
    }
  };

  // Individual message Delete Handler
  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Delete this message?')) return;

    setMessages(prev => prev.filter(m => m.id !== msgId));

    try {
      await fetch(`/api/messages/${encodeURIComponent(msgId)}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.error('Failed to delete message:', e);
    }
  };

  // Clear Conversation Handler (3-dot menu)
  const handleClearConversation = async () => {
    if (!window.confirm(`Delete all messages with ${activeContact?.name || 'this user'}?`)) return;

    const contactId = activeContactId;
    setIsThreadMenuOpen(false);

    setMessages(prev => prev.filter(m => {
      const match = (String(m.senderId) === String(contactId) || m.senderRole === contactId) ||
                    (String(m.recipientId) === String(contactId) || m.recipientRole === contactId);
      return !match;
    }));

    try {
      await fetch('/api/messages/clear-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user1: user?.id || 'admin',
          user2: contactId
        })
      });
    } catch (e) {
      console.error('Failed to clear conversation:', e);
    }
  };

  // Mark all messages in active thread as read
  const handleMarkAllAsRead = () => {
    markMessagesAsRead(activeContactId);
    setIsThreadMenuOpen(false);
  };

  // Export Chat transcript to text file
  const handleExportChat = () => {
    setIsThreadMenuOpen(false);
    if (activeContactMessages.length === 0) return alert('No messages to export.');

    const content = activeContactMessages.map(m => `[${m.time}] ${m.senderName || m.senderRole}: ${m.text}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AdminChat_${activeContact?.name || 'User'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate unread count per user
  const getUnreadCount = (contactId) => {
    return messages.filter(m => String(m.senderId) === String(contactId) && !m.read).length;
  };

  // Get latest message for contact preview
  const getLastMessage = (contactId) => {
    const userMsgs = messages.filter(m => 
      String(m.senderId) === String(contactId) || String(m.recipientId) === String(contactId)
    );
    return userMsgs[userMsgs.length - 1] || null;
  };

  // Send message as Admin
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !activeContact || sending) return;

    setSending(true);
    const textToSend = attachment ? attachment.url : newMessage.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const payload = {
      senderId: user?.id || 'admin',
      senderName: user?.name || 'LuxeStay Super Admin',
      senderRole: 'admin',
      senderAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      recipientId: activeContact.id || activeContact._id,
      recipientName: activeContact.name,
      recipientRole: activeContact.role || 'customer',
      text: textToSend,
      time: nowTime
    };

    // Optimistic UI update
    setMessages(prev => [...prev, { ...payload, id: `temp_${Date.now()}`, read: true }]);
    setNewMessage('');
    setAttachment(null);
    setShowEmojiPicker(false);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchAllMessages();
      }
    } catch (err) {
      console.error('Failed to send admin message:', err);
    } finally {
      setSending(false);
    }
  };

  // Handle file attachment upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachment({
        name: file.name,
        type: file.type,
        url: event.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  const getCleanAvatar = (avatar, name = 'User') => {
    if (avatar && typeof avatar === 'string' && (avatar.startsWith('http') || avatar.startsWith('data:image'))) {
      return avatar;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f59e0b&color=000&bold=true`;
  };

  return (
    <PortalLayout role="admin" title="Admin Message Center">
      <div className="space-y-4 font-sans animate-fade-in pb-12">
        
        {/* Top Header & Overview Bar */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                Admin Support & Live Messages
              </h1>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Direct two-way messaging with all Hotel Managers and Customer Guests.
              </p>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setLoading(true); fetchUsers(); fetchAllMessages(); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-amber-500 hover:text-white text-xs font-bold transition-all text-[var(--text-primary)] cursor-pointer"
              title="Refresh messages"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <div className="px-3 py-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold">
              {usersList.filter(u => u.role === 'manager').length} Managers
            </div>
            <div className="px-3 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
              {usersList.filter(u => u.role === 'customer').length} Guests
            </div>
          </div>
        </div>

        {/* 3-Column Message Hub Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[720px]">
          
          {/* LEFT COLUMN: Contacts Directory (4 cols) */}
          <div className={`lg:col-span-4 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-3xl p-4 flex flex-col shadow-sm h-full overflow-hidden ${
            mobileTab === 'list' ? 'flex' : 'hidden lg:flex'
          }`}>
            
            {/* Filter Tabs: All, Managers, Customers */}
            <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-tertiary)] rounded-2xl mb-3 shrink-0">
              {[
                { id: 'all', label: 'All Contacts', count: usersList.length },
                { id: 'manager', label: 'Managers', count: usersList.filter(u => u.role === 'manager').length },
                { id: 'customer', label: 'Guests', count: usersList.filter(u => u.role === 'customer').length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === tab.id ? 'bg-black/20 text-slate-950' : 'bg-[var(--bg-card)] text-[var(--text-muted)]'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Contact Search Input */}
            <div className="relative mb-3 shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="w-full pl-9.5 pr-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-amber-500 transition-all font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Contacts Scrollable List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
              {filteredUsers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--text-muted)] space-y-2">
                  <Users className="w-8 h-8 opacity-40" />
                  <p className="text-xs font-bold">No contacts found</p>
                </div>
              ) : (
                filteredUsers.map(contact => {
                  const cId = contact.id || contact._id;
                  const isActive = activeContactId === cId;
                  const lastMsg = getLastMessage(cId);
                  const unread = getUnreadCount(cId);
                  const isManager = contact.role === 'manager';

                  return (
                    <div
                      key={cId}
                      onClick={() => {
                        setActiveContactId(cId);
                        setMobileTab('chat');
                      }}
                      className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${
                        isActive 
                          ? 'bg-amber-500/15 border-amber-500 text-amber-500 shadow-xs' 
                          : 'border-transparent hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={getCleanAvatar(contact.avatar, contact.name)}
                          alt={contact.name}
                          className="w-10 h-10 rounded-full object-cover border border-[var(--border-light)] shadow-xs"
                        />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--bg-card)] ${isManager ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold truncate text-[var(--text-primary)] flex items-center gap-1.5">
                            {contact.name || 'User'}
                            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md uppercase tracking-wider ${
                              isManager 
                                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' 
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}>
                              {isManager ? 'Manager' : 'Guest'}
                            </span>
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] font-semibold shrink-0">
                            {lastMsg?.time || ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[11px] truncate text-[var(--text-muted)] font-medium max-w-[180px]">
                            {lastMsg?.text || (isManager ? 'Hotel Manager Contact' : 'Customer Guest Contact')}
                          </p>
                          {unread > 0 && (
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center shrink-0">
                              {unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* MIDDLE COLUMN: Active Chat Thread (5 or 8 cols) */}
          <div className={`lg:col-span-5 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-3xl flex flex-col justify-between h-full overflow-hidden shadow-sm ${
            mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}>
            {!activeContact ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[var(--text-muted)] space-y-3">
                <MessageSquare className="w-12 h-12 text-amber-500 animate-bounce" />
                <h3 className="text-base font-extrabold text-[var(--text-primary)]">Select a Contact</h3>
                <p className="text-xs max-w-xs">Choose any Hotel Manager or Customer Guest to view conversation and send replies.</p>
              </div>
            ) : (
              <>
                {/* Chat Top Header */}
                <div className="p-3 sm:p-4 border-b border-[var(--border-light)] flex items-center justify-between bg-[var(--bg-tertiary)]/30 shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setMobileTab('list')}
                      className="lg:hidden p-1.5 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs font-black"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <img
                      src={getCleanAvatar(activeContact.avatar, activeContact.name)}
                      alt={activeContact.name}
                      className="w-10 h-10 rounded-full object-cover border border-[var(--border-light)] shrink-0 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-black text-[var(--text-primary)] leading-tight">
                          {activeContact.name}
                        </h3>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                          activeContact.role === 'manager' ? 'bg-purple-500/20 text-purple-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {activeContact.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-500 font-bold block mt-0.5">
                        ● Online • {activeContact.email}
                      </span>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-1">
                    {activeContact.phone && (
                      <a
                        href={`tel:${activeContact.phone}`}
                        className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-emerald-500/20 hover:text-emerald-400 text-[var(--text-secondary)] transition-all cursor-pointer"
                        title={`Call ${activeContact.phone}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {activeContact.email && (
                      <a
                        href={`mailto:${activeContact.email}`}
                        className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-blue-500/20 hover:text-blue-400 text-[var(--text-secondary)] transition-all cursor-pointer"
                        title={`Email ${activeContact.email}`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => setMobileTab('profile')}
                      className="lg:hidden p-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                      title="View Details"
                    >
                      <User className="w-3.5 h-3.5" />
                    </button>

                    {/* 3-Dot Thread Action Menu */}
                    <div className="relative">
                      <button 
                        onClick={() => setIsThreadMenuOpen(prev => !prev)}
                        className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                        title="More options"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {isThreadMenuOpen && (
                        <div className="absolute right-0 top-9 w-48 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl p-1.5 shadow-xl z-50 animate-fade-in text-xs font-bold space-y-1">
                          <button
                            onClick={handleMarkAllAsRead}
                            className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] transition-all cursor-pointer text-left"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Mark as Read</span>
                          </button>
                          <button
                            onClick={handleExportChat}
                            className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] transition-all cursor-pointer text-left"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-500" />
                            <span>Export Transcript</span>
                          </button>
                          <div className="border-t border-[var(--border-light)] my-1" />
                          <button
                            onClick={handleClearConversation}
                            className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-all cursor-pointer text-left font-black"
                          >
                            <Trash className="w-3.5 h-3.5 text-rose-500" />
                            <span>Clear All Messages</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Conversation Messages Thread */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[var(--bg-tertiary)]/20 min-h-0">
                  {activeContactMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 opacity-70">
                      <MessageSquare className="w-10 h-10 text-amber-500" />
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">No previous chat with {activeContact.name}</h4>
                      <p className="text-[11px] text-[var(--text-muted)] max-w-xs">
                        Start the conversation below. Messages are delivered instantly.
                      </p>
                    </div>
                  ) : (
                    activeContactMessages.map((msg, index) => {
                      const isAdminMe = msg.senderRole === 'admin' || (user?.id && String(msg.senderId) === String(user.id));
                      const contactAvatar = getCleanAvatar(activeContact.avatar, activeContact.name);
                      const adminAvatar = user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

                      return (
                        <div
                          key={msg.id || index}
                          className={`flex items-end gap-2.5 group/msg transition-all relative ${isAdminMe ? 'justify-end' : 'justify-start'}`}
                        >
                          {/* Received Message: Contact Avatar on the LEFT (Facebook Messenger Style) */}
                          {!isAdminMe && (
                            <img
                              src={contactAvatar}
                              alt={msg.senderName}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[var(--border-light)] shrink-0 mb-1 shadow-xs ring-1 ring-black/5 dark:ring-white/10"
                              title={msg.senderName}
                            />
                          )}

                          {/* Hover Action Bar for Message Edit & Delete */}
                          <div className={`opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center gap-1 mb-1 self-center ${isAdminMe ? 'order-first' : 'order-last'}`}>
                            {isAdminMe && !msg.text?.startsWith('data:image/') && (
                              <button
                                onClick={() => {
                                  setEditingMessageId(msg.id);
                                  setEditMessageText(msg.text);
                                }}
                                className="p-1 rounded-lg bg-[var(--bg-tertiary)] hover:bg-amber-500 hover:text-slate-950 text-[var(--text-muted)] transition-all cursor-pointer shadow-xs"
                                title="Edit message"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-1 rounded-lg bg-[var(--bg-tertiary)] hover:bg-rose-500 hover:text-white text-[var(--text-muted)] transition-all cursor-pointer shadow-xs"
                              title="Delete message"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <div className={`flex flex-col ${isAdminMe ? 'items-end' : 'items-start'} max-w-[80%] sm:max-w-[72%]`}>
                            <div className={msg.text?.startsWith('data:image/') ? "w-fit" : `rounded-2xl px-3.5 py-2.5 text-xs font-medium shadow-xs leading-relaxed ${
                              isAdminMe 
                                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold rounded-br-xs' 
                                : 'bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-bl-xs'
                            }`}>
                              {editingMessageId === msg.id ? (
                                <div className="space-y-1.5 min-w-[200px]">
                                  <input
                                    type="text"
                                    value={editMessageText}
                                    onChange={(e) => setEditMessageText(e.target.value)}
                                    className="w-full p-2 text-xs rounded-xl bg-slate-900 text-white outline-none border border-amber-500 font-medium"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveEdit(msg.id);
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
                                      onClick={() => handleSaveEdit(msg.id)}
                                      className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] cursor-pointer"
                                      title="Save edit"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ) : msg.text?.startsWith('data:image/') ? (
                                <div className="relative group/image overflow-hidden rounded-2xl">
                                  <img
                                    src={msg.text}
                                    className="w-48 h-36 sm:w-56 sm:h-40 object-cover rounded-2xl shadow-md transition-all group-hover/image:opacity-90"
                                    alt="Attachment"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button
                                      onClick={() => setActiveLightboxImage(msg.text)}
                                      className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all cursor-pointer"
                                      title="View Fullscreen"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <a
                                      href={msg.text}
                                      download={`attachment_${index}.png`}
                                      className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all cursor-pointer"
                                      title="Download File"
                                    >
                                      <Download className="w-4 h-4" />
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <span className="break-words">
                                  {msg.text}
                                  {msg.edited && <span className="text-[9px] opacity-70 italic ml-1">(edited)</span>}
                                </span>
                              )}
                            </div>

                            {/* Micro Timestamp below bubble (Facebook Messenger Style) */}
                            <span className={`text-[9px] text-[var(--text-muted)] font-semibold mt-0.5 px-1 ${isAdminMe ? 'text-right' : 'text-left'}`}>
                              {msg.time}
                            </span>
                          </div>

                          {/* Sent Message: Admin Avatar on the RIGHT (Facebook Messenger Style) */}
                          {isAdminMe && (
                            <img
                              src={adminAvatar}
                              alt="Super Admin"
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-amber-500 shrink-0 mb-1 shadow-xs ring-1 ring-amber-500/20"
                              title="Administrator"
                            />
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area (Sticky at bottom) */}
                <div className="p-2.5 sm:p-3.5 border-t border-[var(--border-light)] bg-[var(--bg-tertiary)]/30 space-y-2 relative shrink-0">
                  {/* Quick Admin Action Templates Picker */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-16 left-4 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl p-2.5 shadow-2xl flex flex-wrap gap-1.5 z-50 animate-fade-in text-xs select-none max-w-sm">
                      {[
                        'Reservation confirmed and verified.',
                        'Hotel partner payout processed successfully.',
                        'Thank you for reaching out to LuxeStay Admin Support.',
                        'We are currently investigating your request.',
                        'Please verify your contact and identification details.'
                      ].map((txt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setNewMessage(prev => (prev ? prev + ' ' : '') + txt);
                            setShowEmojiPicker(false);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-amber-500 hover:text-slate-950 transition-all text-[11px] font-semibold text-left cursor-pointer"
                        >
                          {txt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Attachment Preview */}
                  {attachment && (
                    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 w-fit max-w-full animate-fade-in text-[10px] font-extrabold text-amber-500">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Attachment: {attachment.name.substring(0, 20)}</span>
                      <button
                        type="button"
                        onClick={() => setAttachment(null)}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer p-0.5 ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Chat Form */}
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(prev => !prev)}
                      className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-amber-500/20 text-[var(--text-secondary)] hover:text-amber-500 transition-all cursor-pointer shrink-0"
                      title="Quick response templates"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-amber-500/20 text-[var(--text-secondary)] hover:text-amber-500 transition-all cursor-pointer shrink-0"
                      title="Attach image or file"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Reply to ${activeContact.name} (${activeContact.role})...`}
                      className="flex-1 py-2.5 px-3.5 bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-amber-500 transition-all font-medium"
                    />

                    <button
                      type="submit"
                      disabled={(!newMessage.trim() && !attachment) || sending}
                      className="p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black transition-all cursor-pointer shrink-0 shadow-md shadow-amber-500/20 flex items-center justify-center"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>

          {/* RIGHT COLUMN: Contact Details Panel (3 cols) */}
          <div className={`lg:col-span-3 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-3xl p-5 flex flex-col justify-between h-full overflow-y-auto shadow-sm ${
            mobileTab === 'profile' ? 'flex' : 'hidden lg:flex'
          }`}>
            {activeContact ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between lg:hidden pb-3 border-b border-[var(--border-light)]">
                  <span className="text-xs font-bold text-[var(--text-secondary)]">Profile Details</span>
                  <button onClick={() => setMobileTab('chat')} className="p-1 text-xs text-amber-500 font-bold">
                    Back to Chat
                  </button>
                </div>

                {/* Profile Avatar & Name */}
                <div className="text-center space-y-2">
                  <div className="relative inline-block">
                    <img
                      src={getCleanAvatar(activeContact.avatar, activeContact.name)}
                      alt={activeContact.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-amber-500 shadow-md"
                    />
                    <span className="absolute bottom-0 right-1 p-1 rounded-full bg-emerald-500 text-white" title="Verified Member">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                    {activeContact.name}
                  </h3>
                  <span className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    activeContact.role === 'manager' 
                      ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' 
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}>
                    {activeContact.role === 'manager' ? 'Hotel Partner Host' : 'Customer Guest'}
                  </span>
                </div>

                {/* Contact Information List */}
                <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-light)] space-y-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-[var(--text-muted)] block font-semibold">Email Address</span>
                      <a href={`mailto:${activeContact.email}`} className="text-[var(--text-primary)] font-bold truncate block hover:text-amber-500">
                        {activeContact.email || 'N/A'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-[var(--text-muted)] block font-semibold">Phone Number</span>
                      <a href={`tel:${activeContact.phone}`} className="text-[var(--text-primary)] font-bold truncate block hover:text-amber-500">
                        {activeContact.phone || 'N/A'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-amber-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-[var(--text-muted)] block font-semibold">Location / Country</span>
                      <span className="text-[var(--text-primary)] font-bold truncate block">
                        {[activeContact.city, activeContact.country].filter(Boolean).join(', ') || 'United States'}
                      </span>
                    </div>
                  </div>

                  {activeContact.address && (
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-[var(--text-muted)] block font-semibold">Address</span>
                        <span className="text-[var(--text-primary)] font-bold truncate block">
                          {activeContact.address}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Navigation Links */}
                <div className="space-y-2 pt-2">
                  <a
                    href="/admin/users"
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-amber-500 hover:text-slate-950 text-xs font-bold text-[var(--text-primary)] transition-all"
                  >
                    <span>Manage in Users Directory</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  {activeContact.role === 'manager' ? (
                    <a
                      href="/admin/hotels"
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-purple-500 hover:text-white text-xs font-bold text-[var(--text-primary)] transition-all"
                    >
                      <span>Inspect Properties</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <a
                      href="/admin/bookings"
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-indigo-500 hover:text-white text-xs font-bold text-[var(--text-primary)] transition-all"
                    >
                      <span>View Guest Reservations</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-[var(--text-muted)] text-xs">
                No user selected
              </div>
            )}
          </div>
        </div>

        {/* Fullscreen Image Lightbox */}
        {activeLightboxImage && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveLightboxImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img src={activeLightboxImage} alt="Fullscreen Attachment" className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
              <button
                onClick={() => setActiveLightboxImage(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
};
export default AdminMessages;
