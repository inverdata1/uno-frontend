// Welcome intro slide content data
import { onboardingImages } from '../../../shared/assets/images';

export const welcomeSlides = [
  {
    id: 1,
    title: 'Gestiona tus pagos\ny rastrea entregas.',
    backgroundColor: '#f7fafc', // UNO Primary 50 - Very light red
    imageColor: '#dc2626', // UNO Primary 600 - Darker red
    description: 'Controla todos tus pedidos y pagos desde una sola app',
    image: onboardingImages.paymentTracking,
  },
  {
    id: 2,
    title: 'Encuentra y compra\nen tiendas que amas.',
    backgroundColor: '#fef2f2', // UNO Secondary gray - Clean neutral
    imageColor: '#ef4444', // UNO Primary 500 - Main red
    description: 'Descubre productos de tus comercios favoritos',
    image: onboardingImages.shoppingStores,
  },
  {
    id: 3,
    title: 'Obtén las últimas\ny mejores ofertas.',
    backgroundColor: '#fee2e2', // UNO Primary 100 - Light red tint
    imageColor: '#b91c1c', // UNO Primary 700 - Deep red
    description: 'No te pierdas ninguna promoción especial',
    image: onboardingImages.dealsOffers,
  },
];