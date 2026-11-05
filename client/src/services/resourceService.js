import api from './api';

/**
 * Service to interact with the backend Safety Resources endpoints
 */
export const resourceService = {
  /**
   * Fetch all safety resources with optional category and GPS parameters
   * @param {Object} params - { category, lat, lng, radius }
   */
  async getResources(params = {}) {
    const query = {};
    if (params.category && params.category !== 'all') query.category = params.category;
    if (params.lat !== undefined && params.lat !== null) query.lat = params.lat;
    if (params.lng !== undefined && params.lng !== null) query.lng = params.lng;
    if (params.radius) query.radius = params.radius;

    const response = await api.get('/resources', { params: query });
    return response.data;
  },

  /**
   * Fetch a single safety resource by ID
   * @param {string} id
   */
  async getResourceById(id) {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },
};

export default resourceService;

