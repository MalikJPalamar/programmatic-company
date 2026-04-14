export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  locationId: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  tags: string[];
  source?: string;
  createdAt: string;
  locationId: string;
}

export interface Workflow {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'draft';
  triggersCount: number;
  locationId: string;
}

export interface Snapshot {
  id: string;
  name: string;
  type: string;
  createdAt: string;
}

export interface HealthScore {
  clientId: string;
  clientName: string;
  score: number;
  factors: {
    activeContacts: number;
    activeWorkflows: number;
    recentActivity: boolean;
    paymentStatus: 'current' | 'overdue' | 'none';
  };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface GHLConfig {
  apiKey: string;
  locationId?: string;
  baseUrl?: string;
}
