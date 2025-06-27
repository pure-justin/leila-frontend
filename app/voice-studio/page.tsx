'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Pause, Download, Mic, Settings, Volume2, 
  Sparkles, Heart, Zap, Shield, Smile, AlertCircle
} from 'lucide-react';

interface VoiceOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  traits: string[];
  sample: string;
  rating: number;
}

const voiceOptions: VoiceOption[] = [
  {
    id: 'leila-flirty',
    name: 'Leila Flirty',
    provider: 'Hugging Face',
    description: 'Cute, playful, and charming. A flirty voice that makes customers smile.',
    traits: ['Flirty', 'Playful', 'Charming', 'Bubbly'],
    sample: '/audio/samples/leila-flirty.mp3',
    rating: 5.0
  },
  {
    id: 'leila-warm',
    name: 'Leila Warm',
    provider: 'Hugging Face',
    description: 'Warm, friendly, and approachable. Perfect for customer service.',
    traits: ['Warm', 'Friendly', 'Clear', 'Professional'],
    sample: '/audio/samples/leila-warm.mp3',
    rating: 4.9
  },
  {
    id: 'leila-professional',
    name: 'Leila Professional',
    provider: 'Hugging Face',
    description: 'Professional yet personable. Ideal for business interactions.',
    traits: ['Professional', 'Confident', 'Articulate', 'Trustworthy'],
    sample: '/audio/samples/leila-professional.mp3',
    rating: 4.8
  },
  {
    id: 'leila-energetic',
    name: 'Leila Energetic',
    provider: 'Hugging Face',
    description: 'Upbeat and enthusiastic. Great for promotions and excitement.',
    traits: ['Energetic', 'Enthusiastic', 'Dynamic', 'Engaging'],
    sample: '/audio/samples/leila-energetic.mp3',
    rating: 4.7
  }
];

const testPhrases = [
  {
    context: 'Flirty Greeting',
    text: "Hey there handsome! I'm Leila, your personal home service genie. What's your wish today?",
    emotion: 'flirty'
  },
  {
    context: 'Playful Booking',
    text: "Ooh, excellent choice! I've got your cleaning all set up for tomorrow. Can't wait to make your place sparkle!",
    emotion: 'playful'
  },
  {
    context: 'Cute Update',
    text: "Guess what? Your super talented plumber is just 15 minutes away! Exciting, right?",
    emotion: 'bubbly'
  },
  {
    context: 'Sweet Apology',
    text: "Oh no, I'm so sorry sweetie! Let me fix this for you right away. You deserve the best!",
    emotion: 'caring'
  },
  {
    context: 'Charming Recommendation',
    text: "You know what would be perfect for you? Our premium deep clean. Trust me, you'll love it!",
    emotion: 'charming'
  }
];

