'use client';

import React from 'react';

export default function Scheduling() {
  return (
    <div id="scheduling-tab" className="tab-content animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reminder Intervals */}
        <div className="card">
          <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Default Reminder Intervals
          </h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="firstReminder" className="input-label">First Reminder (days before expiry)</label>
              <input type="number" id="firstReminder" className="input" defaultValue="30" min="1" />
            </div>
            <div>
              <label htmlFor="secondReminder" className="input-label">Second Reminder (days before expiry)</label>
              <input type="number" id="secondReminder" className="input" defaultValue="14" min="1" />
            </div>
            <div>
              <label htmlFor="thirdReminder" className="input-label">Third Reminder (days before expiry)</label>
              <input type="number" id="thirdReminder" className="input" defaultValue="7" min="1" />
            </div>
            <div>
              <label htmlFor="finalReminder" className="input-label">Final Reminder (days before expiry)</label>
              <input type="number" id="finalReminder" className="input" defaultValue="1" min="1" />
            </div>

            <div className="p-3 rounded-lg bg-secondary-50 border border-border">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                <span className="text-sm text-text-primary">Send post-expiry notifications</span>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Timing */}
        <div className="card">
          <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            Notification Timing
          </h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="notificationTime" className="input-label">Preferred Send Time</label>
              <input type="time" id="notificationTime" className="input" defaultValue="09:00" />
              <p className="text-xs text-text-tertiary mt-1">Notifications will be sent at this time daily</p>
            </div>

            <div>
              <label className="input-label">Send Notifications On</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                  <span className="text-sm text-text-primary">Monday</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                  <span className="text-sm text-text-primary">Tuesday</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                  <span className="text-sm text-text-primary">Wednesday</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                  <span className="text-sm text-text-primary">Thursday</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                  <span className="text-sm text-text-primary">Friday</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                  <span className="text-sm text-text-primary">Saturday</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                  <span className="text-sm text-text-primary">Sunday</span>
                </label>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-secondary-50 border border-border">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                <span className="text-sm text-text-primary">Enable browser notifications</span>
              </label>
            </div>
          </div>
        </div>

        {/* Escalation Rules */}
        <div className="card lg:col-span-2">
          <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Escalation Rules for Overdue Renewals
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="escalationDays" className="input-label">Escalate after (days overdue)</label>
                <input type="number" id="escalationDays" className="input" defaultValue="3" min="1" />
              </div>

              <div>
                <label htmlFor="escalationManager" className="input-label">Escalate to Manager</label>
                <select id="escalationManager" className="input">
                  <option value="">Select manager...</option>
                  <option value="john">John Smith</option>
                  <option value="lisa">Lisa Anderson</option>
                  <option value="mike">Mike Johnson</option>
                </select>
              </div>

              <div>
                <label htmlFor="escalationFrequency" className="input-label">Escalation Frequency</label>
                <select id="escalationFrequency" className="input">
                  <option value="daily">Daily</option>
                  <option value="every2days">Every 2 days</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-error-50 border border-error-200">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <div>
                  <p className="font-medium text-error-700 mb-1">Critical Escalation</p>
                  <p className="text-sm text-error-600">Managers will receive mobile notifications for overdue renewals requiring immediate attention.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Scheduling Settings */}
      <div className="mt-6 flex justify-end">
        <button className="btn btn-primary flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
          </svg>
          Save Scheduling Settings
        </button>
      </div>
    </div>
  );
}
