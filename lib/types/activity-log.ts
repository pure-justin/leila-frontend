/**
 * Activity Logging System
 * 
 * Comprehensive tracking of all actions performed by humans and AI agents
 * Provides micro and macro views of system operations
 */

import { UserRole, ServiceCategory, BookingStatus } from './firestore-models';

// ============= ENUMS =============

export enum ActorType {
  HUMAN = 'HUMAN',
  AI_AGENT = 'AI_AGENT',
  SYSTEM = 'SYSTEM',
  WEBHOOK = 'WEBHOOK',
  SCHEDULED_TASK = 'SCHEDULED_TASK'
}

export enum ActionCategory {
  // User Management
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_STATUS_CHANGED = 'USER_STATUS_CHANGED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  
  // Booking Operations
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_UPDATED = 'BOOKING_UPDATED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_ASSIGNED = 'BOOKING_ASSIGNED',
  BOOKING_STARTED = 'BOOKING_STARTED',
  BOOKING_COMPLETED = 'BOOKING_COMPLETED',
  BOOKING_DISPUTED = 'BOOKING_DISPUTED',
  
  // Contractor Actions
  CONTRACTOR_WENT_ONLINE = 'CONTRACTOR_WENT_ONLINE',
  CONTRACTOR_WENT_OFFLINE = 'CONTRACTOR_WENT_OFFLINE',
  CONTRACTOR_ACCEPTED_JOB = 'CONTRACTOR_ACCEPTED_JOB',
  CONTRACTOR_DECLINED_JOB = 'CONTRACTOR_DECLINED_JOB',
  CONTRACTOR_UPDATED_AVAILABILITY = 'CONTRACTOR_UPDATED_AVAILABILITY',
  
  // Communication
  MESSAGE_SENT = 'MESSAGE_SENT',
  EMAIL_SENT = 'EMAIL_SENT',
  SMS_SENT = 'SMS_SENT',
  NOTIFICATION_SENT = 'NOTIFICATION_SENT',
  CALL_MADE = 'CALL_MADE',
  
  // Financial
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REFUND_ISSUED = 'REFUND_ISSUED',
  PAYOUT_SENT = 'PAYOUT_SENT',
  INVOICE_GENERATED = 'INVOICE_GENERATED',
  
  // AI Operations
  AI_DECISION_MADE = 'AI_DECISION_MADE',
  AI_RECOMMENDATION = 'AI_RECOMMENDATION',
  AI_AUTOMATION_TRIGGERED = 'AI_AUTOMATION_TRIGGERED',
  AI_CHAT_RESPONSE = 'AI_CHAT_RESPONSE',
  AI_IMAGE_ANALYSIS = 'AI_IMAGE_ANALYSIS',
  
  // System Operations
  DATA_IMPORTED = 'DATA_IMPORTED',
  DATA_EXPORTED = 'DATA_EXPORTED',
  BACKUP_CREATED = 'BACKUP_CREATED',
  SYSTEM_CONFIG_CHANGED = 'SYSTEM_CONFIG_CHANGED',
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  
  // Marketing
  PROMOTION_CREATED = 'PROMOTION_CREATED',
  PROMOTION_APPLIED = 'PROMOTION_APPLIED',
  CAMPAIGN_LAUNCHED = 'CAMPAIGN_LAUNCHED',
  SEGMENT_CREATED = 'SEGMENT_CREATED'
}

export enum ActionStatus {
  INITIATED = 'INITIATED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  PENDING_APPROVAL = 'PENDING_APPROVAL'
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

// ============= INTERFACES =============

// Main activity log entry
export interface ActivityLog {
  id: string;
  timestamp: Date;
  
  // Actor information
  actor: {
    type: ActorType;
    id: string; // User ID, AI Agent ID, or system identifier
    name: string;
    role?: UserRole;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  };
  
  // Action details
  action: {
    category: ActionCategory;
    status: ActionStatus;
    description: string;
    duration?: number; // milliseconds
    metadata?: { [key: string]: any };
  };
  
  // Affected resources
  resources: {
    primary: {
      type: string; // 'user', 'booking', 'contractor', etc.
      id: string;
      name?: string;
    };
    secondary?: Array<{
      type: string;
      id: string;
      name?: string;
    }>;
  };
  
  // Context
  context: {
    environment: 'production' | 'staging' | 'development';
    source: 'web' | 'mobile' | 'api' | 'admin' | 'crm';
    correlationId?: string; // Links related activities
    parentActivityId?: string; // For nested activities
  };
  
  // AI-specific fields
  ai?: {
    model?: string;
    confidence?: number;
    reasoning?: string;
    promptTokens?: number;
    completionTokens?: number;
    cost?: number;
  };
  
  // Error information
  error?: {
    code: string;
    message: string;
    stackTrace?: string;
    retryCount?: number;
  };
  
  // Audit trail
  audit: {
    level: LogLevel;
    tags: string[];
    isCompliant: boolean; // For regulatory compliance
    requiresReview: boolean;
    reviewedBy?: string;
    reviewedAt?: Date;
  };
}

// Real-time monitoring metrics
export interface SystemMetrics {
  timestamp: Date;
  
  // Activity counts
  activities: {
    total: number;
    byCategory: { [key in ActionCategory]?: number };
    byActor: {
      human: number;
      ai: number;
      system: number;
    };
    byStatus: {
      completed: number;
      failed: number;
      inProgress: number;
    };
  };
  
  // Performance metrics
  performance: {
    averageResponseTime: number;
    apiLatency: number;
    databaseLatency: number;
    errorRate: number;
    successRate: number;
  };
  
