// // Cloud Functions for User Intelligence and Data Persistence
// import * as functions from 'firebase-functions';
// import * as admin from 'firebase-admin';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// // Initialize Firebase Admin if not already initialized
// if (!admin.apps.length) {
//   admin.initializeApp();
// }

// const db = admin.firestore();
// const genAI = new GoogleGenerativeAI(functions.config().gemini.api_key);
// const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// // Save property analysis data
// export const savePropertyAnalysis = functions.https.onCall(async (data, context) => {
//   const userId = context.auth?.uid;
//   if (!userId) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  
//   const { 
//     address, 
//     measurements, 
//     parcelData, 
//     mapInteractions,
//     timestamp 
//   } = data;
  
//   // Create comprehensive property profile
//   const propertyProfile = {
//     userId,
//     address,
//     measurements: {
//       roofArea: measurements.roofArea,
//       yardArea: measurements.yardArea,
//       drivewayArea: measurements.drivewayArea,
//       totalPropertyArea: measurements.totalPropertyArea,
//       measuredAt: timestamp,
//       accuracy: measurements.accuracy || 'user_drawn'
//     },
//     parcelData: {
//       parcelId: parcelData?.parcelId,
//       lotSize: parcelData?.lotSize,
//       buildingSize: parcelData?.buildingSize,
//       yearBuilt: parcelData?.yearBuilt,
//       propertyType: parcelData?.propertyType,
//       zoning: parcelData?.zoning,
//       assessedValue: parcelData?.assessedValue,
//       lastUpdated: admin.firestore.FieldValue.serverTimestamp()
//     },
//     mapInteractions: {
//       viewDuration: mapInteractions.duration,
//       measurementActions: mapInteractions.actions,
//       zoomLevels: mapInteractions.zoomLevels,
//       viewAngles: mapInteractions.viewAngles
//     },
//     metadata: {
//       source: 'property_map_3d',
//       version: '1.0',
//       createdAt: admin.firestore.FieldValue.serverTimestamp()
//     }
//   };
  
//   // Save to user's property collection
//   await db.collection('users').doc(userId)
//     .collection('properties').doc(address.replace(/[^a-zA-Z0-9]/g, '_'))
//     .set(propertyProfile, { merge: true });
  
//   // Update user profile with property insights
//   await updateUserPropertyInsights(userId, propertyProfile);
  
//   // Trigger AI analysis
//   await analyzePropertyForServices(userId, propertyProfile);
  
//   return { success: true, propertyId: address };
// });

// // Save solar analysis data
// export const saveSolarAnalysis = functions.https.onCall(async (data, context) => {
//   const userId = context.auth?.uid;
//   if (!userId) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  
//   const { 
//     address, 
//     solarPotential, 
//     quote, 
//     interactions,
//     interests 
//   } = data;
  
//   const solarProfile = {
//     userId,
//     address,
//     analysis: {
//       maxPanels: solarPotential?.maxArrayPanelsCount,
//       maxAreaMeters: solarPotential?.maxArrayAreaMeters2,
//       sunshineHours: solarPotential?.maxSunshineHoursPerYear,
//       roofSegments: solarPotential?.roofSegments?.length,
//       imageryQuality: solarPotential?.imageryQuality,
//       analyzedAt: admin.firestore.FieldValue.serverTimestamp()
//     },
//     quote: {
//       systemSizeKw: quote?.systemSizeKw,
//       panelCount: quote?.recommendedPanels,
//       estimatedCost: quote?.estimatedCost,
//       annualSavings: quote?.savings?.annual,
//       lifetimeSavings: quote?.savings?.lifetime,
//       paybackYears: quote?.paybackPeriod,
//       environmentalImpact: quote?.environmentalImpact
//     },
//     userInterest: {
//       viewedDuration: interactions?.duration,
//       tabsViewed: interactions?.tabsViewed,
//       calculatorUsed: interactions?.calculatorUsed,
//       quotesRequested: interests?.quotesRequested || false,
//       financingInterest: interests?.financingViewed || false,
//       interestLevel: determineInterestLevel(interactions, interests)
//     },
//     metadata: {
//       source: 'solar_analysis_tool',
//       version: '1.0',
//       createdAt: admin.firestore.FieldValue.serverTimestamp()
//     }
//   };
  
