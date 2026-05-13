import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const infoContent = {
  privacy: {
    en: {
      title: 'Privacy Policy',
      content: 'At EcoValue Marketplace, your privacy is our priority. We collect minimal data necessary to facilitate transactions and provide AI assistance. We never sell your personal information to third parties. Your data is encrypted in transit and at rest.'
    },
    tr: {
      title: 'Gizlilik Politikası',
      content: 'EcoValue Pazaryeri olarak gizliliğiniz önceliğimizdir. Sadece işlemleri kolaylaştırmak ve yapay zeka asistanlığı sağlamak için gerekli olan minimum veriyi toplarız. Kişisel bilgilerinizi asla üçüncü şahıslara satmayız. Verileriniz aktarım ve bekleme sırasında şifrelenir.'
    }
  },
  terms: {
    en: {
      title: 'Terms of Service',
      content: 'By using EcoValue Marketplace, you agree to our terms. Users must be 18 years or older. All items listed must be legal to sell in your jurisdiction. We reserve the right to remove listings that violate our community guidelines.'
    },
    tr: {
      title: 'Kullanım Koşulları',
      content: 'EcoValue Pazaryeri\'ni kullanarak şartlarımızı kabul etmiş olursunuz. Kullanıcılar 18 yaşında veya daha büyük olmalıdır. Listelenen tüm eşyaların satışı bulunduğunuz bölgede yasal olmalıdır. Topluluk kurallarımızı ihlal eden ilanları kaldırma hakkımız saklıdır.'
    }
  },
  safety: {
    en: {
      title: 'Safety Tips',
      content: 'Always meet in well-lit, public places for transactions. Do not share personal financial information outside the platform. Inspect items thoroughly before purchasing. Trust your instincts—if a deal seems too good to be true, it probably is.'
    },
    tr: {
      title: 'Güvenlik İpuçları',
      content: 'İşlemler için her zaman iyi aydınlatılmış, halka açık yerlerde buluşun. Kişisel finansal bilgilerinizi platform dışında paylaşmayın. Satın almadan önce eşyaları dikkatlice inceleyin. İçgüdülerinize güvenin—bir anlaşma gerçek olamayacak kadar iyi görünüyorsa, muhtemelen öyledir.'
    }
  },
  support: {
    en: {
      title: 'Support',
      content: 'Need help? Our support team is here for you. Contact us at support@ecovalue.com or use the in-app chat widget to reach an agent. Our standard response time is under 24 hours.'
    },
    tr: {
      title: 'Destek',
      content: 'Yardıma mı ihtiyacınız var? Destek ekibimiz sizin için burada. Bize support@ecovalue.com adresinden ulaşın veya bir temsilciyle görüşmek için uygulama içi sohbet aracını kullanın. Standart yanıt süremiz 24 saatin altındadır.'
    }
  },
  report: {
    en: {
      title: 'Sustainability Report',
      content: 'EcoValue is committed to a circular economy. In 2025, our community facilitated the reuse of over 100,000 items, preventing an estimated 500 tons of waste from entering landfills. Read our full annual report to learn more about our environmental impact.'
    },
    tr: {
      title: 'Sürdürülebilirlik Raporu',
      content: 'EcoValue döngüsel bir ekonomiye bağlıdır. 2025 yılında topluluğumuz, 100.000\'den fazla eşyanın yeniden kullanımını kolaylaştırarak tahmini 500 ton atığın çöp sahalarına gitmesini engelledi. Çevresel etkimiz hakkında daha fazla bilgi edinmek için tam yıllık raporumuzu okuyun.'
    }
  }
};

const InfoPage = () => {
  const { topic } = useParams();
  const { lang, t } = useLanguage();
  
  const pageData = infoContent[topic] || infoContent['privacy'];
  const data = pageData[lang];

  return (
    <div className="w-full px-margin-mobile md:px-margin-desktop py-xl md:py-24 max-w-4xl mx-auto min-h-[calc(100vh-80px)]">
      <div className="bg-surface-card rounded-2xl p-lg md:p-xl shadow-sm border border-border-subtle animate-in fade-in duration-500">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary-fixed-dim font-label-caps text-label-caps uppercase tracking-wider mb-lg transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Home
        </Link>
        <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-background mb-md">{data.title}</h1>
        <div className="font-body-main text-body-main text-on-surface-variant leading-relaxed space-y-md">
          {data.content.split('. ').map((sentence, i) => (
            <p key={i}>{sentence}.</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
