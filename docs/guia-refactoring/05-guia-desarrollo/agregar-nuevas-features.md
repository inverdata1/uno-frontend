# Guía: Agregar Nuevas Features

## Proceso Paso a Paso

### 1. Planificación
Antes de escribir código, define:
- **Objetivo**: ¿Qué problema resuelve la feature?
- **Alcance**: ¿Qué funcionalidad exacta incluye?
- **Dependencias**: ¿Qué otras features o servicios necesita?
- **Database**: ¿Necesita nuevas colecciones o campos?

### 2. Estructura de Base de Datos

#### Nueva Colección
```javascript
// 1. Definir schema en colecciones-firebase.md
// 2. Crear en shared/services/nueva-feature-service.js

export class NuevaFeatureService extends BaseService {
  static collectionName = 'NuevaFeatures';
  
  static async create(data) {
    const dataWithDefaults = {
      ...data,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return this.createDocument(this.collectionName, dataWithDefaults);
  }
  
  static async getById(id) {
    return this.getDocument(this.collectionName, id);
  }
  
  static async update(id, updates) {
    return this.updateDocument(this.collectionName, id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }
  
  static async getByUser(userId) {
    return this.queryDocuments(this.collectionName, [
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    ]);
  }
}
```

#### Agregar Campo a Colección Existente
```javascript
// shared/services/user-service.js - Agregar nuevo método
static async updateNuevoCampo(userId, nuevoCampoData) {
  return this.updateDocument('Users', userId, {
    nuevoCampo: nuevoCampoData,
    updatedAt: new Date().toISOString()
  });
}
```

### 3. Estructura de Feature

#### Crear Carpetas
```bash
# Estructura obligatoria
mkdir -p features/nueva-feature/components
mkdir -p features/nueva-feature/screens  
mkdir -p features/nueva-feature/queries
mkdir -p features/nueva-feature/utils    # Opcional
```

#### Query Keys
```javascript
// features/nueva-feature/queries/nueva-feature-query-keys.js
export const nuevaFeatureQueryKeys = {
  all: ['nueva-features'],
  lists: () => [...nuevaFeatureQueryKeys.all, 'list'],
  list: (filters) => [...nuevaFeatureQueryKeys.lists(), { filters }],
  details: () => [...nuevaFeatureQueryKeys.all, 'detail'],
  detail: (id) => [...nuevaFeatureQueryKeys.details(), id],
  byUser: (userId) => [...nuevaFeatureQueryKeys.lists(), { userId }],
};
```

#### Query Hooks
```javascript
// features/nueva-feature/queries/use-nueva-feature-queries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NuevaFeatureService } from '../../../shared/services/nueva-feature-service';
import { nuevaFeatureQueryKeys } from './nueva-feature-query-keys';

export const useNuevaFeature = (id) => {
  return useQuery({
    queryKey: nuevaFeatureQueryKeys.detail(id),
    queryFn: () => NuevaFeatureService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useNuevaFeaturesByUser = (userId) => {
  return useQuery({
    queryKey: nuevaFeatureQueryKeys.byUser(userId),
    queryFn: () => NuevaFeatureService.getByUser(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

export const useCreateNuevaFeature = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => NuevaFeatureService.create(data),
    onSuccess: (newItem) => {
      // Invalidar listas
      queryClient.invalidateQueries({
        queryKey: nuevaFeatureQueryKeys.lists()
      });
      
      // Agregar al cache
      queryClient.setQueryData(
        nuevaFeatureQueryKeys.detail(newItem.id),
        newItem
      );
    },
  });
};

export const useUpdateNuevaFeature = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }) => NuevaFeatureService.update(id, updates),
    onSuccess: (updatedItem, { id }) => {
      // Actualizar cache
      queryClient.setQueryData(
        nuevaFeatureQueryKeys.detail(id),
        updatedItem
      );
      
      // Invalidar listas relacionadas
      queryClient.invalidateQueries({
        queryKey: nuevaFeatureQueryKeys.lists()
      });
    },
  });
};
```

### 4. Componentes