//   // Save solar analysis
//   await db.collection('users').doc(userId)
//     .collection('solarAnalyses').add(solarProfile);
  
//   // Update user profile with solar interest
//   await updateUserSolarProfile(userId, solarProfile);
  
//   // Create lead if high interest
//   if (solarProfile.userInterest.interestLevel === 'high') {
//     await createSolarLead(userId, solarProfile);
//   }
  
//   return { success: true, interestLevel: solarProfile.userInterest.interestLevel };
// });

// // AI-powered property service recommendations
// async function analyzePropertyForServices(userId: string, propertyProfile: any) {
//   const prompt = `
//     Analyze this property data and recommend home services:
    
//     Property Details:
//     - Address: ${propertyProfile.address}
//     - Roof Area: ${propertyProfile.measurements.roofArea} sq ft
//     - Yard Area: ${propertyProfile.measurements.yardArea} sq ft
//     - Driveway Area: ${propertyProfile.measurements.drivewayArea} sq ft
//     - Year Built: ${propertyProfile.parcelData.yearBuilt || 'Unknown'}
//     - Property Type: ${propertyProfile.parcelData.propertyType || 'Residential'}
    
//     Based on this data, identify:
//     1. Immediate service needs (next 30 days)
//     2. Seasonal services (next 3 months)
//     3. Preventive maintenance recommendations
//     4. Cost-saving opportunities
//     5. Property value improvements
    
//     For each recommendation, provide:
//     - Service type
//     - Urgency (immediate/soon/preventive)
//     - Estimated cost based on property size
//     - Reason for recommendation
//     - Potential savings or value add
//   `;
  
//   try {
//     const result = await model.generateContent(prompt);
//     const recommendations = JSON.parse(result.response.text());
    
//     // Save recommendations
//     await db.collection('users').doc(userId)
//       .collection('serviceRecommendations').add({
//         propertyAddress: propertyProfile.address,
//         recommendations,
//         generatedAt: admin.firestore.FieldValue.serverTimestamp(),
//         propertyData: {
//           roofArea: propertyProfile.measurements.roofArea,
//           yardArea: propertyProfile.measurements.yardArea,
//           yearBuilt: propertyProfile.parcelData.yearBuilt
//         }
//       });
    
//     // Schedule follow-up notifications
//     for (const rec of recommendations.immediate) {
//       await scheduleServiceReminder(userId, rec, 3); // 3 days
//     }
    
//   } catch (error) {
//     console.error('AI analysis error:', error);
//   }
// }

// // Update user profile with property insights
// async function updateUserPropertyInsights(userId: string, propertyProfile: any) {
//   const insights = {
//     propertySize: {
//       roofArea: propertyProfile.measurements.roofArea,
//       yardArea: propertyProfile.measurements.yardArea,
//       totalArea: propertyProfile.measurements.totalPropertyArea,
//       category: categorizePropertySize(propertyProfile.measurements.totalPropertyArea)
//     },
//     propertyAge: {
//       yearBuilt: propertyProfile.parcelData.yearBuilt,
//       ageCategory: categorizePropertyAge(propertyProfile.parcelData.yearBuilt),
//       maintenanceProfile: getMaintenanceProfile(propertyProfile.parcelData.yearBuilt)
//     },
//     serviceNeeds: {
//       roofing: propertyProfile.measurements.roofArea > 0,
//       landscaping: propertyProfile.measurements.yardArea > 500,
//       drivewayMaintenance: propertyProfile.measurements.drivewayArea > 0,
//       lastAnalyzed: admin.firestore.FieldValue.serverTimestamp()
//     }
//   };
  
//   await db.collection('users').doc(userId).update({
//     'profile.propertyInsights': insights,
//     'profile.hasPropertyData': true,
//     'profile.lastPropertyAnalysis': admin.firestore.FieldValue.serverTimestamp()
//   });
// }

// // Track all user interactions for AI learning
// export const trackUserInteraction = functions.https.onCall(async (data, context) => {
//   const userId = context.auth?.uid || data.anonymousId;
  
