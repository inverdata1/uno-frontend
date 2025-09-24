# UNO Delivery MVP Strategy - Build Fast, Scale Smart

## Current State Analysis

**✅ What You Have:**
- Basic auth screens (login/register) with TanStack Form + Zod validation
- Auth store structure (but no Firebase implementation yet)
- App store with onboarding and preferences
- UI component system working
- Basic app routing structure

**❌ What's Missing:**
- Actual Firebase auth implementation
- Role-based system
- Dynamic UI switching
- Real data/backend
- Core app functionality

## Progressive Build Strategy

### Phase 1: Core Auth Foundation (Week 1)
**Goal: Get authentication working + basic role switching**

#### 1.1 Complete Firebase Auth Implementation

```javascript
// shared/services/firebase.js - Create this
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your config
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
```

```javascript
// shared/services/auth-service.js - Create this
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from './firebase';

export const authService = {
  async signUp({ firstName, lastName, email, phone, password }) {
    // Create Firebase auth user
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // Create user document - START SIMPLE
    await setDoc(doc(firestore, 'users', user.uid), {
      firstName,
      lastName,
      email,
      phone,
      roles: ['client'], // Everyone starts as client
      activeRole: 'client',
      createdAt: new Date(),
    });

    return user;
  },

  async signIn({ email, password }) {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  },

  async signOut() {
    await signOut(auth);
  }
};
```

#### 1.2 Create Simple Role Store

```javascript
// shared/stores/role-store.js - Create this SIMPLE
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useRoleStore = create(
  persist(
    (set, get) => ({
      // Start with just these two roles
      activeRole: 'client', // 'client' | 'business'
      availableRoles: ['client'], // User's available roles

      // Simple role switching
      switchRole: (role) => {
        if (get().availableRoles.includes(role)) {
          set({ activeRole: role });
        }
      },

      // Add business role when user creates business
      addBusinessRole: () => {
        const current = get().availableRoles;
        if (!current.includes('business')) {
          set({ availableRoles: [...current, 'business'] });
        }
      },

      // Check if user has role
      hasRole: (role) => get().availableRoles.includes(role),
    }),
    { name: 'uno-role-store' }
  )
);
```

#### 1.3 Connect Auth Forms to Firebase

```javascript
// Update app/(auth)/login.jsx - just add this to onSubmit
onSubmit: async ({ value }) => {
  try {
    await authService.signIn(value);
    router.replace('/(main)');
  } catch (error) {
    console.error('Login error:', error);
    // Show error message
  }
},

// Update app/(auth)/register.jsx - just add this to onSubmit
onSubmit: async ({ value }) => {
  try {
    await authService.signUp(value);
    router.replace('/(main)');
  } catch (error) {
    console.error('Register error:', error);
    // Show error message
  }
},
```

**Week 1 Deliverable: Working login/register with Firebase**

---

### Phase 2: Basic Multi-Role UI (Week 2)
**Goal: App changes completely based on role**

#### 2.1 Create Role-Based Layouts

```javascript
// app/(main)/_layout.jsx - Update this
import { useRoleStore } from '../../shared/stores/role-store';

export default function MainLayout() {
  const { activeRole } = useRoleStore();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {activeRole === 'client' && (
        <>
          <Stack.Screen name="client-home" options={{ href: '/client-home' }} />
          <Stack.Screen name="client-search" options={{ href: '/client-search' }} />
          <Stack.Screen name="client-orders" options={{ href: '/client-orders' }} />
        </>
      )}

      {activeRole === 'business' && (
        <>
          <Stack.Screen name="business-dashboard" options={{ href: '/business-dashboard' }} />
          <Stack.Screen name="business-orders" options={{ href: '/business-orders' }} />
          <Stack.Screen name="business-products" options={{ href: '/business-products' }} />
        </>
      )}

      <Stack.Screen name="role-switcher" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
```

#### 2.2 Create Role Switcher Component