  // Business metrics
  business: {
    activeUsers: number;
    activeContractors: number;
    openBookings: number;
    completedBookingsToday: number;
    revenue: {
      today: number;
      week: number;
      month: number;
    };
  };
  
  // AI metrics
  ai: {
    totalDecisions: number;
    automationRate: number;
    interventionsRequired: number;
    tokensUsed: number;
    estimatedCost: number;
    activeAgents: Array<{
      id: string;
      name: string;
      type: string;
      status: 'idle' | 'working' | 'error';
      currentTask?: string;
    }>;
  };
  
  // System health
  health: {
    cpu: number;
    memory: number;
    storage: number;
    queueLength: number;
    activeConnections: number;
    alerts: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      timestamp: Date;
    }>;
  };
}

// Activity report configuration
export interface ReportConfig {
  id: string;
  name: string;
  description: string;
  
  // Time range
  timeRange: {
    type: 'fixed' | 'rolling';
    start?: Date;
    end?: Date;
    duration?: string; // e.g., '24h', '7d', '1m'
  };
  
  // Filters
  filters: {
    actors?: {
      types?: ActorType[];
      ids?: string[];
      roles?: UserRole[];
    };
    actions?: {
      categories?: ActionCategory[];
      statuses?: ActionStatus[];
    };
    resources?: {
      types?: string[];
      ids?: string[];
    };
    logLevels?: LogLevel[];
    tags?: string[];
  };
  
  // Grouping and aggregation
  groupBy?: Array<'actor' | 'action' | 'resource' | 'hour' | 'day' | 'week'>;
  
  // Metrics to include
  metrics: {
    counts: boolean;
    durations: boolean;
    successRates: boolean;
    errorAnalysis: boolean;
    aiPerformance: boolean;
    financials: boolean;
  };
  
  // Output configuration
  output: {
    format: 'dashboard' | 'pdf' | 'csv' | 'json';
    schedule?: {
      frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
      recipients: string[];
    };
  };
  
  // Access control
  visibility: 'private' | 'team' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard widget configuration
export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'timeline' | 'map' | 'alert';
  title: string;
  
  // Data source
  dataSource: {
    collection: 'activities' | 'metrics' | 'custom';
    query?: any; // Firestore query
    realtime: boolean;
    refreshInterval?: number; // seconds
  };
  
  // Visualization
  visualization: {
    chartType?: 'line' | 'bar' | 'pie' | 'donut' | 'heatmap';
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
  };
  
  // Position and size
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  // Interactions
  interactions: {
    clickable: boolean;
    drillDown?: string; // Widget ID to navigate to
    filters?: any;
  };
}

// AI Agent configuration
export interface AIAgent {
  id: string;
  name: string;
  type: 'scheduler' | 'dispatcher' | 'customer_service' | 'quality_control' | 'financial' | 'marketing';
  
  // Capabilities
  capabilities: {
    actions: ActionCategory[];
    resources: string[];
    maxConcurrentTasks: number;
    autoApprovalLimit?: number; // Dollar amount or other threshold
  };
  
  // Configuration
  config: {
    model: string;
    temperature: number;
    systemPrompt: string;
    examples?: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    tools?: Array<{
      name: string;
      description: string;
      parameters: any;
    }>;
  };
  
  // Operating parameters
  schedule: {
    active: boolean;
    workingHours?: {
      [key: string]: { start: string; end: string };
    };
    triggers?: Array<{
      type: 'event' | 'schedule' | 'condition';
      config: any;
    }>;
  };
  
  // Monitoring
  monitoring: {
    logAllActions: boolean;
    requireApprovalFor: ActionCategory[];
    alertThresholds: {
      errorRate?: number;
      responseTime?: number;
      cost?: number;
    };
    supervisorId?: string; // Another agent or human
  };
  
  // State
  state: {
    status: 'active' | 'paused' | 'error' | 'offline';
    currentTasks: Array<{
      id: string;
      description: string;
      startedAt: Date;
      progress: number;
    }>;
    stats: {
      totalActions: number;
      successRate: number;
      averageResponseTime: number;
      totalCost: number;
    };
  };
}

// Activity summary for reports
export interface ActivitySummary {
  period: {
    start: Date;
    end: Date;
  };
  
  // High-level metrics
  overview: {
    totalActivities: number;
    uniqueActors: number;
    successRate: number;
    averageDuration: number;
  };
  
  // Breakdowns
  byActor: Array<{
    actor: string;
    type: ActorType;
    count: number;
    successRate: number;
    mostCommonAction: ActionCategory;
  }>;
  
  byAction: Array<{
    category: ActionCategory;
    count: number;
    successRate: number;
    averageDuration: number;
    errors: number;
  }>;
  
  byResource: Array<{
    type: string;
    count: number;
    mostAffected: Array<{ id: string; name: string; count: number }>;
  }>;
  
  // Trends
  trends: {
    activityVolume: Array<{ timestamp: Date; count: number }>;
    errorRate: Array<{ timestamp: Date; rate: number }>;
    aiVsHuman: Array<{ timestamp: Date; ai: number; human: number }>;
  };
  
  // Anomalies
  anomalies: Array<{
    type: 'spike' | 'drop' | 'pattern_change' | 'new_error';
    description: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: Date;
    affected: string[];
  }>;
  
  // Recommendations
  recommendations: Array<{
    type: 'optimization' | 'security' | 'efficiency' | 'cost';
    description: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    estimatedSavings?: number;
  }>;
}