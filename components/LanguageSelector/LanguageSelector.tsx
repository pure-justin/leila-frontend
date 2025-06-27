import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, Search } from 'lucide-react';
import { advancedVoice } from '@/services/advancedVoice';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

const popularLanguages: Language[] = [
  { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'pt-BR', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
];

const allLanguages: Language[] = [
  ...popularLanguages,
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'pl-PL', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'th-TH', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'uk-UA', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'ro-RO', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'hu-HU', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'cs-CZ', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'el-GR', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'he-IW', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
  { code: 'fa-IR', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', rtl: true },
  { code: 'bn-BD', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'ur-PK', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', rtl: true },
  { code: 'sw-KE', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'am-ET', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
  // Add more as needed...
];

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  showWelcomeMessage?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  showWelcomeMessage = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState(
    allLanguages.find(l => l.code === currentLanguage) || allLanguages[0]
  );
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    if (showWelcomeMessage && selectedLang) {
      generateWelcomeMessage(selectedLang.code);
    }
  }, [selectedLang, showWelcomeMessage]);

  const generateWelcomeMessage = async (langCode: string) => {
    const messages = {
      'en-US': 'Welcome! How can I help you today?',
      'es-ES': '¡Bienvenido! ¿Cómo puedo ayudarte hoy?',
      'zh-CN': '欢迎！今天我能为您做什么？',
      'hi-IN': 'स्वागत है! आज मैं आपकी कैसे मदद कर सकता हूं?',
      'ar-SA': 'مرحبا! كيف يمكنني مساعدتك اليوم؟',
      'fr-FR': 'Bienvenue! Comment puis-je vous aider aujourd\'hui?',
      'ru-RU': 'Добро пожаловать! Чем я могу помочь вам сегодня?',
      'pt-BR': 'Bem-vindo! Como posso ajudá-lo hoje?',
      'ja-JP': 'ようこそ！今日はどのようなご用件でしょうか？',
      'de-DE': 'Willkommen! Wie kann ich Ihnen heute helfen?',
    };

    setWelcomeMessage(messages[langCode] || messages['en-US']);
  };

  const filteredLanguages = allLanguages.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageSelect = (language: Language) => {
    setSelectedLang(language);
    onLanguageChange(language.code);
    setIsOpen(false);
    
    // Update document direction for RTL languages
    document.documentElement.dir = language.rtl ? 'rtl' : 'ltr';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Globe className="w-5 h-5 text-gray-600" />
        <span className="text-xl">{selectedLang.flag}</span>
        <span className="font-medium">{selectedLang.nativeName}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Language Picker */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full mt-2 right-0 w-96 bg-white rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Search */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search languages..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Popular Languages */}
              {!searchQuery && (
                <div className="p-4 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-600 mb-3">Popular Languages</p>
                  <div className="grid grid-cols-5 gap-2">
                    {popularLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang)}
                        className={`p-3 rounded-lg text-2xl hover:bg-gray-100 transition-colors ${
                          selectedLang.code === lang.code ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                        }`}
                        title={lang.name}
                      >
                        {lang.flag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All Languages */}
              <div className="max-h-96 overflow-y-auto">
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-600 mb-3">
                    {searchQuery ? 'Search Results' : 'All Languages'} ({filteredLanguages.length})
                  </p>
                  <div className="space-y-1">
                    {filteredLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                          selectedLang.code === lang.code ? 'bg-blue-50' : ''
                        }`}
                        dir={lang.rtl ? 'rtl' : 'ltr'}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{lang.flag}</span>
                          <div className="text-left">
                            <p className="font-medium">{lang.nativeName}</p>
                            <p className="text-sm text-gray-600">{lang.name}</p>
                          </div>
                        </div>
                        {selectedLang.code === lang.code && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Features Notice */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-100">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">🎯 AI-Powered:</span> Leila speaks 100+ languages 
                  with accent adaptation and cultural awareness
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Welcome Message */}
      {showWelcomeMessage && welcomeMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
        >
          <p className="text-lg font-medium text-gray-800" dir={selectedLang.rtl ? 'rtl' : 'ltr'}>
            {welcomeMessage}
          </p>
        </motion.div>
      )}
    </div>
  );
};