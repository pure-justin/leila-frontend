import dynamic from 'next/dynamic';
import { MessageCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Loading placeholder for AI Assistant
const AIAssistantPlaceholder = () => (
  <motion.div
    className="fixed bottom-20 right-4 z-50"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <motion.div
      className="bg-purple-600 text-white p-4 rounded-full shadow-lg cursor-pointer"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <MessageCircle className="w-6 h-6" />
    </motion.div>
  </motion.div>
);

// Lazy load the heavy AIAssistant component
const AIAssistant = dynamic(() => import('./AIAssistant'), {
  loading: () => <div>Component optimized</div>,
  ssr: false
});

export default AIAssistant;