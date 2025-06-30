'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { processVoiceCommand } from '@/lib/voice/voiceCommands';
import { speak } from '@/lib/voice/textToSpeech';
import { useRouter } from 'next/navigation';

interface VoiceAssistantProps {
  alwaysListening?: boolean;
  className?: string;
}

export function VoiceAssistant({ alwaysListening = false, className = '' }: VoiceAssistantProps) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleVoiceResult = useCallback(async (transcript: string, isFinal: boolean) => {
    if (!isFinal || isProcessing) return;

    setIsProcessing(true);
    
    try {
      // Process the voice command
      const result = await processVoiceCommand(transcript);
      
      if (result.response) {
        setResponse(result.response);
        
        // Speak the response
        setIsSpeaking(true);
        await speak(result.response);
        setIsSpeaking(false);
      }

      // Handle navigation
      if (result.action) {
        switch (result.action.type) {
          case 'navigate':
            router.push(result.action.path);
            break;
          case 'book':
            router.push(`/book?service=${result.action.service}`);
            break;
          case 'search':
            router.push(`/services?q=${result.action.query}`);
            break;
        }
      }

      // Auto-close after response
      if (!alwaysListening) {
        setTimeout(() => {
          setIsActive(false);
          setResponse('');
        }, 3000);
      }
    } catch (error) {
      console.error('Voice command error:', error);
      const errorMessage = "I'm sorry, I didn't understand that. Please try again.";
      setResponse(errorMessage);
      await speak(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, router, alwaysListening]);

  const { isListening, transcript, isSupported, start, stop } = useVoiceRecognition({
    continuous: alwaysListening,
    onResult: handleVoiceResult,
    onError: (error) => {
      console.error('Voice recognition error:', error);
      setResponse("I'm having trouble hearing you. Please check your microphone.");
    }
  });

  // Auto-start listening when activated
  useEffect(() => {
    if (isActive && !isListening) {
      start();
    } else if (!isActive && isListening) {
      stop();
    }
  }, [isActive, isListening, start, stop]);

  // Always listening mode
  useEffect(() => {
    if (alwaysListening && isSupported) {
      start();
    }
    return () => {
      if (alwaysListening) {
        stop();
      }
    };
  }, [alwaysListening, isSupported, start, stop]);

  if (!isSupported) {
    return null;
  }

  return (
    <>
      {/* Floating Voice Button */}
      {!alwaysListening && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsActive(!isActive)}
          className={`fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all ${className}`}
        >
          {isListening ? (
            <Mic className="w-6 h-6 animate-pulse" />
          ) : (
            <MicOff className="w-6 h-6" />
          )}
        </motion.button>
      )}

      {/* Voice Assistant Modal */}
      <AnimatePresence>
        {(isActive || alwaysListening) && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6 max-w-lg mx-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Hey Leila</h3>
              {!alwaysListening && (
                <button
                  onClick={() => setIsActive(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Voice Visualization */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <motion.div
                  animate={{
                    scale: isListening ? [1, 1.2, 1] : 1,
                    opacity: isListening ? [0.5, 1, 0.5] : 0.5
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl"
                />
                <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${
                  isListening ? 'bg-primary-500' : 'bg-gray-300'
                } transition-colors`}>
                  {isSpeaking ? (
                    <Volume2 className="w-10 h-10 text-white animate-pulse" />
                  ) : (
                    <Mic className={`w-10 h-10 ${isListening ? 'text-white' : 'text-gray-600'}`} />
                  )}
                </div>
              </div>
            </div>

            {/* Status Text */}
            <div className="text-center mb-4">
              {isProcessing ? (
                <p className="text-gray-600 animate-pulse">Processing...</p>
              ) : isListening ? (
                <p className="text-primary-600 font-medium">Listening...</p>
              ) : (
                <p className="text-gray-500">Say "Hey Leila" to start</p>
              )}
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">You said:</span> {transcript}
                </p>
              </div>
            )}

            {/* Response */}
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-primary-50 rounded-lg"
              >
                <p className="text-gray-800">{response}</p>
              </motion.div>
            )}

            {/* Example Commands */}
            {!transcript && !response && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Try saying:</p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">"Book a house cleaning"</p>
                  <p className="text-xs text-gray-600">"Show me plumbing services"</p>
                  <p className="text-xs text-gray-600">"Track my booking"</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}