import api from './api';

const authService = {
  register: async (nombre, email, password, telefono) => {
    const response = await api.post('/auth/register', {
      nombre,
      email,
      password,
      telefono,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    const { access_token } = response.data;
    if (access_token) {
      localStorage.setItem('token', access_token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

export default authService;
