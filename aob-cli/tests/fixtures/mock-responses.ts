export const mockOntraportContacts = {
  data: [
    { id: '1001', firstname: 'Sarah', lastname: 'Chen', email: 'sarah@example.com', sms_number: '+1111111111', tag_list: 'program:TT2,student,vip', source: 'website', date: '1700000000', f1234: 'cus_stripe001' },
    { id: '1002', firstname: 'Marcus', lastname: 'Reed', email: 'marcus@example.com', tag_list: 'program:breathwork,student', source: 'referral', date: '1710000000' },
  ],
  count: 2,
};

export const mockOntraportContact = {
  data: { id: '1001', firstname: 'Sarah', lastname: 'Chen', email: 'sarah@example.com', sms_number: '+1111111111', tag_list: 'program:TT2,student,vip', source: 'website', date: '1700000000', f1234: 'cus_stripe001' },
};

export const mockOntraportSearch = {
  data: [
    { id: '1001', firstname: 'Sarah', lastname: 'Chen', email: 'sarah@example.com', tag_list: 'student', source: 'website', date: '1700000000' },
  ],
};

export const mockOntraportCreated = {
  data: { id: '1003', firstname: 'Alex', lastname: 'Kim', email: 'alex@example.com', tag_list: 'new', source: 'api', date: '1720000000' },
};

export const mockStripeCustomer = { id: 'cus_stripe001', email: 'sarah@example.com', name: 'Sarah Chen' };

export const mockStripeCharges = {
  data: [
    { id: 'ch_001', customer: 'cus_stripe001', amount: 29700, currency: 'usd', status: 'succeeded', description: 'TT2 Enrollment', created: 1700000000 },
    { id: 'ch_002', customer: 'cus_stripe001', amount: 15000, currency: 'usd', status: 'succeeded', description: 'Breathwork Module', created: 1710000000 },
  ],
};

export const mockStripeSubs = {
  data: [{ id: 'sub_001', customer: 'cus_stripe001', status: 'active' }],
};

export const mockStripeNoSubs = { data: [] };

export const mockMightyMembers = {
  members: [
    { id: 'm001', name: 'Sarah Chen', email: 'sarah@example.com', joinedAt: '2024-01-15', lastActiveAt: '2026-04-14', groups: ['TT2', 'Breathwork'], active: true },
    { id: 'm002', name: 'Marcus Reed', email: 'marcus@example.com', joinedAt: '2024-06-01', groups: ['Breathwork'], active: false },
  ],
  total: 2,
};

export const mockMightyMember = {
  members: [
    { id: 'm001', name: 'Sarah Chen', email: 'sarah@example.com', joinedAt: '2024-01-15', lastActiveAt: '2026-04-14', groups: ['TT2'], active: true },
  ],
};
