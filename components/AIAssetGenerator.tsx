'use client';

import { JSX, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wand2, Download, Loader2, Image as ImageIcon, 
  Palette, Sparkles, Copy, Check
} from 'lucide-react';

interface AssetType {
  id: string;
  name: string;
  aspectRatio: string;
  icon: JSX.Element;
}

const assetTypes: AssetType[] = [
  { id: 'serviceCard', name: 'Service Card', aspectRatio: '1:1', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'serviceHero', name: 'Hero Banner', aspectRatio: '16:9', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'serviceThumbnail', name: 'Thumbnail', aspectRatio: '4:3', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'categoryBanner', name: 'Category Banner', aspectRatio: '16:9', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'icon', name: 'Icon', aspectRatio: '1:1', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'illustration', name: 'Illustration', aspectRatio: '1:1', icon: <Palette className="w-4 h-4" /> },
];

const styleModifiers = [
  { id: 'default', name: 'Brand Style' },
  { id: 'modern', name: 'Modern' },
  { id: 'classic', name: 'Classic' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'premium', name: 'Premium' },
  { id: 'friendly', name: 'Friendly' },
  { id: 'tech', name: 'Tech' },
  { id: 'eco', name: 'Eco-Friendly' },
];

export default function AIAssetGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [selectedType, setSelectedType] = useState('serviceCard');
  const [selectedStyle, setSelectedStyle] = useState('default');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAsset, setGeneratedAsset] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!subject.trim()) return;

    setIsGenerating(true);
    
    try {
      // Call your API endpoint to generate the image
      const response = await fetch('/api/generate-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          assetType: selectedType,
          styleModifier: selectedStyle === 'default' ? undefined : selectedStyle
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedAsset(data.url);
      }
    } catch (error) {
      console.error('Failed to generate asset:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = () => {
    const prompt = `Generate ${selectedType} for "${subject}" in ${selectedStyle} style`;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Wand2 className="w-6 h-6" />
      </motion.button>

      {/* Generator Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wand2 className="w-8 h-8" />
                    <div>
                      <h2 className="text-2xl font-bold">AI Asset Generator</h2>
                      <p className="text-purple-200">Create custom assets with Google Imagen 2</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Subject Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What do you need an asset for?
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., House Cleaning, Plumbing Repair, HVAC Service"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Asset Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {assetTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                          selectedType === type.id
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {type.icon}
                        <div className="text-left">
                          <p className="font-medium text-sm">{type.name}</p>
                          <p className="text-xs text-gray-500">{type.aspectRatio}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Style
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {styleModifiers.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedStyle === style.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generated Asset Preview */}
                {generatedAsset && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <img
                      src={generatedAsset}
                      alt="Generated asset"
                      className="w-full rounded-lg mb-4"
                    />
                    <div className="flex gap-2">
                      <a
                        href={generatedAsset}
                        download
                        className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                      <button
                        onClick={copyPrompt}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy Prompt'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={!subject.trim() || isGenerating}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        Generate Asset
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}