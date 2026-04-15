import type { CRMAdapter, PaymentAdapter, CommunityAdapter, UnifiedStudent, PaginatedResult } from '../types.js';

export class StudentFusionService {
  constructor(
    private crm: CRMAdapter,
    private payment: PaymentAdapter,
    private community: CommunityAdapter,
  ) {}

  async getStudent(id: string): Promise<UnifiedStudent> {
    const contact = await this.crm.getContact(id);

    const [paymentStatus, communityMember] = await Promise.allSettled([
      contact.customFields.stripeCustomerId
        ? this.payment.getPaymentStatus(String(contact.customFields.stripeCustomerId))
        : Promise.resolve('none' as const),
      contact.email
        ? this.community.getMember(contact.email)
        : Promise.resolve(null),
    ]);

    const pStatus = paymentStatus.status === 'fulfilled' ? paymentStatus.value : 'none' as const;
    const member = communityMember.status === 'fulfilled' ? communityMember.value : null;

    return {
      ...contact,
      programs: contact.tags.filter((t) => t.startsWith('program:')).map((t) => t.replace('program:', '')),
      certifications: [],
      paymentStatus: pStatus,
      communityActive: member?.active ?? false,
      lastActivityAt: member?.lastActiveAt,
      stripeCustomerId: contact.customFields.stripeCustomerId as string | undefined,
      mightyMemberId: member?.id,
    };
  }

  async listStudents(options?: { limit?: number; offset?: number; program?: string }): Promise<PaginatedResult<UnifiedStudent>> {
    const tag = options?.program ? `program:${options.program}` : undefined;
    const contacts = await this.crm.listContacts({ limit: options?.limit, offset: options?.offset, tag });

    const students = await Promise.all(
      contacts.items.map(async (contact) => {
        try {
          return await this.getStudent(contact.id);
        } catch {
          // If fusion fails for one student, return base data
          return {
            ...contact,
            programs: [],
            certifications: [],
            paymentStatus: 'none' as const,
            communityActive: false,
          };
        }
      })
    );

    return { ...contacts, items: students };
  }

  async searchStudents(query: string): Promise<UnifiedStudent[]> {
    const contacts = await this.crm.searchContacts(query);

    return Promise.all(
      contacts.map(async (contact) => {
        try {
          return await this.getStudent(contact.id);
        } catch {
          return {
            ...contact,
            programs: [],
            certifications: [],
            paymentStatus: 'none' as const,
            communityActive: false,
          };
        }
      })
    );
  }
}
