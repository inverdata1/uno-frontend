# 06 - Arquitectura Base de Datos

## Overview de la Arquitectura de Datos

> ⚠️ **NOTA IMPORTANTE**: Este documento describe la arquitectura legacy con Firebase Firestore.
>
> **Nueva arquitectura**: Ver **[09 - Sistema de Modos de Usuario](./09-sistema-modos-usuario.md)** para el diseño actualizado con base de datos relacional y sistema de modos de usuario.

La arquitectura actual utiliza **Firebase Firestore** como base de datos principal, pero está siendo migrada a un sistema relacional con soporte para múltiples modos de usuario, escalabilidad horizontal y consultas eficientes.

### Principios de Diseño

```javascript
┌─────────────────────────────────────────────────────────────┐
│                  FIRESTORE ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │    Users    │ │ Businesses  │ │   Orders    │           │
│  │             │ │             │ │             │           │
│  │ • Multi-    │ │ • Multi-    │ │ • Context   │           │
│  │   Role      │ │   Branch    │ │   Aware     │           │
│  │ • Context   │ │ • Staff     │ │ • Real-time │           │
│  │ • Settings  │ │ • Analytics │ │ • Status    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                             │                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Products   │ │   Branches  │ │ UserBusiness│           │
│  │             │ │             │ │    Roles    │           │
│  │ • Branch    │ │ • Location  │ │ • Multi-    │           │
│  │   Specific  │ │ • Settings  │ │   Business  │           │
│  │ • Inventory │ │ • Staff     │ │ • Context   │           │
│  │ • Pricing   │ │ • Hours     │ │ • Perms     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Schema Definitions

### 1. Users Collection

```javascript
// Collection: users
// Document ID: userId (Firebase Auth UID)
const userSchema = {
  // Basic identity
  id: string,                    // Firebase Auth UID
  email: string,                 // Primary email
  emailVerified: boolean,
  phone: string,                 // Venezuelan format: +58XXXXXXXXXX
  phoneVerified: boolean,

  // Profile information
  firstName: string,
  lastName: string,
  profileImage: string,          // Firebase Storage URL
  dateOfBirth: timestamp,
  gender: enum('male', 'female', 'other', 'prefer_not_to_say'),

  // Multi-role system
  roles: [                       // Array of available roles
    {
      role: enum('client', 'business_owner', 'delivery_driver'),
      isActive: boolean,
      grantedAt: timestamp,
      grantedBy: string          // userId who granted the role
    }
  ],

  // Current context
  activeRole: enum('client', 'business', 'delivery'),
  lastRoleSwitch: timestamp,

  // Client-specific data
  clientData: {
    preferences: {
      cuisineTypes: [string],    // ['italian', 'chinese', 'venezuelan']
      dietaryRestrictions: [string],
      priceRange: enum('$', '$$', '$$$'),
      defaultPaymentMethod: string
    },
    addresses: [
      {
        id: string,
        type: enum('home', 'work', 'other'),
        isDefault: boolean,
        label: string,           // "Casa", "Oficina", etc.
        fullAddress: string,
        coordinates: {
          latitude: number,
          longitude: number
        },
        deliveryInstructions: string,
        isActive: boolean
      }
    ],
    favoriteBusinesses: [string], // businessIds
    orderStats: {
      totalOrders: number,
      totalSpent: number,
      averageRating: number,
      favoriteCategories: [string]
    }
  },

  // Account settings
  settings: {
    notifications: {
      orderUpdates: boolean,
      promotions: boolean,
      marketing: boolean,
      push: boolean,
      sms: boolean,
      email: boolean
    },
    privacy: {
      shareLocation: boolean,
      shareOrderHistory: boolean,
      allowBusinessContact: boolean
    },
    language: enum('es', 'en'),
    currency: enum('USD', 'VES'),
    theme: enum('light', 'dark', 'system')
  },

  // Metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLoginAt: timestamp,
  isActive: boolean,
  verificationStatus: enum('pending', 'verified', 'rejected'),

  // Platform info
  signupSource: enum('mobile_app', 'web', 'referral'),
  deviceInfo: {
    platform: enum('ios', 'android'),
    appVersion: string,
    deviceId: string
  }
};

