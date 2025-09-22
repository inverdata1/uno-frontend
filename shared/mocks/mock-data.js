// Mock data with realistic Venezuelan content

export const mockUsers = [
  {
    id: 'current-user',
    name: 'María González',
    email: 'maria.gonzalez@gmail.com',
    phone: '+584141234567',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b3e5?w=150',
    address: {
      street: 'Av. Francisco de Miranda, Torre Parque Central',
      city: 'Caracas',
      state: 'Distrito Capital',
      zipCode: '1010',
      coordinates: { lat: 10.5011, lng: -66.9036 }
    },
    preferences: {
      notifications: true,
      language: 'es',
      currency: 'USD'
    },
    createdAt: '2024-01-10T08:00:00Z'
  },
  {
    id: 'business-user',
    name: 'Carlos Rodríguez',
    email: 'carlos@arepasdeliciosas.com',
    phone: '+584242345678',
    role: 'business',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    businessId: 'business-1',
    createdAt: '2024-01-05T10:00:00Z'
  }
];

export const mockBusinesses = [
  {
    id: 'business-1',
    name: 'Arepas Deliciosas',
    description: 'Las mejores arepas de Caracas con ingredientes frescos',
    category: 'Venezuelan Food',
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
    rating: 4.8,
    reviewCount: 324,
    deliveryTime: '25-35 min',
    deliveryFee: 2.50,
    minimumOrder: 8.00,
    address: {
      street: 'Av. Urdaneta, Las Mercedes',
      city: 'Caracas',
      state: 'Distrito Capital'
    },
    hours: {
      monday: '7:00-22:00',
      tuesday: '7:00-22:00',
      wednesday: '7:00-22:00',
      thursday: '7:00-22:00',
      friday: '7:00-23:00',
      saturday: '8:00-23:00',
      sunday: '8:00-21:00'
    },
    tags: ['Venezolana', 'Arepas', 'Desayuno', 'Rápido'],
    isOpen: true
  },
  {
    id: 'business-2',
    name: 'Pizza Margarita',
    description: 'Pizzas al horno de leña estilo italiano',
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    rating: 4.6,
    reviewCount: 156,
    deliveryTime: '30-45 min',
    deliveryFee: 3.00,
    minimumOrder: 12.00,
    address: {
      street: 'Calle Orinoco, Sabana Grande',
      city: 'Caracas',
      state: 'Distrito Capital'
    },
    isOpen: true,
    tags: ['Pizza', 'Italiana', 'Horno de Leña']
  },
  {
    id: 'business-3',
    name: 'Panadería Central',
    description: 'Pan fresco y pasteles caseros desde 1985',
    category: 'Bakery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    rating: 4.7,
    reviewCount: 89,
    deliveryTime: '15-25 min',
    deliveryFee: 1.50,
    minimumOrder: 5.00,
    address: {
      street: 'Av. Bolívar, Centro',
      city: 'Valencia',
      state: 'Carabobo'
    },
    isOpen: true,
    tags: ['Panadería', 'Desayuno', 'Dulces', 'Tradicional']
  }
];

export const mockProducts = [
  // Arepas Deliciosas products
  {
    id: 'product-1',
    businessId: 'business-1',
    name: 'Arepa Reina Pepiada',
    description: 'Arepa rellena con pollo desmenuzado, aguacate y mayonesa',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300',
    category: 'Arepas',
    isAvailable: true,
    preparationTime: 10,
    tags: ['Popular', 'Pollo', 'Aguacate']
  },
  {
    id: 'product-2',
    businessId: 'business-1',
    name: 'Arepa Pelua',
    description: 'Arepa con carne mechada y queso amarillo',
    price: 5.25,
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300',
    category: 'Arepas',
    isAvailable: true,
    preparationTime: 12,
    tags: ['Carne', 'Queso', 'Tradicional']
  },
  {
    id: 'product-3',
    businessId: 'business-1',
    name: 'Cachapa con Queso',
    description: 'Cachapa de maíz dulce con queso de mano',
    price: 6.00,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300',
    category: 'Cachapas',
    isAvailable: true,
    preparationTime: 15,
    tags: ['Dulce', 'Queso', 'Maíz']
  },

  // Pizza Margarita products
  {
    id: 'product-4',
    businessId: 'business-2',
    name: 'Pizza Margarita Personal',
    description: 'Pizza con tomate, mozzarella y albahaca fresca',
    price: 8.50,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300',
    category: 'Pizza',
    isAvailable: true,
    preparationTime: 20,
    tags: ['Clásica', 'Vegetariana', 'Italiana']
  },
  {
    id: 'product-5',
    businessId: 'business-2',
    name: 'Pizza Pepperoni Familiar',
    description: 'Pizza grande con pepperoni y queso mozzarella',
    price: 15.00,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300',
    category: 'Pizza',
    isAvailable: true,
    preparationTime: 25,
    tags: ['Familiar', 'Pepperoni', 'Popular']
  },

  // Panadería Central products
  {
    id: 'product-6',
    businessId: 'business-3',
    name: 'Pan Canilla',
    description: 'Pan tradicional venezolano, ideal para desayuno',
    price: 0.75,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300',
    category: 'Pan',
    isAvailable: true,
    preparationTime: 5,
    tags: ['Tradicional', 'Desayuno', 'Fresco']
  },
  {
    id: 'product-7',
    businessId: 'business-3',
    name: 'Quesillo Individual',
    description: 'Postre tradicional venezolano con caramelo',
    price: 3.25,
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300',
    category: 'Postres',
    isAvailable: true,
    preparationTime: 0,
    tags: ['Postre', 'Tradicional', 'Dulce']
  }
];

