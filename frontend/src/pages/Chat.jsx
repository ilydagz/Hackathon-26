import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Image as ImageIcon, Smile, MoreVertical, CheckCheck } from 'lucide-react';

const Chat = () => {
  const [activeChat, setActiveChat] = useState(0);
  const [message, setMessage] = useState('');

  const contacts = [
    { id: 0, name: 'Ahmet Yılmaz', lastMsg: 'Eşya hala duruyor mu?', time: '14:20', online: true, img: 'JD' },
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
    <div className="container mx-auto px-6 py-12 h-[calc(100vh-100px)] flex gap-10">
      {/* Sidebar - Contacts */}
      <aside className="hidden lg:flex flex-col w-96 shrink-0 bg-white rounded-[3rem] shadow-2xl shadow-black/5 border border-border/20 overflow-hidden">
        <div className="p-8 border-b border-border">
          <h2 className="text-3xl font-black tracking-tighter text-secondary mb-6">Mesajlar</h2>
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Sohbet ara..."
              className="w-full bg-muted/40 border-none rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
            />
          </div>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-2">
          {contacts.map((contact) => (
            <button 
              key={contact.id}
              onClick={() => setActiveChat(contact.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-[2rem] transition-all ${activeChat === contact.id ? 'bg-primary/5 border border-primary/10 shadow-inner' : 'hover:bg-muted/50 border border-transparent'}`}
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center font-black text-secondary">
                  {contact.img}
                </div>
                {contact.online && <div className="absolute -top-1 -right-1 w-4 h-4 bg-sage rounded-full border-4 border-white" />}
              </div>
              <div className="flex-grow text-left">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-black text-secondary">{contact.name}</h4>
                  <span className="text-[10px] font-bold text-muted-foreground">{contact.time}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1 font-medium">{contact.lastMsg}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-grow bg-white rounded-[3rem] shadow-2xl shadow-black/5 border border-border/20 flex flex-col overflow-hidden relative">
        {/* Chat Header */}
        <header className="px-10 py-6 border-b border-border flex items-center justify-between bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-black text-secondary">
              {contacts[activeChat].img}
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight leading-none mb-1">{contacts[activeChat].name}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-sage">Çevrimiçi</p>
            </div>
          </div>
          <button className="p-3 hover:bg-muted rounded-2xl transition-all">
            <MoreVertical size={20} className="text-muted-foreground" />
          </button>
        </header>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-10 space-y-8 bg-[#FAF9F6]/30">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] group`}>
                <div className={`p-6 rounded-[2rem] font-medium text-sm leading-relaxed shadow-sm ${msg.sender === 'me' ? 'bg-primary text-white rounded-tr-none shadow-primary/20' : 'bg-white text-secondary rounded-tl-none border border-border/40'}`}>
                  {msg.text}
                </div>
                <div className={`flex items-center gap-2 mt-2 px-2 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-[10px] font-bold text-muted-foreground/60 tracking-widest uppercase">{msg.time}</span>
                  {msg.sender === 'me' && <CheckCheck size={12} className="text-primary" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-8 bg-white border-t border-border">
          <div className="flex items-center gap-4 bg-muted/40 rounded-[2.5rem] p-3 pl-8 pr-3 border border-border/40 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
            <button className="text-muted-foreground hover:text-primary transition-colors">
              <ImageIcon size={22} />
            </button>
            <button className="text-muted-foreground hover:text-primary transition-colors">
              <Smile size={22} />
            </button>
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bir mesaj yazın..."
              className="flex-grow bg-transparent border-none focus:ring-0 font-medium py-3"
            />
            <button className="bg-primary text-white p-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              <Send size={22} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
