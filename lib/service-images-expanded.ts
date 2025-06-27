// Expanded service images catalog with multiple images per service
// Using various high-quality image sources

export interface ServiceImage {
  url: string;
  alt: string;
  credit?: string;
}

// Multiple images per service to avoid repetition
export const SERVICE_IMAGE_SETS: Record<string, ServiceImage[]> = {
  // Electrical Services
  'electrical-inspection': [
    {
      url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop&q=80',
      alt: 'Electrical panel inspection'
    },
    {
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
      alt: 'Electrician checking wiring'
    },
    {
      url: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?w=800&h=600&fit=crop',
      alt: 'Professional electrical testing'
    }
  ],
  'outlet-installation': [
    {
      url: 'https://images.unsplash.com/photo-1565608087341-404b25492fee?w=800&h=600&fit=crop&q=80',
      alt: 'Installing electrical outlet'
    },
    {
      url: 'https://images.pexels.com/photos/1435752/pexels-photo-1435752.jpeg?w=800&h=600&fit=crop',
      alt: 'Modern outlet installation'
    },
    {
      url: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=800&h=600&fit=crop&q=80',
      alt: 'USB outlet upgrade'
    }
  ],
  'lighting-installation': [
    {
      url: 'https://images.unsplash.com/photo-1565636192335-88710e9e0999?w=800&h=600&fit=crop&q=80',
      alt: 'Modern lighting installation'
    },
    {
      url: 'https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg?w=800&h=600&fit=crop',
      alt: 'LED light fixture installation'
    },
    {
      url: 'https://images.unsplash.com/photo-1524634126442-357e0eac3c14?w=800&h=600&fit=crop&q=80',
      alt: 'Chandelier installation'
    }
  ],

  // Plumbing Services
  'leak-repair': [
    {
      url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop&q=80',
      alt: 'Fixing water leak'
    },
    {
      url: 'https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?w=800&h=600&fit=crop',
      alt: 'Pipe leak repair'
    },
    {
      url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop&q=80',
      alt: 'Under sink repair'
    }
  ],
  'drain-cleaning': [
    {
      url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&h=600&fit=crop&q=80',
      alt: 'Professional drain cleaning'
    },
    {
      url: 'https://images.pexels.com/photos/6419720/pexels-photo-6419720.jpeg?w=800&h=600&fit=crop',
      alt: 'Drain snake service'
    },
    {
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
      alt: 'Kitchen sink drain cleaning'
    }
  ],
  'toilet-repair': [
    {
      url: 'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=800&h=600&fit=crop&q=80',
      alt: 'Toilet repair service'
    },
    {
      url: 'https://images.pexels.com/photos/6474445/pexels-photo-6474445.jpeg?w=800&h=600&fit=crop',
      alt: 'Modern toilet installation'
    },
    {
      url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop&q=80',
      alt: 'Bathroom plumbing service'
    }
  ],

  // HVAC Services
  'ac-repair': [
    {
      url: 'https://images.unsplash.com/photo-1631545806609-24040d63f79d?w=800&h=600&fit=crop&q=80',
      alt: 'Air conditioner repair'
    },
    {
      url: 'https://images.pexels.com/photos/3964704/pexels-photo-3964704.jpeg?w=800&h=600&fit=crop',
      alt: 'AC unit maintenance'
    },
    {
      url: 'https://images.unsplash.com/photo-1622793033111-35c9639b7465?w=800&h=600&fit=crop&q=80',
      alt: 'HVAC technician at work'
    }
  ],
  'hvac-maintenance': [
    {
      url: 'https://images.unsplash.com/photo-1626662055740-7c3d1c043a46?w=800&h=600&fit=crop&q=80',
      alt: 'HVAC system maintenance'
    },
    {
      url: 'https://images.pexels.com/photos/8853502/pexels-photo-8853502.jpeg?w=800&h=600&fit=crop',
      alt: 'Furnace inspection'
    },
    {
      url: 'https://images.unsplash.com/photo-1604881991405-b273c7a4386a?w=800&h=600&fit=crop&q=80',
      alt: 'Duct cleaning service'
    }
  ],

  // Cleaning Services
  'house-cleaning': [
    {
      url: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&h=600&fit=crop&q=80',
      alt: 'Professional house cleaning'
    },
    {
      url: 'https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?w=800&h=600&fit=crop',
      alt: 'Living room cleaning'
    },
    {
      url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop&q=80',
      alt: 'Kitchen deep cleaning'
    },
    {
      url: 'https://images.pexels.com/photos/4099471/pexels-photo-4099471.jpeg?w=800&h=600&fit=crop',
      alt: 'Bathroom cleaning service'
    }
  ],
  'deep-cleaning': [
    {
      url: 'https://images.unsplash.com/photo-1527515545081-5db817172677?w=800&h=600&fit=crop&q=80',
      alt: 'Deep house cleaning'
    },
    {
      url: 'https://images.pexels.com/photos/6197116/pexels-photo-6197116.jpeg?w=800&h=600&fit=crop',
      alt: 'Steam cleaning service'
    },
    {
      url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop&q=80',
      alt: 'Spotless home cleaning'
    }
  ],
  'carpet-cleaning': [
    {
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
      alt: 'Professional carpet cleaning'
    },
    {
      url: 'https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg?w=800&h=600&fit=crop',
      alt: 'Steam carpet cleaning'
    },
    {
      url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&h=600&fit=crop&q=80',
      alt: 'Rug cleaning service'
    }
  ],
  'window-cleaning': [
    {
      url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop&q=80',
      alt: 'Window cleaning service'
    },
    {
      url: 'https://images.pexels.com/photos/713297/pexels-photo-713297.jpeg?w=800&h=600&fit=crop',
      alt: 'High-rise window cleaning'
    },
    {
      url: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800&h=600&fit=crop&q=80',
      alt: 'Residential window washing'
    }
  ],

  // Landscaping Services
  'lawn-mowing': [
    {
      url: 'https://images.unsplash.com/photo-1592417817038-d13fd7342605?w=800&h=600&fit=crop&q=80',
      alt: 'Professional lawn mowing'
    },
    {
      url: 'https://images.pexels.com/photos/1453499/pexels-photo-1453499.jpeg?w=800&h=600&fit=crop',
      alt: 'Lawn care service'
    },
    {
      url: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&h=600&fit=crop&q=80',
      alt: 'Garden maintenance'
    },
    {
      url: 'https://images.pexels.com/photos/589695/pexels-photo-589695.jpeg?w=800&h=600&fit=crop',
      alt: 'Lawn mower in action'
    }
  ],
  'garden-design': [
    {
      url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop&q=80',
      alt: 'Beautiful garden design'
    },
    {
      url: 'https://images.pexels.com/photos/1400375/pexels-photo-1400375.jpeg?w=800&h=600&fit=crop',
      alt: 'Landscape architecture'
    },
    {
      url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=600&fit=crop&q=80',
      alt: 'Modern garden design'
    }
  ],
  'tree-trimming': [
    {
      url: 'https://images.unsplash.com/photo-1563714272638-82bc29bb5c8e?w=800&h=600&fit=crop&q=80',
      alt: 'Tree trimming service'
    },
    {
      url: 'https://images.pexels.com/photos/1108117/pexels-photo-1108117.jpeg?w=800&h=600&fit=crop',
      alt: 'Professional tree pruning'
    },
    {
      url: 'https://images.unsplash.com/photo-1559305289-4c31700ba9cb?w=800&h=600&fit=crop&q=80',
      alt: 'Arborist at work'
    }
  ],

  // Handyman Services
  'furniture-assembly': [
    {
      url: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&h=600&fit=crop&q=80',
      alt: 'Furniture assembly service'
    },
    {
      url: 'https://images.pexels.com/photos/5691630/pexels-photo-5691630.jpeg?w=800&h=600&fit=crop',
      alt: 'Professional furniture setup'
    },
    {
      url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&q=80',
      alt: 'Living room furniture assembly'
    }
  ],
  'tv-mounting': [
    {
      url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&h=600&fit=crop&q=80',
      alt: 'TV wall mounting'
    },
    {
      url: 'https://images.pexels.com/photos/1444416/pexels-photo-1444416.jpeg?w=800&h=600&fit=crop',
      alt: 'Professional TV installation'
    },
    {
      url: 'https://images.unsplash.com/photo-1615986201152-7686a4867f30?w=800&h=600&fit=crop&q=80',
      alt: 'Wall mounted television'
    }
  ],
  'drywall-repair': [
    {
      url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&q=80',
      alt: 'Drywall repair service'
    },
    {
      url: 'https://images.pexels.com/photos/5691598/pexels-photo-5691598.jpeg?w=800&h=600&fit=crop',
      alt: 'Wall patching service'
    },
    {
      url: 'https://images.unsplash.com/photo-1562113530-57ba467cea38?w=800&h=600&fit=crop&q=80',
      alt: 'Drywall finishing'
    }
  ],

  // Personal Care
  'haircut-home': [
    {
      url: 'https://images.unsplash.com/photo-1599351431613-18ef1fdd27e3?w=800&h=600&fit=crop&q=80',
      alt: 'Home haircut service'
    },
    {
      url: 'https://images.pexels.com/photos/3992870/pexels-photo-3992870.jpeg?w=800&h=600&fit=crop',
      alt: 'Mobile barber service'
    },
    {
      url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&h=600&fit=crop&q=80',
      alt: 'Professional home styling'
    }
  ],
  'massage-therapy': [
    {
      url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop&q=80',
      alt: 'Professional massage therapy'
    },
    {
      url: 'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?w=800&h=600&fit=crop',
      alt: 'Relaxing spa massage'
    },
    {
      url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&h=600&fit=crop&q=80',
      alt: 'Home spa service'
    }
  ],
  'nail-service': [
    {
      url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop&q=80',
      alt: 'Professional nail service'
    },
    {
      url: 'https://images.pexels.com/photos/3738378/pexels-photo-3738378.jpeg?w=800&h=600&fit=crop',
      alt: 'Manicure service'
    },
    {
      url: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800&h=600&fit=crop&q=80',
      alt: 'Nail art service'
    }
  ],

  // Pet Care
  'dog-walking': [
    {
      url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop&q=80',
      alt: 'Professional dog walking'
    },
    {
      url: 'https://images.pexels.com/photos/4148987/pexels-photo-4148987.jpeg?w=800&h=600&fit=crop',
      alt: 'Dog walker with pets'
    },
    {
      url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop&q=80',
      alt: 'Happy dogs on walk'
    }
  ],
  'pet-grooming': [
    {
      url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&h=600&fit=crop&q=80',
      alt: 'Pet grooming service'
    },
    {
      url: 'https://images.pexels.com/photos/6235650/pexels-photo-6235650.jpeg?w=800&h=600&fit=crop',
      alt: 'Dog grooming salon'
    },
    {
      url: 'https://images.unsplash.com/photo-1632236542649-8fd3046b5c56?w=800&h=600&fit=crop&q=80',
      alt: 'Professional pet groomer'
    }
  ],

  // Automotive
  'car-wash': [
    {
      url: 'https://images.unsplash.com/photo-1590767187868-b8e9ece0ebb2?w=800&h=600&fit=crop&q=80',
      alt: 'Professional car wash'
    },
    {
      url: 'https://images.pexels.com/photos/1332244/pexels-photo-1332244.jpeg?w=800&h=600&fit=crop',
      alt: 'Mobile car washing'
    },
    {
      url: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&h=600&fit=crop&q=80',
      alt: 'Car detailing service'
    }
  ],
  'oil-change': [
    {
      url: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&h=600&fit=crop&q=80',
      alt: 'Mobile oil change service'
    },
    {
      url: 'https://images.pexels.com/photos/4481326/pexels-photo-4481326.jpeg?w=800&h=600&fit=crop',
      alt: 'Car maintenance service'
    },
    {
      url: 'https://images.unsplash.com/photo-1616428317087-5fbaa9c3dd01?w=800&h=600&fit=crop&q=80',
      alt: 'Auto mechanic at work'
    }
  ],

  // Moving Services
  'full-service-moving': [
    {
      url: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800&h=600&fit=crop&q=80',
      alt: 'Full service moving'
    },
    {
      url: 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?w=800&h=600&fit=crop',
      alt: 'Professional movers'
    },
    {
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
      alt: 'Moving truck service'
    }
  ],
  'packing-service': [
    {
      url: 'https://images.unsplash.com/photo-1609743522653-52354461eb7f?w=800&h=600&fit=crop&q=80',
      alt: 'Professional packing service'
    },
    {
      url: 'https://images.pexels.com/photos/4246265/pexels-photo-4246265.jpeg?w=800&h=600&fit=crop',
      alt: 'Moving boxes packed'
    },
    {
      url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop&q=80',
      alt: 'Careful packing service'
    }
  ],

  // Painting Services
  'painting-interior': [
    {
      url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=600&fit=crop&q=80',
      alt: 'Interior painting service'
    },
    {
      url: 'https://images.pexels.com/photos/1669754/pexels-photo-1669754.jpeg?w=800&h=600&fit=crop',
      alt: 'Room painting service'
    },
    {
      url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop&q=80',
      alt: 'Professional painter'
    }
  ],

  // Pest Control
  'pest-control': [
    {
      url: 'https://images.unsplash.com/photo-1569405780657-e13620a42aca?w=800&h=600&fit=crop&q=80',
      alt: 'Professional pest control'
    },
    {
      url: 'https://images.pexels.com/photos/4412936/pexels-photo-4412936.jpeg?w=800&h=600&fit=crop',
      alt: 'Pest control technician'
    },
    {
      url: 'https://images.unsplash.com/photo-1632219888006-7dcbf0c13ff3?w=800&h=600&fit=crop&q=80',
      alt: 'Home pest inspection'
    }
  ],

  // Tech Support
  'tech-support': [
    {
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&q=80',
      alt: 'Tech support assistance'
    },
    {
      url: 'https://images.pexels.com/photos/4709362/pexels-photo-4709362.jpeg?w=800&h=600&fit=crop',
      alt: 'Computer repair service'
    },
    {
      url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop&q=80',
      alt: 'IT support service'
    }
  ],

  // Security Services
  'security-installation': [
    {
      url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&h=600&fit=crop&q=80',
      alt: 'Security system installation'
    },
    {
      url: 'https://images.pexels.com/photos/4624874/pexels-photo-4624874.jpeg?w=800&h=600&fit=crop',
      alt: 'Smart home security'
    },
    {
      url: 'https://images.unsplash.com/photo-1585320394990-9c7c4a82b5d0?w=800&h=600&fit=crop&q=80',
      alt: 'Camera installation'
    }
  ],

  // Default/Fallback images
  'default': [
    {
      url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&q=80',
      alt: 'Professional home service'
    },
    {
      url: 'https://images.pexels.com/photos/3255761/pexels-photo-3255761.jpeg?w=800&h=600&fit=crop',
      alt: 'Service professional at work'
    },
    {
      url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop&q=80',
      alt: 'Quality home service'
    }
  ]
};

// Get a random service image from the set
export function getRandomServiceImage(serviceId: string): ServiceImage {
  const imageSet = SERVICE_IMAGE_SETS[serviceId] || SERVICE_IMAGE_SETS['default'];
  const randomIndex = Math.floor(Math.random() * imageSet.length);
  return imageSet[randomIndex];
}

// Get a specific image by index (for consistency)
export function getServiceImageByIndex(serviceId: string, index: number): ServiceImage {
  const imageSet = SERVICE_IMAGE_SETS[serviceId] || SERVICE_IMAGE_SETS['default'];
  return imageSet[index % imageSet.length];
}

// Get all images for a service
export function getAllServiceImages(serviceId: string): ServiceImage[] {
  return SERVICE_IMAGE_SETS[serviceId] || SERVICE_IMAGE_SETS['default'];
}

// Category hero images remain the same
export { CATEGORY_HERO_IMAGES, getCategoryHeroImage, IMAGE_BLUR_DATA_URL } from './service-images';