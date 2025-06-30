import { Timestamp } from 'firebase/firestore';

export interface ContractorScore {
  contractorId: string;
  algorithmScore: number;
  customerApprovalRate: number;
  onTimeRate: number;
  qualityScore: number;
  disputeRate: number;
  monthlyVolume: number;
  lastAssignmentTime?: Date;
  blacklisted: boolean;
  blacklistReason?: string;
}

export interface JobRequest {
  id: string;
  serviceType: string;
  location: { lat: number; lng: number };
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  estimatedDuration: number;
  estimatedValue: number;
  preferredTimeSlots?: string[];
  customerRating?: number;
}

export interface AssignmentResult {
  jobId: string;
  assignedContractorId: string | null;
  score: number;
  reason: string;
  alternativeContractors?: string[];
}

export class JobAssignmentAlgorithm {
  private readonly SCORE_WEIGHTS = {
    customerApproval: 0.35,
    onTime: 0.25,
    quality: 0.30,
    lowDispute: 0.10
  };

  private readonly URGENCY_MULTIPLIERS = {
    low: 1.0,
    medium: 1.1,
    high: 1.2,
    emergency: 1.5
  };

  private readonly ASSIGNMENT_COOLDOWN_MINUTES = 5;

  /**
   * Calculate the overall algorithm score for a contractor
   */
  calculateAlgorithmScore(contractor: Omit<ContractorScore, 'algorithmScore'>): number {
    const weights = this.SCORE_WEIGHTS;
    
    const score = 
      contractor.customerApprovalRate * weights.customerApproval +
      contractor.onTimeRate * weights.onTime +
      contractor.qualityScore * weights.quality +
      (100 - contractor.disputeRate) * weights.lowDispute;
    
    return Math.round(score);
  }

  /**
   * Assign a job to the best available contractor
   */
  async assignJob(
    job: JobRequest,
    availableContractors: ContractorScore[],
    contractorSpecialties: Map<string, string[]>
  ): Promise<AssignmentResult> {
    // Filter out blacklisted contractors
    const eligibleContractors = availableContractors.filter(c => !c.blacklisted);

    if (eligibleContractors.length === 0) {
      return {
        jobId: job.id,
        assignedContractorId: null,
        score: 0,
        reason: 'No eligible contractors available'
      };
    }

    // Score and rank contractors
    const scoredContractors = eligibleContractors.map(contractor => {
      let score = contractor.algorithmScore;

      // Apply specialty bonus
      const specialties = contractorSpecialties.get(contractor.contractorId) || [];
      if (specialties.includes(job.serviceType)) {
        score *= 1.15; // 15% bonus for specialty match
      }

      // Apply urgency multiplier
      score *= this.URGENCY_MULTIPLIERS[job.urgency];

      // Apply cooldown penalty if recently assigned
      if (contractor.lastAssignmentTime) {
        const minutesSinceLastAssignment = 
          (Date.now() - contractor.lastAssignmentTime.getTime()) / (1000 * 60);
        
        if (minutesSinceLastAssignment < this.ASSIGNMENT_COOLDOWN_MINUTES) {
          score *= 0.7; // 30% penalty during cooldown
        }
      }

      // Apply volume tier bonus (higher volume contractors get slight preference)
      if (contractor.monthlyVolume > 50000) {
        score *= 1.05; // 5% bonus for enterprise tier
      } else if (contractor.monthlyVolume > 15000) {
        score *= 1.03; // 3% bonus for professional tier
      }

      return {
        contractor,
        finalScore: score
      };
    });

    // Sort by score (highest first)
    scoredContractors.sort((a, b) => b.finalScore - a.finalScore);

    const topContractor = scoredContractors[0];
    const alternatives = scoredContractors.slice(1, 4).map(sc => sc.contractor.contractorId);

    return {
      jobId: job.id,
      assignedContractorId: topContractor.contractor.contractorId,
      score: topContractor.finalScore,
      reason: `Assigned based on algorithm score: ${topContractor.contractor.algorithmScore}%`,
      alternativeContractors: alternatives
    };
  }

