'use client';

import dynamic from 'next/dynamic';

// Dynamically import VoiceButton to avoid SSR issues
const VoiceButton = dynamic(() => import('./voice-button'), {
  ssr: false,
  loading: () => null
});

export default function VoiceAssistant() {
  const handleTranscript = (text: string) => {
    console.log('Voice transcript:', text);
    // Handle voice commands here
  };

  return (
    <VoiceButton
      onTranscript={handleTranscript}
      size="md"
      position="fixed"
    />
  );
}