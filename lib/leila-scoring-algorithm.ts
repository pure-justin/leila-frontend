/**
 * Leila Score Algorithm - AI-powered comprehensive scoring system
 * 
 * The Leila Score is an objective, AI-calculated score from 1-100 that evaluates
 * contractors and their work based on multiple factors, similar to how Rotten Tomatoes
 * aggregates critical reviews.
 */

export interface ScoringFactors {
  // Work Quality (35% weight)
  aiPhotoQualityScore: number; // 0-100 from AI photo analysis
  completionAccuracy: number; // 0-100 how well work matches description
  cleanlinessScore: number; // 0-100 work area cleanliness
  attentionToDetail: number; // 0-100 based on AI analysis
  
  // Professionalism (25% weight)
  punctualityScore: number; // 0-100 arrival and completion time
  communicationScore: number; // 0-100 response time and clarity
  professionalConduct: number; // 0-100 behavior and presentation
  
  // Reliability (20% weight)
  completionRate: number; // 0-100 percentage of jobs completed
  onTimeRate: number; // 0-100 percentage completed on schedule
  noShowRate: number; // 0-100 inverse of no-show rate
  
  // Customer Interaction (10% weight)
  issueResolutionScore: number; // 0-100 how well issues are resolved
  followUpScore: number; // 0-100 post-job follow up
  
  // Value (10% weight)
  priceFairness: number; // 0-100 compared to market rates
  noHiddenFees: number; // 0-100 transparency in pricing
}

export interface JobMetrics {
  startTime: Date;
  scheduledStartTime: Date;
  completionTime: Date;
  estimatedDuration: number; // in minutes
  actualDuration: number; // in minutes
  quotedPrice: number;
  finalPrice: number;
  communicationResponseTimes: number[]; // array of response times in minutes
  issuesReported: number;
  issuesResolved: number;
  customerComplaint: boolean;
  requiredRework: boolean;
  photosSubmitted: number;
  photosApproved: number;
}

export class LeilaScoringAlgorithm {
  private readonly WEIGHTS = {
    workQuality: 0.35,
    professionalism: 0.25,
    reliability: 0.20,
    customerInteraction: 0.10,
    value: 0.10
  };

  /**
   * Calculate the overall Leila Score for a contractor
   */
  calculateLeilaScore(factors: ScoringFactors): number {
    const workQualityScore = this.calculateWorkQualityScore(factors);
    const professionalismScore = this.calculateProfessionalismScore(factors);
    const reliabilityScore = this.calculateReliabilityScore(factors);
    const customerInteractionScore = this.calculateCustomerInteractionScore(factors);
    const valueScore = this.calculateValueScore(factors);

    const weightedScore = 
      workQualityScore * this.WEIGHTS.workQuality +
      professionalismScore * this.WEIGHTS.professionalism +
      reliabilityScore * this.WEIGHTS.reliability +
      customerInteractionScore * this.WEIGHTS.customerInteraction +
      valueScore * this.WEIGHTS.value;

    // Apply modifiers for exceptional or poor performance
    let finalScore = weightedScore;
    
    // Bonus for consistently high scores
    if (workQualityScore >= 95 && professionalismScore >= 95) {
      finalScore = Math.min(100, finalScore + 3);
    }
    
    // Penalty for critical failures
    if (factors.noShowRate < 80 || factors.completionRate < 85) {
      finalScore = Math.max(0, finalScore - 10);
    }

    return Math.round(finalScore);
  }

  /**
   * Calculate Leila Score from job metrics
   */
  calculateLeilaScoreFromJob(metrics: JobMetrics, aiPhotoScore: number): number {
    const factors: ScoringFactors = {
      // Work Quality
      aiPhotoQualityScore: aiPhotoScore,
      completionAccuracy: metrics.requiredRework ? 60 : 95,
      cleanlinessScore: aiPhotoScore, // Derived from AI photo analysis
      attentionToDetail: aiPhotoScore,
      
      // Professionalism
      punctualityScore: this.calculatePunctualityScore(metrics),
      communicationScore: this.calculateCommunicationScore(metrics.communicationResponseTimes),
      professionalConduct: metrics.customerComplaint ? 70 : 95,
      
      // Reliability
      completionRate: 100, // For single job
      onTimeRate: this.calculateOnTimeScore(metrics),
      noShowRate: 100, // Showed up for this job
      
      // Customer Interaction
      issueResolutionScore: this.calculateIssueResolutionScore(metrics),
      followUpScore: 85, // Default, would need tracking
      
      // Value
      priceFairness: this.calculatePriceFairnessScore(metrics),
      noHiddenFees: metrics.finalPrice <= metrics.quotedPrice ? 100 : 70
    };

    return this.calculateLeilaScore(factors);
  }