  /**
   * Blacklist a contractor for failing to complete work
   */
  blacklistContractor(
    contractorId: string,
    reason: string,
    severity: 'temporary' | 'permanent' = 'temporary'
  ): { blacklistDuration?: number; permanent: boolean } {
    if (severity === 'permanent') {
      return { permanent: true };
    }

    // Temporary blacklist durations based on reason
    const durations: Record<string, number> = {
      'no_show': 7 * 24 * 60, // 7 days
      'incomplete_work': 14 * 24 * 60, // 14 days
      'customer_complaint': 3 * 24 * 60, // 3 days
      'quality_failure': 7 * 24 * 60, // 7 days
      'repeated_cancellations': 30 * 24 * 60, // 30 days
    };

    const duration = durations[reason] || 7 * 24 * 60; // Default 7 days

    return {
      blacklistDuration: duration,
      permanent: false
    };
  }

  /**
   * Calculate contractor performance metrics from job history
   */
  calculatePerformanceMetrics(
    jobHistory: Array<{
      completed: boolean;
      onTime: boolean;
      customerRating?: number;
      aiQualityScore?: number;
      disputed: boolean;
    }>
  ): Omit<ContractorScore, 'contractorId' | 'algorithmScore' | 'monthlyVolume' | 'blacklisted' | 'blacklistReason'> {
    if (jobHistory.length === 0) {
      return {
        customerApprovalRate: 100,
        onTimeRate: 100,
        qualityScore: 100,
        disputeRate: 0
      };
    }

    const completedJobs = jobHistory.filter(j => j.completed);
    const onTimeJobs = completedJobs.filter(j => j.onTime);
    const ratedJobs = completedJobs.filter(j => j.customerRating !== undefined);
    const qualityJobs = completedJobs.filter(j => j.aiQualityScore !== undefined);
    const disputedJobs = jobHistory.filter(j => j.disputed);

    // Calculate approval rate (jobs with 4+ star rating)
    const approvedJobs = ratedJobs.filter(j => (j.customerRating || 0) >= 4);
    const customerApprovalRate = ratedJobs.length > 0
      ? (approvedJobs.length / ratedJobs.length) * 100
      : 100;

    // Calculate on-time rate
    const onTimeRate = completedJobs.length > 0
      ? (onTimeJobs.length / completedJobs.length) * 100
      : 100;

    // Calculate average quality score
    const qualityScore = qualityJobs.length > 0
      ? qualityJobs.reduce((sum, j) => sum + (j.aiQualityScore || 0), 0) / qualityJobs.length
      : 100;

    // Calculate dispute rate
    const disputeRate = jobHistory.length > 0
      ? (disputedJobs.length / jobHistory.length) * 100
      : 0;

    return {
      customerApprovalRate: Math.round(customerApprovalRate),
      onTimeRate: Math.round(onTimeRate),
      qualityScore: Math.round(qualityScore),
      disputeRate: Math.round(disputeRate)
    };
  }

  /**
   * Redistribute jobs from a blacklisted contractor
   */
  async redistributeJobs(
    blacklistedContractorId: string,
    activeJobs: JobRequest[],
    availableContractors: ContractorScore[],
    contractorSpecialties: Map<string, string[]>
  ): Promise<AssignmentResult[]> {
    // Filter out the blacklisted contractor
    const eligibleContractors = availableContractors.filter(
      c => c.contractorId !== blacklistedContractorId && !c.blacklisted
    );

    const reassignments: AssignmentResult[] = [];

    for (const job of activeJobs) {
      const assignment = await this.assignJob(job, eligibleContractors, contractorSpecialties);
      reassignments.push({
        ...assignment,
        reason: `Reassigned from blacklisted contractor: ${assignment.reason}`
      });
    }

    return reassignments;
  }

  /**
   * Get contractor recommendations for improvement
   */
  getImprovementRecommendations(metrics: ContractorScore): string[] {
    const recommendations: string[] = [];

    if (metrics.customerApprovalRate < 80) {
      recommendations.push('Focus on customer satisfaction - ensure clear communication and quality work');
    }

    if (metrics.onTimeRate < 85) {
      recommendations.push('Improve time management - arrive on time and complete jobs within estimated duration');
    }

    if (metrics.qualityScore < 80) {
      recommendations.push('Enhance work quality - review AI feedback on submitted photos and address common issues');
    }

    if (metrics.disputeRate > 5) {
      recommendations.push('Reduce disputes - clarify scope of work upfront and maintain professional conduct');
    }

    if (metrics.algorithmScore < 70) {
      recommendations.push('⚠️ Your algorithm score is low - you may receive fewer job assignments');
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job! Keep maintaining your high standards');
    }

    return recommendations;
  }
}

// Export singleton instance
export const jobAssignmentAlgorithm = new JobAssignmentAlgorithm();