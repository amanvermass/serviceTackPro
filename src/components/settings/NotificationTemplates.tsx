'use client';

import React, { useState } from 'react';

export default function NotificationTemplates() {
  const [smsBody, setSmsBody] = useState('Hi {client_name}, your domain {domain_name} expires on {expiry_date}. Renewal cost: ${renewal_cost}. Please renew soon to avoid service interruption. - Domain Manager Pro');

  return (
    <div id="notifications-tab" className="tab-content animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Templates */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-text-primary">Email Templates</h3>
              <p className="text-xs text-text-secondary">Rich text formatting</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="emailSubject" className="input-label">Subject Line</label>
              <input type="text" id="emailSubject" className="input" defaultValue="Domain Renewal Reminder - {domain_name}" />
            </div>

            <div>
              <label htmlFor="emailBody" className="input-label">Email Body</label>
              <textarea id="emailBody" className="input min-h-[200px] font-mono text-sm" placeholder="Enter email template..." defaultValue={`Dear {client_name},

This is a friendly reminder that your domain {domain_name} is set to expire on {expiry_date}.

To ensure uninterrupted service, please renew your domain before the expiration date.

Renewal Cost: \${renewal_cost}
Vendor: {vendor_name}

If you have any questions, please don't hesitate to contact us.

Best regards,
Domain Manager Pro Team`}></textarea>
              <p className="text-xs text-text-tertiary mt-2">Available fields: {"{client_name}, {domain_name}, {expiry_date}, {renewal_cost}, {vendor_name}"}</p>
            </div>

            <button className="btn btn-primary w-full flex justify-center items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              Preview Email
            </button>
          </div>
        </div>

        {/* SMS Templates */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-text-primary">SMS Templates</h3>
              <p className="text-xs text-text-secondary">Plain text only</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="smsBody" className="input-label">SMS Message</label>
              <textarea 
                id="smsBody" 
                className="input min-h-[200px] font-mono text-sm" 
                placeholder="Enter SMS template..." 
                maxLength={160} 
                value={smsBody}
                onChange={(e) => setSmsBody(e.target.value)}
              ></textarea>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-text-tertiary">Available fields: {"{client_name}, {domain_name}, {expiry_date}, {renewal_cost}"}</p>
                <span id="smsCharCount" className={`text-xs font-medium ${smsBody.length > 160 ? 'text-error' : smsBody.length > 140 ? 'text-warning' : 'text-text-secondary'}`}>{smsBody.length}/160</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-warning-50 border border-warning-200">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <p className="text-xs text-warning-700">SMS messages are limited to 160 characters. Longer messages will be split into multiple SMS.</p>
              </div>
            </div>

            <button className="btn btn-primary w-full flex justify-center items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              Preview SMS
            </button>
          </div>
        </div>

        {/* WhatsApp Templates */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-text-primary">WhatsApp Templates</h3>
              <p className="text-xs text-text-secondary">Plain text with emojis</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="whatsappBody" className="input-label">WhatsApp Message</label>
              <textarea id="whatsappBody" className="input min-h-[200px] font-mono text-sm" placeholder="Enter WhatsApp template..." defaultValue={`👋 Hi {client_name}!

⚠️ Domain Renewal Reminder

Your domain *{domain_name}* is expiring on {expiry_date}.

💰 Renewal Cost: \${renewal_cost}
🏢 Vendor: {vendor_name}

Please renew your domain to avoid service interruption.

Need help? Just reply to this message!

Best regards,
Domain Manager Pro Team 🚀`}></textarea>
              <p className="text-xs text-text-tertiary mt-2">Available fields: {"{client_name}, {domain_name}, {expiry_date}, {renewal_cost}, {vendor_name}"}</p>
            </div>

            <div className="p-3 rounded-lg bg-primary-50 border border-primary-200">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <p className="text-xs text-primary-700">Use *bold*, _italic_, and emojis to make your messages more engaging.</p>
              </div>
            </div>

            <button className="btn btn-primary w-full flex justify-center items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              Preview WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Save All Templates Button */}
      <div className="mt-6 flex justify-end">
        <button className="btn btn-primary flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
          </svg>
          Save All Templates
        </button>
      </div>
    </div>
  );
}
