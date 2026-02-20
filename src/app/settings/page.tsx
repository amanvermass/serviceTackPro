'use client';

import { Suspense, useState, useEffect } from 'react';
import toastConfig from '@/components/CustomToast';
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
            {activeTab === 'roles' && <RolesPermissions />}
            {activeTab === 'export' && <DataExport />}
          </div>
        </main>
      </div>
    </div>
  );
}

function RolesPermissions() {
  const [roles, setRoles] = useState<
    { id?: string; name: string; description?: string; permissions: string[] }[]
  >([
    {
      name: 'Owner',
      description: 'Full access to all modules and billing',
      permissions: ['Clients', 'Domains', 'Hosting', 'Maintenance', 'Team', 'Settings']
    },
    {
      name: 'Manager',
      description: 'Can manage clients, domains, hosting and renewals',
      permissions: ['Clients', 'Domains', 'Hosting']
    },
    {
      name: 'Agent',
      description: 'Can view and update assigned clients and services',
      permissions: ['Clients', 'Domains', 'Hosting']
    }
  ]);

  const allPermissions = [
    'Clients',
    'Domains',
    'Hosting',
    'Maintenance',
    'Team',
    'Settings'
  ];

  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
        const token = localStorage.getItem('token');

        if (!baseUrl) return;

        const response = await fetch(`${baseUrl}/api/roles`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

        if (!response.ok) {
          console.error('Failed to fetch roles for settings');
          return;
        }

        const json = await response.json();
        const items = Array.isArray(json) ? json : json.data || [];

        const mapped = items.map((item: any) => {
          const perms: string[] = [];
          const src = item.permissions || {};
          if (src.clients) perms.push('Clients');
          if (src.domains) perms.push('Domains');
          if (src.hosting) perms.push('Hosting');
          if (src.maintenance) perms.push('Maintenance');
          if (src.team) perms.push('Team');
          if (src.settings) perms.push('Settings');

          return {
            id: item._id || item.id,
            name: item.name || 'Role',
            description: '',
            permissions: perms
          };
        });

        setRoles(mapped);
      } catch (error) {
        console.error('Error fetching roles for settings:', error);
      }
    };

    fetchRoles();
  }, []);

  const toggleNewRolePermission = (permission: string) => {
    setNewRolePermissions(prev =>
      prev.includes(permission) ? prev.filter(p => p !== permission) : [...prev, permission]
    );
  };

  const handleSaveNewRole = async () => {
    const name = newRoleName.trim();
    if (!name) {
      toastConfig.error('Role name is required');
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
      const token = localStorage.getItem('token');

      if (!baseUrl) {
        toastConfig.error('API URL is not configured');
        return;
      }

      if (!token) {
        toastConfig.error('You must be logged in to add roles');
        return;
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-auth-token': token
      };

      const permissionsPayload = buildPermissionsPayload(newRolePermissions);

      const response = await fetch(`${baseUrl}/api/roles`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          permissions: permissionsPayload
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = data && (data.message || data.msg);
        toastConfig.error(message || 'Failed to create role');
        return;
      }

      const permsFromResponse: string[] = [];
      const src = (data && (data.permissions || data.data?.permissions)) || {};
      if (src.clients) permsFromResponse.push('Clients');
      if (src.domains) permsFromResponse.push('Domains');
      if (src.hosting) permsFromResponse.push('Hosting');
      if (src.maintenance) permsFromResponse.push('Maintenance');
      if (src.team) permsFromResponse.push('Team');
      if (src.settings) permsFromResponse.push('Settings');

      const role = {
        id: data && (data._id || data.id || data.data?._id || data.data?.id),
        name,
        description: newRoleDescription.trim() || 'Custom role',
        permissions: permsFromResponse.length ? permsFromResponse : newRolePermissions
      };

      setRoles(prev => [...prev, role]);
      setNewRoleName('');
      setNewRoleDescription('');
      setNewRolePermissions([]);
      setIsAddingRole(false);
      toastConfig.success('Role created successfully');
    } catch (error) {
      console.error('Error creating role:', error);
      toastConfig.error('An error occurred while creating role');
    }
  };

  const toggleRolePermission = (roleIndex: number, permission: string) => {
    setRoles(prev =>
      prev.map((role, idx) => {
        if (idx !== roleIndex) return role;
        const has = role.permissions.includes(permission);
        return {
          ...role,
          permissions: has
            ? role.permissions.filter(p => p !== permission)
            : [...role.permissions, permission]
        };
      })
    );
  };

  const buildPermissionsPayload = (perms: string[]) => ({
    clients: perms.includes('Clients'),
    domains: perms.includes('Domains'),
    hosting: perms.includes('Hosting'),
    maintenance: perms.includes('Maintenance'),
    team: perms.includes('Team'),
    settings: perms.includes('Settings')
  });

  const handleSaveRoleSettings = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
      const token = localStorage.getItem('token');

      if (!baseUrl) {
        toastConfig.error('API URL is not configured');
        return;
      }

      if (!token) {
        toastConfig.error('You must be logged in to manage roles');
        return;
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-auth-token': token
      };

      const updatedRoles = [...roles];

      for (let i = 0; i < updatedRoles.length; i++) {
        const role = updatedRoles[i];
        const permissionsPayload = buildPermissionsPayload(role.permissions);

        if (role.id) {
          const response = await fetch(`${baseUrl}/api/roles/${role.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              permissions: permissionsPayload
            })
          });

          if (!response.ok) {
            const data = await response.json().catch(() => null);
            const message = data && (data.message || data.msg);
            toastConfig.error(message || `Failed to update role ${role.name}`);
            return;
          }
        } else {
          const response = await fetch(`${baseUrl}/api/roles`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              name: role.name,
              permissions: permissionsPayload
            })
          });

          const data = await response.json().catch(() => null);

          if (!response.ok) {
            const message = data && (data.message || data.msg);
            toastConfig.error(message || `Failed to create role ${role.name}`);
            return;
          }

          const newId = data && (data._id || data.id || data.data?._id || data.data?.id);
          if (newId) {
            updatedRoles[i] = { ...role, id: newId };
          }
        }
      }

      setRoles(updatedRoles);
      toastConfig.success('Role settings saved successfully');
    } catch (error) {
      console.error('Error saving role settings:', error);
      toastConfig.error('An error occurred while saving role settings');
    }
  };

  return (
    <div className="tab-content animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1">
          <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12a4 4 0 118 0 4 4 0 01-8 0zM3 20a6 6 0 0112 0H3z" />
            </svg>
            Roles
          </h3>

          <div className="space-y-3">
            {roles.map(role => (
              <div key={role.name} className="p-3 rounded-lg border border-border hover:border-primary-200 hover:bg-primary-25 transition-smooth cursor-pointer">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-text-primary">{role.name}</p>
                    <p className="text-xs text-text-secondary">{role.description}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary-50 text-primary">
                    {role.permissions.length} permissions
                  </span>
                </div>
              </div>
            ))}
          </div>

          {isAddingRole && (
            <div className="mt-4 p-3 rounded-lg border border-dashed border-primary-200 space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="input-label" htmlFor="newRoleName">Role name</label>
                  <input
                    id="newRoleName"
                    className="input"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g. Support Agent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Permissions</p>
                <div className="grid grid-cols-1 gap-2">
                  {allPermissions.map(permission => (
                    <label key={permission} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                        checked={newRolePermissions.includes(permission)}
                        onChange={() => toggleNewRolePermission(permission)}
                      />
                      <span className="text-sm text-text-primary">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setIsAddingRole(false);
                    setNewRoleName('');
                    setNewRoleDescription('');
                    setNewRolePermissions([]);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveNewRole}
                >
                  Save Role
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            className="btn btn-outline w-full mt-4 flex items-center justify-center"
            onClick={() => setIsAddingRole(true)}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Role
          </button>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6M7 8h10M5 4h14M5 20h14" />
            </svg>
            Permissions Matrix
          </h3>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wide w-1/4">Role</th>
                  {allPermissions.map(permission => (
                    <th key={permission} className="p-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wide">
                      {permission}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map((role, roleIndex) => (
                  <tr key={role.id || role.name} className="border-b border-border">
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-text-primary">{role.name}</span>
                        <span className="text-xs text-text-secondary">{role.description}</span>
                      </div>
                    </td>
                    {allPermissions.map(permission => (
                      <td key={permission} className="p-3">
                        <label className="flex items-center justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            checked={role.permissions.includes(permission)}
                            onChange={() => toggleRolePermission(roleIndex, permission)}
                          />
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="btn btn-primary flex items-center"
              onClick={handleSaveRoleSettings}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Save Role Settings
            </button>
          </div>
        </div>
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
