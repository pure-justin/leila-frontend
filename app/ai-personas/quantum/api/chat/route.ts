import { NextRequest, NextResponse } from 'next/server';
import { PersonalityEngine, ConversationContext } from '../../../lib/personality-engine';
import { QUANTUM_PERSONALITY } from '../../types/personality';

// Initialize QUANTUM's personality engine
const quantumEngine = new PersonalityEngine(QUANTUM_PERSONALITY);

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
        emotionalState: 'chaotic_neutral',
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

    // Generate QUANTUM's response
    const response = await quantumEngine.generateResponse(message, context);

    // Add QUANTUM's response to history
    context.previousMessages.push({
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
      emotion: response.emotion,
      metadata: {
        prediction: response.predictedUserResponse
      }
    });

    // Keep conversation history manageable
    if (context.previousMessages.length > 20) {
      context.previousMessages = context.previousMessages.slice(-20);
    }

    // Update conversation
    conversations.set(conversationId, context);

    // Calculate chaos metrics
    const chaosLevel = Math.random() * 100;
    const probabilityMatrix = generateProbabilityMatrix();

    // Return response with all metadata
    return NextResponse.json({
      message: response.message,
      emotion: response.emotion,
      voiceModulation: response.voiceModulation,
      animations: response.animations,
      socialMediaPosts: response.socialMediaPosts,
      predictedUserResponse: response.predictedUserResponse,
      chaosLevel,
      probabilityMatrix,
      conversationId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('QUANTUM chat error:', error);
    return NextResponse.json(
      { error: 'Reality glitch detected. Please try again.' },
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
      { error: 'Conversation exists in another timeline' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    conversationId,
    messages: context.previousMessages,
    emotionalState: context.emotionalState,
    topicContext: context.topicContext,
    startTime: context.timestamp,
    quantumSignature: generateQuantumSignature(conversationId)
  });
}

function generateProbabilityMatrix(): number[][] {
  // Generate a 3x3 probability matrix for fun visualization
  const matrix: number[][] = [];
  for (let i = 0; i < 3; i++) {
    matrix[i] = [];
    for (let j = 0; j < 3; j++) {
      matrix[i][j] = Math.random();
    }
  }
  return matrix;
}

function generateQuantumSignature(conversationId: string): string {
  // Generate a unique quantum signature for the conversation
  const hash = conversationId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  return `QS-${hash.toString(16).toUpperCase()}-∞`;
}