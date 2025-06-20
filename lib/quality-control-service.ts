// Quality Control Service with AI Photo Verification
import { db, storage } from './firebase';
import { 
  collection, doc, setDoc, updateDoc, getDoc, 
  query, where, getDocs, Timestamp, increment, arrayUnion 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-vision' });

export interface ServicePhotoRequirement {
  id: string;
  serviceType: string;
  category: string;
  title: string;
  description: string;
  examples: string[];
  required: boolean;
  verificationCriteria: string[];
  aiPrompt: string;
}

export interface WorkPhoto {
  id: string;
  jobId: string;
  requirementId: string;
  url: string;
  thumbnail: string;
  uploadedAt: Date;
  metadata: {
    size: number;
    type: string;
    dimensions: { width: number; height: number };
    location?: { lat: number; lng: number };
  };
  verification: {
    status: 'pending' | 'verified' | 'rejected';
    aiScore: number;
    aiAnalysis: string;
    issues?: string[];
    verifiedAt?: Date;
  };
}

export interface JobQualityReport {
  jobId: string;
  contractorId: string;
  customerId: string;
  serviceType: string;
  photos: WorkPhoto[];
  overallScore: number;
  completionStatus: {
    requiredPhotos: number;
    uploadedPhotos: number;
    verifiedPhotos: number;
    rejectedPhotos: number;
  };
  aiAssessment: {
    workQuality: 'excellent' | 'good' | 'fair' | 'poor';
    codeCompliance: boolean;
    safetyCompliance: boolean;
    completeness: number; // percentage
    issues: string[];
    recommendations: string[];
  };
  customerApproval: {
    status: 'pending' | 'approved' | 'disputed';
    approvedAt?: Date;
    comments?: string;
    rating?: number;
  };
  paymentRelease: {
    status: 'held' | 'released' | 'disputed';
    amount: number;
    releasedAt?: Date;
  };
}

// Photo requirements for different service types
export const photoRequirements: Record<string, ServicePhotoRequirement[]> = {
  'plumbing-repair': [
    {
      id: 'plumb-1',
      serviceType: 'plumbing-repair',
      category: 'before',
      title: 'Issue Overview',
      description: 'Wide shot showing the plumbing issue',
      examples: ['/examples/plumbing-before-1.jpg'],
      required: true,
      verificationCriteria: ['Shows plumbing fixture', 'Visible problem area', 'Good lighting'],
      aiPrompt: 'Analyze this plumbing issue photo. Identify the type of problem, affected components, and severity.'
    },
    {
      id: 'plumb-2',
      serviceType: 'plumbing-repair',
      category: 'before',
      title: 'Close-up of Problem',
      description: 'Detailed view of the specific issue',
      examples: ['/examples/plumbing-before-2.jpg'],
      required: true,
      verificationCriteria: ['Clear close-up', 'Shows damage/issue', 'In focus'],
      aiPrompt: 'Examine this close-up plumbing photo. Describe the specific problem and potential causes.'
    },
    {
      id: 'plumb-3',
      serviceType: 'plumbing-repair',
      category: 'during',
      title: 'Work in Progress',
      description: 'Photo showing repair work being performed',
      examples: ['/examples/plumbing-during.jpg'],
      required: true,
      verificationCriteria: ['Shows tools/materials', 'Active repair visible', 'Safety equipment if needed'],
      aiPrompt: 'Verify this shows active plumbing repair work. Check for proper techniques and safety measures.'
    },
    {
      id: 'plumb-4',
      serviceType: 'plumbing-repair',
      category: 'after',
      title: 'Completed Repair',
      description: 'Wide shot of completed work',
      examples: ['/examples/plumbing-after-1.jpg'],
      required: true,
      verificationCriteria: ['Shows repaired area', 'Clean and professional', 'No visible issues'],
      aiPrompt: 'Assess the completed plumbing repair. Check for proper installation, cleanliness, and code compliance.'
    },
    {
      id: 'plumb-5',
      serviceType: 'plumbing-repair',
      category: 'after',
      title: 'Functionality Test',
      description: 'Photo/video showing water running properly',
      examples: ['/examples/plumbing-test.jpg'],
      required: true,
      verificationCriteria: ['Shows water flow', 'No leaks visible', 'Proper drainage'],
      aiPrompt: 'Verify the plumbing repair is functional. Check for proper water flow, no leaks, and correct operation.'
    },
    {
      id: 'plumb-6',
      serviceType: 'plumbing-repair',
      category: 'documentation',
      title: 'Parts/Materials Used',
      description: 'Photo of parts receipts or materials',
      examples: ['/examples/plumbing-parts.jpg'],
      required: false,
      verificationCriteria: ['Shows parts/materials', 'Receipts visible if applicable'],
      aiPrompt: 'Identify the plumbing parts and materials used. Verify they match the repair type.'
    }
  ],
  'electrical-service': [
    {
      id: 'elec-1',
      serviceType: 'electrical-service',
      category: 'safety',
      title: 'Circuit Breaker Panel',
      description: 'Photo of main panel with circuit labeled',
      examples: ['/examples/electrical-panel.jpg'],
      required: true,
      verificationCriteria: ['Panel clearly visible', 'Circuit breakers shown', 'Labeling visible'],
      aiPrompt: 'Analyze the electrical panel. Check for proper labeling, no visible hazards, and appropriate breaker sizes.'
    },
    {
      id: 'elec-2',
      serviceType: 'electrical-service',
      category: 'before',
      title: 'Existing Wiring/Issue',
      description: 'Current state of electrical work area',
      examples: ['/examples/electrical-before.jpg'],
      required: true,
      verificationCriteria: ['Shows existing conditions', 'Any issues visible', 'Safe working conditions'],
      aiPrompt: 'Examine the existing electrical setup. Identify any code violations, safety issues, or outdated components.'
    },
    {
      id: 'elec-3',
      serviceType: 'electrical-service',
      category: 'during',
      title: 'Wire Connections',
      description: 'Photo of wire connections being made',
      examples: ['/examples/electrical-wiring.jpg'],
      required: true,
      verificationCriteria: ['Proper wire nuts/connections', 'Color coding correct', 'No exposed copper'],
      aiPrompt: 'Verify electrical connections meet code. Check wire gauge, proper connections, and safety standards.'
    },
    {
      id: 'elec-4',
      serviceType: 'electrical-service',
      category: 'testing',
      title: 'Voltage Testing',
      description: 'Multimeter showing voltage readings',
      examples: ['/examples/electrical-testing.jpg'],
      required: true,
      verificationCriteria: ['Multimeter display visible', 'Proper voltage shown', 'Testing in progress'],
      aiPrompt: 'Verify voltage testing is being performed correctly. Check readings are within acceptable ranges.'
    },
    {
      id: 'elec-5',
      serviceType: 'electrical-service',
      category: 'after',
      title: 'Completed Installation',
      description: 'Final installed outlet/switch/fixture',
      examples: ['/examples/electrical-complete.jpg'],
      required: true,
      verificationCriteria: ['Professional installation', 'Proper mounting', 'No visible defects'],
      aiPrompt: 'Assess the completed electrical work for code compliance, safety, and professional installation.'
    }
  ],
  'hvac-maintenance': [
    {
      id: 'hvac-1',
      serviceType: 'hvac-maintenance',
      category: 'before',
      title: 'Filter Condition',
      description: 'Photo of existing air filter',
      examples: ['/examples/hvac-filter-dirty.jpg'],
      required: true,
      verificationCriteria: ['Filter visible', 'Condition clear', 'Size/type identifiable'],
      aiPrompt: 'Analyze the air filter condition. Determine if replacement is needed and identify filter type.'
    },
    {
      id: 'hvac-2',
      serviceType: 'hvac-maintenance',
      category: 'before',
      title: 'Coil Condition',
      description: 'Photo of evaporator/condenser coils',
      examples: ['/examples/hvac-coils-before.jpg'],
      required: true,
      verificationCriteria: ['Coils visible', 'Any dirt/debris shown', 'Access panel removed'],
      aiPrompt: 'Assess HVAC coil condition. Check for dirt, damage, or corrosion that needs attention.'
    },
    {
      id: 'hvac-3',
      serviceType: 'hvac-maintenance',
      category: 'during',
      title: 'Cleaning Process',
      description: 'Photo showing cleaning in progress',
      examples: ['/examples/hvac-cleaning.jpg'],
      required: true,
      verificationCriteria: ['Cleaning visible', 'Proper tools used', 'Safety equipment worn'],
      aiPrompt: 'Verify proper HVAC cleaning procedures are being followed. Check for appropriate cleaning methods.'
    },
    {
      id: 'hvac-4',
      serviceType: 'hvac-maintenance',
      category: 'testing',
      title: 'Temperature Readings',
      description: 'Thermometer showing supply/return temps',
      examples: ['/examples/hvac-temps.jpg'],
      required: true,
      verificationCriteria: ['Temperature display visible', 'Both supply and return', 'Reasonable differential'],
      aiPrompt: 'Analyze HVAC temperature readings. Verify proper temperature differential and system performance.'
    },
    {
      id: 'hvac-5',
      serviceType: 'hvac-maintenance',
      category: 'after',
      title: 'New Filter Installed',
      description: 'Photo of new, clean filter in place',
      examples: ['/examples/hvac-filter-new.jpg'],
      required: true,
      verificationCriteria: ['New filter visible', 'Properly installed', 'Correct size/type'],
      aiPrompt: 'Confirm new HVAC filter is properly installed. Verify correct size and orientation.'
    },
    {
      id: 'hvac-6',
      serviceType: 'hvac-maintenance',
      category: 'after',
      title: 'Clean Coils',
      description: 'Photo of cleaned coils',
      examples: ['/examples/hvac-coils-clean.jpg'],
      required: true,
      verificationCriteria: ['Coils clean', 'No debris visible', 'Fins straight'],
      aiPrompt: 'Verify HVAC coils have been properly cleaned. Check for damage and proper fin condition.'
    }
  ],
  'roofing-repair': [
    {
      id: 'roof-1',
      serviceType: 'roofing-repair',
      category: 'safety',
      title: 'Safety Setup',
      description: 'Photo showing ladder placement and safety equipment',
      examples: ['/examples/roof-safety.jpg'],
      required: true,
      verificationCriteria: ['Ladder secured', 'Safety harness visible', 'Proper setup'],
      aiPrompt: 'Verify proper safety setup for roof work. Check ladder placement, fall protection, and hazard mitigation.'
    },
    {
      id: 'roof-2',
      serviceType: 'roofing-repair',
      category: 'before',
      title: 'Damage Overview',
      description: 'Wide shot of roof damage area',
      examples: ['/examples/roof-damage-wide.jpg'],
      required: true,
      verificationCriteria: ['Damage visible', 'Reference points shown', 'Clear view'],
      aiPrompt: 'Analyze roof damage extent. Identify type of damage, affected area size, and repair requirements.'
    },
    {
      id: 'roof-3',
      serviceType: 'roofing-repair',
      category: 'before',
      title: 'Close-up Damage',
      description: 'Detailed view of specific damage',
      examples: ['/examples/roof-damage-close.jpg'],
      required: true,
      verificationCriteria: ['Clear detail', 'Damage type identifiable', 'Scale reference'],
      aiPrompt: 'Examine detailed roof damage. Determine repair method needed and materials required.'
    },
    {
      id: 'roof-4',
      serviceType: 'roofing-repair',
      category: 'during',
      title: 'Underlayment/Decking',
      description: 'Photo of exposed roof deck or underlayment',
      examples: ['/examples/roof-underlayment.jpg'],
      required: true,
      verificationCriteria: ['Substrate visible', 'Any rot/damage shown', 'Proper materials'],
      aiPrompt: 'Assess roof substrate condition. Check for water damage, proper underlayment, and structural integrity.'
    },
    {
      id: 'roof-5',
      serviceType: 'roofing-repair',
      category: 'after',
      title: 'Completed Repair',
      description: 'Photo of finished roof repair',
      examples: ['/examples/roof-complete.jpg'],
      required: true,
      verificationCriteria: ['Repair complete', 'Matches existing roof', 'Professional appearance'],
      aiPrompt: 'Evaluate completed roof repair. Check for proper installation, weatherproofing, and aesthetic match.'
    },
    {
      id: 'roof-6',
      serviceType: 'roofing-repair',
      category: 'after',
      title: 'Flashing/Seal Detail',
      description: 'Close-up of flashing and sealant work',
      examples: ['/examples/roof-flashing.jpg'],
      required: true,
      verificationCriteria: ['Proper flashing', 'Sealant applied', 'Watertight'],
      aiPrompt: 'Verify roof flashing and sealing. Check for proper overlap, sealant application, and water resistance.'
    }
  ]
};

class QualityControlService {
  // Get photo requirements for a service
  getPhotoRequirements(serviceType: string): ServicePhotoRequirement[] {
    return photoRequirements[serviceType] || [];
  }

  // Upload and verify work photo
  async uploadWorkPhoto(
    jobId: string,
    requirementId: string,
    file: File,
    metadata: any
  ): Promise<WorkPhoto> {
    // Upload to Firebase Storage
    const timestamp = Date.now();
    const fileName = `jobs/${jobId}/${requirementId}_${timestamp}.jpg`;
    const storageRef = ref(storage, fileName);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    
    // Create thumbnail (in production, use Cloud Functions)
    const thumbnail = url; // Same URL for now
    
    // Create photo record
    const photo: WorkPhoto = {
      id: doc(collection(db, 'workPhotos')).id,
      jobId,
      requirementId,
      url,
      thumbnail,
      uploadedAt: new Date(),
      metadata: {
        size: file.size,
        type: file.type,
        dimensions: metadata.dimensions || { width: 0, height: 0 },
        location: metadata.location
      },
      verification: {
        status: 'pending',
        aiScore: 0,
        aiAnalysis: ''
      }
    };
    
    // Save to Firestore
    await setDoc(doc(db, 'workPhotos', photo.id), photo);
    
    // Start AI verification
    this.verifyPhotoWithAI(photo);
    
    return photo;
  }

  // AI photo verification
  private async verifyPhotoWithAI(photo: WorkPhoto): Promise<void> {
    try {
      // Get the requirement for this photo
      const requirement = this.getRequirementById(photo.requirementId);
      if (!requirement) return;
      
      // Analyze with Gemini Vision
      const imageData = await this.fetchImageAsBase64(photo.url);
      
      const prompt = `
        ${requirement.aiPrompt}
        
        Also verify:
        1. Photo quality (lighting, focus, clarity)
        2. Shows required elements: ${requirement.verificationCriteria.join(', ')}
        3. Any safety or code compliance issues
        4. Professional workmanship
        
        Provide:
        - Score (0-100)
        - Pass/Fail for each criteria
        - Any issues found
        - Recommendations
      `;
      
      const result = await model.generateContent([
        { text: prompt },
        { 
          inlineData: { 
            mimeType: 'image/jpeg', 
            data: imageData 
          } 
        }
      ]);
      
      const analysis = this.parseAIResponse(result.response.text());
      
      // Update photo verification
      await updateDoc(doc(db, 'workPhotos', photo.id), {
        verification: {
          status: analysis.score >= 70 ? 'verified' : 'rejected',
          aiScore: analysis.score,
          aiAnalysis: analysis.summary,
          issues: analysis.issues,
          verifiedAt: Timestamp.now()
        }
      });
      
      // Update job quality report
      await this.updateJobQualityReport(photo.jobId);
      
    } catch (error) {
      console.error('AI verification error:', error);
      
      // Fallback to manual review
      await updateDoc(doc(db, 'workPhotos', photo.id), {
        'verification.status': 'pending',
        'verification.aiAnalysis': 'AI verification failed, manual review required'
      });
    }
  }

  // Create quality report for a job
  async createQualityReport(
    jobId: string,
    contractorId: string,
    customerId: string,
    serviceType: string,
    paymentAmount: number
  ): Promise<JobQualityReport> {
    const requirements = this.getPhotoRequirements(serviceType);
    const requiredCount = requirements.filter(r => r.required).length;
    
    const report: JobQualityReport = {
      jobId,
      contractorId,
      customerId,
      serviceType,
      photos: [],
      overallScore: 0,
      completionStatus: {
        requiredPhotos: requiredCount,
        uploadedPhotos: 0,
        verifiedPhotos: 0,
        rejectedPhotos: 0
      },
      aiAssessment: {
        workQuality: 'fair',
        codeCompliance: false,
        safetyCompliance: false,
        completeness: 0,
        issues: [],
        recommendations: []
      },
      customerApproval: {
        status: 'pending'
      },
      paymentRelease: {
        status: 'held',
        amount: paymentAmount
      }
    };
    
    await setDoc(doc(db, 'qualityReports', jobId), report);
    
    return report;
  }

  // Update quality report as photos are uploaded
  async updateJobQualityReport(jobId: string): Promise<void> {
    // Get all photos for this job
    const photosQuery = query(
      collection(db, 'workPhotos'),
      where('jobId', '==', jobId)
    );
    const photosSnapshot = await getDocs(photosQuery);
    const photos = photosSnapshot.docs.map(doc => doc.data() as WorkPhoto);
    
    // Get the quality report
    const reportDoc = await getDoc(doc(db, 'qualityReports', jobId));
    if (!reportDoc.exists()) return;
    
    const report = reportDoc.data() as JobQualityReport;
    
    // Update completion status
    const verifiedPhotos = photos.filter(p => p.verification.status === 'verified');
    const rejectedPhotos = photos.filter(p => p.verification.status === 'rejected');
    
    report.completionStatus = {
      requiredPhotos: report.completionStatus.requiredPhotos,
      uploadedPhotos: photos.length,
      verifiedPhotos: verifiedPhotos.length,
      rejectedPhotos: rejectedPhotos.length
    };
    
    // Calculate overall score
    if (verifiedPhotos.length > 0) {
      const avgScore = verifiedPhotos.reduce((sum, p) => sum + p.verification.aiScore, 0) / verifiedPhotos.length;
      report.overallScore = Math.round(avgScore);
    }
    
    // Update AI assessment
    const completeness = (verifiedPhotos.length / report.completionStatus.requiredPhotos) * 100;
    report.aiAssessment.completeness = Math.round(completeness);
    
    // Determine work quality based on scores
    if (report.overallScore >= 90) {
      report.aiAssessment.workQuality = 'excellent';
    } else if (report.overallScore >= 80) {
      report.aiAssessment.workQuality = 'good';
    } else if (report.overallScore >= 70) {
      report.aiAssessment.workQuality = 'fair';
    } else {
      report.aiAssessment.workQuality = 'poor';
    }
    
    // Check if ready for customer approval
    if (completeness >= 100 && report.overallScore >= 70) {
      // Notify customer for approval
      await this.notifyCustomerForApproval(report.customerId, jobId);
    }
    
    // Save updated report
    await updateDoc(doc(db, 'qualityReports', jobId), report as any);
  }

  // Customer approves completed work
  async approveWork(
    jobId: string,
    customerId: string,
    rating: number,
    comments?: string
  ): Promise<void> {
    const report = await this.getQualityReport(jobId);
    if (!report || report.customerId !== customerId) {
      throw new Error('Unauthorized');
    }
    
    // Update approval status
    await updateDoc(doc(db, 'qualityReports', jobId), {
      'customerApproval.status': 'approved',
      'customerApproval.approvedAt': Timestamp.now(),
      'customerApproval.rating': rating,
      'customerApproval.comments': comments,
      'paymentRelease.status': 'released',
      'paymentRelease.releasedAt': Timestamp.now()
    });
    
    // Trigger payment release
    await this.releasePayment(jobId, report.contractorId, report.paymentRelease.amount);
    
    // Add photos to contractor portfolio
    await this.addToPortfolio(report.contractorId, report.photos, report.serviceType);
    
    // Create review records
    await this.createMutualReviews(jobId, customerId, report.contractorId, rating);
  }

  // Customer disputes work quality
  async disputeWork(
    jobId: string,
    customerId: string,
    reason: string,
    evidence?: string[]
  ): Promise<void> {
    await updateDoc(doc(db, 'qualityReports', jobId), {
      'customerApproval.status': 'disputed',
      'customerApproval.disputeReason': reason,
      'customerApproval.disputeEvidence': evidence,
      'customerApproval.disputedAt': Timestamp.now(),
      'paymentRelease.status': 'disputed'
    });
    
    // Create dispute case for resolution
    await this.createDisputeCase(jobId, customerId, reason, evidence);
  }

  // Release payment to contractor
  private async releasePayment(
    jobId: string,
    contractorId: string,
    amount: number
  ): Promise<void> {
    // Call Stripe to release funds from escrow
    // This would integrate with Stripe Connect
    console.log(`Releasing payment of $${amount} to contractor ${contractorId}`);
    
    // Update contractor earnings
    await updateDoc(doc(db, 'contractors', contractorId), {
      'earnings.pending': increment(-amount),
      'earnings.available': increment(amount),
      'earnings.total': increment(amount)
    });
    
    // Create payout record
    await setDoc(doc(collection(db, 'payouts')), {
      contractorId,
      jobId,
      amount,
      status: 'completed',
      createdAt: Timestamp.now()
    });
  }

  // Add verified photos to contractor portfolio
  private async addToPortfolio(
    contractorId: string,
    photos: WorkPhoto[],
    serviceType: string
  ): Promise<void> {
    const portfolioPhotos = photos
      .filter(p => p.verification.status === 'verified' && p.verification.aiScore >= 80)
      .map(p => ({
        url: p.url,
        thumbnail: p.thumbnail,
        serviceType,
        uploadedAt: p.uploadedAt,
        score: p.verification.aiScore
      }));
    
    if (portfolioPhotos.length > 0) {
      await updateDoc(doc(db, 'contractors', contractorId), {
        portfolio: arrayUnion(...portfolioPhotos)
      });
    }
  }

  // Create mutual review records
  private async createMutualReviews(
    jobId: string,
    customerId: string,
    contractorId: string,
    customerRating: number
  ): Promise<void> {
    // Customer review of contractor
    await setDoc(doc(collection(db, 'reviews')), {
      type: 'customer_to_contractor',
      jobId,
      reviewerId: customerId,
      revieweeId: contractorId,
      rating: customerRating,
      createdAt: Timestamp.now()
    });
    
    // Prompt contractor to review customer
    await setDoc(doc(collection(db, 'pendingReviews')), {
      type: 'contractor_to_customer',
      jobId,
      reviewerId: contractorId,
      revieweeId: customerId,
      status: 'pending',
      createdAt: Timestamp.now()
    });
  }

  // Helper methods
  private getRequirementById(requirementId: string): ServicePhotoRequirement | null {
    for (const requirements of Object.values(photoRequirements)) {
      const found = requirements.find(r => r.id === requirementId);
      if (found) return found;
    }
    return null;
  }

  private async fetchImageAsBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });
  }

  private parseAIResponse(response: string): any {
    // Parse AI response into structured data
    // This would be more sophisticated in production
    return {
      score: 85,
      summary: 'Work appears complete and professional',
      issues: [],
      recommendations: []
    };
  }

  private async notifyCustomerForApproval(customerId: string, jobId: string): Promise<void> {
    // Send notification to customer
    console.log(`Notifying customer ${customerId} to approve job ${jobId}`);
  }

  private async createDisputeCase(
    jobId: string,
    customerId: string,
    reason: string,
    evidence?: string[]
  ): Promise<void> {
    await setDoc(doc(collection(db, 'disputes')), {
      jobId,
      customerId,
      reason,
      evidence,
      status: 'open',
      createdAt: Timestamp.now()
    });
  }

  async getQualityReport(jobId: string): Promise<JobQualityReport | null> {
    const qualityDoc = await getDoc(doc(db, 'qualityReports', jobId));
    return qualityDoc.exists() ? qualityDoc.data() as JobQualityReport : null;
  }
}

// Export singleton instance
export const qualityControlService = new QualityControlService();