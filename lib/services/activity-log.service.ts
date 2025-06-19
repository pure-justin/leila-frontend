import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  increment,
  runTransaction,
  QueryConstraint,
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  ActivityLog, 
  SystemMetrics, 
  ActorType, 
  ActionCategory, 
  ActionStatus,
  LogLevel,
  ReportConfig,
  DashboardWidget,
  AIAgent,
  ActivitySummary
} from '@/lib/types/activity-log';

// Collection names
const COLLECTIONS = {
  ACTIVITY_LOGS: 'activity_logs',
  SYSTEM_METRICS: 'system_metrics',
  REPORTS: 'reports',
  DASHBOARDS: 'dashboards',
  AI_AGENTS: 'ai_agents',
  ACTIVITY_SUMMARIES: 'activity_summaries'
};

export class ActivityLogService {
  private metricsListeners: Map<string, Unsubscribe> = new Map();
  private activityBuffer: ActivityLog[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start buffer flush interval (batch writes for performance)
    this.startFlushInterval();
  }

  // ============= ACTIVITY LOGGING =============

  /**
   * Log a new activity
   */
  async logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<string> {
    try {
      const id = doc(collection(db, COLLECTIONS.ACTIVITY_LOGS)).id;
      const timestamp = new Date();
      
      const activityLog: ActivityLog = {
        id,
        timestamp,
        ...activity
      };

      // Add to buffer for batch processing
      this.activityBuffer.push(activityLog);

      // If critical, flush immediately
      if (activity.audit.level === LogLevel.CRITICAL || 
          activity.audit.level === LogLevel.ERROR) {
        await this.flushActivityBuffer();
      }

      // Update real-time metrics
      await this.updateMetrics(activityLog);

      return id;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  /**
   * Log human action
   */
  async logHumanAction(
    userId: string,
    userName: string,
    action: ActionCategory,
    resourceType: string,
    resourceId: string,
    metadata?: any
  ): Promise<string> {
    return this.logActivity({
      actor: {
        type: ActorType.HUMAN,
        id: userId,
        name: userName,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        sessionId: metadata?.sessionId
      },
      action: {
        category: action,
        status: ActionStatus.COMPLETED,
        description: `${userName} performed ${action}`,
        metadata
      },
      resources: {
        primary: {
          type: resourceType,
          id: resourceId,
          name: metadata?.resourceName
        }
      },
      context: {
        environment: process.env.NODE_ENV as any || 'development',
        source: metadata?.source || 'web',
        correlationId: metadata?.correlationId
      },
      audit: {
        level: LogLevel.INFO,
        tags: [action, resourceType],
        isCompliant: true,
        requiresReview: false
      }
    });
  }

  /**
   * Log AI agent action
   */
  async logAIAction(
    agentId: string,
    agentName: string,
    action: ActionCategory,
    resourceType: string,
    resourceId: string,
    decision: {
      reasoning: string;
      confidence: number;
      model: string;
      promptTokens?: number;
      completionTokens?: number;
    }
  ): Promise<string> {
    return this.logActivity({
      actor: {
        type: ActorType.AI_AGENT,
        id: agentId,
        name: agentName
      },
      action: {
        category: action,
        status: ActionStatus.COMPLETED,
        description: `AI Agent ${agentName} performed ${action}`,
        metadata: { decision }
      },
      resources: {
        primary: {
          type: resourceType,
          id: resourceId
        }
      },
      context: {
        environment: process.env.NODE_ENV as any || 'development',
        source: 'api'
      },
      ai: {
        model: decision.model,
        confidence: decision.confidence,
        reasoning: decision.reasoning,
        promptTokens: decision.promptTokens,
        completionTokens: decision.completionTokens,
        cost: this.calculateAICost(decision.model, decision.promptTokens || 0, decision.completionTokens || 0)
      },
      audit: {
        level: LogLevel.INFO,
        tags: [action, resourceType, 'ai-action'],
        isCompliant: true,
        requiresReview: decision.confidence < 0.8
      }
    });
  }

  /**
   * Start an activity (for long-running operations)
   */
  async startActivity(
    actor: ActivityLog['actor'],
    action: Omit<ActivityLog['action'], 'status' | 'duration'>,
    resources: ActivityLog['resources'],
    context: ActivityLog['context']
  ): Promise<string> {
    return this.logActivity({
      actor,
      action: {
        ...action,
        status: ActionStatus.IN_PROGRESS
      },
      resources,
      context,
      audit: {
        level: LogLevel.INFO,
        tags: [action.category, resources.primary.type],
        isCompliant: true,
        requiresReview: false
      }
    });
  }

  /**
   * Complete an activity
   */
  async completeActivity(
    activityId: string,
    result: { status: ActionStatus; metadata?: any; error?: any }
  ): Promise<void> {
    try {
      const activityRef = doc(db, COLLECTIONS.ACTIVITY_LOGS, activityId);
      const activityDoc = await getDoc(activityRef);
      
      if (!activityDoc.exists()) {
        throw new Error('Activity not found');
      }

      const activity = activityDoc.data() as ActivityLog;
      const duration = Date.now() - activity.timestamp.getTime();

      await setDoc(activityRef, {
        action: {
          ...activity.action,
          status: result.status,
          duration,
          metadata: { ...activity.action.metadata, ...result.metadata }
        },
        error: result.error ? {
          code: result.error.code || 'UNKNOWN',
          message: result.error.message || 'Unknown error',
          stackTrace: result.error.stack
        } : undefined,
        audit: {
          ...activity.audit,
          level: result.status === ActionStatus.FAILED ? LogLevel.ERROR : activity.audit.level
        }
      }, { merge: true });
    } catch (error) {
      console.error('Error completing activity:', error);
      throw error;
    }
  }

  // ============= REAL-TIME MONITORING =============

  /**
   * Subscribe to real-time metrics
   */
  subscribeToMetrics(callback: (metrics: SystemMetrics) => void): Unsubscribe {
    const metricsQuery = query(
      collection(db, COLLECTIONS.SYSTEM_METRICS),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    return onSnapshot(metricsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const metrics = snapshot.docs[0].data() as SystemMetrics;
        callback(metrics);
      }
    });
  }

  /**
   * Subscribe to real-time activities
   */
  subscribeToActivities(
    filters: {
      actorType?: ActorType;
      actionCategory?: ActionCategory;
      logLevel?: LogLevel;
    },
    callback: (activities: ActivityLog[]) => void
  ): Unsubscribe {
    const constraints: QueryConstraint[] = [
      orderBy('timestamp', 'desc'),
      limit(50)
    ];

    if (filters.actorType) {
      constraints.push(where('actor.type', '==', filters.actorType));
    }
    if (filters.actionCategory) {
      constraints.push(where('action.category', '==', filters.actionCategory));
    }
    if (filters.logLevel) {
      constraints.push(where('audit.level', '==', filters.logLevel));
    }

    const activitiesQuery = query(
      collection(db, COLLECTIONS.ACTIVITY_LOGS),
      ...constraints
    );

    return onSnapshot(activitiesQuery, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ActivityLog));
      callback(activities);
    });
  }

  /**
   * Get current system health
   */
  async getSystemHealth(): Promise<SystemMetrics['health']> {
    try {
      // In a real implementation, this would check actual system resources
      return {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        storage: Math.random() * 100,
        queueLength: Math.floor(Math.random() * 10),
        activeConnections: Math.floor(Math.random() * 100),
        alerts: []
      };
    } catch (error) {
      console.error('Error getting system health:', error);
      throw error;
    }
  }

  // ============= REPORTING =============

  /**
   * Generate activity report
   */
  async generateReport(config: ReportConfig): Promise<ActivitySummary> {
    try {
      const constraints: QueryConstraint[] = [];

      // Time range
      if (config.timeRange.type === 'fixed' && config.timeRange.start && config.timeRange.end) {
        constraints.push(
          where('timestamp', '>=', config.timeRange.start),
          where('timestamp', '<=', config.timeRange.end)
        );
      }

      // Actor filters
      if (config.filters.actors?.types?.length) {
        constraints.push(where('actor.type', 'in', config.filters.actors.types));
      }

      // Action filters
      if (config.filters.actions?.categories?.length) {
        constraints.push(where('action.category', 'in', config.filters.actions.categories));
      }

      // Log level filters
      if (config.filters.logLevels?.length) {
        constraints.push(where('audit.level', 'in', config.filters.logLevels));
      }

      const activitiesQuery = query(
        collection(db, COLLECTIONS.ACTIVITY_LOGS),
        ...constraints
      );

      const snapshot = await getDocs(activitiesQuery);
      const activities = snapshot.docs.map(doc => doc.data() as ActivityLog);

      // Generate summary
      const summary = this.generateActivitySummary(activities, config);

      // Save report
      await this.saveReport(config, summary);

      return summary;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Get saved reports
   */
  async getSavedReports(userId: string): Promise<ReportConfig[]> {
    try {
      const reportsQuery = query(
        collection(db, COLLECTIONS.REPORTS),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(reportsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ReportConfig));
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  // ============= AI AGENT MANAGEMENT =============

  /**
   * Get all AI agents
   */
  async getAIAgents(): Promise<AIAgent[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.AI_AGENTS));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AIAgent));
    } catch (error) {
      console.error('Error fetching AI agents:', error);
      throw error;
    }
  }

  /**
   * Update AI agent status
   */
  async updateAIAgentStatus(
    agentId: string, 
    status: AIAgent['state']['status'],
    currentTask?: string
  ): Promise<void> {
    try {
      const agentRef = doc(db, COLLECTIONS.AI_AGENTS, agentId);
      const updates: any = {
        'state.status': status,
        'state.lastUpdated': serverTimestamp()
      };

      if (currentTask) {
        updates['state.currentTasks'] = [{
          id: doc(collection(db, 'temp')).id,
          description: currentTask,
          startedAt: new Date(),
          progress: 0
        }];
      }

      await setDoc(agentRef, updates, { merge: true });
    } catch (error) {
      console.error('Error updating AI agent status:', error);
      throw error;
    }
  }

  // ============= PRIVATE METHODS =============

  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flushActivityBuffer();
    }, 5000); // Flush every 5 seconds
  }

  private async flushActivityBuffer(): Promise<void> {
    if (this.activityBuffer.length === 0) return;

    const activities = [...this.activityBuffer];
    this.activityBuffer = [];

    try {
      // Batch write activities
      await runTransaction(db, async (transaction) => {
        activities.forEach(activity => {
          const docRef = doc(db, COLLECTIONS.ACTIVITY_LOGS, activity.id);
          transaction.set(docRef, activity);
        });
      });
    } catch (error) {
      console.error('Error flushing activity buffer:', error);
      // Re-add to buffer on failure
      this.activityBuffer.unshift(...activities);
    }
  }

  private async updateMetrics(activity: ActivityLog): Promise<void> {
    try {
      const metricsId = `metrics_${new Date().toISOString().slice(0, 13)}`; // Hourly metrics
      const metricsRef = doc(db, COLLECTIONS.SYSTEM_METRICS, metricsId);

      await runTransaction(db, async (transaction) => {
        const metricsDoc = await transaction.get(metricsRef);
        
        if (!metricsDoc.exists()) {
          // Create new metrics document
          const newMetrics: SystemMetrics = await this.createNewMetrics();
          transaction.set(metricsRef, newMetrics);
        } else {
          // Update existing metrics
          const updates: any = {
            'activities.total': increment(1),
            [`activities.byCategory.${activity.action.category}`]: increment(1),
            [`activities.byActor.${activity.actor.type.toLowerCase()}`]: increment(1),
            'timestamp': serverTimestamp()
          };

          if (activity.action.status === ActionStatus.COMPLETED) {
            updates['activities.byStatus.completed'] = increment(1);
          } else if (activity.action.status === ActionStatus.FAILED) {
            updates['activities.byStatus.failed'] = increment(1);
          }

          transaction.update(metricsRef, updates);
        }
      });
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  }

  private async createNewMetrics(): Promise<SystemMetrics> {
    const health = await this.getSystemHealth();
    
    return {
      timestamp: new Date(),
      activities: {
        total: 0,
        byCategory: {},
        byActor: {
          human: 0,
          ai: 0,
          system: 0
        },
        byStatus: {
          completed: 0,
          failed: 0,
          inProgress: 0
        }
      },
      performance: {
        averageResponseTime: 0,
        apiLatency: 0,
        databaseLatency: 0,
        errorRate: 0,
        successRate: 100
      },
      business: {
        activeUsers: 0,
        activeContractors: 0,
        openBookings: 0,
        completedBookingsToday: 0,
        revenue: {
          today: 0,
          week: 0,
          month: 0
        }
      },
      ai: {
        totalDecisions: 0,
        automationRate: 0,
        interventionsRequired: 0,
        tokensUsed: 0,
        estimatedCost: 0,
        activeAgents: []
      },
      health
    };
  }

  private generateActivitySummary(
    activities: ActivityLog[], 
    config: ReportConfig
  ): ActivitySummary {
    // This is a simplified version - implement full analysis logic
    const period = {
      start: config.timeRange.start || new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: config.timeRange.end || new Date()
    };

    return {
      period,
      overview: {
        totalActivities: activities.length,
        uniqueActors: new Set(activities.map(a => a.actor.id)).size,
        successRate: activities.filter(a => a.action.status === ActionStatus.COMPLETED).length / activities.length * 100,
        averageDuration: activities.reduce((sum, a) => sum + (a.action.duration || 0), 0) / activities.length
      },
      byActor: [],
      byAction: [],
      byResource: [],
      trends: {
        activityVolume: [],
        errorRate: [],
        aiVsHuman: []
      },
      anomalies: [],
      recommendations: []
    };
  }

  private async saveReport(config: ReportConfig, summary: ActivitySummary): Promise<void> {
    const reportDoc = {
      ...config,
      generatedAt: serverTimestamp(),
      summary
    };

    await setDoc(doc(db, COLLECTIONS.REPORTS, config.id), reportDoc);
  }

  private calculateAICost(model: string, promptTokens: number, completionTokens: number): number {
    // Pricing per 1K tokens (example rates)
    const pricing: { [key: string]: { prompt: number; completion: number } } = {
      'gpt-4': { prompt: 0.03, completion: 0.06 },
      'gpt-3.5-turbo': { prompt: 0.001, completion: 0.002 },
      'gemini-1.5-flash': { prompt: 0.00035, completion: 0.00105 },
      'gemini-1.5-pro': { prompt: 0.035, completion: 0.105 }
    };

    const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
    return (promptTokens / 1000 * modelPricing.prompt) + 
           (completionTokens / 1000 * modelPricing.completion);
  }

  // Cleanup
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.metricsListeners.forEach(unsubscribe => unsubscribe());
  }
}

// Export singleton instance
export const activityLogService = new ActivityLogService();