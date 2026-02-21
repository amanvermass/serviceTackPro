'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import toastConfig from '@/components/CustomToast';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'success' | 'error' | 'info';
  date: string;
  read: boolean;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${baseUrl}/api/notifications/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-auth-token': token
          }
        });

        if (response.ok) {
          const data = await response.json();
          const items = Array.isArray(data) ? data : data.data || [];
          const mapped: NotificationItem[] = items.map((item: any) => {
            const created = item.createdAt ? new Date(item.createdAt) : null;
            const displayDate = created ? created.toLocaleString() : '';
            let mappedType: NotificationItem['type'] = 'info';
            if (item.type === 'warning' || item.type === 'success' || item.type === 'error' || item.type === 'info') {
              mappedType = item.type;
            } else if (item.type === 'domain') {
              mappedType = 'warning';
            }
            return {
              id: String(item._id || item.id),
              title: item.title || '',
              message: item.message || '',
              type: mappedType,
              date: displayDate,
              read: Boolean(item.isRead)
            };
          });
          setNotifications(mapped);
        } else {
          toastConfig.error('Failed to load notifications');
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toastConfig.error('Error fetching notifications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (notification.read) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${baseUrl}/api/notifications/read/${notification.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-auth-token': token
        }
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
      } else {
        toastConfig.error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toastConfig.error('Error marking notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${baseUrl}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-auth-token': token
        }
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toastConfig.success('All notifications marked as read');
      } else {
        toastConfig.error('Failed to mark notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toastConfig.error('Error marking notifications as read');
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 w-full px-10 md:px-10 lg:px-10 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-primary mb-2">Notifications</h1>
            <p className="text-text-secondary text-sm md:text-base">Stay updated with important alerts and system messages</p>
          </div>
          {notifications.length > 0 && (
            <button
              className="text-primary text-sm font-medium hover:text-primary-700 transition-colors self-start md:self-center"
              onClick={handleMarkAllRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-text-secondary">
              <p className="text-sm">Loading notifications...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 md:p-6 hover:bg-surface-hover transition-colors flex gap-4 cursor-pointer ${
                    notification.read ? 'opacity-70' : 'bg-primary-50/10'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
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
