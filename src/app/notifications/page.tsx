'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Dummy data for notifications
const notifications = [
  {
    id: 1,
    title: 'Domain Expiration Warning',
    message: 'The domain "example.com" will expire in 3 days. Please renew it to avoid service interruption.',
    type: 'warning',
    date: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    title: 'New Client Added',
    message: 'A new client "TechSolutions Inc." has been successfully added to your portfolio.',
    type: 'success',
    date: '1 day ago',
    read: true,
  },
  {
    id: 3,
    title: 'Maintenance Scheduled',
    message: 'System maintenance is scheduled for Saturday, 10:00 PM EST. Expected downtime: 30 minutes.',
    type: 'info',
    date: '2 days ago',
    read: true,
  },
  {
    id: 4,
    title: 'Payment Failed',
    message: 'Automatic payment for "hosting-pro-plan" failed. Please update your payment method.',
    type: 'error',
    date: '3 days ago',
    read: false,
  },
  {
    id: 5,
    title: 'SSL Certificate Renewed',
    message: 'SSL certificate for "shop.mysite.com" has been automatically renewed.',
    type: 'success',
    date: '1 week ago',
    read: true,
  }
];

export default function Notifications() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 w-full px-10 md:px-10 lg:px-10 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-primary mb-2">Notifications</h1>
            <p className="text-text-secondary text-sm md:text-base">Stay updated with important alerts and system messages</p>
          </div>
          <button className="text-primary text-sm font-medium hover:text-primary-700 transition-colors self-start md:self-center">
            Mark all as read
          </button>
        </div>

        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
          {notifications.length > 0 ? (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 md:p-6 hover:bg-surface-hover transition-colors flex gap-4 ${notification.read ? 'opacity-70' : 'bg-primary-50/10'}`}
                >
                  <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                    ${notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 
                      notification.type === 'success' ? 'bg-green-100 text-green-600' :
                      notification.type === 'error' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {notification.type === 'warning' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    {notification.type === 'success' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {notification.type === 'error' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {notification.type === 'info' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-semibold text-text-primary ${!notification.read && 'text-primary'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-text-secondary whitespace-nowrap ml-2">{notification.date}</span>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                  
                  {!notification.read && (
                    <div className="self-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-text-secondary">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-lg font-medium">No new notifications</p>
              <p className="text-sm mt-1">You're all caught up!</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
