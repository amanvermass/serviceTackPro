'use client';
interface SettingsSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SettingsSidebar({ activeTab, setActiveTab }: SettingsSidebarProps) {
  return (
    <aside className="w-full md:w-[15%] md:min-w-[15%] md:max-w-[15%] bg-surface border-t md:border-t-0 md:border-r border-border flex-shrink-0 z-20 h-auto md:h-full">
      <div className="p-4 md:p-6 h-full overflow-x-auto md:overflow-x-hidden md:overflow-y-auto">
        <h2 className="text-lg font-heading font-semibold text-text-primary mb-4 px-3 hidden md:block">Settings</h2>
        <nav className="flex md:flex-col gap-2 md:gap-1 min-w-max md:min-w-0">
          <button 
            className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal ${activeTab === 'notifications' ? 'bg-primary-50 text-primary' : 'text-text-secondary hover:bg-secondary-50 hover:text-text-primary'}`}
            onClick={() => setActiveTab('notifications')}
          >
            <svg className="w-5 h-5 inline-block mr-2 md:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            Notification Templates
          </button>
          <button 
            className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal ${activeTab === 'scheduling' ? 'bg-primary-50 text-primary' : 'text-text-secondary hover:bg-secondary-50 hover:text-text-primary'}`}
            onClick={() => setActiveTab('scheduling')}
          >
            <svg className="w-5 h-5 inline-block mr-2 md:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Scheduling
          </button>
          <button 
            className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal ${activeTab === 'contacts' ? 'bg-primary-50 text-primary' : 'text-text-secondary hover:bg-secondary-50 hover:text-text-primary'}`}
            onClick={() => setActiveTab('contacts')}
          >
            <svg className="w-5 h-5 inline-block mr-2 md:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Contact Management
          </button>
          <button 
            className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal ${activeTab === 'roles' ? 'bg-primary-50 text-primary' : 'text-text-secondary hover:bg-secondary-50 hover:text-text-primary'}`}
            onClick={() => setActiveTab('roles')}
          >
            <svg className="w-5 h-5 inline-block mr-2 md:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12a4 4 0 118 0 4 4 0 01-8 0zM3 20a6 6 0 0112 0H3z"/>
            </svg>
            Roles &amp; Permissions
          </button>
          <button 
            className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal ${activeTab === 'export' ? 'bg-primary-50 text-primary' : 'text-text-secondary hover:bg-secondary-50 hover:text-text-primary'}`}
            onClick={() => setActiveTab('export')}
          >
            <svg className="w-5 h-5 inline-block mr-2 md:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Data Export
          </button>
        </nav>
      </div>
    </aside>
  );
}