export default function VoiceStudioPage() {
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(voiceOptions[0]);
  const [customText, setCustomText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(testPhrases[0]);
  const [voiceSettings, setVoiceSettings] = useState({
    speed: 1.0,
    pitch: 0,
    volume: 1.0,
    emotion: 'friendly'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const emotions = [
    { id: 'flirty', icon: Heart, color: 'text-pink-500' },
    { id: 'playful', icon: Sparkles, color: 'text-purple-500' },
    { id: 'bubbly', icon: Smile, color: 'text-yellow-500' },
    { id: 'charming', icon: Zap, color: 'text-rose-500' },
    { id: 'professional', icon: Shield, color: 'text-blue-500' }
  ];

  const handlePlayVoice = async (text: string = currentPhrase.text) => {
    setIsGenerating(true);
    
    try {
      // Use local TTS for cost-effective synthesis
      const endpoint = process.env.NEXT_PUBLIC_USE_LOCAL_TTS === 'true' 
        ? '/api/voice/synthesize-local'
        : '/api/voice/synthesize';
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId: selectedVoice.id,
          settings: voiceSettings
        })
      });

      const { audioUrl } = await response.json();
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = voiceSettings.speed;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Voice synthesis error:', error);
      // For demo, play sample
      if (audioRef.current) {
        audioRef.current.src = selectedVoice.sample;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioRef.current?.src || selectedVoice.sample;
    link.download = `leila-voice-${selectedVoice.id}-${Date.now()}.mp3`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Hey Leila Voice Studio</h1>
          <p className="text-gray-600 text-lg">
            Create the perfect voice for Leila - warm, professional, and ultra-realistic
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Voice Selection Panel */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Voice Options</h2>
            
            {voiceOptions.map((voice) => (
              <motion.div
                key={voice.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedVoice(voice)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedVoice.id === voice.id
                    ? 'bg-white shadow-lg ring-2 ring-purple-500'
                    : 'bg-white shadow hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{voice.name}</h3>
                    <p className="text-sm text-gray-500">{voice.provider}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm">{voice.rating}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{voice.description}</p>
                
                <div className="flex flex-wrap gap-1">
                  {voice.traits.map((trait) => (
                    <span
                      key={trait}
                      className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Voice Testing Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Voice Settings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Voice Settings
              </h2>
              
              <div className="space-y-4">
                {/* Emotion Selector */}
                <div>
                  <label className="block text-sm font-medium mb-2">Emotion</label>
                  <div className="flex gap-2">
                    {emotions.map((emotion) => {
                      const Icon = emotion.icon;
                      return (
                        <button
                          key={emotion.id}
                          onClick={() => setVoiceSettings({ ...voiceSettings, emotion: emotion.id })}
                          className={`p-3 rounded-lg transition-all ${
                            voiceSettings.emotion === emotion.id
                              ? 'bg-purple-100 ring-2 ring-purple-500'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${emotion.color}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Speed Control */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Speed: {voiceSettings.speed.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={voiceSettings.speed}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, speed: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Pitch Control */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pitch: {voiceSettings.pitch > 0 ? '+' : ''}{voiceSettings.pitch}%
                  </label>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    step="5"
                    value={voiceSettings.pitch}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, pitch: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Volume Control */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Volume: {Math.round(voiceSettings.volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceSettings.volume}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, volume: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Test Phrases */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Test Phrases</h2>
              
              <div className="space-y-3">
                {testPhrases.map((phrase, index) => (
                  <div
                    key={index}
                    onClick={() => setCurrentPhrase(phrase)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      currentPhrase.text === phrase.text
                        ? 'bg-purple-50 ring-2 ring-purple-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-purple-600">
                        {phrase.context}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayVoice(phrase.text);
                        }}
                        className="p-1 hover:bg-purple-100 rounded"
                      >
                        <Play className="w-4 h-4 text-purple-600" />
                      </button>
                    </div>
                    <p className="text-gray-700">{phrase.text}</p>
                  </div>
                ))}
              </div>

              {/* Custom Text Input */}
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Custom Text</label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Type any text for Leila to say..."
                  className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                />
              </div>
            </div>

            {/* Playback Controls */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handlePlayVoice(customText || currentPhrase.text)}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : isPlaying ? (
                    <>
                      <Pause className="w-5 h-5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Play Voice</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50"
                >
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                </button>

                <button
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Mic className="w-5 h-5" />
                  <span>Record Custom</span>
                </button>
              </div>

              {/* Audio Waveform Visualization */}
              <div className="mt-6 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="flex items-center gap-1">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: isPlaying ? Math.random() * 60 + 20 : 20
                      }}
                      transition={{
                        duration: 0.2,
                        repeat: isPlaying ? Infinity : 0,
                        repeatType: 'reverse'
                      }}
                      className="w-2 bg-purple-500 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Voice Comparison */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Voice Characteristics</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Clarity</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                      <span className="text-sm">95%</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Naturalness</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      <span className="text-sm">92%</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Warmth</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                      <span className="text-sm">98%</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Professionalism</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                      <span className="text-sm">90%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-1">Voice Profile Summary</p>
                      <p>
                        {selectedVoice.name} provides an optimal balance of warmth and professionalism, 
                        perfect for customer interactions. The voice sounds natural and engaging while 
                        maintaining clarity across all speaking scenarios.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      </div>
    </div>
  );
}