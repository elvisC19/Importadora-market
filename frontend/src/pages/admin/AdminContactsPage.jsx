import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import contactService from '../../services/contactService';

const AdminContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalUnread, setTotalUnread] = useState(0);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [markingId, setMarkingId] = useState(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await contactService.getAdminContacts(skip, limit);
      setContacts(data.items);
      setTotal(data.total);

      // Simple client-side or separate request count for unread
      // Fetching all to calculate or estimating from current items
      // Let's call endpoint or calculate based on loaded list
      const unreadCount = data.items.filter(item => !item.is_read).length;
      // Alternatively, fetch a larger batch or keep it simple
      setTotalUnread(data.items.filter(item => !item.is_read).length);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      showAlert('Error al cargar los mensajes de contacto.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [skip]);

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: '' });
    }, 4000);
  };

  const handleMarkAsRead = async (contact) => {
    if (contact.is_read) return;
    setMarkingId(contact.id);
    try {
      await contactService.markContactAsRead(contact.id);
      showAlert('Mensaje marcado como leído.', 'success');
      
      // Update local state smoothly
      setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, is_read: true } : c));
      setTotalUnread(prev => Math.max(0, prev - 1));
      
      // If modal is open with this contact, update modal content
      if (selectedContact && selectedContact.id === contact.id) {
        setSelectedContact(prev => ({ ...prev, is_read: true }));
      }
    } catch (error) {
      console.error('Error marking read:', error);
      showAlert('Error al marcar como leído.', 'error');
    } finally {
      setMarkingId(null);
    }
  };

  const handleOpenDetail = (contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
    // Auto-mark as read when opened, if it was unread
    if (!contact.is_read) {
      handleMarkAsRead(contact);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContact(null);
  };

  const nextPage = () => {
    if (skip + limit < total) setSkip(skip + limit);
  };

  const prevPage = () => {
    if (skip - limit >= 0) setSkip(skip - limit);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white fixed h-full p-6 border-r border-slate-800">
        <div className="mb-10">
          <Link to="/" className="text-xl font-black text-primary font-headline block">Importadora Market</Link>
          <p className="text-xs text-slate-400 mt-1">Gestión del Sistema</p>
        </div>
        <nav className="flex-1 space-y-2">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 rounded-lg transition-all">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-semibold">Dashboard</span>
          </Link>
          <Link to="/admin/usuarios" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 rounded-lg transition-all">
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm font-semibold">Usuarios</span>
          </Link>
          <Link to="/admin/inventario" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 rounded-lg transition-all">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="text-sm font-semibold">Inventario</span>
          </Link>
          <Link to="/admin/pedidos" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 rounded-lg transition-all">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="text-sm font-semibold">Pedidos</span>
          </Link>
          <Link to="/admin/contactos" className="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg shadow-sm">
            <span className="material-symbols-outlined">mail</span>
            <span className="text-sm font-semibold">Contactos</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 font-headline">Buzón de Contacto</h2>
            <p className="text-slate-500 mt-1">Revisa y responde a las consultas y mensajes de tus clientes.</p>
          </div>
          <Link
            to="/admin"
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 font-semibold text-slate-700 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Volver al Panel
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 border-t-4 border-t-slate-800 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Mensajes</p>
            <span className="text-3xl font-black text-slate-900 font-headline">{total}</span>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 border-t-4 border-t-primary shadow-sm flex flex-col justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mensajes Nuevos (Esta Página)</p>
            <span className="text-3xl font-black text-slate-950 font-headline flex items-center gap-2">
              {totalUnread}
              {totalUnread > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
              )}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 border-t-4 border-t-teal-500 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mensajes Leídos (Esta Página)</p>
            <span className="text-3xl font-black text-slate-900 font-headline">{contacts.length - totalUnread}</span>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 w-1/4">Remitente</th>
                  <th className="px-6 py-4 w-5/12">Mensaje</th>
                  <th className="px-6 py-4 w-2/12">Fecha de Envío</th>
                  <th className="px-6 py-4 w-1/12">Estado</th>
                  <th className="px-6 py-4 w-1/12 text-right">Acciones</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm font-semibold text-slate-500">Cargando mensajes recibidos...</span>
                      </div>
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                      No se han recibido mensajes de contacto en este período.
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr key={contact.id} className={`hover:bg-slate-50/70 transition-colors group ${!contact.is_read ? 'bg-orange-50/15 font-semibold' : ''}`}>
                      
                      {/* Remitente info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                            contact.is_read ? 'bg-slate-400' : 'bg-primary'
                          }`}>
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="max-w-[200px] truncate">
                            <p className="text-sm text-slate-900 truncate">{contact.name}</p>
                            <p className="text-xs text-slate-400 truncate">{contact.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Message preview */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700 line-clamp-2 pr-4">{contact.message}</p>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-600 font-mono">
                          {new Date(contact.sent_at).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {new Date(contact.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border tracking-wider transition-all duration-300 ${
                          contact.is_read
                            ? 'bg-slate-100 text-slate-600 border-slate-200/80'
                            : 'bg-primary/10 text-primary border-primary/20 animate-pulse'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${contact.is_read ? 'bg-slate-400' : 'bg-primary'}`}></span>
                          {contact.is_read ? 'Leído' : 'Nuevo'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handleOpenDetail(contact)}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all"
                            title="Ver mensaje completo"
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                          
                          {!contact.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(contact)}
                              disabled={markingId === contact.id}
                              className="p-2 rounded-xl text-slate-400 hover:text-green-600 hover:bg-green-50 transition-all disabled:opacity-50"
                              title="Marcar como leído"
                            >
                              {markingId === contact.id ? (
                                <svg className="animate-spin h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
            <button
              onClick={prevPage}
              disabled={skip === 0}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pág {(skip / limit) + 1} • Registros {contacts.length} de {total}
            </span>
            <button
              onClick={nextPage}
              disabled={skip + limit >= total}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>

      </main>

      {/* Details & Read Modal */}
      {isModalOpen && selectedContact && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500">mail</span>
                <h3 className="text-lg font-extrabold text-slate-900 font-headline">Consulta del Cliente</h3>
              </div>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Contact info card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">De</p>
                    <p className="text-sm font-bold text-slate-950">{selectedContact.name}</p>
                    <a href={`mailto:${selectedContact.email}`} className="text-xs text-primary font-medium hover:underline block">
                      {selectedContact.email}
                    </a>
                  </div>
                  
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border tracking-wider ${
                    selectedContact.is_read
                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                      : 'bg-primary/10 text-primary border-primary/20'
                  }`}>
                    {selectedContact.is_read ? 'Leído' : 'No Leído'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Enviado el:</span>
                  <span>
                    {new Date(selectedContact.sent_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Message text */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mensaje:</p>
                <div className="w-full max-h-56 overflow-y-auto bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-700 leading-relaxed font-body whitespace-pre-wrap">
                  {selectedContact.message}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 py-2.5 bg-slate-200/80 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer text-sm"
              >
                Cerrar
              </button>
              
              {!selectedContact.is_read && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(selectedContact)}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer text-sm"
                >
                  Marcar como Leído
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Premium Notification Toast */}
      {alert.show && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl border shadow-lg transition-all animate-in slide-in-from-top-5 duration-300 ${
          alert.type === 'success' 
            ? 'bg-teal-50 border-teal-200 text-teal-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className="material-symbols-outlined text-[20px] font-bold">
            {alert.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="text-sm font-semibold">{alert.message}</span>
        </div>
      )}

    </div>
  );
};

export default AdminContactsPage;
