import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth
    setTimeout(() => {
      navigate('/feed');
    }, 1000);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6 bg-[#FAF9F6]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-12 rounded-[3rem] shadow-2xl shadow-black/5 border border-border/40"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles size={32} className="text-primary" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-secondary mb-2">Hoş Geldiniz</h1>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">EcoValue Marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-secondary/60 ml-4">E-Posta</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="email" 
                required
                className="w-full bg-muted/30 border-none rounded-2xl py-5 pl-14 pr-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-secondary/60 ml-4">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="password" 
                required
                className="w-full bg-muted/30 border-none rounded-2xl py-5 pl-14 pr-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground font-medium">
            Hesabınız yok mu? <Link to="/register" className="text-primary font-black">Kayıt Ol</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
