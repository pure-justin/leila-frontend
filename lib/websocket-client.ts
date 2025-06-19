import { EventEmitter } from 'events';

export interface JobNotification {
  id: string;
  type: 'new_job' | 'job_cancelled' | 'job_updated' | 'customer_message';
  job: {
    id: string;
    service: string;
    customerName: string;
    address: string;
    date: string;
    time: string;
    price: number;
    urgent: boolean;
    distance: string;
    category?: string;
    description?: string;
  };
  message?: string;
  timestamp: Date;
}

export interface ContractorStatus {
  contractorId: string;
  online: boolean;
  location?: {
    lat: number;
    lng: number;
  };
  currentJob?: string;
}

export class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  public contractorId: string;
  private token: string;

  constructor(contractorId: string, token: string) {
    super();
    this.contractorId = contractorId;
    this.token = token;
  }

  connect() {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.heyleila.com/ws';
    
    try {
      this.ws = new WebSocket(`${wsUrl}?token=${this.token}&contractorId=${this.contractorId}`);
      
      this.ws.onopen = this.onOpen.bind(this);
      this.ws.onmessage = this.onMessage.bind(this);
      this.ws.onerror = this.onError.bind(this);
      this.ws.onclose = this.onClose.bind(this);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  private onOpen() {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
    this.emit('connected');
    
    // Send initial status
    this.updateStatus({
      contractorId: this.contractorId,
      online: true
    });
    
    // Start heartbeat
    this.startHeartbeat();
  }

  private onMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'new_job':
          this.emit('job:new', data as JobNotification);
          this.showNotification(data);
          break;
          
        case 'job_cancelled':
          this.emit('job:cancelled', data);
          break;
          
        case 'job_updated':
          this.emit('job:updated', data);
          break;
          
        case 'customer_message':
          this.emit('message:new', data);
          this.showNotification(data);
          break;
          
        case 'pong':
          // Heartbeat response
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private onError(error: Event) {
    console.error('WebSocket error:', error);
    this.emit('error', error);
  }

  private onClose() {
    console.log('WebSocket disconnected');
    this.emit('disconnected');
    this.stopHeartbeat();
    this.scheduleReconnect();
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect:failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private showNotification(data: JobNotification) {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      const title = data.type === 'new_job' 
        ? `New ${data.job.service} Job Available!`
        : 'New Message';
        
      const body = data.type === 'new_job'
        ? `${data.job.customerName} • $${data.job.price} • ${data.job.distance}`
        : data.message || 'You have a new message';
        
      const notification = new Notification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        requireInteraction: data.job.urgent,
        data: { jobId: data.job.id }
      } as NotificationOptions);
      
      notification.onclick = () => {
        window.focus();
        this.emit('notification:clicked', data.job.id);
        notification.close();
      };
    }
  }

  // Public methods
  
  updateStatus(status: ContractorStatus) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'status_update',
        ...status
      }));
    }
  }

  updateLocation(lat: number, lng: number) {
    this.updateStatus({
      contractorId: this.contractorId,
      online: true,
      location: { lat, lng }
    });
  }

  acceptJob(jobId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'accept_job',
        jobId
      }));
    }
  }

  declineJob(jobId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'decline_job',
        jobId
      }));
    }
  }

  sendMessage(jobId: string, message: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'send_message',
        jobId,
        message
      }));
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}

// Singleton instance manager
let wsClient: WebSocketClient | null = null;

export function getWebSocketClient(contractorId?: string, token?: string): WebSocketClient | null {
  if (!contractorId || !token) return wsClient;
  
  if (!wsClient || wsClient.contractorId !== contractorId) {
    if (wsClient) {
      wsClient.disconnect();
    }
    wsClient = new WebSocketClient(contractorId, token);
  }
  
  return wsClient;
}