export const mockOrders = [
  {
    id: 'order-1',
    userId: 'current-user',
    businessId: 'business-1',
    businessName: 'Arepas Deliciosas',
    status: 'delivered',
    items: [
      {
        productId: 'product-1',
        name: 'Arepa Reina Pepiada',
        price: 4.50,
        quantity: 2,
        total: 9.00
      },
      {
        productId: 'product-3',
        name: 'Cachapa con Queso',
        price: 6.00,
        quantity: 1,
        total: 6.00
      }
    ],
    subtotal: 15.00,
    deliveryFee: 2.50,
    total: 17.50,
    paymentMethod: 'wallet',
    deliveryAddress: {
      street: 'Av. Francisco de Miranda, Torre Parque Central',
      city: 'Caracas',
      state: 'Distrito Capital',
      instructions: 'Tocar timbre del apartamento 12-B'
    },
    createdAt: '2024-01-14T19:30:00Z',
    deliveredAt: '2024-01-14T20:15:00Z',
    estimatedDelivery: '2024-01-14T20:10:00Z'
  },
  {
    id: 'order-2',
    userId: 'current-user',
    businessId: 'business-2',
    businessName: 'Pizza Margarita',
    status: 'preparing',
    items: [
      {
        productId: 'product-5',
        name: 'Pizza Pepperoni Familiar',
        price: 15.00,
        quantity: 1,
        total: 15.00
      }
    ],
    subtotal: 15.00,
    deliveryFee: 3.00,
    total: 18.00,
    paymentMethod: 'wallet',
    deliveryAddress: {
      street: 'Av. Francisco de Miranda, Torre Parque Central',
      city: 'Caracas',
      state: 'Distrito Capital'
    },
    createdAt: '2024-01-15T18:45:00Z',
    estimatedDelivery: '2024-01-15T19:30:00Z'
  },
  {
    id: 'order-3',
    userId: 'current-user',
    businessId: 'business-3',
    businessName: 'Panadería Central',
    status: 'pending',
    items: [
      {
        productId: 'product-6',
        name: 'Pan Canilla',
        price: 0.75,
        quantity: 6,
        total: 4.50
      },
      {
        productId: 'product-7',
        name: 'Quesillo Individual',
        price: 3.25,
        quantity: 2,
        total: 6.50
      }
    ],
    subtotal: 11.00,
    deliveryFee: 1.50,
    total: 12.50,
    paymentMethod: 'wallet',
    deliveryAddress: {
      street: 'Av. Francisco de Miranda, Torre Parque Central',
      city: 'Caracas',
      state: 'Distrito Capital'
    },
    createdAt: '2024-01-15T08:15:00Z',
    estimatedDelivery: '2024-01-15T08:45:00Z'
  }
];

// Helper function to get random items from arrays
export const getRandomItems = (array, count) => {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper to generate dynamic data
export const generateMockOrder = (userId, items) => ({
  id: `order-${Date.now()}`,
  userId,
  status: 'pending',
  items,
  subtotal: items.reduce((sum, item) => sum + item.total, 0),
  deliveryFee: 2.50,
  total: items.reduce((sum, item) => sum + item.total, 0) + 2.50,
  paymentMethod: 'wallet',
  createdAt: new Date().toISOString(),
  estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min from now
});