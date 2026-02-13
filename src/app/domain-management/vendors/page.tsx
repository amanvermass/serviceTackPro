'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TableShimmer from '@/components/TableShimmer';
import { toast } from 'react-hot-toast';

interface Vendor {
  id: string;
  name: string;
  logo: string;
  website: string;
  activeDomains: number;
  avgCost: number;
  totalAnnualCost: number;
  status: 'active' | 'inactive';
}

export default function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      
      const response = await fetch(`${apiUrl}/api/master/provider`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Map API data to Vendor interface
        // Note: Stats like activeDomains, costs are mocked for now as they require aggregation from domain/hosting data
        const items = Array.isArray(data) ? data : (data.data || []);
        const mappedVendors: Vendor[] = items.map((item: any) => ({
          id: item._id,
          name: item.name,
          logo: item.logo || (item.name ? item.name.substring(0, 2).toUpperCase() : '??'),
          website: item.website || '',
          activeDomains: 0, // Placeholder: requires domain aggregation
          avgCost: 0, // Placeholder
          totalAnnualCost: 0, // Placeholder
          status: item.status || 'active'
        }));
        setVendors(mappedVendors);
      } else {
        console.error('Failed to fetch vendors');
        // Fallback to empty or keep previous state
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setSelectedLogo(objectUrl);
    }
  };

  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      // Construct FormData for multipart/form-data request
      const apiFormData = new FormData();
      apiFormData.append('name', formData.get('name') as string);
      
      if (logoFile) {
        apiFormData.append('logo', logoFile);
      }

      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

      let response;
      if (editingVendor) {
        response = await fetch(`${apiUrl}/api/master/provider/${editingVendor.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: apiFormData
        });
      } else {
        response = await fetch(`${apiUrl}/api/master/provider`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: apiFormData
        });
      }

      if (response.ok) {
        toast.success(`Vendor ${editingVendor ? 'updated' : 'added'} successfully`);
        setIsAddVendorModalOpen(false);
        setEditingVendor(null);
        setSelectedLogo(null);
        setLogoFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchVendors();
      } else {
        throw new Error(`Failed to ${editingVendor ? 'update' : 'add'} vendor`);
      }
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast.error(`Failed to ${editingVendor ? 'update' : 'add'} vendor`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setSelectedLogo(vendor.logo);
    setLogoFile(null);
    setIsAddVendorModalOpen(true);
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      
      const response = await fetch(`${apiUrl}/api/master/provider/${vendorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Vendor deleted successfully');
        fetchVendors();
      } else {
        throw new Error('Failed to delete vendor');
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error('Failed to delete vendor');
    }
  };

  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vendors, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const currentVendors = filteredVendors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow w-full px-10 py-[2vh]">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-heading font-bold text-text-primary mb-2 text-[clamp(1.5rem,3vw,2rem)]">Domain Vendors</h1>
              <p className="text-text-secondary text-[clamp(0.95rem,1.6vw,1.05rem)]">Manage your domain registrars and costs</p>
            </div>
            <button 
              onClick={() => {
                setEditingVendor(null);
                setSelectedLogo(null);
                setLogoFile(null);
                setIsAddVendorModalOpen(true);
              }}
              className="btn btn-primary flex items-center gap-2 w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Vendor
            </button>
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-3">
              <label htmlFor="searchInput" className="input-label">Search Vendors</label>
              <div className="relative">
                <input 
                  type="text" 
                  id="searchInput" 
                  className="input pl-10" 
                  placeholder="Search by vendor name..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
                <svg className="w-5 h-5 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
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
              </select>
            </div>
          </div>

          {/* Filter Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Showing <span className="font-semibold text-text-primary">{filteredVendors.length}</span> vendors
            </p>
            <button className="btn btn-outline text-sm h-9 px-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Vendor Table Section */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="cursor-pointer hover:bg-secondary-100 transition-smooth">
                    <div className="flex items-center gap-2">
                      Vendor Name
                      <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="cursor-pointer hover:bg-secondary-100 transition-smooth">
                    <div className="flex items-center gap-2">
                      Active Domains
                      <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="cursor-pointer hover:bg-secondary-100 transition-smooth">
                    <div className="flex items-center gap-2">
                      Costs
                      <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th>Status</th>
                  <th className="flex items-center justify-end">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <TableShimmer columns={5} rows={5} />
                ) : (
                  currentVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-surface-hover transition-smooth group cursor-pointer">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                            ${vendor.logo === 'GD' ? 'bg-success-100 text-success-700' : 
                              vendor.logo === 'NC' ? 'bg-primary-100 text-primary-700' : 
                              vendor.logo === 'CF' ? 'bg-warning-100 text-warning-700' : 'bg-secondary-100 text-secondary-700'}`}>
                            {vendor.logo}
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">{vendor.name}</p>
                            <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-xs text-text-secondary hover:text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                              {vendor.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{vendor.activeDomains} Domains</span>
                      </td>
                      <td>
                        <p className="text-text-primary font-medium">${vendor.avgCost.toFixed(2)} <span className="text-xs text-text-secondary font-normal">avg</span></p>
                        <p className="text-xs text-text-secondary">Annual: ${vendor.totalAnnualCost.toFixed(2)}</p>
                      </td>
                      <td>
                        <span className={`badge ${
                          vendor.status === 'active' ? 'badge-success' : 'badge-secondary'
                        }`}>
                          {vendor.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="p-2 rounded-lg hover:bg-surface-hover transition-smooth" 
                            aria-label="Edit vendor"
                            onClick={() => handleEditClick(vendor)}
                          >
                            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            className="p-2 rounded-lg hover:bg-error-50 transition-smooth" 
                            aria-label="Delete vendor"
                            onClick={() => handleDeleteVendor(vendor.id)}
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
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                   <button
                     key={page}
                     onClick={() => setCurrentPage(page)}
                     className={`h-8 min-w-[32px] px-2 rounded-lg text-sm font-medium transition-colors
                       ${page === currentPage 
                         ? 'bg-primary text-white shadow-sm' 
                         : 'hover:bg-surface-hover text-text-secondary hover:text-text-primary'}`}
                   >
                     {page}
                   </button>
                 ))}
               </div>

               <button 
                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                 disabled={currentPage === totalPages || totalPages === 0}
                 className="btn btn-outline btn-sm h-8 px-3"
               >
                 Next
               </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Add Vendor Modal */}
      {isAddVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-heading font-bold text-text-primary">{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</h3>
              <button 
                onClick={() => {
                  setIsAddVendorModalOpen(false);
                  setEditingVendor(null);
                }}
                className="text-text-tertiary hover:text-text-primary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveVendor} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Vendor Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  defaultValue={editingVendor?.name}
                  className="w-full px-4 py-2 bg-surface-50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. GoDaddy"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Vendor Logo</label>
                <div className="flex items-center justify-center w-full">
                  {selectedLogo ? (
                    <div className="relative w-full h-32 bg-surface-50 rounded-lg border border-border flex items-center justify-center group overflow-hidden">
                      <img src={selectedLogo} alt="Selected logo" className="h-full w-auto object-contain p-2" />
                      <button 
                        type="button"
                        onClick={() => {
                          setSelectedLogo(null);
                          setLogoFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm backdrop-blur-sm">Remove Image</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-surface-50 hover:bg-surface-hover transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-3 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-text-secondary"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-text-tertiary">SVG, PNG, JPG or GIF (MAX. 2MB)</p>
                      </div>
                    </label>
                    <input 
                      ref={fileInputRef}
                      id="dropzone-file" 
                      type="file" 
                      name="logo" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleLogoChange}
                    />
                  </>
                  )}
                </div>
              </div>
              
              <div className="p-6 border-t border-border flex justify-end gap-3 bg-surface-50 rounded-b-2xl">
                <button 
                  onClick={() => {
                    setIsAddVendorModalOpen(false);
                    setEditingVendor(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
                  type="button"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-600 rounded-lg shadow-sm shadow-primary/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingVendor ? 'Update Vendor' : 'Add Vendor')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