#### Componente Base
```javascript
// features/nueva-feature/components/nueva-feature-card.jsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { cn } from '../../../shared/utils/cn';

const NuevaFeatureCard = ({ 
  item, 
  onPress, 
  variant = 'default',
  className 
}) => {
  return (
    <Pressable
      onPress={() => onPress?.(item)}
      className={cn(
        'p-4 bg-white rounded-lg border border-gray-200',
        variant === 'highlighted' && 'border-primary bg-primary/5',
        className
      )}
    >
      <Text className="font-semibold text-gray-900">
        {item.title}
      </Text>
      <Text className="text-sm text-gray-600 mt-1">
        {item.description}
      </Text>
    </Pressable>
  );
};

export default NuevaFeatureCard;
```

#### Formulario con Validación
```javascript
// features/nueva-feature/components/nueva-feature-form.jsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button } from '../../../shared/components/ui';

const nuevaFeatureSchema = z.object({
  title: z.string().min(1, 'Título es requerido').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  category: z.enum(['category1', 'category2', 'category3']),
});

const NuevaFeatureForm = ({ 
  initialData, 
  onSubmit, 
  isLoading = false 
}) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(nuevaFeatureSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || 'category1',
    },
  });

  return (
    <View className="space-y-4">
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Título"
            value={value}
            onChangeText={onChange}
            error={errors.title?.message}
            placeholder="Ingresa el título"
          />
        )}
      />
      
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Descripción"
            value={value}
            onChangeText={onChange}
            error={errors.description?.message}
            placeholder="Descripción opcional"
            multiline
            numberOfLines={3}
          />
        )}
      />
      
      <Button
        title={initialData ? 'Actualizar' : 'Crear'}
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
      />
    </View>
  );
};

export default NuevaFeatureForm;
```

### 5. Screens

#### Lista Screen
```javascript
// features/nueva-feature/screens/nueva-feature-list-screen.jsx
import React from 'react';
import { View, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../shared/hooks/use-auth';
import { useNuevaFeaturesByUser } from '../queries/use-nueva-feature-queries';
import NuevaFeatureCard from '../components/nueva-feature-card';
import { Button } from '../../../shared/components/ui';

const NuevaFeatureListScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { data: items, isLoading, error } = useNuevaFeaturesByUser(user?.uid);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  const handleItemPress = (item) => {
    navigation.navigate('NuevaFeatureDetail', { id: item.id });
  };

  const handleCreatePress = () => {
    navigation.navigate('NuevaFeatureCreate');
  };

  return (
    <View className="flex-1 p-4">
      <Button
        title="Crear Nuevo"
        onPress={handleCreatePress}
        className="mb-4"
      />
      
      <FlatList
        data={items || []}
        renderItem={({ item }) => (
          <NuevaFeatureCard
            item={item}
            onPress={handleItemPress}
            className="mb-3"
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default NuevaFeatureListScreen;
```

#### Create/Edit Screen
```javascript
// features/nueva-feature/screens/nueva-feature-create-screen.jsx
import React from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../../shared/hooks/use-auth';
import { 
  useCreateNuevaFeature, 
  useUpdateNuevaFeature,
  useNuevaFeature 
} from '../queries/use-nueva-feature-queries';
import NuevaFeatureForm from '../components/nueva-feature-form';

const NuevaFeatureCreateScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  
  const editId = route.params?.id;
  const isEdit = !!editId;
  
  const { data: existingItem } = useNuevaFeature(editId);
  const createMutation = useCreateNuevaFeature();
  const updateMutation = useUpdateNuevaFeature();
  
  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: editId,
          updates: formData
        });
      } else {
        await createMutation.mutateAsync({
          ...formData,
          userId: user.uid,
        });
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving:', error);
      // Manejar error (toast, alert, etc.)
    }
  };

  return (
    <View className="flex-1 p-4">
      <NuevaFeatureForm
        initialData={existingItem}
        onSubmit={handleSubmit}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />
    </View>
  );
};

export default NuevaFeatureCreateScreen;
```

### 6. Navegación

#### Agregar a Stack Navigator
```javascript
// navigation/app-navigator.jsx
import NuevaFeatureListScreen from '../features/nueva-feature/screens/nueva-feature-list-screen';
import NuevaFeatureCreateScreen from '../features/nueva-feature/screens/nueva-feature-create-screen';
import NuevaFeatureDetailScreen from '../features/nueva-feature/screens/nueva-feature-detail-screen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <Stack.Navigator>
      {/* Existing screens */}
      
      <Stack.Screen
        name="NuevaFeatureList"
        component={NuevaFeatureListScreen}
        options={{ title: 'Nueva Feature' }}
      />
      <Stack.Screen
        name="NuevaFeatureCreate"
        component={NuevaFeatureCreateScreen}
        options={({ route }) => ({
          title: route.params?.id ? 'Editar' : 'Crear'
        })}
      />
      <Stack.Screen
        name="NuevaFeatureDetail"
        component={NuevaFeatureDetailScreen}
        options={{ title: 'Detalle' }}
      />
    </Stack.Navigator>
  );
};
```

