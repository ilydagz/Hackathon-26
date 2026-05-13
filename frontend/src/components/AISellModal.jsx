import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';

const AISellModal = ({ isOpen, onClose, onPublished }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1); // 1: Upload, 2: Analysis, 3: Draft, 4: Price
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState('quick');
  const [customPrice, setCustomPrice] = useState('');
  const [publishing, setPublishing] = useState(false);
  
  // Draft State
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftCategory, setDraftCategory] = useState('furniture');
  const [draftCondition, setDraftCondition] = useState('good');

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

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
    // Since AI is mocked, we simulate it
    setTimeout(() => {
      setAiData({
        title: 'Vintage Wooden Desk Chair',
        description: 'Mid-century style solid wood desk chair in excellent condition. Features a contoured seat and curved backrest for ergonomic support.',
        quick_price: 850,
        ideal_price: 1100
      });
      setDraftTitle('Vintage Wooden Desk Chair');
      setDraftDescription('Mid-century style solid wood desk chair in excellent condition.');
      setStep(3);
    }, 2000);
  };


  const handlePublish = async () => {
    setPublishing(true);
    let finalPrice = selectedPrice === 'quick' ? aiData?.quick_price : (selectedPrice === 'market' ? aiData?.ideal_price : customPrice);
    try {
      await api.createListing({
        title: draftTitle,
        description: draftDescription,
        category: draftCategory,
        condition: draftCondition,
        selected_price: Number(finalPrice),
        image_url: image ? image.name : 'demo.jpg',
      });
      onPublished?.();
      onClose();
      // reset
      setTimeout(() => setStep(1), 500);
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
          />

          {/* Modal Content - Mobile shape */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[390px] h-[85vh] md:h-[844px] md:max-h-[90vh] bg-app-bg flex flex-col overflow-hidden shadow-2xl rounded-3xl"
          >
            {/* Header */}
            <header className="bg-background flex justify-between items-center px-4 h-16 w-full border-b border-border-subtle shrink-0 sticky top-0 z-50">
              <button onClick={onClose} className="text-on-surface-variant hover:opacity-80 active:scale-95 transition-transform flex items-center justify-center p-2 rounded-full">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>close</span>
              </button>
              <h1 className="font-display-lg text-headline-md font-bold text-primary">{t('ai.sellItem')}</h1>
              <button onClick={() => setStep(0)} className="text-on-surface-variant font-title-card text-title-card px-2 hover:opacity-80 transition-opacity active:scale-95">{t('ai.drafts')}</button>
            </header>

            {/* Step 0: Drafts */}
            {step === 0 && (
              <main className="flex-1 overflow-y-auto px-margin-mobile pt-lg pb-[120px] flex flex-col animate-in fade-in duration-300">
                <div className="mb-lg flex justify-between items-center">
                  <h2 className="font-display-lg-mobile text-display-lg-mobile text-on-surface tracking-tight">{t('ai.drafts')}</h2>
                  <button onClick={() => setStep(1)} className="text-primary font-title-card text-title-card flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">add</span> New
                  </button>
                </div>
                
                <div className="flex flex-col gap-md">
                  {[1, 2].map((id) => (
                    <div 
                      key={id} 
                      className="bg-surface-card border border-border-subtle rounded-xl p-md flex items-center gap-md hover:shadow-sm cursor-pointer transition-shadow" 
                      onClick={() => {
                        setAiData({
                          title: id === 1 ? 'Vintage Typewriter' : 'Sony Headphones',
                          description: id === 1 ? 'A beautiful vintage typewriter in great condition.' : 'Noise cancelling headphones, used for 1 year.',
                          quick_price: id === 1 ? 450 : 800,
                          ideal_price: id === 1 ? 550 : 950
                        });
                        setDraftTitle(id === 1 ? 'Vintage Typewriter' : 'Sony Headphones');
                        setDraftDescription(id === 1 ? 'A beautiful vintage typewriter in great condition.' : 'Noise cancelling headphones, used for 1 year.');
                        setStep(3);
                      }}
                    >
                      <div className="w-16 h-16 bg-surface-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                        <img src={`https://picsum.photos/seed/${id}/100/100`} className="w-full h-full object-cover" alt="Draft preview" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-title-card text-title-card text-on-surface line-clamp-1">{id === 1 ? 'Vintage Typewriter' : 'Sony Headphones'}</h4>
                        <p className="font-body-sm text-body-sm text-text-secondary">Last edited 2 days ago</p>
                      </div>
                      <span className="material-symbols-outlined text-text-secondary">chevron_right</span>
                    </div>
                  ))}
                </div>
              </main>
            )}

            {/* Step 1: Upload */}
            {step === 1 && (
              <main className="flex-1 overflow-y-auto px-margin-mobile pt-lg pb-[120px] flex flex-col animate-in fade-in duration-300">
                <div className="mb-lg">
                  <h2 className="font-display-lg-mobile text-display-lg-mobile text-on-surface tracking-tight mb-2">{t('ai.addPhotos')}</h2>
                  <p className="font-body-main text-body-main text-on-surface-variant">{t('ai.addPhotosDesc')}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-sm mb-md">
                  <button onClick={() => cameraInputRef.current.click()} className="col-span-2 aspect-video bg-primary-fixed/20 border-2 border-primary border-dashed rounded-xl flex flex-col items-center justify-center text-primary hover:bg-primary-fixed/30 active:scale-[0.98] transition-all duration-200 shadow-sm">
                    <span className="material-symbols-outlined" style={{fontSize: '36px', fontVariationSettings: "'FILL' 1"}}>photo_camera</span>
                    <span className="font-title-card text-title-card mt-sm">{t('ai.takePhoto')}</span>
                  </button>
                  <div className="aspect-square bg-surface-muted border border-border-subtle border-dashed rounded-xl flex items-center justify-center text-outline-variant relative overflow-hidden">
                    <span className="material-symbols-outlined text-outline">add_photo_alternate</span>
                  </div>
                  <div className="aspect-square bg-surface-muted border border-border-subtle border-dashed rounded-xl flex items-center justify-center text-outline-variant relative overflow-hidden">
                    <span className="material-symbols-outlined text-outline">add_photo_alternate</span>
                  </div>
                </div>

                <button onClick={() => galleryInputRef.current.click()} className="w-full flex items-center justify-center gap-xs py-sm text-primary font-title-card text-title-card hover:bg-primary-fixed/10 active:bg-primary-fixed/20 rounded-lg transition-colors">
                  <span className="material-symbols-outlined">collections</span>
                  {t('ai.uploadGallery')}
                </button>
                <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleImageChange} />
              </main>
            )}

            {/* Step 2: Analysis */}
            {step === 2 && (
              <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto animate-in fade-in duration-300">
                <div className="text-center mb-10 mt-8">
                  <h2 className="font-display-lg-mobile text-display-lg-mobile mb-3 text-on-surface">{t('ai.creatingDraft')}</h2>
                  <p className="font-body-main text-body-main text-text-secondary">{t('ai.analyzingPhotos')}</p>
                </div>
                
                <div className="relative w-48 h-48 mx-auto mb-12 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-[12px] border-surface-container-high"
                  ></motion.div>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-[12px] border-primary border-t-transparent border-l-transparent transform rotate-45"
                  ></motion.div>
                  <div className="w-32 h-32 rounded-full bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary" style={{fontSize: '48px', fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                  </div>
                </div>

                <div className="space-y-6 max-w-xs mx-auto w-full">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-status-success flex items-center justify-center text-on-primary shrink-0">
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </div>
                    <span className="font-body-main text-body-main text-on-surface">{t('ai.identifyingItem')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[16px]">hourglass_bottom</span>
                    </div>
                    <span className="font-title-card text-title-card text-primary">{t('ai.researchingPrices')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review Draft */}
            {step === 3 && aiData && (
              <>
                <main className="flex-grow px-margin-mobile py-lg pb-32 overflow-y-auto animate-in slide-in-from-right duration-300">
                  <div className="max-w-md mx-auto space-y-lg">
                    <div className="text-center space-y-sm">
                      <h2 className="font-display-lg-mobile text-display-lg-mobile text-on-surface font-bold tracking-tight">{t('ai.reviewDraft')}</h2>
                      <p className="font-body-sm text-body-sm text-text-secondary">{t('ai.reviewDesc')}</p>
                    </div>

                    <div className="bg-surface-card border border-border-subtle rounded-xl p-md flex items-center space-x-md">
                      <div className="w-20 h-20 bg-surface-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                        {preview ? <img src={preview} className="w-full h-full object-cover" alt="Preview" /> : <div className="w-full h-full bg-surface-muted"></div>}
                        <button className="absolute top-1 right-1 bg-inverse-surface/50 rounded-full p-1 text-on-primary hover:bg-inverse-surface/80">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                      </div>
                      <div className="flex-grow">
                        <p className="font-title-card text-title-card text-on-surface line-clamp-2">{draftTitle}</p>
                      </div>
                    </div>

                    <div className="space-y-md">
                      <div className="space-y-xs">
                        <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{t('ai.title')}</label>
                        <input type="text" value={draftTitle} onChange={e => setDraftTitle(e.target.value)} className="w-full bg-surface-card border border-border-subtle rounded-lg px-4 py-3 font-body-main text-body-main text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                      </div>
                      
                      <div className="space-y-xs">
                        <div className="flex justify-between items-baseline">
                          <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{t('ai.description')}</label>
                          <span className="font-body-sm text-xs text-text-secondary">{t('ai.aiSuggested')}</span>
                        </div>
                        <textarea rows="4" value={draftDescription} onChange={e => setDraftDescription(e.target.value)} className="w-full bg-surface-card border border-border-subtle rounded-lg px-4 py-3 font-body-main text-body-main text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none" />
                      </div>

                      <div className="grid grid-cols-2 gap-md">
                        <div className="space-y-xs">
                          <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{t('ai.category')}</label>
                          <div className="relative">
                            <select value={draftCategory} onChange={e => setDraftCategory(e.target.value)} className="appearance-none w-full bg-surface-card border border-border-subtle rounded-lg pl-4 pr-10 py-3 font-body-main text-body-main text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                              <option value="furniture">Furniture</option>
                              <option value="decor">Decor</option>
                              <option value="electronics">Electronics</option>
                              <option value="clothing">Clothing</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant">
                              <span className="material-symbols-outlined">expand_more</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-xs">
                          <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{t('ai.condition')}</label>
                          <div className="relative">
                            <select value={draftCondition} onChange={e => setDraftCondition(e.target.value)} className="appearance-none w-full bg-surface-card border border-border-subtle rounded-lg pl-4 pr-10 py-3 font-body-main text-body-main text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                              <option value="new">New</option>
                              <option value="like-new">Like New</option>
                              <option value="good">Good</option>
                              <option value="fair">Fair</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant">
                              <span className="material-symbols-outlined">expand_more</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </main>
                <div className="absolute bottom-0 left-0 w-full bg-surface-container-lowest border-t border-border-subtle p-margin-mobile pb-8 z-40">
                  <div className="flex gap-sm">
                    <button onClick={onClose} className="flex-1 bg-surface-card border border-outline text-text-main font-title-card text-title-card py-3 rounded-lg hover:bg-surface-muted transition-colors active:scale-95">{t('ai.saveDraft')}</button>
                    <button onClick={() => setStep(4)} className="flex-[2] bg-primary text-on-primary font-title-card text-title-card py-3 rounded-lg hover:bg-surface-tint transition-colors active:scale-95 shadow-sm flex justify-center items-center gap-2">
                      {t('ai.nextToPricing')}
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Pick a Price */}
            {step === 4 && aiData && (
              <>
                <main className="flex-grow px-margin-mobile py-lg pb-32 overflow-y-auto flex flex-col gap-lg animate-in slide-in-from-right duration-300">
                  <div className="flex flex-col gap-sm">
                    <span className="font-label-caps text-label-caps text-text-secondary tracking-widest uppercase">{t('ai.step4')}</span>
                    <h2 className="font-display-lg-mobile text-display-lg-mobile text-on-surface">{t('ai.pickPrice')}</h2>
                  </div>

                  <div className="bg-surface-container-low border border-border-subtle rounded-lg p-md flex items-start gap-sm">
                    <span className="material-symbols-outlined text-tertiary" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                    <p className="font-body-sm text-body-sm text-on-surface">{t('ai.priceDesc')}</p>
                  </div>

                  <div className="flex flex-col gap-md">
                    {/* Quick Sale */}
                    <label onClick={() => setSelectedPrice('quick')} className={`relative flex flex-col gap-sm p-md rounded-xl cursor-pointer active:scale-[0.98] transition-transform ${selectedPrice === 'quick' ? 'border-2 border-primary bg-surface-card' : 'border border-border-subtle bg-surface-card'}`}>
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-xs">
                          <span className={`material-symbols-outlined ${selectedPrice === 'quick' ? 'text-primary' : 'text-text-secondary'}`} style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>
                          <span className={`font-title-card text-title-card ${selectedPrice === 'quick' ? 'text-primary' : 'text-on-surface'}`}>{t('ai.quickSale')}</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPrice === 'quick' ? 'border-primary' : 'border-border-subtle'}`}>
                          {selectedPrice === 'quick' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-base">
                        <span className="font-display-lg-mobile text-display-lg-mobile text-on-surface">{aiData.quick_price} TL</span>
                        <span className="font-body-sm text-body-sm text-text-secondary">{t('ai.quickSaleDesc')}</span>
                      </div>
                      <div className="absolute -top-3 -right-2 bg-primary text-on-primary font-label-caps text-label-caps px-3 py-1 rounded-full shadow-sm">{t('ai.recommended')}</div>
                    </label>

                    {/* Market Price */}
                    <label onClick={() => setSelectedPrice('market')} className={`relative flex flex-col gap-sm p-md rounded-xl cursor-pointer active:scale-[0.98] transition-transform ${selectedPrice === 'market' ? 'border-2 border-primary bg-surface-card' : 'border border-border-subtle bg-surface-card'}`}>
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-xs">
                          <span className="material-symbols-outlined text-text-secondary" style={{fontVariationSettings: "'FILL' 0"}}>storefront</span>
                          <span className="font-title-card text-title-card text-on-surface">{t('ai.marketPrice')}</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPrice === 'market' ? 'border-primary' : 'border-border-subtle'}`}>
                          {selectedPrice === 'market' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-base">
                        <span className="font-display-lg-mobile text-display-lg-mobile text-on-surface">{aiData.ideal_price} TL</span>
                        <span className="font-body-sm text-body-sm text-text-secondary">{t('ai.marketPriceDesc')}</span>
                      </div>
                    </label>

                    {/* Custom Price */}
                    <div onClick={() => setSelectedPrice('custom')} className={`relative flex flex-col gap-sm p-md rounded-xl cursor-pointer ${selectedPrice === 'custom' ? 'border-2 border-primary bg-surface-card' : 'border border-border-subtle bg-surface-card'}`}>
                      <div className="flex justify-between items-center w-full mb-sm">
                        <div className="flex items-center gap-xs">
                          <span className="material-symbols-outlined text-text-secondary" style={{fontVariationSettings: "'FILL' 0"}}>edit</span>
                          <span className="font-title-card text-title-card text-on-surface">{t('ai.customPrice')}</span>
                        </div>
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPrice === 'custom' ? 'border-primary' : 'border-border-subtle'}`}>
                          {selectedPrice === 'custom' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                        </div>
                      </div>
                      <div className="relative flex items-center">
                        <input value={customPrice} onChange={e => setCustomPrice(e.target.value)} type="number" placeholder="Enter amount" className="w-full bg-surface-muted border border-border-subtle rounded-lg py-3 px-4 font-body-main text-body-main text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors pr-12" />
                        <span className="absolute right-4 font-body-main text-body-main text-text-secondary">TL</span>
                      </div>
                    </div>
                  </div>
                </main>
                <div className="absolute bottom-0 left-0 w-full bg-surface-container-lowest border-t border-border-subtle p-margin-mobile pb-8 z-40">
                  <button onClick={handlePublish} disabled={publishing} className="w-full bg-primary hover:bg-surface-tint text-on-primary font-title-card text-title-card py-4 rounded-full flex items-center justify-center gap-sm active:scale-[0.98] transition-all shadow-md disabled:opacity-50">
                    <span>{publishing ? t('ai.publishing') : t('ai.publishListing')}</span>
                    {!publishing && <span className="material-symbols-outlined">arrow_forward</span>}
                  </button>
                </div>
              </>
            )}
            
            {step === 1 && (
              <footer className="absolute bottom-0 left-0 w-full bg-surface-container-lowest border-t border-border-subtle px-margin-mobile py-4 pb-8 z-40">
                <button className="w-full bg-surface-muted text-text-secondary py-4 rounded-full font-title-card text-title-card text-center opacity-60 cursor-not-allowed" disabled>{t('ai.next')}</button>
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AISellModal;
