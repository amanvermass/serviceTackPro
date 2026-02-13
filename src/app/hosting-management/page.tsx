'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Tooltip from '@/components/Tooltip';
import { HostingAccount } from '@/data/mock-hosting-data';
import { toast } from 'react-hot-toast';
import TableShimmer from '@/components/TableShimmer';

export default function HostingManagement() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<HostingAccount | null>(null);
  const [hostingAccounts, setHostingAccounts] = useState<HostingAccount[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [renewalFilter, setRenewalFilter] = useState('all');


  // Fetch providers and service types on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const token = localStorage.getItem('token');
        
        // Fetch providers
        try {
          const providersResponse = await fetch(`${apiUrl}/api/master/provider`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (providersResponse.ok) {
            const providersData = await providersResponse.json();
            setProviders(Array.isArray(providersData) ? providersData : (providersData.data || []));
          }
        } catch (e) {
           console.error('Error fetching providers:', e);
           setProviders([]);
        }
        
        // Fetch service types
        try {
          const serviceTypesResponse = await fetch(`${apiUrl}/api/master/service-type`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (serviceTypesResponse.ok) {
            const serviceTypesData = await serviceTypesResponse.json();
            setServiceTypes(Array.isArray(serviceTypesData) ? serviceTypesData : (serviceTypesData.data || []));
          }
        } catch (e) {
          console.error('Error fetching service types:', e);
          setServiceTypes([]);
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };
    
    fetchMetadata();
  }, []);

  // Fetch hosting accounts when filters change
  useEffect(() => {
    const fetchHostingAccounts = async () => {
      setIsLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const token = localStorage.getItem('token');
        
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (providerFilter && providerFilter !== 'all') params.append('provider', providerFilter);
        if (serviceTypeFilter && serviceTypeFilter !== 'all') params.append('serviceType', serviceTypeFilter);
        if (renewalFilter && renewalFilter !== 'all') params.append('status', renewalFilter);

        const response = await fetch(`${apiUrl}/api/hosting?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
           const data = await response.json();
           // Map API data to HostingAccount interface
           const items = Array.isArray(data) ? data : (data.data || []);
           const mappedData = items.map((item: any) => ({
             id: item._id,
             clientName: item.clientName,
             domain: item.domain,
             clientDomain: item.domain, // Compatibility
             clientInitials: item.clientName ? item.clientName.substring(0, 2).toUpperCase() : '??',
             provider: item.provider,
             serviceType: item.serviceType,
             renewalDate: item.renewalDate,
             monthlyCost: item.monthlyCost,
             notes: item.notes,
             // Computed/Default values for UI
             daysLeft: Math.ceil((new Date(item.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
             status: new Date(item.renewalDate) < new Date() ? 'Expired' : (new Date(item.renewalDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 ? 'Expiring Soon' : 'Active'),
             bandwidthUsage: 0,
             bandwidthLabel: 'N/A',
             diskUsage: 0,
             diskLabel: 'N/A',
             providerLogo: '',
             serverInfo: {},
             features: item.notes ? [item.notes] : [],
             recentActivity: []
           }));
           setHostingAccounts(mappedData);
        }
      } catch (error) {
         console.error('Error fetching hosting accounts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchHostingAccounts();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, providerFilter, serviceTypeFilter, renewalFilter]);


  // Helper to safely get string value from potentially object fields
  const getProviderName = (provider: any) => typeof provider === 'object' && provider !== null ? provider.name : provider;
  const getServiceTypeName = (type: any) => typeof type === 'object' && type !== null ? type.name : type;

  // Filtered Data - Data is now filtered on server side
  const filteredAccounts = hostingAccounts;

  const handleRowClick = (account: HostingAccount) => {
    router.push(`/hosting-management/${account.id}`);
  };

  const handleEditClick = (account: HostingAccount) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingAccount(null);
    setIsModalOpen(false);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setProviderFilter('all');
    setServiceTypeFilter('all');
    setRenewalFilter('all');
  };

  const handleSaveHosting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      clientName: formData.get('clientName') as string,
      domain: formData.get('domain') as string,
      provider: formData.get('provider') as string, // Should be ID
      serviceType: formData.get('serviceType') as string, // Should be ID
      renewalDate: formData.get('renewalDate') as string,
      monthlyCost: Number(formData.get('monthlyCost')),
      notes: formData.get('notes') as string,
    };

    try {
       const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
       const token = localStorage.getItem('token');
       
       let response;
       if (editingAccount) {
         // PUT Request
         response = await fetch(`${apiUrl}/api/hosting/${editingAccount.id}`, {
           method: 'PUT',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`
           },
           body: JSON.stringify(data)
         });
       } else {
         // POST Request
         response = await fetch(`${apiUrl}/api/hosting`, {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`
           },
           body: JSON.stringify(data)
         });
       }

       if (response.ok) {
         // Refresh list
         // We could optimistically update, but simpler to trigger refetch or update state manually
         // Since we rely on server filtering/mapping, let's trigger refetch by forcing update or just refetching.
         // For now, let's just reload page or refetch. Since we have useEffect dependent on filters, 
         // we can just re-trigger it? Or just manually update state.
         
         const savedAccount = await response.json();
         // Map the saved account
         const mappedSavedAccount = {
             id: savedAccount._id,
             clientName: savedAccount.clientName,
             domain: savedAccount.domain,
             clientDomain: savedAccount.domain,
             clientInitials: savedAccount.clientName ? savedAccount.clientName.substring(0, 2).toUpperCase() : '??',
             provider: savedAccount.provider, // Might be ID or Object depending on backend response
             serviceType: savedAccount.serviceType,
             renewalDate: savedAccount.renewalDate,
             monthlyCost: savedAccount.monthlyCost,
             notes: savedAccount.notes,
             daysLeft: Math.ceil((new Date(savedAccount.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
             status: new Date(savedAccount.renewalDate) < new Date() ? 'Expired' : (new Date(savedAccount.renewalDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 ? 'Expiring Soon' : 'Active') as any,
             bandwidthUsage: 0,
             bandwidthLabel: 'N/A',
             diskUsage: 0,
             diskLabel: 'N/A',
             providerLogo: '',
             serverInfo: {},
             features: savedAccount.notes ? [savedAccount.notes] : [],
             recentActivity: []
         };

         if (editingAccount) {
            setHostingAccounts(prev => prev.map(a => a.id === mappedSavedAccount.id ? mappedSavedAccount : a));
            toast.success('Hosting account updated successfully');
         } else {
            setHostingAccounts(prev => [...prev, mappedSavedAccount]);
            toast.success('Hosting account added successfully');
         }
         handleCloseModal();
       } else {
         throw new Error('Failed to save hosting account');
       }
    } catch (error) {
      console.error('Error saving hosting:', error);
      toast.error('Failed to save hosting account');
    } finally {
      setIsSubmitting(false);
    }
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
                onClick={() => {
                    setEditingAccount(null);
                    setIsModalOpen(true);
                }}
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
            <h3 className="text-2xl font-heading font-bold text-text-primary mb-1">{hostingAccounts.length}</h3>
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
              {hostingAccounts.filter(a => a.status === 'Expiring Soon').length}
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
              ${hostingAccounts.reduce((sum, acc) => sum + acc.monthlyCost, 0).toLocaleString()}
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
              {hostingAccounts.length > 0 ? Math.round(hostingAccounts.reduce((sum, acc) => sum + acc.bandwidthUsage, 0) / hostingAccounts.length) : 0}%
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
                {Array.isArray(providers) && providers.map(p => {
                  const name = typeof p === 'object' ? p.name : p;
                  const id = typeof p === 'object' ? p._id : p;
                  return <option key={id} value={id}>{name}</option>;
                })}
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
                {Array.isArray(serviceTypes) && serviceTypes.map(s => {
                  const name = typeof s === 'object' ? s.name : s;
                  const id = typeof s === 'object' ? s._id : s;
                  return <option key={id} value={id}>{name}</option>;
                })}
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableShimmer columns={9} rows={10} />
                ) : (
                  filteredAccounts.map(account => (
                    <tr key={account.id} className="hover:bg-secondary-50 transition-smooth cursor-pointer" onClick={() => handleRowClick(account)}>
                      <td>
                        <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" onClick={(e) => e.stopPropagation()} />
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                            {account.clientInitials}
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">{account.clientName}</p>
                            <p className="text-xs text-text-secondary">{account.domain || account.clientDomain}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {account.providerLogo && <img src={account.providerLogo} alt={getProviderName(account.provider)} className="w-5 h-5 object-contain" />}
                          <span className="text-text-primary">{getProviderName(account.provider)}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-secondary">{getServiceTypeName(account.serviceType)}</span>
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
                          <button className="p-2 rounded-lg hover:bg-surface-hover text-text-secondary transition-smooth" title="View Details" onClick={() => handleRowClick(account)}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button 
                            className="p-2 rounded-lg hover:bg-surface-hover text-text-secondary transition-smooth" 
                            title="Edit"
                            onClick={() => handleEditClick(account)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border sticky top-0 bg-surface z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-heading font-bold text-text-primary">
                    {editingAccount ? 'Edit Hosting Account' : 'Add New Hosting Account'}
                  </h3>
                  <button 
                    onClick={handleCloseModal}
                    className="p-2 rounded-lg hover:bg-surface-hover transition-smooth"
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <form className="p-6 space-y-6" onSubmit={handleSaveHosting}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="clientName" className="input-label">Client Name</label>
                    <input 
                      type="text" 
                      id="clientName" 
                      name="clientName" 
                      className="input" 
                      placeholder="e.g. TechCorp Solutions" 
                      defaultValue={editingAccount?.clientName}
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="domain" className="input-label">Domain</label>
                    <input 
                      type="text" 
                      id="domain" 
                      name="domain" 
                      className="input" 
                      placeholder="e.g. techcorp.io" 
                      defaultValue={editingAccount?.domain || editingAccount?.clientDomain}
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="provider" className="input-label">Provider</label>
                    <select 
                      id="provider" 
                      name="provider" 
                      className="input" 
                      defaultValue={editingAccount?.provider && (typeof editingAccount.provider === 'object' ? editingAccount.provider._id : editingAccount.provider)}
                      required
                    >
                      <option value="">Select Provider...</option>
                    {Array.isArray(providers) && providers.map(p => {
                        const name = typeof p === 'object' ? p.name : p;
                        const id = typeof p === 'object' ? p._id : p;
                        return <option key={id} value={id}>{name}</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="serviceType" className="input-label">Service Type</label>
                    <select 
                      id="serviceType" 
                      name="serviceType" 
                      className="input" 
                      defaultValue={editingAccount?.serviceType && (typeof editingAccount.serviceType === 'object' ? editingAccount.serviceType._id : editingAccount.serviceType)}
                      required
                    >
                      <option value="">Select Type...</option>
                    {Array.isArray(serviceTypes) && serviceTypes.map(s => {
                        const name = typeof s === 'object' ? s.name : s;
                        const id = typeof s === 'object' ? s._id : s;
                        return <option key={id} value={id}>{name}</option>;
                      })}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="renewalDate" className="input-label">Renewal Date</label>
                    <input 
                      type="date" 
                      id="renewalDate" 
                      name="renewalDate" 
                      className="input" 
                      defaultValue={editingAccount?.renewalDate ? new Date(editingAccount.renewalDate).toISOString().split('T')[0] : ''}
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="monthlyCost" className="input-label">Monthly Cost ($)</label>
                    <input 
                      type="number" 
                      id="monthlyCost" 
                      name="monthlyCost" 
                      className="input" 
                      placeholder="0.00" 
                      min="0" 
                      step="0.01" 
                      defaultValue={editingAccount?.monthlyCost}
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="input-label">Notes / Features</label>
                  <textarea 
                    id="notes" 
                    name="notes" 
                    className="input min-h-[100px]" 
                    placeholder="Add server details, features, or other notes..."
                    defaultValue={editingAccount?.notes || (editingAccount?.features ? editingAccount.features.join('\n') : '')}
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (editingAccount ? 'Save Changes' : 'Add Account')}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline flex-1"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
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