// Indexes needed:
// - email (automatic)
// - phone
// - roles.role
// - activeRole
// - clientData.addresses.coordinates (geohash)
```

### 2. Businesses Collection

```javascript
// Collection: businesses
// Document ID: auto-generated
const businessSchema = {
  id: string,                    // Auto-generated document ID
  ownerId: string,               // User ID of the business owner

  // Basic information
  name: string,
  description: string,
  logo: string,                  // Firebase Storage URL
  coverImage: string,

  // Business classification
  category: enum('restaurant', 'pharmacy', 'grocery', 'retail', 'services'),
  cuisineTypes: [string],        // For restaurants
  tags: [string],               // ['fast_food', 'healthy', 'family_friendly']

  // Contact information
  email: string,
  phone: string,
  website: string,
  socialMedia: {
    instagram: string,
    facebook: string,
    twitter: string
  },

  // Business verification
  verificationStatus: enum('pending', 'verified', 'rejected', 'suspended'),
  verificationDocuments: [
    {
      type: enum('rif', 'commercial_permit', 'health_permit'),
      url: string,
      uploadedAt: timestamp,
      verifiedAt: timestamp
    }
  ],

  // Operational settings
  operationalStatus: enum('active', 'inactive', 'maintenance'),
  acceptingOrders: boolean,
  minimumOrderValue: number,
  maxDeliveryDistance: number,   // in kilometers
  averagePreparationTime: number, // in minutes

  // Delivery settings
  deliverySettings: {
    providesDelivery: boolean,
    hasOwnDelivery: boolean,     // Own delivery team vs platform delivery
    deliveryFee: {
      type: enum('fixed', 'distance_based', 'order_percentage'),
      value: number,
      freeDeliveryMinimum: number
    },
    deliveryZones: [
      {
        name: string,            // "Zona Centro"
        coordinates: [           // Polygon coordinates
          {
            latitude: number,
            longitude: number
          }
        ],
        deliveryFee: number,
        estimatedTime: number    // minutes
      }
    ]
  },

  // Rating and reviews
  rating: {
    average: number,            // 0.0 to 5.0
    totalReviews: number,
    breakdown: {
      5: number,               // Count of 5-star reviews
      4: number,
      3: number,
      2: number,
      1: number
    }
  },

  // Business hours
  operatingHours: {
    monday: { open: string, close: string, isClosed: boolean },
    tuesday: { open: string, close: string, isClosed: boolean },
    wednesday: { open: string, close: string, isClosed: boolean },
    thursday: { open: string, close: string, isClosed: boolean },
    friday: { open: string, close: string, isClosed: boolean },
    saturday: { open: string, close: string, isClosed: boolean },
    sunday: { open: string, close: string, isClosed: boolean },
    specialHours: [            // Holidays, special events
      {
        date: timestamp,
        open: string,
        close: string,
        reason: string
      }
    ]
  },

  // Analytics and performance
  businessMetrics: {
    totalOrders: number,
    totalRevenue: number,
    averageOrderValue: number,
    customerRetentionRate: number,
    averageResponseTime: number, // minutes to accept order
    fulfillmentRate: number      // % of orders completed successfully
  },

  // Payment settings
  paymentSettings: {
    acceptedMethods: [enum('cash', 'card', 'digital_wallet', 'bank_transfer')],
    stripeAccountId: string,     // For card payments
    bankAccount: {
      bank: string,
      accountNumber: string,
      accountType: enum('checking', 'savings')
    },
    payoutSchedule: enum('daily', 'weekly', 'monthly'),
    taxId: string               // RIF in Venezuela
  },

  // Subscription and plan
  subscriptionPlan: enum('free', 'basic', 'premium', 'enterprise'),
  planStartDate: timestamp,
  planEndDate: timestamp,
  planFeatures: [string],       // Features available in current plan

  // Metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  lastActiveAt: timestamp,
  createdBy: string,           // userId who created the business

  // Multi-branch support flag
  isMultiBranch: boolean,
  defaultBranchId: string      // For single-branch businesses
};

