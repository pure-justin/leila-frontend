// Professional service images from Pexels - Direct URLs
// These are high-quality, professional images for each service category

export interface ServiceImage {
  url: string;
  alt: string;
  credit?: string;
}

// Category hero images - beautiful, lifestyle shots
export const CATEGORY_HERO_IMAGES: Record<string, ServiceImage> = {
  'electrical': {
    url: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional electrician working on electrical panel',
    credit: 'Photo by Pixabay on Pexels'
  },
  'plumbing': {
    url: 'https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Modern bathroom with elegant plumbing fixtures',
    credit: 'Photo by Max Vakhtbovych on Pexels'
  },
  'hvac': {
    url: 'https://images.pexels.com/photos/3964736/pexels-photo-3964736.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'HVAC technician servicing air conditioning unit',
    credit: 'Photo by Gustavo Fring on Pexels'
  },
  'cleaning': {
    url: 'https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional cleaning service in modern home',
    credit: 'Photo by Karolina Grabowska on Pexels'
  },
  'landscaping': {
    url: 'https://images.pexels.com/photos/1599969/pexels-photo-1599969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Beautiful landscaped garden with professional care',
    credit: 'Photo by Greta Hoffman on Pexels'
  },
  'pest-control': {
    url: 'https://images.pexels.com/photos/4481326/pexels-photo-4481326.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional pest control technician at work',
    credit: 'Photo by Michelangelo Buonarroti on Pexels'
  },
  'handyman': {
    url: 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional handyman with complete tool set',
    credit: 'Photo by Pixabay on Pexels'
  },
  'painting': {
    url: 'https://images.pexels.com/photos/4481942/pexels-photo-4481942.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional painter working on interior walls',
    credit: 'Photo by Ksenia Chernaya on Pexels'
  },
  'appliance-repair': {
    url: 'https://images.pexels.com/photos/5463576/pexels-photo-5463576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Appliance repair technician fixing kitchen appliance',
    credit: 'Photo by Los Muertos Crew on Pexels'
  },
  'carpentry': {
    url: 'https://images.pexels.com/photos/1094767/pexels-photo-1094767.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional carpenter crafting custom furniture',
    credit: 'Photo by Pixabay on Pexels'
  },
  'flooring': {
    url: 'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional flooring installation in progress',
    credit: 'Photo by Max Vakhtbovych on Pexels'
  },
  'roofing': {
    url: 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional roofers installing new shingles',
    credit: 'Photo by Rene Asmussen on Pexels'
  },
  'windows-doors': {
    url: 'https://images.pexels.com/photos/279810/pexels-photo-279810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional window and door installation',
    credit: 'Photo by Pixabay on Pexels'
  },
  'personal-care': {
    url: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional beauty and personal care services',
    credit: 'Photo by Andrea Piacquadio on Pexels'
  },
  'pet-care': {
    url: 'https://images.pexels.com/photos/6235241/pexels-photo-6235241.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional pet grooming and care services',
    credit: 'Photo by Goochie Poochie Grooming on Pexels'
  },
  'automotive': {
    url: 'https://images.pexels.com/photos/3806983/pexels-photo-3806983.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional auto detailing and car care',
    credit: 'Photo by Tima Miroshnichenko on Pexels'
  },
  'moving': {
    url: 'https://images.pexels.com/photos/4246266/pexels-photo-4246266.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional moving services team',
    credit: 'Photo by Karolina Grabowska on Pexels'
  },
  'tech-support': {
    url: 'https://images.pexels.com/photos/4709285/pexels-photo-4709285.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Tech support specialist helping with computer',
    credit: 'Photo by Yan Krukov on Pexels'
  },
  'security': {
    url: 'https://images.pexels.com/photos/8547008/pexels-photo-8547008.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Modern home security system installation',
    credit: 'Photo by Kindel Media on Pexels'
  },
  'pool-spa': {
    url: 'https://images.pexels.com/photos/261238/pexels-photo-261238.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional pool maintenance and spa services',
    credit: 'Photo by Pixabay on Pexels'
  },
  'solar': {
    url: 'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Solar panel installation on residential roof',
    credit: 'Photo by Pixabay on Pexels'
  },
  'gutter': {
    url: 'https://images.pexels.com/photos/8961090/pexels-photo-8961090.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional gutter cleaning and maintenance',
    credit: 'Photo by Los Muertos Crew on Pexels'
  },
  'garage': {
    url: 'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Garage door repair and installation',
    credit: 'Photo by PhotoMIX Company on Pexels'
  },
  'organizing': {
    url: 'https://images.pexels.com/photos/4246196/pexels-photo-4246196.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional home organization services',
    credit: 'Photo by Karolina Grabowska on Pexels'
  },
  'contractor-services': {
    url: 'https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional contractor team at construction site',
    credit: 'Photo by Burst on Pexels'
  }
};

