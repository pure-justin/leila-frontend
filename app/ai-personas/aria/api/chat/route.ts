import { NextRequest, NextResponse } from 'next/server';
import { PersonalityEngine, ConversationContext } from '../../../lib/personality-engine';
import { ARIA_PERSONALITY } from '../../types/personality';

// Initialize ARIA's personality engine
const ariaEngine = new PersonalityEngine(ARIA_PERSONALITY);

// In-memory conversation storage (use Redis/DB in production)
const conversations = new Map<string, ConversationContext>();

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, userId } = await request.json();

    if (!message || !conversationId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create conversation context
    let context = conversations.get(conversationId);
    if (!context) {
      context = {
        userId,
        conversationId,
        previousMessages: [],
        emotionalState: 'neutral',
        topicContext: [],
        timestamp: new Date()
      };
      conversations.set(conversationId, context);
    }

    // Add user message to history
    context.previousMessages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Generate ARIA's response
    const response = await ariaEngine.generateResponse(message, context);

    // Add ARIA's response to history
    context.previousMessages.push({
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
      emotion: response.emotion
    });

    // Keep conversation history manageable
    if (context.previousMessages.length > 20) {
      context.previousMessages = context.previousMessages.slice(-20);
    }

    // Update conversation
    conversations.set(conversationId, context);

    // Return response with all metadata
    return NextResponse.json({
      message: response.message,
      emotion: response.emotion,
      voiceModulation: response.voiceModulation,
      animations: response.animations,
      socialMediaPosts: response.socialMediaPosts,
      conversationId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('ARIA chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Get conversation history
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json(
      { error: 'Missing conversationId' },
      { status: 400 }
    );
  }

  const context = conversations.get(conversationId);
  if (!context) {
    return NextResponse.json(
      { error: 'Conversation not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    conversationId,
    messages: context.previousMessages,
    emotionalState: context.emotionalState,
    topicContext: context.topicContext,
    startTime: context.timestamp
  });
}