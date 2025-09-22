// Mock Backend System - Simulates FastAPI responses for development
import { mockUsers, mockOrders, mockProducts, mockBusinesses } from '../mocks/mock-data';

// Toggle between mock and real backend
export const USE_MOCK_BACKEND = true; // Set to false when real backend is ready

// Simulate network delays
const simulateDelay = (min = 500, max = 1500) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Mock response structure
const createMockResponse = (data, status = 200) => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers: { 'content-type': 'application/json' },
});

// Mock API handlers by endpoint
export const mockHandlers = {
  // User endpoints
  'GET /users/profile': async () => {
    await simulateDelay();
    const currentUser = mockUsers.find(u => u.id === 'current-user') || mockUsers[0];
    return createMockResponse(currentUser);
  },

  'PUT /users/profile': async (data) => {
    await simulateDelay();
    const updatedUser = { ...mockUsers[0], ...data };
    return createMockResponse(updatedUser);
  },

  'GET /users/:userId': async (userId) => {
    await simulateDelay();
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return createMockResponse({ error: 'Usuario no encontrado' }, 404);
    }
    return createMockResponse(user);
  },

  // Orders endpoints
  'GET /orders': async (params) => {
    await simulateDelay();
    let orders = [...mockOrders];

    // Filter by user if needed
    if (params?.userId) {
      orders = orders.filter(o => o.userId === params.userId);
    }

    // Filter by status if needed
    if (params?.status) {
      orders = orders.filter(o => o.status === params.status);
    }

    return createMockResponse(orders);
  },

  'GET /orders/:orderId': async (orderId) => {
    await simulateDelay();
    const order = mockOrders.find(o => o.id === orderId);
    if (!order) {
      return createMockResponse({ error: 'Orden no encontrada' }, 404);
    }
    return createMockResponse(order);
  },

  'POST /orders': async (orderData) => {
    await simulateDelay(800, 2000); // Longer delay for creation
    const newOrder = {
      id: `order-${Date.now()}`,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      total: orderData.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0,
    };
    return createMockResponse(newOrder, 201);
  },

  'PUT /orders/:orderId': async (orderId, data) => {
    await simulateDelay();
    const order = mockOrders.find(o => o.id === orderId);
    if (!order) {
      return createMockResponse({ error: 'Orden no encontrada' }, 404);
    }
    const updatedOrder = { ...order, ...data };
    return createMockResponse(updatedOrder);
  },

  // Business endpoints
  'GET /businesses': async (params) => {
    await simulateDelay();
    let businesses = [...mockBusinesses];

    // Filter by category if needed
    if (params?.category) {
      businesses = businesses.filter(b => b.category === params.category);
    }

    return createMockResponse(businesses);
  },

  'GET /businesses/:businessId': async (businessId) => {
    await simulateDelay();
    const business = mockBusinesses.find(b => b.id === businessId);
    if (!business) {
      return createMockResponse({ error: 'Negocio no encontrado' }, 404);
    }
    return createMockResponse(business);
  },

  // Products endpoints
  'GET /products': async (params) => {
    await simulateDelay();
    let products = [...mockProducts];

    // Filter by business if needed
    if (params?.businessId) {
      products = products.filter(p => p.businessId === params.businessId);
    }

    // Filter by category if needed
    if (params?.category) {
      products = products.filter(p => p.category === params.category);
    }

    return createMockResponse(products);
  },

  // Wallet endpoints
  'GET /wallet/balance': async () => {
    await simulateDelay();
    return createMockResponse({
      balance: 50.75,
      currency: 'USD',
      lastTransaction: '2024-01-15T10:30:00Z'
    });
  },

  'POST /wallet/add-funds': async (data) => {
    await simulateDelay(1000, 3000); // Longer for payments
    return createMockResponse({
      success: true,
      newBalance: 50.75 + data.amount,
      transactionId: `tx-${Date.now()}`
    });
  },
};

// Helper to match route patterns
const matchRoute = (method, url) => {
  const routeKey = `${method} ${url}`;

  // Exact match first
  if (mockHandlers[routeKey]) {
    return { handler: mockHandlers[routeKey], params: {} };
  }

  // Pattern matching for dynamic routes
  for (const pattern in mockHandlers) {
    const [patternMethod, patternPath] = pattern.split(' ');
    if (patternMethod !== method) continue;

    const pathRegex = patternPath.replace(/:\w+/g, '([^/]+)');
    const match = url.match(new RegExp(`^${pathRegex}$`));

    if (match) {
      const paramNames = (patternPath.match(/:\w+/g) || []).map(p => p.slice(1));
      const params = {};
      paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });

      return { handler: mockHandlers[pattern], params };
    }
  }

  return null;
};

// Main mock interceptor function
export const mockApiCall = async (method, url, data, params) => {
  if (!USE_MOCK_BACKEND) {
    return null; // Let real API handle it
  }

  console.log(`🎭 Mock API: ${method} ${url}`, { data, params });

  const route = matchRoute(method, url);

  if (!route) {
    await simulateDelay(200, 500);
    return createMockResponse({ error: 'Endpoint no encontrado' }, 404);
  }

  try {
    // Call the mock handler with extracted params and data
    const response = await route.handler(route.params.length ? Object.values(route.params)[0] : data, params);
    console.log(`✅ Mock Response:`, response);
    return response;
  } catch (error) {
    console.error(`❌ Mock Error:`, error);
    await simulateDelay(200, 500);
    return createMockResponse({ error: 'Error interno del servidor' }, 500);
  }
};