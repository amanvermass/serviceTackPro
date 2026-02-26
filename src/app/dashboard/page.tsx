'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import toastConfig from '@/components/CustomToast';
import TableShimmer from '@/components/TableShimmer';

type DashboardCounts = {
  upcomingDomains: number;
  upcomingHosting: number;
  upcomingMaintenance: number;
  activeClients: number;
  activeDomains: number;
  activeHosting: number;
};

type UpcomingRenewal = {
  id: string;
  clientName: string;
  clientEmail: string;
  service: string;
  serviceName: string;
  renewalDate: string;
  type: string;
};

export default function Dashboard() {
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [upcomingRenewals, setUpcomingRenewals] = useState<UpcomingRenewal[]>([]);
  const [isCountsLoading, setIsCountsLoading] = useState(true);
  const [isRenewalsLoading, setIsRenewalsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsCountsLoading(true);
        setIsRenewalsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setIsCountsLoading(false);
          setIsRenewalsLoading(false);
          return;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
        const headers = {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        };

        const [countsResponse, renewalsResponse] = await Promise.all([
          fetch(`${baseUrl}/api/dashboard/counts`, { headers }),
          fetch(`${baseUrl}/api/dashboard/upcoming-renewals`, { headers }),
        ]);

        if (countsResponse.ok) {
          const countsJson = await countsResponse.json();
          const countsData = countsJson.data || {};
          setCounts({
            upcomingDomains: countsData.upcomingDomains ?? 0,
            upcomingHosting: countsData.upcomingHosting ?? 0,
            upcomingMaintenance: countsData.upcomingMaintenance ?? 0,
            activeClients: countsData.activeClients ?? 0,
            activeDomains: countsData.activeDomains ?? 0,
            activeHosting: countsData.activeHosting ?? 0,
          });
        } else {
          toastConfig.error('Failed to load dashboard stats');
        }

        if (renewalsResponse.ok) {
          const renewalsJson = await renewalsResponse.json();
          const renewalsData = Array.isArray(renewalsJson.data) ? renewalsJson.data : [];
          setUpcomingRenewals(renewalsData);
        } else {
          toastConfig.error('Failed to load upcoming renewals');
        }
      } catch (error) {
        console.error('Error fetching dashboard counts:', error);
        toastConfig.error('Failed to load dashboard data');
      } finally {
        setIsCountsLoading(false);
        setIsRenewalsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow w-full px-10 py-[2vh]">

        {/* PAGE TITLE */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading font-bold text-text-primary mb-2 text-[clamp(1.5rem,3vw,2rem)]">
            Dashboard
          </h1>
          <p className="text-text-secondary text-[clamp(0.95rem,1.6vw,1.05rem)]">
            Overview of renewals, tasks, workload, and business health
          </p>
        </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-6 sm:grid-cols-6 md:grid-cols-6 xl:grid-cols-6 gap-5 mb-10">
          {isCountsLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="card p-5 rounded-xl bg-card shadow-sm animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-7 bg-gray-200 rounded w-1/2" />
                </div>
              ))
            : [
                { label: 'Upcoming Domain Renewals', value: counts?.upcomingDomains ?? 0 },
                { label: 'Upcoming Hosting Renewals', value: counts?.upcomingHosting ?? 0 },
                { label: 'Upcoming Maintenance Renewals', value: counts?.upcomingMaintenance ?? 0 },
                { label: 'Active Clients', value: counts?.activeClients ?? 0 },
                { label: 'Active Domains', value: counts?.activeDomains ?? 0 },
                { label: 'Active Hosting', value: counts?.activeHosting ?? 0 },
              ].map((item) => (
                <div
                  key={item.label}
                  className="card p-5 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-text-secondary text-sm">{item.label}</p>
                  <p className="mt-2 font-bold text-2xl text-text-primary">
                    {item.value}
                  </p>
                </div>
              ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* UPCOMING RENEWALS */}
          <div className="xl:col-span-2 card rounded-xl p-5 bg-card shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Upcoming Renewals</h3>

            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Email</th>
                    <th>Service</th>
                    <th>Renewal Date</th>
                    <th className="flex items-center justify-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {isRenewalsLoading ? (
                    <TableShimmer columns={5} rows={6} />
                  ) : upcomingRenewals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-sm text-text-secondary">
                        No upcoming renewals found
                      </td>
                    </tr>
                  ) : (
                    upcomingRenewals.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-surface-hover transition-smooth cursor-pointer"
                      >
                        <td>
                          <p className="font-medium text-text-primary">{item.clientName}</p>
                        </td>
                        <td>
                          <p className="text-xs text-text-secondary">{item.clientEmail}</p>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              item.type === 'domain'
                                ? 'badge-primary'
                                : item.type === 'hosting'
                                ? 'badge-secondary'
                                : 'badge-warning'
                            }`}
                          >
                            {item.service}
                          </span>
                          <p className="text-xs text-text-secondary mt-1">{item.serviceName}</p>
                        </td>
                        <td>
                          <p className="text-sm text-text-secondary">
                            {new Date(item.renewalDate).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="text-right">
                          <button className="p-2 rounded-lg hover:bg-surface-hover transition-smooth">
                            <svg
                              className="w-5 h-5 text-text-secondary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TEAM WORKLOAD */}
          {/* <div className="card rounded-xl p-5 bg-card shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Team Workload</h3>

            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <span className="font-medium">Rahul</span>
                <span className="badge badge-warning px-3 py-1 rounded-full text-xs">
                  Busy
                </span>
              </li>

              <li className="flex items-center justify-between">
                <span className="font-medium">Anita</span>
                <span className="badge badge-success px-3 py-1 rounded-full text-xs">
                  Available
                </span>
              </li>
            </ul>
          </div> */}

        </div>
      </main>

      <Footer />
    </div>
  );
}
