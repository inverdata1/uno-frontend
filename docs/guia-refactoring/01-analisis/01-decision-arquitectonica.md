# Decisión Arquitectónica: App Unificada

## Decisión: Eliminar Dual Mode (Client/Business)

**Decisión**: Crear una sola app que permita cambio dinámico entre roles de cliente y business owner.

## Análisis de Opciones

### Opción A: Mantener Apps Separadas ❌
- **Pros**: Separación clara de concerns
- **Cons**: 95% código duplicado, mantenimiento doble, UX fragmentada

### Opción B: App Unificada con Role Switching ✅
- **Pros**: Código compartido, UX fluida, mantenimiento único
- **Cons**: Lógica de roles más compleja

## Justificación Técnica

### 1. **Eliminación de Duplicación**
```javascript
// Antes: Dos sets de navegación
// ClientNavigator.jsx + BusinessNavigator.jsx

// Después: Una navegación con role-based rendering
const AppNavigator = () => {
  const { userRole } = useAuth();
  
  return (
    <Stack.Navigator>
      <Stack.Screen name="home" component={HomeScreen} />
      {userRole === 'business' && (
        <Stack.Screen name="business-dashboard" component={BusinessDashboard} />
      )}
    </Stack.Navigator>
  );
};
```

### 2. **UX Fluida**
- Usuario puede cambiar de cliente a business owner sin re-login
- Historial de navegación se mantiene
- Transiciones suaves entre roles

### 3. **Feature Sharing Natural**
- Profile management compartido
- Sistema de notificaciones unificado
- Authentication flow único

## Implementación de Roles

### Role-Based Screen Access
```javascript
// shared/hooks/use-role-access.js
export const useRoleAccess = (requiredRole) => {
  const { userRole } = useAuth();
  return userRole === requiredRole;
};

// En componentes
const BusinessDashboard = () => {
  const hasAccess = useRoleAccess('business');
  
  if (!hasAccess) {
    return <Navigate to="/apply-for-business" />;
  }
  
  return <DashboardContent />;
};
```

### Dynamic Navigation
```javascript
// features/navigation/app-navigator.jsx
const getTabsForRole = (userRole) => {
  const baseTabs = [
    { name: 'home', component: HomeScreen },
    { name: 'orders', component: OrdersScreen },
    { name: 'profile', component: ProfileScreen },
  ];
  
  if (userRole === 'business') {
    return [
      ...baseTabs,
      { name: 'business-dashboard', component: BusinessDashboard },
      { name: 'manage-products', component: ProductManagement },
    ];
  }
  
  return baseTabs;
};
```

### Role Switching Flow
```javascript
// features/business/screens/business-application.jsx
const BusinessApplicationScreen = () => {
  const { user, updateUserRole } = useAuth();
  
  const handleApplicationSubmit = async (applicationData) => {
    await BusinessService.submitApplication(applicationData);
    await updateUserRole('business'); // Updates user role
    navigation.navigate('business-dashboard'); // Navigate to business features
  };
  
  return <ApplicationForm onSubmit={handleApplicationSubmit} />;
};
```

## Estructura de Data Unificada

### User Model con Roles
```javascript
// shared/services/user-service.js
const UserSchema = {
  uid: 'string',
  email: 'string', 
  name: 'string',
  userRole: 'client' | 'business', // Role único por usuario
  businessProfile: {             // Solo si userRole === 'business'
    businessId: 'string',
    businessName: 'string',
    // ... business-specific data
  }
};
```

### Conditional Data Loading
```javascript
// features/auth/hooks/use-auth.js
export const useAuth = () => {
  const { data: user } = useUser(currentUserId);
  
  // Solo cargar business data si el usuario es business owner
  const { data: businessProfile } = useBusiness(user?.businessProfile?.businessId, {
    enabled: user?.userRole === 'business',
  });
  
  return {
    user,
    businessProfile,
    isBusinessOwner: user?.userRole === 'business',
    updateUserRole: (newRole) => updateUserMutation.mutate({ userId: user.uid, role: newRole }),
  };
};
```

## Ventajas de Esta Arquitectura

### 1. **Desarrollo**
- Una sola codebase para mantener
- Features se desarrollan una vez
- Testing más simple y completo

### 2. **Usuario Final**
- Experiencia consistente
- Puede ser cliente y business owner simultáneamente
- Transición fluida entre roles

### 3. **Business**
- Reduce barrier para convertirse en business owner
- Users existing como clientes tienen más probabilidad de aplicar para business
- Data compartida permite better recommendations

### 4. **Técnico**
- Shared components y utilities
- Unified authentication
- Single build y deployment

## Casos Edge Manejados

### Usuario Sin Role Definido
- Default role: 'client' 
- Puede aplicar para 'business' posteriormente

### Business Owner que Quiere Ser Cliente
- Puede hacer orders como cliente normal
- Business dashboard disponible cuando necesite

### Role Changes
- Smooth transitions con proper cache invalidation
- No data loss durante cambio de role

Esta decisión simplifica dramaticamente el codebase mientras mejora la UX.

---

## 📖 Navegación

**Anterior:** [Problemas Actuales](./00-problemas-actuales.md) | **Siguiente:** [Estructura de Carpetas](../02-arquitectura/01-estructura-carpetas.md)