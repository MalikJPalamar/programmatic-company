export const mockClients = {
  locations: [
    {
      id: 'loc_001',
      name: 'Acme Corp',
      email: 'admin@acme.com',
      phone: '+1234567890',
      status: 'active',
      dateAdded: '2025-01-15T10:00:00Z',
    },
    {
      id: 'loc_002',
      name: 'Beta Inc',
      email: 'admin@beta.com',
      status: 'active',
      dateAdded: '2025-02-20T12:00:00Z',
    },
    {
      id: 'loc_003',
      name: 'Gamma LLC',
      email: 'admin@gamma.com',
      status: 'inactive',
      dateAdded: '2025-03-01T08:00:00Z',
    },
  ],
  total: 3,
};

export const mockClient = {
  location: {
    id: 'loc_001',
    name: 'Acme Corp',
    email: 'admin@acme.com',
    phone: '+1234567890',
    status: 'active',
    dateAdded: '2025-01-15T10:00:00Z',
  },
};

export const mockContacts = {
  contacts: [
    {
      id: 'con_001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1111111111',
      tags: ['lead', 'hot'],
      source: 'website',
      dateAdded: '2025-04-01T09:00:00Z',
      locationId: 'loc_001',
    },
    {
      id: 'con_002',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      tags: ['customer'],
      source: 'referral',
      dateAdded: '2025-04-05T14:30:00Z',
      locationId: 'loc_001',
    },
  ],
  total: 2,
};

export const mockSearchResults = {
  contacts: [
    {
      id: 'con_001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      tags: ['lead'],
      locationId: 'loc_001',
    },
  ],
};

export const mockWorkflows = {
  workflows: [
    {
      id: 'wf_001',
      name: 'New Lead Nurture',
      status: 'active',
      triggersCount: 3,
      locationId: 'loc_001',
    },
    {
      id: 'wf_002',
      name: 'Onboarding Sequence',
      status: 'active',
      triggersCount: 5,
      locationId: 'loc_001',
    },
    {
      id: 'wf_003',
      name: 'Re-engagement',
      status: 'inactive',
      triggersCount: 1,
      locationId: 'loc_001',
    },
  ],
};

export const mockSnapshots = {
  snapshots: [
    {
      id: 'snap_001',
      name: 'Agency Starter Pack',
      type: 'full',
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'snap_002',
      name: 'Lead Gen Template',
      type: 'partial',
      createdAt: '2025-02-15T00:00:00Z',
    },
  ],
};
