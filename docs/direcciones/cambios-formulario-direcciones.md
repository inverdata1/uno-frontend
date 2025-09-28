# Cambios Requeridos - Formulario de Direcciones

## Descripción General

Este documento describe los cambios necesarios en el formulario de direcciones para soportar el nuevo esquema de base de datos con tipos de direcciones y relaciones normalizadas.

## Cambios Principales

### 1. Nuevo Campo: Tipo de Dirección

**Ubicación**: Paso 1 - Información Básica (después del campo "label")

```javascript
// Nuevo campo de tipo de dirección
<form.Field
  name="addressTypeId"
  validators={{
    onChange: z.string().min(1, 'Selecciona el tipo de dirección'),
    onBlur: z.string().min(1, 'Selecciona el tipo de dirección')
  }}
  children={(field) => (
    <View>
      <Text className="text-sm font-medium text-foreground mb-2">
        Tipo de dirección *
      </Text>
      <AddressTypeSelector
        value={field.state.value}
        onChange={(typeId) => {
          field.handleChange(typeId);
          triggerUpdate();
        }}
        userType={mode} // 'client', 'business', 'driver'
        error={field.state.meta.errors?.[0]}
      />
    </View>
  )}
/>
```

### 2. Selector de Estado Normalizado

**Ubicación**: Paso 2 - Detalles de Dirección (reemplazar input de texto)

```javascript
// Reemplazar input de estado por selector
<form.Field
  name="stateId"
  validators={{
    onChange: z.string().min(1, 'El estado es requerido'),
    onBlur: z.string().min(1, 'El estado es requerido')
  }}
  children={(field) => (
    <View className="flex-1">
      <Text className="text-sm font-medium text-foreground mb-2">
        Estado *
      </Text>
      <StateSelector
        value={field.state.value}
        onChange={(stateId) => {
          field.handleChange(stateId);
          triggerUpdate();
        }}
        error={field.state.meta.errors?.[0]}
      />
    </View>
  )}
/>
```

### 3. Actualización del Schema de Validación

**Archivo**: `shared/schemas/address-schema.js`

```javascript
export const newAddressSchema = z.object({
  // Nuevo campo requerido
  addressTypeId: z.string()
    .min(1, 'Selecciona el tipo de dirección'),

  // Campos existentes...
  label: z.string().min(1, 'El nombre de la dirección es requerido'),
  contactName: z.string().min(2, 'El nombre de contacto es requerido'),
  phone: z.string().min(11, 'Ingresa 11 dígitos').regex(/^04(12|14|16|24|26)\d{7}$/),

  street: z.string().min(10, 'Ingresa la dirección completa'),
  city: z.string().min(2, 'La ciudad es requerida'),

  // Campo modificado - ahora es ID de estado
  stateId: z.string().min(1, 'El estado es requerido'),

  postalCode: z.string().min(4, 'El código postal es requerido').max(5),
  references: z.string().min(10, 'Agrega referencias para facilitar la entrega'),

  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
    latitudeDelta: z.number().optional(),
    longitudeDelta: z.number().optional()
  }),

  // Campos opcionales para compatibilidad
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true)
});
```

### 4. Componentes Nuevos Requeridos

#### A. `AddressTypeSelector.jsx`

```javascript
// shared/components/ui/address-type-selector.jsx
export const AddressTypeSelector = ({
  value,
  onChange,
  userType,
  error
}) => {
  const [addressTypes, setAddressTypes] = useState([]);

  useEffect(() => {
    // Cargar tipos de dirección según userType
    loadAddressTypes(userType);
  }, [userType]);

  // Renderizar selector con opciones filtradas
};
```

#### B. `StateSelector.jsx`

```javascript
// shared/components/ui/state-selector.jsx
export const StateSelector = ({
  value,
  onChange,
  error
}) => {
  const [states, setStates] = useState([]);

  useEffect(() => {
    // Cargar estados venezolanos
    loadVenezuelanStates();
  }, []);

  // Renderizar selector con estados
};
```

### 5. Actualización de Validación por Pasos

**Archivo**: `shared/components/forms/address-form.jsx`

```javascript
// Actualizar validación del paso 1
const isStep1Valid = () => {
  const label = form.getFieldValue('label') || '';
  const addressTypeId = form.getFieldValue('addressTypeId') || '';
  const contactName = form.getFieldValue('contactName') || '';
  const phone = form.getFieldValue('phone') || '';

  return label.length >= 1 &&
         addressTypeId.length >= 1 && // Nueva validación
         contactName.length >= 2 &&
         phone.length === 11 && /^04(12|14|16|24|26)\d{7}$/.test(phone);
};

// Actualizar validación del paso 2
const isStep2Valid = () => {
  const street = form.getFieldValue('street') || '';
  const city = form.getFieldValue('city') || '';
  const stateId = form.getFieldValue('stateId') || ''; // Cambio: stateId en lugar de state
  const postalCode = form.getFieldValue('postalCode') || '';

  return street.length >= 10 &&
         city.length >= 2 &&
         stateId.length >= 1 && // Nueva validación
         postalCode.length >= 4;
};
```

### 6. Datos por Defecto Actualizados

```javascript
// Valores por defecto en el formulario
const form = useForm({
  defaultValues: {
    addressTypeId: initialData.addressTypeId || '', // Nuevo campo
    label: initialData.label || '',
    contactName: initialData.contactName || '',
    phone: initialData.phone || '',
    street: initialData.street || '',
    city: initialData.city || '',
    stateId: initialData.stateId || '', // Cambio: stateId
    postalCode: initialData.postalCode || '',
    references: initialData.references || '',
    coordinates: initialData.coordinates || null,
    isDefault: initialData.isDefault || false,
    isActive: initialData.isActive !== undefined ? initialData.isActive : true
  }
});
```

## Impacto en Componentes Existentes

### 1. `AddressCard` en `address-bottom-sheet.jsx`

```javascript
// Mostrar nombre del tipo de dirección en lugar de solo label
<Text className="font-bold text-base">
  {address.label} ({address.addressType?.name})
</Text>

// Mostrar nombre del estado en lugar del código
<Text className="text-sm font-medium">
  {address.city}, {address.state?.name}
</Text>
```

### 2. Servicios Firebase

Necesitaremos actualizar los servicios para:
- Cargar tipos de direcciones filtrados por tipo de usuario
- Cargar estados venezolanos para el selector
- Resolver referencias al mostrar direcciones (joins)

## Migración de Datos Existentes

Si ya existen direcciones, necesitaremos:

1. **Migrar estados**: Convertir nombres de estados a IDs
2. **Asignar tipos**: Asignar tipo por defecto según modo de usuario
3. **Completar campos**: Agregar `isActive: true` a direcciones existentes

## Orden de Implementación

1. ✅ Crear documentación (este archivo)
2. 🔄 Crear servicios Firebase para tipos y estados
3. 🔄 Crear componentes `AddressTypeSelector` y `StateSelector`
4. 🔄 Actualizar schema de validación
5. 🔄 Modificar formulario de direcciones
6. 🔄 Actualizar componentes de visualización
7. 🔄 Probar flujo completo