// Indexes needed:
// - ownerId
// - category
// - verificationStatus
// - operationalStatus
// - deliverySettings.deliveryZones.coordinates (geohash for location queries)
// - rating.average
// - subscriptionPlan
```

### 3. Branches Collection

```javascript
// Collection: branches
// Document ID: auto-generated
const branchSchema = {
  id: string,                   // Auto-generated document ID
  businessId: string,           // Reference to parent business

  // Branch identity
  name: string,                 // "Sucursal Centro", "Mall Las Américas"
  code: string,                 // "CC01", "MLA02" - internal reference

  // Location
  address: {
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
    fullAddress: string,        // Formatted address
    coordinates: {
      latitude: number,
      longitude: number
    },
    googlePlaceId: string       // For address validation
  },

  // Branch-specific contact
  phone: string,
  email: string,
  managerName: string,
  managerPhone: string,

  // Operational settings (can override business settings)
  operationalStatus: enum('active', 'inactive', 'maintenance', 'temporarily_closed'),
  acceptingOrders: boolean,

  // Branch-specific hours (overrides business hours if set)
  operatingHours: {
    // Same structure as business operating hours
    inheritsFromBusiness: boolean,
    customHours: {
      // Same structure as business operatingHours
    }
  },

  // Branch-specific delivery settings
  deliverySettings: {
    inheritsFromBusiness: boolean,
    customSettings: {
      // Same structure as business deliverySettings
      maxDeliveryDistance: number,
      deliveryFee: number,
      hasOwnDelivery: boolean
    }
  },

  // Staff management
  staff: [
    {
      userId: string,
      role: enum('manager', 'cashier', 'cook', 'delivery'),
      permissions: [string],
      startDate: timestamp,
      isActive: boolean
    }
  ],

  // Branch analytics
  branchMetrics: {
    totalOrders: number,
    totalRevenue: number,
    averageOrderValue: number,
    peakHours: [              // Busiest hours
      {
        hour: number,         // 0-23
        orderCount: number
      }
    ],
    popularItems: [           // Most ordered products
      {
        productId: string,
        orderCount: number,
        revenue: number
      }
    ]
  },

  // Inventory management
  inventoryMode: enum('shared', 'independent'), // Shared with other branches or independent
  lowStockAlerts: boolean,
  stockSyncEnabled: boolean,   // Sync inventory with other branches

  // Equipment and resources
  facilities: {
    hasParking: boolean,
    isAccessible: boolean,     // Wheelchair accessible
    hasDineIn: boolean,
    hasWifi: boolean,
    capacity: number           // For dine-in establishments
  },

  // Metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: string,           // userId who created the branch
  isActive: boolean,

  // Default branch flag
  isDefault: boolean           // For businesses with multiple branches
};

