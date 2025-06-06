import { PrismaClient, Contact } from '@prisma/client';
import { ContactResponse } from '../types';
import { AppError } from '../utils/errorHandler';

export class IdentityService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Identifies and reconciles contact information
   * @param email - Contact email
   * @param phoneNumber - Contact phone number
   * @returns Formatted contact response with primary and secondary contacts
   */
  async identifyContact(
    email: string | undefined, 
    phoneNumber: string | undefined
  ): Promise<ContactResponse> {
    try {
      // Find all contacts matching either email or phone
      const existingContacts = await this.findExistingContacts(email, phoneNumber);
      
      // If no contacts found, create a new primary contact
      if (existingContacts.length === 0) {
        const newContact = await this.createPrimaryContact(email, phoneNumber);
        return this.formatContactResponse([newContact]);
      }
      
      // Get all related contacts (primaries and secondaries)
      const allRelatedContacts = await this.getAllRelatedContacts(existingContacts);
      
      // Find the primary contact (or the oldest contact that should be primary)
      const primaryContact = this.findPrimaryContact(allRelatedContacts);
      
      // Check if we need to create a new secondary contact
      const newSecondaryNeeded = this.isNewSecondaryContactNeeded(
        primaryContact, 
        allRelatedContacts, 
        email, 
        phoneNumber
      );
      
      // If needed, create a new secondary contact
      if (newSecondaryNeeded) {
        await this.createSecondaryContact(primaryContact.id, email, phoneNumber);
        
        // Refresh the contact list after creating a new secondary
        const updatedContacts = await this.getAllRelatedContacts([primaryContact]);
        return this.formatContactResponse(updatedContacts);
      }
      
      // Return the formatted response with all related contacts
      return this.formatContactResponse(allRelatedContacts);
    } catch (error) {
      console.error('Error in identifyContact:', error);
      throw new AppError('Failed to identify contact', 500);
    }
  }

  /**
   * Find existing contacts by email or phone number
   */
  private async findExistingContacts(
    email: string | undefined, 
    phoneNumber: string | undefined
  ): Promise<Contact[]> {
    const contacts = await this.prisma.contact.findMany({
      where: {
        OR: [
          { email: email || null },
          { phoneNumber: phoneNumber || null }
        ],
        deletedAt: null
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    return contacts;
  }

  /**
   * Get all related contacts including primaries and secondaries
   */
  private async getAllRelatedContacts(contacts: Contact[]): Promise<Contact[]> {
    if (contacts.length === 0) {
      return [];
    }
    
    // Collect all primary contact IDs
    const primaryIds = new Set<number>();
    
    // For each contact, if it's secondary, add its linkedId to primaryIds
    // If it's primary, add its own id to primaryIds
    contacts.forEach(contact => {
      if (contact.linkPrecedence === 'secondary' && contact.linkedId) {
        primaryIds.add(contact.linkedId);
      } else if (contact.linkPrecedence === 'primary') {
        primaryIds.add(contact.id);
      }
    });
    
    // Find all contacts related to these primary IDs
    const allRelatedContacts = await this.prisma.contact.findMany({
      where: {
        OR: [
          { id: { in: Array.from(primaryIds) } },
          { linkedId: { in: Array.from(primaryIds) } }
        ],
        deletedAt: null
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    return allRelatedContacts;
  }

  /**
   * Find the primary contact from a list of contacts
   */
  private findPrimaryContact(contacts: Contact[]): Contact {
    // Sort contacts by creation date (oldest first)
    const sortedContacts = [...contacts].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    
    // Find the primary contact
    const primaryContact = sortedContacts.find(
      contact => contact.linkPrecedence === 'primary'
    );
    
    // If no primary found (shouldn't happen but just in case)
    if (!primaryContact) {
      throw new AppError('No primary contact found', 500);
    }
    
    return primaryContact;
  }

  /**
   * Check if we need to create a new secondary contact
   */
  private isNewSecondaryContactNeeded(
    primaryContact: Contact,
    allContacts: Contact[],
    email: string | undefined,
    phoneNumber: string | undefined
  ): boolean {
    // If no email or phone is provided, no need for a new contact
    if (!email && !phoneNumber) {
      return false;
    }
    
    // Check if this exact combination of email and phone already exists
    const exactMatchExists = allContacts.some(contact => 
      contact.email === email && contact.phoneNumber === phoneNumber
    );
    
    if (exactMatchExists) {
      return false;
    }
    
    // Check if the primary already has this email and phone
    const primaryHasEmail = primaryContact.email === email;
    const primaryHasPhone = primaryContact.phoneNumber === phoneNumber;
    
    // If primary already has both attributes, no need for a new secondary
    if (primaryHasEmail && primaryHasPhone) {
      return false;
    }
    
    // Check if all attributes are already covered by existing secondaries
    const secondaries = allContacts.filter(
      contact => contact.linkPrecedence === 'secondary'
    );
    
    const emailExists = email ? 
      [primaryContact, ...secondaries].some(c => c.email === email) : 
      true;
      
    const phoneExists = phoneNumber ? 
      [primaryContact, ...secondaries].some(c => c.phoneNumber === phoneNumber) : 
      true;
    
    // If both email and phone are already covered, no need for a new secondary
    return !(emailExists && phoneExists);
  }

  /**
   * Create a new primary contact
   */
  private async createPrimaryContact(
    email: string | undefined, 
    phoneNumber: string | undefined
  ): Promise<Contact> {
    return this.prisma.contact.create({
      data: {
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkPrecedence: 'primary'
      }
    });
  }

  /**
   * Create a new secondary contact linked to a primary
   */
  private async createSecondaryContact(
    primaryId: number,
    email: string | undefined,
    phoneNumber: string | undefined
  ): Promise<Contact> {
    return this.prisma.contact.create({
      data: {
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkedId: primaryId,
        linkPrecedence: 'secondary'
      }
    });
  }

  /**
   * Format the contact response according to the API requirements
   */
  private formatContactResponse(contacts: Contact[]): ContactResponse {
    if (contacts.length === 0) {
      throw new AppError('No contacts found', 404);
    }
    
    // Find the primary contact
    const primaryContact = this.findPrimaryContact(contacts);
    
    // Get secondary contacts
    const secondaryContacts = contacts.filter(
      contact => contact.linkPrecedence === 'secondary'
    );
    
    // Collect all unique emails & phone numbers
    const emails = new Set<string>();
    const phoneNumbers = new Set<string>();
    const secondaryContactIds: number[] = [];
    
    // Add primary contact data
    if (primaryContact.email) emails.add(primaryContact.email);
    if (primaryContact.phoneNumber) phoneNumbers.add(primaryContact.phoneNumber);
    
    // Add secondary contacts data
    secondaryContacts.forEach(contact => {
      if (contact.email) emails.add(contact.email);
      if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
      secondaryContactIds.push(contact.id);
    });
    
    return {
      primaryContactId: primaryContact.id,
      emails: Array.from(emails),
      phoneNumbers: Array.from(phoneNumbers),
      secondaryContactIds
    };
  }
}