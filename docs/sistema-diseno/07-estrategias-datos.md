# 07 - Estrategias de Datos

## Overview de Estrategias de Optimización

> ⚠️ **MIGRACIÓN EN PROCESO**: Este documento describe estrategias para Firestore.
>
> **Nueva arquitectura**: Ver **[09 - Sistema de Modos de Usuario](./09-sistema-modos-usuario.md)** para estrategias con base de datos relacional.

Las estrategias actuales están diseñadas para Firestore, pero se están migrating a un enfoque relacional optimizado para consultas por modo de usuario y contexto de sucursales.

### Principios de Optimización

```javascript
┌─────────────────────────────────────────────────────────────┐
│                   DATA OPTIMIZATION LAYERS                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   CACHING   │ │  INDEXING   │ │ PAGINATION  │           │
│  │             │ │             │ │             │           │
│  │ • TanStack  │ │ • Composite │ │ • Cursor    │           │
│  │   Query     │ │   Indexes   │ │   Based     │           │
│  │ • Memory    │ │ • Single    │ │ • Infinite  │           │
│  │   Cache     │ │   Field     │ │   Scroll    │           │
│  │ • Persist   │ │ • Geo       │ │ • Virtual   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                             │                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │DENORMALIZE │ │ AGGREGATION │ │  REAL-TIME  │           │
│  │             │ │             │ │             │           │
│  │ • Strategic │ │ • Counters  │ │ • Selective │           │
│  │   Duplication│ │ • Metrics  │ │   Listeners │           │
│  │ • Read      │ │ • Reports   │ │ • Efficient │           │
│  │   Optimized │ │ • Analytics │ │   Updates   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Caching Strategy

### TanStack Query Configuration

```javascript
// shared/config/query-client.js
import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Global cache time - 5 minutes
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,

        // Retry strategy
        retry: (failureCount, error) => {
          // Don't retry auth errors
          if (error.code === 'permission-denied') return false;
          // Don't retry not found errors
          if (error.code === 'not-found') return false;
          // Retry network errors up to 3 times
          return failureCount < 3;
        },

        // Refetch strategies
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        refetchOnMount: true,

        // Network mode
        networkMode: 'online'
      },

      mutations: {
        retry: 1,
        networkMode: 'online'
      }
    }
  });
};

// Context-aware cache strategies
export const cacheStrategies = {
  // User data - cache for session duration
  user: {
    staleTime: Infinity,
    gcTime: Infinity
  },

  // Business data - medium cache
  business: {
    staleTime: 10 * 60 * 1000,  // 10 minutes
    gcTime: 30 * 60 * 1000      // 30 minutes
  },

  // Products - longer cache (products don't change often)
  products: {
    staleTime: 15 * 60 * 1000,  // 15 minutes
    gcTime: 60 * 60 * 1000      // 1 hour
  },

  // Orders - short cache (real-time data)
  orders: {
    staleTime: 30 * 1000,       // 30 seconds
    gcTime: 5 * 60 * 1000       // 5 minutes
  },

  // Analytics - very long cache
  analytics: {
    staleTime: 60 * 60 * 1000,  // 1 hour
    gcTime: 4 * 60 * 60 * 1000  // 4 hours
  }
};
```

### Context-Aware Query Keys

```javascript
// shared/hooks/use-query-keys.js
export const createQueryKeys = () => {
  const { activeRole, activeBusiness, activeBranch } = useRoleStore();

  const getContextualKey = (baseKey, additionalContext = []) => [
    ...baseKey,
    'context',
    activeRole,
    activeBusiness,
    activeBranch,
    ...additionalContext
  ].filter(Boolean);

  return {
    // User queries
    user: (userId) => ['users', userId],
    userProfile: (userId) => ['users', userId, 'profile'],
    userRoles: (userId) => ['users', userId, 'roles'],

    // Business queries with context
    business: (businessId) => getContextualKey(['businesses', businessId]),
    businessProducts: (businessId) => getContextualKey(['products'], [businessId]),
    businessOrders: (businessId) => getContextualKey(['orders'], [businessId]),
    businessAnalytics: (businessId) => getContextualKey(['analytics'], [businessId]),

    // Branch-specific queries
    branchProducts: (businessId, branchId) =>
      getContextualKey(['products'], [businessId, branchId]),
    branchOrders: (businessId, branchId) =>
      getContextualKey(['orders'], [businessId, branchId]),

    // Client queries
    clientOrders: (userId) => getContextualKey(['orders', 'client'], [userId]),
    clientFavorites: (userId) => getContextualKey(['favorites'], [userId]),

    // Search and discovery
    searchProducts: (query, filters) => [
      'search',
      'products',
      query,
      JSON.stringify(filters)
    ],
    businessSearch: (query, location) => [
      'search',
      'businesses',
      query,
      location?.latitude,
      location?.longitude
    ]
  };
};
```

## Pagination Strategies

### Cursor-Based Pagination

```javascript
// shared/hooks/use-paginated-query.js
export const usePaginatedQuery = ({
  queryKey,
  queryFn,
  pageSize = 20,
  enableInfinite = false,
  ...options
}) => {
  const cacheKey = enableInfinite ? 'infinite' : 'paginated';

  if (enableInfinite) {
    return useInfiniteQuery({
      queryKey: [cacheKey, ...queryKey],
      queryFn: ({ pageParam = null }) => queryFn({
        cursor: pageParam,
        limit: pageSize
      }),
      getNextPageParam: (lastPage) => {
        return lastPage.hasMore ? lastPage.nextCursor : undefined;
      },
      initialPageParam: null,
      ...options
    });
  }

  return useQuery({
    queryKey: [cacheKey, ...queryKey],
    queryFn: () => queryFn({ limit: pageSize }),
    ...options
  });
};