  private calculateWorkQualityScore(factors: ScoringFactors): number {
    return (
      factors.aiPhotoQualityScore * 0.4 +
      factors.completionAccuracy * 0.3 +
      factors.cleanlinessScore * 0.2 +
      factors.attentionToDetail * 0.1
    );
  }

  private calculateProfessionalismScore(factors: ScoringFactors): number {
    return (
      factors.punctualityScore * 0.4 +
      factors.communicationScore * 0.3 +
      factors.professionalConduct * 0.3
    );
  }

  private calculateReliabilityScore(factors: ScoringFactors): number {
    return (
      factors.completionRate * 0.4 +
      factors.onTimeRate * 0.4 +
      factors.noShowRate * 0.2
    );
  }

  private calculateCustomerInteractionScore(factors: ScoringFactors): number {
    return (
      factors.issueResolutionScore * 0.6 +
      factors.followUpScore * 0.4
    );
  }

  private calculateValueScore(factors: ScoringFactors): number {
    return (
      factors.priceFairness * 0.6 +
      factors.noHiddenFees * 0.4
    );
  }

  private calculatePunctualityScore(metrics: JobMetrics): number {
    const minutesLate = Math.max(0, 
      (metrics.startTime.getTime() - metrics.scheduledStartTime.getTime()) / (1000 * 60)
    );
    
    if (minutesLate === 0) return 100;
    if (minutesLate <= 15) return 90;
    if (minutesLate <= 30) return 75;
    if (minutesLate <= 60) return 60;
    return 40;
  }

  private calculateOnTimeScore(metrics: JobMetrics): number {
    const overrunPercentage = 
      ((metrics.actualDuration - metrics.estimatedDuration) / metrics.estimatedDuration) * 100;
    
    if (overrunPercentage <= 0) return 100;
    if (overrunPercentage <= 10) return 95;
    if (overrunPercentage <= 25) return 85;
    if (overrunPercentage <= 50) return 70;
    return 50;
  }

  private calculateCommunicationScore(responseTimes: number[]): number {
    if (responseTimes.length === 0) return 85; // Default if no data
    
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    
    if (avgResponseTime <= 5) return 100;
    if (avgResponseTime <= 15) return 95;
    if (avgResponseTime <= 30) return 85;
    if (avgResponseTime <= 60) return 70;
    return 50;
  }

  private calculateIssueResolutionScore(metrics: JobMetrics): number {
    if (metrics.issuesReported === 0) return 100;
    
    const resolutionRate = metrics.issuesResolved / metrics.issuesReported;
    return Math.round(resolutionRate * 100);
  }

  private calculatePriceFairnessScore(metrics: JobMetrics): number {
    const priceVariance = 
      ((metrics.finalPrice - metrics.quotedPrice) / metrics.quotedPrice) * 100;
    
    if (priceVariance <= 0) return 100; // Came in under budget
    if (priceVariance <= 5) return 95;
    if (priceVariance <= 10) return 85;
    if (priceVariance <= 20) return 70;
    return 50;
  }

  /**
   * Get descriptive rating based on Leila Score
   */
  getRating(score: number): {
    label: string;
    description: string;
    color: string;
  } {
    if (score >= 90) {
      return {
        label: 'Certified Excellence',
        description: 'Exceptional service provider with consistent high-quality work',
        color: 'green'
      };
    } else if (score >= 75) {
      return {
        label: 'Highly Recommended',
        description: 'Reliable professional with above-average performance',
        color: 'green'
      };
    } else if (score >= 60) {
      return {
        label: 'Satisfactory',
        description: 'Meets expectations with room for improvement',
        color: 'yellow'
      };
    } else if (score >= 40) {
      return {
        label: 'Below Average',
        description: 'Inconsistent performance, proceed with caution',
        color: 'orange'
      };
    } else {
      return {
        label: 'Not Recommended',
        description: 'Significant issues reported, consider alternatives',
        color: 'red'
      };
    }
  }

  /**
   * Calculate trend direction based on recent scores
   */
  calculateTrend(recentScores: number[]): 'improving' | 'stable' | 'declining' {
    if (recentScores.length < 3) return 'stable';
    
    const recentAvg = recentScores.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const olderAvg = recentScores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }
}

// Export singleton instance
export const leilaScoringAlgorithm = new LeilaScoringAlgorithm();