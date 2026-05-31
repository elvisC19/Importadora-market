import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full py-stack-xl px-4 md:px-margin-desktop bg-brand-deep text-brand-mint border-t border-brand-tech/30 mt-16">
      <div className="max-w-container-max mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-xl text-left">
        
        {/* Column 1: Brand & Tagline */}
        <div className="flex flex-col gap-stack-md">
          <span className="text-headline-sm font-headline-sm font-bold text-white block">{t('footer.brand')}</span>
          <p className="font-body-sm text-body-sm text-brand-mint leading-relaxed">
            {t('footer.tagline')}
          </p>
          <div className="flex gap-stack-md mt-auto pt-stack-sm">
            <a className="w-10 h-10 rounded-full bg-brand-tech/20 flex items-center justify-center text-brand-mint hover:bg-brand-copper hover:text-brand-copper-light transition-all" href="#">
              <span className="material-symbols-outlined text-[20px]">public</span>
            </a>
            <a className="w-10 h-10 rounded-full bg-brand-tech/20 flex items-center justify-center text-brand-mint hover:bg-brand-copper hover:text-brand-copper-light transition-all" href="#">
              <span className="material-symbols-outlined text-[20px]">share</span>
            </a>
            <a className="w-10 h-10 rounded-full bg-brand-tech/20 flex items-center justify-center text-brand-mint hover:bg-brand-copper hover:text-brand-copper-light transition-all" href="#">
              <span className="material-symbols-outlined text-[20px]">alternate_email</span>
            </a>
          </div>
        </div>

        {/* Column 2: Company */}
        <div className="flex flex-col gap-stack-sm">
          <h4 className="font-label-md text-label-md text-white mb-stack-xs uppercase tracking-wider font-bold">{t('footer.company')}</h4>
          <Link className="font-body-sm text-body-sm text-brand-mint hover:text-brand-copper-light transition-colors" to="/nosotros">{t('footer.aboutUs')}</Link>
          <Link className="font-body-sm text-body-sm text-brand-mint hover:text-brand-copper-light transition-colors" to="/contacto">{t('footer.contactLink')}</Link>
          <a className="font-body-sm text-body-sm text-brand-mint hover:text-brand-copper-light transition-colors" href="#">{t('footer.terms')}</a>
        </div>

        {/* Column 3: Support */}
        <div className="flex flex-col gap-stack-sm col-span-1">
          <h4 className="font-label-md text-label-md text-white mb-stack-xs uppercase tracking-wider font-bold">{t('footer.support')}</h4>
          <a className="font-body-sm text-body-sm text-brand-mint hover:text-brand-copper-light transition-colors break-all md:break-words" href="mailto:contacto@importadoramarket.com">contacto@importadoramarket.com</a>
          <a className="font-body-sm text-body-sm text-brand-mint hover:text-brand-copper-light transition-colors" href="tel:+59133440000">{t('footer.phone')}</a>
          <a className="font-body-sm text-body-sm text-brand-mint hover:text-brand-copper-light transition-colors" href="https://wa.me/59170000000">{t('footer.whatsapp')}</a>
        </div>

        {/* Column 4: Location */}
        <div className="flex flex-col gap-stack-sm col-span-1">
          <h4 className="font-label-md text-label-md text-white mb-stack-xs uppercase tracking-wider font-bold">{t('footer.location')}</h4>
          <p className="font-body-sm text-body-sm text-brand-mint leading-relaxed">
            {t('footer.address')}<br />{t('footer.city')}
          </p>
          <div className="mt-stack-sm">
            <a 
              href="https://maps.google.com/?q=Av.+Las+Americas+Torres+del+Sol+450+Santa+Cruz+Bolivia" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#CCFBF1', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              className="hover:text-brand-copper-light transition-colors font-bold"
            >
              📍 Ver en Google Maps
            </a>
          </div>
        </div>

      </div>

      <div className="max-w-container-max mx-auto w-full border-t border-brand-tech/20 mt-stack-xl pt-stack-md flex justify-between items-center">
        <p className="font-body-sm text-body-sm text-brand-mint w-full text-center md:text-left">{t('footer.copyright')}</p>
      </div>
    </footer>
  );
};

export default Footer;