### 7. Seguridad Firebase

#### Firestore Rules
```javascript
// firestore.rules - Agregar reglas para nueva colección
match /NuevaFeatures/{nuevaFeatureId} {
  // Solo usuarios autenticados pueden leer
  allow read: if request.auth != null;
  
  // Solo el owner puede crear
  allow create: if request.auth != null && 
    request.auth.uid == request.resource.data.userId;
  
  // Solo el owner puede actualizar
  allow update: if request.auth != null && 
    request.auth.uid == resource.data.userId;
  
  // Solo el owner puede eliminar
  allow delete: if request.auth != null && 
    request.auth.uid == resource.data.userId;
}
```

### 8. Testing

#### Service Tests
```javascript
// __tests__/services/nueva-feature-service.test.js
import { NuevaFeatureService } from '../../shared/services/nueva-feature-service';

describe('NuevaFeatureService', () => {
  test('should create nueva feature', async () => {
    const data = { title: 'Test', userId: 'user123' };
    const result = await NuevaFeatureService.create(data);
    
    expect(result).toBeDefined();
    expect(result.title).toBe('Test');
    expect(result.createdAt).toBeDefined();
  });
});
```

#### Component Tests
```javascript
// features/nueva-feature/components/__tests__/nueva-feature-card.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NuevaFeatureCard from '../nueva-feature-card';

describe('NuevaFeatureCard', () => {
  const mockItem = {
    id: '1',
    title: 'Test Item',
    description: 'Test Description'
  };

  test('renders correctly', () => {
    const { getByText } = render(
      <NuevaFeatureCard item={mockItem} />
    );
    
    expect(getByText('Test Item')).toBeTruthy();
    expect(getByText('Test Description')).toBeTruthy();
  });

  test('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <NuevaFeatureCard item={mockItem} onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Item'));
    expect(mockOnPress).toHaveBeenCalledWith(mockItem);
  });
});
```

### 9. Documentación

#### Actualizar README principal
```markdown
## Features
- ✅ Autenticación
- ✅ Gestión de negocios
- ✅ Nueva Feature - [Descripción breve]
```

#### Crear documentación específica
```javascript
// features/nueva-feature/README.md
# Nueva Feature

## Descripción
[Describe qué hace la feature]

## Componentes
- `NuevaFeatureCard` - Card para mostrar items
- `NuevaFeatureForm` - Formulario de creación/edición

## Screens
- `NuevaFeatureListScreen` - Lista de items
- `NuevaFeatureCreateScreen` - Crear/editar item

## Queries
- `useNuevaFeature(id)` - Obtener item por ID
- `useCreateNuevaFeature()` - Crear nuevo item

## Database Schema
Ver `colecciones-firebase.md` sección NuevaFeatures.
```

## Checklist de Nueva Feature

### Planificación
- [ ] Definir objetivo y alcance
- [ ] Diseñar schema de base de datos
- [ ] Planificar navegación y UX

### Backend/Servicios
- [ ] Crear service class
- [ ] Definir métodos CRUD
- [ ] Agregar reglas de Firestore
- [ ] Crear indexes necesarios

### Frontend/Queries
- [ ] Crear query keys
- [ ] Crear hooks de TanStack Query
- [ ] Implementar invalidación correcta

### UI/Components
- [ ] Crear componentes básicos
- [ ] Implementar formularios con validación
- [ ] Crear screens necesarias

### Navegación
- [ ] Agregar rutas a navegadores
- [ ] Configurar parámetros de navegación
- [ ] Testear flujos de navegación

### Testing
- [ ] Tests unitarios de servicios
- [ ] Tests de componentes
- [ ] Tests de integración

### Documentación
- [ ] Actualizar colecciones-firebase.md
- [ ] Documentar API de la feature
- [ ] Actualizar README principal

Esta guía asegura que las nuevas features sigan los patrones establecidos y sean mantenibles a largo plazo.