
'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MOCK_DOMAINS, Domain } from '@/data/mock-domain-data';

export default function DomainManagement() {
  const router = useRouter();
  const [domains, setDomains] = useState<Domain[]>(MOCK_DOMAINS);
  const [isAddDomainModalOpen, setIsAddDomainModalOpen] = useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(true);
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Selection State
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: keyof Domain; direction: 'asc' | 'desc' } | null>(null);

  // Derived State: Filtered & Sorted Domains
  const filteredDomains = useMemo(() => {
    let result = [...domains];

    // Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(query) || 
        d.client.toLowerCase().includes(query)
      );
    }
    if (clientFilter !== 'all') {
      // Simple mapping for mock data
      const clientMap: Record<string, string> = {
        'techcorp': 'TechCorp Solutions',
        'digital': 'Digital Innovations Inc',
        'greenstart': 'GreenStart Ventures',
        'bluesky': 'BlueSky Consulting'
      };
      if (clientMap[clientFilter]) {
        result = result.filter(d => d.client === clientMap[clientFilter]);
      }
    }
    if (vendorFilter !== 'all') {
      result = result.filter(d => d.vendor.toLowerCase().includes(vendorFilter.toLowerCase()));
    }
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }

    // Sort
    if (sortConfig) {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        const valA = a[key];
        const valB = b[key];
        if (valA === valB) return 0;
        if (valA === undefined) return 1;
        if (valB === undefined) return -1;

        if (valA < valB) {
          return direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [domains, searchQuery, clientFilter, vendorFilter, statusFilter, sortConfig]);

  // Handlers
  const handleSort = (key: keyof Domain) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    console.log('Sorting by:', key, direction);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDomains(new Set(filteredDomains.map(d => d.id)));
    } else {
      setSelectedDomains(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedDomains);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDomains(newSelected);
  };

  const handleRowClick = (domain: Domain) => {
    router.push(`/domain-management/${domain.id}`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setClientFilter('all');
    setVendorFilter('all');
    setStatusFilter('all');
    console.log('Filters reset');
  };

  const handleBulkRenewal = () => {
    if (selectedDomains.size === 0) {
      alert('Please select at least one domain for bulk renewal');
      return;
    }
    console.log('Processing bulk renewal for domains:', Array.from(selectedDomains));
    alert(`Processing bulk renewal for ${selectedDomains.size} domains`);
  };

  const handleExport = () => {
    console.log('Exporting domain data...');
    alert('Exporting domain data...');
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to API
    alert('Domain added successfully! (Mock)');
    setIsAddDomainModalOpen(false);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'expiring': return 'badge-warning';
      case 'expired': return 'badge-danger';
      case 'renewed': return 'badge-primary';
      default: return 'badge-secondary';
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
              <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">Domain Management</h1>
              <p className="text-text-secondary">Track domain renewals, manage vendors, and automate expiry notifications</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                id="bulkRenewalBtn" 
                className="btn btn-outline flex items-center gap-2"
                onClick={handleBulkRenewal}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Bulk Renewal
              </button>
              <button 
                id="addDomainBtn" 
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setIsAddDomainModalOpen(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Domain
              </button>
            </div>
          </div>
        </div>

        {/* Alert Banner for Expiring Domains */}
        {isAlertVisible && (
          <div id="expiryAlertBanner" className="card mb-6 border-l-4 border-warning bg-warning-50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-warning" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-warning-700 mb-1">Renewal Alerts</h3>
                <p className="text-sm text-warning-700 mb-3">
                  <span id="expiringCount" className="font-bold">3 domains</span> expiring within 30 days •
                  <span id="expiredCount" className="font-bold"> 1 domain</span> already expired
                </p>
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-warning h-9 px-4 text-sm">
                    View Expiring Domains
                  </button>
                  <button className="btn btn-outline h-9 px-4 text-sm border-warning-600 text-warning-700 hover:bg-warning-100">
                    Send Notifications
                  </button>
                </div>
              </div>
              <button 
                id="closeAlertBtn" 
                className="flex-shrink-0 p-1 rounded-lg hover:bg-warning-100 transition-smooth" 
                aria-label="Close alert"
                onClick={() => setIsAlertVisible(false)}
              >
                <svg className="w-5 h-5 text-warning-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label htmlFor="searchInput" className="input-label">Search Domains</label>
              <div className="relative">
                <input 
                  type="text" 
                  id="searchInput" 
                  className="input pl-10" 
                  placeholder="Search by domain name or client..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="w-5 h-5 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Client Filter */}
            <div>
              <label htmlFor="clientFilter" className="input-label">Client</label>
              <select 
                id="clientFilter" 
                className="input"
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
              >
                <option value="all">All Clients</option>
                <option value="techcorp">TechCorp Solutions</option>
                <option value="digital">Digital Innovations Inc</option>
                <option value="greenstart">GreenStart Ventures</option>
                <option value="bluesky">BlueSky Consulting</option>
              </select>
            </div>

            {/* Vendor Filter */}
            <div>
              <label htmlFor="vendorFilter" className="input-label">Vendor</label>
              <select 
                id="vendorFilter" 
                className="input"
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
              >
                <option value="all">All Vendors</option>
                <option value="godaddy">GoDaddy</option>
                <option value="namecheap">Namecheap</option>
                <option value="cloudflare">Cloudflare</option>
                <option value="google">Google Domains</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="statusFilter" className="input-label">Renewal Status</label>
              <select 
                id="statusFilter" 
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expiring">Expiring Soon</option>
                <option value="expired">Expired</option>
                <option value="renewed">Recently Renewed</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="mt-4 pt-4 border-t border-border">
            <button 
              id="advancedFiltersBtn" 
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-700 transition-smooth"
              onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Advanced Filters
              <svg 
                className={`w-4 h-4 transition-transform ${isAdvancedFiltersOpen ? 'rotate-180' : ''}`} 
                id="advancedFiltersIcon" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Advanced Filters Panel */}
            {isAdvancedFiltersOpen && (
              <div id="advancedFiltersPanel" className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="expiryFromDate" className="input-label">Expiry From</label>
                  <input type="date" id="expiryFromDate" className="input" />
                </div>
                <div>
                  <label htmlFor="expiryToDate" className="input-label">Expiry To</label>
                  <input type="date" id="expiryToDate" className="input" />
                </div>
                <div>
                  <label htmlFor="costRange" className="input-label">Cost Range</label>
                  <select id="costRange" className="input">
                    <option value="all">All Costs</option>
                    <option value="0-15">$0 - $15</option>
                    <option value="15-30">$15 - $30</option>
                    <option value="30-50">$30 - $50</option>
                    <option value="50+">$50+</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Filter Results Summary */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-text-secondary">
              Showing <span id="resultCount" className="font-semibold text-text-primary">{filteredDomains.length}</span> domains
            </p>
            <div className="flex items-center gap-2">
              <button 
                id="resetFiltersBtn" 
                className="btn btn-ghost text-sm h-9 px-4 flex items-center gap-2"
                onClick={handleResetFilters}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
              <button 
                id="exportBtn" 
                className="btn btn-outline text-sm h-9 px-4 flex items-center gap-2"
                onClick={handleExport}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Domains Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-12">
                    <input 
                      type="checkbox" 
                      id="selectAll" 
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary" 
                      aria-label="Select all domains" 
                      checked={filteredDomains.length > 0 && selectedDomains.size === filteredDomains.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="cursor-pointer hover:bg-secondary-100 transition-smooth" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-2">
                      Domain Name
                      <svg className={`w-4 h-4 text-text-tertiary transition-transform ${sortConfig?.key === 'name' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="cursor-pointer hover:bg-secondary-100 transition-smooth" onClick={() => handleSort('client')}>
                    <div className="flex items-center gap-2">
                      Client
                      <svg className={`w-4 h-4 text-text-tertiary transition-transform ${sortConfig?.key === 'client' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="cursor-pointer hover:bg-secondary-100 transition-smooth" onClick={() => handleSort('expiryDate')}>
                    <div className="flex items-center gap-2">
                      Expiry Date
                      <svg className={`w-4 h-4 text-text-tertiary transition-transform ${sortConfig?.key === 'expiryDate' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="cursor-pointer hover:bg-secondary-100 transition-smooth" onClick={() => handleSort('vendor')}>
                    <div className="flex items-center gap-2">
                      Vendor
                      <svg className={`w-4 h-4 text-text-tertiary transition-transform ${sortConfig?.key === 'vendor' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="cursor-pointer hover:bg-secondary-100 transition-smooth" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2">
                      Status
                      <svg className={`w-4 h-4 text-text-tertiary transition-transform ${sortConfig?.key === 'status' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="cursor-pointer hover:bg-secondary-100 transition-smooth" onClick={() => handleSort('cost')}>
                    <div className="flex items-center gap-2">
                      Cost
                      <svg className={`w-4 h-4 text-text-tertiary transition-transform ${sortConfig?.key === 'cost' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="w-16">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDomains.map((domain) => (
                  <tr 
                    key={domain.id} 
                    className="hover:bg-surface-hover transition-smooth group cursor-pointer"
                    onClick={() => handleRowClick(domain)}
                  >
                    <td className="w-12" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary" 
                        checked={selectedDomains.has(domain.id)}
                        onChange={() => handleSelectRow(domain.id)}
                      />
                    </td>
                    <td>
                      <div>
                        <span className="font-semibold text-text-primary block">{domain.name}</span>
                        <a 
                          href={`https://${domain.name}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Visit Site
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span className="text-text-primary block">{domain.client}</span>
                        <span className="text-xs text-text-tertiary">{domain.contact}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span className="text-text-primary block">{new Date(domain.expiryDate).toLocaleDateString()}</span>
                        <span className={`text-xs font-medium ${
                          domain.daysRemaining < 0 ? 'text-danger' : 
                          domain.daysRemaining < 30 ? 'text-warning-700' : 'text-success-700'
                        }`}>
                          {domain.expiryStatus}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                        {domain.vendor}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(domain.status)}`}>
                        {domain.status.charAt(0).toUpperCase() + domain.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <span className="text-text-primary font-medium">${domain.cost.toFixed(2)}</span>
                        {domain.autoRenew && (
                          <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <title>Auto-renew enabled</title>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-text-tertiary hover:text-primary transition-colors" title="Edit">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button className="p-1 text-text-tertiary hover:text-primary transition-colors" title="More Options">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredDomains.length === 0 && (
            <div className="p-8 text-center text-text-secondary">
              No domains found matching your filters.
            </div>
          )}

          {/* Pagination (Static Mock) */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              Showing 1 to {filteredDomains.length} of {filteredDomains.length} entries
            </div>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded border border-border text-text-secondary hover:bg-surface-hover disabled:opacity-50" disabled>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white font-medium">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-border text-text-secondary hover:bg-surface-hover">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-border text-text-secondary hover:bg-surface-hover">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Add Domain Modal */}
        {isAddDomainModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-xl font-heading font-bold text-text-primary">Add New Domain</h3>
                <button 
                  onClick={() => setIsAddDomainModalOpen(false)}
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="addDomainForm" className="space-y-4" onSubmit={handleAddDomain}>
                  <div>
                    <label htmlFor="domainName" className="input-label">Domain Name</label>
                    <input type="text" id="domainName" className="input" placeholder="e.g. example.com" required />
                  </div>
                  
                  <div>
                    <label htmlFor="clientSelect" className="input-label">Client</label>
                    <select id="clientSelect" className="input">
                      <option value="">Select Client...</option>
                      <option value="techcorp">TechCorp Solutions</option>
                      <option value="digital">Digital Innovations Inc</option>
                      <option value="greenstart">GreenStart Ventures</option>
                      <option value="bluesky">BlueSky Consulting</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="vendorSelect" className="input-label">Registrar</label>
                      <select id="vendorSelect" className="input">
                        <option value="godaddy">GoDaddy</option>
                        <option value="namecheap">Namecheap</option>
                        <option value="cloudflare">Cloudflare</option>
                        <option value="google">Google Domains</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="expiryDate" className="input-label">Expiry Date</label>
                      <input type="date" id="expiryDate" className="input" required />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cost" className="input-label">Annual Cost ($)</label>
                      <input type="number" id="cost" className="input" placeholder="0.00" min="0" step="0.01" />
                    </div>
                    <div className="flex items-center pt-8">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                        <span className="text-text-primary">Auto-renew enabled</span>
                      </label>
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-border flex justify-end gap-3 bg-secondary-50 rounded-b-2xl">
                <button 
                  type="button"
                  onClick={() => setIsAddDomainModalOpen(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="addDomainForm"
                  className="btn btn-primary"
                >
                  Add Domain
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