// Usage examples
export const useBusinessOrders = (businessId) => {
  const queryKeys = createQueryKeys();

  return usePaginatedQuery({
    queryKey: queryKeys.businessOrders(businessId),
    queryFn: async ({ cursor, limit }) => {
      let query = firestore
        .collection('orders')
        .where('businessId', '==', businessId)
        .orderBy('createdAt', 'desc')
        .limit(limit);

      if (cursor) {
        query = query.startAfter(cursor);
      }

      const snapshot = await query.get();
      const docs = snapshot.docs;

      return {
        data: docs.map(doc => ({ id: doc.id, ...doc.data() })),
        nextCursor: docs.length === limit ? docs[docs.length - 1] : null,
        hasMore: docs.length === limit
      };
    },
    enableInfinite: true,
    staleTime: cacheStrategies.orders.staleTime
  });
};
```

### Virtual Pagination for Large Lists

```javascript
// shared/components/ui/virtual-list.jsx
import { FlashList } from '@shopify/flash-list';

export const VirtualizedList = ({
  data,
  renderItem,
  onEndReached,
  hasNextPage,
  isFetchingNextPage,
  estimatedItemSize = 80,
  ...props
}) => {
  const renderFooter = useCallback(() => {
    if (!hasNextPage) return null;

    return (
      <View className="p-4 items-center">
        {isFetchingNextPage ? (
          <ActivityIndicator size="small" />
        ) : (
          <TouchableOpacity onPress={onEndReached}>
            <Text className="text-blue-600">Cargar más</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [hasNextPage, isFetchingNextPage, onEndReached]);

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      estimatedItemSize={estimatedItemSize}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.8}
      ListFooterComponent={renderFooter}
      contentContainerStyle={{ padding: 16 }}
      {...props}
    />
  );
};
```

## Denormalization Strategies

### Strategic Data Duplication

```javascript
// services/denormalization-service.js
export class DenormalizationService {
  // When business updates, update denormalized data in orders
  static async updateBusinessInOrders(businessId, updates) {
    const batch = firestore.batch();

    // Get recent orders that need business data updated
    const ordersQuery = await firestore
      .collection('orders')
      .where('businessId', '==', businessId)
      .where('createdAt', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
      .get();

    ordersQuery.docs.forEach(doc => {
      const orderRef = firestore.collection('orders').doc(doc.id);
      batch.update(orderRef, {
        'businessInfo.name': updates.name,
        'businessInfo.logo': updates.logo,
        'businessInfo.phone': updates.phone
      });
    });

    await batch.commit();
  }

  // When product updates, update it in recent orders
  static async updateProductInOrders(productId, updates) {
    const batch = firestore.batch();

    // Get recent orders containing this product
    const ordersQuery = await firestore
      .collection('orders')
      .where('items.productId', 'array-contains', productId)
      .where('createdAt', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
      .limit(100)
      .get();

    ordersQuery.docs.forEach(doc => {
      const orderData = doc.data();
      const updatedItems = orderData.items.map(item => {
        if (item.productId === productId) {
          return {
            ...item,
            name: updates.name || item.name,
            // Don't update price - keep historical pricing
          };
        }
        return item;
      });

      const orderRef = firestore.collection('orders').doc(doc.id);
      batch.update(orderRef, { items: updatedItems });
    });

    await batch.commit();
  }

  // Create denormalized user data for orders
  static createOrderUserInfo(user) {
    return {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      email: user.email
      // Don't include sensitive data
    };
  }

  // Create denormalized business data for orders
  static createOrderBusinessInfo(business) {
    return {
      businessId: business.id,
      name: business.name,
      logo: business.logo,
      phone: business.phone,
      category: business.category
    };
  }
}
```

### Aggregated Data Collections

```javascript
// Collection: business_metrics (aggregated data)
const businessMetricsSchema = {
  businessId: string,
  date: string,              // "2024-01-15" for daily aggregation
  period: enum('daily', 'weekly', 'monthly'),

  // Order metrics
  orders: {
    total: number,
    completed: number,
    cancelled: number,
    averageValue: number,
    revenue: number
  },

  // Product metrics
  products: {
    totalActive: number,
    topSelling: [
      {
        productId: string,
        name: string,
        quantity: number,
        revenue: number
      }
    ]
  },

  // Customer metrics
  customers: {
    unique: number,
    new: number,
    returning: number,
    averageOrdersPerCustomer: number
  },

  // Performance metrics
  performance: {
    averagePreparationTime: number,
    averageResponseTime: number,
    customerSatisfactionScore: number,
    fulfillmentRate: number
  },

  updatedAt: timestamp
};

// Service for metrics aggregation
export class MetricsAggregationService {
  static async aggregateDailyMetrics(businessId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all orders for the day
    const ordersSnapshot = await firestore
      .collection('orders')
      .where('businessId', '==', businessId)
      .where('createdAt', '>=', startOfDay)
      .where('createdAt', '<=', endOfDay)
      .get();

    const orders = ordersSnapshot.docs.map(doc => doc.data());

    // Calculate metrics
    const metrics = {
      businessId,
      date: date.toISOString().split('T')[0],
      period: 'daily',
      orders: this.calculateOrderMetrics(orders),
      products: this.calculateProductMetrics(orders),
      customers: this.calculateCustomerMetrics(orders),
      performance: this.calculatePerformanceMetrics(orders),
      updatedAt: new Date()
    };

    // Store aggregated metrics
    await firestore
      .collection('business_metrics')
      .doc(`${businessId}_${metrics.date}`)
      .set(metrics);

    return metrics;
  }

  static calculateOrderMetrics(orders) {
    const completed = orders.filter(o => o.status === 'delivered');
    const cancelled = orders.filter(o => o.status === 'cancelled');

    return {
      total: orders.length,
      completed: completed.length,
      cancelled: cancelled.length,
      averageValue: completed.reduce((sum, o) => sum + o.pricing.total.amount, 0) / completed.length,
      revenue: completed.reduce((sum, o) => sum + o.pricing.total.amount, 0)
    };
  }

  static calculateProductMetrics(orders) {
    const productSales = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }

        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.subtotal.amount;
      });
    });

    const topSelling = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalActive: Object.keys(productSales).length,
      topSelling
    };
  }
}
```

## Indexing Strategy

### Firestore Composite Indexes

```javascript
// firestore.indexes.json
{
  "indexes": [
    // User queries
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "roles.role", "order": "ASCENDING" },
        { "fieldPath": "activeRole", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" }
      ]
    },

    // Business queries
    {
      "collectionGroup": "businesses",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "operationalStatus", "order": "ASCENDING" },
        { "fieldPath": "rating.average", "order": "DESCENDING" }
      ]
    },

    // Location-based business search
    {
      "collectionGroup": "businesses",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "deliverySettings.deliveryZones.coordinates", "order": "ASCENDING" },
        { "fieldPath": "operationalStatus", "order": "ASCENDING" },
        { "fieldPath": "acceptingOrders", "order": "ASCENDING" }
      ]
    },

    // Product queries
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "branchId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "availability.isAvailable", "order": "ASCENDING" }
      ]
    },

    // Product search and filtering
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "price.amount", "order": "ASCENDING" },
        { "fieldPath": "metrics.averageRating", "order": "DESCENDING" }
      ]
    },

    // Order queries for business
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },

    // Order queries for customer
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "customerId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },

    // Order queries for delivery driver
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "deliveryDriverId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "deliveryInfo.estimatedDeliveryTime", "order": "ASCENDING" }
      ]
    },

    // User business roles
    {
      "collectionGroup": "user_business_roles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" }
      ]
    },

    // Branch queries
    {
      "collectionGroup": "branches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "operationalStatus", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" }
      ]
    }
  ],

  "fieldOverrides": [
    // Enable array-contains queries on user roles
    {
      "collectionGroup": "users",
      "fieldPath": "roles.role",
      "indexes": [
        { "order": "ASCENDING", "queryScope": "COLLECTION" },
        { "arrayConfig": "CONTAINS", "queryScope": "COLLECTION" }
      ]
    },

    // Enable full-text search on product names
    {
      "collectionGroup": "products",
      "fieldPath": "searchKeywords",
      "indexes": [
        { "arrayConfig": "CONTAINS", "queryScope": "COLLECTION" }
      ]
    }
  ]
}
```

## Query Optimization Patterns

### Efficient Query Patterns

```javascript
// services/optimized-queries.js
export class OptimizedQueries {
  // Efficient business discovery with location
  static async findNearbyBusinesses({
    latitude,
    longitude,
    radius = 10,
    category = null,
    limit = 20
  }) {
    // Use geohash for initial filtering
    const geohashes = geokit.geohashQueries(
      { latitude, longitude },
      radius * 1000 // Convert km to meters
    );

    const queries = geohashes.map(geohash => {
      let query = firestore
        .collection('businesses')
        .where('operationalStatus', '==', 'active')
        .where('acceptingOrders', '==', true)
        .where('geohash', '>=', geohash.startValue)
        .where('geohash', '<', geohash.endValue);

      if (category) {
        query = query.where('category', '==', category);
      }

      return query.limit(Math.ceil(limit / geohashes.length)).get();
    });

    const snapshots = await Promise.all(queries);

    // Combine results and remove duplicates
    const businesses = new Map();
    snapshots.forEach(snapshot => {
      snapshot.docs.forEach(doc => {
        businesses.set(doc.id, { id: doc.id, ...doc.data() });
      });
    });

    // Calculate actual distance and sort
    return Array.from(businesses.values())
      .map(business => ({
        ...business,
        distance: geokit.distanceBetween(
          { latitude, longitude },
          business.coordinates
        )
      }))
      .filter(business => business.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
  }

  // Efficient product search with filters
  static async searchProducts({
    businessId,
    branchId = null,
    query = '',
    category = null,
    minPrice = null,
    maxPrice = null,
    sortBy = 'relevance',
    limit = 20,
    cursor = null
  }) {
    let firestoreQuery = firestore
      .collection('products')
      .where('businessId', '==', businessId)
      .where('status', '==', 'active')
      .where('availability.isAvailable', '==', true);

    // Add branch filter if specified
    if (branchId) {
      firestoreQuery = firestoreQuery.where('branchId', '==', branchId);
    }

    // Add category filter
    if (category) {
      firestoreQuery = firestoreQuery.where('category', '==', category);
    }

    // Add price range filters
    if (minPrice !== null) {
      firestoreQuery = firestoreQuery.where('price.amount', '>=', minPrice);
    }
    if (maxPrice !== null) {
      firestoreQuery = firestoreQuery.where('price.amount', '<=', maxPrice);
    }

    // Add sorting
    switch (sortBy) {
      case 'price_low':
        firestoreQuery = firestoreQuery.orderBy('price.amount', 'asc');
        break;
      case 'price_high':
        firestoreQuery = firestoreQuery.orderBy('price.amount', 'desc');
        break;
      case 'rating':
        firestoreQuery = firestoreQuery.orderBy('metrics.averageRating', 'desc');
        break;
      case 'popularity':
        firestoreQuery = firestoreQuery.orderBy('metrics.totalOrders', 'desc');
        break;
      default:
        firestoreQuery = firestoreQuery.orderBy('featured', 'desc')
                                     .orderBy('createdAt', 'desc');
    }

    // Add pagination
    if (cursor) {
      firestoreQuery = firestoreQuery.startAfter(cursor);
    }

    firestoreQuery = firestoreQuery.limit(limit);

    const snapshot = await firestoreQuery.get();
    let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Client-side text search if query provided
    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(' ');
      products = products.filter(product => {
        const searchText = `${product.name} ${product.description} ${product.tags?.join(' ')}`.toLowerCase();
        return searchTerms.every(term => searchText.includes(term));
      });
    }

    return {
      products,
      nextCursor: snapshot.docs.length === limit ? snapshot.docs[snapshot.docs.length - 1] : null,
      hasMore: snapshot.docs.length === limit
    };
  }
}
```

Estas estrategias de datos aseguran que el sistema sea eficiente, escalable y mantenga costos optimizados mientras proporciona una excelente experiencia de usuario.