//   const interaction = {
//     userId,
//     type: data.type, // 'view', 'click', 'search', 'measure', 'quote'
//     target: data.target, // what they interacted with
//     context: data.context, // where in the app
//     duration: data.duration,
//     metadata: data.metadata,
//     timestamp: admin.firestore.FieldValue.serverTimestamp(),
//     sessionId: data.sessionId,
//     device: data.device
//   };
  
//   // Save interaction
//   await db.collection('userInteractions').add(interaction);
  
//   // Update user behavior profile
//   await updateBehaviorProfile(userId, interaction);
  
//   // Check for behavior patterns
//   await analyzeBehaviorPatterns(userId);
  
//   return { success: true };
// });

// // Contractor lead generation from user data
// export const generateContractorLeads = functions.pubsub
//   .schedule('every 4 hours')
//   .onRun(async (context) => {
//     // Find users with high intent signals
//     const highIntentUsers = await db.collection('users')
//       .where('profile.serviceIntent.score', '>', 80)
//       .where('profile.serviceIntent.lastUpdated', '>', 
//         admin.firestore.Timestamp.fromMillis(Date.now() - 7 * 24 * 60 * 60 * 1000))
//       .limit(100)
//       .get();
    
//     for (const userDoc of highIntentUsers.docs) {
//       const userData = userDoc.data();
//       const userId = userDoc.id;
      
//       // Match with best contractors
//       const matchedContractors = await findBestContractors(
//         userData.profile.serviceIntent.services,
//         userData.profile.location
//       );
      
//       // Create qualified leads
//       for (const contractor of matchedContractors) {
//         await createQualifiedLead(contractor.id, {
//           userId,
//           userName: userData.profile.name,
//           service: userData.profile.serviceIntent.primaryService,
//           propertyData: userData.profile.propertyInsights,
//           intentScore: userData.profile.serviceIntent.score,
//           estimatedValue: calculateLeadValue(userData),
//           urgency: userData.profile.serviceIntent.urgency,
//           preferredContact: userData.profile.communicationPreferences
//         });
//       }
//     }
//   });

// // AI-powered conversation insights
// export const analyzeConversation = functions.firestore
//   .document('conversations/{conversationId}/messages/{messageId}')
//   .onCreate(async (snap, context) => {
//     const message = snap.data();
//     const conversationId = context.params.conversationId;
    
//     // Get conversation history
//     const conversationSnap = await db.collection('conversations')
//       .doc(conversationId).get();
//     const conversation = conversationSnap.data();
    
//     if (!conversation) return;
    
//     // Analyze for service intent
//     const intent = await analyzeServiceIntent(message, conversation);
    
//     if (intent.hasServiceNeed) {
//       // Update user profile
//       await db.collection('users').doc(conversation.userId).update({
//         'profile.serviceIntent': {
//           score: intent.score,
//           services: intent.services,
//           urgency: intent.urgency,
//           concerns: intent.concerns,
//           budget: intent.budgetIndication,
//           lastUpdated: admin.firestore.FieldValue.serverTimestamp()
//         }
//       });
      
//       // Notify relevant contractors if urgent
//       if (intent.urgency === 'immediate') {
//         await notifyContractorsOfOpportunity(conversation.userId, intent);
//       }
//     }
    
//     // Extract property details mentioned
//     const propertyDetails = await extractPropertyDetails(message.text);
//     if (propertyDetails) {
//       await updatePropertyProfile(conversation.userId, propertyDetails);
//     }
//   });

// // Helper functions
// function determineInterestLevel(interactions: any, interests: any): string {
//   const score = 
//     (interactions?.duration > 300 ? 30 : 0) +
//     (interactions?.tabsViewed?.length > 2 ? 20 : 0) +
//     (interactions?.calculatorUsed ? 25 : 0) +
//     (interests?.quotesRequested ? 25 : 0);
  
//   if (score >= 70) return 'high';
//   if (score >= 40) return 'medium';
//   return 'low';
// }

// function categorizePropertySize(totalArea: number): string {
//   if (totalArea < 1000) return 'small';
//   if (totalArea < 2500) return 'medium';
//   if (totalArea < 5000) return 'large';
//   return 'estate';
// }

