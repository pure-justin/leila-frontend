import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

// Loading placeholder that matches the component's expected size
const MapLoadingPlaceholder = () => (
  <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center">
    <div className="text-center p-8">
      <motion.div
        className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <MapPin className="w-10 h-10 text-purple-600" />
      </motion.div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">Loading Interactive Map</h3>
      <p className="text-gray-600 mb-4">Preparing your area view...</p>
      <div className="flex justify-center space-x-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-purple-600 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  </div>
);

// Lazy load the heavy ServiceMap3D component
const ServiceMap3D = dynamic(() => import('./ServiceMap3D'), {
  loading: () => <MapLoadingPlaceholder />,
  ssr: false // Disable SSR for map component
});

export default ServiceMap3D;