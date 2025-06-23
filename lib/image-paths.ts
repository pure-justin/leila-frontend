// Simple image path mapping
// All images should be in /shared-assets/images/services/{category}/{service-name}-{number}.webp

export const getServiceImagePath = (serviceName: string, category: string, imageNumber: number = 1): string => {
  const cleanName = serviceName.toLowerCase()
    .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
    .replace(/\s+/g, '-');
  
  return `/images/services/${category}/${cleanName}-${imageNumber}.webp`;
};

export const getPlaceholderImage = (): string => {
  return '/images/services/placeholder.jpg';
};