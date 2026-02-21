'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Tooltip from '@/components/Tooltip';
import toastConfig from '@/components/CustomToast';
import Footer from '@/components/Footer';
import TableShimmer from '@/components/TableShimmer';

type HostingStatus = 'Active' | 'Expiring Soon' | 'Expired';

interface HostingAccount {
  id: string;
  clientName: string;
  client?: string;
  clientDomain?: string;
  domain?: string;
  clientInitials?: string;
  provider: any;
  providerLogo?: string;
  serviceType: any;
  renewalDate: string;
  daysLeft: number;
  monthlyCost: number;
  purchasedBy?: string;
  loginUrl?: string;
  password?: string;
  bandwidthUsage: number;
  bandwidthLabel: string;
  diskUsage: number;
  diskLabel: string;
  status: HostingStatus;
  serverInfo?: {
    ipAddress?: string;
    os?: string;
    region?: string;
    phpVersion?: string;
    nodeVersion?: string;
    dbType?: string;
    uptime?: string;
  };
  features?: string[];
  notes?: string;
  recentActivity?: {
    id: string;
    action: string;
    date: string;
    user: string;
    status: 'success' | 'warning' | 'error';
  }[];
}

export default function HostingManagement() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<HostingAccount | null>(null);
  const [hostingAccounts, setHostingAccounts] = useState<HostingAccount[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(true);
  const [expiringSoonCount, setExpiringSoonCount] = useState<number | null>(null);
  const [expiredCount, setExpiredCount] = useState<number | null>(null);
  const [isExpiringModalOpen, setIsExpiringModalOpen] = useState(false);
  const [isExpiringLoading, setIsExpiringLoading] = useState(false);
  const [expiringHosting, setExpiringHosting] = useState<any[]>([]);
  const [expiredHosting, setExpiredHosting] = useState<any[]>([]);
  const [isSendingNotifications, setIsSendingNotifications] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewAccount, setRenewAccount] = useState<HostingAccount | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [renewalFilter, setRenewalFilter] = useState('all');


  // Fetch providers and service types on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;
        const token = localStorage.getItem('token');
        if (!token) {
          setProviders([]);
          setServiceTypes([]);
          return;
        }
        
        // Fetch providers
        try {
          const providersResponse = await fetch(`${apiUrl}/api/master/provider`, {
            headers: { Authorization: `Bearer ${token}` }
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
            headers: { Authorization: `Bearer ${token}` }
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

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setClients([]);
        return;
      }

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
      setClients([]);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchRenewalAlerts = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
        const token = localStorage.getItem('token');
        if (!token) {
          setExpiringSoonCount(null);
          setExpiredCount(null);
          return;
        }

        const response = await fetch(`${baseUrl}/api/hosting/renewal-alerts`, {
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
        console.error('Error fetching hosting renewal alerts:', error);
        setExpiringSoonCount(0);
        setExpiredCount(0);
      }
    };

    fetchRenewalAlerts();
  }, []);

  const fetchHostingAccounts = async (page = 1) => {
      setIsLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', itemsPerPage.toString());
        if (searchTerm) params.append('search', searchTerm);
        if (providerFilter && providerFilter !== 'all') params.append('provider', providerFilter);
        if (serviceTypeFilter && serviceTypeFilter !== 'all') params.append('serviceType', serviceTypeFilter);
        if (renewalFilter && renewalFilter !== 'all') params.append('status', renewalFilter);

        const response = await fetch(`${baseUrl}/api/hosting?${params.toString()}`, {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
           const data = await response.json();
           if (data.pagination) {
             const pagination = data.pagination;
             setTotalPages(
               (pagination.totalPages ?? pagination.pages ?? 1) as number
             );
             if (typeof pagination.currentPage === 'number') {
               setCurrentPage(pagination.currentPage);
             }
           }
           const items = Array.isArray(data) ? data : (data.data || []);
           const mappedData = items.map((item: any) => {
             const clientObj = item.client && typeof item.client === 'object'
               ? item.client
               : item.clientName && typeof item.clientName === 'object'
                 ? item.clientName
                 : null;
             const clientName = clientObj
               ? (clientObj.company || clientObj.name || 'Unknown Client')
               : (typeof item.clientName === 'string'
                   ? item.clientName
                   : (item.client || 'Unknown Client'));
             const client = clientObj
               ? (clientObj._id || '')
               : (item.client || (typeof item.client === 'string' ? item.client : ''));

             return {
               id: item._id,
               client,
               clientName,
               domain: item.domain,
               clientDomain: item.domain,
               clientInitials: clientName ? clientName.substring(0, 2).toUpperCase() : '??',
               provider: item.provider,
               serviceType: item.serviceType,
               renewalDate: item.renewalDate,
               monthlyCost: Number(item.monthlyCost ?? 0),
               notes: item.notes,
               purchasedBy: item.purchasedBy,
               loginUrl: item.loginUrl,
               password: item.password,
               daysLeft: Math.ceil((new Date(item.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
               status: new Date(item.renewalDate) < new Date()
                 ? 'Expired'
                 : (new Date(item.renewalDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 ? 'Expiring Soon' : 'Active'),
               bandwidthUsage: 0,
               bandwidthLabel: 'N/A',
               diskUsage: 0,
               diskLabel: 'N/A',
               providerLogo: '',
               serverInfo: {},
               features: item.notes ? [item.notes] : [],
               recentActivity: []
             };
           });
           setHostingAccounts(mappedData);
        } else if (response.status === 401) {
          console.error('Unauthorized when fetching hosting accounts');
        }
      } catch (error) {
         console.error('Error fetching hosting accounts:', error);
      } finally {
        setIsLoading(false);
      }
  };

  // Fetch hosting accounts when filters or page change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchHostingAccounts(currentPage);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, providerFilter, serviceTypeFilter, renewalFilter, currentPage]);


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

  const handleOpenRenewModal = (account: HostingAccount, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenewAccount(account);
    setIsRenewModalOpen(true);
  };

  const handleDeleteClick = async (accountId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this hosting account?')) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
      const token = localStorage.getItem('token');
      if (!token) {
        toastConfig.error('You must be logged in to delete hosting accounts');
        return;
      }

      const response = await fetch(`${baseUrl}/api/hosting/${accountId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toastConfig.success('Hosting account deleted successfully');
        setHostingAccounts(prev => prev.filter(acc => acc.id !== accountId));
      } else {
        toastConfig.error('Failed to delete hosting account');
      }
    } catch (error) {
      console.error('Error deleting hosting account:', error);
      toastConfig.error('Error deleting hosting account');
    }
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
    setCurrentPage(1);
  };

  const handleExport = async () => {
    if (isExporting) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
      const token = localStorage.getItem('token');

      if (!token) {
        toastConfig.error('You must be logged in to export hosting data');
        return;
      }

      setIsExporting(true);

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (providerFilter && providerFilter !== 'all') params.append('provider', providerFilter);
      if (serviceTypeFilter && serviceTypeFilter !== 'all') params.append('serviceType', serviceTypeFilter);
      if (renewalFilter && renewalFilter !== 'all') params.append('status', renewalFilter);

      const url = `${baseUrl}/api/hosting/export-excel${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        toastConfig.error('Failed to export hosting data');
        return;
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'hosting.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toastConfig.success('Hosting data exported successfully');
    } catch (error) {
      console.error('Error exporting hosting data:', error);
      toastConfig.error('An error occurred while exporting hosting data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRenewHosting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewAccount) return;

    const form = e.target as HTMLFormElement;
    const renewalDate = (form.elements.namedItem('renewalDate') as HTMLInputElement).value;
    const monthlyCost = (form.elements.namedItem('monthlyCost') as HTMLInputElement).value;
    const remark = (form.elements.namedItem('renewalRemark') as HTMLTextAreaElement | null)?.value || '';

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
      const token = localStorage.getItem('token');
      if (!token) {
        toastConfig.error('You must be logged in to renew hosting');
        return;
      }

      const url = `${baseUrl}/api/hosting/${renewAccount.id}/renew`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          renewalDate,
          monthlyCost: parseFloat(monthlyCost) || 0,
          remark
        })
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        toastConfig.success('Hosting renewed successfully');
        setIsRenewModalOpen(false);
        setRenewAccount(null);
        fetchHostingAccounts(currentPage);
      } else {
        const message = data && (data.message || data.msg);
        toastConfig.error(message || 'Failed to renew hosting');
      }
    } catch (error) {
      console.error('Error renewing hosting:', error);
      toastConfig.error('An error occurred while renewing hosting');
    }
  };

  const handleViewExpiringHosting = async () => {
    setIsExpiringModalOpen(true);
    setIsExpiringLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
      const token = localStorage.getItem('token');
      if (!token) {
        toastConfig.error('You must be logged in to view expiring hosting');
        setExpiringHosting([]);
        setExpiredHosting([]);
        setIsExpiringLoading(false);
        return;
      }

      const response = await fetch(`${baseUrl}/api/hosting/expiring`, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || {};
        setExpiringHosting(Array.isArray(data.expiring) ? data.expiring : []);
        setExpiredHosting(Array.isArray(data.expired) ? data.expired : []);
      } else {
        toastConfig.error('Failed to load expiring hosting');
        setExpiringHosting([]);
        setExpiredHosting([]);
      }
    } catch (error) {
      console.error('Error fetching expiring hosting:', error);
      toastConfig.error('Error fetching expiring hosting');
      setExpiringHosting([]);
      setExpiredHosting([]);
    } finally {
      setIsExpiringLoading(false);
    }
  };

  const handleSendRenewalNotifications = async () => {
    if (isSendingNotifications) return;
    setIsSendingNotifications(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
      const token = localStorage.getItem('token');
      if (!token) {
        toastConfig.error('You must be logged in to send notifications');
        setIsSendingNotifications(false);
        return;
      }

      const response = await fetch(`${baseUrl}/api/hosting/send-renewal-notifications`, {
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

  const handleSaveHosting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const selectedclient = formData.get('clientName') as string;
    const passwordValue = (formData.get('password') as string | null) || '';

    const data: any = {
      client: selectedclient,
      domain: formData.get('domain') as string,
      provider: formData.get('provider') as string,
      serviceType: formData.get('serviceType') as string,
      renewalDate: formData.get('renewalDate') as string,
      monthlyCost: Number(formData.get('monthlyCost')),
      notes: formData.get('notes') as string,
      purchasedBy: formData.get('purchasedBy') as string,
      loginUrl: formData.get('loginUrl') as string,
    };

    if (!editingAccount || passwordValue.trim() !== '') {
      data.password = passwordValue;
    }

    try {
       const token = localStorage.getItem('token');
       if (!token) {
         toastConfig.error('You must be logged in to manage hosting accounts');
         setIsSubmitting(false);
         return;
       }

       const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
       const url = editingAccount
         ? `${baseUrl}/api/hosting/${editingAccount.id}`
         : `${baseUrl}/api/hosting`;
       const method = editingAccount ? 'PUT' : 'POST';

       const response = await fetch(url, {
         method,
         headers: {
           'Content-Type': 'application/json',
           'x-auth-token': token
         },
         body: JSON.stringify(data)
       });

       if (response.ok) {
         // Refresh list
         // We could optimistically update, but simpler to trigger refetch or update state manually
         // Since we rely on server filtering/mapping, let's trigger refetch by forcing update or just refetching.
         // For now, let's just reload page or refetch. Since we have useEffect dependent on filters, 
         // we can just re-trigger it? Or just manually update state.
         
        const savedAccount = await response.json();
        const clientObj = savedAccount.client && typeof savedAccount.client === 'object'
          ? savedAccount.client
          : savedAccount.clientName && typeof savedAccount.clientName === 'object'
            ? savedAccount.clientName
            : null;
        const clientName = clientObj
          ? (clientObj.company || clientObj.name || 'Unknown Client')
          : (savedAccount.clientName || savedAccount.client || 'Unknown Client');
        const client = clientObj
          ? (clientObj._id || '')
          : (savedAccount.client || (typeof savedAccount.client === 'string' ? savedAccount.client : ''));

        const mappedSavedAccount = {
            id: savedAccount._id,
            client,
            clientName,
            domain: savedAccount.domain,
            clientDomain: savedAccount.domain,
            clientInitials: clientName ? clientName.substring(0, 2).toUpperCase() : '??',
            provider: savedAccount.provider,
            serviceType: savedAccount.serviceType,
            renewalDate: savedAccount.renewalDate,
            monthlyCost: Number(savedAccount.monthlyCost ?? 0),
            notes: savedAccount.notes,
            purchasedBy: savedAccount.purchasedBy,
            loginUrl: savedAccount.loginUrl,
            password: savedAccount.password,
            daysLeft: Math.ceil((new Date(savedAccount.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
            status: new Date(savedAccount.renewalDate) < new Date()
              ? 'Expired'
              : (new Date(savedAccount.renewalDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 ? 'Expiring Soon' : 'Active') as any,
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
            toastConfig.success('Hosting account updated successfully');
         } else {
            setHostingAccounts(prev => [...prev, mappedSavedAccount]);
            toastConfig.success('Hosting account added successfully');
         }
         handleCloseModal();
       } else {
         const errorData = await response.json().catch(() => null);
         const message = errorData && (errorData.message || errorData.msg);
         toastConfig.error(message || 'Failed to save hosting account');
       }
    } catch (error) {
      console.error('Error saving hosting:', error);
      toastConfig.error('Failed to save hosting account');
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

        {(isAlertVisible && ((expiringSoonCount ?? 0) > 0 || (expiredCount ?? 0) > 0)) && (
          <div id="hostingExpiryAlertBanner" className="card mb-6 border-l-4 border-warning bg-warning-50">
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
                      <span id="hostingExpiringCount" className="font-bold">
                        {expiringSoonCount} hosting account{expiringSoonCount === 1 ? '' : 's'}
                      </span>{' '}
                      expiring within 30 days
                      {!(expiredCount !== null && expiredCount > 0) && '.'}
                    </>
                  )}
                  {expiringSoonCount !== null && expiringSoonCount > 0 && expiredCount !== null && expiredCount > 0 && ' • '}
                  {expiredCount !== null && expiredCount > 0 && (
                    <>
                      <span id="hostingExpiredCount" className="font-bold">
                        {expiredCount} hosting account{expiredCount === 1 ? '' : 's'}
                      </span>{' '}
                      already expired.
                    </>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button 
                    className="btn btn-warning h-9 px-4 text-sm"
                    onClick={handleViewExpiringHosting}
                  >
                    View Expiring Hosting
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
              ${hostingAccounts
                .reduce((sum, acc) => sum + (acc.monthlyCost ?? 0), 0)
                .toLocaleString()}
            </h3>
            <p className="text-sm text-text-secondary">Monthly Cost</p>
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
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
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
                onChange={(e) => {
                  setProviderFilter(e.target.value);
                  setCurrentPage(1);
                }}
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
                onChange={(e) => {
                  setServiceTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
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
                onChange={(e) => { setRenewalFilter(e.target.value); setCurrentPage(1); }}
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
              <button 
                id="exportBtn" 
                className="btn btn-outline text-sm h-9 px-4 flex items-center gap-2"
                onClick={handleExport}
                disabled={isExporting}
              >
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
                  <th>Purchase By</th>
                  <th>Status</th>
                  <th className="flex items-center justify-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableShimmer columns={9} rows={10} />
                ) : (
                  filteredAccounts.map(account => (
                    <tr key={account.id} className="hover:bg-secondary-50 transition-smooth">
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
                        ${((account.monthlyCost ?? 0)).toFixed(2)}
                      </td>
                      <td className="text-sm text-text-secondary">
                        {account.purchasedBy === 'kvtmedia'
                          ? 'KVT Media'
                          : account.purchasedBy === 'client'
                            ? 'Client'
                            : ''}
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
                          {/* <button
                            className="p-2 rounded-lg hover:bg-surface-hover transition-smooth"
                            aria-label="View hosting details"
                            onClick={() => handleRowClick(account)}
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button> */}
                          <button
                            className="p-2 cursor-pointer rounded-lg hover:bg-surface-hover transition-smooth"
                            aria-label="Renew hosting"
                            onClick={(e) => handleOpenRenewModal(account, e)}
                          >
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          <button 
                            className="p-2 cursor-pointer rounded-lg hover:bg-surface-hover transition-smooth" 
                            aria-label="Edit hosting"
                            onClick={() => handleEditClick(account)}
                          >
                            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            className="p-2 cursor-pointer rounded-lg hover:bg-error-50 transition-smooth" 
                            aria-label="Delete hosting"
                            onClick={(e) => handleDeleteClick(account.id, e)}
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

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-4 bg-surface-50">
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
                  const pages: (number | string)[] = [];
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
        {isExpiringModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface w-full max-w-3xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-xl font-heading font-bold text-text-primary">
                  Expiring &amp; Expired Hosting
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
                  <p className="text-sm text-text-secondary">Loading hosting accounts...</p>
                ) : (
                  <>
                    <div>
                      <h4 className="font-heading font-semibold text-text-primary mb-3">
                        Expiring Soon
                      </h4>
                      {expiringHosting.length === 0 ? (
                        <p className="text-sm text-text-secondary">No hosting accounts expiring soon.</p>
                      ) : (
                        <div className="border border-border rounded-lg overflow-hidden">
                          <table className="min-w-full text-sm">
                            <thead className="bg-secondary-50">
                              <tr>
                                <th className="px-4 py-2 text-left">Domain</th>
                                <th className="px-4 py-2 text-left">Client</th>
                                <th className="px-4 py-2 text-left">Provider</th>
                                <th className="px-4 py-2 text-left">Renewal Date</th>
                                <th className="px-4 py-2 text-left">Days Left</th>
                                <th className="px-4 py-2 text-left">Purchased By</th>
                              </tr>
                            </thead>
                            <tbody>
                              {expiringHosting.map((item: any) => (
                                <tr key={item._id} className="border-t border-border">
                                  <td className="px-4 py-2 text-text-primary font-medium">
                                    {item.domain || item.domainName || item.service || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2 text-text-secondary">
                                    {item.client?.name || item.clientName || item.client || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2 text-text-secondary">
                                    {item.provider?.name || item.provider || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2 text-text-secondary">
                                    {item.renewalDate || item.expiryDate
                                      ? new Date(item.renewalDate || item.expiryDate).toLocaleDateString()
                                      : 'N/A'}
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
                      {expiredHosting.length === 0 ? (
                        <p className="text-sm text-text-secondary">No expired hosting accounts.</p>
                      ) : (
                        <div className="border border-border rounded-lg overflow-hidden">
                          <table className="min-w-full text-sm">
                            <thead className="bg-secondary-50">
                              <tr>
                                <th className="px-4 py-2 text-left">Domain</th>
                                <th className="px-4 py-2 text-left">Client</th>
                                <th className="px-4 py-2 text-left">Provider</th>
                                <th className="px-4 py-2 text-left">Renewal Date</th>
                                <th className="px-4 py-2 text-left">Purchased By</th>
                              </tr>
                            </thead>
                            <tbody>
                              {expiredHosting.map((item: any) => (
                                <tr key={item._id} className="border-t border-border">
                                  <td className="px-4 py-2 text-text-primary font-medium">
                                    {item.domain || item.domainName || item.service || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2 text-text-secondary">
                                    {item.client?.name || item.clientName || item.client || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2 text-text-secondary">
                                    {item.provider?.name || item.provider || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2 text-text-secondary">
                                    {item.renewalDate || item.expiryDate
                                      ? new Date(item.renewalDate || item.expiryDate).toLocaleDateString()
                                      : 'N/A'}
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

        {isRenewModalOpen && renewAccount && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-xl font-heading font-bold text-text-primary">
                  Renew Hosting
                </h3>
                <button
                  onClick={() => {
                    setIsRenewModalOpen(false);
                    setRenewAccount(null);
                  }}
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="renewHostingForm" className="space-y-4" onSubmit={handleRenewHosting}>
                  <div>
                    <p className="text-sm text-text-secondary">
                      Client
                    </p>
                    <p className="text-base font-medium text-text-primary">
                      {renewAccount.clientName}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {renewAccount.domain || renewAccount.clientDomain}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="renewalDate" className="input-label">Renewal Date</label>
                    <input
                      type="date"
                      id="renewalDate"
                      name="renewalDate"
                      className="input"
                      defaultValue={renewAccount.renewalDate}
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
                      defaultValue={renewAccount.monthlyCost || ''}
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
                    setRenewAccount(null);
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="renewHostingForm"
                  className="btn btn-primary"
                >
                  Save Renewal
                </button>
              </div>
            </div>
          </div>
        )}

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
                    <label htmlFor="clientName" className="input-label">
                      Client Name <span className="text-error">*</span>
                    </label>
                    <select 
                      id="clientName" 
                      name="clientName" 
                      className="input" 
                      defaultValue={
                        editingAccount?.client ||
                        (editingAccount?.clientName
                          ? clients.find(c => c.name === editingAccount.clientName)?.id || ''
                          : '')
                      }
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
                    <label htmlFor="domain" className="input-label">
                      Domain <span className="text-error">*</span>
                    </label>
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
                    <label htmlFor="provider" className="input-label">
                      Provider <span className="text-error">*</span>
                    </label>
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
                    <label htmlFor="serviceType" className="input-label">
                      Service Type <span className="text-error">*</span>
                    </label>
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
                    <label htmlFor="renewalDate" className="input-label">
                      Renewal Date <span className="text-error">*</span>
                    </label>
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
                    <label htmlFor="monthlyCost" className="input-label">
                      Monthly Cost ($) <span className="text-error">*</span>
                    </label>
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
                  <label htmlFor="purchasedBy" className="input-label">
                    Purchased By <span className="text-error">*</span>
                  </label>
                  <select
                    id="purchasedBy"
                    name="purchasedBy"
                    className="input"
                    defaultValue={editingAccount?.purchasedBy || ''}
                    required
                  >
                    <option value="" disabled>
                      Select option
                    </option>
                    <option value="kvtmedia">KVT Media</option>
                    <option value="client">Client</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="loginUrl" className="input-label">
                      Login URL <span className="text-error">*</span>
                    </label>
                    <input
                      type="url"
                      id="loginUrl"
                      name="loginUrl"
                      className="input"
                      placeholder="https://controlpanel.example.com"
                      defaultValue={editingAccount?.loginUrl || ''}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="input-label">
                      Password <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        className="input pr-10"
                        placeholder="••••••••"
                        defaultValue={editingAccount?.password || ''}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-text-secondary"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a10.45 10.45 0 012.352-3.952M9.88 9.88A3 3 0 0114.12 14.12M6.1 6.1L4 4m2.1 2.1l3.12 3.12m3.76 3.76L18 18m-2.12-2.12l3.02 3.02M9.88 9.88l4.24 4.24" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
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
      <Footer />
    </div>
  );
}
