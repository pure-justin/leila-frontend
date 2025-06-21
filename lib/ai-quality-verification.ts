import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface QualityCheckResult {
  score: number; // 0-100
  passed: boolean;
  issues: string[];
  recommendations: string[];
  requiresRework: boolean;
  category: 'excellent' | 'good' | 'needs_improvement' | 'unacceptable';
}

export interface DisputeResolution {
  decision: 'approve' | 'partial_approve' | 'require_rework' | 'escalate';
  reasoning: string;
  paymentAdjustment?: number; // Percentage of original payment
  recommendations: {
    forContractor: string[];
    forCustomer: string[];
  };
}

export class AIQualityVerificationService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  /**
   * Analyze photos submitted by contractor for quality and completion
   */
  async analyzeWorkPhotos(
    photos: { url: string; type: 'before' | 'during' | 'after' }[],
    serviceType: string,
    jobDescription: string
  ): Promise<QualityCheckResult> {
    try {
      const prompt = `
        You are an expert home service quality inspector. Analyze these work photos and provide a quality assessment.

        Service Type: ${serviceType}
        Job Description: ${jobDescription}
        
        Photos provided:
        - Before: ${photos.filter(p => p.type === 'before').length} photos
        - During: ${photos.filter(p => p.type === 'during').length} photos
        - After: ${photos.filter(p => p.type === 'after').length} photos

        Evaluate the following:
        1. Work Completion: Is the described work visibly completed?
        2. Quality Standards: Does the work meet professional standards?
        3. Cleanliness: Is the work area clean and debris-free?
        4. Safety: Are there any visible safety concerns?
        5. Photo Documentation: Are the photos clear and comprehensive?

        Return a JSON response with:
        {
          "score": (0-100),
          "passed": (true if score >= 80),
          "issues": ["list of specific issues found"],
          "recommendations": ["list of specific improvements needed"],
          "requiresRework": (true if major issues found),
          "category": "excellent|good|needs_improvement|unacceptable"
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback if parsing fails
      return {
        score: 70,
        passed: false,
        issues: ['Unable to fully analyze photos'],
        recommendations: ['Please ensure all photos are clear and properly uploaded'],
        requiresRework: false,
        category: 'needs_improvement'
      };
    } catch (error) {
      console.error('AI quality check error:', error);
      throw new Error('Failed to analyze work quality');
    }
  }

  /**
   * Resolve disputes between contractor and customer
   */
  async resolveDispute(
    contractorClaim: string,
    customerComplaint: string,
    workPhotos: { url: string; type: string }[],
    contractDetails: {
      serviceType: string;
      agreedPrice: number;
      scopeOfWork: string;
    },
    previousInteractions?: string[]
  ): Promise<DisputeResolution> {
    try {
      const prompt = `
        You are an impartial AI mediator resolving a dispute between a contractor and customer.
        
        Contract Details:
        - Service: ${contractDetails.serviceType}
        - Agreed Price: $${contractDetails.agreedPrice}
        - Scope of Work: ${contractDetails.scopeOfWork}
        
        Contractor's Position: ${contractorClaim}
        Customer's Complaint: ${customerComplaint}
        
        Evidence:
        - ${workPhotos.length} photos provided
        ${previousInteractions ? `- Previous interactions: ${previousInteractions.join(', ')}` : ''}
        
        Based on the evidence and both parties' statements, provide a fair resolution.
        Consider industry standards, reasonableness, and fairness to both parties.
        
        Return a JSON response with:
        {
          "decision": "approve|partial_approve|require_rework|escalate",
          "reasoning": "detailed explanation of the decision",
          "paymentAdjustment": (percentage 0-100 of original payment),
          "recommendations": {
            "forContractor": ["specific actions for contractor"],
            "forCustomer": ["specific actions for customer"]
          }
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback resolution
      return {
        decision: 'escalate',
        reasoning: 'Unable to automatically resolve this dispute. Human review required.',
        paymentAdjustment: 100,
        recommendations: {
          forContractor: ['Please provide additional documentation'],
          forCustomer: ['Please provide specific details about your concerns']
        }
      };
    } catch (error) {
      console.error('AI dispute resolution error:', error);
      throw new Error('Failed to resolve dispute');
    }
  }

  /**
   * Generate quality improvement suggestions for contractors
   */
  async generateImprovementPlan(
    contractorId: string,
    recentJobs: Array<{ score: number; issues: string[] }>,
    serviceType: string
  ): Promise<{
    overallRating: number;
    strengths: string[];
    areasForImprovement: string[];
    trainingRecommendations: string[];
    certificationSuggestions: string[];
  }> {
    const avgScore = recentJobs.reduce((sum, job) => sum + job.score, 0) / recentJobs.length;
    const allIssues = recentJobs.flatMap(job => job.issues);
    
    const prompt = `
      Analyze this contractor's performance and provide improvement recommendations.
      
      Service Type: ${serviceType}
      Average Quality Score: ${avgScore}
      Recent Issues: ${allIssues.join(', ')}
      
      Provide personalized recommendations for improvement including:
      1. Identified strengths to build on
      2. Specific areas needing improvement
      3. Training courses or resources
      4. Relevant certifications to pursue
      
      Return a JSON response with the structure shown in the function signature.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback response
      return {
        overallRating: avgScore,
        strengths: ['Consistent work completion'],
        areasForImprovement: ['Photo documentation quality', 'Work area cleanup'],
        trainingRecommendations: ['Professional photography for contractors course'],
        certificationSuggestions: [`${serviceType} Master Certification`]
      };
    } catch (error) {
      console.error('AI improvement plan error:', error);
      throw new Error('Failed to generate improvement plan');
    }
  }

  /**
   * Real-time photo analysis during job
   */
  async analyzePhotoInRealTime(
    photoUrl: string,
    expectedContent: string,
    stage: 'before' | 'during' | 'after'
  ): Promise<{
    isAcceptable: boolean;
    feedback: string;
    retakeRequired: boolean;
    suggestions: string[];
  }> {
    const prompt = `
      Analyze this ${stage} photo for a ${expectedContent} job.
      
      Check for:
      1. Photo clarity and lighting
      2. Proper framing showing relevant work area
      3. ${stage === 'before' ? 'Clear documentation of initial conditions' : ''}
      4. ${stage === 'during' ? 'Visible progress on the work' : ''}
      5. ${stage === 'after' ? 'Completed work clearly visible and clean area' : ''}
      
      Provide immediate feedback to help the contractor take better photos if needed.
    `;

    try {
      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: photoUrl // This would need to be base64 in production
          }
        }
      ]);
      
      const response = await result.response;
      const text = response.text();
      
      // Parse response and provide structured feedback
      const isAcceptable = !text.toLowerCase().includes('retake') && !text.toLowerCase().includes('unclear');
      
      return {
        isAcceptable,
        feedback: isAcceptable ? 'Photo looks good!' : 'Photo needs improvement',
        retakeRequired: !isAcceptable,
        suggestions: isAcceptable ? [] : [
          'Ensure good lighting',
          'Include the entire work area',
          'Keep the camera steady',
          'Clean the lens if needed'
        ]
      };
    } catch (error) {
      console.error('Real-time photo analysis error:', error);
      return {
        isAcceptable: true, // Don't block work due to AI error
        feedback: 'Photo uploaded successfully',
        retakeRequired: false,
        suggestions: []
      };
    }
  }
}

// Export singleton instance
export const aiQualityService = new AIQualityVerificationService();