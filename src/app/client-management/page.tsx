'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Client } from '@/data/mock-client-data';
import toastConfig from '@/components/CustomToast';
import TableShimmer from '@/components/TableShimmer';

export default function ClientManagement() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchClients = async (search = '', page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // router.push('/'); 
        // For now just return to avoid error
        setLoading(false);
        return;
      }

      const headers: HeadersInit = {
        'x-auth-token': token,
        'Content-Type': 'application/json'
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sortBy: 'createdAt',
        order: 'desc'
      });
      if (search) queryParams.append('search', search);
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);

      const response = await fetch(`${apiUrl}/api/clients?${queryParams.toString()}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.pagination) {
          setTotalPages(data.pagination.pages);
        }

        // Map backend data to frontend Client interface
        const mappedClients: Client[] = data.data.map((item: any) => {
          const companyName = item.company || item.name;
          const logo = companyName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();

          return {
            id: item._id,
            companyName: companyName,
            website: item.website || '', 
            logo: logo, 
            status: item.status || 'active', 
            industry: 'Technology',
            since: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            notes: item.notes || '',
            primaryContact: {
              name: item.name,
              email: item.email,
              phone: item.phone || '',
              role: 'Contact',
              avatar: ''
            },
            address: {
              street: item.address || '',
              city: '',
              state: '',
              zip: '',
              country: ''
            },
            services: {
              domains: item.services?.domains || 0,
              hosting: item.services?.hosting || 0,
              maintenance: item.services?.maintenance || false
            },
            billing: {
              totalSpent: 0,
              nextInvoiceDate: new Date().toISOString(),
              paymentMethod: '',
              status: 'good'
            },
            recentActivity: [],
            activeServicesList: []
          };
        });
        setClients(mappedClients);
      } else {
        // If 401, maybe redirect?
        if (response.status === 401) {
             // router.push('/'); // Optional: redirect to login
        }
        console.error('Failed to fetch clients');
        // toastConfig.error('Failed to fetch clients'); // Silent fail or show toast?
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toastConfig.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients(searchTerm, currentPage);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, currentPage]);

  const handleRowClick = (id: string) => {
    router.push(`/client-management/${id}`);
  };

  const handleEditClick = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClient(client);
    setIsAddClientModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingClient(null);
    setIsAddClientModalOpen(true);
  };

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Search is handled by API
      
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      
      let matchesService = true;
      if (serviceFilter === 'domain') matchesService = client.services.domains > 0;
      if (serviceFilter === 'hosting') matchesService = client.services.hosting > 0;
      if (serviceFilter === 'maintenance') matchesService = client.services.maintenance;
      if (serviceFilter === 'multiple') matchesService = 
        (client.services.domains > 0 ? 1 : 0) + 
        (client.services.hosting > 0 ? 1 : 0) + 
        (client.services.maintenance ? 1 : 0) > 1;

      return matchesStatus && matchesService;
    });
  }, [clients, serviceFilter, statusFilter]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'inactive': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col w-full">
      <Header />

      <main className="flex-grow w-full px-10 py-[2vh]">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-heading font-bold text-text-primary mb-2 text-[clamp(1.5rem,3vw,2rem)]">Client Management</h1>
              <p className="text-text-secondary text-[clamp(0.95rem,1.6vw,1.05rem)]">Manage client profiles, service history, and communication preferences</p>
            </div>
            <button 
              id="addClientBtn" 
              className="btn btn-primary flex items-center gap-2 w-full sm:w-auto"
              onClick={handleAddClick}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Client
            </button>
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label htmlFor="searchInput" className="input-label">Search Clients</label>
              <div className="relative">
                <input 
                  type="text" 
                  id="searchInput" 
                  className="input pl-10" 
                  placeholder="Search by name, contact, or service..." 
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
                <svg className="w-5 h-5 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Service Type Filter */}
            <div>
              <label htmlFor="serviceFilter" className="input-label">Service Type</label>
              <select 
                id="serviceFilter" 
                className="input"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
              >
                <option value="all">All Services</option>
                <option value="domain">Domain Only</option>
                <option value="hosting">Hosting Only</option>
                <option value="maintenance">Maintenance Only</option>
                <option value="multiple">Multiple Services</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="statusFilter" className="input-label">Status</label>
              <select 
                id="statusFilter" 
                className="input"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Filter Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Showing <span id="resultCount" className="font-semibold text-text-primary">{filteredClients.length}</span> clients
            </p>
            <button id="exportBtn" className="btn btn-outline text-sm h-9 px-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Client Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="cursor-pointer hover:bg-secondary-100 transition-smooth" data-sort="company">
                    <div className="flex items-center gap-2">
                      Company Name
                      <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="cursor-pointer hover:bg-secondary-100 transition-smooth" data-sort="contact">
                    <div className="flex items-center gap-2">
                      Primary Contact
                      <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="cursor-pointer hover:bg-secondary-100 transition-smooth" data-sort="services">
                    <div className="flex items-center gap-2">
                      Active Services
                      <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="cursor-pointer hover:bg-secondary-100 transition-smooth" data-sort="interaction">
                    <div className="flex items-center gap-2">
                      Total Spent
                      <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th>Status</th>
                  <th className="flex items-center justify-end">Actions</th>
                </tr>
              </thead>
              <tbody id="clientTableBody">
                {loading ? (
                  <TableShimmer columns={6} rows={10} />
                ) : (
                  filteredClients.map((client) => (
                    <tr 
                      key={client.id}
                      onClick={() => handleRowClick(client.id)}
                      className="cursor-pointer hover:bg-surface-hover transition-smooth client-row" 
                    >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                          ${client.logo === 'TC' ? 'bg-primary-100 text-primary-700' : 
                            client.logo === 'DI' ? 'bg-accent-100 text-accent-700' : 
                            client.logo === 'GS' ? 'bg-success-100 text-success-700' : 'bg-secondary-100 text-secondary-700'}`}>
                          <span className="font-semibold text-sm">{client.logo}</span>
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{client.companyName}</p>
                          <p className="text-xs text-text-secondary">{client.website}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-text-primary">{client.primaryContact.name}</p>
                        <p className="text-xs text-text-secondary">{client.primaryContact.email}</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {client.services.domains > 0 && <span className="badge badge-primary">{client.services.domains} Domains</span>}
                        {client.services.hosting > 0 && <span className="badge badge-success">{client.services.hosting} Hosting</span>}
                        {client.services.maintenance && <span className="badge badge-warning">Maintenance</span>}
                      </div>
                    </td>
                    <td>
                      <p className="text-text-primary font-medium">${client.billing.totalSpent.toLocaleString()}</p>
                      <p className="text-xs text-text-secondary">Next: {new Date(client.billing.nextInvoiceDate).toLocaleDateString()}</p>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(client.status)}`}>
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="p-2 rounded-lg hover:bg-surface-hover transition-smooth" 
                          aria-label="Edit client"
                          onClick={(e) => handleEditClick(client, e)}
                        >
                          <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button className="p-2 rounded-lg hover:bg-error-50 transition-smooth" aria-label="Delete client">
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
            {/* <div className="text-sm text-text-secondary">
               Showing Page <span className="font-medium text-text-primary">{currentPage}</span> of <span className="font-medium text-text-primary">{totalPages}</span>
            </div> */}
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

        {/* Add/Edit Client Modal */}
        {isAddClientModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border sticky top-0 bg-surface z-sticky">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-heading font-bold text-text-primary">
                    {editingClient ? 'Edit Client' : 'Add New Client'}
                  </h3>
                  <button 
                    onClick={() => setIsAddClientModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-surface-hover transition-smooth" 
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
              <form className="p-6 space-y-6" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const companyName = (form.elements.namedItem('companyName') as HTMLInputElement).value;
                const website = (form.elements.namedItem('website') as HTMLInputElement).value;
                const contactName = (form.elements.namedItem('contactName') as HTMLInputElement).value;
                const contactEmail = (form.elements.namedItem('contactEmail') as HTMLInputElement).value;
                const contactPhone = (form.elements.namedItem('contactPhone') as HTMLInputElement).value;
                const clientStatus = (form.elements.namedItem('clientStatus') as HTMLSelectElement).value;
                const notes = (form.elements.namedItem('notes') as HTMLTextAreaElement).value;
                const domains = parseInt((form.elements.namedItem('domains') as HTMLInputElement).value) || 0;
                const hosting = parseInt((form.elements.namedItem('hosting') as HTMLInputElement).value) || 0;
                const maintenance = (form.elements.namedItem('maintenance') as HTMLInputElement).checked;

                const payload = {
                  company: companyName,
                  website,
                  name: contactName,
                  email: contactEmail,
                  phone: contactPhone,
                  status: clientStatus,
                  notes,
                  services: {
                    domains,
                    hosting,
                    maintenance
                  }
                };

                try {
                  const token = localStorage.getItem('token');
                  const headers: HeadersInit = {
                    'Content-Type': 'application/json',
                  };
                  if (token) headers['x-auth-token'] = token;

                  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                  let response;

                  if (editingClient) {
                    // PUT
                    response = await fetch(`${apiUrl}/api/clients/${editingClient.id}`, {
                      method: 'PUT',
                      headers,
                      body: JSON.stringify(payload)
                    });
                  } else {
                    // POST
                    response = await fetch(`${apiUrl}/api/clients`, {
                      method: 'POST',
                      headers,
                      body: JSON.stringify(payload)
                    });
                  }

                  const data = await response.json();

                  if (response.ok) {
                    toastConfig.success(editingClient ? 'Client updated successfully' : 'Client added successfully');
                    setIsAddClientModalOpen(false);
                    fetchClients(searchTerm);
                  } else {
                    toastConfig.error(data.message || data.msg || 'Operation failed');
                  }
                } catch (error) {
                  console.error('Error saving client:', error);
                  toastConfig.error('Error connecting to server');
                }
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="companyName" className="input-label">Company Name *</label>
                    <input 
                      type="text" 
                      id="companyName" 
                      className="input" 
                      placeholder="Enter company name" 
                      required 
                      defaultValue={editingClient?.companyName}
                    />
                  </div>
                  <div>
                    <label htmlFor="website" className="input-label">Website</label>
                    <input 
                      type="url" 
                      id="website" 
                      className="input" 
                      placeholder="company.com" 
                      defaultValue={editingClient?.website}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactName" className="input-label">Primary Contact Name *</label>
                    <input 
                      type="text" 
                      id="contactName" 
                      className="input" 
                      placeholder="Enter contact name" 
                      required 
                      defaultValue={editingClient?.primaryContact.name}
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="input-label">Email *</label>
                    <input 
                      type="email" 
                      id="contactEmail" 
                      className="input" 
                      placeholder="contact@company.com" 
                      required 
                      defaultValue={editingClient?.primaryContact.email}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactPhone" className="input-label">Phone</label>
                    <input 
                      type="tel" 
                      id="contactPhone" 
                      className="input" 
                      placeholder="+1 (555) 123-4567" 
                      defaultValue={editingClient?.primaryContact.phone}
                    />
                  </div>
                  <div>
                    <label htmlFor="clientStatus" className="input-label">Status</label>
                    <select id="clientStatus" className="input" defaultValue={editingClient?.status || 'active'}>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="input-label">Communication Preferences</label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                      <span className="text-sm text-text-primary">Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                      <span className="text-sm text-text-primary">SMS</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                      <span className="text-sm text-text-primary">WhatsApp</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label htmlFor="notes" className="input-label">Notes</label>
                  <textarea 
                    id="notes" 
                    className="input min-h-[100px]" 
                    placeholder="Add any additional notes about the client..."
                    defaultValue={editingClient?.notes || ''}
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={editingClient ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"}/>
                    </svg>
                    {editingClient ? 'Update Client' : 'Add Client'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline flex-1"
                    onClick={() => setIsAddClientModalOpen(false)}
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