// Indexes needed:
// - businessId
// - operationalStatus
// - address.coordinates (geohash for location queries)
// - staff.userId
// - isActive
// - isDefault
```

### 4. UserBusinessRoles Collection

```javascript
// Collection: user_business_roles
// Document ID: auto-generated
const userBusinessRoleSchema = {
  id: string,                   // Auto-generated
  userId: string,               // User who has the role
  businessId: string,           // Business where user has role
  branchId: string,             // Specific branch (null for business-wide role)

  // Role information
  role: enum('owner', 'admin', 'manager', 'staff', 'cashier', 'cook'),
  permissions: [string],        // Specific permissions for this role

  // Role metadata
  grantedBy: string,           // userId who granted this role
  grantedAt: timestamp,
  isActive: boolean,

  // Role restrictions
  restrictions: {
    maxOrderValue: number,      // Maximum order value they can handle
    allowedHours: {            // Hours when user can access system
      start: string,           // "09:00"
      end: string              // "18:00"
    },
    allowedDays: [enum('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')],
    ipWhitelist: [string]      // Allowed IP addresses
  },

  // Performance tracking
  performance: {
    ordersHandled: number,
    averageResponseTime: number, // minutes
    customerRating: number,     // 1-5 stars from customers
    lastActiveAt: timestamp
  },

  // Employment details (for staff roles)
  employment: {
    startDate: timestamp,
    endDate: timestamp,         // null if still active
    employmentType: enum('full_time', 'part_time', 'contractor'),
    salary: {
      amount: number,
      currency: enum('USD', 'VES'),
      paymentFrequency: enum('hourly', 'daily', 'weekly', 'monthly')
    },
    benefits: [string]          // ['health_insurance', 'meal_allowance']
  },

  // Audit trail
  statusHistory: [
    {
      status: enum('active', 'inactive', 'suspended'),
      changedBy: string,
      changedAt: timestamp,
      reason: string
    }
  ],

  // Metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  revokedAt: timestamp,        // When role was revoked
  revokedBy: string           // Who revoked the role
};

// Indexes needed:
// - userId
// - businessId
// - branchId
// - role
// - isActive
// - grantedAt
// Compound indexes:
// - userId, businessId
// - businessId, role
// - userId, isActive
```

### 5. Products Collection

```javascript
// Collection: products
// Document ID: auto-generated
const productSchema = {
  id: string,                   // Auto-generated
  businessId: string,           // Owner business
  branchId: string,             // Specific branch (null for all branches)

  // Product identity
  name: string,
  description: string,
  images: [string],             // Firebase Storage URLs
  category: string,
  subcategory: string,

  // Pricing
  price: {
    amount: number,
    currency: enum('USD', 'VES'),
    originalPrice: number,      // For showing discounts
    hasDiscount: boolean,
    discountPercentage: number
  },

  // Product details
  specifications: {
    ingredients: [string],      // For food items
    allergens: [string],       // ['nuts', 'gluten', 'dairy']
    nutritionalInfo: {
      calories: number,
      protein: number,
      carbs: number,
      fat: number,
      servingSize: string
    },
    preparationTime: number,    // minutes
    weight: number,            // grams
    dimensions: {
      length: number,
      width: number,
      height: number
    }
  },

  // Availability
  availability: {
    isAvailable: boolean,
    availableQuantity: number,  // null for unlimited
    lowStockThreshold: number,
    outOfStock: boolean,
    availableDays: [enum('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')],
    availableHours: {
      start: string,           // "09:00"
      end: string              // "18:00"
    }
  },

  // Customization options
  customizations: [
    {
      id: string,
      name: string,            // "Tamaño", "Extras"
      type: enum('single_choice', 'multiple_choice', 'text_input'),
      required: boolean,
      options: [
        {
          id: string,
          name: string,        // "Pequeño", "Mediano", "Grande"
          priceModifier: number, // +/- price adjustment
          isAvailable: boolean
        }
      ]
    }
  ],

  // Product metrics
  metrics: {
    totalOrders: number,
    totalRevenue: number,
    averageRating: number,
    totalRatings: number,
    viewCount: number,          // How many times viewed
    addToCartCount: number,     // Conversion tracking
    popularTimes: [            // When product is most ordered
      {
        hour: number,          // 0-23
        orderCount: number
      }
    ]
  },

  // SEO and discovery
  tags: [string],              // ['spicy', 'vegetarian', 'gluten-free']
  searchKeywords: [string],    // For search optimization
  featured: boolean,           // Promoted product
  seasonal: boolean,          // Seasonal availability

  // Status and moderation
  status: enum('active', 'inactive', 'pending_review', 'rejected'),
  moderationFlags: [
    {
      reason: string,
      flaggedBy: string,
      flaggedAt: timestamp,
      resolved: boolean
    }
  ],

  // Inventory (branch-specific)
  inventory: {
    trackInventory: boolean,
    currentStock: number,
    reservedStock: number,     // Stock reserved for pending orders
    reorderPoint: number,      // When to reorder
    maxStock: number,
    lastRestocked: timestamp,
    supplier: string,
    costPrice: number          // For profit calculations
  },

  // Metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: string,           // userId who created product
  lastModifiedBy: string,
  version: number             // For product versioning
};

