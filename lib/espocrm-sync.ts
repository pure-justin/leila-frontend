/**
 * EspoCRM Synchronization
 * Syncs data between Firebase/Firestore and EspoCRM
 */

import { getEspoCRMClient } from './espocrm-client';
import { Contractor, Customer, Booking } from './types/firestore-models';

export class EspoCRMSync {
  private client = getEspoCRMClient();

  /**
   * Sync customer to EspoCRM Contact
   */
  async syncCustomerToContact(customer: Customer) {
    try {
      // Map customer data to EspoCRM Contact format
      const contactData = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        emailAddress: customer.email,
        phoneNumber: customer.phone,
        description: `Customer ID: ${customer.id}`,
        assignedUserId: '1', // Default to admin
        // Custom fields can be added here
      };

      // Check if contact already exists by email
      const existingContacts = await this.client.getList('Contact', {
        where: {
          emailAddress: customer.email
        }
      });

      if (existingContacts.list && existingContacts.list.length > 0) {
        // Update existing contact
        return await this.client.update('Contact', existingContacts.list[0].id, contactData);
      } else {
        // Create new contact
        return await this.client.create('Contact', contactData);
      }
    } catch (error) {
      console.error('Error syncing customer to EspoCRM:', error);
      throw error;
    }
  }

  /**
   * Sync contractor to EspoCRM Account
   */
  async syncContractorToAccount(contractor: Contractor) {
    try {
      // Map contractor data to EspoCRM Account format
      const accountData = {
        name: contractor.businessInfo.companyName || `${contractor.firstName} ${contractor.lastName}`,
        emailAddress: contractor.email,
        phoneNumber: contractor.phone,
        type: 'Partner', // Using Partner type for contractors
        industry: 'Home Services',
        description: `Contractor ID: ${contractor.id}\nServices: ${contractor.services.categories.join(', ')}`,
        assignedUserId: '1', // Default to admin
        // Custom fields
        billingAddressStreet: contractor.preferences.location.savedAddresses[0]?.street || '',
        billingAddressCity: contractor.preferences.location.savedAddresses[0]?.city || '',
        billingAddressState: contractor.preferences.location.savedAddresses[0]?.state || '',
        billingAddressPostalCode: contractor.preferences.location.savedAddresses[0]?.zipCode || '',
      };

      // Check if account already exists by email
      const existingAccounts = await this.client.getList('Account', {
        where: {
          emailAddress: contractor.email
        }
      });

      if (existingAccounts.list && existingAccounts.list.length > 0) {
        // Update existing account
        return await this.client.update('Account', existingAccounts.list[0].id, accountData);
      } else {
        // Create new account
        return await this.client.create('Account', accountData);
      }
    } catch (error) {
      console.error('Error syncing contractor to EspoCRM:', error);
      throw error;
    }
  }

  /**
   * Sync booking to EspoCRM Opportunity
   */
  async syncBookingToOpportunity(booking: Booking, customerEmail: string, contractorEmail?: string) {
    try {
      // Get contact and account IDs
      const contacts = await this.client.getList('Contact', {
        where: { emailAddress: customerEmail }
      });
      
      const contactId = contacts.list?.[0]?.id;

      let accountId;
      if (contractorEmail) {
        const accounts = await this.client.getList('Account', {
          where: { emailAddress: contractorEmail }
        });
        accountId = accounts.list?.[0]?.id;
      }

      // Map booking data to EspoCRM Opportunity format
      const opportunityData = {
        name: `${booking.details.category} - ${booking.location.street}`,
        stage: this.mapBookingStatusToStage(booking.status),
        amount: booking.pricing.estimatedAmount,
        closeDate: booking.schedule.requestedDate,
        probability: this.getOpportunityProbability(booking.status),
        description: booking.details.description,
        contactId: contactId,
        accountId: accountId,
        assignedUserId: '1', // Default to admin
      };

      return await this.client.create('Opportunity', opportunityData);
    } catch (error) {
      console.error('Error syncing booking to EspoCRM:', error);
      throw error;
    }
  }

  /**
   * Map booking status to opportunity stage
   */
  private mapBookingStatusToStage(status: string): string {
    const statusMap: { [key: string]: string } = {
      'DRAFT': 'Prospecting',
      'PENDING': 'Qualification',
      'CONFIRMED': 'Proposal',
      'ASSIGNED': 'Negotiation',
      'IN_PROGRESS': 'Negotiation',
      'COMPLETED': 'Closed Won',
      'CANCELLED': 'Closed Lost',
      'DISPUTED': 'Negotiation'
    };
    return statusMap[status] || 'Prospecting';
  }

  /**
   * Get opportunity probability based on booking status
   */
  private getOpportunityProbability(status: string): number {
    const probabilityMap: { [key: string]: number } = {
      'DRAFT': 10,
      'PENDING': 25,
      'CONFIRMED': 50,
      'ASSIGNED': 75,
      'IN_PROGRESS': 90,
      'COMPLETED': 100,
      'CANCELLED': 0,
      'DISPUTED': 50
    };
    return probabilityMap[status] || 10;
  }

  /**
   * Sync all data (batch sync)
   */
  async syncAll() {
    // This would be implemented to sync all data from Firestore to EspoCRM
    // For now, this is a placeholder
    console.log('Batch sync not implemented yet');
  }
}

// Export singleton instance
export const espoCRMSync = new EspoCRMSync();