'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Project } from '@/data/mock-maintenance-data';
import TableShimmer from '@/components/TableShimmer';
import { toast } from 'react-hot-toast';

// Helper Component: MultiSelect
const MultiSelect = ({ 
  label, 
  options, 
  selected, 
  onChange 
}: { 
  label: string; 
  options: { value: string; label: string }[]; 
  selected: string[]; 
  onChange: (value: string[]) => void; 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="input-label">{label}</label>
      <div 
        className="input flex items-center justify-between cursor-pointer bg-white pr-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate text-sm flex-1">
          {selected.length === 0 
            ? `All ${label}s` 
            : selected.length === options.length 
              ? `All ${label}s` 
              : `${selected.length} Selected`}
        </span>
        
        <div className="flex items-center gap-1">
          {selected.length > 0 && (
            <button
              type="button"
              className="p-1 hover:bg-secondary-100 rounded-full text-text-tertiary hover:text-text-primary transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              aria-label="Clear selection"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg className={`w-4 h-4 text-text-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map(option => (
            <div 
              key={option.value}
              className="flex items-center px-3 py-2 hover:bg-surface-hover cursor-pointer"
              onClick={() => toggleOption(option.value)}
            >
              <div className={`w-4 h-4 mr-2 border rounded flex items-center justify-center transition-colors ${selected.includes(option.value) ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                {selected.includes(option.value) && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-text-primary">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function MaintenanceModule() {
  const router = useRouter();
  // State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWorkloadPanelOpen, setIsWorkloadPanelOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const [filters, setFilters] = useState({
    search: '',
    client: 'all',
    team: [] as string[],
    status: [] as string[]
  });

  const [sortConfig, setSortConfig] = useState<{ key: keyof Project | 'amc' | 'changes'; direction: 'asc' | 'desc' }>({
    key: 'client',
    direction: 'asc'
  });

  // Fetch Projects
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
      const token = localStorage.getItem('token');

      const params = new URLSearchParams();
      if (filters.search.trim()) {
        params.append('search', filters.search.trim());
      }
      if (filters.status.length === 1) {
        const statusValue = filters.status[0] === 'on-hold' ? 'onhold' : filters.status[0];
        params.append('status', statusValue);
      }

      const url = `${baseUrl}/api/maintenance${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.data || []);

        const mappedData: Project[] = items.map((item: any) => ({
          id: item._id,
          client: item.clientName?.name || item.client || 'Unknown Client',
          clientId: item.clientName?._id,
          name: item.projectName || item.name || 'Maintenance Project',
          type: 'website',
          startDate: item.amcStartDate || item.startDate,
          endDate: item.amcEndDate || item.endDate,
          monthlyValue: item.monthlyValue ?? 0,
          freeChanges: { used: 0, total: item.freeChangesLimit ?? 0 },
          paidChanges: 0,
          team: Array.isArray(item.assignedMembers) ? item.assignedMembers.map((m: any) => m._id) : [],
          status: item.status === 'onhold' ? 'on-hold' : (item.status || 'active'),
          notes: '',
          recentChanges: []
        }));
        setProjects(mappedData);
      } else {
        console.error('Failed to fetch projects');
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    setIsStatsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
      const token = localStorage.getItem('token');

      const response = await fetch(`${baseUrl}/api/maintenance/maintenance-stats`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const data = await response.json();
        const statsData = data.data || data;
        setStatsFromApi({
          activeProjects: statsData.activeProjects ?? 0,
          teamMembers: statsData.teamMembers ?? 0
        });
      }
    } catch (error) {
      console.error('Error fetching maintenance stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
      const token = localStorage.getItem('token');

      const response = await fetch(`${baseUrl}/api/teams`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.data || []);
        const mapped = items.map((item: any) => ({
          id: item._id,
          name: item.name
        }));
        setTeamMembers(mapped);
      } else {
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
      const response = await fetch(`${baseUrl}/api/clients?limit=100`, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.data || []);
        const mapped = items.map((item: any) => ({
          id: item._id,
          name: item.company || item.name
        }));
        setClients(mapped);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filters.search, filters.status]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    fetchClients();
  }, []);

  // Derived Data
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = 
        project.client.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.team.some(memberId => {
          const member = teamMembers.find(m => m.id === memberId);
          return member ? member.name.toLowerCase().includes(filters.search.toLowerCase()) : false;
        });

      const matchesClient = filters.client === 'all' || project.clientId === filters.client || project.client === filters.client; // Relaxed check
      const matchesTeam = filters.team.length === 0 || project.team.some(memberId => filters.team.includes(memberId));
      const matchesStatus = filters.status.length === 0 || filters.status.includes(project.status);

      return matchesSearch && matchesClient && matchesTeam && matchesStatus;
    });
  }, [filters, projects]);

  const [statsFromApi, setStatsFromApi] = useState<{ activeProjects: number; teamMembers: number } | null>(null);

  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof Project];
      let bValue: any = b[sortConfig.key as keyof Project];

      if (sortConfig.key === 'amc') {
        aValue = new Date(a.startDate).getTime();
        bValue = new Date(b.startDate).getTime();
      } else if (sortConfig.key === 'changes') {
        aValue = (a.freeChanges?.used || 0) + (a.paidChanges || 0);
        bValue = (b.freeChanges?.used || 0) + (b.paidChanges || 0);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredProjects, sortConfig]);

  const stats = useMemo(() => {
    const activeComputed = projects.filter(p => p.status === 'active').length;
    const completedChangesComputed = projects.reduce(
      (acc, p) => acc + (p.paidChanges || 0) + (p.recentChanges?.length || 0),
      0
    );
    const teamMembersComputed = teamMembers.length;

    return {
      active: statsFromApi?.activeProjects ?? activeComputed,
      pending: projects.filter(p => p.status === 'pending').length,
      completedChanges: completedChangesComputed,
      teamMembers: statsFromApi?.teamMembers ?? teamMembersComputed
    };
  }, [projects, statsFromApi, teamMembers]);

  // Handlers
  const handleSort = (key: keyof Project | 'amc' | 'changes') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getTeamMembers = (memberIds: string[]) => {
    return memberIds.map(id => teamMembers.find(m => m.id === id)).filter(Boolean) as { id: string; name: string }[];
  };

  const getRemainingMonths = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffMonths = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
    return Math.max(0, diffMonths);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const navigateToDetails = (projectId: string) => {
    router.push(`/maintenance-module/${projectId}`);
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setIsAddModalOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this maintenance project?');
    if (!confirmDelete) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
      const token = localStorage.getItem('token');

      const response = await fetch(`${baseUrl}/api/maintenance/${projectId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        toast.success('Project deleted successfully');
        fetchProjects();
      } else {
        toast.error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Error connecting to server');
    }
  };

  const handleSaveProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Collect team members
    const selectedTeamMembers: string[] = [];
    teamMembers.forEach((member) => {
      if ((formData.get(`team_${member.id}`) as string) === 'on') {
        selectedTeamMembers.push(member.id);
      }
    });

    const clientId = formData.get('clientName') as string;
    const rawStatus = (formData.get('status') as string) || 'active';
    const apiStatus = rawStatus === 'on-hold' ? 'onhold' : rawStatus;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
      const token = localStorage.getItem('token');
      
      let response;
      if (editingProject) {
        const updatePayload = {
          clientName: clientId,
          projectName: formData.get('projectName'),
          monthlyValue: Number(formData.get('monthlyValue')),
          status: apiStatus
        };

        response = await fetch(`${baseUrl}/api/maintenance/${editingProject.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(updatePayload)
        });
      } else {
        const createPayload = {
          clientName: clientId,
          projectName: formData.get('projectName'),
          amcStartDate: formData.get('startDate'),
          amcEndDate: formData.get('endDate'),
          monthlyValue: Number(formData.get('monthlyValue')),
          freeChangesLimit: Number(formData.get('freeChangesTotal')),
          status: apiStatus,
          assignedMembers: selectedTeamMembers
        };

        response = await fetch(`${baseUrl}/api/maintenance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(createPayload)
        });
      }

      if (response.ok) {
        toast.success(editingProject ? 'Project updated successfully' : 'Project added successfully');
        setIsAddModalOpen(false);
        setEditingProject(null);
        fetchProjects();
      } else {
        toast.error('Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Error connecting to server');
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      
      {/* Main Content */}
      <main className="flex-grow w-full px-10 py-[2vh]">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">Maintenance Module</h1>
              <p className="text-text-secondary">Track AMC projects, manage change requests, and monitor team workload distribution</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsWorkloadPanelOpen(true)}
                className="btn btn-outline flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                Team Workload
              </button>
              <button 
                onClick={() => {
                  setEditingProject(null);
                  setIsAddModalOpen(true);
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add Project
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {isStatsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="card">
                <div className="flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 rounded-lg bg-secondary-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-secondary-100 rounded w-16" />
                    <div className="h-3 bg-secondary-100 rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-text-primary">{stats.active}</p>
                  <p className="text-sm text-text-secondary">Active Projects</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-warning-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-text-primary">{stats.pending}</p>
                  <p className="text-sm text-text-secondary">Pending Changes</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-success-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-text-primary">{stats.completedChanges}</p>
                  <p className="text-sm text-text-secondary">Completed Changes</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-text-primary">{stats.teamMembers}</p>
                  <p className="text-sm text-text-secondary">Team Members</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label htmlFor="searchInput" className="input-label">Search Projects</label>
              <div className="relative">
                <input 
                  type="text" 
                  id="searchInput" 
                  className="input pl-10" 
                  placeholder="Search by client, project, or team member..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
                <svg className="w-5 h-5 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
            </div>

            {/* Client Filter */}
            <div>
              <label htmlFor="clientFilter" className="input-label">Client</label>
              <select 
                id="clientFilter" 
                className="input"
                value={filters.client}
                onChange={(e) => setFilters(prev => ({ ...prev, client: e.target.value }))}
              >
                <option value="all">All Clients</option>
                {Array.from(
                  new Map(
                    projects.map((p) => [p.clientId || p.client, p.client])
                  ).entries()
                ).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Team Member Filter */}
            <div>
              <MultiSelect
                label="Team Member"
                options={teamMembers.map((m) => ({ value: m.id, label: m.name }))}
                selected={filters.team}
                onChange={(value) => setFilters(prev => ({ ...prev, team: value }))}
              />
            </div>

            {/* Status Filter */}
            <div>
              <MultiSelect
                label="Status"
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'on-hold', label: 'On Hold' }
                ]}
                selected={filters.status}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              />
            </div>
          </div>

          {/* Filter Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Showing <span className="font-semibold text-text-primary">{filteredProjects.length}</span> projects
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setFilters({ search: '', client: 'all', team: [], status: [] })}
                className="btn btn-ghost text-sm h-9 px-4"
              >
                Reset Filters
              </button>
              <button className="btn btn-outline text-sm h-9 px-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="table">
                <tbody>
                  <TableShimmer columns={6} rows={8} />
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th
                      className="cursor-pointer hover:bg-secondary-100 transition-smooth"
                      onClick={() => handleSort('client')}
                    >
                      <div className="flex items-center gap-2">
                        Client & Project
                        <svg
                          className={`w-4 h-4 text-text-tertiary transition-transform ${
                            sortConfig.key === 'client' && sortConfig.direction === 'desc'
                              ? 'rotate-180'
                              : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                          />
                        </svg>
                      </div>
                    </th>
                    <th
                      className="cursor-pointer hover:bg-secondary-100 transition-smooth"
                      onClick={() => handleSort('amc')}
                    >
                      <div className="flex items-center gap-2">
                        AMC Period
                        <svg
                          className={`w-4 h-4 text-text-tertiary transition-transform ${
                            sortConfig.key === 'amc' && sortConfig.direction === 'desc'
                              ? 'rotate-180'
                              : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                          />
                        </svg>
                      </div>
                    </th>
                    <th
                      className="cursor-pointer hover:bg-secondary-100 transition-smooth"
                      onClick={() => handleSort('changes')}
                    >
                      <div className="flex items-center gap-2">
                        Change Counter
                        <svg
                          className={`w-4 h-4 text-text-tertiary transition-transform ${
                            sortConfig.key === 'changes' && sortConfig.direction === 'desc'
                              ? 'rotate-180'
                              : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                          />
                        </svg>
                      </div>
                    </th>
                    <th>Assigned Team</th>
                    <th>Status</th>
                    <th className="flex items-center justify-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProjects.map((project) => (
                    <tr
                      key={project.id}
                      className="cursor-pointer hover:bg-surface-hover transition-smooth"
                      onClick={(e) => {
                        if (!(e.target as HTMLElement).closest('button')) {
                          navigateToDetails(project.id);
                        }
                      }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              project.clientId === 'techcorp'
                                ? 'bg-primary-100 text-primary-700'
                                : project.clientId === 'digital'
                                ? 'bg-accent-100 text-accent-700'
                                : project.clientId === 'greenstart'
                                ? 'bg-success-100 text-success-700'
                                : 'bg-secondary-100 text-secondary-700'
                            }`}
                          >
                            <span className="font-semibold text-sm">
                              {project.client
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .substring(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">{project.client}</p>
                            <p className="text-xs text-text-secondary">{project.name}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-text-primary">
                            {formatDate(project.startDate)} - {formatDate(project.endDate)}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {getRemainingMonths(project.endDate)} months remaining
                          </p>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span
                              className={`badge ${
                                (project.freeChanges?.used || 0) >= (project.freeChanges?.total || 0)
                                  ? 'badge-error'
                                  : 'badge-success'
                              }`}
                            >
                              Free: {project.freeChanges?.used || 0}/{project.freeChanges?.total || 0}
                            </span>
                            <span
                              className={`badge ${
                                (project.paidChanges || 0) > 0 ? 'badge-warning' : 'badge-primary'
                              }`}
                            >
                              Paid: {project.paidChanges || 0}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {getTeamMembers(project.team).map((member) => (
                            <span
                              key={member.id}
                              className="px-2 py-0.5 rounded-full bg-secondary-100 text-xs text-text-primary"
                            >
                              {member.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            project.status === 'active'
                              ? 'badge-success'
                              : project.status === 'pending'
                              ? 'badge-warning'
                              : project.status === 'on-hold'
                              ? 'badge-primary'
                              : 'badge-secondary'
                          }`}
                        >
                          {project.status.charAt(0).toUpperCase() +
                            project.status.slice(1).replace('-', ' ')}
                        </span>
                      </td>
                      <td>
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="p-2 rounded-lg hover:bg-surface-hover transition-smooth"
                            aria-label="Edit project"
                            onClick={() => handleEditClick(project)}
                          >
                            <svg
                              className="w-5 h-5 text-text-secondary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-error-50 transition-smooth"
                            aria-label="Delete project"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <svg
                              className="w-5 h-5 text-error"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      
      <Footer />

      {/* Add/Edit Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border sticky top-0 bg-surface z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-heading font-bold text-text-primary">
                  {editingProject ? 'Edit Maintenance Project' : 'Add New Maintenance Project'}
                </h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-surface-hover transition-smooth"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <form className="p-6 space-y-6" onSubmit={handleSaveProject}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="clientName" className="input-label">Client</label>
                  <select
                    id="clientName"
                    name="clientName"
                    className="input"
                    defaultValue={editingProject?.clientId || ''}
                    required
                  >
                    <option value="" disabled>
                      Select client
                    </option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="projectName" className="input-label">Project Name</label>
                  <input 
                    type="text" 
                    id="projectName" 
                    name="projectName"
                    className="input" 
                    placeholder="e.g. Corporate Website AMC" 
                    defaultValue={editingProject?.name || ''}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="input-label">AMC Start Date</label>
                  <input 
                    type="date" 
                    id="startDate" 
                    name="startDate"
                    className="input" 
                    defaultValue={editingProject?.startDate ? new Date(editingProject.startDate).toISOString().split('T')[0] : ''}
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="input-label">AMC End Date</label>
                  <input 
                    type="date" 
                    id="endDate" 
                    name="endDate"
                    className="input" 
                    defaultValue={editingProject?.endDate ? new Date(editingProject.endDate).toISOString().split('T')[0] : ''}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="monthlyValue" className="input-label">Monthly Value</label>
                  <input 
                    type="number" 
                    id="monthlyValue" 
                    name="monthlyValue"
                    className="input" 
                    placeholder="e.g. 2500" 
                    min="0" 
                    defaultValue={editingProject?.monthlyValue || ''}
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="status" className="input-label">Status</label>
                  <select 
                    id="status" 
                    name="status"
                    className="input" 
                    defaultValue={editingProject?.status || 'active'}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="freeChangesTotal" className="input-label">Free Changes Limit (Monthly)</label>
                  <input 
                    type="number" 
                    id="freeChangesTotal" 
                    name="freeChangesTotal"
                    className="input" 
                    placeholder="e.g. 5" 
                    min="0" 
                    defaultValue={editingProject?.freeChanges?.total || 5}
                    required 
                  />
                </div>
                {editingProject && (
                  <div>
                    <label htmlFor="freeChangesUsed" className="input-label">Used Free Changes</label>
                    <input 
                      type="number" 
                      id="freeChangesUsed" 
                      name="freeChangesUsed"
                      className="input" 
                      min="0" 
                      defaultValue={editingProject?.freeChanges?.used || 0}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="input-label">Assign Team Members</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {teamMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-2 p-2 border border-border rounded-lg hover:bg-surface-hover cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name={`team_${member.id}`}
                        className="w-4 h-4 border border-border accent-primary focus:ring-0"
                        defaultChecked={editingProject?.team.includes(member.id)}
                      />
                      <span className="text-sm text-text-primary">
                        {member.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>


              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  {editingProject ? 'Save Changes' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
