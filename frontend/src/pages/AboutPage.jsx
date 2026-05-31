import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../components/layout/Footer';

const AboutPage = () => {
  const { t } = useTranslation();
  const [empresaImgError, setEmpresaImgError] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-brand-bg text-brand-text py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-16">

          {/* Hero Section */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-brand-deep font-bold text-xs uppercase tracking-widest bg-brand-tech/10 px-4 py-2 rounded-full border border-brand-tech/20">
              {t('about.badge')}
            </span>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <img
                src="/images/about/escudo-bolivia.jpg"
                alt="Escudo de Bolivia"
                style={{
                  width: '320px',
                  height: '230px',
                  objectFit: 'cover',
                  opacity: 0.85,
                  borderRadius: '15px',
                  border: '1.5px solid #CCFBF1',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-brand-deep leading-tight font-headline mt-4">
              {t('about.title')} <span className="text-brand-copper">{t('about.titleHighlight')}</span>
            </h1>
            <p className="text-brand-text/70 text-base md:text-lg leading-relaxed font-body">
              {t('about.subtitle')}
            </p>
          </div>

          {/* History Section (with image) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-brand-tech/10">
            <div className="md:col-span-6 space-y-6">
              <div className="w-12 h-12 bg-brand-tech/10 rounded-2xl flex items-center justify-center text-brand-tech">
                <span className="material-symbols-outlined text-2xl font-bold">history</span>
              </div>
              <h2 className="text-3xl font-extrabold text-brand-deep font-headline">
                {t('about.historyTitle')}
              </h2>
              <p className="text-brand-text/70 leading-relaxed text-sm">
                {t('about.historyP1')}
              </p>
              <p className="text-brand-text/70 leading-relaxed text-sm">
                {t('about.historyP2')}
              </p>
            </div>

            <div className="md:col-span-6 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-brand-tech/5 rounded-3xl blur-3xl transform rotate-3"></div>

              {/* Company image with fallback */}
              {empresaImgError ? (
                <div className="relative w-full max-w-md h-72 rounded-3xl bg-brand-deep overflow-hidden shadow-2xl border border-brand-tech/30 flex flex-col justify-between p-8 text-white">
                  <div>
                    <span className="text-brand-copper font-bold text-xs tracking-wider uppercase bg-white/10 px-3 py-1 rounded-full">
                      {t('about.logisticReach')}
                    </span>
                    <h3 className="text-2xl font-extrabold mt-4 font-headline">{t('about.connectingMarkets')}</h3>
                    <p className="text-brand-mint/60 text-xs mt-2 leading-relaxed">
                      {t('about.logisticDesc')}
                    </p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] text-brand-mint/40 uppercase tracking-widest">{t('about.established')}</p>
                      <p className="text-lg font-bold">2018</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] text-brand-mint/40 uppercase tracking-widest">{t('about.coverage')}</p>
                      <p className="text-lg font-bold text-brand-copper">{t('about.national')}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full max-w-md h-72 rounded-3xl overflow-hidden shadow-2xl border border-brand-tech/30">
                  <img
                    src="/images/about/empresa.jpg"
                    alt="Importadora Market"
                    className="w-full h-full object-cover"
                    onError={() => setEmpresaImgError(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/80 to-transparent flex items-end p-6">
                    <div className="flex justify-between items-end w-full">
                      <div className="space-y-1">
                        <p className="text-[10px] text-brand-mint/70 uppercase tracking-widest">{t('about.established')}</p>
                        <p className="text-lg font-bold text-white">2018</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] text-brand-mint/70 uppercase tracking-widest">{t('about.coverage')}</p>
                        <p className="text-lg font-bold text-brand-copper">{t('about.national')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mission & Vision Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mision Card */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-brand-tech/10 hover:shadow-xl hover:border-brand-tech/30 transition-all duration-300 group">
              <div className="w-12 h-12 bg-brand-tech/10 rounded-2xl flex items-center justify-center text-brand-tech group-hover:bg-brand-deep group-hover:text-white transition-all duration-300 mb-6">
                <span className="material-symbols-outlined text-2xl font-bold">rocket_launch</span>
              </div>
              <h3 className="text-2xl font-extrabold text-brand-deep font-headline mb-4">
                {t('about.missionTitle')}
              </h3>
              <p className="text-brand-text/70 leading-relaxed text-sm">
                {t('about.missionText')}
              </p>
            </div>

            {/* Vision Card */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-brand-tech/10 hover:shadow-xl hover:border-brand-tech/30 transition-all duration-300 group">
              <div className="w-12 h-12 bg-brand-tech/10 rounded-2xl flex items-center justify-center text-brand-tech group-hover:bg-brand-deep group-hover:text-white transition-all duration-300 mb-6">
                <span className="material-symbols-outlined text-2xl font-bold">visibility</span>
              </div>
              <h3 className="text-2xl font-extrabold text-brand-deep font-headline mb-4">
                {t('about.visionTitle')}
              </h3>
              <p className="text-brand-text/70 leading-relaxed text-sm">
                {t('about.visionText')}
              </p>
            </div>
          </div>

          {/* Corporate Details & Direct WhatsApp */}
          <div className="bg-brand-deep text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-copper/10 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-tech/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <span className="text-brand-copper font-bold text-xs uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full">
                  {t('about.directContact')}
                </span>
                <h2 className="text-3xl font-extrabold font-headline">
                  {t('about.wholesaleQuestion')}
                </h2>
                <p className="text-brand-mint/60 text-sm leading-relaxed max-w-xl">
                  {t('about.contactDesc')}
                </p>

                {/* WhatsApp Button */}
                <div className="pt-2">
                  <a
                    href="https://wa.me/59170000000?text=Hola%20Importadora%20Market%2C%20quisiera%20recibir%20informaci%C3%B3n%20comercial%20o%20soporte%20directo.%20👋"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-green-500/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                  >
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.424 2.5 1.134 3.471L6.5 18.5l3.181-.832a5.727 5.727 0 0 0 2.35.513h.002c3.182 0 5.769-2.586 5.77-5.766 0-3.18-2.587-5.766-5.772-5.766zm3.385 8.163c-.147.415-.852.766-1.173.811-.321.045-.634.07-.942-.023-.309-.092-1.077-.425-2.022-1.267-.735-.654-1.233-1.464-1.378-1.712-.145-.248-.016-.381.109-.506.112-.113.248-.292.372-.439.124-.146.166-.248.248-.415.083-.166.041-.314-.02-.439-.062-.124-.559-1.348-.766-1.848-.202-.488-.406-.421-.559-.429-.145-.008-.31-.01-.476-.01-.165 0-.434.062-.661.309-.227.247-.867.848-.867 2.07 0 1.221.888 2.4 1.012 2.565.124.166 1.747 2.668 4.232 3.74.591.255 1.053.407 1.412.521.593.189 1.134.162 1.562.098.477-.071 1.472-.601 1.679-1.183.207-.582.207-1.08.145-1.183-.062-.104-.227-.166-.476-.29z" />
                      <path d="M12.5 2C6.701 2 2 6.701 2 12.5c0 1.956.541 3.785 1.479 5.354L2 23.5l5.807-1.524A10.457 10.457 0 0 0 12.5 23c5.799 0 10.5-4.701 10.5-10.5S18.299 2 12.5 2zm0 19c-1.733 0-3.358-.48-4.742-1.314l-.34-.204-3.522.924.94-3.434-.224-.356A8.455 8.455 0 0 1 4 12.5C4 7.813 7.813 4 12.5 4 17.187 4 21 7.813 21 12.5 21 17.187 17.187 21 12.5 21z" />
                    </svg>
                    <span>{t('about.whatsappButton')}</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 bg-brand-tech/20 backdrop-blur-md rounded-2xl p-6 border border-brand-tech/30 space-y-6">
                <h3 className="text-xl font-bold font-headline border-b border-brand-tech/20 pb-3">{t('about.corporateInfo')}</h3>

                <div className="space-y-4 text-sm text-brand-mint/70">
                  <div>
                    <p className="text-[10px] text-brand-mint/40 uppercase tracking-widest font-bold">{t('about.centralOffice')}</p>
                    <p className="font-semibold text-white">{t('footer.address')}</p>
                    <p>{t('footer.city')}</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-brand-mint/40 uppercase tracking-widest font-bold">{t('about.commercialHours')}</p>
                    <p className="font-semibold text-white">{t('about.weekdays')}</p>
                    <p>{t('about.saturdays')}</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-brand-mint/40 uppercase tracking-widest font-bold">{t('about.phoneLine')}</p>
                    <p className="text-brand-copper font-bold">+591 (3) 344-0000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutPage;