// Specific service images mapped to comprehensive service catalog IDs
export const SERVICE_IMAGES: Record<string, ServiceImage> = {
  // Electrical Services
  'electrical-repair': {
    url: 'https://images.pexels.com/photos/1435737/pexels-photo-1435737.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Electrician repairing electrical outlet',
    credit: 'Photo by Ksenia Chernaya on Pexels'
  },
  'panel-upgrade': {
    url: 'https://images.pexels.com/photos/257700/pexels-photo-257700.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Electrical panel upgrade installation',
    credit: 'Photo by Pixabay on Pexels'
  },
  'ev-charger-install': {
    url: 'https://images.pexels.com/photos/5086477/pexels-photo-5086477.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Electric vehicle charger installation',
    credit: 'Photo by Kindel Media on Pexels'
  },
  'lighting-install': {
    url: 'https://images.pexels.com/photos/5824517/pexels-photo-5824517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional lighting fixture installation',
    credit: 'Photo by Max Vakhtbovych on Pexels'
  },
  'ceiling-fan-install': {
    url: 'https://images.pexels.com/photos/7861921/pexels-photo-7861921.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Ceiling fan installation service',
    credit: 'Photo by Curtis Adams on Pexels'
  },
  'outlet-switch-repair': {
    url: 'https://images.pexels.com/photos/7881369/pexels-photo-7881369.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Outlet and switch repair service',
    credit: 'Photo by La Miko on Pexels'
  },
  'wiring-install': {
    url: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional electrical wiring installation',
    credit: 'Photo by Pixabay on Pexels'
  },
  'generator-install': {
    url: 'https://images.pexels.com/photos/3862634/pexels-photo-3862634.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Backup generator installation',
    credit: 'Photo by Los Muertos Crew on Pexels'
  },

  // Plumbing Services
  'leak-repair': {
    url: 'https://images.pexels.com/photos/5774807/pexels-photo-5774807.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Plumber fixing water leak',
    credit: 'Photo by Kindel Media on Pexels'
  },
  'drain-cleaning': {
    url: 'https://images.pexels.com/photos/6419179/pexels-photo-6419179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional drain cleaning service',
    credit: 'Photo by Max Vakhtbovych on Pexels'
  },
  'toilet-repair': {
    url: 'https://images.pexels.com/photos/6444258/pexels-photo-6444258.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Toilet repair and maintenance',
    credit: 'Photo by Max Vakhtbovych on Pexels'
  },
  'water-heater-install': {
    url: 'https://images.pexels.com/photos/15616669/pexels-photo-15616669.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Water heater installation service',
    credit: 'Photo by Rene Asmussen on Pexels'
  },
  'faucet-install': {
    url: 'https://images.pexels.com/photos/7641844/pexels-photo-7641844.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Kitchen faucet installation',
    credit: 'Photo by Curtis Adams on Pexels'
  },
  'pipe-repair': {
    url: 'https://images.pexels.com/photos/8486985/pexels-photo-8486985.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional pipe repair service',
    credit: 'Photo by La Miko on Pexels'
  },
  'sewer-repair': {
    url: 'https://images.pexels.com/photos/5774805/pexels-photo-5774805.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Sewer line repair and maintenance',
    credit: 'Photo by Kindel Media on Pexels'
  },
  'garbage-disposal': {
    url: 'https://images.pexels.com/photos/6419160/pexels-photo-6419160.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Garbage disposal installation',
    credit: 'Photo by Max Vakhtbovych on Pexels'
  },

  // HVAC Services
  'ac-repair': {
    url: 'https://images.pexels.com/photos/3964704/pexels-photo-3964704.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Air conditioner repair service',
    credit: 'Photo by Gustavo Fring on Pexels'
  },
  'furnace-repair': {
    url: 'https://images.pexels.com/photos/7269666/pexels-photo-7269666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Furnace repair and maintenance',
    credit: 'Photo by Kindel Media on Pexels'
  },
  'hvac-maintenance': {
    url: 'https://images.pexels.com/photos/3964736/pexels-photo-3964736.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'HVAC system maintenance',
    credit: 'Photo by Gustavo Fring on Pexels'
  },
  'duct-cleaning': {
    url: 'https://images.pexels.com/photos/7269665/pexels-photo-7269665.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Air duct cleaning service',
    credit: 'Photo by Kindel Media on Pexels'
  },
  'thermostat-install': {
    url: 'https://images.pexels.com/photos/7641846/pexels-photo-7641846.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Smart thermostat installation',
    credit: 'Photo by Curtis Adams on Pexels'
  },
  'ac-install': {
    url: 'https://images.pexels.com/photos/7269662/pexels-photo-7269662.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'New AC unit installation',
    credit: 'Photo by Kindel Media on Pexels'
  },
  'heat-pump-service': {
    url: 'https://images.pexels.com/photos/3964705/pexels-photo-3964705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Heat pump service and repair',
    credit: 'Photo by Gustavo Fring on Pexels'
  },
  'air-quality': {
    url: 'https://images.pexels.com/photos/7641859/pexels-photo-7641859.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Indoor air quality improvement',
    credit: 'Photo by Curtis Adams on Pexels'
  },

  // Cleaning Services
  'house-cleaning': {
    url: 'https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional house cleaning service',
    credit: 'Photo by Karolina Grabowska on Pexels'
  },
  'deep-cleaning': {
    url: 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Deep cleaning service',
    credit: 'Photo by Karolina Grabowska on Pexels'
  },
  'move-cleaning': {
    url: 'https://images.pexels.com/photos/4246232/pexels-photo-4246232.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Move-in/move-out cleaning',
    credit: 'Photo by Karolina Grabowska on Pexels'
  },
  'carpet-cleaning': {
    url: 'https://images.pexels.com/photos/4107278/pexels-photo-4107278.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional carpet cleaning',
    credit: 'Photo by RDNE Stock project on Pexels'
  },
  'window-cleaning': {
    url: 'https://images.pexels.com/photos/4098778/pexels-photo-4098778.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Window cleaning service',
    credit: 'Photo by Nathan Cowley on Pexels'
  },
  'pressure-washing': {
    url: 'https://images.pexels.com/photos/9462317/pexels-photo-9462317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Pressure washing service',
    credit: 'Photo by Tima Miroshnichenko on Pexels'
  },
  'office-cleaning': {
    url: 'https://images.pexels.com/photos/4239037/pexels-photo-4239037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Commercial office cleaning',
    credit: 'Photo by Karolina Grabowska on Pexels'
  },
  'post-construction': {
    url: 'https://images.pexels.com/photos/4239147/pexels-photo-4239147.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Post-construction cleanup',
    credit: 'Photo by Karolina Grabowska on Pexels'
  },

  // Landscaping Services
  'lawn-mowing': {
    url: 'https://images.pexels.com/photos/1453499/pexels-photo-1453499.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional lawn mowing service',
    credit: 'Photo by Magic K on Pexels'
  },
  'tree-trimming': {
    url: 'https://images.pexels.com/photos/4750274/pexels-photo-4750274.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Tree trimming and pruning',
    credit: 'Photo by Anna Shvets on Pexels'
  },
  'garden-design': {
    url: 'https://images.pexels.com/photos/1105019/pexels-photo-1105019.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional garden design',
    credit: 'Photo by Greta Hoffman on Pexels'
  },
  'sprinkler-install': {
    url: 'https://images.pexels.com/photos/4750262/pexels-photo-4750262.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Sprinkler system installation',
    credit: 'Photo by Anna Shvets on Pexels'
  },
  'sod-installation': {
    url: 'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'New sod installation',
    credit: 'Photo by Jonathan Petersson on Pexels'
  },
  'mulching': {
    url: 'https://images.pexels.com/photos/4750263/pexels-photo-4750263.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional mulching service',
    credit: 'Photo by Anna Shvets on Pexels'
  },
  'leaf-removal': {
    url: 'https://images.pexels.com/photos/6231874/pexels-photo-6231874.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Fall leaf removal service',
    credit: 'Photo by Yan Krukov on Pexels'
  },
  'landscape-lighting': {
    url: 'https://images.pexels.com/photos/7728896/pexels-photo-7728896.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Landscape lighting installation',
    credit: 'Photo by Max Vakhtbovych on Pexels'
  },

  // Pest Control Services
  'general-pest': {
    url: 'https://images.pexels.com/photos/4481326/pexels-photo-4481326.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'General pest control treatment',
    credit: 'Photo by Michelangelo Buonarroti on Pexels'
  },
  'termite-control': {
    url: 'https://images.pexels.com/photos/7641904/pexels-photo-7641904.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Termite inspection and control',
    credit: 'Photo by Curtis Adams on Pexels'
  },
  'rodent-control': {
    url: 'https://images.pexels.com/photos/4481328/pexels-photo-4481328.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Rodent control service',
    credit: 'Photo by Michelangelo Buonarroti on Pexels'
  },
  'ant-control': {
    url: 'https://images.pexels.com/photos/7641903/pexels-photo-7641903.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Ant control treatment',
    credit: 'Photo by Curtis Adams on Pexels'
  },
  'mosquito-control': {
    url: 'https://images.pexels.com/photos/4481327/pexels-photo-4481327.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Mosquito control service',
    credit: 'Photo by Michelangelo Buonarroti on Pexels'
  },
  'bed-bug-treatment': {
    url: 'https://images.pexels.com/photos/6444218/pexels-photo-6444218.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Bed bug treatment service',
    credit: 'Photo by Max Vakhtbovych on Pexels'
  },
  'wildlife-removal': {
    url: 'https://images.pexels.com/photos/4750276/pexels-photo-4750276.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Wildlife removal service',
    credit: 'Photo by Anna Shvets on Pexels'
  },
  'pest-prevention': {
    url: 'https://images.pexels.com/photos/7641902/pexels-photo-7641902.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Pest prevention treatment',
    credit: 'Photo by Curtis Adams on Pexels'
  },

  // Handyman Services
  'furniture-assembly': {
    url: 'https://images.pexels.com/photos/5089178/pexels-photo-5089178.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Furniture assembly service',
    credit: 'Photo by Anete Lusina on Pexels'
  },
  'tv-mounting': {
    url: 'https://images.pexels.com/photos/7130475/pexels-photo-7130475.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'TV wall mounting service',
    credit: 'Photo by Vecislavas Popa on Pexels'
  },
  'picture-hanging': {
    url: 'https://images.pexels.com/photos/5824523/pexels-photo-5824523.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Picture hanging service',
    credit: 'Photo by Max Vakhtbovych on Pexels'
  },
  'shelf-installation': {
    url: 'https://images.pexels.com/photos/6444339/pexels-photo-6444339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Shelf installation service',
    credit: 'Photo by Max Vakhtbovych on Pexels'
  },
  'door-repair': {
    url: 'https://images.pexels.com/photos/8961495/pexels-photo-8961495.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Door repair and adjustment',
    credit: 'Photo by Los Muertos Crew on Pexels'
  },
  'drywall-repair': {
    url: 'https://images.pexels.com/photos/7218525/pexels-photo-7218525.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Drywall repair service',
    credit: 'Photo by Ivan Samkov on Pexels'
  },
  'caulking': {
    url: 'https://images.pexels.com/photos/6474471/pexels-photo-6474471.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Caulking and sealing service',
    credit: 'Photo by Ksenia Chernaya on Pexels'
  },
  'general-repairs': {
    url: 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'General handyman repairs',
    credit: 'Photo by Pixabay on Pexels'
  },

  // Painting Services
  'interior-painting': {
    url: 'https://images.pexels.com/photos/7218006/pexels-photo-7218006.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Interior wall painting',
    credit: 'Photo by Ivan Samkov on Pexels'
  },
  'exterior-painting': {
    url: 'https://images.pexels.com/photos/221027/pexels-photo-221027.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Exterior house painting',
    credit: 'Photo by Pixabay on Pexels'
  },
  'cabinet-painting': {
    url: 'https://images.pexels.com/photos/6474516/pexels-photo-6474516.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Cabinet painting and refinishing',
    credit: 'Photo by Ksenia Chernaya on Pexels'
  },
  'deck-staining': {
    url: 'https://images.pexels.com/photos/7031593/pexels-photo-7031593.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Deck staining service',
    credit: 'Photo by Ron Lach on Pexels'
  },
  'wallpaper-removal': {
    url: 'https://images.pexels.com/photos/7641976/pexels-photo-7641976.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Wallpaper removal service',
    credit: 'Photo by Curtis Adams on Pexels'
  },
  'texture-painting': {
    url: 'https://images.pexels.com/photos/6474520/pexels-photo-6474520.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Texture painting service',
    credit: 'Photo by Ksenia Chernaya on Pexels'
  },
  'power-washing-paint': {
    url: 'https://images.pexels.com/photos/9462318/pexels-photo-9462318.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Power washing before painting',
    credit: 'Photo by Tima Miroshnichenko on Pexels'
  },
  'trim-painting': {
    url: 'https://images.pexels.com/photos/7218523/pexels-photo-7218523.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Trim and molding painting',
    credit: 'Photo by Ivan Samkov on Pexels'
  },

  // Default fallback
  'default': {
    url: 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional home service',
    credit: 'Photo by Pixabay on Pexels'
  }
};

