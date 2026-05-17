import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';

const PRICE_STRATEGIES = [
  {
    key: 'sell_fast',
    label: 'Sell fast',
    icon: 'zap',
    description: 'Lowest suggested price. Moves fastest.',
  },
  {
    key: 'balanced',
    label: 'Balanced',
    icon: 'target',
    description: 'Middle price. Best mix of speed and payout.',
  },
  {
    key: 'maximize',
    label: 'Maximize',
    icon: 'sparkles',
    description: 'Highest suggested price. Best if you can wait.',
  },
];

const getStrategyPrice = (aiData, strategy) => {
  if (!aiData) return 0;
  if (strategy === 'sell_fast') return Number(aiData.quick_price || 0);
  if (strategy === 'balanced') return Number(aiData.market_price || aiData.quick_price || 0);
  if (strategy === 'maximize') {
    return Number(aiData.price_ceiling || Math.round((aiData.market_price || aiData.quick_price || 0) * 1.15));
  }
  return Number(aiData.market_price || aiData.quick_price || 0);
};

const AISellModal = ({ isOpen, onClose, onPublished }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1); // 0: Drafts List, 1: Upload, 2: Analysis, 3: Draft Edit, 4: Price
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState('balanced');
  const [customPrice, setCustomPrice] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisJobId, setAnalysisJobId] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [drafts, setDrafts] = useState([]);
  const [selectedDraftId, setSelectedDraftId] = useState(null);
  
  // Draft State
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftCategory, setDraftCategory] = useState('furniture');
  const [draftCondition, setDraftCondition] = useState('good');
  const [attributes, setAttributes] = useState({});

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  async function fetchDrafts() {
    try {
      const data = await api.getDrafts();
      setDrafts(data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAnalysisError('');
      setImage(file);
      setPreview(URL.createObjectURL(file));
      startAnalysis(file);
    }
  };

  const startAnalysis = async (file) => {
    setAnalyzing(true);
    setAnalysisError('');
    setAnalysisStatus('queued');
    setStep(2);
    try {
      const data = await api.analyzeListing(file);
      const jobId = data.job_id || data.id;
      setAnalysisJobId(jobId);
      pollAnalysisJob(jobId);
    } catch (err) {
      console.error(err);
      setAnalysisError('Analysis failed. Try another photo or retry upload.');
      setStep(1);
    } finally {
      setAnalyzing(false);
    }
  };

  const applyAnalysisResult = (parsed) => {
    setAiData({
      title: parsed.title,
      description: parsed.description,
      quick_price: parsed.quick_price,
      market_price: parsed.market_price,
      price_strategy: parsed.price_strategy,
      price_floor: parsed.price_floor,
      price_ceiling: parsed.price_ceiling,
      price_rationale: parsed.price_rationale,
      category: parsed.category,
      condition: parsed.condition,
      confidence: parsed.confidence,
      needs_more_photos: parsed.needs_more_photos,
      retake_recommended: parsed.retake_recommended,
      image_quality: parsed.image_quality,
      quality_note: parsed.quality_note,
      rationale: parsed.rationale,
      suggested_attributes: parsed.suggested_attributes || {},
      image_url: parsed.image_url || null
    });
    setDraftTitle(parsed.title || '');
    setDraftDescription(parsed.description || '');
    setDraftCategory(parsed.category || 'furniture');
    setDraftCondition(parsed.condition || 'good');
    setAttributes(parsed.suggested_attributes || {});
    setSelectedPrice(parsed.price_strategy || 'balanced');
    setCustomPrice('');
    const needsRetake = parsed.retake_recommended || parsed.needs_more_photos || parsed.image_quality === 'poor';
    setAnalysisStatus(needsRetake ? 'needs_review' : 'completed');
    if (!needsRetake) {
      setStep(3);
    } else {
      setStep(2);
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
          setStep(1);
          return;
        }

        if (Date.now() - startedAt > maxWaitMs) {
          setAnalysisError('Analysis timed out. Try again.');
          setStep(1);
          return;
        }

        setTimeout(tick, 1000);
      } catch (err) {
        console.error(err);
        setAnalysisError('Analysis failed. Try another photo or retry upload.');
        setStep(1);
      }
    };

    setTimeout(tick, 800);
  };

  const handleSaveDraft = async () => {
    setPublishing(true);
    try {
      const payload = {
        title: draftTitle,
        description: draftDescription,
        category: draftCategory,
        condition: draftCondition,
        selected_price: Number(getStrategyPrice(aiData, selectedPrice)),
        status: 'draft',
        attributes: attributes,
        image_url: aiData?.image_url || (image ? image.name : (preview ? preview.split('/').pop() : 'demo.jpg')),
        price_strategy: selectedPrice,
        price_floor: aiData?.price_floor,
        price_ceiling: aiData?.price_ceiling,
        price_rationale: aiData?.price_rationale,
      };

      if (selectedDraftId) {
        await api.updateListing(selectedDraftId, payload);
      } else {
        await api.createListing(payload);
      }
      onClose();
      resetState();
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    const finalPrice = selectedPrice === 'custom'
      ? (Number(customPrice) || getStrategyPrice(aiData, 'balanced'))
      : getStrategyPrice(aiData, selectedPrice);
    try {
      const payload = {
        title: draftTitle,
        description: draftDescription,
        category: draftCategory,
        condition: draftCondition,
        selected_price: Number(finalPrice),
        status: 'active',
        attributes: attributes,
        image_url: aiData?.image_url || (image ? image.name : (preview ? preview.split('/').pop() : 'demo.jpg')),
        price_strategy: selectedPrice,
        price_floor: aiData?.price_floor,
        price_ceiling: aiData?.price_ceiling,
        price_rationale: aiData?.price_rationale,
      };

      if (selectedDraftId) {
        await api.updateListing(selectedDraftId, payload);
      } else {
        await api.createListing(payload);
      }
      onPublished?.();
      onClose();
      resetState();
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  const resetState = () => {
    setStep(1);
    setImage(null);
    setPreview(null);
    setAiData(null);
    setAnalyzing(false);
    setAnalysisError('');
    setAnalysisJobId(null);
    setSelectedDraftId(null);
    setDraftTitle('');
    setDraftDescription('');
    setDraftCategory('furniture');
    setDraftCondition('good');
    setSelectedPrice('balanced');
    setCustomPrice('');
    setAttributes({});
  };

  const handleBack = () => {
    if (step === 1) onClose();
    else if (step === 0) setStep(1);
    else if (step === 3) setStep(1);
    else if (step === 4) setStep(3);
    else setStep(step - 1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
          />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[420px] h-auto max-h-[90vh] bg-app-bg flex flex-col overflow-hidden shadow-2xl rounded-3xl"
            >
            {/* Header */}
            <header className="bg-background flex justify-between items-center px-4 h-16 w-full border-b border-border-subtle shrink-0 sticky top-0 z-50">
              <button onClick={handleBack} className="text-on-surface-variant hover:opacity-80 active:scale-95 transition-transform flex items-center justify-center p-2 rounded-full">
                <span className="material-symbols-outlined">{step === 1 ? 'close' : 'arrow_back'}</span>
              </button>
              <h1 className="font-display-lg text-headline-md font-bold text-primary">{t('ai.sellItem')}</h1>
              {step !== 0 ? (
                <button onClick={async () => { setStep(0); await fetchDrafts(); }} className="text-on-surface-variant font-title-card text-title-card px-2 hover:opacity-80 transition-opacity active:scale-95">{t('ai.drafts')}</button>
              ) : <div className="w-10" />}
            </header>

            {/* Step 0: Drafts */}
            {step === 0 && (
              <main className="flex-1 overflow-y-auto px-margin-mobile pt-lg pb-8 flex flex-col animate-in fade-in duration-300 custom-scrollbar">
                <div className="mb-lg flex justify-between items-center">
                  <h2 className="font-display-lg-mobile text-display-lg-mobile text-on-surface tracking-tight">{t('ai.drafts')}</h2>
                  <button onClick={() => setStep(1)} className="text-primary font-title-card text-title-card flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">add</span> New
                  </button>
                </div>
                
                <div className="flex flex-col gap-md">
                  {drafts.map((draft) => (
                    <div 
                      key={draft.id} 
                      className="bg-surface-card border border-border-subtle rounded-xl p-md flex items-center gap-md hover:shadow-sm cursor-pointer transition-shadow" 
                      onClick={() => {
                        setSelectedDraftId(draft.id);
                        setAiData({
                          title: draft.title,
                          description: draft.description,
                          quick_price: draft.selected_price || 500,
                          market_price: Math.round((draft.selected_price || 500) * 1.2),
                          price_strategy: draft.price_strategy || 'balanced',
                          price_floor: draft.price_floor || Math.round((draft.selected_price || 500) * 0.9),
                          price_ceiling: draft.price_ceiling || Math.round((draft.selected_price || 500) * 1.2),
                          price_rationale: draft.price_rationale || 'Loaded from saved draft.',
                          category: draft.category || 'furniture',
                          condition: draft.condition || 'good',
                          confidence: 0.8,
                          needs_more_photos: false,
                          rationale: 'Loaded from saved draft.',
                          suggested_attributes: draft.attributes || {}
                        });
                        setDraftTitle(draft.title);
                        setDraftDescription(draft.description);
                        setDraftCategory(draft.category || 'furniture');
                        setDraftCondition(draft.condition || 'good');
                        setAttributes(draft.attributes || {});
                        setSelectedPrice(draft.price_strategy || 'balanced');
                        setCustomPrice('');
                        setPreview(`http://localhost:8000/static/images/${draft.image_url}`);
                        setStep(3);
                      }}
                    >
                      <div className="w-16 h-16 bg-surface-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                        <img src={`http://localhost:8000/static/images/${draft.image_url}`} className="w-full h-full object-cover" alt="Draft preview" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-title-card text-title-card text-on-surface line-clamp-1">{draft.title}</h4>
                        <p className="font-body-sm text-body-sm text-text-secondary">Draft</p>
                      </div>
                      <span className="material-symbols-outlined text-text-secondary">chevron_right</span>
                    </div>
                  ))}
                  {drafts.length === 0 && <p className="text-center text-text-secondary p-lg">No drafts found</p>}
                </div>
              </main>
            )}

            {/* Step 1: Upload */}
            {step === 1 && (
              <main className="flex-1 overflow-y-auto px-margin-mobile pt-lg pb-8 flex flex-col animate-in fade-in duration-300 custom-scrollbar">
                <div className="mb-lg">
                  <h2 className="font-display-lg-mobile text-display-lg-mobile text-on-surface tracking-tight mb-2">{t('ai.addPhotos')}</h2>
                  <p className="font-body-sm text-body-sm text-text-secondary">{t('ai.addPhotosDesc')}</p>
                </div>
                <div className="grid grid-cols-2 gap-sm mb-md">
                  <button onClick={() => cameraInputRef.current.click()} disabled={analyzing} className="col-span-2 aspect-video bg-primary-fixed/20 border-2 border-primary border-dashed rounded-xl flex flex-col items-center justify-center text-primary hover:bg-primary-fixed/30 active:scale-[0.98] transition-all duration-200 shadow-sm disabled:opacity-60">
                    <span className="material-symbols-outlined" style={{fontSize: '36px', fontVariationSettings: "'FILL' 1"}}>photo_camera</span>
                    <span className="font-title-card text-title-card mt-sm">{t('ai.takePhoto')}</span>
                  </button>
                </div>
                <button onClick={() => galleryInputRef.current.click()} disabled={analyzing} className="w-full flex items-center justify-center gap-xs py-sm text-primary font-title-card text-title-card hover:bg-primary-fixed/10 active:bg-primary-fixed/20 rounded-lg transition-colors disabled:opacity-60">
                  <span className="material-symbols-outlined">collections</span>
                  {t('ai.uploadGallery')}
                </button>
                <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleImageChange} />
                {preview && (
                  <div className="mt-lg rounded-2xl overflow-hidden border border-border-subtle bg-surface-card">
                    <img src={preview} alt="Selected preview" className="w-full aspect-square object-cover" />
                  </div>
                )}
                {analysisError && (
                  <div className="mt-md rounded-xl border border-status-danger/30 bg-status-danger/10 p-md text-status-danger flex items-start justify-between gap-md">
                    <p className="font-body-sm text-body-sm">{analysisError}</p>
                    {image && (
                      <button onClick={() => startAnalysis(image)} className="font-title-card text-title-card underline shrink-0">
                        Retry
                      </button>
                    )}
                  </div>
                )}
              </main>
            )}

            {/* Step 2: Analysis */}
            {step === 2 && (
              <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto animate-in fade-in duration-300">
                <div className="text-center mb-10 mt-8">
                  <h2 className="font-display-lg-mobile text-display-lg-mobile mb-3 text-on-surface">{t('ai.creatingDraft')}</h2>
                  <p className="font-body-sm text-body-sm text-text-secondary">{t('ai.analyzingPhotos')}</p>
                </div>
                <div className="relative w-48 h-48 mx-auto mb-12 flex items-center justify-center">
                   <div className="w-32 h-32 rounded-full bg-surface-container-high flex items-center justify-center animate-pulse">
                    <span className="material-symbols-outlined text-primary" style={{fontSize: '48px', fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-title-card text-title-card text-on-surface">
                    {analysisStatus === 'queued' ? 'Queued' : analysisStatus === 'processing' ? 'Analyzing' : analysisStatus === 'needs_review' ? 'Retake recommended' : 'Waiting'}
                  </p>
                  {analysisJobId && (
                    <p className="font-body-sm text-body-sm text-text-secondary mt-2">Job #{analysisJobId}</p>
                  )}
                </div>
                {analysisStatus === 'needs_review' && aiData && (
                  <div className="mt-8 rounded-2xl border border-border-subtle bg-surface-card p-lg space-y-md">
                    <div>
                      <p className="font-title-card text-title-card text-on-surface">Photo quality gate</p>
                      <p className="font-body-sm text-body-sm text-text-secondary mt-1">{aiData.quality_note}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-sm">
                      <button
                        onClick={() => {
                          setAnalysisStatus('completed');
                          setStep(3);
                        }}
                        className="bg-surface-card border border-border-subtle rounded-xl py-3 font-title-card text-title-card text-on-surface"
                      >
                        Continue anyway
                      </button>
                      <button
                        onClick={() => {
                          setStep(1);
                          setAnalysisStatus('');
                        }}
                        className="bg-primary text-on-primary rounded-xl py-3 font-title-card text-title-card"
                      >
                        Retake photo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review Draft */}
            {step === 3 && (
              <>
                <main className="flex-1 px-margin-mobile py-lg pb-12 overflow-y-auto animate-in slide-in-from-right duration-300 custom-scrollbar">
                  <div className="max-w-md mx-auto space-y-lg">
                    <div className="text-center space-y-sm">
                      <h2 className="font-display-lg-mobile text-display-lg-mobile text-on-surface font-bold tracking-tight">{t('ai.reviewDraft')}</h2>
                      <p className="font-body-sm text-body-sm text-text-secondary">{t('ai.reviewDesc')}</p>
                    </div>
                    <div className="bg-surface-card border border-border-subtle rounded-xl p-md flex items-center space-x-md">
                      <div className="w-20 h-20 bg-surface-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                        {preview && <img src={preview} className="w-full h-full object-cover" alt="Preview" />}
                      </div>
                      <div className="flex-grow">
                        <p className="font-title-card text-title-card text-on-surface line-clamp-2">{draftTitle}</p>
                      </div>
                    </div>
                    {aiData && (
                      <div className="rounded-xl border border-border-subtle bg-surface-muted/50 p-md space-y-2">
                        <div className="flex items-center justify-between gap-sm">
                          <span className="font-title-card text-title-card text-on-surface">Analysis</span>
                          <span className="font-body-sm text-body-sm text-text-secondary">
                            {Math.round((aiData.confidence || 0) * 100)}% confidence
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-text-secondary">{aiData.rationale}</p>
                        {aiData.needs_more_photos && (
                          <p className="font-body-sm text-body-sm text-status-warning">More photos would improve draft quality.</p>
                        )}
                      </div>
                    )}
                    <div className="space-y-sm">
                      <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Agent note</p>
                      <p className="font-body-sm text-body-sm text-text-secondary">{aiData?.rationale}</p>
                    </div>
                    <div className="space-y-md">
                      <div className="space-y-xs">
                        <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{t('ai.title')}</label>
                        <input type="text" value={draftTitle} onChange={e => setDraftTitle(e.target.value)} className="w-full bg-surface-card border border-border-subtle rounded-lg px-4 py-3 font-body-main text-body-main text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-xs">
                        <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{t('ai.description')}</label>
                        <textarea rows="4" value={draftDescription} onChange={e => setDraftDescription(e.target.value)} className="w-full bg-surface-card border border-border-subtle rounded-lg px-4 py-3 font-body-main text-body-main text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-md">
                        <div className="space-y-xs">
                          <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{t('ai.category')}</label>
                          <select value={draftCategory} onChange={e => setDraftCategory(e.target.value)} className="w-full bg-surface-card border border-border-subtle rounded-lg px-4 py-3 font-body-main text-body-main text-on-surface">
                            <option value="furniture">{t('cat.furniture')}</option>
                            <option value="electronics">{t('cat.electronics')}</option>
                            <option value="clothing">{t('cat.clothing')}</option>
                            <option value="decor">{t('cat.decor')}</option>
                            <option value="other">{t('cat.other')}</option>
                          </select>
                        </div>
                        <div className="space-y-xs">
                          <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{t('ai.condition')}</label>
                          <select value={draftCondition} onChange={e => setDraftCondition(e.target.value)} className="w-full bg-surface-card border border-border-subtle rounded-lg px-4 py-3 font-body-main text-body-main text-on-surface">
                            <option value="new">{t('action.new')}</option>
                            <option value="like-new">{t('action.likeNew')}</option>
                            <option value="good">{t('action.good')}</option>
                            <option value="fair">{t('action.fair')}</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-md pt-md border-t border-border-subtle">
                        <h4 className="font-title-card text-title-card text-on-surface flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">info</span>
                          {t('action.detailedInfo')}
                        </h4>
                        
                        {draftCategory === 'clothing' && (
                          <div className="grid grid-cols-2 gap-md">
                            <div className="space-y-xs">
                              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{t('action.size')}</label>
                              <select 
                                value={attributes.size || ''} 
                                onChange={e => setAttributes({...attributes, size: e.target.value})}
                                className="w-full bg-surface-card border border-border-subtle rounded-lg px-4 py-2 font-body-main"
                              >
                                <option value="">{t('action.selectSize')}</option>
                                <option value="XS">XS</option>
                                <option value="S">S</option>
                                <option value="M">M</option>
                                <option value="L">L</option>
                                <option value="XL">XL</option>
                              </select>
                            </div>
                            <div className="space-y-xs">
                              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{t('action.material')}</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Cotton"
                                value={attributes.material || ''} 
                                onChange={e => setAttributes({...attributes, material: e.target.value})}
                                className="w-full bg-surface-card border border-border-subtle rounded-lg px-4 py-2 font-body-main"
                              />
                            </div>
                          </div>
                        )}

                        {draftCategory === 'electronics' && (
                          <div className="grid grid-cols-2 gap-md">
                            <div className="space-y-xs">
                              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{t('action.brand')}</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Apple"
                                value={attributes.brand || ''} 
                                onChange={e => setAttributes({...attributes, brand: e.target.value})}
                                className="w-full bg-surface-card border border-border-subtle rounded-lg px-4 py-2 font-body-main"
                              />
                            </div>
                            <div className="space-y-xs">
                              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{t('action.warranty')}</label>
                              <select 
                                value={attributes.warranty || ''} 
                                onChange={e => setAttributes({...attributes, warranty: e.target.value})}
                                className="w-full bg-surface-card border border-border-subtle rounded-lg px-4 py-2 font-body-main"
                              >
                                <option value="">{t('action.no')}</option>
                                <option value="Yes">{t('action.yes')}</option>
                                <option value="Expired">{t('action.expired')}</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {(draftCategory === 'furniture' || draftCategory === 'decor') && (
                          <div className="grid grid-cols-2 gap-md">
                            <div className="space-y-xs">
                              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{t('action.dimensions')}</label>
                              <input 
                                type="text" 
                                placeholder="e.g. 100x50x75"
                                value={attributes.dimensions || ''} 
                                onChange={e => setAttributes({...attributes, dimensions: e.target.value})}
                                className="w-full bg-surface-card border border-border-subtle rounded-lg px-4 py-2 font-body-main"
                              />
                            </div>
                            <div className="space-y-xs">
                              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{t('action.color')}</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Oak"
                                value={attributes.color || ''} 
                                onChange={e => setAttributes({...attributes, color: e.target.value})}
                                className="w-full bg-surface-card border border-border-subtle rounded-lg px-4 py-2 font-body-main"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </main>
                <footer className="shrink-0 bg-surface-container-lowest border-t border-border-subtle p-margin-mobile pb-8">
                  <div className="flex gap-sm">
                    <button onClick={handleSaveDraft} disabled={publishing} className="flex-1 bg-surface-card border border-outline text-text-main font-title-card text-title-card py-3 rounded-lg">{publishing ? '...' : t('ai.saveDraft')}</button>
                    <button onClick={() => setStep(4)} className="flex-[2] bg-primary text-on-primary font-title-card text-title-card py-3 rounded-lg">{t('action.next')}</button>
                  </div>
                </footer>
              </>
            )}

            {/* Step 4: Pick a Price */}
            {step === 4 && aiData && (
              <>
                <main className="flex-1 px-margin-mobile py-lg pb-12 overflow-y-auto flex flex-col gap-lg animate-in slide-in-from-right duration-300 custom-scrollbar">
                   <h2 className="font-display-lg-mobile text-display-lg-mobile text-on-surface">{t('ai.pickPrice')}</h2>
                   <div className="rounded-2xl border border-border-subtle bg-surface-card p-md space-y-sm">
                     <div className="flex items-center justify-between gap-md">
                       <span className="font-title-card text-title-card text-on-surface">Publish summary</span>
                       <span className="font-body-sm text-body-sm text-text-secondary">{Math.round((aiData.confidence || 0) * 100)}% confidence</span>
                     </div>
                     <p className="font-body-sm text-body-sm text-text-secondary line-clamp-2">{draftTitle}</p>
                     <p className="font-body-sm text-body-sm text-text-secondary">Reason: {aiData.rationale}</p>
                     {aiData.price_rationale && (
                       <p className="font-body-sm text-body-sm text-text-secondary">{aiData.price_rationale}</p>
                     )}
                     {aiData.price_floor && aiData.price_ceiling && (
                       <p className="font-label-caps text-label-caps text-primary/80 uppercase tracking-wider">
                         {t('ai.priceBand')}: ₺{aiData.price_floor} - ₺{aiData.price_ceiling}
                       </p>
                     )}
                     {aiData.quality_note && (
                       <p className="font-body-sm text-body-sm text-amber-700">Photo quality: {aiData.quality_note}</p>
                     )}
                   </div>
                   <div className="grid grid-cols-1 gap-md">
                    {PRICE_STRATEGIES.map((strategy) => {
                      const selected = selectedPrice === strategy.key;
                      const price = getStrategyPrice(aiData, strategy.key);
                      const recommended = aiData.price_strategy === strategy.key;
                      return (
                        <button
                          key={strategy.key}
                          onClick={() => setSelectedPrice(strategy.key)}
                          className={`relative p-md rounded-xl border-2 text-left transition-all ${selected ? 'border-primary bg-primary/5' : 'border-border-subtle bg-surface-card'}`}
                        >
                          <div className="flex items-center justify-between gap-md">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-title-card">{t(`ai.${strategy.key}`)}</p>
                                {recommended && (
                                  <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider">{t('ai.strategyRecommended')}</span>
                                )}
                              </div>
                              <p className="font-body-sm text-body-sm text-text-secondary mt-1">{t(`ai.${strategy.key}Desc`)}</p>
                            </div>
                            <p className="text-2xl font-bold">₺{price}</p>
                          </div>
                        </button>
                      );
                    })}
                   </div>
                   <div className={`p-md rounded-xl border-2 text-left ${selectedPrice === 'custom' ? 'border-primary bg-primary/5' : 'border-border-subtle bg-surface-card'}`}>
                     <div className="flex items-start justify-between gap-md mb-sm">
                       <div>
                         <p className="font-title-card">{t('ai.customPrice')}</p>
                         <p className="font-body-sm text-body-sm text-text-secondary mt-1">{t('ai.customPriceHint')}</p>
                       </div>
                       <button onClick={() => setSelectedPrice('custom')} className="font-label-caps text-label-caps text-primary">Use</button>
                     </div>
                     <input
                       type="number"
                       min="1"
                       value={customPrice}
                       onChange={e => {
                         setCustomPrice(e.target.value);
                         setSelectedPrice('custom');
                       }}
                       placeholder="Enter custom price"
                       className="w-full bg-surface-card border border-border-subtle rounded-lg px-4 py-3 font-body-main text-body-main text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                     />
                     {customPrice && aiData.price_floor && aiData.price_ceiling && (Number(customPrice) < aiData.price_floor || Number(customPrice) > aiData.price_ceiling) && (
                       <p className="font-body-sm text-body-sm text-amber-700 mt-3">{t('ai.outsideRange')}</p>
                     )}
                   </div>
                </main>
                <footer className="shrink-0 bg-surface-container-lowest border-t border-border-subtle p-margin-mobile pb-8">
                  <button onClick={handlePublish} disabled={publishing} className="w-full bg-primary text-on-primary font-title-card py-4 rounded-full disabled:opacity-50">
                    {publishing ? '...' : t('ai.publishListing')}
                  </button>
                </footer>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AISellModal;
