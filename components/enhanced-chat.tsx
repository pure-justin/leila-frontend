'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Camera, Calendar, DollarSign, MapPin, Sparkles } from 'lucide-react'
import { sendChatMessage, analyzeServiceImage, calculatePrice } from '@/lib/firebase-api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  type?: 'text' | 'image' | 'estimate' | 'booking'
  data?: any
}

interface QuickAction {
  icon: any
  label: string
  action: string
  description: string
}

export default function EnhancedChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m Leila, your AI home service assistant. I can help you:',
      timestamp: Date.now(),
      type: 'text'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string>()
  const [showActions, setShowActions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const quickActions: QuickAction[] = [
    {
      icon: Camera,
      label: 'Get Instant Quote',
      action: 'quote',
      description: 'Upload a photo for instant pricing'
    },
    {
      icon: Calendar,
      label: 'Book Service',
      action: 'book',
      description: 'Schedule a service appointment'
    },
    {
      icon: DollarSign,
      label: 'Check Pricing',
      action: 'price',
      description: 'See service pricing'
    },
    {
      icon: MapPin,
      label: 'Track Job',
      action: 'track',
      description: 'Track your service in real-time'
    }
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleQuickAction = async (action: string) => {
    setShowActions(false)
    
    switch (action) {
      case 'quote':
        fileInputRef.current?.click()
        break
      case 'book':
        await sendMessage('I want to book a service')
        break
      case 'price':
        await sendMessage('What are your service prices?')
        break
      case 'track':
        await sendMessage('I want to track my service')
        break
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string
      
      // Add user message with image
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: 'Please analyze this image and provide an estimate',
        timestamp: Date.now(),
        type: 'image',
        data: { imageUrl }
      }
      setMessages(prev => [...prev, userMessage])

      try {
        // In production, upload to Firebase Storage first
        // For now, we'll simulate with the preview URL
        const result = await analyzeServiceImage(imageUrl, 'general')
        
        if (result.success) {
          const analysis = (result as any).analysis
          const estimateMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Based on your image, here's what I found:`,
            timestamp: Date.now(),
            type: 'estimate',
            data: {
              difficulty: analysis.difficulty,
              estimatedTime: analysis.estimatedTime,
              costRange: analysis.costRange,
              requirements: analysis.requirements || [],
              warnings: analysis.warnings || []
            }
          }
          setMessages(prev => [...prev, estimateMessage])
          
          // Follow up message
          setTimeout(() => {
            const followUp: Message = {
              id: Date.now().toString(),
              role: 'assistant',
              content: 'Would you like me to book a service professional for this job?',
              timestamp: Date.now(),
              type: 'text'
            }
            setMessages(prev => [...prev, followUp])
          }, 1000)
        }
      } catch (error) {
        console.error('Error analyzing image:', error)
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'I had trouble analyzing that image. Could you try again or describe what service you need?',
          timestamp: Date.now(),
          type: 'text'
        }
        setMessages(prev => [...prev, errorMessage])
      } finally {
        setLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await sendChatMessage(text, conversationId)
      
      if (!conversationId && (response as any).conversationId) {
        setConversationId((response as any).conversationId)
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: (response as any).response,
        timestamp: Date.now(),
        type: 'text'
      }

      setMessages(prev => [...prev, assistantMessage])

      // Check for suggested actions
      if ((response as any).suggestedActions?.includes('book_service')) {
        setTimeout(() => {
          const bookingPrompt: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'I can help you book that service. What date and time works best for you?',
            timestamp: Date.now(),
            type: 'booking'
          }
          setMessages(prev => [...prev, bookingPrompt])
        }, 1000)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting. Please try again in a moment.',
        timestamp: Date.now(),
        type: 'text'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const renderMessage = (message: Message) => {
    switch (message.type) {
      case 'image':
        return (
          <div>
            <p className="mb-2">{message.content}</p>
            <img 
              src={message.data.imageUrl} 
              alt="Uploaded" 
              className="rounded-lg max-w-full"
            />
          </div>
        )
      
      case 'estimate':
        return (
          <div className="space-y-3">
            <p>{message.content}</p>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Difficulty:</span>
                <span className="capitalize">{message.data.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time Estimate:</span>
                <span>{message.data.estimatedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Cost Range:</span>
                <span>${message.data.costRange.min} - ${message.data.costRange.max}</span>
              </div>
              {message.data.requirements.length > 0 && (
                <div>
                  <span className="font-medium">Requirements:</span>
                  <ul className="list-disc list-inside mt-1">
                    {message.data.requirements.map((req: string, i: number) => (
                      <li key={i} className="text-sm">{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              {message.data.warnings.length > 0 && (
                <div className="text-orange-600 dark:text-orange-400">
                  <span className="font-medium">⚠️ Important:</span>
                  <ul className="list-disc list-inside mt-1">
                    {message.data.warnings.map((warning: string, i: number) => (
                      <li key={i} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )
      
      default:
        return <p className="whitespace-pre-wrap">{message.content}</p>
    }
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-all duration-200 hover:scale-110 z-50"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Leila AI Assistant</h3>
                <p className="text-xs text-purple-200">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {renderMessage(message)}
                </div>
              </div>
            ))}

            {/* Quick Actions */}
            {showActions && messages.length === 1 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {quickActions.map((action) => (
                  <button
                    key={action.action}
                    onClick={() => handleQuickAction(action.action)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <action.icon size={20} className="text-purple-600" />
                    <span className="text-sm font-medium">{action.label}</span>
                    <span className="text-xs text-gray-500 text-center">{action.description}</span>
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage(input)
              }}
              className="flex gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-500 hover:text-purple-600 transition-colors"
              >
                <Camera size={20} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-purple-600 text-white rounded-full p-2 hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}