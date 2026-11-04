import api from './api';

export const articleService = {
  async getArticles(params = {}) {
    const res = await api.get('/articles', { params });
    return res.data;
  },

  async getArticleById(id) {
    const res = await api.get(`/articles/${id}`);
    return res.data;
  },

  async createArticle(data) {
    const res = await api.post('/articles', data);
    return res.data;
  },

  async updateArticle(id, data) {
    const res = await api.put(`/articles/${id}`, data);
    return res.data;
  },

  async deleteArticle(id) {
    const res = await api.delete(`/articles/${id}`);
    return res.data;
  },

  async markAsReviewed(id, notes = '') {
    const res = await api.post(`/articles/${id}/review`, { notes });
    return res.data;
  },

  async getReviewCalendar() {
    const res = await api.get('/articles/calendar');
    return res.data;
  },
};
