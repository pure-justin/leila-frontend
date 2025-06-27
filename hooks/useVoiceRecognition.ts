import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionError extends Event {
  error: string;
  message?: string;
}

interface UseVoiceRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  keywords?: string[];
}

export const useVoiceRecognition = ({
  continuous = false,
  interimResults = true,
  language = 'en-US',
  onResult,
  onError,
  keywords = ['hey leila', 'leila', 'hey layla', 'layla']
}: UseVoiceRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = interimResults;
      recognitionRef.current.language = language;
      recognitionRef.current.maxAlternatives = 3;

      // Handle results
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript.toLowerCase();

          if (result.isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);

        // Check for wake words
        const hasWakeWord = keywords.some(keyword => 
          currentTranscript.includes(keyword.toLowerCase())
        );

        if (hasWakeWord || !keywords.length) {
          onResult?.(currentTranscript, !!finalTranscript);
        }

        // Auto-stop after 5 seconds of silence
        if (finalTranscript) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            if (continuous) return;
            stop();
          }, 5000);
        }
      };

      // Handle errors
      recognitionRef.current.onerror = (event: SpeechRecognitionError) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        onError?.(event.error);

        // Auto-restart for certain errors
        if (continuous && ['network', 'audio-capture'].includes(event.error)) {
          setTimeout(() => start(), 1000);
        }
      };

      // Handle end
      recognitionRef.current.onend = () => {
        setIsListening(false);
        clearTimeout(timeoutRef.current);
      };

      // Handle start
      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };
    }

    return () => {
      clearTimeout(timeoutRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [continuous, interimResults, language, onResult, onError, keywords]);

  const start = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      onError?.('Speech recognition not supported');
      return;
    }

    try {
      recognitionRef.current.start();
      setTranscript('');
    } catch (error) {
      console.error('Failed to start recognition:', error);
      onError?.('Failed to start speech recognition');
    }
  }, [isSupported, onError]);

  const stop = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      clearTimeout(timeoutRef.current);
    }
  }, [isListening]);

  const toggle = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);

  return {
    isListening,
    transcript,
    isSupported,
    start,
    stop,
    toggle
  };
};