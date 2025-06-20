'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, X, Send, Sparkles, Home, 
  DollarSign, Calendar, TrendingUp, User,
  Zap, Brain, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { userProfileService } from '@/lib/user-profile-service';
import { propertyDataService } from '@/lib/property-data-service';
import { solarService } from '@/lib/solar-service';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: string[];
  actions?: Action[];
}

interface Action {
  type: 'book' | 'quote' | 'analyze' | 'profile';
  label: string;
  data: any;
}

export default function AIAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user profile and generate personalized suggestions
  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    // Get comprehensive user data
    const profile = await userProfileService.getUserProfile(user.uid);
    setUserProfile(profile);
    
    // Generate initial suggestions based on profile
    const initialSuggestions = await generatePersonalizedSuggestions(profile);
    setSuggestions(initialSuggestions);
    
    // Show personalized greeting
    if (messages.length === 0) {
      const greeting = await generatePersonalizedGreeting(profile);
      addMessage(greeting, 'ai', initialSuggestions);
    }
  };

  const generatePersonalizedGreeting = async (profile: any): Promise<string> => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    
    // Check for urgent needs
    if (profile?.predictedNeeds?.some((n: any) => n.timeframe === 'immediate')) {
      const urgentNeed = profile.predictedNeeds.find((n: any) => n.timeframe === 'immediate');
      return `${timeGreeting}, ${profile.name}! I noticed your ${urgentNeed.service} might need attention soon. Would you like me to help schedule that?`;
    }
    
    // Check recent property analysis
    if (profile?.propertyInsights?.lastAnalyzed) {
      const daysSince = Math.floor((Date.now() - profile.propertyInsights.lastAnalyzed) / (1000 * 60 * 60 * 24));
      if (daysSince < 7) {
        return `${timeGreeting}, ${profile.name}! Based on your recent property analysis, I have some personalized recommendations for you.`;
      }
    }
    
    // Default personalized greeting
    return `${timeGreeting}, ${profile.name || 'there'}! I'm your AI home assistant. I can help you with home services, maintenance reminders, and save you money. What can I help you with today?`;
  };

  const generatePersonalizedSuggestions = async (profile: any): Promise<string[]> => {
    const suggestions: string[] = [];
    
    // Based on predicted needs
    if (profile?.predictedNeeds?.length > 0) {
      const topNeed = profile.predictedNeeds[0];
      suggestions.push(`Schedule ${topNeed.service} maintenance`);
    }
    
    // Based on season
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) { // Spring
      suggestions.push('Spring HVAC tune-up');
      suggestions.push('Gutter cleaning service');
    } else if (month >= 5 && month <= 7) { // Summer
      suggestions.push('AC maintenance check');
      suggestions.push('Lawn care services');
    } else if (month >= 8 && month <= 10) { // Fall
      suggestions.push('Heating system check');
      suggestions.push('Leaf removal service');
    } else { // Winter
      suggestions.push('Snow removal service');
      suggestions.push('Pipe insulation check');
    }
    
    // Based on property data
    if (profile?.propertyInsights?.roofArea > 1500) {
      suggestions.push('Get solar analysis');
    }
    
    // Based on past bookings
    if (profile?.bookingHistory?.length > 0) {
      const lastBooking = profile.bookingHistory[profile.bookingHistory.length - 1];
      const monthsSince = Math.floor((Date.now() - lastBooking.date) / (1000 * 60 * 60 * 24 * 30));
      if (monthsSince > 6) {
        suggestions.push(`Time for another ${lastBooking.serviceId}?`);
      }
    }
    
    return suggestions.slice(0, 4); // Return top 4 suggestions
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    addMessage(userMessage, 'user');
    setIsTyping(true);
    
    // Track interaction
    if (user) {
      const trackInteraction = httpsCallable(functions, 'trackUserInteraction');
      await trackInteraction({
        type: 'chat',
        target: 'ai_assistant',
        context: 'main_chat',
        metadata: { message: userMessage }
      });
    }
    
    // Get AI response with context
    const response = await getAIResponse(userMessage);
    setIsTyping(false);
    addMessage(response.text, 'ai', response.suggestions, response.actions);
  };

  const getAIResponse = async (message: string): Promise<{
    text: string;
    suggestions?: string[];
    actions?: Action[];
  }> => {
    // Analyze intent
    const intent = await analyzeUserIntent(message);
    
    // Route to appropriate handler
    switch (intent.type) {
      case 'service_inquiry':
        return handleServiceInquiry(intent, message);
      
      case 'booking_request':
        return handleBookingRequest(intent, message);
      
      case 'price_question':
        return handlePriceQuestion(intent, message);
      
      case 'property_question':
        return handlePropertyQuestion(intent, message);
      
      case 'maintenance_advice':
        return handleMaintenanceAdvice(intent, message);
      
      default:
        return handleGeneralQuery(message);
    }
  };

  const analyzeUserIntent = async (message: string): Promise<any> => {
    const lowerMessage = message.toLowerCase();
    
    // Simple intent detection (would be AI-powered in production)
    if (lowerMessage.includes('book') || lowerMessage.includes('schedule')) {
      return { type: 'booking_request', confidence: 0.9 };
    }
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      return { type: 'price_question', confidence: 0.9 };
    }
    if (lowerMessage.includes('solar') || lowerMessage.includes('roof') || lowerMessage.includes('property')) {
      return { type: 'property_question', confidence: 0.8 };
    }
    if (lowerMessage.includes('maintain') || lowerMessage.includes('how often') || lowerMessage.includes('when should')) {
      return { type: 'maintenance_advice', confidence: 0.8 };
    }
    
    return { type: 'general', confidence: 0.5 };
  };

  const handleServiceInquiry = async (intent: any, message: string): Promise<any> => {
    // Use user profile to personalize response
    const response = {
      text: `Based on your property and past services, I recommend our premium HVAC maintenance package. 
      With your ${userProfile?.propertyInsights?.propertySize?.category || 'sized'} property, 
      this would ensure optimal efficiency and prevent costly breakdowns.`,
      suggestions: [
        'View HVAC packages',
        'Schedule inspection',
        'See customer reviews',
        'Compare prices'
      ],
      actions: [{
        type: 'quote' as const,
        label: 'Get Instant Quote',
        data: { service: 'hvac-maintenance' }
      }]
    };
    
    return response;
  };

  const handleBookingRequest = async (intent: any, message: string): Promise<any> => {
    return {
      text: `I'd be happy to help you book that service! Based on your location and preferences, 
      I found 3 highly-rated contractors available this week. Would you like to see their profiles?`,
      suggestions: [
        'Show available contractors',
        'Pick a specific date',
        'See pricing first',
        'Check reviews'
      ],
      actions: [{
        type: 'book' as const,
        label: 'View Available Times',
        data: { service: extractServiceFromMessage(message) }
      }]
    };
  };

  const handlePriceQuestion = async (intent: any, message: string): Promise<any> => {
    const service = extractServiceFromMessage(message);
    
    // Get personalized pricing based on property data
    let priceRange = '$200-$500'; // Default
    if (userProfile?.propertyInsights?.propertySize) {
      // Adjust based on property size
      priceRange = calculatePersonalizedPrice(service, userProfile.propertyInsights);
    }
    
    return {
      text: `For your ${userProfile?.propertyInsights?.propertySize?.category || ''} property, 
      ${service} typically costs ${priceRange}. This includes labor and standard materials. 
      I can get you an exact quote based on your specific needs.`,
      suggestions: [
        'Get exact quote',
        'See what\'s included',
        'Payment options',
        'Book consultation'
      ],
      actions: [{
        type: 'quote' as const,
        label: 'Get Personalized Quote',
        data: { service }
      }]
    };
  };

  const handlePropertyQuestion = async (intent: any, message: string): Promise<any> => {
    if (message.toLowerCase().includes('solar')) {
      return {
        text: `Great question about solar! Based on your roof area of 
        ${userProfile?.propertyInsights?.roofArea || '2000'} sq ft, you could potentially save 
        $${Math.round(userProfile?.propertyInsights?.roofArea * 0.75 || 1500)} per year with solar panels. 
        Would you like me to run a detailed analysis?`,
        suggestions: [
          'Run solar analysis',
          'See financing options',
          'Environmental impact',
          'Local installers'
        ],
        actions: [{
          type: 'analyze' as const,
          label: 'Get Free Solar Analysis',
          data: { type: 'solar' }
        }]
      };
    }
    
    return {
      text: `I can help analyze your property! Would you like me to measure your roof area for solar potential, 
      calculate lawn care needs, or assess your home's maintenance schedule?`,
      suggestions: [
        'Analyze my property',
        'Solar potential',
        'Maintenance schedule',
        'Property value tips'
      ]
    };
  };

  const handleMaintenanceAdvice = async (intent: any, message: string): Promise<any> => {
    const service = extractServiceFromMessage(message);
    
    // Personalized maintenance advice based on property age
    const propertyAge = userProfile?.propertyInsights?.propertyAge?.ageCategory || 'modern';
    const frequency = getMaintenanceFrequency(service, propertyAge);
    
    return {
      text: `For a ${propertyAge} property like yours, I recommend ${service} maintenance ${frequency}. 
      ${getMaintenanceTip(service, propertyAge)} 
      Would you like me to set up automatic reminders?`,
      suggestions: [
        'Set up reminders',
        'Book maintenance now',
        'See maintenance plan',
        'DIY tips'
      ],
      actions: [{
        type: 'profile' as const,
        label: 'Create Maintenance Schedule',
        data: { type: 'maintenance_schedule' }
      }]
    };
  };

  const handleGeneralQuery = async (message: string): Promise<any> => {
    return {
      text: `I'm here to help with all your home service needs! I can help you book services, 
      get quotes, analyze your property for savings opportunities, or answer maintenance questions. 
      What would you like to know?`,
      suggestions: await generatePersonalizedSuggestions(userProfile)
    };
  };

  const addMessage = (text: string, sender: 'user' | 'ai', suggestions?: string[], actions?: Action[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      suggestions,
      actions
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSend();
  };

  const handleActionClick = async (action: Action) => {
    switch (action.type) {
      case 'book':
        // Navigate to booking with pre-filled data
        window.location.href = `/book?service=${action.data.service}`;
        break;
      
      case 'quote':
        // Open quote modal
        addMessage('Calculating your personalized quote...', 'ai');
        // Implementation here
        break;
      
      case 'analyze':
        if (action.data.type === 'solar') {
          window.location.href = '/solar-analysis';
        }
        break;
      
      case 'profile':
        // Update user profile preferences
        await userProfileService.updateUserProfile(user!.uid, action.data);
        addMessage('Your preferences have been updated!', 'ai');
        break;
    }
  };

  // Helper functions
  const extractServiceFromMessage = (message: string): string => {
    const services = ['hvac', 'plumbing', 'electrical', 'solar', 'roofing', 'cleaning'];
    const lower = message.toLowerCase();
    
    for (const service of services) {
      if (lower.includes(service)) return service;
    }
    
    return 'general';
  };

  const calculatePersonalizedPrice = (service: string, propertyInsights: any): string => {
    // Base prices
    const basePrices: Record<string, [number, number]> = {
      'hvac': [200, 500],
      'plumbing': [150, 400],
      'electrical': [200, 600],
      'roofing': [300, 1000],
      'cleaning': [100, 300]
    };
    
    const [min, max] = basePrices[service] || [100, 500];
    
    // Adjust for property size
    const sizeMultiplier = {
      small: 0.8,
      medium: 1,
      large: 1.3,
      estate: 1.6
    }[propertyInsights.propertySize?.category || 'medium'];
    
    return `$${Math.round(min * sizeMultiplier)}-$${Math.round(max * sizeMultiplier)}`;
  };

  const getMaintenanceFrequency = (service: string, propertyAge: string): string => {
    const frequencies: Record<string, Record<string, string>> = {
      hvac: {
        new: 'once a year',
        modern: 'twice a year',
        established: 'every 3-4 months',
        vintage: 'every 2-3 months'
      },
      plumbing: {
        new: 'every 2 years',
        modern: 'annually',
        established: 'every 6 months',
        vintage: 'every 3-4 months'
      }
    };
    
    return frequencies[service]?.[propertyAge] || 'regularly';
  };

  const getMaintenanceTip = (service: string, propertyAge: string): string => {
    if (service === 'hvac' && propertyAge === 'vintage') {
      return 'Older systems need more frequent filter changes and professional cleaning to maintain efficiency.';
    }
    if (service === 'plumbing' && propertyAge === 'established') {
      return 'At this age, pipes may start showing signs of wear. Regular inspections can prevent major issues.';
    }
    return 'Regular maintenance is key to avoiding costly repairs and extending equipment life.';
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* AI Assistant Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform z-40"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6" />
          <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
        </div>
      </button>

      {/* AI Assistant Chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Brain className="w-8 h-8" />
                  <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-semibold">Leila AI Assistant</h3>
                  <p className="text-xs opacity-90">Your personal home expert</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${
                  message.sender === 'user' ? 'ml-auto' : ''
                } max-w-[80%]`}
              >
                <div
                  className={`rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
                
                {/* Suggestions */}
                {message.suggestions && (
                  <div className="mt-2 space-y-1">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs bg-white border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-50 transition-colors mr-2"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Actions */}
                {message.actions && (
                  <div className="mt-2 space-y-2">
                    {message.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleActionClick(action)}
                        className="flex items-center space-x-2 text-sm bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700 transition-colors"
                      >
                        <span>{action.label}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
                <span className="text-xs">Leila is thinking...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything about your home..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            {/* Quick Stats */}
            {userProfile && (
              <div className="mt-3 flex items-center justify-around text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  <Home className="w-3 h-3" />
                  <span>{userProfile.propertyInsights?.propertySize?.category || 'Property'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-3 h-3" />
                  <span>Saved ${userProfile.totalSavings || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3" />
                  <span>{userProfile.bookingHistory?.length || 0} services</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}