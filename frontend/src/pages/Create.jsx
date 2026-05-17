import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Camera, Loader2, Sparkles, Check, ChevronLeft, Zap, Target, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Create = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, analyzing, results, publishing
  const [aiData, setAiData] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [loadingText, setLoadingText] = useState("EcoValue Agents analyzing...");
  const [analysisJobId, setAnalysisJobId] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [analysisError, setAnalysisError] = useState('');
  const [publishConfirmed, setPublishConfirmed] = useState(false);

  const loadingPhrases = [
    "Identifying your item...",
    "Checking market prices...",
    "Drafting description...",
    "Optimizing listing...",
  ];

  const handleTriggerCamera = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      handleAnalyze(file);
    }
  };

  const handleAnalyze = async (file) => {
    setStatus('analyzing');
    setAnalysisError('');
    setAnalysisStatus('queued');
    setPublishConfirmed(false);
    let phraseIndex = 0;
    const interval = setInterval(() => {
      phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
      setLoadingText(loadingPhrases[phraseIndex]);
    }, 1200);
    
    try {
      const data = await api.analyzeListing(file);
      const jobId = data.job_id || data.id;
      setAnalysisJobId(jobId);
      pollAnalysisJob(jobId);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisError('Analysis failed. Try another photo or retry upload.');
      setStatus('idle');
    } finally {
      clearInterval(interval);
    }
  };

  const applyAnalysisResult = (parsed) => {
    setAiData({
      title: parsed.title,
      description: parsed.description,
      quick_price: parsed.quick_price,
      market_price: parsed.market_price,
      confidence: parsed.confidence,
      rationale: parsed.rationale,
      needs_more_photos: parsed.needs_more_photos,
      retake_recommended: parsed.retake_recommended,
      image_quality: parsed.image_quality,
      quality_note: parsed.quality_note
    });
    setSelectedPrice(parsed.quick_price);
    const needsRetake = parsed.retake_recommended || parsed.needs_more_photos || parsed.image_quality === 'poor';
    setAnalysisStatus(needsRetake ? 'needs_review' : 'completed');
    if (!needsRetake) {
      setStatus('results');
    } else {
      setStatus('analyzing');
    }
  };

  const pollAnalysisJob = (jobId) => {
    const startedAt = Date.now();
    const maxWaitMs = 30000;

    const tick = async () => {
      try {
        const job = await api.getAnalysisJob(jobId);
        setAnalysisStatus(job.status);

        if (job.status === 'completed') {
          applyAnalysisResult(job.result_json || {});
          return;
        }

        if (job.status === 'failed') {
          setAnalysisError(job.error_message || 'Analysis failed. Try another photo or retry upload.');
          setStatus('idle');
          return;
        }

        if (Date.now() - startedAt > maxWaitMs) {
          setAnalysisError('Analysis timed out. Try again.');
          setStatus('idle');
          return;
        }

        setTimeout(tick, 1000);
      } catch (err) {
        console.error(err);
        setAnalysisError('Analysis failed. Try another photo or retry upload.');
        setStatus('idle');
      }
    };

    setTimeout(tick, 800);
  };

  const handlePublish = async () => {
    if (!selectedPrice) return;
    if (!publishConfirmed) return;
    setStatus('publishing');
    
    try {
      await api.createListing({
        title: aiData.title,
        description: aiData.description,
        selected_price: selectedPrice,
        image_url: image.name,
      });
      navigate('/feed');
    } catch (error) {
      console.error('Publishing failed:', error);
      setStatus('results');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-32">
      <AnimatePresence>
        {status === 'analyzing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.15, 1],
                rotate: [0, 90, 180, 270, 360]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="w-40 h-40 bg-white rounded-[3rem] flex items-center justify-center shadow-2xl mb-12 border border-primary/5"
            >
              <div className="relative">
                <div className="absolute -inset-8 bg-primary/10 rounded-full animate-ping" />
                <Sparkles size={56} className="text-primary" fill="currentColor" />
              </div>
            </motion.div>
            <h2 className="text-4xl font-black tracking-tighter text-foreground mb-6 h-10">{loadingText}</h2>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest opacity-60">EcoValue Intelligence Core</p>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] mt-4 text-primary/70">
              {analysisStatus === 'needs_review' ? 'Retake recommended' : analysisStatus === 'queued' ? 'Queued' : 'Analyzing'}
            </p>
            {analysisError && (
              <p className="text-sm text-red-600 font-medium mt-4 max-w-sm">{analysisError}</p>
            )}
            
            <div className="absolute bottom-20 left-12 right-12 flex gap-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <motion.div 
                  key={i}
                  animate={{ opacity: [0.1, 1, 0.1], height: [4, 8, 4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                  className="w-full bg-primary rounded-full"
                />
              ))}
            </div>
            {analysisStatus === 'needs_review' && aiData && (
              <div className="relative mt-8 w-full max-w-md bg-white rounded-[2rem] p-6 border border-border/40 shadow-xl text-left">
                <p className="font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Photo quality gate</p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{aiData.quality_note}</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setAnalysisStatus('completed');
                      setStatus('results');
                    }}
                    className="rounded-2xl border border-border/40 py-3 font-black text-sm"
                  >
                    Continue anyway
                  </button>
                  <button
                    onClick={() => {
                      setStatus('idle');
                      setAnalysisStatus('');
                    }}
                    className="rounded-2xl bg-primary text-white py-3 font-black text-sm"
                  >
                    Retake photo
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6">
        <header className="flex justify-between items-center mb-10 mt-4">
          <button onClick={() => navigate('/')} className="p-4 bg-white rounded-2xl shadow-sm border border-border/40 active:scale-90 transition-transform">
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
          <span className="font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">AI Listing Flow</span>
          <div className="w-14" />
        </header>

        {status === 'idle' && (
          <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
              <Sparkles size={40} className="text-primary" fill="currentColor" />
            </div>
            <h2 className="text-5xl font-black tracking-tighter mb-4 leading-[0.9]">Turn photos<br/>into profit.</h2>
            <p className="text-muted-foreground mb-16 font-bold uppercase tracking-widest text-[10px]">Zero effort. AI Powered.</p>
            
            <button 
              onClick={handleTriggerCamera}
              className="w-full aspect-[4/5] border-2 border-dashed border-primary/30 rounded-[4rem] flex flex-col items-center justify-center group active:scale-[0.98] transition-all bg-white shadow-xl shadow-black/5 hover:bg-primary/5"
            >
              <div className="w-28 h-28 bg-primary text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-primary/40 group-hover:scale-110 transition-transform">
                <Camera size={48} strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-black tracking-tighter">Snap Item Photo</span>
              <span className="text-muted-foreground font-bold uppercase tracking-widest text-[9px] mt-2">Environment Camera</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              onChange={handleImageChange} 
              accept="image/*" 
              capture="environment" 
            />
          </div>
        )}

        {status === 'results' && aiData && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-700">
            <div className="relative rounded-[4rem] overflow-hidden aspect-[4/5] shadow-2xl border-4 border-white premium-shadow">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8 bg-primary/95 text-white px-5 py-3 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest backdrop-blur-xl shadow-2xl">
                <Sparkles size={16} fill="currentColor" /> AI Analyzed
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] premium-shadow border border-border/30">
              <div className="flex items-center gap-2 text-primary mb-5 opacity-40">
                <Zap size={14} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Smart Suggestion</span>
              </div>
              <h3 className="text-4xl font-black tracking-tighter mb-4 leading-none">{aiData.title}</h3>
              <p className="text-muted-foreground font-medium leading-relaxed mb-10 text-lg">{aiData.description}</p>
              <div className="mb-8 p-5 rounded-[2rem] bg-muted/30 border border-border/40">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="font-black uppercase tracking-[0.18em] text-[10px] text-muted-foreground">Publish summary</span>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">{Math.round((aiData.confidence || 0) * 100)}% confidence</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{aiData.rationale}</p>
                {(aiData.needs_more_photos || aiData.retake_recommended || aiData.image_quality === 'poor') && (
                  <p className="text-sm font-semibold text-amber-700 mt-3">Photo quality weak. Retake if you want better draft.</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <button 
                  onClick={() => setSelectedPrice(aiData.quick_price)}
                  className={`relative p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-start text-left ${selectedPrice === aiData.quick_price ? 'border-primary bg-primary/5 shadow-inner' : 'border-border bg-muted/10'}`}
                >
                  <Zap size={24} className={selectedPrice === aiData.quick_price ? 'text-primary' : 'text-muted-foreground/40'} fill={selectedPrice === aiData.quick_price ? 'currentColor' : 'none'} />
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] mt-6 mb-2">Quick Sell</span>
                  <span className="text-3xl font-black tracking-tighter">₺{aiData.quick_price}</span>
                  {selectedPrice === aiData.quick_price && (
                    <motion.div layoutId="check" className="absolute top-4 right-4 bg-primary text-white p-1.5 rounded-full shadow-lg">
                      <Check size={14} strokeWidth={4} />
                    </motion.div>
                  )}
                </button>
                
                <button 
                  onClick={() => setSelectedPrice(aiData.market_price)}
                  className={`relative p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-start text-left ${selectedPrice === aiData.market_price ? 'border-primary bg-primary/5 shadow-inner' : 'border-border bg-muted/10'}`}
                >
                  <Target size={24} className={selectedPrice === aiData.market_price ? 'text-primary' : 'text-muted-foreground/40'} />
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] mt-6 mb-2">Market Value</span>
                  <span className="text-3xl font-black tracking-tighter">₺{aiData.market_price}</span>
                  {selectedPrice === aiData.market_price && (
                    <motion.div layoutId="check" className="absolute top-4 right-4 bg-primary text-white p-1.5 rounded-full shadow-lg">
                      <Check size={14} strokeWidth={4} />
                    </motion.div>
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-[2rem] bg-white p-5 border border-border/30 shadow-sm">
              <input
                type="checkbox"
                checked={publishConfirmed}
                onChange={(e) => setPublishConfirmed(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-muted-foreground font-medium">
                I reviewed title, price, and description. Publish only with my confirmation.
              </span>
            </label>

            <button 
              onClick={handlePublish}
              disabled={!selectedPrice || status === 'publishing' || !publishConfirmed}
              className="w-full bg-primary text-white py-8 rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-primary/40 active:scale-[0.95] transition-all disabled:opacity-30 flex items-center justify-center gap-4 border-b-8 border-black/10"
            >
              {status === 'publishing' ? <Loader2 className="animate-spin" /> : <Sparkles size={28} fill="currentColor" />}
              {status === 'publishing' ? 'PUBLISHING...' : 'CONFIRM & LIST'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Create;
