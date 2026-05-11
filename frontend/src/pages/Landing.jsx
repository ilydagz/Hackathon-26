import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-[#FAF9F6]">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-8">
              <Sparkles size={14} fill="currentColor" />
              Sürdürülebilir Gelecek Burada
            </div>
            <h1 className="text-6xl md:text-[7.5rem] font-black tracking-tighter text-secondary leading-[0.85] mb-10">
              Eskilerinize <br />
              <span className="text-primary italic">Yeni Bir Değer</span> Katın.
            </h1>
            <p className="text-lg md:text-xl text-foreground/60 font-medium leading-relaxed max-w-lg mb-12">
              Yapay zeka destekli EcoValue ile eşyalarınızı saniyeler içinde listeleyin. 
              Sıfır çaba, maksimum kazanç, minimum karbon ayak izi.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link to="/register" className="bg-primary text-white px-12 py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                Hemen Başla <ArrowRight size={20} strokeWidth={3} />
              </Link>
              <Link to="/feed" className="bg-white border-2 border-border text-secondary px-12 py-6 rounded-[2rem] font-black text-xl hover:bg-muted transition-all text-center">
                Pazaryerini Gez
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
            <div className="relative rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-[16px] border-white z-20">
              <img 
                src="/landing-hero.png" 
                alt="Eco Marketplace Hero" 
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
            {/* AI badge floating */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -right-10 bg-white p-8 rounded-[2.5rem] shadow-2xl z-30 border border-border/50 hidden md:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Sparkles size={28} className="text-primary" fill="currentColor" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">AI Destekli</p>
                  <p className="font-black text-xl text-secondary">Otomatik Fiyatlama</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-20 border-y border-border/40 bg-white">
        <div className="container mx-auto px-6">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-12">Güvenilir Sürdürülebilir Partneriniz</p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 grayscale opacity-40">
             <span className="text-2xl font-black italic">EcoTrend</span>
             <span className="text-2xl font-black italic">GreenWave</span>
             <span className="text-2xl font-black italic">PureLife</span>
             <span className="text-2xl font-black italic">Sustainia</span>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-40 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-32">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-secondary mb-8 leading-[0.9]">Sıfır Çabayla Satışın Keyfini Çıkarın.</h2>
            <p className="text-muted-foreground text-xl font-medium max-w-xl mx-auto leading-relaxed">Karmaşık ilan formlarıyla uğraşmaya son. EcoValue yapay zekası her şeyi sizin için yapar.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-24">
            <motion.div whileHover={{ y: -10 }} className="flex flex-col items-center text-center group">
              <div className="w-32 h-32 bg-background rounded-[3rem] flex items-center justify-center mb-10 shadow-xl shadow-black/5 group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-border/20">
                <Sparkles size={40} className="group-hover:rotate-12 transition-transform" />
              </div>
              <h3 className="text-3xl font-black tracking-tight mb-5">1. Fotoğrafını Çek</h3>
              <p className="text-muted-foreground font-medium leading-relaxed px-4">Eşyanın sadece bir fotoğrafını yükleyin, yapay zekamız onu saniyeler içinde tanısın.</p>
            </motion.div>

            <motion.div whileHover={{ y: -10 }} className="flex flex-col items-center text-center group">
              <div className="w-32 h-32 bg-background rounded-[3rem] flex items-center justify-center mb-10 shadow-xl shadow-black/5 group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-border/20">
                <Zap size={40} className="group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-3xl font-black tracking-tight mb-5">2. AI Analiz Etsin</h3>
              <p className="text-muted-foreground font-medium leading-relaxed px-4">En iyi başlık, profesyonel açıklama ve piyasa değerini biz belirleyelim.</p>
            </motion.div>

            <motion.div whileHover={{ y: -10 }} className="flex flex-col items-center text-center group">
              <div className="w-32 h-32 bg-background rounded-[3rem] flex items-center justify-center mb-10 shadow-xl shadow-black/5 group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-border/20">
                <ShieldCheck size={40} className="group-hover:rotate-[-12deg] transition-transform" />
              </div>
              <h3 className="text-3xl font-black tracking-tight mb-5">3. Hemen Sat</h3>
              <p className="text-muted-foreground font-medium leading-relaxed px-4">İlanınızı onaylayın ve binlerce alıcıyla anında buluşun. Güvenli ve hızlı.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sustainability Highlight */}
      <section className="py-40 bg-[#FAF9F6] border-t border-border/30">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-32 items-center">
          <div>
            <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-primary/20">
              <Leaf size={32} />
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-secondary leading-[0.9] mb-10">Gezegeni Koruyun,<br />Ekonomiye <span className="text-primary">Can Verin.</span></h2>
            <div className="space-y-12">
              <div className="flex gap-8">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center flex-shrink-0 border border-border/10">
                  <Leaf className="text-primary" size={24} />
                </div>
                <div>
                  <h4 className="font-black text-2xl tracking-tight mb-2">Karbon Tasarrufu</h4>
                  <p className="text-muted-foreground font-medium leading-relaxed">Her ikinci el satış, yeni bir ürünün üretiminde harcanacak binlerce litre suyu ve karbon salınımını engeller.</p>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center flex-shrink-0 border border-border/10">
                  <ShieldCheck className="text-primary" size={24} />
                </div>
                <div>
                  <h4 className="font-black text-2xl tracking-tight mb-2">Güvenli Topluluk</h4>
                  <p className="text-muted-foreground font-medium leading-relaxed">Doğrulanmış kullanıcı profilleri ve şeffaf satıcı puanları ile alışverişiniz her zaman güvende.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/10 rounded-[4.5rem] blur-2xl group-hover:bg-primary/20 transition-all" />
            <div className="bg-secondary rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />
              <div className="relative z-10">
                <h3 className="text-5xl font-black tracking-tighter mb-10 leading-none">Bugün Bir<br />Değişim Başlatın.</h3>
                <p className="text-white/60 font-medium mb-12 text-lg leading-relaxed">
                  İhtiyacınız olmayan eşyaları sisteme geri kazandırın, hem bütçenizi hem de doğayı koruyun.
                </p>
                <Link to="/register" className="inline-flex bg-primary text-white px-12 py-6 rounded-[2rem] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40">
                  Ücretsiz Katıl
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary pt-32 pb-16 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-20 mb-32">
            <div className="md:col-span-2">
              <Link to="/" className="text-4xl font-black tracking-tighter flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles size={26} className="text-white" fill="currentColor" />
                </div>
                EcoValue
              </Link>
              <p className="text-white/40 max-w-sm font-medium text-lg leading-relaxed">
                Yapay zeka ile güçlendirilmiş, çevre dostu marketplace deneyimi. 
                Sürdürülebilir moda ve teknoloji için yeni adresiniz.
              </p>
            </div>
            <div>
              <h5 className="font-black uppercase tracking-[0.2em] text-[10px] mb-8 text-primary/60">Kategoriler</h5>
              <ul className="space-y-4 text-white/70 font-bold text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Elektronik</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Moda</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Ev & Yaşam</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Hobiler</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-black uppercase tracking-[0.2em] text-[10px] mb-8 text-primary/60">Platform</h5>
              <ul className="space-y-4 text-white/70 font-bold text-sm">
                <li><Link to="/feed" className="hover:text-primary transition-colors">Marketplace</Link></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">Üye Ol</Link></li>
                <li><Link to="/login" className="hover:text-primary transition-colors">Giriş Yap</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Yardım Merkezi</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-black uppercase tracking-[0.2em] text-[10px] mb-8 text-primary/60">İletişim</h5>
              <ul className="space-y-4 text-white/70 font-bold text-sm">
                <li><a href="mailto:hello@ecovalue.com" className="hover:text-primary transition-colors">hello@ecovalue.com</a></li>
                <li className="text-white/40">İstanbul, Türkiye</li>
              </ul>
            </div>
          </div>
          <div className="pt-16 border-t border-white/5 flex flex-col md:row-reverse md:flex-row justify-between items-center gap-8">
            <div className="flex gap-8">
               <a href="#" className="text-white/30 hover:text-white transition-colors"><div className="w-2 h-2 bg-white/20 rounded-full" /></a>
               <a href="#" className="text-white/30 hover:text-white transition-colors"><div className="w-2 h-2 bg-white/20 rounded-full" /></a>
               <a href="#" className="text-white/30 hover:text-white transition-colors"><div className="w-2 h-2 bg-white/20 rounded-full" /></a>
            </div>
            <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
              © 2026 EcoValue Marketplace. Crafted for a better planet.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
