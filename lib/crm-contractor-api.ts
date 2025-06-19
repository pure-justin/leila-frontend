import axios from 'axios';

const CRM_API_URL = process.env.NEXT_PUBLIC_CRM_API_URL || 'http://localhost/api/v1';

// Contractor entity interface
export interface Contractor {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  yearsInBusiness: number;
  licenseNumber?: string;
  insured: boolean;
  services: string[];
  serviceAreas: string[];
  hourlyRate: number;
  emergencyAvailable: boolean;
  status: 'pending' | 'active' | 'inactive';
  rating?: number;
  completedJobs?: number;
  availability: {
    [key: string]: {
      available: boolean;
      start: string;
      end: string;
    };
  };
  location?: {
    lat: number;
    lng: number;
  };
}

// Schedule interface
export interface ContractorSchedule {
  id?: string;
  contractorId: string;
  date: string;
  slots: {
    time: string;
    available: boolean;
    jobId?: string;
  }[];
}

// Job assignment interface
export interface JobAssignment {
  id?: string;
  jobId: string;
  contractorId: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  assignedAt: string;
  acceptedAt?: string;
  completedAt?: string;
  price: number;
  estimatedDuration: number;
  customerRating?: number;
  customerReview?: string;
}

class ContractorCRMAPI {
  private headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': process.env.NEXT_PUBLIC_CRM_API_KEY || ''
  };

  // Contractor Management
  async createContractor(contractor: Contractor): Promise<Contractor> {
    try {
      const response = await axios.post(
        `${CRM_API_URL}/Contractor`,
        contractor,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating contractor:', error);
      throw error;
    }
  }

  async getContractor(id: string): Promise<Contractor> {
    try {
      const response = await axios.get(
        `${CRM_API_URL}/Contractor/${id}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching contractor:', error);
      throw error;
    }
  }

  async updateContractor(id: string, updates: Partial<Contractor>): Promise<Contractor> {
    try {
      const response = await axios.put(
        `${CRM_API_URL}/Contractor/${id}`,
        updates,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating contractor:', error);
      throw error;
    }
  }

  async searchContractors(filters: {
    service?: string;
    area?: string;
    available?: boolean;
    minRating?: number;
  }): Promise<Contractor[]> {
    try {
      const params = new URLSearchParams();
      if (filters.service) params.append('service', filters.service);
      if (filters.area) params.append('area', filters.area);
      if (filters.available !== undefined) params.append('available', filters.available.toString());
      if (filters.minRating) params.append('minRating', filters.minRating.toString());

      const response = await axios.get(
        `${CRM_API_URL}/Contractor?${params.toString()}`,
        { headers: this.headers }
      );
      return response.data.list || [];
    } catch (error) {
      console.error('Error searching contractors:', error);
      throw error;
    }
  }

  // Schedule Management
  async getContractorSchedule(contractorId: string, date: string): Promise<ContractorSchedule> {
    try {
      const response = await axios.get(
        `${CRM_API_URL}/ContractorSchedule/${contractorId}/${date}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  }

  async updateContractorSchedule(schedule: ContractorSchedule): Promise<ContractorSchedule> {
    try {
      const response = await axios.put(
        `${CRM_API_URL}/ContractorSchedule/${schedule.contractorId}/${schedule.date}`,
        schedule,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  }

  async getAvailableSlots(contractorId: string, startDate: string, endDate: string): Promise<{
    date: string;
    slots: string[];
  }[]> {
    try {
      const response = await axios.get(
        `${CRM_API_URL}/ContractorSchedule/available-slots`,
        {
          headers: this.headers,
          params: { contractorId, startDate, endDate }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw error;
    }
  }

  // Job Assignment
  async assignJob(assignment: Omit<JobAssignment, 'id'>): Promise<JobAssignment> {
    try {
      const response = await axios.post(
        `${CRM_API_URL}/JobAssignment`,
        assignment,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error assigning job:', error);
      throw error;
    }
  }

  async updateJobAssignment(id: string, updates: Partial<JobAssignment>): Promise<JobAssignment> {
    try {
      const response = await axios.put(
        `${CRM_API_URL}/JobAssignment/${id}`,
        updates,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating job assignment:', error);
      throw error;
    }
  }

  async getContractorJobs(contractorId: string, status?: string): Promise<JobAssignment[]> {
    try {
      const params = status ? `?status=${status}` : '';
      const response = await axios.get(
        `${CRM_API_URL}/Contractor/${contractorId}/jobs${params}`,
        { headers: this.headers }
      );
      return response.data.list || [];
    } catch (error) {
      console.error('Error fetching contractor jobs:', error);
      throw error;
    }
  }

  // AI Integration Endpoints
  async getAIScheduleSuggestions(contractorId: string, weekStart: string): Promise<{
    suggestions: {
      date: string;
      recommendedSlots: string[];
      reasoning: string;
    }[];
  }> {
    try {
      const response = await axios.post(
        `${CRM_API_URL}/AI/schedule-suggestions`,
        { contractorId, weekStart },
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting AI schedule suggestions:', error);
      throw error;
    }
  }

  async optimizeContractorRoute(contractorId: string, date: string): Promise<{
    optimizedJobs: {
      jobId: string;
      order: number;
      estimatedArrival: string;
      travelTime: number;
    }[];
    totalDistance: number;
    estimatedCompletionTime: string;
  }> {
    try {
      const response = await axios.post(
        `${CRM_API_URL}/AI/optimize-route`,
        { contractorId, date },
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error optimizing route:', error);
      throw error;
    }
  }

  // Availability Management
  async updateAvailability(contractorId: string, availability: Contractor['availability']): Promise<void> {
    try {
      await axios.put(
        `${CRM_API_URL}/Contractor/${contractorId}/availability`,
        { availability },
        { headers: this.headers }
      );
    } catch (error) {
      console.error('Error updating availability:', error);
      throw error;
    }
  }

  async setEmergencyAvailability(contractorId: string, available: boolean): Promise<void> {
    try {
      await axios.put(
        `${CRM_API_URL}/Contractor/${contractorId}/emergency-availability`,
        { available },
        { headers: this.headers }
      );
    } catch (error) {
      console.error('Error updating emergency availability:', error);
      throw error;
    }
  }

  // Performance Metrics
  async getContractorMetrics(contractorId: string, period: 'week' | 'month' | 'year'): Promise<{
    earnings: number;
    completedJobs: number;
    averageRating: number;
    onTimeRate: number;
    customerSatisfaction: number;
    topServices: { service: string; count: number }[];
  }> {
    try {
      const response = await axios.get(
        `${CRM_API_URL}/Contractor/${contractorId}/metrics?period=${period}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching contractor metrics:', error);
      throw error;
    }
  }
}

export const contractorCrmApi = new ContractorCRMAPI();