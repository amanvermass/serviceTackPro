'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MOCK_PROJECTS, MOCK_TEAM, Project, TeamMember } from '@/data/mock-maintenance-data';

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

  // Derived Data
  const filteredProjects = useMemo(() => {
    return MOCK_PROJECTS.filter(project => {
      const matchesSearch = 
        project.client.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.team.some(memberId => MOCK_TEAM.find(m => m.id === memberId)?.name.toLowerCase().includes(filters.search.toLowerCase()));

      const matchesClient = filters.client === 'all' || project.clientId === filters.client;
      const matchesTeam = filters.team.length === 0 || project.team.some(memberId => filters.team.includes(memberId));
      const matchesStatus = filters.status.length === 0 || filters.status.includes(project.status);

      return matchesSearch && matchesClient && matchesTeam && matchesStatus;
    });
  }, [filters]);

  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof Project];
      let bValue: any = b[sortConfig.key as keyof Project];

      if (sortConfig.key === 'amc') {
        aValue = new Date(a.startDate).getTime();
        bValue = new Date(b.startDate).getTime();
      } else if (sortConfig.key === 'changes') {
        aValue = a.freeChanges.used + a.paidChanges;
        bValue = b.freeChanges.used + b.paidChanges;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredProjects, sortConfig]);

  const stats = useMemo(() => {
    return {
      active: MOCK_PROJECTS.filter(p => p.status === 'active').length,
      pending: MOCK_PROJECTS.filter(p => p.status === 'pending').length,
      completedChanges: MOCK_PROJECTS.reduce((acc, p) => acc + p.paidChanges + (p.recentChanges?.length || 0), 0),
      teamMembers: MOCK_TEAM.length
    };
  }, []);

  // Handlers
  const handleSort = (key: keyof Project | 'amc' | 'changes') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getTeamMembers = (memberIds: string[]) => {
    return memberIds.map(id => MOCK_TEAM.find(m => m.id === id)).filter(Boolean) as TeamMember[];
  };

  const getRemainingMonths = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffMonths = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
    return Math.max(0, diffMonths);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const navigateToDetails = (projectId: string) => {
    router.push(`/maintenance-module/${projectId}`);
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
                onClick={() => setIsAddModalOpen(true)}
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
                <option value="techcorp">TechCorp Solutions</option>
                <option value="digital">Digital Innovations</option>
                <option value="greenstart">GreenStart Ventures</option>
                <option value="bluesky">BlueSky Consulting</option>
              </select>
            </div>

            {/* Team Member Filter */}
            <div>
              <MultiSelect
                label="Team Member"
                options={MOCK_TEAM.map(m => ({ value: m.id, label: m.name }))}
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
                      <svg className={`w-4 h-4 text-text-tertiary transition-transform ${sortConfig.key === 'client' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                      </svg>
                    </div>
                  </th>
                  <th 
                    className="cursor-pointer hover:bg-secondary-100 transition-smooth"
                    onClick={() => handleSort('amc')}
                  >
                    <div className="flex items-center gap-2">
                      AMC Period
                      <svg className={`w-4 h-4 text-text-tertiary transition-transform ${sortConfig.key === 'amc' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                      </svg>
                    </div>
                  </th>
                  <th 
                    className="cursor-pointer hover:bg-secondary-100 transition-smooth"
                    onClick={() => handleSort('changes')}
                  >
                    <div className="flex items-center gap-2">
                      Change Counter
                      <svg className={`w-4 h-4 text-text-tertiary transition-transform ${sortConfig.key === 'changes' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                      </svg>
                    </div>
                  </th>
                  <th>Assigned Team</th>
                  <th>Status</th>
                  <th className="flex items-center justify-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedProjects.map(project => (
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
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          project.clientId === 'techcorp' ? 'bg-primary-100 text-primary-700' :
                          project.clientId === 'digital' ? 'bg-accent-100 text-accent-700' :
                          project.clientId === 'greenstart' ? 'bg-success-100 text-success-700' :
                          'bg-secondary-100 text-secondary-700'
                        }`}>
                          <span className="font-semibold text-sm">
                            {project.client.split(' ').map(n => n[0]).join('').substring(0, 2)}
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
                        <p className="font-medium text-text-primary">{formatDate(project.startDate)} - {formatDate(project.endDate)}</p>
                        <p className="text-xs text-text-secondary">{getRemainingMonths(project.endDate)} months remaining</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className={`badge ${project.freeChanges.used >= project.freeChanges.total ? 'badge-error' : 'badge-success'}`}>
                            Free: {project.freeChanges.used}/{project.freeChanges.total}
                          </span>
                          <span className={`badge ${project.paidChanges > 0 ? 'badge-warning' : 'badge-primary'}`}>
                            Paid: {project.paidChanges}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {getTeamMembers(project.team).slice(0, 2).map((member, i) => (
                          <img 
                            key={member.id}
                            src={member.avatar}
                            alt={member.name}
                            className={`w-8 h-8 rounded-full object-cover ${i > 0 ? '-ml-2' : ''}`}
                            onError={(e) => {e.currentTarget.src='https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=2940&auto=format&fit=crop';}}
                          />
                        ))}
                        {project.team.length > 2 && (
                          <span className="text-xs text-text-secondary ml-1">+{project.team.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        project.status === 'active' ? 'badge-success' :
                        project.status === 'pending' ? 'badge-warning' :
                        project.status === 'on-hold' ? 'badge-primary' :
                        'badge-secondary'
                      }`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="p-2 rounded-lg hover:bg-surface-hover transition-smooth" 
                          aria-label="View project details"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToDetails(project.id);
                          }}
                        >
                          <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                        <button className="p-2 rounded-lg hover:bg-surface-hover transition-smooth" aria-label="Edit project">
                          <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button className="p-2 rounded-lg hover:bg-primary-50 transition-smooth" aria-label="Add change request">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
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
      </main>
      
      <Footer />

      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border sticky top-0 bg-surface z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-heading font-bold text-text-primary">Add New Maintenance Project</h3>
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
            
            <form className="p-6 space-y-6" onSubmit={(e) => {
              e.preventDefault();
              alert('Maintenance project added successfully (Mock)');
              setIsAddModalOpen(false);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="clientName" className="input-label">Client Name</label>
                  <input type="text" id="clientName" className="input" placeholder="e.g. TechCorp Solutions" required />
                </div>
                <div>
                  <label htmlFor="projectName" className="input-label">Project Name</label>
                  <input type="text" id="projectName" className="input" placeholder="e.g. Corporate Website AMC" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="input-label">AMC Start Date</label>
                  <input type="date" id="startDate" className="input" required />
                </div>
                <div>
                  <label htmlFor="endDate" className="input-label">AMC End Date</label>
                  <input type="date" id="endDate" className="input" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="freeChanges" className="input-label">Free Changes Limit (Monthly)</label>
                  <input type="number" id="freeChanges" className="input" placeholder="e.g. 5" min="0" required />
                </div>
                <div>
                  <label htmlFor="status" className="input-label">Initial Status</label>
                  <select id="status" className="input" required>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">Assign Team Members</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {MOCK_TEAM.map(member => (
                    <label key={member.id} className="flex items-center gap-2 p-2 border border-border rounded-lg hover:bg-surface-hover cursor-pointer">
                      <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                      <span className="text-sm text-text-primary">{member.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="input-label">Project Notes</label>
                <textarea id="notes" className="input min-h-[100px]" placeholder="Add specific requirements, scope details, or notes..."></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn btn-primary flex-1">Create Project</button>
                <button 
                  type="button" 
                  className="btn btn-outline flex-1"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Workload Panel */}
      {isWorkloadPanelOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-surface w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto animate-slide-left">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-heading font-bold text-text-primary">Team Workload</h3>
              <button 
                onClick={() => setIsWorkloadPanelOpen(false)}
                className="p-2 rounded-lg hover:bg-surface-hover transition-smooth"
              >
                <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {MOCK_TEAM.map(member => {
                const assignedProjects = MOCK_PROJECTS.filter(p => p.team.includes(member.id));
                const activeProjects = assignedProjects.filter(p => p.status === 'active');
                
                return (
                  <div key={member.id} className="border border-border rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-text-primary">{member.name}</p>
                        <p className="text-xs text-text-secondary">{member.role}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Active Projects</span>
                        <span className="font-medium text-text-primary">{activeProjects.length}</span>
                      </div>
                      <div className="w-full bg-secondary-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${activeProjects.length > 3 ? 'bg-warning' : 'bg-primary'}`} 
                          style={{ width: `${Math.min(activeProjects.length * 20, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
