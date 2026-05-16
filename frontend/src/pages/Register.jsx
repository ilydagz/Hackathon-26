import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { motion } from 'framer-motion';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await api.register(name, email, password);
      localStorage.setItem('auth', 'true');
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('userId', data.user.id);
      window.dispatchEvent(new Event('auth-change'));
      navigate(data.user.role === 'admin' ? '/admin' : '/feed');
    } catch (err) {
      setError('Kayıt başarısız. Bu e-posta kullanılıyor olabilir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface-card p-xl rounded-[40px] shadow-lg border border-border-subtle"
      >
        <div className="text-center mb-xl">
          <div className="w-16 h-16 bg-primary-container/20 rounded-2xl flex items-center justify-center mx-auto mb-md">
            <span className="material-symbols-outlined text-[32px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>eco</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-background mb-xs">Hesap Oluştur</h1>
          <p className="font-label-caps text-label-caps text-text-secondary uppercase tracking-wider">EcoValue Marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-md">
          <div className="space-y-1">
            <label className="font-label-caps text-label-caps uppercase tracking-wider text-text-secondary ml-2">Ad Soyad</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">person</span>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-surface-muted border border-border-subtle rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-main text-body-main text-on-surface"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-label-caps text-label-caps uppercase tracking-wider text-text-secondary ml-2">E-Posta</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">mail</span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface-muted border border-border-subtle rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-main text-body-main text-on-surface"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-label-caps text-label-caps uppercase tracking-wider text-text-secondary ml-2">Şifre</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-surface-muted border border-border-subtle rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-main text-body-main text-on-surface"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-status-error text-sm text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-title-card text-title-card shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-xs mt-sm"
          >
            {loading ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
            {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
          </button>
        </form>

        <div className="mt-xl text-center">
          <p className="font-body-sm text-body-sm text-text-secondary">
            Zaten hesabınız var mı? <Link to="/login" className="text-primary font-bold hover:underline">Giriş Yap</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
