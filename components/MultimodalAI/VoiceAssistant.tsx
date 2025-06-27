import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceAssistantProps {
  onCommand: (command: string, confidence: number) => void;
  onVisionCapture?: (imageData: string) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ 
  onCommand, 
  onVisionCapture 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceWaveform, setVoiceWaveform] = useState<number[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  
  // Initialize WebRTC and Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        const confidence = event.results[last][0].confidence;
        
        setTranscript(transcript);
        
        // Detect "Hey Leila" wake word
        if (transcript.toLowerCase().includes('hey leila')) {
          setIsProcessing(true);
          const command = transcript.toLowerCase().replace('hey leila', '').trim();
          onCommand(command, confidence);
          
          // Reset after processing
          setTimeout(() => {
            setIsProcessing(false);
            setTranscript('');
          }, 2000);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onCommand]);
  
  // Audio visualization
  const startAudioVisualization = async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false 
      });
      
      audioContextRef.current = new AudioContext();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
      source.connect(analyzerRef.current);
      
      analyzerRef.current.fftSize = 256;
      const bufferLength = analyzerRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateWaveform = () => {
        if (!analyzerRef.current || !isListening) return;
        
        analyzerRef.current.getByteFrequencyData(dataArray);
        const normalizedData = Array.from(dataArray).map(value => value / 255);
        setVoiceWaveform(normalizedData.slice(0, 50)); // Show first 50 frequencies
        
        requestAnimationFrame(updateWaveform);
      };
      
      updateWaveform();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };
  
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      startAudioVisualization();
    }
  };
  
  // Camera capture for vision features
  const captureImage = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Wait for video to be ready
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      onVisionCapture?.(imageData);
      
      // Clean up
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  }, [onVisionCapture]);
  
  return (
    <div className="fixed bottom-20 right-6 z-50">
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-full mb-4 right-0 bg-white rounded-lg shadow-xl p-4 min-w-[300px]"
          >
            {/* Voice Waveform Visualization */}
            <div className="flex items-center justify-center h-20 mb-3">
              <div className="flex items-end space-x-1">
                {voiceWaveform.map((value, index) => (
                  <motion.div
                    key={index}
                    className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
                    animate={{
                      height: `${Math.max(4, value * 80)}px`,
                    }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>
            </div>
            
            {/* Transcript */}
            <div className="text-sm text-gray-600 mb-2">
              {isProcessing ? (
                <span className="text-green-600 font-semibold">Processing...</span>
              ) : transcript || (
                <span className="italic">Say "Hey Leila" followed by your request</span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={captureImage}
                className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors"
              >
                📷 Capture Issue
              </button>
              <button
                onClick={() => setTranscript('')}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Assistant Button */}
      <motion.button
        onClick={toggleListening}
        className={`relative w-16 h-16 rounded-full shadow-lg transition-all ${
          isListening 
            ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
            : 'bg-white hover:shadow-xl'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Pulsing Animation when listening */}
        {isListening && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.5,
              }}
            />
          </>
        )}
        
        {/* Microphone Icon */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <svg
            className={`w-8 h-8 ${isListening ? 'text-white' : 'text-gray-700'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        
        {/* Status Indicator */}
        <div className={`absolute top-0 right-0 w-3 h-3 rounded-full ${
          isProcessing ? 'bg-green-500' : isListening ? 'bg-red-500' : 'bg-gray-400'
        }`}>
          {isListening && (
            <motion.div
              className="absolute inset-0 rounded-full bg-red-500"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
      </motion.button>
    </div>
  );
};