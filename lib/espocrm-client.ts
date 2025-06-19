/**
 * EspoCRM API Client
 * Connects the Next.js frontend to the EspoCRM backend
 */

interface EspoCRMConfig {
  baseUrl: string;
  apiKey?: string;
  username?: string;
  password?: string;
}

export class EspoCRMClient {
  private config: EspoCRMConfig;
  private authToken?: string;

  constructor(config: EspoCRMConfig) {
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_ESPOCRM_URL || 'http://localhost:8081',
      ...config
    };
  }

  /**
   * Authenticate with EspoCRM
   */
  async authenticate(username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/App/user`, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa(`${username}:${password}`),
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.authToken = btoa(`${username}:${password}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  /**
   * Make authenticated API request
   */
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.authToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.config.baseUrl}/api/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Basic ${this.authToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Entity CRUD operations
   */
  
  // Get list of entities
  async getList(entityType: string, params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/${entityType}${queryString}`);
  }

  // Get single entity
  async get(entityType: string, id: string) {
    return this.request(`/${entityType}/${id}`);
  }

  // Create entity
  async create(entityType: string, data: any) {
    return this.request(`/${entityType}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Update entity
  async update(entityType: string, id: string, data: any) {
    return this.request(`/${entityType}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Delete entity
  async delete(entityType: string, id: string) {
    return this.request(`/${entityType}/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Specific entity methods
   */
  
  // Users
  async getUsers() {
    return this.getList('User');
  }

  async getUser(id: string) {
    return this.get('User', id);
  }

  // Contacts (Customers)
  async getContacts() {
    return this.getList('Contact');
  }

  async createContact(data: any) {
    return this.create('Contact', data);
  }

  // Accounts (Contractors)
  async getAccounts() {
    return this.getList('Account');
  }

  async createAccount(data: any) {
    return this.create('Account', data);
  }

  // Opportunities (Bookings)
  async getOpportunities() {
    return this.getList('Opportunity');
  }

  async createOpportunity(data: any) {
    return this.create('Opportunity', data);
  }

  // Tasks (Service Jobs)
  async getTasks() {
    return this.getList('Task');
  }

  async createTask(data: any) {
    return this.create('Task', data);
  }

  // Activities
  async getActivities() {
    return this.getList('Activity');
  }

  // Dashboard data
  async getDashboardData() {
    const [contacts, accounts, opportunities, tasks] = await Promise.all([
      this.getList('Contact', { maxSize: 5 }),
      this.getList('Account', { maxSize: 5 }),
      this.getList('Opportunity', { maxSize: 5 }),
      this.getList('Task', { maxSize: 5 })
    ]);

    return {
      totalCustomers: contacts.total || 0,
      totalContractors: accounts.total || 0,
      totalBookings: opportunities.total || 0,
      activeTasks: tasks.total || 0,
      recentContacts: contacts.list || [],
      recentOpportunities: opportunities.list || []
    };
  }
}

// Singleton instance
let client: EspoCRMClient | null = null;

export function getEspoCRMClient(): EspoCRMClient {
  if (!client) {
    client = new EspoCRMClient({
      baseUrl: process.env.NEXT_PUBLIC_ESPOCRM_URL || 'http://localhost:8081'
    });
  }
  return client;
}