# Guía de Organización de Imágenes

## Estructura de Carpetas
```
shared/assets/images/
├── onboarding/          # Imágenes del carrusel de onboarding
├── illustrations/       # Ilustraciones generales de la app
├── icons/              # Iconos personalizados y gráficos
└── backgrounds/        # Imágenes de fondo y patrones
```

## Convenciones de Nomenclatura

### Formato: `[categoria]-[descripcion]-[variante].[ext]`

**Ejemplos:**
- `onboarding-payment-tracking.webp`
- `onboarding-shopping-stores.webp`
- `onboarding-deals-offers.webp`
- `illustration-delivery-hero.webp`
- `icon-payment-card.webp`
- `background-gradient-primary.webp`

### Categorías:
- `onboarding` - Imágenes del flujo de onboarding
- `illustration` - Ilustraciones generales
- `icon` - Iconos personalizados
- `background` - Imágenes de fondo

### Variantes (opcional):
- `dark` / `light` - Variantes de tema
- `sm` / `md` / `lg` - Variantes de tamaño
- `1x` / `2x` / `3x` - Variantes de densidad

## Requisitos de Archivos
- **Formato**: WebP para tamaño y calidad óptimos
- **Nomenclatura**: kebab-case (minúsculas con guiones)
- **Organización**: Categorizado por contexto de uso

## Patrón de Uso
Importar desde archivo índice centralizado:
```javascript
import { onboardingImages } from '@/shared/assets/images';
```

## Ubicación Esperada de Imágenes
Para el onboarding, coloca tus archivos WebP convertidos en:
- `shared/assets/images/onboarding/onboarding-payment-tracking.webp`
- `shared/assets/images/onboarding/onboarding-shopping-stores.webp`
- `shared/assets/images/onboarding/onboarding-deals-offers.webp`