```javascript
// shared/components/role-switcher.jsx - Create this
import { useState } from 'react';
import { View, Modal } from 'react-native';
import { Button, Text, Card } from './ui';
import { useRoleStore } from '../stores/role-store';

export const RoleSwitcher = ({ visible, onClose }) => {
  const { activeRole, availableRoles, switchRole } = useRoleStore();

  const handleRoleSwitch = (role) => {
    switchRole(role);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 p-6 bg-background">
        <View className="flex-row justify-between items-center mb-6">
          <Text variant="heading">Cambiar Modo</Text>
          <Button variant="ghost" onPress={onClose}>✕</Button>
        </View>

        {availableRoles.includes('client') && (
          <Card className={`mb-4 ${activeRole === 'client' ? 'border-primary-500' : ''}`}>
            <Button
              variant={activeRole === 'client' ? 'primary' : 'ghost'}
              onPress={() => handleRoleSwitch('client')}
            >
              🛍️ Modo Cliente
            </Button>
            <Text variant="caption" className="mt-2">
              Explorar y hacer pedidos
            </Text>
          </Card>
        )}

        {availableRoles.includes('business') && (
          <Card className={`mb-4 ${activeRole === 'business' ? 'border-primary-500' : ''}`}>
            <Button
              variant={activeRole === 'business' ? 'primary' : 'ghost'}
              onPress={() => handleRoleSwitch('business')}
            >
              🏪 Modo Negocio
            </Button>
            <Text variant="caption" className="mt-2">
              Administrar restaurante
            </Text>
          </Card>
        )}

        {/* Add business option if user only has client */}
        {!availableRoles.includes('business') && (
          <Card className="mb-4">
            <Button
              variant="outline"
              onPress={() => {
                // Navigate to business registration
                onClose();
                router.push('/business-register');
              }}
            >
              ➕ Crear Negocio
            </Button>
          </Card>
        )}
      </View>
    </Modal>
  );
};
```

#### 2.3 Create Simple Client & Business Screens

```javascript
// app/(main)/client-home.jsx - Create this
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button } from '../../shared/components/ui';
import { useState } from 'react';
import { RoleSwitcher } from '../../shared/components/role-switcher';

export default function ClientHome() {
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  return (
    <View className="flex-1 bg-background">
      {/* Header with role switcher */}
      <View className="bg-primary-500 px-4 py-6 safe-area-top">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-xl font-bold">🛍️ UNO Cliente</Text>
          <TouchableOpacity onPress={() => setShowRoleSwitcher(true)}>
            <Text className="text-white">⚡ Cambiar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <Card className="mb-4">
          <Text variant="heading">Explora Restaurantes</Text>
          <Text variant="body" className="mt-2 mb-4">
            Descubre comida deliciosa cerca de ti
          </Text>
          <Button variant="primary">Ver Restaurantes</Button>
        </Card>

        <Card className="mb-4">
          <Text variant="heading">Tus Pedidos</Text>
          <Text variant="body" className="mt-2">
            No tienes pedidos recientes
          </Text>
        </Card>
      </ScrollView>

      <RoleSwitcher
        visible={showRoleSwitcher}
        onClose={() => setShowRoleSwitcher(false)}
      />
    </View>
  );
}

// app/(main)/business-dashboard.jsx - Create this
export default function BusinessDashboard() {
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-blue-600 px-4 py-6 safe-area-top">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-xl font-bold">🏪 Mi Negocio</Text>
          <TouchableOpacity onPress={() => setShowRoleSwitcher(true)}>
            <Text className="text-white">⚡ Cambiar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <Card className="mb-4">
          <Text variant="heading">Pedidos de Hoy</Text>
          <Text variant="body" className="mt-2">
            No hay pedidos nuevos
          </Text>
        </Card>

        <Card className="mb-4">
          <Text variant="heading">Mis Productos</Text>
          <Text variant="body" className="mt-2 mb-4">
            Gestiona tu menú
          </Text>
          <Button variant="primary">Ver Productos</Button>
        </Card>
      </ScrollView>

      <RoleSwitcher
        visible={showRoleSwitcher}
        onClose={() => setShowRoleSwitcher(false)}
      />
    </View>
  );
}
```

**Week 2 Deliverable: App transforms completely between client/business modes**

---

