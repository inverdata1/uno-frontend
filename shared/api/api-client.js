/**
 * Main API client that manages resources and routes requests
 * Acts as the central router for all HTTP API operations
 */
export class ApiClient {
  constructor() {
    this.resources = new Map();
  }

  /**
   * Register a resource class
   * @param {string} name - Resource name (e.g., 'users', 'businesses')
   * @param {Class} resourceClass - Resource class constructor
   */
  registerResource(name, resourceClass) {
    this.resources.set(name, new resourceClass(this));
  }

  /**
   * Main request router
   * Routes requests to appropriate resource handlers
   * @param {string} method - HTTP method (GET, POST, PUT, PATCH, DELETE)
   * @param {string} endpoint - API endpoint (e.g., '/users/profile')
   * @param {Object|null} data - Request data for POST/PUT/PATCH
   * @param {Object} params - Query parameters
   * @returns {Promise<any>} Response data
   */
  async request(method, endpoint, data = null, params = {}) {
    try {
      // Parse endpoint: /users/profile -> resource: 'users', action: 'profile'
      const [resource, ...pathParts] = endpoint.substring(1).split('/');

      if (!this.resources.has(resource)) {
        throw new Error(`Resource '${resource}' not found. Available: ${Array.from(this.resources.keys()).join(', ')}`);
      }

      const resourceHandler = this.resources.get(resource);
      const action = pathParts.join('/') || 'index';

      console.log(`🌐 API ${method} /${resource}/${action}`, { data, params });

      const result = await resourceHandler.handle(method, action, data, params);

      console.log(`✅ API ${method} /${resource}/${action} completed`);
      return result;

    } catch (error) {
      console.error(`❌ API ${method} ${endpoint} failed:`, error);
      throw error;
    }
  }

  // HTTP method shortcuts
  async get(endpoint, params = {}) {
    return this.request('GET', endpoint, null, params);
  }

  async post(endpoint, data, params = {}) {
    return this.request('POST', endpoint, data, params);
  }

  async put(endpoint, data, params = {}) {
    return this.request('PUT', endpoint, data, params);
  }

  async patch(endpoint, data, params = {}) {
    return this.request('PATCH', endpoint, data, params);
  }

  async delete(endpoint, params = {}) {
    return this.request('DELETE', endpoint, null, params);
  }

  /**
   * Get registered resource
   * @param {string} name - Resource name
   * @returns {Object} Resource instance
   */
  getResource(name) {
    if (!this.resources.has(name)) {
      throw new Error(`Resource '${name}' not registered`);
    }
    return this.resources.get(name);
  }

  /**
   * List all registered resources
   * @returns {Array<string>} Resource names
   */
  listResources() {
    return Array.from(this.resources.keys());
  }
}
