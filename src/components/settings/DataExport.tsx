'use client';

import React from 'react';

export default function DataExport() {
  return (
    <div id="export-tab" className="tab-content animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Formats */}
        <div className="card">
          <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Export Options
          </h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="exportFormat" className="input-label">File Format</label>
              <select id="exportFormat" className="input">
                <option value="csv">CSV (Comma Separated Values)</option>
                <option value="json">JSON (JavaScript Object Notation)</option>
                <option value="pdf">PDF Report</option>
                <option value="xlsx">Excel Spreadsheet</option>
              </select>
            </div>

            <div>
              <label className="input-label">Data to Include</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                  <span className="text-sm text-text-primary">Domain Details</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                  <span className="text-sm text-text-primary">Client Information</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                  <span className="text-sm text-text-primary">Renewal History</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                  <span className="text-sm text-text-primary">Cost Analysis</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                  <span className="text-sm text-text-primary">Vendor Info</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" defaultChecked />
                  <span className="text-sm text-text-primary">System Logs</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="dateRange" className="input-label">Date Range</label>
              <select id="dateRange" className="input">
                <option value="all">All Time</option>
                <option value="last30">Last 30 Days</option>
                <option value="last90">Last 90 Days</option>
                <option value="ytd">Year to Date</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Export & History */}
        <div className="card">
          <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Quick Actions & History
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button className="btn btn-outline flex-col h-auto py-4 flex items-center justify-center">
                <svg className="w-8 h-8 mb-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="font-medium">Export Upcoming Renewals</span>
                <span className="text-xs text-text-secondary mt-1">Next 30 days</span>
              </button>
              <button className="btn btn-outline flex-col h-auto py-4 flex items-center justify-center">
                <svg className="w-8 h-8 mb-2 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <span className="font-medium">Export Overdue Domains</span>
                <span className="text-xs text-text-secondary mt-1">Critical items</span>
              </button>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-text-primary mb-2">Recent Exports</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-hover transition-smooth border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary-50 flex items-center justify-center text-primary-700 font-bold text-xs">CSV</div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">Monthly Report - June</p>
                      <p className="text-xs text-text-secondary">Generated on Jul 1, 2023</p>
                    </div>
                  </div>
                  <button className="text-primary hover:text-primary-600 text-sm font-medium">Download</button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-hover transition-smooth border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-error-50 flex items-center justify-center text-error-700 font-bold text-xs">PDF</div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">Q2 Financial Summary</p>
                      <p className="text-xs text-text-secondary">Generated on Jun 30, 2023</p>
                    </div>
                  </div>
                  <button className="text-primary hover:text-primary-600 text-sm font-medium">Download</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Export Button */}
      <div className="mt-6 flex justify-end">
        <button className="btn btn-primary flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Generate Export
        </button>
      </div>
    </div>
  );
}
