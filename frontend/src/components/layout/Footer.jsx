import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full py-stack-xl px-4 md:px-margin-desktop flex flex-col md:flex-row justify-between items-start gap-stack-md bg-surface-container-lowest border-t border-outline-variant mt-16">
      <div className="max-w-xs text-left">
        <span className="text-headline-sm font-headline-sm font-bold text-primary mb-stack-md block">Importadora Market</span>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-stack-lg leading-relaxed">
          Institutional reliability in global trade. Sourcing only the highest precision products for the modern enterprise and consumer.
        </p>
        <div className="flex gap-stack-md">
          <a className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all" href="#">
            <span className="material-symbols-outlined text-[20px]">public</span>
          </a>
          <a className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all" href="#">
            <span className="material-symbols-outlined text-[20px]">share</span>
          </a>
          <a className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all" href="#">
            <span className="material-symbols-outlined text-[20px]">alternate_email</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-stack-xl text-left w-full md:w-auto">
        <div className="flex flex-col gap-stack-sm">
          <h4 className="font-label-md text-label-md text-on-surface mb-stack-xs uppercase tracking-wider font-bold">Company</h4>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Corporate Info</a>
        </div>
        <div className="flex flex-col gap-stack-sm">
          <h4 className="font-label-md text-label-md text-on-surface mb-stack-xs uppercase tracking-wider font-bold">Support</h4>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Shipping Info</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Contact Support</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Track Order</a>
        </div>
        <div className="flex flex-col gap-stack-sm col-span-2 md:col-span-1">
          <h4 className="font-label-md text-label-md text-on-surface mb-stack-xs uppercase tracking-wider font-bold">Store Location</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            123 Logistics Plaza, Industrial District<br />San Salvador, ES
          </p>
          <div className="mt-stack-sm w-full h-24 rounded-lg bg-surface-container-high relative overflow-hidden shadow-inner border border-outline-variant/30">
            <img 
              alt="Map Location" 
              className="w-full h-full object-cover grayscale opacity-50" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMojixGVdV3xRWETIgr-bB8D0_HAdkP5mX_cGb6HHxrSlL_vzwNUUXfG49MPimcNJrcvjECyaQOd-ZXbaQMawnLgekbY24S4tSZNmVpHMRXRxZJojxalQcRwOMdfmwa88Kd1hV7M5_f__1qdRVuGe3Pk1yH7S5T0nyPYjolxFrERvFRcXBx2jDO1yCYK723QAlzfuPu0LV6Gq5DczbIcrg4I271GqiNCIFcEOKStmJYkGUetIk4U2m6DJhdQrW7Gzwx1lRiGp3thk"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="material-symbols-outlined text-primary text-xl font-bold">location_on</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full border-t border-outline-variant mt-stack-xl pt-stack-md flex flex-col md:flex-row justify-between items-center gap-stack-md text-slate-500">
        <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 Importadora Market. Institutional Reliability &amp; Performance.</p>
        <div className="flex gap-stack-lg">
          <span className="material-symbols-outlined text-on-surface-variant">payments</span>
          <span className="material-symbols-outlined text-on-surface-variant">credit_card</span>
          <span className="material-symbols-outlined text-on-surface-variant">account_balance</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
