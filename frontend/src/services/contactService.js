import api from './api';

const contactService = {
  sendContactMessage: async (contactData) => {
    const response = await api.post('/contact', contactData);
    return response.data;
  },

  getAdminContacts: async (skip = 0, limit = 20) => {
    const response = await api.get('/admin/contacts', {
      params: { skip, limit },
    });
    return response.data;
  },

  markContactAsRead: async (contactId) => {
    const response = await api.put(`/admin/contacts/${contactId}/read`);
    return response.data;
  },
};

export default contactService;