### Phase 3: Real Functionality (Week 3-4)
**Goal: Actually useful features**

#### 3.1 Simple Database Schema - Start Small

```javascript
// Database Collections (Firebase Firestore)

// users collection
{
  id: "user123",
  firstName: "Juan",
  lastName: "Pérez",
  email: "juan@email.com",
  phone: "04121234567",
  roles: ["client", "business"], // Simple array
  activeRole: "client",
  createdAt: timestamp
}

// businesses collection (only if user has business role)
{
  id: "business123",
  ownerId: "user123",
  name: "Pizza Express",
  description: "Las mejores pizzas",
  category: "restaurant",
  isActive: true,
  createdAt: timestamp,
  // Start with embedded products - don't overcomplicate
  products: [
    {
      id: "prod1",
      name: "Pizza Margarita",
      price: 15,
      description: "Tomate y queso",
      isAvailable: true
    }
  ]
}

// orders collection
{
  id: "order123",
  customerId: "user123",
  businessId: "business123",
  items: [
    { productId: "prod1", name: "Pizza Margarita", quantity: 1, price: 15 }
  ],
  total: 15,
  status: "pending", // pending, confirmed, delivered, cancelled
  createdAt: timestamp
}
```

#### 3.2 Basic Services

```javascript
// shared/services/business-service.js - Create this SIMPLE
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { firestore } from './firebase';

export const businessService = {
  // Create business and add business role to user
  async createBusiness(userId, businessData) {
    // Create business doc
    const businessRef = await addDoc(collection(firestore, 'businesses'), {
      ...businessData,
      ownerId: userId,
      isActive: true,
      createdAt: new Date(),
      products: [] // Start empty
    });

    // Update user to add business role
    await updateDoc(doc(firestore, 'users', userId), {
      roles: ['client', 'business']
    });

    return businessRef.id;
  },

  async getBusinessByOwner(userId) {
    // Simple query - one business per user for MVP
    const q = query(
      collection(firestore, 'businesses'),
      where('ownerId', '==', userId),
      limit(1)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs[0]?.data();
  }
};
```

#### 3.3 Working Features

**For Clients:**
- Browse mock businesses (hardcoded list)
- Place simple orders
- View order history

**For Business Owners:**
- Create business profile
- Add basic products
- View incoming orders
- Update order status

**Week 3-4 Deliverable: End-to-end order flow working**

---

## Implementation Priority

### This Week (Week 1):
1. ✅ Set up Firebase project
2. ✅ Implement authService
3. ✅ Connect login/register forms
4. ✅ Create basic role store
5. ✅ Test auth flow works

### Next Week (Week 2):
1. Create role-based layouts
2. Build simple client/business screens
3. Add role switcher component
4. Test UI switching works

### Week 3:
1. Add Firebase Firestore
2. Create basic services
3. Build business registration
4. Add product management

### Week 4:
1. Order creation flow
2. Order management
3. Basic real-time updates
4. Polish and testing

## What to Skip for MVP

**Don't build these yet:**
- Complex permission system
- Multi-business support
- Branch management
- Advanced caching
- Real-time WebSockets
- Payment processing
- Delivery role
- Analytics
- Complex validation
- File uploads

## Start-Small Database Approach

```javascript
// Instead of complex normalized schema, start with this:
// users collection - keep it simple
{
  id, email, firstName, lastName, phone,
  roles: ['client'] // or ['client', 'business']
  activeRole: 'client'
}

// If user creates business, add one document:
// businesses collection
{
  id, ownerId, name, description,
  products: [...] // embed products for now
}

// orders collection
{
  id, customerId, businessId, items, total, status
}
```

**Later you can:**
- Normalize products into separate collection
- Add complex permissions
- Add branches
- Add advanced features

## Success Metrics for MVP

**Week 1:** User can login/register ✅
**Week 2:** App shows different UI per role ✅
**Week 3:** User can create business & add products ✅
**Week 4:** End-to-end order placement works ✅

Then you have a working MVP that demonstrates the multi-role concept and can progressively add the advanced features from the comprehensive documentation.

Want to start with Week 1 Firebase setup?