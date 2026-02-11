'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Client } from '@/data/mock-client-data';
import toastConfig from '@/components/CustomToast';

export default function ClientDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/clients/${id}`, {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
            const data = await response.json();
            const item = data.data;
            
            const companyName = item.company || item.name;
            const initials = companyName
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();

            const services = {
              domains: item.services?.domains || 0,
              hosting: item.services?.hosting || 0,
              maintenance: item.services?.maintenance || false
            };

            const activeServicesList: any[] = [];
            
            if (services.domains > 0) {
              for (let i = 0; i < services.domains; i++) {
                activeServicesList.push({
                  id: `dom-${i}`,
                  name: i === 0 && item.website ? item.website : `Domain Registration ${i+1}`,
                  type: 'Domain',
                  status: 'active',
                  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                });
              }
            }
            
            if (services.hosting > 0) {
              for (let i = 0; i < services.hosting; i++) {
                activeServicesList.push({
                  id: `host-${i}`,
                  name: `Web Hosting Plan ${i+1}`,
                  type: 'Hosting',
                  status: 'active',
                  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                });
              }
            }
            
            if (services.maintenance) {
              activeServicesList.push({
                id: 'maint-1',
                name: 'Monthly Maintenance Plan',
                type: 'Maintenance',
                status: 'active',
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              });
            }

            const mappedClient: Client = {
              id: item._id,
              companyName: companyName,
              website: item.website || '', 
              logo: initials,
              status: item.status || 'active', 
              industry: 'Technology',
              since: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
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
              services: services,
              billing: {
                totalSpent: 0,
                nextInvoiceDate: new Date().toISOString(),
                paymentMethod: '',
                status: 'good'
              },
              recentActivity: [],
              activeServicesList: activeServicesList
            };
            
            setClient(mappedClient);
          } else {
          console.error('Failed to fetch client details');
          toastConfig.error('Client not found or access denied');
        }
      } catch (error) {
        console.error('Error fetching client:', error);
        toastConfig.error('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClient();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
         <main className="flex-grow w-full px-10 py-[2vh]">
            <div className="w-16 h-16 bg-secondary-100 text-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Client Not Found</h1>
            <p className="text-text-secondary mb-6">The client you are looking for does not exist or has been removed.</p>
            <button 
              onClick={() => router.back()}
              className="btn btn-primary w-full sm:w-auto"
            >
              Go Back
            </button>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'inactive': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow w-full px-4 md:px-8 lg:px-12 py-8 pt-24 md:pt-28">
        {/* Navigation & Title Section */}
        <div className="max-w-full mx-auto mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6 group"
          >
            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </div>
            <span className="font-medium">Back to Clients</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-5">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 p-2 shadow-sm text-2xl font-bold
                ${client.logo === 'TC' ? 'bg-primary-100 text-primary-700' : 
                  client.logo === 'DI' ? 'bg-accent-100 text-accent-700' : 
                  client.logo === 'GS' ? 'bg-success-100 text-success-700' : 'bg-secondary-100 text-secondary-700'}`}>
                {client.logo}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-primary">{client.companyName}</h1>
                  <span className={`badge ${getStatusBadgeClass(client.status)} px-3 py-1 text-xs uppercase tracking-wide`}>
                    {client.status}
                  </span>
                </div>
                <p className="text-text-secondary text-sm md:text-base flex items-center gap-2">
                  <a href={`https://${client.website}`} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline flex items-center gap-1">
                    {client.website}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <span className="w-1 h-1 rounded-full bg-text-tertiary"></span>
                  <span>{client.industry}</span>
                  <span className="w-1 h-1 rounded-full bg-text-tertiary"></span>
                  <span>Since {new Date(client.since).getFullYear()}</span>
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-2 md:mt-0">
              <button className="btn bg-white border border-border hover:bg-surface-hover text-text-primary flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </button>
              <button className="btn btn-primary shadow-lg shadow-primary-500/20">
                Edit Client
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card p-5 border-l-4 border-l-primary flex flex-col justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Total Spent</span>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-text-primary">${client.billing.totalSpent.toLocaleString()}</span>
                  <span className="text-xs text-text-tertiary">Lifetime</span>
                </div>
              </div>
              
              <div className="card p-5 border-l-4 border-l-accent flex flex-col justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Active Services</span>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-text-primary">
                    {client.services.domains + client.services.hosting + (client.services.maintenance ? 1 : 0)}
                  </span>
                  <span className="text-xs text-text-secondary flex gap-1">
                    {client.services.domains > 0 && <span>{client.services.domains} Dom</span>}
                    {client.services.hosting > 0 && <span>{client.services.hosting} Host</span>}
                  </span>
                </div>
              </div>

              <div className="card p-5 border-l-4 border-l-success flex flex-col justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Account Health</span>
                <div className="flex items-end justify-between">
                  <span className="text-xl font-bold text-text-primary capitalize">{client.billing.status}</span>
                  <div className={`w-2 h-2 rounded-full ${client.billing.status === 'good' ? 'bg-success' : client.billing.status === 'pending' ? 'bg-warning' : 'bg-error'} mb-2`}></div>
                </div>
              </div>
            </div>

            {/* Contact & Address Information */}
            <div className="card">
              <div className="px-6 py-4 border-b border-border bg-gray-50/50 flex items-center justify-between">
                <h3 className="font-heading font-semibold text-lg text-text-primary flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Contact Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <span className="text-sm text-text-secondary block mb-1">Primary Contact</span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600 font-semibold">
                        {client.primaryContact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{client.primaryContact.name}</p>
                        <p className="text-xs text-text-secondary">{client.primaryContact.role}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-text-secondary block mb-1">Contact Details</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-text-primary">
                        <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a href={`mailto:${client.primaryContact.email}`} className="hover:text-primary transition-colors">{client.primaryContact.email}</a>
                      </div>
                      <div className="flex items-center gap-2 text-text-primary">
                        <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href={`tel:${client.primaryContact.phone}`} className="hover:text-primary transition-colors">{client.primaryContact.phone}</a>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <span className="text-sm text-text-secondary block mb-1">Office Address</span>
                    <div className="flex items-start gap-2 text-text-primary bg-secondary-50 p-3 rounded-lg border border-border">
                      <svg className="w-5 h-5 text-text-tertiary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>
                        {client.address.street}<br />
                        {client.address.city}, {client.address.state} {client.address.zip}<br />
                        {client.address.country}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Services List */}
            <div className="card">
              <div className="px-6 py-4 border-b border-border bg-gray-50/50 flex items-center justify-between">
                <h3 className="font-heading font-semibold text-lg text-text-primary flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Active Services
                </h3>
                <button className="text-sm text-primary hover:text-primary-700 font-medium hover:underline">Manage All</button>
              </div>
              <div className="p-0">
                <table className="w-full">
                  <thead className="bg-secondary-50 text-xs text-text-secondary uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium">Service Name</th>
                      <th className="px-6 py-3 text-left font-medium">Type</th>
                      <th className="px-6 py-3 text-left font-medium">Status</th>
                      <th className="px-6 py-3 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {client.activeServicesList.map((service) => (
                      <tr key={service.id} className="hover:bg-surface-hover transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-text-primary">{service.name}</td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border
                            ${service.type === 'Domain' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                              service.type === 'Hosting' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                              'bg-orange-50 text-orange-700 border-orange-100'}`}>
                            {service.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
                            ${service.status === 'active' ? 'bg-success-100 text-success-700' : 
                              service.status === 'expiring' ? 'bg-warning-100 text-warning-700' : 
                              'bg-red-100 text-red-700'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${service.status === 'active' ? 'bg-success-500' : service.status === 'expiring' ? 'bg-warning-500' : 'bg-red-500'}`}></span>
                            {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-text-tertiary hover:text-primary transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="card overflow-hidden">
              <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-gray-50/50">
                <h3 className="font-heading font-semibold text-lg text-text-primary flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Recent Activity
                </h3>
                <button className="text-sm text-primary hover:text-primary-700 font-medium hover:underline">View Full History</button>
              </div>
              
              <div className="p-6">
                {client.recentActivity && client.recentActivity.length > 0 ? (
                  <div className="relative border-l-2 border-border ml-3 space-y-8 pl-8 py-2">
                    {client.recentActivity.map((activity, i) => (
                      <div key={i} className="relative group">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10 
                          ${activity.type === 'success' ? 'bg-success-100 ring-4 ring-success-50' : 
                            activity.type === 'warning' ? 'bg-warning-100 ring-4 ring-warning-50' : 
                            activity.type === 'error' ? 'bg-red-100 ring-4 ring-red-50' : 'bg-blue-100 ring-4 ring-blue-50'}`}>
                          {activity.type === 'success' ? (
                            <svg className="w-3 h-3 text-success-700" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          ) : activity.type === 'warning' ? (
                            <svg className="w-3 h-3 text-warning-700" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                          ) : activity.type === 'info' ? (
                             <svg className="w-3 h-3 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                            </svg>
                          ) : (
                             <svg className="w-3 h-3 text-red-700" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                            </svg>
                          )}
                        </div>
                        
                        <div className="bg-surface-hover/50 p-4 rounded-lg border border-transparent group-hover:border-border group-hover:bg-surface-hover transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
                            <h4 className="text-base font-semibold text-text-primary">{activity.action}</h4>
                            <span className="text-xs text-text-tertiary whitespace-nowrap">{activity.date}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs mt-2">
                            <span className="flex items-center gap-1 text-text-secondary">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {activity.user}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-secondary">
                    No recent activity recorded.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6">
            
            {/* Billing Status Card */}
            <div className="card bg-gradient-to-br from-secondary-900 to-secondary-800 text-white border-none">
              <div className="p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                   </svg>
                </div>
                
                <h4 className="font-heading font-semibold text-white/90 mb-4 relative z-10">Billing Status</h4>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-200 block">Next Invoice</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${client.billing.status === 'overdue' ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
                      {client.billing.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xl font-bold tracking-wide block">{new Date(client.billing.nextInvoiceDate).toLocaleDateString(undefined, {weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'})}</span>
                  
                  <div className="h-px bg-white/10 w-full"></div>
                  
                  <div className="flex items-center gap-3">
                     <div className="p-2 rounded bg-white/10">
                        <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                     </div>
                     <div>
                        <span className="text-xs text-blue-200 block">Payment Method</span>
                        <span className="text-sm font-medium">{client.billing.paymentMethod}</span>
                     </div>
                  </div>

                  <button className="w-full btn bg-white text-secondary-900 hover:bg-gray-100 border-none mt-2 font-semibold">
                    View Invoices
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="px-5 py-4 border-b border-border">
                <h4 className="font-heading font-semibold text-text-primary">Quick Actions</h4>
              </div>
              <div className="p-2">
                <button className="w-full text-left px-4 py-3 hover:bg-surface-hover rounded-lg transition-colors flex items-center gap-3 text-text-secondary hover:text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add New Service</span>
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-surface-hover rounded-lg transition-colors flex items-center gap-3 text-text-secondary hover:text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Log Interaction</span>
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-surface-hover rounded-lg transition-colors flex items-center gap-3 text-text-secondary hover:text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>View Customer Portal</span>
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="card">
               <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h4 className="font-heading font-semibold text-text-primary">Internal Notes</h4>
                <button className="text-xs text-primary font-medium hover:underline">Edit</button>
              </div>
              <div className="p-5">
                <p className="text-sm text-text-secondary italic">
                  "Client prefers communication via email. Always double-check invoice details before sending."
                </p>
                <div className="mt-4 text-xs text-text-tertiary">
                  Last updated by Admin on Dec 10, 2025
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