// Get service image with fallback
export function getServiceImage(serviceId: string): ServiceImage {
  return SERVICE_IMAGES[serviceId] || SERVICE_IMAGES['default'];
}

// Get category hero image with fallback
export function getCategoryHeroImage(categoryId: string): ServiceImage {
  return CATEGORY_HERO_IMAGES[categoryId] || CATEGORY_HERO_IMAGES['contractor-services'];
}

// Get multiple images for a service (for galleries)
export function getServiceGallery(serviceId: string, count: number = 3): ServiceImage[] {
  const images: ServiceImage[] = [];
  const mainImage = getServiceImage(serviceId);
  images.push(mainImage);
  
  // Add category image if different
  const categoryId = getCategoryForService(serviceId);
  const categoryImage = getCategoryHeroImage(categoryId);
  if (categoryImage.url !== mainImage.url) {
    images.push(categoryImage);
  }
  
  // Add default if needed
  if (images.length < count && mainImage.url !== SERVICE_IMAGES['default'].url) {
    images.push(SERVICE_IMAGES['default']);
  }
  
  return images.slice(0, count);
}

// Helper to map service to category
function getCategoryForService(serviceId: string): string {
  const categoryMap: Record<string, string> = {
    'electrical-repair': 'electrical',
    'panel-upgrade': 'electrical',
    'ev-charger-install': 'electrical',
    'lighting-install': 'electrical',
    'ceiling-fan-install': 'electrical',
    'outlet-switch-repair': 'electrical',
    'wiring-install': 'electrical',
    'generator-install': 'electrical',
    
    'leak-repair': 'plumbing',
    'drain-cleaning': 'plumbing',
    'toilet-repair': 'plumbing',
    'water-heater-install': 'plumbing',
    'faucet-install': 'plumbing',
    'pipe-repair': 'plumbing',
    'sewer-repair': 'plumbing',
    'garbage-disposal': 'plumbing',
    
    'ac-repair': 'hvac',
    'furnace-repair': 'hvac',
    'hvac-maintenance': 'hvac',
    'duct-cleaning': 'hvac',
    'thermostat-install': 'hvac',
    'ac-install': 'hvac',
    'heat-pump-service': 'hvac',
    'air-quality': 'hvac',
    
    'house-cleaning': 'cleaning',
    'deep-cleaning': 'cleaning',
    'move-cleaning': 'cleaning',
    'carpet-cleaning': 'cleaning',
    'window-cleaning': 'cleaning',
    'pressure-washing': 'cleaning',
    'office-cleaning': 'cleaning',
    'post-construction': 'cleaning',
    
    'lawn-mowing': 'landscaping',
    'tree-trimming': 'landscaping',
    'garden-design': 'landscaping',
    'sprinkler-install': 'landscaping',
    'sod-installation': 'landscaping',
    'mulching': 'landscaping',
    'leaf-removal': 'landscaping',
    'landscape-lighting': 'landscaping',
    
    'general-pest': 'pest-control',
    'termite-control': 'pest-control',
    'rodent-control': 'pest-control',
    'ant-control': 'pest-control',
    'mosquito-control': 'pest-control',
    'bed-bug-treatment': 'pest-control',
    'wildlife-removal': 'pest-control',
    'pest-prevention': 'pest-control',
    
    'furniture-assembly': 'handyman',
    'tv-mounting': 'handyman',
    'picture-hanging': 'handyman',
    'shelf-installation': 'handyman',
    'door-repair': 'handyman',
    'drywall-repair': 'handyman',
    'caulking': 'handyman',
    'general-repairs': 'handyman',
    
    'interior-painting': 'painting',
    'exterior-painting': 'painting',
    'cabinet-painting': 'painting',
    'deck-staining': 'painting',
    'wallpaper-removal': 'painting',
    'texture-painting': 'painting',
    'power-washing-paint': 'painting',
    'trim-painting': 'painting'
  };
  
  return categoryMap[serviceId] || 'contractor-services';
}

// Image loading states
export const IMAGE_BLUR_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjYiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=';