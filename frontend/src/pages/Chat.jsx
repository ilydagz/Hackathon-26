import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';

const Chat = () => {
  const { t } = useLanguage();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentUserId = Number(localStorage.getItem('userId'));

  const emojis = ['😊', '😂', '😍', '👋', '👍', '🙏', '💯', '🔥', '✨', '📦', '💰'];

  const getAvatarSrc = (avatarUrl) => {
    if (!avatarUrl) return '';
    return avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:8000/static/${avatarUrl}`;
  };

  const renderAvatar = (user) => {
    const avatarSrc = getAvatarSrc(user?.avatar_url);
    const initials = (user?.name || 'U').substring(0, 2).toUpperCase();

    if (avatarSrc) {
      return <img src={avatarSrc} alt={user?.name || 'User'} className="w-full h-full object-cover" />;
    }

    return <span>{initials}</span>;
  };

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const data = await api.getChats();
        setChats(data);
        if (data.length > 0 && !activeChat) {
          setActiveChat(data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    if (activeChat) {
      setMessages([]);
      const fetchMessages = async () => {
        try {
          const otherUserId = Number(activeChat.sender_id) === currentUserId ? activeChat.receiver_id : activeChat.sender_id;
          const data = await api.getMessages(activeChat.listing_id, otherUserId);
          setMessages(data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchMessages();
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;

    try {
      const receiverId = activeChat.sender_id === currentUserId ? activeChat.receiver_id : activeChat.sender_id;
      const newMsg = await api.sendMessage({
        receiver_id: receiverId,
        listing_id: activeChat.listing_id,
        content: message
      });
      setMessages([...messages, newMsg]);
      setMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const addEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojis(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Mock image upload
      setMessage(prev => prev + ` [Image: ${file.name}] `);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading chats...</div>;
  }

  return (
    <div className="w-full px-margin-mobile md:px-margin-desktop py-lg h-[calc(100vh-80px)] flex gap-lg max-w-7xl mx-auto">
      {/* Sidebar - Contacts */}
      <aside className="hidden lg:flex flex-col w-96 shrink-0 bg-surface-card rounded-2xl shadow-sm border border-border-subtle overflow-hidden">
        <div className="p-lg border-b border-border-subtle">
          <h2 className="font-headline-md text-headline-md text-on-background mb-md">{t('chat.title')}</h2>
        </div>
        <div className="flex-grow overflow-y-auto p-2 space-y-1">
          {chats.map((chat) => {
            const isMeSender = Number(chat.sender_id) === currentUserId;
            const otherUser = isMeSender ? chat.receiver : chat.sender;
            const otherName = otherUser?.name || 'User ' + (isMeSender ? chat.receiver_id : chat.sender_id);
            
            return (
              <button 
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`w-full flex items-center gap-sm p-3 rounded-xl transition-all ${activeChat?.id === chat.id ? 'bg-primary-container/10 border border-primary/20 shadow-sm' : 'hover:bg-surface-muted border border-transparent'}`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-muted flex items-center justify-center font-title-card text-title-card text-on-surface-variant shrink-0">
                  {renderAvatar(otherUser)}
                </div>
                <div className="flex-grow text-left overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-title-card text-sm font-bold text-on-surface truncate">{otherName}</h4>
                    <span className="text-[10px] font-bold text-text-secondary whitespace-nowrap ml-2">{new Date(chat.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-text-secondary line-clamp-1">{chat.content}</p>
                </div>
              </button>
            );
          })}
          {chats.length === 0 && <p className="text-center p-lg text-text-secondary">{t('chat.noChats')}</p>}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-grow bg-surface-card rounded-2xl shadow-sm border border-border-subtle flex flex-col overflow-hidden relative">
        {activeChat ? (
          <>
            <header className="px-lg py-4 border-b border-border-subtle flex items-center justify-between bg-surface-card/90 backdrop-blur-sm z-10">
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-muted flex items-center justify-center font-title-card text-title-card text-on-surface-variant">
                   {renderAvatar(Number(activeChat.sender_id) === currentUserId ? activeChat.receiver : activeChat.sender)}
                </div>
                <div>
                  <h3 className="font-title-card text-title-card text-on-background leading-none mb-1">
                    {Number(activeChat.sender_id) === currentUserId ? activeChat.receiver?.name : activeChat.sender?.name}
                  </h3>
                  <p className="font-label-caps text-label-caps text-status-success uppercase tracking-wider">{t('chat.online')}</p>
                </div>
              </div>
            </header>

            <div ref={scrollRef} className="flex-grow overflow-y-auto p-lg bg-app-bg relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeChat.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-md"
                >
                  {messages.map((msg) => (
                    <motion.div 
                      key={msg.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${String(msg.sender_id) === String(currentUserId) ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] group`}>
                        <div className={`p-4 rounded-xl font-body-main text-body-main shadow-sm ${String(msg.sender_id) === String(currentUserId) ? 'bg-primary text-on-primary rounded-tr-sm' : 'bg-surface-card text-on-surface rounded-tl-sm border border-border-subtle'}`}>
                          {msg.content}
                        </div>
                        <div className={`flex items-center gap-1 mt-1 px-1 ${String(msg.sender_id) === String(currentUserId) ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full opacity-50 py-20">
                      <span className="material-symbols-outlined text-[48px] mb-2">forum</span>
                      <p className="font-body-main">{t('chat.noMessages')}</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-sm md:p-lg bg-surface-card border-t border-border-subtle relative">
              <AnimatePresence>
                {showEmojis && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-lg mb-2 p-2 bg-surface-card border border-border-subtle rounded-xl shadow-xl flex gap-1 z-20"
                  >
                    {emojis.map(e => (
                      <button key={e} onClick={() => addEmoji(e)} className="text-2xl hover:scale-125 transition-transform p-1">{e}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSend} className="flex items-center gap-2 bg-surface-muted rounded-xl p-2 pl-4 border border-border-subtle focus-within:border-primary transition-all">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-on-surface-variant hover:text-primary transition-colors p-1">
                  <span className="material-symbols-outlined text-[24px]">image</span>
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
                
                <button type="button" onClick={() => setShowEmojis(!showEmojis)} className="text-on-surface-variant hover:text-primary transition-colors p-1">
                  <span className="material-symbols-outlined text-[24px]">sentiment_satisfied</span>
                </button>
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('chat.placeholder')}
                  className="flex-grow bg-transparent border-none focus:ring-0 font-body-main text-body-main text-on-surface py-2"
                />
                <button type="submit" className="bg-primary text-on-primary p-2 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">send</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-text-secondary">
            {t('chat.select')}
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;
