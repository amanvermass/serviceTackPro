'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CURRENT_USER } from '@/data/mock-user-data';
import toastConfig from '@/components/CustomToast';

type NotificationType = {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'success' | 'error' | 'info';
  time: string;
  read: boolean;
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${baseUrl}/api/notifications/recent`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-auth-token': token
          }
        });
        if (response.ok) {
          const data = await response.json();
          const items = Array.isArray(data) ? data : data.data || [];
          const mapped: NotificationType[] = items.map((item: any) => {
            const rawIsRead =
              item.isRead ??
              item.isread ??
              item.is_read ??
              item.read ??
              item.is_read_notification;

            const read =
              typeof rawIsRead === 'boolean'
                ? rawIsRead
                : rawIsRead === 1 ||
                  rawIsRead === '1' ||
                  rawIsRead === 'true' ||
                  rawIsRead === 'TRUE';

            return {
              id: String(item.id || item._id),
              title: item.title || '',
              message: item.message || '',
              type: (item.type as NotificationType['type']) || 'info',
              time: item.time || '',
              read
            };
          });
          setNotifications(mapped);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${baseUrl}/api/notifications/unread-count`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-auth-token': token
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (typeof data === 'number') {
            setUnreadCount(data);
          } else if (typeof data?.count === 'number') {
            setUnreadCount(data.count);
          } else if (typeof data?.unreadCount === 'number') {
            setUnreadCount(data.unreadCount);
          }
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    const run = () => {
      fetchNotifications();
      fetchUnreadCount();
    };

    run();

    const intervalId = setInterval(run, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleNotificationClick = async (notification: NotificationType) => {
    try {
      if (!notification.read) {
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
          setUnreadCount((prev) => (notification.read ? prev : Math.max(0, prev - 1)));
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('token');
      if (!token) {
        toastConfig.error('No token, authorization denied');
        return;
      }
      const response = await fetch(`${apiUrl}/api/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-auth-token': token
        },
      });

      if (response.ok) {
        toastConfig.success('Logged out successfully');
        console.log('Logout successful');
        // Clear stored tokens
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
      } else {
        toastConfig.error('Logout failed');
        console.error('Logout failed');
      }
    } catch (error) {
      toastConfig.error('Logout error');
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => {
    return pathname === path ? 'bg-primary-50 text-primary-700' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary';
  };

  const isParentActive = (path: string) => {
    return pathname.startsWith(path) ? 'bg-primary-50 text-primary-700' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary';
  };

  return (
    <>
      <header className="bg-surface border-b border-border fixed top-0 left-0 right-0 z-50 shadow-sm w-full max-w-[100vw]">
        <div className="w-full px-4 md:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="#2563EB" />
              <path d="M16 8L8 12V20C8 23.314 11.134 26 16 26C20.866 26 24 23.314 24 20V12L16 8Z" fill="white" />
              <circle cx="16" cy="16" r="3" fill="#F59E0B" />
            </svg>
            <span className="font-heading font-bold text-[clamp(1rem,2vw,1.25rem)] text-text-primary">Domain Manager Pro</span>
          </div>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-1">
              <Link href="/dashboard" className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${isActive('/dashboard')}`}>
                Dashboard
              </Link>
              <Link href="/client-management" className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${isActive('/client-management')}`}>
                Clients
              </Link>
              
              {/* Domains Dropdown */}
              <div className="relative group">
                <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth flex items-center gap-1 cursor-default ${isParentActive('/domain-management')}`}>
                  Domains
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 bg-surface border border-border rounded-lg shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left">
                  <Link href="/domain-management" className={`block px-4 py-2 text-sm transition-colors ${pathname === '/domain-management' ? 'bg-primary-50 text-primary-700' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}>
                    All Domains
                  </Link>
                  <Link href="/domain-management/vendors" className={`block px-4 py-2 text-sm transition-colors ${pathname === '/domain-management/vendors' ? 'bg-primary-50 text-primary-700' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}>
                    Vendors
                  </Link>
                </div>
              </div>

              <Link href="/hosting-management" className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${isActive('/hosting-management')}`}>
                Hosting
              </Link>
              <Link href="/maintenance-module" className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${isActive('/maintenance-module')}`}>
                Maintenance
              </Link>
              <Link href="/backups" className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${isActive('/backups')}`}>
                Backups
              </Link>
              <Link href="/team-management" className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${isActive('/team-management')}`}>
                Team
              </Link>
              <Link href="/settings" className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${isActive('/settings')}`}>
                Settings
              </Link>
            </nav>

            <div className="flex items-center gap-3 pl-6 border-l border-border">
              {/* Notification Dropdown */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 rounded-full hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors relative block" 
                  aria-label="Notifications"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] leading-none rounded-full border-2 border-surface flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-lg shadow-lg py-1 z-[100]">
                    <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-gray-50/50">
                      <h3 className="font-semibold text-sm text-text-primary">Notifications</h3>
                      <button
                        type="button"
                        className="text-xs text-primary cursor-pointer hover:text-primary-700 font-medium"
                        onClick={handleMarkAllRead}
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-surface-hover border-b border-border last:border-0 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-primary-50/10' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex gap-3">
                            <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                              ${notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 
                                notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                notification.type === 'error' ? 'bg-red-100 text-red-600' :
                                'bg-blue-100 text-blue-600'
                              }`}
                            >
                              {notification.type === 'warning' && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              )}
                              {notification.type === 'success' && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {notification.type === 'error' && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${!notification.read ? 'text-text-primary' : 'text-text-secondary'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-text-tertiary mt-1">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="self-center flex-shrink-0">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t border-border bg-gray-50/50">
                      <Link 
                        href="/notifications" 
                        className="flex items-center justify-center gap-2 w-full py-2 text-sm text-primary hover:text-primary-700 font-medium hover:bg-primary-50 rounded-md transition-colors"
                        onClick={() => setIsNotificationOpen(false)}
                      >
                        View all notifications
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-surface-hover transition-colors border border-transparent hover:border-border"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold overflow-hidden">
                    <img 
                      src={CURRENT_USER.avatarUrl} 
                      alt={CURRENT_USER.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg py-1 z-50">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary">
                      Profile
                    </Link>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button id="mobileMenuBtn" className="md:hidden p-2 rounded-lg hover:bg-surface-hover transition-smooth" aria-label="Toggle mobile menu">
            <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div id="mobileMenu" className="hidden md:hidden border-t border-border bg-surface w-full">
        <nav className="w-full py-[2vh] px-0 flex flex-col gap-2">
          <Link href="/dashboard" className={`px-4 py-2 rounded-lg text-sm font-medium ${isActive('/dashboard')}`}>
            Dashboard
          </Link>
          <Link href="/client-management" className={`px-4 py-2 rounded-lg text-sm font-medium ${isActive('/client-management')}`}>
            Clients
          </Link>
          <Link href="/domain-management" className={`px-4 py-2 rounded-lg text-sm font-medium ${isActive('/domain-management')}`}>
            Domains
          </Link>
          <Link href="/domain-management/vendors" className={`px-4 py-2 rounded-lg text-sm font-medium ${isActive('/domain-management/vendors')} ml-4 border-l-2 border-border`}>
            Vendors
          </Link>
          <Link href="/hosting-management" className={`px-4 py-2 rounded-lg text-sm font-medium ${isActive('/hosting-management')}`}>
            Hosting
          </Link>
          <Link href="/maintenance-module" className={`px-4 py-2 rounded-lg text-sm font-medium ${isActive('/maintenance-module')}`}>
            Maintenance
          </Link>
          <Link href="/team-management" className={`px-4 py-2 rounded-lg text-sm font-medium ${isActive('/team-management')}`}>
            Team
          </Link>
          <Link href="/settings" className={`px-4 py-2 rounded-lg text-sm font-medium ${isActive('/settings')}`}>
            Settings
          </Link>
        </nav>
      </div>
    </header>
    <div className="h-20" />
    </>
  );
}
