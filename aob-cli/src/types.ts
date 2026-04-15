// --- Unified Domain Models ---

export interface UnifiedContact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  tags: string[];
  source: string;
  createdAt: string;
  customFields: Record<string, unknown>;
}

export interface UnifiedStudent extends UnifiedContact {
  programs: string[];
  certifications: Certification[];
  paymentStatus: 'current' | 'overdue' | 'none' | 'lifetime';
  communityActive: boolean;
  lastActivityAt?: string;
  stripeCustomerId?: string;
  mightyMemberId?: string;
}

export interface Program {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'archived';
  cohorts: Cohort[];
}

export interface Cohort {
  id: string;
  programId: string;
  name: string;
  status: 'active' | 'upcoming' | 'completed';
  startDate: string;
  endDate?: string;
  enrolledCount: number;
}

export interface Certification {
  id: string;
  programId: string;
  programName: string;
  studentId: string;
  issuedAt: string;
  status: 'active' | 'expired' | 'revoked';
}

export interface PaymentRecord {
  id: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  description?: string;
  createdAt: string;
}

export interface CommunityMember {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  lastActiveAt?: string;
  groups: string[];
  active: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// --- Adapter Interfaces (swap without consumer changes) ---

export interface CRMAdapter {
  listContacts(options?: { limit?: number; offset?: number; tag?: string }): Promise<PaginatedResult<UnifiedContact>>;
  getContact(id: string): Promise<UnifiedContact>;
  searchContacts(query: string): Promise<UnifiedContact[]>;
  createContact(data: NewContact): Promise<UnifiedContact>;
  updateContact(id: string, data: Partial<NewContact>): Promise<UnifiedContact>;
}

export interface PaymentAdapter {
  getCustomer(id: string): Promise<{ id: string; email: string; name: string }>;
  listPayments(customerId: string, options?: { limit?: number }): Promise<PaymentRecord[]>;
  getPaymentStatus(customerId: string): Promise<'current' | 'overdue' | 'none' | 'lifetime'>;
}

export interface CommunityAdapter {
  getMember(email: string): Promise<CommunityMember | null>;
  listMembers(options?: { limit?: number; offset?: number; group?: string }): Promise<PaginatedResult<CommunityMember>>;
  isActive(email: string): Promise<boolean>;
}

export interface ProgramAdapter {
  listPrograms(options?: { status?: string }): Promise<Program[]>;
  getProgram(id: string): Promise<Program>;
  listCohorts(programId: string, options?: { status?: string }): Promise<Cohort[]>;
  getCohort(programId: string, cohortId: string): Promise<Cohort>;
  checkCertification(studentId: string, programId: string): Promise<Certification | null>;
  issueCertification(studentId: string, programId: string): Promise<Certification>;
  listCertifications(studentId: string): Promise<Certification[]>;
}

// --- Input Types ---

export interface NewContact {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  tags?: string[];
  source?: string;
  customFields?: Record<string, unknown>;
}

// --- Config ---

export interface AOBConfig {
  ontraport?: { apiKey: string; appId: string };
  stripe?: { secretKey: string };
  mighty?: { apiKey: string; communityId: string };
}
