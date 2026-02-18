
// Interfaces
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  initials: string;
  capacity: number;
  currentAllocation: number;
  projects: { name: string; allocation: number }[];
}

export interface Project {
  id: string;
  client: string;
  clientId?: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  monthlyValue: number;
  purchasedBy?: string;
  freeChanges?: { used: number; total: number };
  paidChanges?: number;
  team: string[]; // IDs of assigned team members
  roleId?: string;
  roleName?: string;
  status: 'active' | 'pending' | 'completed' | 'on-hold';
  notes?: string;
  recentChanges?: { title: string; desc: string; date: string; type: 'free' | 'paid'; cost?: number; author: string }[];
}

// Mock Data
export const MOCK_TEAM: TeamMember[] = [
  {
    id: 'john',
    name: 'John Smith',
    role: 'Lead Developer',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_108ec1117-1763301720568.png',
    initials: 'JS',
    capacity: 75,
    currentAllocation: 75,
    projects: [
      { name: 'TechCorp Solutions', allocation: 40 },
      { name: 'Digital Innovations', allocation: 25 },
      { name: 'Internal Projects', allocation: 10 }
    ]
  },
  {
    id: 'lisa',
    name: 'Lisa Anderson',
    role: 'UI Designer',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1e7a035d8-1763296665359.png',
    initials: 'LA',
    capacity: 60,
    currentAllocation: 60,
    projects: [
      { name: 'TechCorp Solutions', allocation: 25 },
      { name: 'GreenStart Ventures', allocation: 20 },
      { name: 'BlueSky Consulting', allocation: 15 }
    ]
  },
  {
    id: 'mike',
    name: 'Mike Johnson',
    role: 'Backend Developer',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_18a0e01e6-1763293528821.png',
    initials: 'MJ',
    capacity: 45,
    currentAllocation: 45,
    projects: [
      { name: 'Digital Innovations', allocation: 30 },
      { name: 'New Client Onboarding', allocation: 15 }
    ]
  },
  {
    id: 'sarah',
    name: 'Sarah Wilson',
    role: 'QA Tester',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1658b37dd-1763299021458.png',
    initials: 'SW',
    capacity: 80,
    currentAllocation: 30,
    projects: [
      { name: 'TechCorp Solutions', allocation: 30 }
    ]
  },
  {
    id: 'emma',
    name: 'Emma Davis',
    role: 'Mobile Developer',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_19f41014c-1763297974731.png',
    initials: 'ED',
    capacity: 70,
    currentAllocation: 50,
    projects: [
      { name: 'BlueSky Consulting', allocation: 50 }
    ]
  },
  {
    id: 'tom',
    name: 'Tom Wilson',
    role: 'DevOps Engineer',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_173d804ae-1763295409178.png',
    initials: 'TW',
    capacity: 60,
    currentAllocation: 20,
    projects: [
      { name: 'BlueSky Consulting', allocation: 20 }
    ]
  },
  {
    id: 'alex',
    name: 'Alex Thompson',
    role: 'Full Stack Developer',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1ada97d8a-1763292961135.png',
    initials: 'AT',
    capacity: 80,
    currentAllocation: 40,
    projects: [
      { name: 'GreenStart Ventures', allocation: 40 }
    ]
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    client: 'TechCorp Solutions',
    clientId: 'techcorp',
    name: 'E-commerce Platform Maintenance',
    type: 'ecommerce',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    monthlyValue: 2500,
    freeChanges: { used: 3, total: 5 },
    paidChanges: 2,
    team: ['john', 'lisa'],
    status: 'active',
    notes: 'Key client, priority support required.',
    recentChanges: [
      { title: 'Product Page Optimization', desc: 'Improved loading speed by 40%', date: '12/22/2025', type: 'free', author: 'John Smith' },
      { title: 'Payment Gateway Integration', desc: 'Added new payment method', date: '12/18/2025', type: 'paid', cost: 150, author: 'Lisa Anderson' }
    ]
  },
  {
    id: '2',
    client: 'Digital Innovations Inc',
    clientId: 'digital',
    name: 'CRM System Updates',
    type: 'crm',
    startDate: '2025-03-01',
    endDate: '2026-02-28',
    monthlyValue: 1800,
    freeChanges: { used: 5, total: 5 },
    paidChanges: 1,
    team: ['mike', 'sarah'],
    status: 'pending',
    notes: 'Pending final sign-off on new module.'
  },
  {
    id: '3',
    client: 'GreenStart Ventures',
    clientId: 'greenstart',
    name: 'Website Performance Optimization',
    type: 'website',
    startDate: '2024-06-01',
    endDate: '2025-05-31',
    monthlyValue: 1200,
    freeChanges: { used: 2, total: 3 },
    paidChanges: 0,
    team: ['alex'],
    status: 'active',
    notes: 'Focus on mobile responsiveness.'
  },
  {
    id: '4',
    client: 'BlueSky Consulting',
    clientId: 'bluesky',
    name: 'Mobile App Maintenance',
    type: 'mobile',
    startDate: '2024-09-01',
    endDate: '2025-08-31',
    monthlyValue: 3000,
    freeChanges: { used: 4, total: 5 },
    paidChanges: 3,
    team: ['emma', 'tom'],
    status: 'on-hold',
    notes: 'Client requested temporary pause.'
  }
];