// Indexes needed:
// - businessId
// - branchId
// - category
// - status
// - availability.isAvailable
// - featured
// - price.amount
// - metrics.averageRating
// Compound indexes:
// - businessId, category
// - businessId, status
// - businessId, branchId, status
// - category, price.amount
// Text search index on: name, description, tags
```

### 6. Orders Collection

```javascript
// Collection: orders
// Document ID: auto-generated
const orderSchema = {
  id: string,                   // Auto-generated
  orderNumber: string,          // Human-readable: "UNO-2024-001234"

  // Order parties
  customerId: string,           // User who placed the order
  businessId: string,           // Business fulfilling the order
  branchId: string,            // Specific branch
  deliveryDriverId: string,     // Assigned delivery driver (null for pickup)

  // Order status
  status: enum('placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'),
  paymentStatus: enum('pending', 'paid', 'failed', 'refunded'),
  fulfillmentType: enum('delivery', 'pickup'),

  // Order items
  items: [
    {
      productId: string,
      name: string,             // Product name at time of order
      quantity: number,
      unitPrice: {
        amount: number,
        currency: enum('USD', 'VES')
      },
      customizations: [         // Selected customizations
        {
          name: string,         // "Tamaño"
          value: string,        // "Grande"
          priceModifier: number
        }
      ],
      specialInstructions: string,
      subtotal: {
        amount: number,
        currency: enum('USD', 'VES')
      }
    }
  ],

  // Order totals
  pricing: {
    subtotal: {
      amount: number,
      currency: enum('USD', 'VES')
    },
    taxes: {
      amount: number,
      currency: enum('USD', 'VES'),
      rate: number             // Tax rate applied
    },
    deliveryFee: {
      amount: number,
      currency: enum('USD', 'VES')
    },
    serviceFee: {
      amount: number,
      currency: enum('USD', 'VES')
    },
    discount: {
      amount: number,
      currency: enum('USD', 'VES'),
      code: string,            // Promo code used
      type: enum('percentage', 'fixed_amount')
    },
    total: {
      amount: number,
      currency: enum('USD', 'VES')
    }
  },

  // Delivery information
  deliveryInfo: {
    address: {
      street: string,
      city: string,
      state: string,
      zipCode: string,
      coordinates: {
        latitude: number,
        longitude: number
      },
      deliveryInstructions: string
    },
    estimatedDeliveryTime: timestamp,
    actualDeliveryTime: timestamp,
    deliveryWindow: {
      start: timestamp,
      end: timestamp
    },
    contactInfo: {
      name: string,
      phone: string
    }
  },

  // Payment information
  payment: {
    method: enum('cash', 'card', 'digital_wallet', 'bank_transfer'),
    transactionId: string,     // External payment reference
    cardInfo: {               // For card payments (encrypted)
      lastFourDigits: string,
      cardType: string,        // 'visa', 'mastercard', etc.
      expiryMonth: string,
      expiryYear: string
    },
    cashAmount: number,       // For cash payments
    changeRequired: number,   // Change to give back
    tip: {
      amount: number,
      currency: enum('USD', 'VES')
    },
    paymentTimestamp: timestamp,
    refundAmount: {
      amount: number,
      currency: enum('USD', 'VES')
    },
    refundReason: string
  },

  // Time tracking
  timeline: [
    {
      status: string,
      timestamp: timestamp,
      note: string,            // Optional note about status change
      updatedBy: string        // userId who updated status
    }
  ],

  // Order rating and feedback
  rating: {
    overall: number,          // 1-5 stars
    food: number,
    delivery: number,
    service: number,
    comment: string,
    ratedAt: timestamp
  },

  // Special flags and notes
  flags: {
    isUrgent: boolean,
    hasSpecialRequests: boolean,
    isRepeatOrder: boolean,    // Customer has ordered same items before
    isFirstOrder: boolean,     // Customer's first order from this business
    requiresVerification: boolean // Age verification, etc.
  },

  notes: {
    customerNotes: string,     // Notes from customer
    businessNotes: string,     // Internal business notes
    deliveryNotes: string      // Delivery driver notes
  },

  // Metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  estimatedCompletionTime: timestamp,
  actualCompletionTime: timestamp,

  // Analytics data
  analytics: {
    source: enum('mobile_app', 'web', 'phone'), // Order source
    deviceType: enum('ios', 'android', 'web'),
    promotionUsed: string,     // Promotion code used
    referralSource: string,    // How customer found business
    orderValue: number,        // For business analytics
    preparationTime: number,   // Actual time taken to prepare (minutes)
    deliveryTime: number      // Actual delivery time (minutes)
  }
};