// function categorizePropertyAge(yearBuilt: number): string {
//   const age = new Date().getFullYear() - yearBuilt;
//   if (age < 10) return 'new';
//   if (age < 25) return 'modern';
//   if (age < 50) return 'established';
//   return 'vintage';
// }

// function getMaintenanceProfile(yearBuilt: number): string {
//   const age = new Date().getFullYear() - yearBuilt;
//   if (age < 5) return 'minimal';
//   if (age < 15) return 'preventive';
//   if (age < 30) return 'regular';
//   return 'intensive';
// }

// async function createSolarLead(userId: string, solarProfile: any) {
//   const lead = {
//     userId,
//     type: 'solar_installation',
//     source: 'solar_calculator',
//     data: solarProfile,
//     status: 'new',
//     priority: solarProfile.userInterest.interestLevel === 'high' ? 'hot' : 'warm',
//     estimatedValue: solarProfile.quote.estimatedCost.average,
//     createdAt: admin.firestore.FieldValue.serverTimestamp()
//   };
  
//   await db.collection('leads').add(lead);
  
//   // Notify solar contractors
//   const solarContractors = await db.collection('contractors')
//     .where('services', 'array-contains', 'solar-installation')
//     .where('status', '==', 'active')
//     .get();
  
//   for (const contractor of solarContractors.docs) {
//     await db.collection('contractors').doc(contractor.id)
//       .collection('opportunities').add({
//         leadId: lead,
//         userId,
//         type: 'solar_installation',
//         estimatedValue: lead.estimatedValue,
//         priority: lead.priority,
//         notifiedAt: admin.firestore.FieldValue.serverTimestamp()
//       });
//   }
// }

// async function scheduleServiceReminder(userId: string, recommendation: any, daysDelay: number) {
//   const scheduledTime = new Date();
//   scheduledTime.setDate(scheduledTime.getDate() + daysDelay);
  
//   await db.collection('scheduledNotifications').add({
//     userId,
//     type: 'service_reminder',
//     service: recommendation.serviceType,
//     message: recommendation.reason,
//     scheduledFor: admin.firestore.Timestamp.fromDate(scheduledTime),
//     status: 'pending'
//   });
// }

// async function updateBehaviorProfile(userId: string, interaction: any) {
//   const behaviorUpdate: any = {
//     lastActive: admin.firestore.FieldValue.serverTimestamp(),
//     'behavior.totalInteractions': admin.firestore.FieldValue.increment(1)
//   };
  
//   // Track specific behaviors
//   switch (interaction.type) {
//     case 'view':
//       behaviorUpdate[`behavior.viewCounts.${interaction.target}`] = 
//         admin.firestore.FieldValue.increment(1);
//       break;
//     case 'search':
//       behaviorUpdate['behavior.recentSearches'] = 
//         admin.firestore.FieldValue.arrayUnion(interaction.target);
//       break;
//     case 'measure':
//       behaviorUpdate['behavior.propertyMeasured'] = true;
//       behaviorUpdate['behavior.measurementCount'] = 
//         admin.firestore.FieldValue.increment(1);
//       break;
//   }
  
//   await db.collection('users').doc(userId).update(behaviorUpdate);
// }

// async function analyzeBehaviorPatterns(userId: string) {
//   // Get recent interactions
//   const recentInteractions = await db.collection('userInteractions')
//     .where('userId', '==', userId)
//     .orderBy('timestamp', 'desc')
//     .limit(50)
//     .get();
  
//   const interactions = recentInteractions.docs.map(doc => doc.data());
  
//   // Analyze patterns
//   const patterns = {
//     primaryInterest: identifyPrimaryInterest(interactions),
//     engagementLevel: calculateEngagementLevel(interactions),
//     serviceReadiness: assessServiceReadiness(interactions),
//     preferredInteractionTime: findPreferredTime(interactions)
//   };
  
//   // Update user profile with patterns
//   await db.collection('users').doc(userId).update({
//     'profile.behaviorPatterns': patterns,
//     'profile.patternsUpdated': admin.firestore.FieldValue.serverTimestamp()
//   });
// }

// function identifyPrimaryInterest(interactions: any[]): string {
//   const serviceCounts: Record<string, number> = {};
  
