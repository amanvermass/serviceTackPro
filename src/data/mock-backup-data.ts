
export interface BackupEntry {
  id: string;
  date: string;
  type: 'Full' | 'Incremental';
  size: string;
  status: 'Success' | 'Failed' | 'In Progress';
  includedData: {
    database: boolean;
    files: boolean;
    assets: boolean;
  };
  retention: string;
  metadata?: {
    createdBy: string;
    server: string;
    encryption: boolean;
    dbInfo: {
      name: string;
      tables: number;
      size: string;
    };
    fileInfo: {
      fileCount: number;
      totalSize: string;
    };
  };
}

export interface BackupProject {
  id: string;
  name: string;
  environment: 'Production' | 'Staging' | 'Development';
  status: 'Active' | 'Archived';
  lastBackup: string;
  lastBackupStatus: 'Success' | 'Failed' | 'In Progress';
  backupType: 'Full' | 'Incremental';
  totalSize: string;
  nextBackup: string;
  schedule: {
    enabled: boolean;
    frequency: 'Daily' | 'Weekly' | 'Monthly';
    time: string;
    retentionCount: number;
  };
  backups: BackupEntry[];
}

export const MOCK_BACKUP_PROJECTS: BackupProject[] = [
  {
    id: 'techcorp',
    name: 'TechCorp Solutions',
    environment: 'Production',
    status: 'Active',
    lastBackup: '2023-10-25T02:00:00',
    lastBackupStatus: 'Success',
    backupType: 'Incremental',
    totalSize: '45.2 GB',
    nextBackup: '2023-10-26T02:00:00',
    schedule: {
      enabled: true,
      frequency: 'Daily',
      time: '02:00 AM',
      retentionCount: 30,
    },
    backups: [
      {
        id: 'bk-1001',
        date: '2023-10-25T02:00:00',
        type: 'Incremental',
        size: '1.2 GB',
        status: 'Success',
        includedData: { database: true, files: true, assets: false },
        retention: '30 Days',
        metadata: {
          createdBy: 'System',
          server: 'AWS-US-East-1',
          encryption: true,
          dbInfo: { name: 'techcorp_prod', tables: 142, size: '450 MB' },
          fileInfo: { fileCount: 1250, totalSize: '750 MB' },
        },
      },
      {
        id: 'bk-1000',
        date: '2023-10-24T02:00:00',
        type: 'Incremental',
        size: '1.1 GB',
        status: 'Success',
        includedData: { database: true, files: true, assets: false },
        retention: '29 Days',
      },
      {
        id: 'bk-0999',
        date: '2023-10-23T02:00:00',
        type: 'Full',
        size: '12.5 GB',
        status: 'Success',
        includedData: { database: true, files: true, assets: true },
        retention: '28 Days',
      },
    ],
  },
  {
    id: 'digital',
    name: 'Digital Innovations',
    environment: 'Staging',
    status: 'Active',
    lastBackup: '2023-10-25T04:30:00',
    lastBackupStatus: 'Failed',
    backupType: 'Incremental',
    totalSize: '12.8 GB',
    nextBackup: '2023-10-26T04:30:00',
    schedule: {
      enabled: true,
      frequency: 'Daily',
      time: '04:30 AM',
      retentionCount: 14,
    },
    backups: [
      {
        id: 'bk-502',
        date: '2023-10-25T04:30:00',
        type: 'Incremental',
        size: '0 B',
        status: 'Failed',
        includedData: { database: true, files: true, assets: false },
        retention: 'N/A',
      },
      {
        id: 'bk-501',
        date: '2023-10-24T04:30:00',
        type: 'Incremental',
        size: '850 MB',
        status: 'Success',
        includedData: { database: true, files: true, assets: false },
        retention: '13 Days',
      },
    ],
  },
  {
    id: 'greenstart',
    name: 'GreenStart Ventures',
    environment: 'Production',
    status: 'Active',
    lastBackup: '2023-10-20T01:00:00',
    lastBackupStatus: 'Success',
    backupType: 'Full',
    totalSize: '8.5 GB',
    nextBackup: '2023-10-27T01:00:00',
    schedule: {
      enabled: true,
      frequency: 'Weekly',
      time: '01:00 AM',
      retentionCount: 12,
    },
    backups: [
      {
        id: 'bk-205',
        date: '2023-10-20T01:00:00',
        type: 'Full',
        size: '8.5 GB',
        status: 'Success',
        includedData: { database: true, files: true, assets: true },
        retention: '84 Days',
      },
    ],
  },
];
