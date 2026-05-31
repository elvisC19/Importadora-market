import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalOnline, setTotalOnline] = useState(0);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    is_admin: false,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Change password modal states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState(null);
  const [passwordUserName, setPasswordUserName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const handleOpenPasswordModal = (user) => {
    setPasswordUserId(user.id);
    setPasswordUserName(user.nombre);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordUserId(null);
    setPasswordUserName('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    setPasswordSubmitting(true);
    try {
      await adminService.changeUserPassword(passwordUserId, newPassword);
      showAlert('Contraseña cambiada correctamente.', 'success');
      handleClosePasswordModal();
    } catch (error) {
      setPasswordError(error.response?.data?.detail || 'Error al cambiar la contraseña.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers(skip, limit);
      setUsers(data.items);
      setTotal(data.total);
      
      const adminsData = await adminService.getUsers(0, 1, { is_admin: true });
      const onlineData = await adminService.getUsers(0, 1, { is_online: true });
      setTotalAdmins(adminsData.total);
      setTotalOnline(onlineData.total);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [skip]);

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    setFormError('');
    if (mode === 'edit' && user) {
      setSelectedUser(user);
      setFormData({
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono || '',
        password: '', // Password not needed for edit unless implementing change password
        is_admin: user.is_admin,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        password: '',
        is_admin: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ nombre: '', email: '', telefono: '', password: '', is_admin: false });
  };

  const handleFormChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (modalMode === 'add') {
        await adminService.createUser(formData);
      } else {
        // Only send fields that UserUpdate expects
        const { password, is_admin, ...updateData } = formData;
        await adminService.updateUser(selectedUser.id, updateData);
      }
      fetchUsers();
      handleCloseModal();
    } catch (error) {
      setFormError(error.response?.data?.detail || 'Error al procesar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${user.nombre}? Esta acción no se puede deshacer.`)) {
      try {
        await adminService.deleteUser(user.id);
        showAlert('Usuario eliminado correctamente.', 'success');
        fetchUsers();
      } catch (error) {
        showAlert(error.response?.data?.detail || 'Error al eliminar el usuario.', 'error');
      }
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: '' });
    }, 4000);
  };

  const handleToggleRole = async (userId) => {
    if (userId === currentUser.id) {
      showAlert('No puedes cambiar tu propio rol de administrador.', 'error');
      return;
    }

    try {
      await adminService.toggleUserRole(userId);
      showAlert('Rol alternado correctamente.', 'success');
      fetchUsers();
    } catch (error) {
      showAlert(error.response?.data?.detail || 'Error al cambiar el rol.', 'error');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser.id) {
      showAlert('No puedes cambiar tu propio rol de administrador.', 'error');
      return;
    }

    try {
      await adminService.updateUserRole(userId, newRole);
      showAlert(`Rol actualizado correctamente a "${newRole}".`, 'success');
      fetchUsers();
    } catch (error) {
      showAlert(error.response?.data?.detail || 'Error al cambiar el rol.', 'error');
    }
  };

  const nextPage = () => {
    if (skip + limit < total) setSkip(skip + limit);
  };

  const prevPage = () => {
    if (skip - limit >= 0) setSkip(skip - limit);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white fixed h-full p-6 border-r border-slate-800">
        <div className="mb-10">
          <h1 className="text-xl font-bold">Importadora Admin</h1>
          <p className="text-xs text-slate-400">Gestión del Sistema</p>
        </div>
        <nav className="flex-1 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 rounded-lg transition-all cursor-pointer">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-semibold">Dashboard</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 bg-accent text-white rounded-lg shadow-sm">
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm font-semibold">Usuarios</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-slate-400 opacity-50 cursor-not-allowed rounded-lg" title="Próximamente">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="text-sm font-semibold">Inventario (Próximamente)</span>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Gestión de Usuarios</h2>
            <p className="text-slate-500 mt-1">Monitorea y controla el acceso al sistema.</p>
          </div>
          <button 
            onClick={() => handleOpenModal('add')}
            className="bg-primary text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined">person_add</span>
            Añadir Usuario
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-slate-200 rounded-xl p-6 border-t-4 border-t-teal-500 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total Usuarios</p>
            <span className="text-3xl font-extrabold text-slate-900">{total}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 border-t-4 border-t-primary shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Administradores</p>
            <span className="text-3xl font-extrabold text-slate-900">{totalAdmins}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 border-t-4 border-t-accent shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">En Línea</p>
            <span className="text-3xl font-extrabold text-slate-900">{totalOnline}</span>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Registro</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400">Cargando usuarios...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400">No se encontraron usuarios.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
                            u.role === 'admin' ? 'bg-primary' : u.role === 'importadora' ? 'bg-accent' : 'bg-slate-400'
                          }`}>
                            {u.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{u.nombre}</p>
                            <p className="text-xs text-slate-500 font-mono">ID: #{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">{u.email}</p>
                        <p className="text-xs text-slate-500 font-mono">{u.telefono || 'Sin teléfono'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                            u.role === 'admin' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : u.role === 'importadora'
                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {u.role === 'admin' ? 'Admin' : u.role === 'importadora' ? 'Importadora' : 'Cliente'}
                          </span>
                          
                          <select
                            value={u.role || 'cliente'}
                            disabled={u.id === currentUser.id}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className={`px-2 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg outline-none cursor-pointer focus:border-primary transition-all max-w-[125px] ${
                              u.id === currentUser.id 
                                ? 'opacity-60 cursor-not-allowed bg-slate-50 text-slate-400' 
                                : 'hover:border-slate-350 text-slate-700'
                            }`}
                          >
                            <option value="cliente">Cliente</option>
                            <option value="importadora">Importadora</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${u.is_online ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]' : 'bg-slate-300'}`}></span>
                          <span className={`text-xs font-semibold ${u.is_online ? 'text-teal-700' : 'text-slate-500'}`}>
                            {u.is_online ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal('edit', u)}
                            disabled={u.id === currentUser.id}
                            className={`p-2 rounded-lg transition-colors ${u.id === currentUser.id ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-primary hover:bg-slate-100'}`}
                            title="Editar"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button 
                            onClick={() => handleOpenPasswordModal(u)}
                            className="p-2 rounded-lg transition-colors text-slate-400 hover:text-amber-500 hover:bg-amber-50"
                            title="Cambiar Contraseña"
                          >
                            <span className="material-symbols-outlined text-[20px]">key</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u)}
                            disabled={u.id === currentUser.id}
                            className={`p-2 rounded-lg transition-colors ${u.id === currentUser.id ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-error hover:bg-red-50'}`}
                            title="Eliminar"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                          <button 
                            onClick={() => handleToggleRole(u.id)}
                            disabled={u.id === currentUser.id}
                            className={`p-2 rounded-lg transition-colors ${u.id === currentUser.id ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-accent hover:bg-orange-50'}`}
                            title={u.is_admin ? 'Quitar Admin' : 'Hacer Admin'}
                          >
                            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
            <button 
              onClick={prevPage}
              disabled={skip === 0}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
              Pág {(skip / limit) + 1} • Mostrando {users.length} de {total}
            </span>
            <button 
              onClick={nextPage}
              disabled={skip + limit >= total}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </main>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">
                {modalMode === 'add' ? 'Añadir Nuevo Usuario' : 'Editar Usuario'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="nombre">Nombre Completo</label>
                <input 
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm" 
                  id="nombre" type="text" placeholder="Ej. Juan Pérez" value={formData.nombre} onChange={handleFormChange} required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="email">Correo Electrónico</label>
                <input 
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm" 
                  id="email" type="email" placeholder="nombre@empresa.com" value={formData.email} onChange={handleFormChange} required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="telefono">Teléfono</label>
                <input 
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm" 
                  id="telefono" type="tel" placeholder="71234567" value={formData.telefono} onChange={handleFormChange} 
                />
              </div>

              {modalMode === 'add' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="password">Contraseña</label>
                  <input 
                    className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm" 
                    id="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleFormChange} required 
                  />
                </div>
              )}

              {modalMode === 'add' && (
                <div className="flex items-center gap-3 pt-2">
                  <input 
                    type="checkbox" id="is_admin" checked={formData.is_admin} onChange={handleFormChange}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="is_admin" className="text-sm font-semibold text-slate-700 cursor-pointer">Es Administrador</label>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" onClick={handleCloseModal}
                  className="flex-1 h-11 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" disabled={submitting}
                  className="flex-1 h-11 bg-primary text-white font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {submitting ? 'Procesando...' : (modalMode === 'add' ? 'Añadir' : 'Guardar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Change Password */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Cambiar Contraseña</h3>
                <p className="text-xs text-slate-500 mt-1">Usuario: {passwordUserName}</p>
              </div>
              <button onClick={handleClosePasswordModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {passwordError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="newPassword">Nueva Contraseña</label>
                <input 
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-semibold" 
                  id="newPassword" 
                  type="password" 
                  placeholder="Mínimo 6 caracteres" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                <input 
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-semibold" 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Repite la nueva contraseña" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={handleClosePasswordModal}
                  className="flex-1 h-11 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={passwordSubmitting}
                  className="flex-1 h-11 bg-primary text-white font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {passwordSubmitting ? 'Cambiando...' : 'Confirmar'}
                </button>
              </div>
            </form>
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

export default AdminUsersPage;