// Indexes needed:
// - customerId
// - businessId
// - branchId
// - deliveryDriverId
// - status
// - paymentStatus
// - createdAt (for time-based queries)
// - deliveryInfo.estimatedDeliveryTime
// Compound indexes:
// - customerId, status
// - businessId, status
// - businessId, createdAt
// - deliveryDriverId, status
// - status, createdAt
```

## Data Relationships y Query Patterns

### Relational Queries Examples

```javascript
// Get user's complete profile with role information
const getUserProfile = async (userId) => {
  // Get base user data
  const userDoc = await firestore.collection('users').doc(userId).get();
  const userData = userDoc.data();

  // Get business roles
  const businessRoles = await firestore
    .collection('user_business_roles')
    .where('userId', '==', userId)
    .where('isActive', '==', true)
    .get();

  // Get owned businesses
  const ownedBusinesses = await firestore
    .collection('businesses')
    .where('ownerId', '==', userId)
    .get();

  return {
    ...userData,
    businessRoles: businessRoles.docs.map(doc => doc.data()),
    ownedBusinesses: ownedBusinesses.docs.map(doc => doc.data())
  };
};

// Get business with all branches and staff
const getBusinessComplete = async (businessId) => {
  // Get business data
  const businessDoc = await firestore.collection('businesses').doc(businessId).get();
  const businessData = businessDoc.data();

  // Get branches
  const branches = await firestore
    .collection('branches')
    .where('businessId', '==', businessId)
    .where('isActive', '==', true)
    .get();

  // Get staff roles
  const staffRoles = await firestore
    .collection('user_business_roles')
    .where('businessId', '==', businessId)
    .where('isActive', '==', true)
    .get();

  return {
    ...businessData,
    branches: branches.docs.map(doc => doc.data()),
    staff: staffRoles.docs.map(doc => doc.data())
  };
};
```

### Real-time Listeners

```javascript
// Real-time order updates for business
const listenToBusinessOrders = (businessId, callback) => {
  return firestore
    .collection('orders')
    .where('businessId', '==', businessId)
    .where('status', 'in', ['placed', 'confirmed', 'preparing'])
    .orderBy('createdAt', 'desc')
    .onSnapshot(callback);
};

// Real-time role changes for user
const listenToUserRoleChanges = (userId, callback) => {
  return firestore
    .collection('user_business_roles')
    .where('userId', '==', userId)
    .onSnapshot(callback);
};
```

Esta arquitectura de base de datos proporciona la flexibilidad necesaria para el sistema multi-roles, manteniendo la performance y escalabilidad.