//   interactions.forEach(i => {
//     if (i.target && i.type === 'view') {
//       serviceCounts[i.target] = (serviceCounts[i.target] || 0) + 1;
//     }
//   });
  
//   return Object.entries(serviceCounts)
//     .sort(([,a], [,b]) => b - a)[0]?.[0] || 'general';
// }

// function calculateEngagementLevel(interactions: any[]): string {
//   const recentCount = interactions.filter(i => 
//     i.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000
//   ).length;
  
//   if (recentCount > 20) return 'highly_engaged';
//   if (recentCount > 10) return 'engaged';
//   if (recentCount > 5) return 'moderate';
//   return 'low';
// }

// function assessServiceReadiness(interactions: any[]): number {
//   let readinessScore = 0;
  
//   // Check for quote requests
//   if (interactions.some(i => i.type === 'quote')) readinessScore += 40;
  
//   // Check for measurement actions
//   if (interactions.some(i => i.type === 'measure')) readinessScore += 30;
  
//   // Check for multiple service views
//   const serviceViews = interactions.filter(i => i.type === 'view').length;
//   readinessScore += Math.min(serviceViews * 5, 30);
  
//   return Math.min(readinessScore, 100);
// }

// function findPreferredTime(interactions: any[]): string {
//   const hourCounts: Record<number, number> = {};
  
//   interactions.forEach(i => {
//     const hour = new Date(i.timestamp).getHours();
//     hourCounts[hour] = (hourCounts[hour] || 0) + 1;
//   });
  
//   const peakHour = Object.entries(hourCounts)
//     .sort(([,a], [,b]) => b - a)[0]?.[0];
  
//   if (!peakHour) return 'anytime';
  
//   const hour = parseInt(peakHour);
//   if (hour >= 6 && hour < 12) return 'morning';
//   if (hour >= 12 && hour < 17) return 'afternoon';
//   if (hour >= 17 && hour < 21) return 'evening';
//   return 'night';
// }

// async function findBestContractors(services: string[], location: any) {
//   // Find contractors that match service needs and location
//   const contractors = await db.collection('contractors')
//     .where('services', 'array-contains-any', services)
//     .where('status', '==', 'active')
//     .get();
  
//   // Score and rank contractors
//   const scored = contractors.docs.map(doc => ({
//     id: doc.id,
//     ...doc.data(),
//     score: calculateContractorScore(doc.data(), services, location)
//   }));
  
//   return scored
//     .sort((a, b) => b.score - a.score)
//     .slice(0, 3); // Top 3 contractors
// }

// function calculateContractorScore(contractor: any, services: string[], location: any): number {
//   let score = 0;
  
//   // Service match
//   const serviceMatch = services.filter(s => contractor.services.includes(s)).length;
//   score += serviceMatch * 20;
  
//   // Rating
//   score += (contractor.avgRating || 0) * 10;
  
//   // Response time
//   if (contractor.avgResponseTime < 30) score += 20;
  
//   // Availability
//   if (contractor.availability === 'immediate') score += 15;
  
//   return score;
// }

// function calculateLeadValue(userData: any): number {
//   const baseValues: Record<string, number> = {
//     'solar-installation': 20000,
//     'roofing-replacement': 10000,
//     'hvac-installation': 8000,
//     'kitchen-remodel': 15000,
//     'bathroom-remodel': 10000
//   };
  
//   const service = userData.profile.serviceIntent.primaryService;
//   const baseValue = baseValues[service] || 500;
  
//   // Adjust based on property size
//   const sizeMultiplier = userData.profile.propertyInsights?.propertySize?.category === 'large' ? 1.3 : 1;
  
//   // Adjust based on urgency
//   const urgencyMultiplier = userData.profile.serviceIntent.urgency === 'immediate' ? 1.2 : 1;
  
//   return Math.round(baseValue * sizeMultiplier * urgencyMultiplier);
// }

// async function createQualifiedLead(contractorId: string, leadData: any) {
//   await db.collection('contractors').doc(contractorId)
//     .collection('qualifiedLeads').add({
//       ...leadData,
//       status: 'new',
//       createdAt: admin.firestore.FieldValue.serverTimestamp(),
//       expiresAt: admin.firestore.Timestamp.fromMillis(
//         Date.now() + 48 * 60 * 60 * 1000 // 48 hours
//       )
//     });
  
