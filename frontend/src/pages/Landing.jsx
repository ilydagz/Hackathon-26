import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Landing = () => {
  const { t, lang, toggleLanguage } = useLanguage();
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.6 }
    );

    const sections = document.querySelectorAll('section');
    sections.forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-app-bg text-on-background font-body-main antialiased selection:bg-primary-container selection:text-on-primary-container h-screen overflow-hidden flex flex-col">
      {/* TopNavBar Component */}
      <header className="bg-app-bg/90 backdrop-blur-md border-b border-outline-variant z-50 shrink-0">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-7xl mx-auto">
          <Link className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-xs" to="/">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>eco</span>
            EcoValue
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-lg font-body-main text-body-main">
            <button onClick={() => scrollTo('howItWorks')} className={`transition-colors duration-200 ${activeSection === 'howItWorks' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`}>{t('nav.howItWorks')}</button>
            <button onClick={() => scrollTo('marketplace')} className={`transition-colors duration-200 ${activeSection === 'marketplace' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`}>{t('nav.browse')}</button>
            <button onClick={() => scrollTo('trust')} className={`transition-colors duration-200 ${activeSection === 'trust' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`}>{t('nav.trust')}</button>
            <button onClick={() => scrollTo('cta')} className={`transition-colors duration-200 ${activeSection === 'cta' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`}>{t('nav.sell')}</button>
          </nav>
          <div className="flex items-center gap-md">
            <button onClick={toggleLanguage} className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors px-3 py-1 border border-border-subtle rounded flex items-center">
              {lang === 'en' ? 'TR' : 'EN'}
            </button>
            <Link className="font-body-main text-body-main text-primary hover:text-primary-fixed-dim transition-colors duration-200 hidden md:inline-block" to="/login">{t('nav.signIn')}</Link>
            <Link className="bg-primary text-on-primary px-lg py-sm rounded-full font-label-caps text-label-caps hover:bg-on-primary-fixed-variant transition-colors shadow-sm" to="/register">
              {t('nav.startSelling')}
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col overflow-y-auto snap-y snap-mandatory scroll-smooth" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Hero Section */}
        <section id="hero" className="w-full snap-start snap-always min-h-full flex flex-col justify-center px-margin-mobile md:px-margin-desktop py-xl max-w-7xl mx-auto relative overflow-hidden shrink-0">
          <div className="flex flex-col md:flex-row items-center gap-xl md:gap-24">
            <div className="w-full md:w-1/2 flex flex-col items-start gap-lg z-10">
              <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-background max-w-lg">
                {t('hero.title')}
              </h1>
              <p className="font-body-main text-body-main text-on-surface-variant max-w-md">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-md mt-sm w-full sm:w-auto">
                <Link className="bg-primary text-on-primary px-lg py-[14px] rounded-lg font-title-card text-title-card text-center hover:bg-on-primary-fixed-variant transition-colors shadow-sm flex items-center justify-center gap-xs" to="/register">
                  {t('hero.btnStart')}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <button onClick={() => scrollTo('marketplace')} className="border border-outline text-secondary px-lg py-[14px] rounded-lg font-title-card text-title-card text-center hover:bg-surface-muted transition-colors flex items-center justify-center gap-xs">
                  {t('hero.btnBrowse')}
                </button>
              </div>
              <div className="flex items-center gap-sm mt-lg">
                <div className="flex -space-x-sm">
                  <img alt="User" className="w-10 h-10 rounded-full border-2 border-app-bg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFd9sqxYg5eE04cvCZ9JbeNhAUDYvtinKNQNxDgTrcKG9Z6dRDpUq_Qd_m2x8jQt0loYFX-2rgWvur3-oU3fGaLD4ArCNYkStwsY2GWtbilCnqhXpZNZJVOmpIK06zh5TL8SHuHwLl0eQo5x8TDUm2rWubmGucP8g8xe7ii_P3viNJzhNmV8yVjqOX1QFEhhVMjxixpBOoi7JFKZq8pRhmgg2wo25HI1pbfy66TWDHZY70K4cuc4dHm-YE_TtDouzCT5KIdFHjAN4" />
                  <img alt="User" className="w-10 h-10 rounded-full border-2 border-app-bg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDerQUrvawmVefXDetaYdqE7HkLMff6G7GuvOPTq9XK8x9l2kPstZbTqeJxU87VWCW8dbnehTtxds_0pgTMiaofxhr35j7QR8R9tQcnW1bWg8BAzb_kLlOeNh2K6xy_s5PZGNkERAWgNqLCagtvzxd3YWvdGouGl1q7_k6sbSgXleXswj5LvRw42uyxomB47ckUTlsYHJDxM-ANVKvoYGrQ_bZpzN_CrEPEOrik6QjNFWmrsRQb-WPUCEtGukxCCuwUcX9-JRQQ43Y" />
                  <img alt="User" className="w-10 h-10 rounded-full border-2 border-app-bg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcAF09nZS9YVYdKYJisJBeW7TLDoBFjzeiYd4b07JSHEnFhJuKpQk42CsYWlgjZA5h4UVJHYjMrPJVeSMVnuFAxKSfpAoaW4LTTkjPsE4TSsm32USbneguuMdAqajr1pxJE3XSKegCNV72JpUZhhdwNt-GnvEF0-ChWOe5p3sVuCkqF1KTVtoJ1C5zTeGhrtH3P38r56uckkrIywH0lHi8pIPHjPXx2Fb7Q87HNZusETxG2HmnyaJyJdzlbxTTPhZKpPe8bEuMLUc" />
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant flex flex-col">
                  <span className="font-bold text-on-background">{t('hero.social')}</span>
                  <span>{t('hero.socialSub')}</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative flex justify-center lg:justify-end z-10 mt-lg md:mt-0">
              <div className="relative w-full max-w-[340px] h-[600px] bg-white rounded-[40px] border-[12px] border-surface-container-high shadow-2xl overflow-hidden flex flex-col">
                <div className="h-6 w-full bg-white flex justify-between items-center px-4 pt-2 shrink-0">
                  <span className="text-[10px] font-bold">9:41</span>
                  <div className="flex gap-1">
                    <span className="material-symbols-outlined text-[14px]">signal_cellular_4_bar</span>
                    <span className="material-symbols-outlined text-[14px]">wifi</span>
                    <span className="material-symbols-outlined text-[14px]">battery_full</span>
                  </div>
                </div>
                <div className="flex-1 bg-surface-muted p-sm overflow-y-auto pb-lg">
                  <div className="bg-white rounded-xl p-md shadow-sm mb-md flex items-center gap-md">
                    <img alt="Item preview" className="w-20 h-20 rounded-lg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIZV_mQsp1t-Mrzw0to_rJYef8Mr1_HtTT947ixr007aaEEwK3JjOFh7BcAD-pota93FjcED8hQ6lZnoLG6HapwQ47H5o4Zq-soliQrONZ-eWJhG12ny8F2buPZ9AWyoa4l7c-yY9WdiAhSy-50oYO_GRIzYSJrEFUc8iDyRmzqWYPfDbotCTCxcyo3a05Ppivf3wIE3Zcn9f7fosjIv-0Kc6tpw1aG7Fir9Rc8KSaG6oJmUzxXm7KRvGdtxJmuq7PKHT-mKW8ah0" />
                    <div>
                      <h3 className="font-title-card text-title-card text-on-background leading-tight">Vintage Typewriter</h3>
                      <p className="font-body-sm text-body-sm text-text-secondary mt-1">{t('phone.analyzing')}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-md shadow-sm mb-md flex flex-col gap-sm">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-status-success text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                      <span className="font-body-sm text-body-sm text-on-background">{t('phone.identifying')}</span>
                    </div>
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-status-success text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                      <span className="font-body-sm text-body-sm text-on-background">{t('phone.extracting')}</span>
                    </div>
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-primary animate-spin text-[20px]">sync</span>
                      <span className="font-body-sm text-body-sm text-on-background font-bold">{t('phone.checking')}</span>
                    </div>
                    <div className="flex items-center gap-sm opacity-50">
                      <span className="material-symbols-outlined text-outline text-[20px]">pending</span>
                      <span className="font-body-sm text-body-sm text-on-background">{t('phone.drafting')}</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-md shadow-sm border border-border-subtle">
                    <div className="flex items-start justify-between mb-sm">
                      <div>
                        <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider">{t('phone.price')}</span>
                        <div className="font-display-lg-mobile text-display-lg-mobile text-on-background mt-1">$145</div>
                      </div>
                      <span className="bg-surface-container px-2 py-1 rounded text-xs font-bold text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                        {t('phone.demand')}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">{t('phone.basedOn')}</p>
                    <div className="flex gap-2">
                      <Link to="/register" className="flex-1 bg-primary text-on-primary py-2 rounded-lg font-title-card text-title-card text-sm text-center hover:bg-on-primary-fixed-variant transition-colors">{t('phone.accept')}</Link>
                      <button className="flex-1 border border-outline text-secondary py-2 rounded-lg font-title-card text-title-card text-sm hover:bg-surface-muted transition-colors">{t('phone.edit')}</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-surface-container rounded-full blur-3xl -z-10 opacity-70"></div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="howItWorks" className="w-full snap-start snap-always min-h-full flex flex-col justify-center bg-white border-y border-outline-variant py-xl shrink-0">
          <div className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto w-full">
            <div className="text-center mb-xl">
              <h2 className="font-headline-md text-headline-md text-on-background">{t('hiw.title')}</h2>
              <p className="font-body-main text-body-main text-on-surface-variant mt-sm">{t('hiw.subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-xl">
              <div className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mb-md group-hover:bg-primary-container transition-colors duration-300">
                  <span className="material-symbols-outlined text-secondary text-3xl group-hover:text-on-primary-container transition-colors duration-300">add_a_photo</span>
                </div>
                <h3 className="font-title-card text-title-card text-on-background mb-sm">{t('hiw.step1')}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{t('hiw.step1desc')}</p>
              </div>
              <div className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mb-md group-hover:bg-primary-container transition-colors duration-300">
                  <span className="material-symbols-outlined text-secondary text-3xl group-hover:text-on-primary-container transition-colors duration-300">auto_awesome</span>
                </div>
                <h3 className="font-title-card text-title-card text-on-background mb-sm">{t('hiw.step2')}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{t('hiw.step2desc')}</p>
              </div>
              <div className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mb-md group-hover:bg-primary-container transition-colors duration-300">
                  <span className="material-symbols-outlined text-secondary text-3xl group-hover:text-on-primary-container transition-colors duration-300">sell</span>
                </div>
                <h3 className="font-title-card text-title-card text-on-background mb-sm">{t('hiw.step3')}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{t('hiw.step3desc')}</p>
              </div>
              <div className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mb-md group-hover:bg-primary-container transition-colors duration-300">
                  <span className="material-symbols-outlined text-secondary text-3xl group-hover:text-on-primary-container transition-colors duration-300">publish</span>
                </div>
                <h3 className="font-title-card text-title-card text-on-background mb-sm">{t('hiw.step4')}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{t('hiw.step4desc')}</p>
              </div>
            </div>
            <div className="flex justify-center mt-12">
              <button onClick={() => scrollTo('marketplace')} className="text-primary hover:text-primary-fixed-dim transition-colors flex items-center gap-1 font-bold">
                See marketplace <span className="material-symbols-outlined">expand_more</span>
              </button>
            </div>
          </div>
        </section>

        {/* Marketplace Preview Grid */}
        <section id="marketplace" className="w-full snap-start snap-always min-h-full flex flex-col justify-center px-margin-mobile md:px-margin-desktop py-xl max-w-7xl mx-auto shrink-0">
          <div className="flex justify-between items-end mb-lg">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-background">{t('preview.title')}</h2>
              <p className="font-body-main text-body-main text-on-surface-variant mt-1">{t('preview.subtitle')}</p>
            </div>
            <Link className="hidden md:flex items-center gap-xs font-title-card text-title-card text-primary hover:text-on-primary-fixed-variant transition-colors" to="/feed">
              {t('preview.viewAll')}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md md:gap-lg">
            <div className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden hover:shadow-lg transition-shadow duration-300 group flex flex-col">
              <div className="relative aspect-square w-full bg-surface-muted overflow-hidden">
                <img alt="Headphones" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBK9I_pnd5yehuc4RU_FZySByCAZjQBrrv-EKHM2bDtzNof2k9K1qUGsiKvVjQj-yncfXcb29pcIE5TsjAFv5HRRL5Or-eDCs6pKMPrX0bWk0t4Gim9bb84f_W78BEUSyv0csL2LQGTqxj6vM0EdFmpHfZEU1UEiO_FkzlUEEz-vGyymlVccYfPcxNfqr1vepr3BjKKYL72wngMIePekG1UHOIBOxaYHKMBdyVqSbw70NH0vufXRPfJztSKHf0ojma_1ymPuvGp8SY" />
              </div>
              <div className="p-sm md:p-md flex flex-col flex-grow">
                <div className="font-headline-md text-headline-md text-on-background mb-xs">$120</div>
                <h3 className="font-body-main text-body-main text-on-surface-variant truncate mb-xs">Sony WH-1000XM4</h3>
                <div className="flex items-center gap-xs mt-auto pt-sm border-t border-border-subtle">
                  <span className="material-symbols-outlined text-status-success text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                  <span className="font-body-sm text-body-sm text-text-secondary truncate">{t('preview.verified')} • 2mi</span>
                </div>
              </div>
            </div>
            <div className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden hover:shadow-lg transition-shadow duration-300 group flex flex-col">
              <div className="relative aspect-square w-full bg-surface-muted overflow-hidden">
                <img alt="Headphones" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw1ZMSefBF9HSu7ZAtkZmBeK6NdLMGifkc8hN3JCqrQ66_UHbzGDoUD0kA8zy7p-3IS2T8m4tDwFrD89LVjgAd_Nh55kSfwxKTOpl-G9xiBQ8jN6V7n8odzH4R3zdbKcNJFBCCje15evTf8mLr5jfdV7jisYKUKO1cvypYDV0g0x7w4bPvr1DKel5b0xe7i4nbWPOhRYL80G6_Mo8jPpb5jbFpIZ29g1Ix_GzxHUnrOrkU-y4ZIsrkFXGu8kR9pXgV5Yp4ohUm6Qs" />
              </div>
              <div className="p-sm md:p-md flex flex-col flex-grow">
                <div className="font-headline-md text-headline-md text-on-background mb-xs">$85</div>
                <h3 className="font-body-main text-body-main text-on-surface-variant truncate mb-xs">Premium Wireless Audio</h3>
                <div className="flex items-center gap-xs mt-auto pt-sm border-t border-border-subtle">
                  <span className="material-symbols-outlined text-outline text-[16px]">location_on</span>
                  <span className="font-body-sm text-body-sm text-text-secondary truncate">Downtown • 4mi</span>
                </div>
              </div>
            </div>
            <div className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden hover:shadow-lg transition-shadow duration-300 group flex flex-col hidden md:flex">
              <div className="relative aspect-square w-full bg-surface-muted overflow-hidden">
                <img alt="Watch" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcs-_UBSZbYVwVmvYzoW5TyHBykVmovUkFTLFE-nG-c_wnBbU4RYCEwXMrDcbBfzWb2UDCl5I1MgkVLlAHvbUmHGiB26PeHmbC0du31mydOXCIi-psPXq7ehad_SiP18Y7gIauIrX91hDBDtb28ZfJ1kZ-oFuXS_eEtti7Pbn8Gc545L54LYFF8yKnGcCbuo6OoTSH6Xg0LLOhSWQYbwHpS8QXCOZ3ZTGv_16HK9_psRqFa5jati616ItNcspG44m7akQn5JXDwt0" />
              </div>
              <div className="p-sm md:p-md flex flex-col flex-grow">
                <div className="font-headline-md text-headline-md text-on-background mb-xs">$150</div>
                <h3 className="font-body-main text-body-main text-on-surface-variant truncate mb-xs">Smartwatch Gen 5</h3>
                <div className="flex items-center gap-xs mt-auto pt-sm border-t border-border-subtle">
                  <span className="material-symbols-outlined text-status-success text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                  <span className="font-body-sm text-body-sm text-text-secondary truncate">{t('preview.topSeller')} • 1mi</span>
                </div>
              </div>
            </div>
            <div className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden hover:shadow-lg transition-shadow duration-300 group flex flex-col hidden md:flex">
              <div className="relative aspect-square w-full bg-surface-muted overflow-hidden">
                <img alt="Coffee Maker" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCT9zqLo-C1ZhTRh6mW506C8AV2gqWf0LypFG1Npuow5k8scTtzsGWvzrMYEZ50q6ZVF70iSOUg3xuzvPuBPUn7z3g5KQwMExTsWrvcuRDOvxZOqBzK_8ik-rG_iEPR-T1yVDsGrO0rn9ZJ3CNJ-42FXKKWCZClo8mWZCij3fl_8zxFx1zrQ1ryIa_v_yMEMdgrcqr-we9Pg4dTCsUv9ccAg-p-9kkLdLb7gQHpTZgeGrRBCnLR8Jjbt2zTNJo5HUQKHlwN_QYuZKs" />
              </div>
              <div className="p-sm md:p-md flex flex-col flex-grow">
                <div className="font-headline-md text-headline-md text-on-background mb-xs">$220</div>
                <h3 className="font-body-main text-body-main text-on-surface-variant truncate mb-xs">Espresso Machine Pro</h3>
                <div className="flex items-center gap-xs mt-auto pt-sm border-t border-border-subtle">
                  <span className="material-symbols-outlined text-outline text-[16px]">location_on</span>
                  <span className="font-body-sm text-body-sm text-text-secondary truncate">Westside • 5mi</span>
                </div>
              </div>
            </div>
          </div>
          <Link className="md:hidden mt-lg w-full border border-outline text-secondary px-lg py-[14px] rounded-lg font-title-card text-title-card text-center hover:bg-surface-muted transition-colors flex items-center justify-center gap-xs" to="/feed">
            {t('preview.btnViewAll')}
          </Link>
          <div className="flex justify-center mt-8">
            <button onClick={() => scrollTo('trust')} className="text-primary hover:text-primary-fixed-dim transition-colors flex items-center gap-1 font-bold">
              Why use AI? <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>
        </section>

        {/* Trust Section */}
        <section id="trust" className="w-full snap-start snap-always min-h-full flex flex-col justify-center bg-surface-container py-xl shrink-0">
          <div className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-xl">
            <div className="w-full lg:w-1/2 flex flex-col items-start gap-md">
              <div className="bg-surface-card px-3 py-1 rounded-full border border-border-subtle flex items-center gap-2 mb-sm">
                <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider">{t('trust.badge')}</span>
              </div>
              <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-background leading-tight whitespace-pre-line">
                {t('trust.title')}
              </h2>
              <p className="font-body-main text-body-main text-on-surface-variant max-w-md">
                {t('trust.desc')}
              </p>
              <ul className="flex flex-col gap-sm mt-md font-body-main text-body-main text-on-background">
                <li className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-status-success">check</span>
                  {t('trust.point1')}
                </li>
                <li className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-status-success">check</span>
                  {t('trust.point2')}
                </li>
                <li className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-status-success">check</span>
                  {t('trust.point3')}
                </li>
              </ul>
            </div>
            <div className="w-full lg:w-1/2 flex justify-center">
              <div className="bg-surface-card rounded-2xl p-lg shadow-lg border border-border-subtle w-full max-w-md">
                <div className="flex justify-between items-center mb-md border-b border-border-subtle pb-sm">
                  <h3 className="font-title-card text-title-card text-on-background">{t('trust.review')}</h3>
                  <button className="text-primary hover:text-on-primary-fixed-variant font-label-caps text-label-caps">EDIT</button>
                </div>
                <div className="space-y-md">
                  <div>
                    <label className="font-label-caps text-label-caps text-text-secondary block mb-1">Title</label>
                    <div className="w-full bg-surface-muted border border-border-subtle rounded p-2 font-body-main text-body-main text-on-background">
                      Vintage Wooden Desk Chair
                    </div>
                  </div>
                  <div>
                    <label className="font-label-caps text-label-caps text-text-secondary block mb-1">Description</label>
                    <div className="w-full bg-surface-muted border border-border-subtle rounded p-2 font-body-sm text-body-sm text-on-background h-24 overflow-y-auto">
                      Mid-century style solid wood desk chair in excellent condition. Features curved back support and brass detailing on the legs. Perfect for a home office. Minor wear consistent with age.
                    </div>
                  </div>
                  <div className="flex gap-md">
                    <div className="flex-1">
                      <label className="font-label-caps text-label-caps text-text-secondary block mb-1">Condition</label>
                      <div className="w-full bg-surface-muted border border-border-subtle rounded p-2 font-body-main text-body-main text-on-background flex justify-between items-center">
                        Good
                        <span className="material-symbols-outlined text-[18px]">expand_more</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="font-label-caps text-label-caps text-text-secondary block mb-1">Price</label>
                      <div className="w-full bg-surface-muted border border-primary rounded p-2 font-body-main text-body-main text-on-background font-bold flex items-center gap-1">
                        $ 85
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-12 w-full lg:hidden">
            <button onClick={() => scrollTo('cta')} className="text-primary hover:text-primary-fixed-dim transition-colors flex items-center gap-1 font-bold">
              Start <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>
        </section>

        {/* Final CTA */}
        <section id="cta" className="w-full snap-start snap-always min-h-full flex flex-col justify-center shrink-0">
          <div className="px-margin-mobile md:px-margin-desktop py-xl max-w-4xl mx-auto text-center flex flex-col items-center">
            <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-background mb-md">{t('cta.title')}</h2>
            <p className="font-body-main text-body-main text-on-surface-variant max-w-lg mb-lg">
              {t('cta.desc')}
            </p>
            <Link className="bg-primary text-on-primary px-xl py-4 rounded-lg font-title-card text-title-card hover:bg-on-primary-fixed-variant transition-colors shadow-md flex items-center justify-center gap-xs text-lg" to="/register">
              {t('cta.btn')}
              <span className="material-symbols-outlined">rocket_launch</span>
            </Link>
          </div>
          
          {/* Footer inside the last snap block so it naturally scrolls into view */}
          <footer className="mt-auto bg-surface-container dark:bg-inverse-surface border-t border-outline-variant dark:border-outline w-full">
            <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-xl gap-lg max-w-7xl mx-auto">
              <div className="flex flex-col items-center md:items-start gap-sm">
                <Link className="font-headline-md text-headline-md font-bold text-on-secondary-container dark:text-secondary-fixed flex items-center gap-xs focus:outline-none focus:ring-2 focus:ring-primary rounded" to="/">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>eco</span>
                  EcoValue
                </Link>
                <span className="font-body-sm text-body-sm text-secondary dark:text-secondary-fixed-dim">
                  {t('footer.copy')}
                </span>
              </div>
              <nav className="flex flex-wrap justify-center gap-md font-label-caps text-label-caps text-on-secondary-fixed-variant dark:text-secondary-fixed-dim">
                <Link className="hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded p-1" to="/info/privacy">{t('footer.privacy')}</Link>
                <Link className="hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded p-1" to="/info/terms">{t('footer.terms')}</Link>
                <Link className="hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded p-1" to="/info/safety">{t('footer.safety')}</Link>
                <Link className="hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded p-1" to="/info/support">{t('footer.support')}</Link>
              </nav>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
};

export default Landing;
