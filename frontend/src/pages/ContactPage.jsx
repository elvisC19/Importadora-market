import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import contactService from '../services/contactService';
import Footer from '../components/layout/Footer';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre completo es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Por favor, introduce un correo electrónico válido';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido';
    } else if (formData.message.trim().length < 5) {
      newErrors.message = 'El mensaje debe tener al menos 5 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await contactService.sendContactMessage(formData);
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      setApiError(
        err.response?.data?.detail || 
        'Hubo un problema al enviar tu mensaje. Por favor, intenta de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-slate-800">

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/40">
        
        {/* Info Column */}
        <div className="md:col-span-5 bg-slate-900 text-white p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle design elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl transform translate-x-12 -translate-y-12"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl transform -translate-x-16 translate-y-16"></div>
          
          <div className="relative z-10">
            <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
              Atención Directa
            </span>
            <h2 className="text-3xl font-extrabold mt-6 leading-tight font-headline">
              Ponte en <br />
              <span className="text-primary">Contacto</span>
            </h2>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">
              ¿Tienes alguna duda, cotización o consulta especial? Escríbenos y nuestro equipo corporativo te responderá a la brevedad.
            </p>
          </div>

          <div className="mt-8 space-y-6 relative z-10">
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-lg">location_on</span>
              </div>
              <div>
                <p className="text-xs text-slate-400">Nuestra Ubicación</p>
                <p className="text-sm font-medium">Santa Cruz de la Sierra, Bolivia</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-lg">call</span>
              </div>
              <div>
                <p className="text-xs text-slate-400">Teléfono Corporativo</p>
                <p className="text-sm font-medium">+591 70000000</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-lg">alternate_email</span>
              </div>
              <div>
                <p className="text-xs text-slate-400">Correo Electrónico</p>
                <p className="text-sm font-medium">contacto@importadoramarket.com</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 relative z-10 text-xs text-slate-400">
            © 2026 Importadora Market S.R.L. <br />
            Confianza Institucional en Comercio Global.
          </div>
        </div>

        {/* Form Column */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white/40">
          {submitSuccess ? (
            <div className="text-center py-8 px-4 flex flex-col items-center justify-center animate-fade-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-6 shadow-lg shadow-green-100 animate-bounce">
                <span className="material-symbols-outlined text-[44px]">check_circle</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2 font-headline">
                ¡Mensaje Enviado con Éxito!
              </h3>
              <p className="text-slate-600 text-sm max-w-sm mb-8 leading-relaxed">
                Gracias por escribirnos. Nuestro equipo administrativo revisará tu consulta y te responderá por correo electrónico lo antes posible.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all duration-300 cursor-pointer"
                >
                  Enviar otro mensaje
                </button>
                <Link
                  to="/"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Volver al Inicio
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 font-headline">
                  Envíanos una Consulta
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Por favor, completa el siguiente formulario. Todos los campos son obligatorios.
                </p>
              </div>

              {apiError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{apiError}</span>
                </div>
              )}

              {/* Name field */}
              <div className="space-y-1">
                <label htmlFor="name" className="text-xs font-bold text-slate-700 block">
                  Nombre Completo
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                  </span>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white/70 border rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all duration-300 ${
                      errors.name 
                        ? 'border-red-300 focus:ring-red-200' 
                        : 'border-slate-200 focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="Ej. Juan Pérez Siles"
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] font-bold">circle</span>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email field */}
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-bold text-slate-700 block">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white/70 border rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all duration-300 ${
                      errors.email 
                        ? 'border-red-300 focus:ring-red-200' 
                        : 'border-slate-200 focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="juan.perez@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] font-bold">circle</span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Message field */}
              <div className="space-y-1">
                <label htmlFor="message" className="text-xs font-bold text-slate-700 block">
                  Mensaje o Consulta
                </label>
                <div className="relative">
                  <span className="absolute top-3 left-3 text-slate-400">
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                  </span>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white/70 border rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all duration-300 resize-none ${
                      errors.message 
                        ? 'border-red-300 focus:ring-red-200' 
                        : 'border-slate-200 focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="Escribe tu mensaje aquí de forma detallada..."
                  ></textarea>
                </div>
                {errors.message && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] font-bold">circle</span>
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-primary hover:bg-primary-hover disabled:bg-slate-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Enviando mensaje...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    <span>Enviar Mensaje</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
    <Footer />
    </>
  );
};

export default ContactPage;
