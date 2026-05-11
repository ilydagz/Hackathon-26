import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, Sparkles, X, Loader2, Zap, Target, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';

const AISellModal = ({ isOpen, onClose, onPublished }) => {
  const [step, setStep] = useState(1); // 1: Input, 2: Loading, 3: Results
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      startAnalysis(file);
    }
  };

  const startAnalysis = async (file) => {
    setStep(2);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post('/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAiData(response.data);
      setStep(3);
    } catch (err) {
      console.error(err);
      setStep(1);
    }
  };

  const handlePublish = async () => {
    if (!selectedPrice) return;
    setPublishing(true);
    try {
      await api.post('/api/listings', {
        title: aiData.title,
        description: aiData.description,
        selected_price: selectedPrice,
        image_url: image.name,
      });
      onPublished?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-secondary/40 backdrop-blur-xl"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-[#FAF9F6] rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 z-10 p-4 bg-white rounded-2xl shadow-xl border border-border/20 hover:scale-110 active:scale-95 transition-all"
            >
              <X size={20} className="text-secondary" />
            </button>

            <div className="p-12 pt-20">
              {step === 1 && (
                <div className="text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                    <Sparkles size={40} className="text-primary" fill="currentColor" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-secondary mb-4 leading-none">AI ile Hemen Sat</h2>
                  <p className="text-muted-foreground font-medium mb-12">Eşyanızı saniyeler içinde fiyatlayıp listeleyelim.</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="group flex flex-col items-center justify-center gap-6 p-12 bg-white rounded-[3rem] border-2 border-dashed border-border/60 hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform">
                        <Camera size={32} strokeWidth={2.5} />
                      </div>
                      <span className="text-xl font-black tracking-tight text-secondary">Kamera ile Çek</span>
                    </button>
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="group flex flex-col items-center justify-center gap-6 p-12 bg-white rounded-[3rem] border-2 border-dashed border-border/60 hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <div className="w-20 h-20 bg-secondary text-white rounded-full flex items-center justify-center shadow-2xl shadow-secondary/20 group-hover:scale-110 transition-transform">
                        <ImageIcon size={32} strokeWidth={2.5} />
                      </div>
                      <span className="text-xl font-black tracking-tight text-secondary">Galeriden Seç</span>
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                </div>
              )}

              {step === 2 && (
                <div className="text-center py-20 animate-in fade-in duration-500">
                  <div className="relative w-48 h-48 mx-auto mb-12">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-8 border-dashed border-primary/20 rounded-[4rem]"
                    />
                    <div className="absolute inset-4 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center">
                       <Loader2 className="animate-spin text-primary" size={48} />
                    </div>
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter text-secondary mb-4">EcoValue AI Analiz Ediyor...</h2>
                  <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px]">Piyasa Değerleri İnceleniyor</p>
                </div>
              )}

              {step === 3 && aiData && (
                <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="relative rounded-[3rem] overflow-hidden aspect-square shadow-2xl border-4 border-white">
                      <img src={preview} alt="Result" className="w-full h-full object-cover" />
                      <div className="absolute top-6 left-6 bg-primary text-white px-4 py-2 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-xl">
                        <Sparkles size={14} fill="currentColor" /> AI Doğrulandı
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center">
                       <h3 className="text-3xl font-black tracking-tighter text-secondary mb-4 leading-tight">{aiData.title}</h3>
                       <p className="text-muted-foreground font-medium leading-relaxed mb-8">{aiData.description}</p>
                       
                       <div className="space-y-4">
                         <button 
                           onClick={() => setSelectedPrice(aiData.quick_price)}
                           className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${selectedPrice === aiData.quick_price ? 'border-primary bg-primary/5' : 'border-border/60 bg-white'}`}
                         >
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                               <Zap size={24} fill="currentColor" />
                             </div>
                             <div className="text-left">
                               <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Hızlı Satış</p>
                               <p className="text-2xl font-black text-secondary">₺{aiData.quick_price}</p>
                             </div>
                           </div>
                           {selectedPrice === aiData.quick_price && <div className="bg-primary text-white p-1 rounded-full"><CheckCircle2 size={16} /></div>}
                         </button>

                         <button 
                           onClick={() => setSelectedPrice(aiData.ideal_price)}
                           className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${selectedPrice === aiData.ideal_price ? 'border-primary bg-primary/5' : 'border-border/60 bg-white'}`}
                         >
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                               <Target size={24} className="text-secondary" />
                             </div>
                             <div className="text-left">
                               <p className="text-[9px] font-black uppercase tracking-widest text-secondary/60 mb-1">Piyasa Fiyatı</p>
                               <p className="text-2xl font-black text-secondary">₺{aiData.ideal_price}</p>
                             </div>
                           </div>
                           {selectedPrice === aiData.ideal_price && <div className="bg-primary text-white p-1 rounded-full"><CheckCircle2 size={16} /></div>}
                         </button>
                       </div>
                    </div>
                  </div>

                  <button 
                    onClick={handlePublish}
                    disabled={!selectedPrice || publishing}
                    className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/40 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-4"
                  >
                    {publishing ? <Loader2 className="animate-spin" /> : <Sparkles size={24} fill="currentColor" />}
                    {publishing ? "İlan Yayınlanıyor..." : "İlanı Hemen Yayınla"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AISellModal;
