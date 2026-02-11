'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Tooltip from '@/components/Tooltip';
import { MOCK_HOSTING_ACCOUNTS, HostingAccount } from '@/data/mock-hosting-data';

export default function HostingManagement() {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [renewalFilter, setRenewalFilter] = useState('all');

  // Filtered Data
  const filteredAccounts = useMemo(() => {
    return MOCK_HOSTING_ACCOUNTS.filter(account => {
      const matchesSearch = 
        account.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProvider = providerFilter === 'all' || account.provider.toLowerCase() === providerFilter.toLowerCase();
      const matchesServiceType = serviceTypeFilter === 'all' || account.serviceType.toLowerCase() === serviceTypeFilter.toLowerCase();
      
      let matchesRenewal = true;
      if (renewalFilter === 'expiring') matchesRenewal = account.status === 'Expiring Soon';
      if (renewalFilter === 'active') matchesRenewal = account.status === 'Active';
      if (renewalFilter === 'expired') matchesRenewal = account.status === 'Expired';

      return matchesSearch && matchesProvider && matchesServiceType && matchesRenewal;
    });
  }, [searchTerm, providerFilter, serviceTypeFilter, renewalFilter]);

  const handleRowClick = (account: HostingAccount) => {
    router.push(`/hosting-management/${account.id}`);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setProviderFilter('all');
    setServiceTypeFilter('all');
    setRenewalFilter('all');
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      
      {/* Main Content */}
      <main className="flex-grow w-full px-4 md:px-10 py-8 pt-24 md:pt-28">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">Hosting Management</h1>
              <p className="text-text-secondary">Track hosting services, renewal schedules, and vendor coordination</p>
            </div>
            <div className="flex items-center gap-3">
              <button id="bulkRenewalBtn" className="btn btn-outline flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Bulk Renewal
              </button>
              <button 
                id="addHostingBtn" 
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setIsAddModalOpen(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add Hosting
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Hosting Accounts */}
          <div className="card hover-lift p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>
                </svg>
              </div>
              <span className="badge badge-primary">Active</span>
            </div>
            <h3 className="text-2xl font-heading font-bold text-text-primary mb-1">{MOCK_HOSTING_ACCOUNTS.length}</h3>
            <p className="text-sm text-text-secondary">Total Hosting Accounts</p>
          </div>

          {/* Expiring Soon */}
          <div className="card hover-lift p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-warning-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span className="badge badge-warning">30 Days</span>
            </div>
            <h3 className="text-2xl font-heading font-bold text-text-primary mb-1">
              {MOCK_HOSTING_ACCOUNTS.filter(a => a.status === 'Expiring Soon').length}
            </h3>
            <p className="text-sm text-text-secondary">Expiring Soon</p>
          </div>

          {/* Monthly Cost */}
          <div className="card hover-lift p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-success-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span className="text-xs text-success font-medium">+12%</span>
            </div>
            <h3 className="text-2xl font-heading font-bold text-text-primary mb-1">
              ${MOCK_HOSTING_ACCOUNTS.reduce((sum, acc) => sum + acc.monthlyCost, 0).toLocaleString()}
            </h3>
            <p className="text-sm text-text-secondary">Monthly Cost</p>
          </div>

          {/* Bandwidth Usage */}
          <div className="card hover-lift p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <span className="text-xs text-text-secondary">Avg</span>
            </div>
            <h3 className="text-2xl font-heading font-bold text-text-primary mb-1">
              {Math.round(MOCK_HOSTING_ACCOUNTS.reduce((sum, acc) => sum + acc.bandwidthUsage, 0) / MOCK_HOSTING_ACCOUNTS.length)}%
            </h3>
            <p className="text-sm text-text-secondary">Avg Bandwidth Usage</p>
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="card mb-6 p-5">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label htmlFor="searchInput" className="input-label">Search Hosting</label>
              <Tooltip content="Filter by Client, Provider, or Service" position="top" className="w-full">
                <div className="relative">
                  <input 
                    type="text" 
                    id="searchInput" 
                    className="input pl-10 w-full" 
                    placeholder="Search by client, provider, or service..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg className="w-5 h-5 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
              </Tooltip>
            </div>

            {/* Provider Filter */}
            <div>
              <label htmlFor="providerFilter" className="input-label">Hosting Provider</label>
              <select 
                id="providerFilter" 
                className="input w-full"
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
              >
                <option value="all">All Providers</option>
                <option value="aws">AWS</option>
                <option value="digitalocean">DigitalOcean</option>
                <option value="bluehost">Bluehost</option>
                <option value="siteground">SiteGround</option>
                <option value="hostgator">HostGator</option>
              </select>
            </div>

            {/* Service Type Filter */}
            <div>
              <label htmlFor="serviceTypeFilter" className="input-label">Service Type</label>
              <select 
                id="serviceTypeFilter" 
                className="input w-full"
                value={serviceTypeFilter}
                onChange={(e) => setServiceTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="shared">Shared Hosting</option>
                <option value="vps">VPS</option>
                <option value="dedicated">Dedicated Server</option>
                <option value="cloud">Cloud Hosting</option>
              </select>
            </div>

            {/* Renewal Date Filter */}
            <div>
              <label htmlFor="renewalFilter" className="input-label">Renewal Status</label>
              <select 
                id="renewalFilter" 
                className="input w-full"
                value={renewalFilter}
                onChange={(e) => setRenewalFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="expiring">Expiring Soon</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Filter Results Summary & Actions */}
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-text-secondary">
              Showing <span id="resultCount" className="font-semibold text-text-primary">{filteredAccounts.length}</span> hosting accounts
            </p>
            <div className="flex items-center gap-3">
              <button id="vendorComparisonBtn" className="btn btn-outline text-sm h-9 px-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                Compare Vendors
              </button>
              <button id="exportBtn" className="btn btn-outline text-sm h-9 px-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Export
              </button>
              <button 
                id="resetFiltersBtn" 
                className="p-2 rounded-lg hover:bg-surface-hover transition-smooth" 
                aria-label="Reset filters"
                onClick={resetFilters}
              >
                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Hosting Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" id="selectAll" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" aria-label="Select all hosting accounts" />
                  </th>
                  <th className="cursor-pointer hover:bg-secondary-100 transition-smooth" data-sort="client">
                    <div className="flex items-center gap-2">
                      Client Name
                      <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                      </svg>
                    </div>
                  </th>
                  <th className="cursor-pointer hover:bg-secondary-100 transition-smooth" data-sort="provider">
                    <div className="flex items-center gap-2">
                      Provider
                      <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                      </svg>
                    </div>
                  </th>
                  <th className="cursor-pointer hover:bg-secondary-100 transition-smooth" data-sort="type">
                    <div className="flex items-center gap-2">
                      Service Type
                      <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                      </svg>
                    </div>
                  </th>
                  <th className="cursor-pointer hover:bg-secondary-100 transition-smooth" data-sort="renewal">
                    <div className="flex items-center gap-2">
                      Renewal Date
                      <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                      </svg>
                    </div>
                  </th>
                  <th className="cursor-pointer hover:bg-secondary-100 transition-smooth" data-sort="cost">
                    <div className="flex items-center gap-2">
                      Monthly Cost
                      <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                      </svg>
                    </div>
                  </th>
                  <th>Bandwidth</th>
                  <th>Status</th>
                  <th className="flex items-center justify-end">Actions</th>
                </tr>
              </thead>
              <tbody id="hostingTableBody">
                {filteredAccounts.map((account) => (
                  <tr 
                    key={account.id}
                    className="cursor-pointer hover:bg-surface-hover transition-smooth hosting-row"
                    onClick={() => handleRowClick(account)}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary row-checkbox" aria-label="Select hosting account" />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-700 font-semibold text-sm">{account.clientInitials}</span>
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{account.clientName}</p>
                          <p className="text-xs text-text-secondary">{account.clientDomain}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <img src={account.providerLogo} alt={account.provider} className="w-5 h-5 object-contain" />
                        <span className="text-text-primary">{account.provider}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{account.serviceType}</span>
                    </td>
                    <td>
                      <p className="text-text-primary">{new Date(account.renewalDate).toLocaleDateString()}</p>
                      <p className={`text-xs ${account.daysLeft < 30 ? 'text-warning font-medium' : 'text-text-tertiary'}`}>
                        {account.daysLeft} days left
                      </p>
                    </td>
                    <td className="font-medium text-text-primary">
                      ${account.monthlyCost.toFixed(2)}
                    </td>
                    <td>
                      <div className="w-full max-w-[120px]">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-secondary">{account.bandwidthUsage}%</span>
                        </div>
                        <div className="w-full bg-secondary-100 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${account.bandwidthUsage > 80 ? 'bg-warning' : 'bg-primary'}`} 
                            style={{ width: `${account.bandwidthUsage}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-text-tertiary mt-1 truncate">{account.bandwidthLabel}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        account.status === 'Active' ? 'badge-success' : 
                        account.status === 'Expiring Soon' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {account.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button className="p-2 rounded-lg hover:bg-surface-hover text-text-secondary transition-smooth" title="View Details">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="p-2 rounded-lg hover:bg-surface-hover text-text-secondary transition-smooth" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
        {/* Add Hosting Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border sticky top-0 bg-surface z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-heading font-bold text-text-primary">Add New Hosting Account</h3>
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
                alert('Hosting account added successfully (Mock)');
                setIsAddModalOpen(false);
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="clientName" className="input-label">Client Name</label>
                    <input type="text" id="clientName" className="input" placeholder="e.g. TechCorp Solutions" required />
                  </div>
                  <div>
                    <label htmlFor="clientDomain" className="input-label">Domain</label>
                    <input type="text" id="clientDomain" className="input" placeholder="e.g. techcorp.io" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="provider" className="input-label">Provider</label>
                    <select id="provider" className="input" required>
                      <option value="">Select Provider...</option>
                      <option value="AWS">AWS</option>
                      <option value="DigitalOcean">DigitalOcean</option>
                      <option value="Bluehost">Bluehost</option>
                      <option value="SiteGround">SiteGround</option>
                      <option value="HostGator">HostGator</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="serviceType" className="input-label">Service Type</label>
                    <select id="serviceType" className="input" required>
                      <option value="">Select Type...</option>
                      <option value="Cloud Hosting">Cloud Hosting</option>
                      <option value="VPS">VPS</option>
                      <option value="Shared Hosting">Shared Hosting</option>
                      <option value="Dedicated Server">Dedicated Server</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="renewalDate" className="input-label">Renewal Date</label>
                    <input type="date" id="renewalDate" className="input" required />
                  </div>
                  <div>
                    <label htmlFor="monthlyCost" className="input-label">Monthly Cost ($)</label>
                    <input type="number" id="monthlyCost" className="input" placeholder="0.00" min="0" step="0.01" required />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="input-label">Notes / Features</label>
                  <textarea id="notes" className="input min-h-[100px]" placeholder="Add server details, features, or other notes..."></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">Add Account</button>
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
      </main>
    </div>
  );
}
