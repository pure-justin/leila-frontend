# Leila Voice Integration Guide

## Overview
Leila voice assistant is now integrated across all platforms - Web, iOS, and Android. Users can interact with Leila using voice commands to book services, check status, and get help.

## Voice Features

### Wake Word Detection
- **Wake Words**: "Hey Leila", "Hi Leila", "Hello Leila", "OK Leila"
- Continuous listening for wake words (optional)
- Visual and audio feedback when activated

### Voice Commands
Users can say commands like:
- "Book a cleaning service"
- "I need a plumber tomorrow"
- "Check my booking status"
- "Cancel my appointment"
- "How much does electrical work cost?"
- "Show me available services"

### Voice Emotions
Leila responds with different emotional tones:
- **Friendly**: Default conversational tone
- **Professional**: For booking confirmations
- **Excited**: When discussing new features
- **Concerned**: When handling issues
- **Flirty**: Playful and charming (default personality)

## Platform Implementations

### Web App
**Location**: `/components/voice-button.tsx`
- Floating voice button in bottom-right corner
- Uses Web Speech API for recognition
- Hugging Face API for synthesis
- Real-time transcription display

### iOS App
**Location**: `/Leila/Services/LeilaVoiceService.swift`
- Native iOS speech recognition
- AVSpeechSynthesizer for voice output
- Siri integration ready
- SwiftUI voice button component

### Android App
**Location**: `/services/LeilaVoiceService.kt`
- Android SpeechRecognizer
- TextToSpeech engine
- Material 3 voice button
- Compose UI integration

## API Endpoints

### Voice Processing
`POST /api/voice/process`
- Processes voice commands
- Returns intent and response

### Voice Synthesis
`POST /api/voice/synthesize`
- Converts text to speech
- Multiple voice options

### Wake Word Detection
`POST /api/voice/wake-word`
- Detects wake words in audio
- Returns detection confidence

## Configuration

### Environment Variables
```env
HUGGINGFACE_API_KEY=your_key_here
NEXT_PUBLIC_USE_LOCAL_TTS=false
```

### Voice Settings
```javascript
{
  provider: 'huggingface',
  voiceId: 'leila-flirty',
  language: 'en-US',
  speed: 1.05,
  pitch: 1.15,
  emotion: 'friendly'
}
```

## User Experience

### Visual Feedback
- Pulsing animation when listening
- Color changes for different states
- Transcription bubble display
- Status indicators

### Audio Feedback
- Start listening sound
- Wake word detection chime
- Error notification sounds

### Accessibility
- Voice control for all major features
- Screen reader compatible
- Keyboard shortcuts available
- Visual and audio cues

## Privacy & Permissions

### Required Permissions
- **Microphone**: For voice input
- **Notifications**: For voice alerts (optional)

### Data Handling
- Voice data processed locally when possible
- No persistent storage of voice recordings
- Opt-in for wake word detection
- Clear privacy notices

## Testing Voice Features

### Web Testing
1. Click the voice button or say "Hey Leila"
2. Grant microphone permission
3. Speak your command
4. Verify response and action

### Mobile Testing
1. Tap voice button
2. Grant permissions if prompted
3. Test various commands
4. Verify cross-platform consistency

## Common Voice Flows

### Booking Flow
```
User: "Hey Leila"
Leila: "Hi! How can I help you today?"
User: "I need a house cleaning"
Leila: "I can help you book cleaning service. When would you like it?"
User: "Tomorrow afternoon"
Leila: "Perfect! I've found available cleaners for tomorrow afternoon..."
```

### Status Check
```
User: "Check my booking status"
Leila: "Let me check your booking status. You have a plumbing service scheduled for..."
```

## Troubleshooting

### Common Issues
1. **No microphone access**: Check browser/app permissions
2. **Recognition errors**: Ensure clear speech and low background noise
3. **Wake word not detected**: Increase microphone sensitivity
4. **Voice not playing**: Check device volume and audio permissions

### Debug Mode
Enable debug logging:
```javascript
localStorage.setItem('leilaVoiceDebug', 'true');
```

## Future Enhancements
- Custom wake word training
- Multilingual support
- Offline voice processing
- Voice biometrics
- Conversation context memory
- Integration with smart home devices

## Support
For voice-related issues or feature requests, please contact support@heyleila.com or use the in-app feedback option.