import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as admin from 'firebase-admin';

const genAI = new GoogleGenerativeAI(functions.config().gemini.api_key);

interface FeedbackData {
  userId: string;
  userEmail: string;
  type: string;
  feedback: string;
  timestamp: string;
}

export const processFeedback = functions.https.onCall(async (data: FeedbackData, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, userEmail, type, feedback, timestamp } = data;

  try {
    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create a comprehensive prompt for AI analysis
    const prompt = `
    Analyze this user feedback for a home service app and provide a structured response:

    Feedback Type: ${type}
    User Feedback: "${feedback}"

    Please provide:
    1. **Summary**: Brief summary of the feedback (1-2 sentences)
    2. **Category**: Categorize this feedback (UI/UX, Feature, Performance, Bug, Business Logic)
    3. **Priority**: Rate priority (Critical, High, Medium, Low) based on potential impact
    4. **Implementation Feasibility**: Rate complexity (Simple, Moderate, Complex, Very Complex)
    5. **Estimated Effort**: Estimate development time (hours, days, or weeks)
    6. **Similar Features**: List any similar existing features or related requests
    7. **Implementation Prompt**: If this is a feature request, provide a detailed technical implementation prompt that a developer could use
    8. **Potential Challenges**: List technical or business challenges
    9. **User Impact Score**: Rate 1-10 how many users this would benefit
    10. **Revenue Impact**: Estimate potential revenue impact (Negative, Neutral, Positive, Very Positive)

    Format the response as JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse AI response
    let aiAnalysis;
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      aiAnalysis = {
        summary: 'Feedback received and logged',
        category: 'General',
        priority: 'Medium',
        error: 'Failed to parse AI analysis'
      };
    }

    // Store feedback in Firestore
    const feedbackDoc = {
      userId,
      userEmail,
      type,
      feedback,
      timestamp,
      aiAnalysis,
      status: 'pending',
      votes: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await admin.firestore()
      .collection('feedback')
      .add(feedbackDoc);

    // If it's a high-priority feature request, create a development ticket
    if (type === 'feature' && aiAnalysis.priority === 'High') {
      await createDevelopmentTicket(docRef.id, feedbackDoc, aiAnalysis);
    }

    // Check for similar feedback
    const similarFeedback = await findSimilarFeedback(feedback);

    // Send notification to product team for critical items
    if (aiAnalysis.priority === 'Critical') {
      await notifyProductTeam(feedbackDoc, aiAnalysis);
    }

    return {
      success: true,
      feedbackId: docRef.id,
      analysis: aiAnalysis,
      similarRequests: similarFeedback,
      message: 'Thank you for your feedback! Our AI has analyzed your suggestion.'
    };

  } catch (error) {
    console.error('Error processing feedback:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process feedback');
  }
});

async function createDevelopmentTicket(
  feedbackId: string, 
  feedback: any, 
  analysis: any
) {
  // Create a structured development ticket
  const ticket = {
    feedbackId,
    title: analysis.summary,
    description: feedback.feedback,
    implementationPrompt: analysis.implementationPrompt,
    priority: analysis.priority,
    estimatedEffort: analysis.estimatedEffort,
    category: analysis.category,
    status: 'backlog',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await admin.firestore()
    .collection('developmentTickets')
    .add(ticket);
}

async function findSimilarFeedback(feedback: string): Promise<any[]> {
  // Simple keyword matching for now
  // In production, use vector embeddings for semantic similarity
  const keywords = feedback.toLowerCase().split(' ')
    .filter(word => word.length > 4);

  const similarDocs = await admin.firestore()
    .collection('feedback')
    .where('type', '==', 'feature')
    .orderBy('votes', 'desc')
    .limit(5)
    .get();

  const similar = [];
  similarDocs.forEach(doc => {
    const data = doc.data();
    const feedbackLower = data.feedback.toLowerCase();
    const matchCount = keywords.filter(keyword => 
      feedbackLower.includes(keyword)
    ).length;
    
    if (matchCount >= 2) {
      similar.push({
        id: doc.id,
        ...data
      });
    }
  });

  return similar;
}

async function notifyProductTeam(feedback: any, analysis: any) {
  // Send email or Slack notification to product team
  console.log('Critical feedback received:', {
    feedback: feedback.feedback,
    analysis: analysis.summary,
    priority: analysis.priority
  });
  
  // In production, integrate with notification service
}