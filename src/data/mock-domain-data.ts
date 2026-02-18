
export interface DomainActivity {
  id: string;
  action: string;
  date: string;
  user: string;
  status: 'success' | 'warning' | 'error';
}

export interface DNSRecord {
  id: string;
  type: 'A' | 'CNAME' | 'MX' | 'TXT' | 'NS';
  name: string;
  value: string;
  ttl: number;
}

export interface Domain {
  id: string;
  name: string;
  client: string;
  clientId: string; // Linking to project/client
  contact: string;
  expiryDate: string;
  expiryStatus: string;
  daysRemaining: number;
  vendor: string; // Registrar
  vendorId?: string;
  vendorLogo?: string;
  cost: number;
  status: 'expired' | 'expiring' | 'active' | 'renewed';
  autoRenew: boolean;
  purchasedBy?: string;
  
  // Extended Details
  registrarInfo: {
    name: string;
    url: string;
    supportEmail: string;
    accountUser: string;
  };
  nameservers: string[];
  dnsRecords: DNSRecord[];
  authCode: string; // Usually masked in UI
  sslStatus: {
    active: boolean;
    provider: string;
    expiryDate: string;
    autoRenew: boolean;
  };
  activityLog: DomainActivity[];
}

export const MOCK_DOMAINS: Domain[] = [
  {
    id: '1',
    name: 'oldwebsite.com',
    client: 'BlueSky Consulting',
    clientId: 'bluesky',
    contact: 'David Park',
    expiryDate: '2024-12-10',
    expiryStatus: '14 days overdue',
    daysRemaining: -14,
    vendor: 'GoDaddy',
    cost: 14.99,
    status: 'expired',
    autoRenew: false,
    registrarInfo: {
      name: 'GoDaddy',
      url: 'https://godaddy.com',
      supportEmail: 'support@godaddy.com',
      accountUser: 'bluesky_admin'
    },
    nameservers: ['ns1.godaddy.com', 'ns2.godaddy.com'],
    dnsRecords: [
      { id: '1', type: 'A', name: '@', value: '192.168.1.1', ttl: 3600 },
      { id: '2', type: 'CNAME', name: 'www', value: 'oldwebsite.com', ttl: 3600 },
      { id: '3', type: 'MX', name: '@', value: 'mail.oldwebsite.com', ttl: 14400 }
    ],
    authCode: 'GD-8823-XYZ',
    sslStatus: {
      active: false,
      provider: 'GoDaddy',
      expiryDate: '2024-12-10',
      autoRenew: false
    },
    activityLog: [
      { id: '1', action: 'Renewal Failed', date: '2024-12-11', user: 'System', status: 'error' },
      { id: '2', action: 'Expiry Notice Sent', date: '2024-11-10', user: 'System', status: 'warning' }
    ]
  },
  {
    id: '2',
    name: 'techcorp.com',
    client: 'TechCorp Solutions',
    clientId: 'techcorp',
    contact: 'Sarah Johnson',
    expiryDate: '2025-01-15',
    expiryStatus: '22 days remaining',
    daysRemaining: 22,
    vendor: 'Namecheap',
    cost: 12.88,
    status: 'expiring',
    autoRenew: false,
    registrarInfo: {
      name: 'Namecheap',
      url: 'https://namecheap.com',
      supportEmail: 'support@namecheap.com',
      accountUser: 'techcorp_it'
    },
    nameservers: ['ns1.digitalocean.com', 'ns2.digitalocean.com'],
    dnsRecords: [
      { id: '1', type: 'A', name: '@', value: '157.245.1.1', ttl: 3600 },
      { id: '2', type: 'CNAME', name: 'www', value: 'techcorp.com', ttl: 3600 },
      { id: '3', type: 'TXT', name: '@', value: 'v=spf1 include:mailgun.org ~all', ttl: 3600 }
    ],
    authCode: 'NC-9921-ABC',
    sslStatus: {
      active: true,
      provider: 'Let\'s Encrypt',
      expiryDate: '2025-02-15',
      autoRenew: true
    },
    activityLog: [
      { id: '1', action: 'DNS Record Updated', date: '2024-12-01', user: 'Sarah Johnson', status: 'success' },
      { id: '2', action: 'Whois Privacy Enabled', date: '2024-06-15', user: 'Admin', status: 'success' }
    ]
  },
  {
    id: '3',
    name: 'digital-innovations.io',
    client: 'Digital Innovations Inc',
    clientId: 'digital',
    contact: 'Michael Chen',
    expiryDate: '2025-06-20',
    expiryStatus: '178 days remaining',
    daysRemaining: 178,
    vendor: 'Cloudflare',
    cost: 25.00,
    status: 'active',
    autoRenew: true,
    registrarInfo: {
      name: 'Cloudflare',
      url: 'https://dash.cloudflare.com',
      supportEmail: 'support@cloudflare.com',
      accountUser: 'di_devops'
    },
    nameservers: ['sue.ns.cloudflare.com', 'bob.ns.cloudflare.com'],
    dnsRecords: [
      { id: '1', type: 'A', name: '@', value: '104.21.55.1', ttl: 1 },
      { id: '2', type: 'CNAME', name: 'app', value: 'digital-innovations.pages.dev', ttl: 1 }
    ],
    authCode: 'CF-7734-LMN',
    sslStatus: {
      active: true,
      provider: 'Cloudflare Universal SSL',
      expiryDate: '2025-06-20',
      autoRenew: true
    },
    activityLog: [
      { id: '1', action: 'Auto-Renewal Enabled', date: '2024-06-21', user: 'Michael Chen', status: 'success' }
    ]
  },
  {
    id: '4',
    name: 'greenstart.org',
    client: 'GreenStart Ventures',
    clientId: 'greenstart',
    contact: 'Emma Wilson',
    expiryDate: '2025-08-15',
    expiryStatus: '234 days remaining',
    daysRemaining: 234,
    vendor: 'Google Domains',
    cost: 12.00,
    status: 'active',
    autoRenew: false,
    registrarInfo: {
      name: 'Google Domains',
      url: 'https://domains.google.com',
      supportEmail: 'support-domains@google.com',
      accountUser: 'greenstart_admin'
    },
    nameservers: ['ns-cloud-a1.googledomains.com', 'ns-cloud-a2.googledomains.com'],
    dnsRecords: [
      { id: '1', type: 'A', name: '@', value: '34.22.11.55', ttl: 3600 },
      { id: '2', type: 'MX', name: '@', value: 'aspmx.l.google.com', ttl: 3600 }
    ],
    authCode: 'GO-5522-PQR',
    sslStatus: {
      active: true,
      provider: 'Google Managed SSL',
      expiryDate: '2025-08-15',
      autoRenew: true
    },
    activityLog: []
  },
  {
    id: '5',
    name: 'myblog.com',
    client: 'Personal Project',
    clientId: 'personal',
    contact: 'John Doe',
    expiryDate: '2025-11-01',
    expiryStatus: '312 days remaining',
    daysRemaining: 312,
    vendor: 'GoDaddy',
    cost: 9.99,
    status: 'active',
    autoRenew: true,
    registrarInfo: {
      name: 'GoDaddy',
      url: 'https://godaddy.com',
      supportEmail: 'support@godaddy.com',
      accountUser: 'john_doe'
    },
    nameservers: ['ns33.domaincontrol.com', 'ns34.domaincontrol.com'],
    dnsRecords: [],
    authCode: 'GD-1122-XYZ',
    sslStatus: {
      active: true,
      provider: 'GoDaddy',
      expiryDate: '2025-11-01',
      autoRenew: true
    },
    activityLog: []
  },
  {
    id: '6',
    name: 'shopify-store.com',
    client: 'E-commerce Experts',
    clientId: 'ecommerce',
    contact: 'Alice Brown',
    expiryDate: '2025-12-01',
    expiryStatus: '342 days remaining',
    daysRemaining: 342,
    vendor: 'Namecheap',
    cost: 29.99,
    status: 'renewed',
    autoRenew: true,
    registrarInfo: {
      name: 'Namecheap',
      url: 'https://namecheap.com',
      supportEmail: 'support@namecheap.com',
      accountUser: 'store_owner'
    },
    nameservers: ['dns1.registrar-servers.com', 'dns2.registrar-servers.com'],
    dnsRecords: [],
    authCode: 'NC-4411-ZZZ',
    sslStatus: {
      active: true,
      provider: 'Sectigo',
      expiryDate: '2025-12-01',
      autoRenew: true
    },
    activityLog: []
  }
];
