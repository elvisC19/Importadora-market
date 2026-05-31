import React from 'react';
import Footer from '../components/layout/Footer';

const AboutPage = () => {
  return (
    <>
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            Sobre Nosotros
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight font-headline mt-4">
            Importadora <span className="text-primary">Market</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-body">
            Garantizamos confianza institucional en comercio global. Suministramos productos de alta precisión y calidad certificada para empresas, profesionales y consumidores exigentes en todo el territorio nacional.
          </p>
        </div>

        {/* History Section (with image/diagram mockup) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
          <div className="md:col-span-6 space-y-6">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl font-bold">history</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 font-headline">
              Nuestra Historia
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Fundada con la convicción de acortar distancias en el comercio internacional, Importadora Market nació como un puente logístico de confianza para Bolivia. A lo largo de los años, hemos consolidado alianzas estratégicas con fabricantes líderes en tecnología, herramientas de precisión y bienes de consumo de alta rotación en Asia, Europa y Norteamérica.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              Hoy nos destacamos por una operación fluida, almacenamiento avanzado y un ecosistema digital integrado que permite a nuestros clientes gestionar pedidos con total visibilidad, seguridad y rapidez de entrega.
            </p>
          </div>
          
          <div className="md:col-span-6 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-3xl transform rotate-3"></div>
            <div className="relative w-full max-w-md h-72 rounded-3xl bg-slate-900 overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between p-8 text-white">
              <div>
                <span className="text-primary font-bold text-xs tracking-wider uppercase bg-white/10 px-3 py-1 rounded-full">
                  Alcance Logístico
                </span>
                <h3 className="text-2xl font-extrabold mt-4 font-headline">Conectando Mercados</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Desde los centros industriales más importantes del mundo directamente hasta los hogares y almacenes de Bolivia.
                </p>
              </div>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Establecido</p>
                  <p className="text-lg font-bold">2018</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Cobertura</p>
                  <p className="text-lg font-bold text-primary">Nacional 🇧🇴</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mision Card */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 mb-6">
              <span className="material-symbols-outlined text-2xl font-bold">rocket_launch</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 font-headline mb-4">
              Nuestra Misión
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Facilitar el abastecimiento de bienes premium de alta calidad en el mercado nacional con tarifas justas, procesos de despacho ágiles y una atención al cliente de primer nivel. Nos esforzamos por construir relaciones comerciales transparentes y de largo plazo basadas en la eficiencia de suministro y la responsabilidad social.
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 mb-6">
              <span className="material-symbols-outlined text-2xl font-bold">visibility</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 font-headline mb-4">
              Nuestra Visión
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Consolidarnos en el año 2030 como la importadora y comercializadora digital líder en Bolivia, reconocida por su integridad, digitalización de vanguardia y sustentabilidad. Queremos inspirar al mercado local demostrando que el comercio exterior puede ser rápido, transparente y 100% confiable.
            </p>
          </div>
        </div>

        {/* Corporate Details & Direct WhatsApp */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-primary font-bold text-xs uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full">
                Contacto Directo
              </span>
              <h2 className="text-3xl font-extrabold font-headline">
                ¿Tienes preguntas o deseas programar una compra mayorista?
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
                Nuestro departamento comercial y de atención corporativa está disponible a un clic de distancia para brindarte cotizaciones personalizadas y soporte premium en tiempo real.
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
                  <span>Escríbenos por WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 space-y-6">
              <h3 className="text-xl font-bold font-headline border-b border-slate-700 pb-3">Información Corporativa</h3>
              
              <div className="space-y-4 text-sm text-slate-300">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Oficina Central</p>
                  <p className="font-semibold text-white">Av. Las Américas, Torres del Sol #450, Piso 4</p>
                  <p>Santa Cruz de la Sierra, Bolivia</p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Atención Comercial</p>
                  <p className="font-semibold text-white">Lunes a Viernes: 08:30 – 18:30</p>
                  <p>Sábados: 09:00 – 13:00</p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Línea Telefónica</p>
                  <p className="text-primary font-bold">+591 (3) 344-0000</p>
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
