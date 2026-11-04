import api from './api';

export const dashboardService = {
  async getStats() {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },

  async getRecentActivity(limit = 15) {
    const res = await api.get('/dashboard/recent-activity', { params: { limit } });
    return res.data;
  },
};
