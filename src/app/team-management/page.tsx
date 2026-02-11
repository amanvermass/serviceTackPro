'use client';

import React, { useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TeamManagement() {
  interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'available' | 'busy' | 'offline';
    phone: string;
    projects: string[];
    workload: number;
    permissions: string[];
    notifications: string[];
    avatar?: string;
  }

  const initialMembers: TeamMember[] = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@company.com',
      role: 'Account Manager',
      status: 'available',
      phone: '+1 (555) 123-4567',
      projects: ['TechCorp Solutions', 'GreenStart Ventures', 'BlueSky Consulting'],
      workload: 65,
      permissions: ['Clients', 'Reports'],
      notifications: ['Email', 'SMS'],
      avatar: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=2940&auto=format&fit=crop'
    },
    {
      id: 2,
      name: 'Lisa Anderson',
      email: 'lisa.anderson@company.com',
      role: 'Technical Lead',
      status: 'busy',
      phone: '+1 (555) 234-5678',
      projects: ['Digital Innovations', 'BlueSky Consulting', 'StartupHub', 'TechWorks', 'CloudEdge'],
      workload: 92,
      permissions: ['Domains', 'Hosting', 'Admin'],
      notifications: ['Email', 'WhatsApp'],
      avatar: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=2940&auto=format&fit=crop'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      role: 'Developer',
      status: 'available',
      phone: '+1 (555) 345-6789',
      projects: ['TechCorp Solutions', 'StartupHub', 'GreenStart Ventures', 'Alpha Inc'],
      workload: 75,
      permissions: ['Maintenance', 'Hosting'],
      notifications: ['Email', 'SMS'],
      avatar: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=2940&auto=format&fit=crop'
    },
    {
      id: 4,
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      role: 'UI/UX Designer',
      status: 'available',
      phone: '+1 (555) 456-7890',
      projects: ['GreenStart Ventures', 'Digital Innovations'],
      workload: 58,
      permissions: ['Design', 'Clients'],
      notifications: ['Email'],
      avatar: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=2940&auto=format&fit=crop'
    },
    {
      id: 5,
      name: 'Alex Rodriguez',
      email: 'alex.rodriguez@company.com',
      role: 'Developer',
      status: 'offline',
      phone: '+1 (555) 567-8901',
      projects: ['TechWorks', 'CloudEdge'],
      workload: 40,
      permissions: ['Domains', 'Maintenance'],
      notifications: ['Email'],
      avatar: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=2940&auto=format&fit=crop'
    },
    {
      id: 6,
      name: 'David Wilson',
      email: 'david.wilson@company.com',
      role: 'Project Director',
      status: 'available',
      phone: '+1 (555) 678-9012',
      projects: [],
      workload: 35,
      permissions: ['Admin', 'Clients', 'Domains', 'Hosting', 'Maintenance', 'Team', 'Settings'],
      notifications: ['Email', 'SMS'],
      avatar: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=2940&auto=format&fit=crop'
    }
  ];

  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState<'name' | 'role' | 'projects' | 'workload'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newMember, setNewMember] = useState<{ name: string; email: string; phone: string; role: string }>({
    name: '',
    email: '',
    phone: '',
    role: ''
  });

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return members.filter((m) => {
      const matchesTerm =
        !term ||
        m.name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        m.role.toLowerCase().includes(term) ||
        m.projects.some((p) => p.toLowerCase().includes(term));
      const matchesRole = roleFilter === 'all' || m.role.toLowerCase().includes(roleFilter);
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesTerm && matchesRole && matchesStatus;
    });
  }, [members, searchTerm, roleFilter, statusFilter]);

  const sorted = useMemo(() => {
    const arr = filtered.slice();
    arr.sort((a, b) => {
      let av: number | string = '';
      let bv: number | string = '';
      if (sortKey === 'name') {
        av = a.name.toLowerCase();
        bv = b.name.toLowerCase();
      } else if (sortKey === 'role') {
        av = a.role.toLowerCase();
        bv = b.role.toLowerCase();
      } else if (sortKey === 'projects') {
        av = a.projects.length;
        bv = b.projects.length;
      } else {
        av = a.workload;
        bv = b.workload;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const onSort = (key: 'name' | 'role' | 'projects' | 'workload') => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const onRowClick = (e: React.MouseEvent<HTMLTableRowElement>, member: TeamMember) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    setSelectedMember(member);
    setPanelOpen(true);
  };

  const addMemberSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email || !newMember.role) return;
    const id = members.length ? Math.max(...members.map((m) => m.id)) + 1 : 1;
    const created: TeamMember = {
      id,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      status: 'available',
      phone: newMember.phone || '',
      projects: [],
      workload: 0,
      permissions: [],
      notifications: ['Email']
    };
    setMembers((prev) => [...prev, created]);
    setAddOpen(false);
    setNewMember({ name: '', email: '', phone: '', role: '' });
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow w-full px-10 py-[2vh]">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">Team Management</h1>
              <p className="text-text-secondary">Manage team members, roles, and project assignments with workload distribution</p>
            </div>
            <button
              id="addTeamMemberBtn"
              className="btn btn-primary flex items-center gap-2 w-full sm:w-auto"
              onClick={() => setAddOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add Team Member
            </button>
          </div>
        </div>

        {/* Team Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-text-primary">8</p>
                <p className="text-sm text-text-secondary">Total Members</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-success-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-text-primary">6</p>
                <p className="text-sm text-text-secondary">Active Members</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-warning-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-text-primary">15</p>
                <p className="text-sm text-text-secondary">Active Projects</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-text-primary">78%</p>
                <p className="text-sm text-text-secondary">Avg Capacity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workload Distribution Panel */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-semibold text-text-primary">Workload Distribution</h3>
            <button className="btn btn-outline text-sm h-9 px-4 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Rebalance
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Member Workload */}
            <div className="space-y-4">
              <h4 className="font-medium text-text-primary mb-3">Current Workload</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-success-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=2940&auto=format&fit=crop" alt="John Smith" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary text-sm">John Smith</p>
                      <p className="text-xs text-text-secondary">Account Manager</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-success">65%</p>
                    <p className="text-xs text-text-secondary">3 projects</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-warning-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=2940&auto=format&fit=crop" alt="Lisa Anderson" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary text-sm">Lisa Anderson</p>
                      <p className="text-xs text-text-secondary">Technical Lead</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-warning">92%</p>
                    <p className="text-xs text-text-secondary">5 projects</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-primary-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=2940&auto=format&fit=crop" alt="Mike Johnson" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary text-sm">Mike Johnson</p>
                      <p className="text-xs text-text-secondary">Developer</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">75%</p>
                    <p className="text-xs text-text-secondary">4 projects</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Capacity Recommendations */}
            <div>
              <h4 className="font-medium text-text-primary mb-3">Rebalancing Recommendations</h4>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-warning-200 bg-warning-50">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-warning-700">High Workload Alert</p>
                      <p className="text-xs text-warning-600 mt-1">Lisa Anderson is at 92% capacity. Consider redistributing 1-2 projects.</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-success-200 bg-success-50">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-success-700">Available Capacity</p>
                      <p className="text-xs text-success-600 mt-1">John Smith has 35% available capacity for new assignments.</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-primary-200 bg-primary-50">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-primary-700">Skill Match</p>
                      <p className="text-xs text-primary-600 mt-1">Consider assigning React projects to Sarah Chen for optimal efficiency.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label htmlFor="searchInput" className="input-label">Search Team Members</label>
              <div className="relative">
                <input 
                  type="text" 
                  id="searchInput" 
                  className="input pl-10" 
                  placeholder="Search by name, role, or project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-5 h-5 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label htmlFor="roleFilter" className="input-label">Role</label>
              <select 
                id="roleFilter" 
                className="input"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="manager">Manager</option>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="support">Support</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="statusFilter" className="input-label">Availability</label>
              <select 
                id="statusFilter" 
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          {/* Filter Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Showing <span id="resultCount" className="font-semibold text-text-primary">{sorted.length}</span> team members
            </p>
            <div className="flex items-center gap-2">
              <button
                id="bulkNotifyBtn"
                className="btn btn-outline text-sm h-9 px-4 flex items-center gap-2"
                onClick={() => {}}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h8V9H4v2z"/>
                </svg>
                Bulk Notify
              </button>
              <button
                id="exportBtn"
                className="btn btn-outline text-sm h-9 px-4 flex items-center gap-2"
                onClick={() => {}}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th
                    className="cursor-pointer hover:bg-secondary-100 transition-smooth"
                    onClick={() => onSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Team Member
                      <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                      </svg>
                    </div>
                  </th>
                  <th
                    className="cursor-pointer hover:bg-secondary-100 transition-smooth"
                    onClick={() => onSort('role')}
                  >
                    <div className="flex items-center gap-2">
                      Role & Permissions
                      <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                      </svg>
                    </div>
                  </th>
                  <th
                    className="cursor-pointer hover:bg-secondary-100 transition-smooth"
                    onClick={() => onSort('projects')}
                  >
                    <div className="flex items-center gap-2">
                      Current Projects
                      <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                      </svg>
                    </div>
                  </th>
                  <th
                    className="cursor-pointer hover:bg-secondary-100 transition-smooth"
                    onClick={() => onSort('workload')}
                  >
                    <div className="flex items-center gap-2">
                      Workload
                      <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                      </svg>
                    </div>
                  </th>
                  <th>Contact & Notifications</th>
                  <th className="flex items-center justify-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((m) => (
                  <tr
                    key={m.id}
                    className="cursor-pointer hover:bg-surface-hover transition-smooth"
                    onClick={(e) => onRowClick(e, m)}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={m.avatar}
                            alt={m.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div
                            className={[
                              'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface',
                              m.status === 'available' ? 'bg-success' : m.status === 'busy' ? 'bg-warning' : 'bg-secondary'
                            ].join(' ')}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{m.name}</p>
                          <p className="text-xs text-text-secondary">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-text-primary">{m.role}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {m.permissions.slice(0, 3).map((p, idx) => (
                            <span key={idx} className={['badge text-xs', p === 'Admin' ? 'badge-success' : p === 'Hosting' || p === 'Maintenance' ? 'badge-warning' : 'badge-primary'].join(' ')}>
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        {m.projects.slice(0, 2).map((p, idx) => (
                          <p key={idx} className="text-sm text-text-primary">{p}</p>
                        ))}
                        {m.projects.length > 2 && (
                          <p className="text-xs text-text-secondary">+{m.projects.length - 2} more projects</p>
                        )}
                        {m.projects.length === 2 && (
                          <p className="text-xs text-text-secondary">2 active projects</p>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-secondary-200 rounded-full h-2">
                          <div
                            className={[
                              'h-2 rounded-full',
                              m.workload >= 85 ? 'bg-warning' : m.workload >= 60 ? 'bg-primary' : 'bg-success'
                            ].join(' ')}
                            style={{ width: `${m.workload}%` }}
                          />
                        </div>
                        <span
                          className={[
                            'text-sm font-medium',
                            m.workload >= 85 ? 'text-warning' : m.workload >= 60 ? 'text-primary' : 'text-success'
                          ].join(' ')}
                        >
                          {m.workload}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm text-text-primary">{m.phone}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {m.notifications.map((n, idx) => (
                            <span
                              key={idx}
                              className={[
                                'badge text-xs',
                                n === 'WhatsApp' ? 'badge-accent' : n === 'SMS' ? 'badge-success' : 'badge-primary'
                              ].join(' ')}
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-lg hover:bg-surface-hover transition-smooth" aria-label="Edit team member">
                          <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button className="p-2 rounded-lg hover:bg-primary-50 transition-smooth" aria-label="Assign project">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="card">
            <h3 className="text-lg font-heading font-semibold text-text-primary">Organizational Structure</h3>
            <div className="space-y-4 mt-4">
              <div className="p-4 rounded-lg border border-primary-200 bg-primary-50">
                <div className="flex items-center gap-3 mb-3">
                  <img src={initialMembers[5].avatar} alt="David Wilson" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-medium text-text-primary">David Wilson</p>
                    <p className="text-sm text-text-secondary">Project Director</p>
                  </div>
                </div>
                <div className="ml-13">
                  <p className="text-sm text-text-secondary mb-2">Direct Reports:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm text-text-primary">John Smith (Account Manager)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm text-text-primary">Lisa Anderson (Technical Lead)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm text-text-primary">Sarah Chen (UI/UX Designer)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-secondary-200 bg-secondary-50">
                <div className="flex items-center gap-3 mb-3">
                  <img src={initialMembers[1].avatar} alt="Lisa Anderson" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-medium text-text-primary">Lisa Anderson</p>
                    <p className="text-sm text-text-secondary">Technical Lead</p>
                  </div>
                </div>
                <div className="ml-13">
                  <p className="text-sm text-text-secondary mb-2">Team Members:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      <span className="text-sm text-text-primary">Mike Johnson (Developer)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      <span className="text-sm text-text-primary">Alex Rodriguez (Developer)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          id="memberDetailPanel"
          className={[
            'fixed inset-y-0 right-0 w-full md:w-[480px] bg-surface shadow-2xl transform transition-transform duration-300 z-modal overflow-y-auto',
            panelOpen ? 'translate-x-0' : 'translate-x-full'
          ].join(' ')}
        >
          <div className="sticky top-0 bg-surface border-b border-border p-6 z-sticky">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading font-bold text-text-primary">Team Member Details</h2>
              <button id="closePanelBtn" className="p-2 rounded-lg hover:bg-surface-hover transition-smooth" aria-label="Close panel" onClick={() => setPanelOpen(false)}>
                <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          {selectedMember && (
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img src={selectedMember.avatar} alt={selectedMember.name} className="w-16 h-16 rounded-xl object-cover" />
                  <div
                    className={[
                      'absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-surface',
                      selectedMember.status === 'available' ? 'bg-success' : selectedMember.status === 'busy' ? 'bg-warning' : 'bg-secondary'
                    ].join(' ')}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-heading font-bold text-text-primary mb-1">{selectedMember.name}</h3>
                  <p className="text-sm text-text-secondary mb-2">{selectedMember.role}</p>
                  <div className="flex items-center gap-2">
                    <span className={['badge', selectedMember.status === 'available' ? 'badge-success' : selectedMember.status === 'busy' ? 'badge-warning' : 'badge-secondary'].join(' ')}>{selectedMember.status === 'available' ? 'Available' : selectedMember.status === 'busy' ? 'Busy' : 'Offline'}</span>
                    <span className="badge badge-primary">{selectedMember.workload}% Capacity</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h4 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  Contact & Notifications
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Email</p>
                    <a href={`mailto:${selectedMember.email}`} className="text-primary">{selectedMember.email}</a>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Phone</p>
                    <a href={`tel:${selectedMember.phone}`} className="text-primary">{selectedMember.phone}</a>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Notification Preferences</p>
                    <div className="flex items-center gap-2 mt-2">
                      {selectedMember.notifications.map((n, idx) => (
                        <span key={idx} className={['badge', n === 'SMS' ? 'badge-success' : n === 'WhatsApp' ? 'badge-accent' : 'badge-primary'].join(' ')}>{n}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h4 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  Current Projects
                </h4>
                <div className="space-y-3">
                  {selectedMember.projects.slice(0, 3).map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-primary-50">
                      <div>
                        <p className="font-medium text-text-primary">{p}</p>
                        <p className="text-xs text-text-secondary">Assigned</p>
                      </div>
                      <span className="badge badge-success">Active</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h4 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                  Performance Metrics
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-text-secondary">Project Completion Rate</span>
                      <span className="text-sm font-medium text-success">95%</span>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div className="bg-success h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-text-secondary">Client Satisfaction</span>
                      <span className="text-sm font-medium text-primary">4.8/5</span>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '96%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-text-secondary">On-time Delivery</span>
                      <span className="text-sm font-medium text-accent">92%</span>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="btn btn-primary flex-1">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  Assign Project
                </button>
                <button className="btn btn-outline">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {addOpen && (
          <div id="addMemberModal" className="modal-overlay">
            <div className="modal-content">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-heading font-bold text-text-primary">Add Team Member</h3>
                  <button id="closeModalBtn" className="p-2 rounded-lg hover:bg-surface-hover transition-smooth" aria-label="Close modal" onClick={() => setAddOpen(false)}>
                    <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
              <form className="p-6 space-y-6" onSubmit={addMemberSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="memberName" className="input-label">Full Name *</label>
                    <input
                      type="text"
                      id="memberName"
                      className="input"
                      placeholder="Enter full name"
                      value={newMember.name}
                      onChange={(e) => setNewMember((s) => ({ ...s, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="memberEmail" className="input-label">Email *</label>
                    <input
                      type="email"
                      id="memberEmail"
                      className="input"
                      placeholder="member@company.com"
                      value={newMember.email}
                      onChange={(e) => setNewMember((s) => ({ ...s, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="memberPhone" className="input-label">Phone</label>
                    <input
                      type="tel"
                      id="memberPhone"
                      className="input"
                      placeholder="+1 (555) 123-4567"
                      value={newMember.phone}
                      onChange={(e) => setNewMember((s) => ({ ...s, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="memberRole" className="input-label">Role *</label>
                    <select
                      id="memberRole"
                      className="input"
                      value={newMember.role}
                      onChange={(e) => setNewMember((s) => ({ ...s, role: e.target.value }))}
                      required
                    >
                      <option value="">Select role</option>
                      <option value="Manager">Manager</option>
                      <option value="Developer">Developer</option>
                      <option value="Designer">Designer</option>
                      <option value="Support">Support</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="input-label">Module Permissions</label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {['Clients', 'Domains', 'Hosting', 'Maintenance', 'Team', 'Settings'].map((perm) => (
                      <label key={perm} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                        <span className="text-sm text-text-primary">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="input-label">Notification Preferences</label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {['Email', 'SMS', 'WhatsApp'].map((ch) => (
                      <label key={ch} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked={ch === 'Email'} />
                        <span className="text-sm text-text-primary">{ch}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Add Member
                  </button>
                  <button type="button" id="cancelModalBtn" className="btn btn-outline" onClick={() => setAddOpen(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
