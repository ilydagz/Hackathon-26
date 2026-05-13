import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const Chat = () => {
  const { t } = useLanguage();
  const [activeChat, setActiveChat] = useState(0);
  const [message, setMessage] = useState('');

  const contacts = [
    { id: 0, name: 'Ahmet Yılmaz', lastMsg: 'Eşya hala duruyor mu?', time: '14:20', online: true, img: 'AY' },
    { id: 1, name: 'Ayşe Kaya', lastMsg: 'Fiyatta biraz yardımcı olabilir misiniz?', time: 'Dün', online: false, img: 'AK' },
    { id: 2, name: 'Mehmet Demir', lastMsg: 'Yarın gelip alabilirim.', time: 'Pzt', online: true, img: 'MD' },
  ];

  const messages = [
    { id: 1, sender: 'other', text: 'Merhaba, ilanınızla ilgileniyorum.', time: '14:15' },
    { id: 2, sender: 'other', text: 'Eşya hala duruyor mu?', time: '14:15' },
    { id: 3, sender: 'me', text: 'Evet, hala satılık. Temiz durumda.', time: '14:18' },
    { id: 4, sender: 'me', text: 'Nereden gelip almayı düşünüyorsunuz?', time: '14:18' },
  ];

  return (
    <div className="w-full px-margin-mobile md:px-margin-desktop py-lg h-[calc(100vh-80px)] flex gap-lg max-w-7xl mx-auto">
      {/* Sidebar - Contacts */}
      <aside className="hidden lg:flex flex-col w-96 shrink-0 bg-surface-card rounded-2xl shadow-sm border border-border-subtle overflow-hidden">
        <div className="p-lg border-b border-border-subtle">
          <h2 className="font-headline-md text-headline-md text-on-background mb-md">{t('chat.title')}</h2>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              placeholder={t('chat.search')}
              className="w-full bg-surface-muted border border-border-subtle rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-body-main text-body-main text-on-surface"
            />
          </div>
        </div>
        <div className="flex-grow overflow-y-auto p-2 space-y-1">
          {contacts.map((contact) => (
            <button 
              key={contact.id}
              onClick={() => setActiveChat(contact.id)}
              className={`w-full flex items-center gap-sm p-3 rounded-xl transition-all ${activeChat === contact.id ? 'bg-primary-container/10 border border-primary/20' : 'hover:bg-surface-muted border border-transparent'}`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center font-title-card text-title-card text-on-surface-variant">
                  {contact.img}
                </div>
                {contact.online && <div className="absolute -top-1 -right-1 w-3 h-3 bg-status-success rounded-full border-2 border-surface-card" />}
              </div>
              <div className="flex-grow text-left">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-title-card text-sm font-bold text-on-surface">{contact.name}</h4>
                  <span className="text-[10px] font-bold text-text-secondary">{contact.time}</span>
                </div>
                <p className="font-body-sm text-body-sm text-text-secondary line-clamp-1">{contact.lastMsg}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-grow bg-surface-card rounded-2xl shadow-sm border border-border-subtle flex flex-col overflow-hidden relative">
        {/* Chat Header */}
        <header className="px-lg py-4 border-b border-border-subtle flex items-center justify-between bg-surface-card/90 backdrop-blur-sm z-10">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center font-title-card text-title-card text-on-surface-variant">
              {contacts[activeChat].img}
            </div>
            <div>
              <h3 className="font-title-card text-title-card text-on-background leading-none mb-1">{contacts[activeChat].name}</h3>
              <p className="font-label-caps text-label-caps text-status-success uppercase tracking-wider">{t('chat.online')}</p>
            </div>
          </div>
          <button className="p-2 hover:bg-surface-muted rounded-full transition-all text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
        </header>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-lg space-y-md bg-app-bg">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] group`}>
                <div className={`p-4 rounded-xl font-body-main text-body-main shadow-sm ${msg.sender === 'me' ? 'bg-primary text-on-primary rounded-tr-sm' : 'bg-surface-card text-on-surface rounded-tl-sm border border-border-subtle'}`}>
                  {msg.text}
                </div>
                <div className={`flex items-center gap-1 mt-1 px-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase">{msg.time}</span>
                  {msg.sender === 'me' && <span className="material-symbols-outlined text-[14px] text-primary">done_all</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-sm md:p-lg bg-surface-card border-t border-border-subtle">
          <div className="flex items-center gap-2 bg-surface-muted rounded-xl p-2 pl-4 border border-border-subtle focus-within:border-primary transition-all">
            <button className="text-on-surface-variant hover:text-primary transition-colors p-1">
              <span className="material-symbols-outlined text-[24px]">image</span>
            </button>
            <button className="text-on-surface-variant hover:text-primary transition-colors p-1">
              <span className="material-symbols-outlined text-[24px]">sentiment_satisfied</span>
            </button>
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('chat.placeholder')}
              className="flex-grow bg-transparent border-none focus:ring-0 font-body-main text-body-main text-on-surface py-2"
            />
            <button className="bg-primary text-on-primary p-2 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-sm">
              <span className="material-symbols-outlined text-[24px]">send</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
