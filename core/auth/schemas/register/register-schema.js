import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Solo letras y espacios'),
  lastName: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Solo letras y espacios'),
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  phone: z.string()
    .min(11, 'Ingresa 11 dígitos')
    .max(11, 'Solo 11 dígitos')
    .regex(/^04(12|14|16|24|26)\d{7}$/, 'Formato: 04XX XXX XXXX'),
  dateOfBirth: z.date({
      required_error: 'La fecha de nacimiento es requerida',
      invalid_type_error: 'La fecha de nacimiento debe ser una fecha válida'
    })
    .refine(date => {
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      // Adjust age if birthday hasn't occurred this year
      const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate()) ? age - 1 : age;
      return adjustedAge >= 13 && adjustedAge <= 100;
    }, 'Debes ser mayor de 13 años'),
  password: z.string()
    .min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos y condiciones'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});