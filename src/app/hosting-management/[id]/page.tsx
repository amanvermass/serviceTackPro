'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MOCK_HOSTING_ACCOUNTS } from '@/data/mock-hosting-data';

export default function HostingDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const account = MOCK_HOSTING_ACCOUNTS.find(a => a.id === id);

  if (!account) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
         <main className="flex-grow w-full px-10 py-[2vh]">
            <div className="w-16 h-16 bg-secondary-100 text-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Account Not Found</h1>
            <p className="text-text-secondary mb-6">The hosting account you are looking for does not exist or has been removed.</p>
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
      case 'Active': return 'badge-success';
      case 'Expiring Soon': return 'badge-warning';
      case 'Expired': return 'badge-danger';
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
            <span className="font-medium">Back to Hosting</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white border border-border flex items-center justify-center flex-shrink-0 p-2 shadow-sm">
                <img src={account.providerLogo} alt={account.provider} className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-primary">{account.clientName}</h1>
                  <span className={`badge ${getStatusBadgeClass(account.status)} px-3 py-1 text-xs uppercase tracking-wide`}>
                    {account.status}
                  </span>
                </div>
                <p className="text-text-secondary text-sm md:text-base flex items-center gap-2">
                  <a href={`https://${account.clientDomain}`} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline flex items-center gap-1">
                    {account.clientDomain}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <span className="w-1 h-1 rounded-full bg-text-tertiary"></span>
                  <span>{account.serviceType}</span>
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-2 md:mt-0">
              <button className="btn bg-white border border-border hover:bg-surface-hover text-text-primary flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Control Panel
              </button>
              <button className="btn btn-primary shadow-lg shadow-primary-500/20">
                Edit Details
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
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Monthly Cost</span>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-text-primary">${account.monthlyCost.toFixed(2)}</span>
                  <span className="text-xs text-text-tertiary">Billed Monthly</span>
                </div>
              </div>
              
              <div className="card p-5 border-l-4 border-l-accent flex flex-col justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Bandwidth</span>
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-end">
                    <span className="text-xl font-bold text-text-primary">{account.bandwidthUsage}%</span>
                    <span className="text-xs text-text-secondary">{account.bandwidthLabel}</span>
                  </div>
                  <div className="w-full bg-secondary-100 rounded-full h-1.5 mt-1">
                    <div className={`h-1.5 rounded-full ${account.bandwidthUsage > 80 ? 'bg-warning' : 'bg-accent'}`} style={{ width: `${account.bandwidthUsage}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="card p-5 border-l-4 border-l-success flex flex-col justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Disk Usage</span>
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-end">
                    <span className="text-xl font-bold text-text-primary">{account.diskUsage}%</span>
                    <span className="text-xs text-text-secondary">{account.diskLabel}</span>
                  </div>
                  <div className="w-full bg-secondary-100 rounded-full h-1.5 mt-1">
                    <div className={`h-1.5 rounded-full ${account.diskUsage > 80 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${account.diskUsage}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Server Information */}
            <div className="card">
              <div className="px-6 py-4 border-b border-border bg-gray-50/50 flex items-center justify-between">
                <h3 className="font-heading font-semibold text-lg text-text-primary flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  Server Specification
                </h3>
                <span className="badge badge-success flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                  Online
                </span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <span className="text-sm text-text-secondary block mb-1">IP Address</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-text-primary bg-secondary-50 px-2 py-1 rounded border border-border">{account.serverInfo?.ipAddress || 'N/A'}</span>
                      <button className="text-text-tertiary hover:text-primary transition-colors" title="Copy IP">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary block mb-1">Operating System</span>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-text-primary font-medium">{account.serverInfo?.os || 'Unknown'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary block mb-1">Data Center Region</span>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-text-primary font-medium uppercase">{account.serverInfo?.region || 'Unknown'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary block mb-1">Tech Stack</span>
                    <div className="flex flex-wrap gap-2">
                      {account.serverInfo?.phpVersion && (
                        <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">PHP {account.serverInfo.phpVersion}</span>
                      )}
                      {account.serverInfo?.nodeVersion && (
                        <span className="px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-medium border border-green-100">Node {account.serverInfo.nodeVersion}</span>
                      )}
                      {account.serverInfo?.dbType && (
                        <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">{account.serverInfo.dbType}</span>
                      )}
                      {!account.serverInfo && <span className="text-text-tertiary text-sm">N/A</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details & Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Details */}
              <div className="card">
                <div className="px-6 py-4 border-b border-border bg-gray-50/50">
                  <h3 className="font-heading font-semibold text-lg text-text-primary">Account Details</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-sm text-text-secondary block mb-1">Service Type</span>
                    <span className="font-medium text-text-primary">{typeof account.serviceType === 'object' ? account.serviceType.name : account.serviceType}</span>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary block mb-1">Monthly Cost</span>
                    <span className="font-medium text-text-primary">${account.monthlyCost.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary block mb-1">Renewal Date</span>
                    <span className="font-medium text-text-primary">{new Date(account.renewalDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="card">
                <div className="px-6 py-4 border-b border-border bg-gray-50/50">
                  <h3 className="font-heading font-semibold text-lg text-text-primary">Included Features</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {account.features?.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-text-secondary">{feature}</span>
                      </li>
                    ))}
                    {(!account.features || account.features.length === 0) && (
                      <li className="text-text-tertiary italic">No specific features listed</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6">
            
            {/* Renewal Status Card */}
            <div className="card bg-gradient-to-br from-secondary-900 to-secondary-800 text-white border-none">
              <div className="p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                   </svg>
                </div>
                
                <h4 className="font-heading font-semibold text-white/90 mb-4 relative z-10">Renewal Status</h4>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-200 block">Next Renewal</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${account.daysLeft < 30 ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
                      {account.daysLeft} days
                    </span>
                  </div>
                  <span className="text-xl font-bold tracking-wide block">{new Date(account.renewalDate).toLocaleDateString(undefined, {weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'})}</span>
                  
                  <div className="h-px bg-white/10 w-full"></div>
                  
                  <div className="flex items-center gap-3">
                     <div className="p-2 rounded bg-white/10">
                        <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                     </div>
                     <div>
                        <span className="text-xs text-blue-200 block">Payment Method</span>
                        <span className="text-sm font-medium">Visa ending in 4242</span>
                     </div>
                  </div>

                  <button className="w-full btn bg-white text-secondary-900 hover:bg-gray-100 border-none mt-2 font-semibold">
                    Renew Now
                  </button>
                </div>
              </div>
            </div>

            {/* Features & Addons */}
            <div className="card">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h4 className="font-heading font-semibold text-text-primary">Included Features</h4>
                <button className="text-xs text-primary font-medium hover:underline">Manage</button>
              </div>
              <div className="p-5">
                <ul className="space-y-3">
                  {account.features?.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-text-secondary">
                      <svg className="w-5 h-5 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                  <li className="flex items-center gap-3 text-sm text-text-tertiary">
                    <svg className="w-5 h-5 text-text-tertiary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add more features...
                  </li>
                </ul>
              </div>
            </div>

            {/* Quick Support */}
             <div className="card p-5">
              <h4 className="font-heading font-semibold text-text-primary mb-3">Support & Access</h4>
              <div className="space-y-3">
                <button className="w-full btn btn-outline flex items-center justify-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Contact {account.provider} Support
                </button>
                <button className="w-full btn btn-outline flex items-center justify-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Reset Credentials
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
