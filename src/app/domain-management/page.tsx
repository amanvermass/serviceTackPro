
'use client';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MOCK_DOMAINS, Domain } from '@/data/mock-domain-data';
import { Client } from '@/data/mock-client-data';
import toastConfig from '@/components/CustomToast';
import TableShimmer from '@/components/TableShimmer';

export default function DomainManagement() {
  const router = useRouter();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDomainModalOpen, setIsAddDomainModalOpen] = useState(false);
  const [isExpiringModalOpen, setIsExpiringModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewDomain, setRenewDomain] = useState<Domain | null>(null);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(true);
  const [isExpiringLoading, setIsExpiringLoading] = useState(false);
  const [expiringDomains, setExpiringDomains] = useState<any[]>([]);
  const [expiredDomains, setExpiredDomains] = useState<any[]>([]);
  const [expiringSoonCount, setExpiringSoonCount] = useState<number | null>(null);
  const [expiredCount, setExpiredCount] = useState<number | null>(null);
  const [isSendingNotifications, setIsSendingNotifications] = useState(false);
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [isExporting, setIsExporting] = useState(false);

  // Selection State
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: keyof Domain; direction: 'asc' | 'desc' } | null>(null);

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (searchQuery) queryParams.append('search', searchQuery);
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      if (vendorFilter !== 'all') queryParams.append('registrar', vendorFilter);
      
      if (sortConfig) {
        // Map frontend sort keys to backend keys if necessary
        let sortBy = sortConfig.key;
        if (sortBy === 'name') sortBy = 'domainName' as any;
        if (sortBy === 'vendor') sortBy = 'registrar' as any;
        // Backend expects specific fields, default to expiryDate if not supported
        // But for now let's pass it and hope backend handles or ignores
        queryParams.append('sortBy', sortBy as string);
        queryParams.append('order', sortConfig.direction);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domains?${queryParams.toString()}`, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setCurrentPage(data.pagination.currentPage);
        }
        
        // Map backend data to Domain interface
        const mappedDomains: Domain[] = data.data.map((item: any) => {
          const expiryDate = item.expiryDate ? new Date(item.expiryDate) : new Date();
          const now = new Date();
          const diffTime = expiryDate.getTime() - now.getTime();
          const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          let expiryStatus = 'Active';
          if (daysRemaining < 0) expiryStatus = 'Expired';
          else if (daysRemaining <= 30) expiryStatus = 'Expiring Soon';

          const clientObj = item.client && typeof item.client === 'object' ? item.client : null;
          const clientName = clientObj ? (clientObj.company || clientObj.name || 'N/A') : 'N/A';
          const clientId = clientObj ? clientObj._id : (typeof item.client === 'string' ? item.client : '');
          const clientContact = clientObj ? (clientObj.email || 'N/A') : 'N/A';

          const registrarObj = item.registrar && typeof item.registrar === 'object' ? item.registrar : null;
          let vendorName = 'N/A';
          let vendorId = '';

          if (registrarObj) {
            vendorName = registrarObj.name;
            vendorId = registrarObj._id;
          } else if (typeof item.registrar === 'string') {
            vendorId = item.registrar;
            // Try to find name in vendors list
            const foundVendor = vendors.find(v => v._id === vendorId);
            vendorName = foundVendor ? foundVendor.name : vendorId;
          }

          return {
            id: item._id,
            name: item.domainName,
            client: clientName,
            clientId: clientId,
            contact: clientContact,
            expiryDate: expiryDate.toISOString().split('T')[0],
            expiryStatus,
            daysRemaining,
            vendor: vendorName,
            vendorId: vendorId,
            cost: item.cost || 0,
            status: item.status || 'active',
            autoRenew: item.autoRenew,
            purchasedBy: item.purchasedBy,
            registrarInfo: {
              name: item.registrar,
              url: '',
              supportEmail: '',
              accountUser: ''
            },
            nameservers: [],
            dnsRecords: [],
            authCode: '',
            sslStatus: {
              active: false,
              provider: '',
              expiryDate: '',
              autoRenew: false
            },
            activityLog: []
          };
        });

        setDomains(mappedDomains);
      } else {
        console.error('Failed to fetch domains');
        // Fallback to mock data if API fails? Or just empty.
        // setDomains(MOCK_DOMAINS);
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
      toastConfig.error('Failed to load domains');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, vendorFilter, sortConfig, vendors]);

  const fetchClients = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients?limit=100`, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Map backend data to Client interface
        const mappedClients: Client[] = data.data.map((item: any) => ({
          id: item._id,
          companyName: item.company || item.name,
          website: item.website || '',
          logo: '',
          status: item.status || 'active',
          industry: '',
          since: '',
          notes: '',
          primaryContact: { name: '', email: '', phone: '', role: '', avatar: '' },
          address: { street: '', city: '', state: '', zip: '', country: '' },
          services: { domains: 0, hosting: 0, maintenance: false },
          billing: { totalSpent: 0, nextInvoiceDate: '', paymentMethod: '' }
        }));
        setClients(mappedClients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  }, []);

  const fetchVendors = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/master/provider`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.data || []);
        setVendors(items);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  }, []);

  useEffect(() => {
    fetchClients();
    fetchVendors();
  }, [fetchClients, fetchVendors]);

  useEffect(() => {
    const fetchRenewalAlerts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setExpiringSoonCount(null);
          setExpiredCount(null);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domains/renewal-alerts`, {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          const data = result.data || {};
          const expSoon = Number(data.expiringSoon ?? 0);
          const expired = Number(data.expired ?? 0);
          setExpiringSoonCount(Number.isNaN(expSoon) ? 0 : expSoon);
          setExpiredCount(Number.isNaN(expired) ? 0 : expired);
        } else {
          setExpiringSoonCount(0);
          setExpiredCount(0);
        }
      } catch (error) {
        console.error('Error fetching renewal alerts:', error);
        setExpiringSoonCount(0);
        setExpiredCount(0);
      }
    };

    fetchRenewalAlerts();
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  // Derived State: Filtered & Sorted Domains
  // Since we are doing server-side filtering, we might not need this complex logic anymore
  // But for client-side only filters (like clientFilter if not supported by backend), we can keep it.
  const filteredDomains = useMemo(() => {
    let result = [...domains];

    // Client filter is NOT supported by backend yet, so filter here
    if (clientFilter !== 'all') {
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
    
    return result;
  }, [domains, clientFilter]);

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

  const handleViewExpiringDomains = async () => {
    setIsExpiringModalOpen(true);
    setIsExpiringLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setExpiringDomains([]);
        setExpiredDomains([]);
        setIsExpiringLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domains/expiring`, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || {};
        setExpiringDomains(Array.isArray(data.expiring) ? data.expiring : []);
        setExpiredDomains(Array.isArray(data.expired) ? data.expired : []);
      } else {
        toastConfig.error('Failed to load expiring domains');
        setExpiringDomains([]);
        setExpiredDomains([]);
      }
    } catch (error) {
      console.error('Error fetching expiring domains:', error);
      toastConfig.error('Error fetching expiring domains');
      setExpiringDomains([]);
      setExpiredDomains([]);
    } finally {
      setIsExpiringLoading(false);
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

  const handleExport = async () => {
    if (isExporting) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toastConfig.error('You must be logged in to export domains');
        return;
      }

      setIsExporting(true);

      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      if (vendorFilter !== 'all') queryParams.append('registrar', vendorFilter);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const url = `${baseUrl}/api/domains/export-excel${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        toastConfig.error('Failed to export domains');
        return;
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'domains.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toastConfig.success('Domains exported successfully');
    } catch (error) {
      console.error('Error exporting domains:', error);
      toastConfig.error('An error occurred while exporting domains');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendRenewalNotifications = async () => {
    if (isSendingNotifications) return;
    setIsSendingNotifications(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toastConfig.error('You must be logged in to send notifications');
        setIsSendingNotifications(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domains/send-renewal-notifications`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        toastConfig.success(result.message || 'Renewal notifications sent successfully');
      } else {
        toastConfig.error(result.message || 'Failed to send renewal notifications');
      }
    } catch (error) {
      console.error('Error sending renewal notifications:', error);
      toastConfig.error('Error sending renewal notifications');
    } finally {
      setIsSendingNotifications(false);
    }
  };

  const handleAddClick = () => {
    setEditingDomain(null);
    setIsAddDomainModalOpen(true);
  };

  const handleEditClick = (domain: Domain, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Resolve vendorId if it matches a name in the vendors list
    let resolvedDomain = { ...domain };
    if (vendors.length > 0) {
       const matchedVendor = vendors.find(v => v.name === domain.vendor || v.name === domain.vendorId);
       if (matchedVendor) {
         resolvedDomain.vendorId = matchedVendor._id;
       }
    }

    setEditingDomain(resolvedDomain);
    setIsAddDomainModalOpen(true);
  };

  const handleOpenRenewModal = (domain: Domain, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenewDomain(domain);
    setIsRenewModalOpen(true);
  };

  const handleDeleteClick = async (domainId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this domain?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domains/${domainId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });

      if (response.ok) {
        toastConfig.success('Domain deleted successfully');
        fetchDomains();
      } else {
        toastConfig.error('Failed to delete domain');
      }
    } catch (error) {
      console.error('Error deleting domain:', error);
      toastConfig.error('Error deleting domain');
    }
  };

  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const domainName = (form.elements.namedItem('domainName') as HTMLInputElement).value;
    const client = (form.elements.namedItem('clientSelect') as HTMLSelectElement).value; // Not used in backend yet
    const registrar = (form.elements.namedItem('vendorSelect') as HTMLSelectElement).value;
    const expiryDate = (form.elements.namedItem('expiryDate') as HTMLInputElement).value;
    const cost = (form.elements.namedItem('cost') as HTMLInputElement).value;
    const autoRenew = (form.elements.namedItem('autoRenew') as HTMLInputElement).checked;
    const purchasedBy = (form.elements.namedItem('purchasedBy') as HTMLSelectElement | null)?.value || '';

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toastConfig.error('You must be logged in to manage domains');
        return;
      }

      const url = editingDomain 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/domains/${editingDomain.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/domains`;
      
      const method = editingDomain ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          domainName,
          registrar,
          expiryDate,
          cost: parseFloat(cost) || 0,
          autoRenew,
          status: 'active', // Default status
          registrationDate: editingDomain ? undefined : new Date().toISOString(), // Only send on create
          clientId: client,
          purchasedBy
        })
      });

      if (response.ok) {
        toastConfig.success(`Domain ${editingDomain ? 'updated' : 'added'} successfully!`);
        setIsAddDomainModalOpen(false);
        fetchDomains(); // Refresh list
      } else {
        const errorData = await response.json();
        toastConfig.error(errorData.message || `Failed to ${editingDomain ? 'update' : 'add'} domain`);
      }
    } catch (error) {
      console.error(`Error ${editingDomain ? 'updating' : 'adding'} domain:`, error);
      toastConfig.error(`An error occurred while ${editingDomain ? 'updating' : 'adding'} the domain`);
    }
  };

  const handleRenewDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewDomain) return;

    const form = e.target as HTMLFormElement;
    const renewalDate = (form.elements.namedItem('renewalDate') as HTMLInputElement).value;
    const monthlyCost = (form.elements.namedItem('monthlyCost') as HTMLInputElement).value;
    const remark = (form.elements.namedItem('renewalRemark') as HTMLTextAreaElement | null)?.value || '';

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toastConfig.error('You must be logged in to renew domains');
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/domains/${renewDomain.id}/renew`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          expiryDate: renewalDate,
          cost: parseFloat(monthlyCost) || 0,
          remark
        })
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        toastConfig.success('Domain renewed successfully');
        setIsRenewModalOpen(false);
        setRenewDomain(null);
        fetchDomains();
      } else {
        const message = data && (data.message || data.msg);
        toastConfig.error(message || 'Failed to renew domain');
      }
    } catch (error) {
      console.error('Error renewing domain:', error);
      toastConfig.error('An error occurred while renewing the domain');
    }
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
                onClick={handleAddClick}
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
                  {expiringSoonCount !== null && expiringSoonCount > 0 && (
                    <>
                      <span id="expiringCount" className="font-bold">
                        {expiringSoonCount} domain{expiringSoonCount === 1 ? '' : 's'}
                      </span>{' '}
                      expiring within 30 days
                      {!(expiredCount !== null && expiredCount > 0) && '.'}
                    </>
                  )}
                  {expiringSoonCount !== null && expiringSoonCount > 0 && expiredCount !== null && expiredCount > 0 && ' • '}
                  {expiredCount !== null && expiredCount > 0 && (
                    <>
                      <span id="expiredCount" className="font-bold">
                        {expiredCount} domain{expiredCount === 1 ? '' : 's'}
                      </span>{' '}
                      already expired.
                    </>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button 
                    className="btn btn-warning h-9 px-4 text-sm"
                    onClick={handleViewExpiringDomains}
                  >
                    View Expiring Domains
                  </button>
                  <button 
                    className="btn btn-outline h-9 px-4 text-sm border-warning-600 text-warning-700 hover:bg-warning-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleSendRenewalNotifications}
                    disabled={isSendingNotifications}
                  >
                    {isSendingNotifications ? 'Sending...' : 'Send Notifications'}
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
                {vendors.map((vendor) => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.name}
                  </option>
                ))}
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
                  <th>Purchased By</th>
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
                {loading ? (
                  <TableShimmer columns={8} rows={10} />
                ) : (
                  filteredDomains.map((domain) => (
                    <tr 
                      key={domain.id} 
                      className="hover:bg-surface-hover transition-smooth group"
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
                      <span className="text-sm text-text-secondary">
                        {domain.purchasedBy === 'kvtmedia'
                          ? 'KVT Media'
                          : domain.purchasedBy === 'client'
                            ? 'Client'
                            : ''}
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
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="p-2 cursor-pointer rounded-lg hover:bg-surface-hover transition-smooth"
                          aria-label="Renew domain"
                          onClick={(e) => handleOpenRenewModal(domain, e)}
                        >
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                        <button 
                          className="p-2 cursor-pointer rounded-lg hover:bg-surface-hover transition-smooth" 
                          aria-label="Edit domain"
                          onClick={(e) => handleEditClick(domain, e)}
                        >
                          <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          className="p-2 cursor-pointer rounded-lg hover:bg-error-50 transition-smooth" 
                          aria-label="Delete domain"
                          onClick={(e) => handleDeleteClick(domain.id, e)}
                        >
                          <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
          
          {filteredDomains.length === 0 && (
            <div className="p-8 text-center text-text-secondary">
              No domains found matching your filters.
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-4 bg-surface-50">
            <div className="text-sm text-text-secondary">
               Showing Page <span className="font-medium text-text-primary">{currentPage}</span> of <span className="font-medium text-text-primary">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
               <button 
                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                 disabled={currentPage === 1}
                 className="btn btn-outline btn-sm h-8 px-3"
               >
                 Previous
               </button>
               
               <div className="flex items-center gap-1">
                 {(() => {
                   const pages = [];
                   if (totalPages <= 3) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                   } else {
                      let start = Math.max(1, currentPage - 1);
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
                       onClick={() => typeof page === 'number' ? setCurrentPage(page) : null}
                       disabled={typeof page !== 'number'}
                       className={`h-8 min-w-[32px] px-2 rounded-lg text-sm font-medium transition-colors
                         ${page === currentPage 
                           ? 'bg-primary text-white shadow-sm' 
                           : typeof page === 'number' 
                             ? 'hover:bg-surface-hover text-text-secondary hover:text-text-primary' 
                             : 'text-text-tertiary cursor-default'}`}
                     >
                       {page}
                     </button>
                   ));
                 })()}
               </div>

               <button 
                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                 disabled={currentPage === totalPages}
                 className="btn btn-outline btn-sm h-8 px-3"
               >
                 Next
               </button>
            </div>
          </div>
        </div>
        {/* Expiring/Expired Domains Modal */}
        {isExpiringModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-surface w-full max-w-3xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-xl font-heading font-bold text-text-primary">
                  Expiring &amp; Expired Domains
                </h3>
                <button 
                  onClick={() => setIsExpiringModalOpen(false)}
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {isExpiringLoading ? (
                  <p className="text-sm text-text-secondary">Loading domains...</p>
                ) : (
                  <>
                    <div>
                      <h4 className="font-heading font-semibold text-text-primary mb-3">
                        Expiring Soon
                      </h4>
                      {expiringDomains.length === 0 ? (
                        <p className="text-sm text-text-secondary">No domains expiring soon.</p>
                      ) : (
                        <div className="border border-border rounded-lg overflow-hidden">
                          <table className="min-w-full text-sm">
                            <thead className="bg-secondary-50">
                              <tr>
                                <th className="px-4 py-2 text-left">Domain</th>
                                <th className="px-4 py-2 text-left">Client</th>
                                <th className="px-4 py-2 text-left">Registrar</th>
                                <th className="px-4 py-2 text-left">Expiry Date</th>
                                <th className="px-4 py-2 text-left">Days Left</th>
                                <th className="px-4 py-2 text-left">Purchased By</th>
                              </tr>
                            </thead>
                            <tbody>
                              {expiringDomains.map((item: any) => (
                                <tr key={item._id} className="border-t border-border">
                                  <td className="px-4 py-2 text-text-primary font-medium">
                                    {item.domainName}
                                  </td>
                                  <td className="px-4 py-2 text-text-secondary">
                                    {item.client?.name || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2 text-text-secondary">
                                    {item.registrar?.name || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2 text-text-secondary">
                                    {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                                  </td>
                                  <td className="px-4 py-2 text-text-secondary">
                                    {typeof item.daysLeft === 'number' ? `${item.daysLeft} days` : 'N/A'}
                                  </td>
                                  <td className="px-4 py-2 text-text-secondary">
                                    {item.purchasedBy === 'kvtmedia'
                                      ? 'KVT Media'
                                      : item.purchasedBy === 'client'
                                        ? 'Client'
                                        : ''}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-heading font-semibold text-text-primary mb-3">
                        Expired
                      </h4>
                      {expiredDomains.length === 0 ? (
                        <p className="text-sm text-text-secondary">No expired domains.</p>
                      ) : (
                        <div className="border border-border rounded-lg overflow-hidden">
                          <table className="min-w-full text-sm">
                            <thead className="bg-secondary-50">
                              <tr>
                                <th className="px-4 py-2 text-left">Domain</th>
                                <th className="px-4 py-2 text-left">Client</th>
                                <th className="px-4 py-2 text-left">Registrar</th>
                                <th className="px-4 py-2 text-left">Expiry Date</th>
                                <th className="px-4 py-2 text-left">Purchased By</th>
                              </tr>
                            </thead>
                            <tbody>
                              {expiredDomains.map((item: any) => (
                                <tr key={item._id} className="border-t border-border">
                                  <td className="px-4 py-2 text-text-primary font-medium">
                                    {item.domainName}
                                  </td>
                                  <td className="px-4 py-2 text-text-secondary">
                                    {item.client?.name || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2 text-text-secondary">
                                    {item.registrar?.name || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2 text-text-secondary">
                                    {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                                  </td>
                                  <td className="px-4 py-2 text-text-secondary">
                                    {item.purchasedBy === 'kvtmedia'
                                      ? 'KVT Media'
                                      : item.purchasedBy === 'client'
                                        ? 'Client'
                                        : ''}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="p-6 border-t border-border flex justify-end bg-secondary-50 rounded-b-2xl">
                <button 
                  type="button"
                  onClick={() => setIsExpiringModalOpen(false)}
                  className="btn btn-ghost"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {isRenewModalOpen && renewDomain && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-xl font-heading font-bold text-text-primary">
                  Renew Domain
                </h3>
                <button
                  onClick={() => {
                    setIsRenewModalOpen(false);
                    setRenewDomain(null);
                  }}
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="renewDomainForm" className="space-y-4" onSubmit={handleRenewDomain}>
                  <div>
                    <p className="text-sm text-text-secondary">
                      Domain
                    </p>
                    <p className="text-base font-medium text-text-primary">
                      {renewDomain.name}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="renewalDate" className="input-label">Renewal Date</label>
                    <input
                      type="date"
                      id="renewalDate"
                      name="renewalDate"
                      className="input"
                      defaultValue={renewDomain.expiryDate}
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
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="renewalRemark" className="input-label">Remark</label>
                    <textarea
                      id="renewalRemark"
                      name="renewalRemark"
                      className="input min-h-[80px] resize-none"
                      placeholder="Add any notes about this renewal"
                    />
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-border flex justify-end gap-3 bg-secondary-50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setIsRenewModalOpen(false);
                    setRenewDomain(null);
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="renewDomainForm"
                  className="btn btn-primary"
                >
                  Save Renewal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Domain Modal */}
        {isAddDomainModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-xl font-heading font-bold text-text-primary">
                  {editingDomain ? 'Edit Domain' : 'Add New Domain'}
                </h3>
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
                <form id="addDomainForm" className="space-y-4" onSubmit={handleSaveDomain}>
                  <div>
                    <label htmlFor="domainName" className="input-label">Domain Name</label>
                    <input 
                      type="text" 
                      id="domainName" 
                      className="input" 
                      placeholder="e.g. example.com" 
                      required 
                      defaultValue={editingDomain?.name || ''}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="clientSelect" className="input-label">Client</label>
                    <select 
                      id="clientSelect" 
                      className="input"
                      defaultValue={editingDomain?.clientId || ''}
                    >
                      <option value="">Select Client...</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.companyName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="vendorSelect" className="input-label">Vendor</label>
                      <select 
                        name="vendor"
                        id="vendorSelect" 
                        className="input"
                        defaultValue={editingDomain?.vendorId || ''}
                      >
                        <option value="" disabled>Select Vender</option>
                        {vendors.map((vendor) => (
                          <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="expiryDate" className="input-label">Expiry Date</label>
                      <input 
                        type="date" 
                        id="expiryDate" 
                        className="input" 
                        required 
                        defaultValue={editingDomain?.expiryDate || ''}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cost" className="input-label">Annual Cost ($)</label>
                      <input 
                        type="number" 
                        id="cost" 
                        className="input" 
                        placeholder="0.00" 
                        min="0" 
                        step="0.01" 
                        defaultValue={editingDomain?.cost || ''}
                      />
                    </div>
                    <div>
                      <label htmlFor="purchasedBy" className="input-label">Purchased By</label>
                      <select
                        id="purchasedBy"
                        name="purchasedBy"
                        className="input"
                        defaultValue={(editingDomain as any)?.purchasedBy || ''}
                      >
                        <option value="">Select option</option>
                        <option value="kvtmedia">KVT Media</option>
                        <option value="client">Client</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        id="autoRenew"
                        name="autoRenew"
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary" 
                        defaultChecked={editingDomain?.autoRenew || false}
                      />
                      <span className="text-text-primary">Auto-renew enabled</span>
                    </label>
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
                  {editingDomain ? 'Save Changes' : 'Add Domain'}
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
