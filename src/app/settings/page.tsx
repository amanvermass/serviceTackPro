'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import NotificationTemplates from '@/components/settings/NotificationTemplates';
import Scheduling from '@/components/settings/Scheduling';
import ContactManagement from '@/components/settings/ContactManagement';
import DataExport from '@/components/settings/DataExport';

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = searchParams.get('tab') || 'notifications';

  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col-reverse md:flex-row flex-1 w-full overflow-hidden">
      <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <main className="flex-1 w-full px-4 md:px-10 py-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">Settings</h1>
            <p className="text-text-secondary">Configure notification templates, system preferences, and communication channels</p>
          </div>

          {/* Tab Content */}
          <div className="tab-content-wrapper">
            {activeTab === 'notifications' && <NotificationTemplates />}
            {activeTab === 'scheduling' && <Scheduling />}
            {activeTab === 'contacts' && <ContactManagement />}
            {activeTab === 'export' && <DataExport />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden">
      <Header />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading settings...</div>}>
        <SettingsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
