'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MOCK_BACKUP_PROJECTS, BackupProject, BackupEntry } from '@/data/mock-backup-data';

export default function BackupsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(MOCK_BACKUP_PROJECTS[0].id);
  const [selectedBackup, setSelectedBackup] = useState<BackupEntry | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const selectedProject = MOCK_BACKUP_PROJECTS.find(p => p.id === selectedProjectId) || MOCK_BACKUP_PROJECTS[0];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
        return 'bg-success-50 text-success-700 border-success-100';
      case 'Failed':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      default:
        return 'bg-secondary-50 text-secondary-700 border-secondary-100';
    }
  };

  const openDetails = (backup: BackupEntry) => {
    setSelectedBackup(backup);
    setIsDetailsOpen(true);
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow w-full px-10 py-[2vh]">
          
          {/* Page Header & Project Selection */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-heading font-bold text-text-primary">Backup Manager</h1>
              <p className="text-text-secondary mt-1">Monitor, manage, and restore project backups.</p>
            </div>
            
            <div className="w-full md:w-72">
              <label className="block text-sm font-medium text-text-secondary mb-1">Select Project</label>
              <div className="relative">
                <select 
                  className="w-full pl-4 pr-10 py-2.5 bg-surface border border-border rounded-lg text-text-primary appearance-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow cursor-pointer"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  {MOCK_BACKUP_PROJECTS.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-text-tertiary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Backup Summary Card */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  selectedProject.environment === 'Production' ? 'bg-primary-100 text-primary-600' :
                  selectedProject.environment === 'Staging' ? 'bg-accent-100 text-accent-600' :
                  'bg-secondary-100 text-secondary-600'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-text-primary">{selectedProject.name}</h2>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                      selectedProject.status === 'Active' ? 'bg-success-50 text-success-700 border-success-100' : 'bg-secondary-50 text-secondary-700 border-secondary-100'
                    }`}>
                      {selectedProject.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">{selectedProject.environment} Environment • Total Size: {selectedProject.totalSize}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="btn bg-white border border-border hover:bg-surface-hover text-text-primary flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
                <button className="btn btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Backup Now
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Last Backup</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${selectedProject.lastBackupStatus === 'Success' ? 'bg-success-500' : selectedProject.lastBackupStatus === 'Failed' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                  <span className="font-medium text-text-primary">{formatDate(selectedProject.lastBackup)}</span>
                </div>
                <span className="text-xs text-text-tertiary ml-4.5">{selectedProject.lastBackupStatus}</span>
              </div>
              
              <div>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Next Scheduled</span>
                <div className="flex items-center gap-2 mt-1">
                  <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-text-primary">{selectedProject.schedule.enabled ? formatDate(selectedProject.nextBackup) : 'Disabled'}</span>
                </div>
                <span className="text-xs text-text-tertiary ml-6">{selectedProject.schedule.frequency} at {selectedProject.schedule.time}</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Backup Type</span>
                <div className="flex items-center gap-2 mt-1">
                  <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  <span className="font-medium text-text-primary">{selectedProject.backupType}</span>
                </div>
                <span className="text-xs text-text-tertiary ml-6">Preferred</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Retention Policy</span>
                <div className="flex items-center gap-2 mt-1">
                  <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="font-medium text-text-primary">{selectedProject.schedule.retentionCount} Backups</span>
                </div>
                <span className="text-xs text-text-tertiary ml-6">Rolling history</span>
              </div>
            </div>
          </div>

          {/* Backup History Table */}
          <div className="card overflow-hidden my-4 border border-border shadow-sm bg-surface">
            <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-lg font-heading font-bold text-text-primary">Backup History</h3>
              <div className="flex gap-2 w-full sm:w-auto">
                <input 
                  type="text" 
                  placeholder="Search backups..." 
                  className="w-full sm:w-64 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button className="p-2 border border-border rounded-lg hover:bg-surface-hover text-text-secondary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Backup ID</th>
                    <th>Date & Time</th>
                    <th>Type</th>
                    <th>Content</th>
                    <th>Size</th>
                    <th className="flex items-center justify-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProject.backups.map((backup) => (
                    <tr 
                      key={backup.id} 
                      className="cursor-pointer hover:bg-surface-hover transition-smooth"
                      onClick={(e) => {
                        if (!(e.target as HTMLElement).closest('button')) {
                          openDetails(backup);
                        }
                      }}
                    >
                      <td>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(backup.status)}`}>
                          {backup.status}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-sm text-text-primary">
                          {backup.id}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-text-primary">
                          {formatDate(backup.date)}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-text-secondary">
                          {backup.type}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {backup.includedData.database && <span title="Database" className="p-1 bg-blue-50 text-blue-600 rounded">DB</span>}
                          {backup.includedData.files && <span title="Files" className="p-1 bg-yellow-50 text-yellow-600 rounded">Files</span>}
                          {backup.includedData.assets && <span title="Assets" className="p-1 bg-purple-50 text-purple-600 rounded">Assets</span>}
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-text-primary font-medium">
                          {backup.size}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetails(backup);
                            }}
                            className="p-2 rounded-lg hover:bg-surface-hover transition-smooth" 
                            title="View Details"
                          >
                            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg hover:bg-surface-hover transition-smooth" 
                            title="Download"
                          >
                            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                          </button>
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg hover:bg-surface-hover transition-smooth" 
                            title="Delete"
                          >
                            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {selectedProject.backups.length === 0 && (
              <div className="p-8 text-center text-text-secondary">
                No backups found for this project.
              </div>
            )}
          </div>
      
      </main>
      
      {/* Details Modal */}
      {isDetailsOpen && selectedBackup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsDetailsOpen(false)}>
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-heading font-bold text-text-primary">Backup Details</h3>
              <button onClick={() => setIsDetailsOpen(false)} className="text-text-tertiary hover:text-text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Backup ID</p>
                  <p className="text-lg font-mono font-bold text-text-primary">{selectedBackup.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-secondary">Created On</p>
                  <p className="text-base font-medium text-text-primary">{formatDate(selectedBackup.date)}</p>
                </div>
              </div>

              {/* Status & Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-background rounded-lg border border-border">
                <div>
                  <span className="text-xs text-text-secondary uppercase">Status</span>
                  <div className="mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(selectedBackup.status)}`}>
                      {selectedBackup.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-text-secondary uppercase">Type</span>
                  <p className="font-medium text-text-primary">{selectedBackup.type}</p>
                </div>
                <div>
                  <span className="text-xs text-text-secondary uppercase">Created By</span>
                  <p className="font-medium text-text-primary">{selectedBackup.metadata?.createdBy || 'System'}</p>
                </div>
                <div>
                  <span className="text-xs text-text-secondary uppercase">Server Region</span>
                  <p className="font-medium text-text-primary">{selectedBackup.metadata?.server || 'N/A'}</p>
                </div>
              </div>

              {/* Content Breakdown */}
              <div>
                <h4 className="font-medium text-text-primary mb-3">Included Content</h4>
                <div className="space-y-3">
                  {selectedBackup.includedData.database && (
                    <div className="flex items-center justify-between p-3 rounded border border-border hover:bg-surface-hover">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-text-primary">Database</p>
                          <p className="text-xs text-text-secondary">{selectedBackup.metadata?.dbInfo.name} • {selectedBackup.metadata?.dbInfo.tables} tables</p>
                        </div>
                      </div>
                      <span className="text-sm font-mono text-text-secondary">{selectedBackup.metadata?.dbInfo.size}</span>
                    </div>
                  )}
                  
                  {selectedBackup.includedData.files && (
                    <div className="flex items-center justify-between p-3 rounded border border-border hover:bg-surface-hover">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-text-primary">File System</p>
                          <p className="text-xs text-text-secondary">{selectedBackup.metadata?.fileInfo.fileCount} files tracked</p>
                        </div>
                      </div>
                      <span className="text-sm font-mono text-text-secondary">{selectedBackup.metadata?.fileInfo.totalSize}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Info */}
              <div className="flex items-center gap-2 text-sm text-text-secondary bg-gray-50 p-3 rounded">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>This backup is encrypted at rest (AES-256)</span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border bg-gray-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsDetailsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Close
              </button>
              <button className="btn btn-primary shadow-lg shadow-primary-500/20 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Download Archive
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}
