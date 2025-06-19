import axios from 'axios';

const CRM_API_URL = process.env.NEXT_PUBLIC_CRM_API_URL || 'http://localhost/espocrm/api/v1';

export interface Lead {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber?: string;
  description?: string;
}

export interface ServiceAppointment {
  name: string;
  dateStart: string;
  dateEnd: string;
  contactId?: string;
  leadId?: string;
  description: string;
  status: string;
}

export interface Task {
  name: string;
  status: string;
  priority: string;
  dateEnd: string;
  description: string;
  parentType?: string;
  parentId?: string;
}

class CRMApiClient {
  private auth: string;

  constructor() {
    if (typeof window === 'undefined') {
      // Server-side only
      const username = process.env.CRM_API_USERNAME || '';
      const password = process.env.CRM_API_PASSWORD || '';
      this.auth = Buffer.from(`${username}:${password}`).toString('base64');
    } else {
      this.auth = '';
    }
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${this.auth}`
    };
  }

  async createLead(lead: Lead) {
    const response = await axios.post(`${CRM_API_URL}/Lead`, lead, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async createMeeting(appointment: ServiceAppointment) {
    const response = await axios.post(`${CRM_API_URL}/Meeting`, appointment, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async createTask(task: Task) {
    const response = await axios.post(`${CRM_API_URL}/Task`, task, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async searchContacts(email: string) {
    const where = [
      {
        type: 'equals',
        attribute: 'emailAddress',
        value: email
      }
    ];
    
    const response = await axios.get(`${CRM_API_URL}/Contact`, {
      params: {
        where: JSON.stringify(where)
      },
      headers: this.getHeaders()
    });
    return response.data;
  }

  async convertLeadToContact(leadId: string) {
    const response = await axios.post(
      `${CRM_API_URL}/Lead/action/convert`,
      { id: leadId },
      { headers: this.getHeaders() }
    );
    return response.data;
  }
}

export const crmApi = new CRMApiClient();