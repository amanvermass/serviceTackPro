'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TableShimmer from '@/components/TableShimmer';

export default function TeamManagement() {
  interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    roleId?: string;
    status: 'available' | 'busy' | 'offline';
    phone: string;
    projects: string[];
    assignedProjects?: {
      id: string;
      projectName: string;
      status: string;
    }[];
    workload: number;
    permissions: string[];
    notifications: string[];
    avatar?: string;
  }

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState<'name' | 'role' | 'projects' | 'workload'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState<{ name: string; email: string; phone: string; role: string }>({
    name: '',
    email: '',
    phone: '',
    role: ''
  });

  const [teamStats, setTeamStats] = useState<{ totalMembers: number; activeMembers: number; activeProjects: number } | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTeam = useCallback(async () => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
      const token = localStorage.getItem('token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${baseUrl}/api/teams`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.data || []);

        const apiMembers: TeamMember[] = items.map((item: any) => {
          const notifications: string[] = [];
          if (item.notifications?.email) notifications.push('Email');
          if (item.notifications?.sms) notifications.push('SMS');
          if (item.notifications?.whatsapp) notifications.push('WhatsApp');

          const permissions: string[] = [];
          if (item.role?.permissions) {
            Object.entries(item.role.permissions).forEach(([key, value]) => {
              if (value) {
                const label = key.charAt(0).toUpperCase() + key.slice(1);
                permissions.push(label);
              }
            });
          }

          const assignedProjectsRaw = Array.isArray(item.assignedProjects) ? item.assignedProjects : [];
          const assignedProjects = assignedProjectsRaw
            .map((p: any) => ({
              id: p._id || p.id,
              projectName: p.projectName || p.name || '',
              status: p.status || 'active'
            }))
            .filter((p: any) => p.projectName);

          const projects = assignedProjects.map((p: any) => p.projectName);

          return {
            id: item._id,
            name: item.name,
            email: item.email,
            role: item.role?.name || 'Team Member',
            roleId: item.role?._id,
            status: item.status === 'active' ? 'available' : 'offline',
            phone: item.phone || '',
            projects,
            assignedProjects,
            workload:
              typeof item.assignedProjectsCount === 'number'
                ? item.assignedProjectsCount
                : assignedProjects.length,
            permissions,
            notifications,
            avatar: ''
          };
        });

        setMembers(apiMembers);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTeamStats = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
      const token = localStorage.getItem('token');

      if (!token) {
        setIsStatsLoading(false);
        return;
      }

      const response = await fetch(`${baseUrl}/api/teams/team-stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const statsData = data.data || data;
        setTeamStats({
          totalMembers: statsData.totalMembers ?? 0,
          activeMembers: statsData.activeMembers ?? 0,
          activeProjects: statsData.activeProjects ?? 0
        });
      }
    } catch (error) {
      console.error('Error fetching team stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/roles`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.data || []);
        const mappedRoles = items
          .map((item: any) => ({
            id: item._id || item.id,
            name: item.name
          }))
          .filter((role: { id: string; name: string }) => role.id && role.name);
        setRoles(mappedRoles);
      } else {
        console.error('Failed to fetch roles');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
    fetchRoles();
    fetchTeamStats();
  }, [fetchTeam, fetchRoles, fetchTeamStats]);

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

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage) || 1);
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginated = sorted.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

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

  const handleViewMember = (member: TeamMember) => {
    setSelectedMember(member);
    setPanelOpen(true);
  };

  const addMemberSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = (formData.get('memberName') as string) || '';
    const email = (formData.get('memberEmail') as string) || '';
    const phone = (formData.get('memberPhone') as string) || '';
    const roleValue = (formData.get('memberRole') as string) || '';
    const passwordValue = (formData.get('memberPassword') as string) || '';

    if (!name || !email || !roleValue) return;

    const notifEmail = formData.get('notif_email') === 'on';
    const notifSms = formData.get('notif_sms') === 'on';
    const notifWhatsapp = formData.get('notif_whatsapp') === 'on';

    const payload: any = {
      name,
      email,
      phone,
      roleId: roleValue,
      notifications: {
        email: notifEmail || (!notifSms && !notifWhatsapp),
        sms: notifSms,
        whatsapp: notifWhatsapp
      }
    };

    if (!editingMember || passwordValue.trim() !== '') {
      payload.password = passwordValue;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
      const token = localStorage.getItem('token');

      const url = editingMember
        ? `${baseUrl}/api/teams/${editingMember.id}`
        : `${baseUrl}/api/teams`;

      const method = editingMember ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchTeam();
        setAddOpen(false);
        setEditingMember(null);
        setNewMember({ name: '', email: '', phone: '', role: '' });
      } else {
        console.error('Failed to save team member');
      }
    } catch (error) {
      console.error('Error saving team member:', error);
    }
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
              onClick={() => {
                setEditingMember(null);
                setNewMember({ name: '', email: '', phone: '', role: '' });
                setAddOpen(true);
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add Team Member
            </button>
          </div>
        </div>

        {/* Team Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-text-primary">
                  {teamStats?.totalMembers ?? 0}
                </p>
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
                <p className="text-2xl font-heading font-bold text-text-primary">
                  {teamStats?.activeMembers ?? 0}
                </p>
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
                <p className="text-2xl font-heading font-bold text-text-primary">
                  {teamStats?.activeProjects ?? 0}
                </p>
                <p className="text-sm text-text-secondary">Active Projects</p>
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
          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="table">
                <tbody>
                  <TableShimmer columns={5} rows={8} />
                </tbody>
              </table>
            </div>
          ) : sorted.length === 0 ? (
            <div className="p-12 text-center text-text-secondary">
              <p className="text-lg font-medium">No team members found</p>
              <p className="text-sm mt-1">Add a team member to get started.</p>
            </div>
          ) : (
            <>
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
                      <th>Contact & Notifications</th>
                      <th className="flex items-center justify-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((m) => (
                      <tr
                        key={m.id}
                        className="hover:bg-surface-hover transition-smooth"
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {m.avatar ? (
                                <img
                                  src={m.avatar}
                                  alt={m.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center text-sm font-medium text-secondary-800">
                                  {m.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </div>
                              )}
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
                            {(
                              m.assignedProjects && m.assignedProjects.length > 0
                                ? m.assignedProjects.slice(0, 2).map((p, idx) => (
                                    <p key={p.id || idx} className="text-sm text-text-primary">
                                      {p.projectName}
                                    </p>
                                  ))
                                : m.projects.slice(0, 2).map((p, idx) => (
                                    <p key={idx} className="text-sm text-text-primary">
                                      {p}
                                    </p>
                                  ))
                            )}
                            {((m.assignedProjects?.length ?? m.projects.length) > 2) && (
                              <p className="text-xs text-text-secondary">
                                +{(m.assignedProjects?.length ?? m.projects.length) - 2} more projects
                              </p>
                            )}
                            {((m.assignedProjects?.length ?? m.projects.length) === 0) && (
                              <p className="text-xs text-text-secondary">No assigned projects</p>
                            )}
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
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="p-2 cursor-pointer rounded-lg hover:bg-surface-hover transition-smooth"
                              aria-label="Edit team member"
                              onClick={() => {
                                setEditingMember(m);
                                setNewMember({
                                  name: m.name,
                                  email: m.email,
                                  phone: m.phone,
                                  role: m.roleId || m.role
                                });
                                setAddOpen(true);
                              }}
                            >
                              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                              </svg>
                            </button>
                            <button
                              className="p-2 cursor-pointer rounded-lg hover:bg-error-50 transition-smooth"
                              aria-label="Delete team member"
                              onClick={() => {
                                setMembers((prev) => prev.filter((x) => x.id !== m.id));
                              }}
                            >
                              <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-4 bg-surface-50">
                <div className="text-sm text-text-secondary">
                  Showing Page <span className="font-medium text-text-primary">{safePage}</span> of <span className="font-medium text-text-primary">{totalPages}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={safePage === 1}
                    className="btn btn-outline btn-sm h-8 px-3"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages: (number | string)[] = [];
                      if (totalPages <= 3) {
                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                      } else {
                        let start = Math.max(1, safePage - 1);
                        let end = Math.min(totalPages, start + 2);

                        if (end === totalPages) {
                          start = Math.max(1, end - 2);
                        }

                        if (start > 1) pages.push('...');
                        for (let i = start; i <= end; i++) pages.push(i);
                        if (end < totalPages) pages.push('...');
                      }

                      return pages.map((page, index) => (
                        <button
                          key={index}
                          onClick={() => (typeof page === 'number' ? setCurrentPage(page) : null)}
                          disabled={typeof page !== 'number'}
                          className={`h-8 min-w-[32px] px-2 rounded-lg text-sm font-medium transition-colors
                            ${
                              page === safePage
                                ? 'bg-primary text-white shadow-sm'
                                : typeof page === 'number'
                                ? 'hover:bg-surface-hover text-text-secondary hover:text-text-primary'
                                : 'text-text-tertiary cursor-default'
                            }`}
                        >
                          {page}
                        </button>
                      ));
                    })()}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={safePage === totalPages}
                    className="btn btn-outline btn-sm h-8 px-3"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
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
                  {selectedMember.assignedProjects && selectedMember.assignedProjects.length > 0 ? (
                    selectedMember.assignedProjects.map((p, idx) => {
                      const status = (p.status || '').toLowerCase();
                      const statusLabel = status
                        ? status.charAt(0).toUpperCase() + status.slice(1)
                        : 'Assigned';
                      const statusClass =
                        status === 'active'
                          ? 'badge-success'
                          : status === 'onhold' || status === 'on_hold'
                          ? 'badge-warning'
                          : status === 'completed'
                          ? 'badge-secondary'
                          : 'badge-primary';
                      return (
                        <div key={p.id || idx} className="flex items-center justify-between p-3 rounded-lg bg-primary-50">
                          <div>
                            <p className="font-medium text-text-primary">{p.projectName}</p>
                            <p className="text-xs text-text-secondary">{statusLabel}</p>
                          </div>
                          <span className={['badge', statusClass].join(' ')}>{statusLabel}</span>
                        </div>
                      );
                    })
                  ) : selectedMember.projects.length > 0 ? (
                    selectedMember.projects.slice(0, 3).map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-primary-50">
                        <div>
                          <p className="font-medium text-text-primary">{p}</p>
                          <p className="text-xs text-text-secondary">Assigned</p>
                        </div>
                        <span className="badge badge-success">Active</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-text-secondary">No assigned projects</p>
                  )}
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
                  <h3 className="text-xl font-heading font-bold text-text-primary">
                    {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                  </h3>
                  <button
                    id="closeModalBtn"
                    className="p-2 rounded-lg hover:bg-surface-hover transition-smooth"
                    aria-label="Close modal"
                    onClick={() => {
                      setAddOpen(false);
                      setEditingMember(null);
                      setNewMember({ name: '', email: '', phone: '', role: '' });
                    }}
                  >
                    <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
              <form className="p-6 space-y-6" onSubmit={addMemberSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="memberName" className="input-label">
                      Full Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      id="memberName"
                      name="memberName"
                      className="input"
                      placeholder="Enter full name"
                      value={newMember.name}
                      onChange={(e) => setNewMember((s) => ({ ...s, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="memberEmail" className="input-label">
                      Email <span className="text-error">*</span>
                    </label>
                    <input
                      type="email"
                      id="memberEmail"
                      name="memberEmail"
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
                    <label htmlFor="memberPhone" className="input-label">Phone <span className="text-error">*</span></label>
                    <input
                      type="tel"
                      id="memberPhone"
                      name="memberPhone"
                      className="input"
                      placeholder="9876543210"
                      value={newMember.phone}
                      onChange={(e) => setNewMember((s) => ({ ...s, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="memberRole" className="input-label">
                      Role <span className="text-error">*</span>
                    </label>
                    <select
                      id="memberRole"
                      name="memberRole"
                      className="input"
                      value={newMember.role}
                      onChange={(e) => setNewMember((s) => ({ ...s, role: e.target.value }))}
                      required
                    >
                      <option value="">Select role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="memberPassword" className="input-label">
                      {editingMember ? (
                        'Password (optional)'
                      ) : (
                        <>
                          Password <span className="text-error">*</span>
                        </>
                      )}
                    </label>
                    <input
                      type="password"
                      id="memberPassword"
                      name="memberPassword"
                      className="input"
                      placeholder={editingMember ? 'Enter new password (leave blank to keep current)' : 'Enter password'}
                      {...(!editingMember ? { required: true } : {})}
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Module Permissions</label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {['Clients', 'Domains', 'Hosting', 'Maintenance', 'Team', 'Settings'].map((perm) => (
                      <label key={perm} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                          defaultChecked={editingMember?.permissions.includes(perm) ?? false}
                        />
                        <span className="text-sm text-text-primary">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="input-label">Notification Preferences</label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {['Email', 'SMS', 'WhatsApp'].map((ch) => {
                      const name =
                        ch === 'Email' ? 'notif_email' : ch === 'SMS' ? 'notif_sms' : 'notif_whatsapp';
                      return (
                        <label key={ch} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name={name}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            defaultChecked={ch === 'Email'}
                          />
                          <span className="text-sm text-text-primary">{ch}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    {editingMember ? 'Save Changes' : 'Add Member'}
                  </button>
                  <button
                    type="button"
                    id="cancelModalBtn"
                    className="btn btn-outline"
                    onClick={() => {
                      setAddOpen(false);
                      setEditingMember(null);
                      setNewMember({ name: '', email: '', phone: '', role: '' });
                    }}
                  >
                    Cancel
                  </button>
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
