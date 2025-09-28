import { z } from 'zod';

export const addressSchema = z.object({
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
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección es muy larga'),
  number: z.string()
    .min(1, 'El número es requerido')
    .max(20, 'El número es muy largo'),
  floor: z.string()
    .max(10, 'El piso es muy largo')
    .optional(),
  apartment: z.string()
    .max(20, 'El apartamento es muy largo')
    .optional(),
  references: z.string()
    .min(10, 'Agrega referencias para facilitar la entrega')
    .max(300, 'Las referencias son muy largas'),
  neighborhood: z.string()
    .max(100, 'El sector/barrio es muy largo')
    .optional(),
  city: z.string()
    .min(2, 'La ciudad es requerida')
    .max(100, 'La ciudad es muy larga'),
  state: z.string()
    .min(2, 'El estado es requerido')
    .max(50, 'El estado es muy largo'),
  postalCode: z.string()
    .max(20, 'El código postal es muy largo')
    .optional(),

  // Geolocation
  coordinates: z.object({
    latitude: z.number()
      .min(-90, 'Latitud inválida')
      .max(90, 'Latitud inválida'),
    longitude: z.number()
      .min(-180, 'Longitud inválida')
      .max(180, 'Longitud inválida')
  }),

  // Metadata
  isDefault: z.boolean().default(false)
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