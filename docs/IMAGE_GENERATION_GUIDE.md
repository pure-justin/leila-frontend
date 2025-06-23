# Leila Service Image Generation Guide

## Overview
This guide explains how to generate and manage professional service images for the Leila platform using AI image generation.

## Image Categories and Sizes

### Image Variants
- **Hero** (1920x1080): Full-width banner images for service pages
- **Thumbnail** (800x800): Square images for grid displays
- **Card** (400x300): Rectangle images for service cards
- **Mobile** (375x200): Optimized for mobile displays

### Service Categories
- Electrical
- Plumbing
- HVAC
- Cleaning
- Landscaping
- Handyman
- Appliance Repair
- Pest Control

## Professional Prompt System

The image generation system uses carefully crafted prompts with:
- **Style**: Hyperrealistic professional photography
- **Lighting**: Bright natural lighting with soft shadows
- **Composition**: Rule of thirds, professional angles
- **Quality**: 8K ultra HD, sharp focus, high detail
- **Brand Colors**: Purple (#7C3AED) and Blue (#3B82F6) accents

## Usage

### Generate Images
```bash
npm run images:generate
```

### Optimize Existing Images
```bash
npm run images:optimize
```

### Create React Component
```bash
npm run images:component
```

## Integration

### Using ServiceImage Component
```tsx
import { ServiceImage } from '@/components/ServiceImage';

<ServiceImage 
  category="plumbing"
  subcategory="faucet-repair"
  variant="card"
  alt="Plumbing service"
/>
```

### Getting Image URLs
```typescript
import { getServiceImage, getServiceThumbnail, getServiceHeroImage } from '@/lib/service-images-local';

const cardImage = getServiceImage('electrical-repair');
const thumbnail = getServiceThumbnail('electrical-repair');
const heroImage = getServiceHeroImage('electrical-repair');
```

## Image Mapping

Services are mapped to appropriate image categories and subcategories in `lib/service-image-mapping.ts`.

Example mapping:
```typescript
'electrical-repair': { category: 'electrical', subcategory: 'outlet-installation' },
'panel-upgrade': { category: 'electrical', subcategory: 'panel-upgrade' },
```

## AI Image Generation Services

When ready to generate actual images, integrate with:
- **Google Vertex AI** (Imagen API)
- **OpenAI DALL-E 3**
- **Stable Diffusion API**
- **Midjourney API**

## File Structure
```
shared-assets/
└── images/
    └── services/
        ├── placeholder.jpg
        ├── electrical/
        │   ├── outlet-installation-hero.jpg
        │   ├── outlet-installation-card.jpg
        │   └── ...
        ├── plumbing/
        └── ...
```

## Next Steps

1. **API Integration**: Connect to an AI image generation service
2. **Batch Generation**: Run the generation script with API credentials
3. **Review & Curate**: Select the best generated images
4. **Optimize**: Run optimization to ensure fast loading
5. **Deploy**: Images are automatically served from `/shared-assets/`