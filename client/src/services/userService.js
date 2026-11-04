import api from './api';

export const userService = {
  async getUsers() {
    const res = await api.get('/users');
    return res.data;
  },

  async createUser(data) {
    const res = await api.post('/users', data);
    return res.data;
  },

  async updateUser(id, data) {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },

  async deleteUser(id) {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};