//   // Send notification
//   await sendContractorNotification(contractorId, {
//     type: 'new_lead',
//     priority: leadData.urgency === 'immediate' ? 'high' : 'normal',
//     message: `New ${leadData.service} lead with ${leadData.intentScore}% intent score`,
//     leadValue: leadData.estimatedValue
//   });
// }

// async function sendContractorNotification(contractorId: string, notification: any) {
//   // Implementation would send push notification, SMS, or email
//   await db.collection('contractors').doc(contractorId)
//     .collection('notifications').add({
//       ...notification,
//       read: false,
//       sentAt: admin.firestore.FieldValue.serverTimestamp()
//     });
// }

// async function analyzeServiceIntent(message: any, conversation: any): Promise<any> {
//   const prompt = `
//     Analyze this conversation for service intent:
    
//     Latest message: "${message.text}"
//     Conversation context: ${JSON.stringify(conversation.history?.slice(-5))}
    
//     Determine:
//     1. Does the user have a service need? (yes/no)
//     2. What services are they interested in?
//     3. What is their urgency? (immediate/soon/exploring)
//     4. What concerns do they have?
//     5. Any budget indications?
//     6. Intent score (0-100)
//   `;
  
//   try {
//     const result = await model.generateContent(prompt);
//     return JSON.parse(result.response.text());
//   } catch (error) {
//     console.error('Intent analysis error:', error);
//     return { hasServiceNeed: false, score: 0 };
//   }
// }

// async function extractPropertyDetails(text: string): Promise<any> {
//   const prompt = `
//     Extract property details from this text:
//     "${text}"
    
//     Look for:
//     - Property type (house, condo, etc)
//     - Size references (sq ft, bedrooms, etc)
//     - Age or year built
//     - Specific features (pool, solar, etc)
//     - Location details
    
//     Return null if no property details found.
//   `;
  
//   try {
//     const result = await model.generateContent(prompt);
//     const details = JSON.parse(result.response.text());
//     return details && Object.keys(details).length > 0 ? details : null;
//   } catch (error) {
//     console.error('Property extraction error:', error);
//     return null;
//   }
// }

// async function updatePropertyProfile(userId: string, details: any) {
//   const updates: any = {};
  
//   if (details.propertyType) {
//     updates['profile.property.type'] = details.propertyType;
//   }
//   if (details.size) {
//     updates['profile.property.size'] = details.size;
//   }
//   if (details.features) {
//     updates['profile.property.features'] = admin.firestore.FieldValue.arrayUnion(...details.features);
//   }
  
//   if (Object.keys(updates).length > 0) {
//     await db.collection('users').doc(userId).update(updates);
//   }
// }

// async function notifyContractorsOfOpportunity(userId: string, intent: any) {
//   // Find matching contractors
//   const contractors = await findBestContractors(intent.services, null);
  
//   for (const contractor of contractors) {
//     await db.collection('contractors').doc(contractor.id)
//       .collection('urgentOpportunities').add({
//         userId,
//         services: intent.services,
//         urgency: 'immediate',
//         concerns: intent.concerns,
//         intentScore: intent.score,
//         notifiedAt: admin.firestore.FieldValue.serverTimestamp(),
//         expiresAt: admin.firestore.Timestamp.fromMillis(
//           Date.now() + 2 * 60 * 60 * 1000 // 2 hours
//         )
//       });
//   }
// }

// function updateUserSolarProfile(userId: any, solarProfile: { userId: any; address: any; analysis: { maxPanels: any; maxAreaMeters: any; sunshineHours: any; roofSegments: any; imageryQuality: any; analyzedAt: any; }; quote: { systemSizeKw: any; panelCount: any; estimatedCost: any; annualSavings: any; lifetimeSavings: any; paybackYears: any; environmentalImpact: any; }; userInterest: { viewedDuration: any; tabsViewed: any; calculatorUsed: any; quotesRequested: any; financingInterest: any; interestLevel: string; }; metadata: { source: string; version: string; createdAt: any; }; }) {
//   throw new Error('Function not implemented.');
// }
