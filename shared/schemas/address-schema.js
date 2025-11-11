import { z } from 'zod';

export const addressSchema = z.object({
  // New required field - Address Type
  addressTypeId: z.string()
    .min(1, 'Selecciona el tipo de dirección'),

  // Basic Info
  label: z.string()
    .min(1, 'El nombre de la dirección es requerido')
    .max(50, 'El nombre es muy largo'),
  contactName: z.string()
    .min(2, 'El nombre de contacto es requerido')
    .max(100, 'El nombre es muy largo'),
  phone: z.string()
    .min(11, 'Ingresa 11 dígitos')
    .max(11, 'Solo 11 dígitos')
    .regex(/^04(12|14|16|24|26)\d{7}$/, 'Formato: 04XX XXX XXXX'),

  // Address Details
  street: z.string()
    .min(10, 'Ingresa la dirección completa')
    .max(200, 'La dirección es muy larga'),
  references: z.string()
    .min(10, 'Agrega referencias para facilitar la entrega')
    .max(300, 'Las referencias son muy largas'),
  city: z.string()
    .min(2, 'La ciudad es requerida')
    .max(100, 'La ciudad es muy larga'),

  // Changed from 'state' to 'stateId'
  stateId: z.string()
    .min(1, 'El estado es requerido'),

  // Store state name for display
  stateName: z.string()
    .min(1, 'El nombre del estado es requerido'),

  postalCode: z.string()
    .min(4, 'El código postal es requerido')
    .max(5, 'El código postal debe tener máximo 5 dígitos'),

  // Geolocation
  coordinates: z.object({
    latitude: z.number()
      .min(-90, 'Latitud inválida')
      .max(90, 'Latitud inválida'),
    longitude: z.number()
      .min(-180, 'Longitud inválida')
      .max(180, 'Longitud inválida'),
    latitudeDelta: z.number().optional(),
    longitudeDelta: z.number().optional()
  }),

  // Metadata
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true)
});

// Schema for creating new address (without coordinates initially)
export const newAddressSchema = addressSchema.omit({ coordinates: true }).extend({
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number()
  }).optional()
});

// Common Venezuelan states for dropdown
export const venezuelanStates = [
  'Amazonas',
  'Anzoátegui',
  'Apure',
  'Aragua',
  'Barinas',
  'Bolívar',
  'Carabobo',
  'Cojedes',
  'Delta Amacuro',
  'Distrito Capital',
  'Falcón',
  'Guárico',
  'Lara',
  'Mérida',
  'Miranda',
  'Monagas',
  'Nueva Esparta',
  'Portuguesa',
  'Sucre',
  'Táchira',
  'Trujillo',
  'Vargas',
  'Yaracuy',
  'Zulia'
];

// Common address labels
export const addressLabels = [
  'Casa',
  'Trabajo',
  'Oficina',
  'Apartamento',
  'Casa de Familia',
  'Otro'
];