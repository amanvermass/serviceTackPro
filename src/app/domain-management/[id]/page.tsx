'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MOCK_DOMAINS } from '@/data/mock-domain-data';

export default function DomainDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const domain = MOCK_DOMAINS.find(d => d.id === id);

  if (!domain) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
         <main className="flex-grow w-full px-10 py-[2vh]">
            <div className="w-16 h-16 bg-secondary-100 text-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Domain Not Found</h1>
            <p className="text-text-secondary mb-6">The domain you are looking for does not exist or has been removed.</p>
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
      case 'renewed': return 'badge-success';
      case 'expiring': return 'badge-warning';
      case 'expired': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  const getSslStatusBadgeClass = (active: boolean) => {
    return active ? 'badge-success' : 'badge-danger';
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
            <span className="font-medium">Back to Domains</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white border border-border flex items-center justify-center flex-shrink-0 p-2 shadow-sm">
                {domain.vendorLogo ? (
                    <img src={domain.vendorLogo} alt={domain.vendor} className="w-full h-full object-contain" />
                ) : (
                    <span className="text-2xl font-bold text-primary">{domain.name.substring(0, 1).toUpperCase()}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-primary">{domain.name}</h1>
                  <span className={`badge ${getStatusBadgeClass(domain.status)} px-3 py-1 text-xs uppercase tracking-wide`}>
                    {domain.status}
                  </span>
                </div>
                <p className="text-text-secondary text-sm md:text-base flex items-center gap-2">
                  <span className="font-medium">{domain.client}</span>
                  <span className="w-1 h-1 rounded-full bg-text-tertiary"></span>
                  <a href={`https://${domain.name}`} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline flex items-center gap-1">
                    Visit Site
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-2 md:mt-0">
              <button className="btn bg-white border border-border hover:bg-surface-hover text-text-primary flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage DNS
              </button>
              <button className="btn btn-primary shadow-lg shadow-primary-500/20">
                Renew Domain
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
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Annual Cost</span>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-text-primary">${domain.cost.toFixed(2)}</span>
                  <span className="text-xs text-text-tertiary">Per Year</span>
                </div>
              </div>
              
              <div className="card p-5 border-l-4 border-l-accent flex flex-col justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Days Remaining</span>
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-end">
                    <span className={`text-xl font-bold ${domain.daysRemaining < 30 ? 'text-warning' : 'text-text-primary'}`}>
                      {domain.daysRemaining} Days
                    </span>
                    <span className="text-xs text-text-secondary">{domain.expiryDate}</span>
                  </div>
                  <div className="w-full bg-secondary-100 rounded-full h-1.5 mt-1">
                    <div 
                        className={`h-1.5 rounded-full ${domain.daysRemaining < 30 ? 'bg-warning' : 'bg-accent'}`} 
                        style={{ width: `${Math.min(Math.max((domain.daysRemaining / 365) * 100, 5), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="card p-5 border-l-4 border-l-success flex flex-col justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">SSL Status</span>
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-end">
                    <span className={`text-xl font-bold ${domain.sslStatus.active ? 'text-success' : 'text-danger'}`}>
                      {domain.sslStatus.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-text-secondary">{domain.sslStatus.provider}</span>
                  </div>
                   <div className="flex items-center gap-1 mt-1 text-xs text-text-tertiary">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      {domain.sslStatus.autoRenew ? 'Auto-renews' : 'Manual renewal'}
                   </div>
                </div>
              </div>
            </div>

            {/* Registrar Information */}
            <div className="card">
              <div className="px-6 py-4 border-b border-border bg-gray-50/50 flex items-center justify-between">
                <h3 className="font-heading font-semibold text-lg text-text-primary flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Registrar Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <span className="text-sm text-text-secondary block mb-1">Registrar Name</span>
                    <div className="flex items-center gap-2">
                      <span className="text-text-primary font-medium">{domain.registrarInfo.name}</span>
                      <a href={domain.registrarInfo.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center gap-0.5">
                        Login
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary block mb-1">Account User</span>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-text-primary font-medium">{domain.registrarInfo.accountUser}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary block mb-1">Support Email</span>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${domain.registrarInfo.supportEmail}`} className="text-primary hover:underline font-medium">{domain.registrarInfo.supportEmail}</a>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary block mb-1">Auth Code</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-secondary-50 px-2 py-1 rounded border border-border text-sm font-mono text-text-primary">
                        {domain.authCode}
                      </code>
                      <button className="text-text-tertiary hover:text-primary transition-colors" title="Copy Auth Code">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-border">
                    <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Nameservers</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {domain.nameservers.map((ns, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-3 bg-secondary-50 rounded-lg border border-border">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                </svg>
                                <span className="font-mono text-sm text-text-primary">{ns}</span>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </div>

            {/* DNS Records */}
            <div className="card">
                <div className="px-6 py-4 border-b border-border bg-gray-50/50 flex items-center justify-between">
                    <h3 className="font-heading font-semibold text-lg text-text-primary flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        DNS Records
                    </h3>
                    <button className="text-sm text-primary font-medium hover:underline">Edit Records</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary-50 border-b border-border">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Value</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">TTL</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {domain.dnsRecords.length > 0 ? (
                                domain.dnsRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-surface-hover transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 rounded text-xs font-bold bg-secondary-100 text-secondary-700 border border-secondary-200">
                                                {record.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-mono">{record.name}</td>
                                        <td className="px-6 py-4 text-sm text-text-primary font-mono max-w-xs truncate" title={record.value}>{record.value}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{record.ttl}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-text-tertiary">
                                        No DNS records available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="px-6 py-4 border-b border-border bg-gray-50/50">
                <h3 className="font-heading font-semibold text-lg text-text-primary flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent Activity
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {domain.activityLog.length > 0 ? (
                    domain.activityLog.map((log) => (
                        <div key={log.id} className="relative pl-10">
                        <div className={`absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 ${
                            log.status === 'success' ? 'bg-success-100 text-success-600' :
                            log.status === 'warning' ? 'bg-warning-100 text-warning-600' :
                            'bg-danger-100 text-danger-600'
                        }`}>
                            {log.status === 'success' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : log.status === 'warning' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <p className="text-text-primary font-medium">{log.action}</p>
                            <p className="text-text-secondary text-sm mt-0.5 flex items-center gap-2">
                            <span>{log.date}</span>
                            <span className="w-1 h-1 rounded-full bg-text-tertiary"></span>
                            <span>{log.user}</span>
                            </p>
                        </div>
                        </div>
                    ))
                  ) : (
                      <div className="pl-10 text-text-tertiary italic">No recent activity</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6">
            
            {/* Renewal Status */}
            <div className="card overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Renewal Status
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Next Due Date</span>
                  <span className={`font-bold ${domain.daysRemaining < 30 ? 'text-warning' : 'text-text-primary'}`}>{domain.expiryDate}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-text-primary font-medium">Auto-Renewal</span>
                    <span className="text-xs text-text-secondary">Charge card on file</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={domain.autoRenew} readOnly />
                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                  </label>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-secondary">Payment Method</span>
                    <button className="text-primary text-sm font-medium hover:underline">Update</button>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg border border-border">
                    <div className="w-8 h-5 bg-white border border-border rounded flex items-center justify-center">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 10h20M7 15h2M2 6h20a2 2 0 012 2v10a2 2 0 01-2 2H2a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <span className="text-sm text-text-primary font-medium">Visa ending in 4242</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Client/Contact Info */}
            <div className="card">
              <div className="px-6 py-4 border-b border-border bg-gray-50/50">
                <h3 className="font-heading font-semibold text-lg text-text-primary flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Contact Information
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Registrant</span>
                  <p className="text-text-primary font-medium">{domain.contact}</p>
                  <p className="text-text-secondary text-sm">{domain.client}</p>
                </div>
                
                <div>
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Admin Email</span>
                  <a href={`mailto:admin@${domain.name}`} className="text-primary hover:underline flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    admin@{domain.name}
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="px-6 py-4 border-b border-border bg-gray-50/50">
                <h3 className="font-heading font-semibold text-lg text-text-primary">Quick Actions</h3>
              </div>
              <div className="p-4 space-y-2">
                <button className="w-full btn bg-white border border-border hover:bg-surface-hover text-left flex items-center justify-between group">
                  <span className="text-text-primary group-hover:text-primary transition-colors">Transfer Domain</span>
                  <svg className="w-4 h-4 text-text-tertiary group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <button className="w-full btn bg-white border border-border hover:bg-surface-hover text-left flex items-center justify-between group">
                  <span className="text-text-primary group-hover:text-primary transition-colors">Update Contact Info</span>
                  <svg className="w-4 h-4 text-text-tertiary group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button className="w-full btn bg-white border border-border hover:bg-red-50 text-left flex items-center justify-between group border-b-0">
                  <span className="text-danger group-hover:text-red-700 transition-colors">Delete Domain</span>
                  <svg className="w-4 h-4 text-danger group-hover:text-red-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}