
export interface Client {
  id: string;
  companyName: string;
  website: string;
  logo: string; // Initials
  status: 'active' | 'inactive' | 'pending';
  industry: string;
  since: string;
  notes?: string;
  
  primaryContact: {
    name: string;
    email: string;
    phone: string;
    role: string;
    avatar?: string;
  };

  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };

  services: {
    domains: number;
    hosting: number;
    maintenance: boolean;
  };

  billing: {
    totalSpent: number;
    nextInvoiceDate: string;
    paymentMethod: string;
    status: 'good' | 'overdue' | 'pending';
  };

  recentActivity: {
    id: string;
    action: string;
    date: string;
    user: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }[];

  activeServicesList: {
    id: string;
    name: string;
    type: 'Domain' | 'Hosting' | 'Maintenance';
    status: 'active' | 'expiring' | 'expired';
    expiryDate?: string;
  }[];
}

export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    companyName: 'TechCorp Solutions',
    website: 'techcorp.com',
    logo: 'TC',
    status: 'active',
    industry: 'Technology',
    since: '2023-01-15',
    primaryContact: {
      name: 'Sarah Johnson',
      email: 'sarah.j@techcorp.com',
      phone: '+1 (555) 123-4567',
      role: 'CTO',
    },
    address: {
      street: '123 Innovation Dr',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'USA',
    },
    services: {
      domains: 3,
      hosting: 2,
      maintenance: true,
    },
    billing: {
      totalSpent: 12500.00,
      nextInvoiceDate: '2026-03-01',
      paymentMethod: 'Visa ending in 4242',
      status: 'good',
    },
    recentActivity: [
      {
        id: 'a1',
        action: 'Renewed domain techcorp.com',
        date: '2025-12-20',
        user: 'System',
        type: 'success',
      },
      {
        id: 'a2',
        action: 'Ticket #4928 resolved',
        date: '2025-12-15',
        user: 'Support Team',
        type: 'info',
      },
    ],
    activeServicesList: [
      { id: 'd1', name: 'techcorp.com', type: 'Domain', status: 'active', expiryDate: '2026-12-20' },
      { id: 'h1', name: 'Production Server', type: 'Hosting', status: 'active' },
      { id: 'm1', name: 'Monthly Maintenance', type: 'Maintenance', status: 'active' },
    ]
  },
  {
    id: '2',
    companyName: 'Digital Innovations Inc',
    website: 'digitalinnovations.io',
    logo: 'DI',
    status: 'active',
    industry: 'Digital Marketing',
    since: '2023-05-10',
    primaryContact: {
      name: 'Michael Chen',
      email: 'm.chen@digitalinnovations.io',
      phone: '+1 (555) 987-6543',
      role: 'Marketing Director',
    },
    address: {
      street: '456 Creative Way',
      city: 'New York',
      state: 'NY',
      zip: '10013',
      country: 'USA',
    },
    services: {
      domains: 5,
      hosting: 0,
      maintenance: true,
    },
    billing: {
      totalSpent: 8200.50,
      nextInvoiceDate: '2026-02-15',
      paymentMethod: 'Mastercard ending in 8899',
      status: 'good',
    },
    recentActivity: [
      {
        id: 'a1',
        action: 'Updated maintenance plan',
        date: '2025-12-18',
        user: 'Michael Chen',
        type: 'info',
      },
    ],
    activeServicesList: [
      { id: 'd2', name: 'digitalinnovations.io', type: 'Domain', status: 'active', expiryDate: '2026-05-10' },
      { id: 'm2', name: 'Basic Maintenance', type: 'Maintenance', status: 'active' },
    ]
  },
  {
    id: '3',
    companyName: 'GreenStart Ventures',
    website: 'greenstart.co',
    logo: 'GS',
    status: 'active',
    industry: 'Venture Capital',
    since: '2024-02-20',
    primaryContact: {
      name: 'Emily Rodriguez',
      email: 'emily@greenstart.co',
      phone: '+1 (555) 456-7890',
      role: 'Operations Manager',
    },
    address: {
      street: '789 Eco Blvd',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      country: 'USA',
    },
    services: {
      domains: 2,
      hosting: 1,
      maintenance: false,
    },
    billing: {
      totalSpent: 3500.00,
      nextInvoiceDate: '2026-02-28',
      paymentMethod: 'Amex ending in 1005',
      status: 'pending',
    },
    recentActivity: [
      {
        id: 'a1',
        action: 'Added new hosting plan',
        date: '2025-12-22',
        user: 'System',
        type: 'success',
      },
    ],
    activeServicesList: [
      { id: 'd3', name: 'greenstart.co', type: 'Domain', status: 'active', expiryDate: '2026-02-20' },
      { id: 'h2', name: 'Staging Server', type: 'Hosting', status: 'active' },
    ]
  }
];
