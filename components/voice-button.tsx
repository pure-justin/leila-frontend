'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { leilaVoice } from '@/lib/voice/leila-voice';
import { cn } from '@/lib/utils';

interface VoiceButtonProps {
  onTranscript?: (text: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  position?: 'fixed' | 'relative';
}

export default function VoiceButton({
  onTranscript,
  className,
  size = 'md',
  position = 'fixed'
}: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        setPulseAnimation(true);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        setPulseAnimation(false);
      };

      recognitionInstance.onresult = async (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        if (event.results[0].isFinal) {
          setIsProcessing(true);
          
          // Send transcript to parent
          if (onTranscript) {
            onTranscript(transcript);
          }

          // Process with Leila
          try {
            const response = await processVoiceCommand(transcript);
            
            // Speak response
            setIsSpeaking(true);
            await leilaVoice.speak(response);
            setIsSpeaking(false);
          } catch (error) {
            console.error('Voice processing error:', error);
            await leilaVoice.handleError();
          } finally {
            setIsProcessing(false);
          }
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setPulseAnimation(false);
        setIsProcessing(false);
      };

      setRecognition(recognitionInstance);
    }

    // Start wake word detection
    const startWakeWord = async () => {
      try {
        const stopWakeWord = await leilaVoice.startWakeWordDetection(() => {
          // Wake word detected, start listening
          if (recognition && !isListening) {
            recognition.start();
          }
        });

        return () => {
          stopWakeWord();
        };
      } catch (error) {
        console.error('Wake word detection error:', error);
      }
    };

    const cleanup = startWakeWord();

    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, [recognition, isListening, onTranscript]);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      // Play a subtle sound to indicate listening
      playStartSound();
    }
  };

  const processVoiceCommand = async (command: string): Promise<string> => {
    // Send to API for processing
    const response = await fetch('/api/voice/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    });

    const data = await response.json();
    return data.response || "I'm not sure how to help with that. Could you try again?";
  };

  const playStartSound = () => {
    const audio = new Audio('/sounds/start-listening.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <motion.div
      className={cn(
        position === 'fixed' && 'fixed bottom-6 right-6 z-50',
        className
      )}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Pulse animation */}
      <AnimatePresence>
        {pulseAnimation && (
          <>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListening}
        className={cn(
          'relative bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all',
          sizeClasses[size],
          isListening && 'from-red-500 to-red-600',
          isSpeaking && 'from-green-500 to-green-600',
          isProcessing && 'from-yellow-500 to-yellow-600'
        )}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
        ) : isSpeaking ? (
          <Volume2 className={cn(iconSizes[size], 'animate-pulse')} />
        ) : isListening ? (
          <MicOff className={iconSizes[size]} />
        ) : (
          <Mic className={iconSizes[size]} />
        )}
      </motion.button>

      {/* Status indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isListening || isSpeaking || isProcessing ? 1 : 0, y: 0 }}
        className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap"
      >
        {isProcessing ? 'Processing...' : 
         isSpeaking ? 'Speaking...' : 
         isListening ? 'Listening...' : ''}
      </motion.div>

      {/* Hint text */}
      {!isListening && !isSpeaking && !isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap"
        >
          Say "Hey Leila" or tap to talk
        </motion.div>
      )}
    </motion.div>
  );
}