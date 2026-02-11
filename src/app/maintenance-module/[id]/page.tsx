'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MOCK_PROJECTS, MOCK_TEAM, TeamMember } from '@/data/mock-maintenance-data';

export default function ProjectDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const selectedProject = MOCK_PROJECTS.find(p => p.id === id);

  if (!selectedProject) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow w-full px-10 py-[2vh]">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-secondary-100 text-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Project Not Found</h1>
            <p className="text-text-secondary mb-6">The project you are looking for does not exist or has been removed.</p>
            <button 
              onClick={() => router.back()}
              className="btn btn-primary w-full sm:w-auto"
            >
              Go Back
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Helpers
  const getTeamMembers = (memberIds: string[]) => {
    return memberIds.map(id => MOCK_TEAM.find(m => m.id === id)).filter(Boolean) as TeamMember[];
  };

  const getRemainingMonths = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffMonths = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
    return Math.max(0, diffMonths);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'on-hold': return 'badge-secondary'; // Changed from badge-primary to badge-secondary for better semantics
      case 'completed': return 'badge-primary';
      default: return 'badge-secondary';
    }
  };

  const getClientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getClientColorClass = (clientId: string) => {
    if (clientId === 'techcorp') return 'bg-primary-100 text-primary-700';
    if (clientId === 'digital') return 'bg-accent-100 text-accent-700';
    if (clientId === 'greenstart') return 'bg-success-100 text-success-700';
    return 'bg-secondary-100 text-secondary-700';
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow w-full px-10 py-[2vh]">
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
            <span className="font-medium">Back to Projects</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-5">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-bold shadow-inner ${getClientColorClass(selectedProject.clientId)}`}>
                {getClientInitials(selectedProject.client)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-primary">{selectedProject.client}</h1>
                  <span className={`badge ${getStatusBadgeClass(selectedProject.status)} px-3 py-1 text-xs uppercase tracking-wide`}>
                    {selectedProject.status.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-text-secondary text-sm md:text-base flex items-center gap-2">
                  <span className="font-medium text-text-primary">{selectedProject.name}</span>
                  <span className="w-1 h-1 rounded-full bg-text-tertiary"></span>
                  <span>{selectedProject.type}</span>
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-2 md:mt-0">
              <button className="btn bg-white border border-border hover:bg-surface-hover text-text-primary">
                Edit Details
              </button>
              <button className="btn btn-primary shadow-lg shadow-primary-500/20">
                New Request
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
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Monthly Value</span>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-text-primary">${selectedProject.monthlyValue.toLocaleString()}</span>
                  <span className="text-xs text-success-600 bg-success-50 px-2 py-1 rounded-full font-medium">+5% YoY</span>
                </div>
              </div>
              
              <div className="card p-5 border-l-4 border-l-accent flex flex-col justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Contract End</span>
                <div className="flex items-end justify-between">
                  <span className="text-xl font-bold text-text-primary">{formatDate(selectedProject.endDate)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRemainingMonths(selectedProject.endDate) < 3 ? 'bg-red-50 text-red-600' : 'bg-success-50 text-success-600'}`}>
                    {getRemainingMonths(selectedProject.endDate)} mo left
                  </span>
                </div>
              </div>

              <div className="card p-5 border-l-4 border-l-success flex flex-col justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Health Score</span>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-text-primary">98%</span>
                  <span className="text-xs text-text-secondary">Excellent</span>
                </div>
              </div>
            </div>

            {/* Recent Changes Timeline */}
            <div className="card overflow-hidden">
              <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-gray-50/50">
                <h3 className="font-heading font-semibold text-lg text-text-primary flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Recent Activity & Changes
                </h3>
                <button className="text-sm text-primary hover:text-primary-700 font-medium hover:underline">View Full Log</button>
              </div>
              
              <div className="p-6">
                {selectedProject.recentChanges && selectedProject.recentChanges.length > 0 ? (
                  <div className="relative border-l-2 border-border ml-3 space-y-8 pl-8 py-2">
                    {selectedProject.recentChanges.map((change, i) => (
                      <div key={i} className="relative group">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10 
                          ${change.type === 'free' ? 'bg-success-100 ring-4 ring-success-50' : 'bg-warning-100 ring-4 ring-warning-50'}`}>
                          {change.type === 'free' ? (
                            <svg className="w-3 h-3 text-success-700" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 text-warning-700" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                          )}
                        </div>
                        
                        <div className="bg-surface-hover/50 p-4 rounded-lg border border-transparent group-hover:border-border group-hover:bg-surface-hover transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
                            <h4 className="text-base font-semibold text-text-primary">{change.title}</h4>
                            <span className="text-xs text-text-tertiary whitespace-nowrap">{change.date}</span>
                          </div>
                          <p className="text-sm text-text-secondary mb-3">{change.desc}</p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className={`px-2 py-0.5 rounded-md font-medium border ${
                              change.type === 'free' 
                                ? 'bg-success-50 text-success-700 border-success-100' 
                                : 'bg-warning-50 text-warning-700 border-warning-100'
                            }`}>
                              {change.type === 'paid' && change.cost ? `$${change.cost} Paid Change` : 'Standard Request'}
                            </span>
                            <span className="flex items-center gap-1 text-text-secondary">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {change.author}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-secondary">
                    No recent changes recorded.
                  </div>
                )}
              </div>
            </div>

             {/* Project Notes Section (Placeholder for future) */}
             <div className="card">
              <div className="px-6 py-4 border-b border-border bg-gray-50/50">
                <h3 className="font-heading font-semibold text-lg text-text-primary">Project Notes</h3>
              </div>
              <div className="p-6">
                <p className="text-text-secondary text-sm leading-relaxed">
                  {selectedProject.notes || "No additional notes for this project."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6">
            
            {/* AMC Status Card */}
            <div className="card">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h4 className="font-heading font-semibold text-text-primary">Maintenance Stats</h4>
                <button className="text-text-tertiary hover:text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </button>
              </div>
              <div className="p-5 space-y-6">
                {/* Free Changes Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-text-secondary">Free Changes</span>
                    <span className="text-sm font-bold text-text-primary">{selectedProject.freeChanges.used}/{selectedProject.freeChanges.total}</span>
                  </div>
                  <div className="w-full bg-secondary-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        (selectedProject.freeChanges.used / selectedProject.freeChanges.total) > 0.8 ? 'bg-warning' : 'bg-success'
                      }`} 
                      style={{ width: `${(selectedProject.freeChanges.used / selectedProject.freeChanges.total) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-text-tertiary mt-1.5">Resets on {new Date(selectedProject.startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</p>
                </div>

                {/* Paid Changes Summary */}
                <div className="bg-surface-hover rounded-lg p-3 border border-border">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-text-primary">Paid Requests</span>
                    <span className="text-lg font-bold text-accent-600">{selectedProject.paidChanges}</span>
                  </div>
                  <p className="text-xs text-text-secondary">Total extra billable work this cycle</p>
                </div>

                 {/* Quick Actions */}
                 <div className="pt-2">
                  <button className="w-full btn bg-white border border-border text-text-secondary hover:text-primary hover:border-primary text-sm py-2">
                    Download Contract PDF
                  </button>
                 </div>
              </div>
            </div>

            {/* Team Members Card */}
            <div className="card">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h4 className="font-heading font-semibold text-text-primary">Assigned Team</h4>
                <button className="text-xs text-primary font-medium hover:underline">Manage</button>
              </div>
              <div className="p-2">
                {getTeamMembers(selectedProject.team).map((member, index) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 hover:bg-surface-hover rounded-lg transition-colors cursor-pointer group">
                    <div className="relative">
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-10 h-10 rounded-full object-cover border border-border group-hover:border-primary transition-colors" 
                        onError={(e) => {e.currentTarget.src='https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=2940&auto=format&fit=crop';}}
                      />
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-white" title="Lead">
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-text-primary truncate">{member.name}</p>
                      <p className="text-xs text-text-secondary truncate">{member.role}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-text-primary">{member.projects.find(p => p.name === selectedProject.client)?.allocation || 0}%</span>
                      <span className="text-[10px] text-text-tertiary block">Alloc.</span>
                    </div>
                  </div>
                ))}
                
                <button className="w-full mt-2 text-xs text-text-tertiary hover:text-primary py-2 border-t border-dashed border-border flex items-center justify-center gap-1 transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Add Team Member
                </button>
              </div>
            </div>

            {/* Contract Info */}
            <div className="card bg-gradient-to-br from-primary-900 to-primary-800 text-white border-none">
              <div className="p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                   </svg>
                </div>
                
                <h4 className="font-heading font-semibold text-white/90 mb-4 relative z-10">Contract Status</h4>
                <div className="space-y-4 relative z-10">
                  <div>
                    <span className="text-xs text-blue-200 block mb-1">Plan Type</span>
                    <span className="text-lg font-bold tracking-wide">Premium Maintenance</span>
                  </div>
                  <div className="h-px bg-white/10 w-full"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-blue-200 block">Renewal</span>
                      <span className="font-medium text-sm">{formatDate(selectedProject.endDate)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-blue-200 block">Autopay</span>
                      <span className="font-medium text-sm flex items-center gap-1">
                        <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        Active
                      </span>
                    </div>
                  </div>
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
