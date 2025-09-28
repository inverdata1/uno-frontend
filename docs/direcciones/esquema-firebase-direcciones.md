# Esquema Firebase - Sistema de Direcciones

## Descripción General

Este documento define la estructura de Firebase Firestore para el sistema de direcciones de Uno Delivery, diseñado para soportar múltiples tipos de usuarios (clientes, negocios, conductores) con direcciones específicas para cada tipo.

## Estructura de Colecciones

### 1. `address_types` - Tipos de Direcciones

Colección de catálogo para los diferentes tipos de direcciones según el tipo de usuario.

```javascript
// Documento: address_types/{type_code}
{
  id: "CLIENT_HOME",
  name: "Casa",
  description: "Dirección de casa del cliente",
  allowedForUserTypes: ["client"],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Documentos iniciales:**

| Document ID | name | description | allowedForUserTypes |
|-------------|------|-------------|---------------------|
| CLIENT_HOME | Casa | Dirección de casa del cliente | ["client"] |
| CLIENT_WORK | Trabajo | Dirección de trabajo del cliente | ["client"] |
| CLIENT_OTHER | Otra | Otra dirección del cliente | ["client"] |
| BUSINESS_MAIN | Sede Principal | Ubicación principal del negocio | ["business"] |
| BUSINESS_BRANCH | Sucursal | Sucursal del negocio | ["business"] |
| BUSINESS_WAREHOUSE | Almacén | Almacén o depósito | ["business"] |
| BUSINESS_PICKUP | Punto de Recogida | Punto de recogida para clientes | ["business"] |
| DRIVER_BASE | Base | Ubicación base del conductor | ["driver"] |
| DRIVER_ZONE | Zona de Trabajo | Zona de trabajo preferida | ["driver"] |

### 2. `venezuelan_states` - Estados de Venezuela

Colección de catálogo para los estados venezolanos.

```javascript
// Documento: venezuelan_states/{state_code}
{
  id: "ZUL",
  name: "Zulia",
  code: "ZUL",
  createdAt: Timestamp
}
```

**Estados incluidos:**
- AMA (Amazonas), ANZ (Anzoátegui), APU (Apure), ARA (Aragua)
- BAR (Barinas), BOL (Bolívar), CAR (Carabobo), COJ (Cojedes)
- DAM (Delta Amacuro), DC (Distrito Capital), FAL (Falcón)
- GUA (Guárico), LAR (Lara), MER (Mérida), MIR (Miranda)
- MON (Monagas), NE (Nueva Esparta), POR (Portuguesa)
- SUC (Sucre), TAC (Táchira), TRU (Trujillo), VAR (Vargas)
- YAR (Yaracuy), ZUL (Zulia)

### 3. `addresses` - Direcciones Principales

Colección principal que almacena todas las direcciones de los usuarios.

```javascript
// Documento: addresses/{address_id}
{
  id: "auto_generated_id",
  userId: "user123", // Referencia a users/{userId}
  addressTypeId: "CLIENT_HOME", // Referencia a address_types/{typeId}

  // Información Básica
  label: "Casa",
  contactName: "María González",
  phone: "04121234567",

  // Detalles de Dirección
  street: "Av. Francisco de Miranda, Edificio Torre Oeste, Piso 3, Apto 3A",
  city: "Caracas",
  stateId: "DC", // Referencia a venezuelan_states/{stateId}
  postalCode: "1060",
  references: "Edificio azul con portón negro, frente a la farmacia",

  // Coordenadas (incluidas directamente por rendimiento)
  coordinates: {
    latitude: 10.4806,
    longitude: -66.9036,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
    accuracyMeters: 5
  },

  // Metadatos
  isDefault: false,
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Índices Compuestos Requeridos

Para optimizar las consultas, necesitamos crear estos índices en Firestore:

```javascript
// Índice 1: Direcciones por usuario
Collection: addresses
Fields: userId (Ascending), isActive (Ascending), createdAt (Descending)

// Índice 2: Direcciones predeterminadas
Collection: addresses
Fields: userId (Ascending), isDefault (Ascending)

// Índice 3: Direcciones por tipo
Collection: addresses
Fields: userId (Ascending), addressTypeId (Ascending), isActive (Ascending)
```

## Reglas de Seguridad Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Tipos de direcciones - solo lectura para usuarios autenticados
    match /address_types/{typeId} {
      allow read: if request.auth != null;
      allow write: if false; // Solo administradores via backend
    }

    // Estados venezolanos - solo lectura para usuarios autenticados
    match /venezuelan_states/{stateId} {
      allow read: if request.auth != null;
      allow write: if false; // Solo administradores via backend
    }

    // Direcciones - usuarios solo pueden acceder a sus propias direcciones
    match /addresses/{addressId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Relaciones y Referencias

```
users/{userId} <---> addresses (userId field)
address_types/{typeId} <---> addresses (addressTypeId field)
venezuelan_states/{stateId} <---> addresses (stateId field)
```

## Ventajas del Diseño Firebase

1. **Desnormalización Estratégica**: Coordenadas incluidas directamente para mejor rendimiento
2. **Escalabilidad**: Firebase maneja automáticamente el escalado
3. **Tiempo Real**: Actualizaciones en tiempo real con listeners
4. **Seguridad**: Reglas granulares por usuario
5. **Flexibilidad**: Fácil agregar nuevos campos sin migraciones
6. **Tipificación**: Tipos de dirección específicos por tipo de usuario

## Consultas de Ejemplo

### Obtener direcciones de un cliente

```javascript
const addressesRef = collection(db, 'addresses');
const q = query(
  addressesRef,
  where('userId', '==', 'client123'),
  where('isActive', '==', true),
  orderBy('createdAt', 'desc')
);
const snapshot = await getDocs(q);
```

### Obtener dirección predeterminada

```javascript
const q = query(
  collection(db, 'addresses'),
  where('userId', '==', 'user123'),
  where('isDefault', '==', true),
  where('isActive', '==', true),
  limit(1)
);
```

### Obtener tipos de dirección para un tipo de usuario

```javascript
const typesRef = collection(db, 'address_types');
const q = query(
  typesRef,
  where('allowedForUserTypes', 'array-contains', 'client')
);
```