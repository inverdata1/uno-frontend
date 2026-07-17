import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api-config';

/**
 * Base service class for API operations
 * Provides common CRUD operations using HTTP fetch
 */
export class BaseApiService {
  constructor(client, resourceName) {
    this.client = client; 
    this.resourceName = resourceName;
    this.baseUrl = `${API_CONFIG.baseURL}/${resourceName}`;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  async _request(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      // Obtener token JWT del almacenamiento local
      const token = await AsyncStorage.getItem('userToken');
      const authHeader = token ? `Bearer ${token}` : `Bearer ${API_CONFIG.secretToken}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          'Authorization': authHeader,
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      if (response.status === 204) return null;
      
      const json = await response.json();
      return json;
    } catch (error) {
      console.error(`❌ HTTP Error [${options.method || 'GET'} ${this.resourceName}${endpoint}]:`, error);
      throw error;
    }
  }

  async findById(id) {
    return this._request(`/${id}`);
  }

  async findAll(filters = {}, options = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, v);
    });

    if (options.orderBy) params.append('orderBy', options.orderBy);
    if (options.order) params.append('order', options.order);
    if (options.limit) params.append('limit', options.limit);

    const queryString = params.toString();
    const endpoint = queryString ? `/?${queryString}` : '/';
    
    return this._request(endpoint);
  }

  async create(data, customId = null) {
    const payload = customId ? { ...data, id: customId } : data;
    
    return this._request('/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async update(id, data) {
    return this._request(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete(id) {
    await this._request(`/${id}`, {
      method: 'DELETE'
    });
    return { id, deleted: true };
  }

  async findWhere(conditions, options = {}) {
    // En NestJS tendríamos que crear un endpoint /search si queremos algo complejo
    // Por ahora enviamos las condiciones como JSON string
    const params = new URLSearchParams();
    params.append('where', JSON.stringify(conditions));
    if (options.orderBy) params.append('orderBy', options.orderBy);
    if (options.order) params.append('order', options.order);
    if (options.limit) params.append('limit', options.limit);

    return this._request(`/search?${params.toString()}`);
  }

  async findOne(conditions) {
    const results = await this.findWhere(conditions, { limit: 1 });
    return results && results.length > 0 ? results[0] : null;
  }

  async exists(id) {
    try {
      await this.findById(id);
      return true;
    } catch {
      return false;
    }
  }

  async count(filters = {}) {
    const docs = await this.findAll(filters);
    return docs.length;
  }
}
