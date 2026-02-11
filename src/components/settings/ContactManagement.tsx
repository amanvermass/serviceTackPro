'use client';

import React from 'react';

export default function ContactManagement() {
  return (
    <div id="contacts-tab" className="tab-content animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Contact Settings */}
        <div className="card">
          <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Primary Contact Designation
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary-50 border border-primary-200">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <p className="text-sm text-primary-700">Primary contacts receive all renewal notifications. Configure fallback contacts for reliable delivery.</p>
              </div>
            </div>

            <div>
              <label className="input-label">Notification Routing Preferences</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-surface-hover transition-smooth">
                  <input type="radio" name="routing" className="w-4 h-4 text-primary focus:ring-primary" defaultChecked />
                  <div>
                    <p className="font-medium text-text-primary">Primary contact only</p>
                    <p className="text-xs text-text-secondary">Send notifications to primary contact exclusively</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-surface-hover transition-smooth">
                  <input type="radio" name="routing" className="w-4 h-4 text-primary focus:ring-primary" />
                  <div>
                    <p className="font-medium text-text-primary">Primary + CC secondary</p>
                    <p className="text-xs text-text-secondary">Send to primary with copy to secondary contacts</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-surface-hover transition-smooth">
                  <input type="radio" name="routing" className="w-4 h-4 text-primary focus:ring-primary" />
                  <div>
                    <p className="font-medium text-text-primary">All contacts</p>
                    <p className="text-xs text-text-secondary">Send notifications to all designated contacts</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Fallback Contact Management */}
        <div className="card">
          <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            Fallback Contact Management
          </h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="fallbackDelay" className="input-label">Fallback Delay (hours)</label>
              <input type="number" id="fallbackDelay" className="input" defaultValue="24" min="1" />
              <p className="text-xs text-text-tertiary mt-1">Time to wait before contacting fallback if primary doesn't respond</p>
            </div>

            <div>
              <label className="input-label">Fallback Contact Priority</label>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">1</span>
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">Secondary Email</p>
                    <p className="text-xs text-text-secondary">Backup email address</p>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-surface-hover transition-smooth" aria-label="Edit priority">
                    <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <span className="w-6 h-6 rounded-full bg-secondary text-white text-xs flex items-center justify-center font-semibold">2</span>
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">SMS Notification</p>
                    <p className="text-xs text-text-secondary">Mobile phone number</p>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-surface-hover transition-smooth" aria-label="Edit priority">
                    <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <span className="w-6 h-6 rounded-full bg-secondary text-white text-xs flex items-center justify-center font-semibold">3</span>
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">Account Manager</p>
                    <p className="text-xs text-text-secondary">Assigned team member</p>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-surface-hover transition-smooth" aria-label="Edit priority">
                    <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <button className="btn btn-outline w-full flex justify-center items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add Fallback Contact
            </button>
          </div>
        </div>

        {/* Communication Channel Preferences */}
        <div className="card lg:col-span-2">
          <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            Communication Channel Preferences by Client
          </h3>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b border-border">Client</th>
                  <th className="text-left p-3 border-b border-border">Email</th>
                  <th className="text-left p-3 border-b border-border">SMS</th>
                  <th className="text-left p-3 border-b border-border">WhatsApp</th>
                  <th className="text-left p-3 border-b border-border">Browser</th>
                  <th className="flex items-center justify-end p-3 border-b border-border">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-700 font-semibold text-xs">TC</span>
                      </div>
                      <span className="font-medium text-text-primary">TechCorp Solutions</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                    </label>
                  </td>
                  <td className="p-3">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                    </label>
                  </td>
                  <td className="p-3">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                    </label>
                  </td>
                  <td className="p-3">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                    </label>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-surface-hover transition-smooth" aria-label="Edit preferences">
                        <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-accent-700 font-semibold text-xs">DI</span>
                      </div>
                      <span className="font-medium text-text-primary">Digital Innovations</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                    </label>
                  </td>
                  <td className="p-3">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                    </label>
                  </td>
                  <td className="p-3">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                    </label>
                  </td>
                  <td className="p-3">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                    </label>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-surface-hover transition-smooth" aria-label="Edit preferences">
                        <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Save Contact Settings */}
      <div className="mt-6 flex justify-end">
        <button className="btn btn-primary flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
          </svg>
          Save Contact Settings
        </button>
      </div>
    </div>
  );
}
