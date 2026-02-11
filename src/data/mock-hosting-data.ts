
export interface HostingAccount {
  id: string;
  clientName: string;
  clientDomain: string;
  clientInitials: string;
  provider: 'AWS' | 'DigitalOcean' | 'Bluehost' | 'SiteGround' | 'HostGator';
  providerLogo: string;
  serviceType: 'Cloud Hosting' | 'VPS' | 'Shared Hosting' | 'Dedicated Server';
  renewalDate: string;
  daysLeft: number;
  monthlyCost: number;
  bandwidthUsage: number; // percentage
  bandwidthLabel: string;
  diskUsage: number; // percentage
  diskLabel: string;
  status: 'Active' | 'Expiring Soon' | 'Expired';
  serverInfo: {
    ipAddress: string;
    os: string;
    region: string;
    phpVersion?: string;
    nodeVersion?: string;
    dbType: string;
    uptime: string;
  };
  features: string[];
  recentActivity: {
    id: string;
    action: string;
    date: string;
    user: string;
    status: 'success' | 'warning' | 'error';
  }[];
}

export const MOCK_HOSTING_ACCOUNTS: HostingAccount[] = [
  {
    id: '1',
    clientName: 'TechCorp Solutions',
    clientDomain: 'techcorp.io',
    clientInitials: 'TC',
    provider: 'AWS',
    providerLogo: 'https://img.rocket.new/generatedImages/rocket_gen_img_1e3f7c998-1766604422461.png',
    serviceType: 'Cloud Hosting',
    renewalDate: '2025-01-15',
    daysLeft: 22,
    monthlyCost: 189.99,
    bandwidthUsage: 45,
    bandwidthLabel: '450 GB / 1 TB',
    diskUsage: 30,
    diskLabel: '150 GB / 500 GB',
    status: 'Expiring Soon',
    serverInfo: {
      ipAddress: '54.23.11.102',
      os: 'Ubuntu 22.04 LTS',
      region: 'us-east-1',
      nodeVersion: 'v18.16.0',
      dbType: 'PostgreSQL 14',
      uptime: '99.99%'
    },
    features: ['Auto Scaling', 'Load Balancer', 'Daily Backups', 'WAF Enabled'],
    recentActivity: [
      { id: '101', action: 'Server Restart', date: '2024-12-20', user: 'Admin', status: 'success' },
      { id: '102', action: 'SSL Renewal', date: '2024-12-15', user: 'System', status: 'success' },
      { id: '103', action: 'High CPU Alert', date: '2024-12-10', user: 'Monitor', status: 'warning' }
    ]
  },
  {
    id: '2',
    clientName: 'Digital Innovations Inc',
    clientDomain: 'digital-innovations.com',
    clientInitials: 'DI',
    provider: 'DigitalOcean',
    providerLogo: 'https://img.rocket.new/generatedImages/rocket_gen_img_16c965b6d-1766604422896.png',
    serviceType: 'VPS',
    renewalDate: '2025-02-10',
    daysLeft: 48,
    monthlyCost: 45.00,
    bandwidthUsage: 62,
    bandwidthLabel: '2.5 TB / 4 TB',
    diskUsage: 55,
    diskLabel: '45 GB / 80 GB',
    status: 'Active',
    serverInfo: {
      ipAddress: '165.22.45.11',
      os: 'Debian 11',
      region: 'nyc1',
      phpVersion: '8.1',
      dbType: 'MySQL 8.0',
      uptime: '99.95%'
    },
    features: ['SSD Storage', 'Private Networking', 'IPv6'],
    recentActivity: [
      { id: '201', action: 'Deployment #45', date: '2024-12-22', user: 'DevOps', status: 'success' },
      { id: '202', action: 'Database Backup', date: '2024-12-21', user: 'System', status: 'success' }
    ]
  },
  {
    id: '3',
    clientName: 'GreenStart Ventures',
    clientDomain: 'greenstart.org',
    clientInitials: 'GV',
    provider: 'SiteGround',
    providerLogo: 'https://img.rocket.new/generatedImages/rocket_gen_img_1b04b901b-1766604423027.png',
    serviceType: 'Shared Hosting',
    renewalDate: '2025-03-22',
    daysLeft: 88,
    monthlyCost: 14.99,
    bandwidthUsage: 28,
    bandwidthLabel: '28 GB / 100 GB',
    diskUsage: 15,
    diskLabel: '3 GB / 20 GB',
    status: 'Active',
    serverInfo: {
      ipAddress: '35.201.10.55',
      os: 'Linux (Shared)',
      region: 'us-central',
      phpVersion: '8.2',
      dbType: 'MySQL 5.7',
      uptime: '99.9%'
    },
    features: ['Free CDN', 'Free SSL', 'Daily Backups'],
    recentActivity: [
      { id: '301', action: 'WordPress Update', date: '2024-12-18', user: 'System', status: 'success' }
    ]
  },
  {
    id: '4',
    clientName: 'BlueSky Consulting',
    clientDomain: 'bluesky-consulting.com',
    clientInitials: 'BC',
    provider: 'Bluehost',
    providerLogo: 'https://img.rocket.new/generatedImages/rocket_gen_img_180d9c4d3-1766604423320.png',
    serviceType: 'Shared Hosting',
    renewalDate: '2025-01-28',
    daysLeft: 35,
    monthlyCost: 39.99,
    bandwidthUsage: 76,
    bandwidthLabel: '38 GB / 50 GB',
    diskUsage: 82,
    diskLabel: '41 GB / 50 GB',
    status: 'Expiring Soon',
    serverInfo: {
      ipAddress: '192.168.1.5',
      os: 'CentOS 7',
      region: 'us-west',
      phpVersion: '7.4',
      dbType: 'MariaDB 10.3',
      uptime: '99.5%'
    },
    features: ['Unmetered Bandwidth', 'Domain Privacy'],
    recentActivity: [
      { id: '401', action: 'Disk Space Warning', date: '2024-12-23', user: 'Monitor', status: 'warning' }
    ]
  },
  {
    id: '5',
    clientName: 'NextWave Media',
    clientDomain: 'nextwavemedia.net',
    clientInitials: 'NW',
    provider: 'HostGator',
    providerLogo: 'https://img.rocket.new/generatedImages/rocket_gen_img_15cfd513b-1766604422437.png',
    serviceType: 'Dedicated Server',
    renewalDate: '2025-08-15',
    daysLeft: 234,
    monthlyCost: 249.99,
    bandwidthUsage: 60,
    bandwidthLabel: '1.2 TB / 2 TB',
    diskUsage: 45,
    diskLabel: '900 GB / 2 TB',
    status: 'Active',
    serverInfo: {
      ipAddress: '104.22.15.99',
      os: 'Red Hat Enterprise',
      region: 'tx-1',
      phpVersion: '8.1',
      dbType: 'Oracle 19c',
      uptime: '99.999%'
    },
    features: ['Root Access', 'DDoS Protection', '24/7 Support'],
    recentActivity: [
      { id: '501', action: 'Security Patch', date: '2024-11-30', user: 'Admin', status: 'success' }
    ]
  }
];
