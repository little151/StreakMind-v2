// Offline storage utility for caching app data
export interface OfflineData {
  messages: any[];
  settings: any;
  activities: any;
  memory: any;
  stats: any;
  lastSyncTime: number;
  pendingChanges: {
    messages: any[];
    settings: any[];
    activities: any[];
    memory: any[];
  };
}

const STORAGE_KEY = 'streakMind_offline_data';
const SYNC_KEY = 'streakMind_sync_queue';

export class OfflineStorage {
  private data: OfflineData;

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): OfflineData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }

    // Default data structure
    return {
      messages: [],
      settings: null,
      activities: {},
      memory: [],
      stats: null,
      lastSyncTime: 0,
      pendingChanges: {
        messages: [],
        settings: [],
        activities: [],
        memory: []
      }
    };
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  // Get cached data
  getMessages(): any[] {
    return this.data.messages || [];
  }

  getSettings(): any {
    return this.data.settings;
  }

  getActivities(): any {
    return this.data.activities || {};
  }

  getMemory(): any[] {
    return this.data.memory || [];
  }

  getStats(): any {
    return this.data.stats;
  }

  // Cache data from server
  cacheMessages(messages: any[]): void {
    this.data.messages = messages;
    this.saveToStorage();
  }

  cacheSettings(settings: any): void {
    this.data.settings = settings;
    this.saveToStorage();
  }

  cacheActivities(activities: any): void {
    this.data.activities = activities;
    this.saveToStorage();
  }

  cacheMemory(memory: any[]): void {
    this.data.memory = memory;
    this.saveToStorage();
  }

  cacheStats(stats: any): void {
    this.data.stats = stats;
    this.saveToStorage();
  }

  // Add pending changes for sync
  addPendingMessage(message: any): void {
    this.data.pendingChanges.messages.push({
      action: 'add',
      data: message,
      timestamp: Date.now()
    });
    
    // Also add to local messages for immediate UI update
    this.data.messages.push(message);
    this.saveToStorage();
  }

  addPendingSettingsChange(settings: any): void {
    this.data.pendingChanges.settings.push({
      action: 'update',
      data: settings,
      timestamp: Date.now()
    });
    
    // Update local settings
    this.data.settings = settings;
    this.saveToStorage();
  }

  addPendingActivityChange(action: string, data: any): void {
    this.data.pendingChanges.activities.push({
      action,
      data,
      timestamp: Date.now()
    });
    this.saveToStorage();
  }

  addPendingMemoryChange(action: string, data: any): void {
    this.data.pendingChanges.memory.push({
      action,
      data,
      timestamp: Date.now()
    });
    
    // Update local memory based on action
    if (action === 'add') {
      this.data.memory.push(data);
    } else if (action === 'delete') {
      this.data.memory = this.data.memory.filter((item: any) => item.id !== data.id);
    }
    this.saveToStorage();
  }

  // Get pending changes for sync
  getPendingChanges() {
    return this.data.pendingChanges;
  }

  // Clear pending changes after successful sync
  clearPendingChanges(): void {
    this.data.pendingChanges = {
      messages: [],
      settings: [],
      activities: [],
      memory: []
    };
    this.data.lastSyncTime = Date.now();
    this.saveToStorage();
  }

  // Check if there are pending changes
  hasPendingChanges(): boolean {
    return (
      this.data.pendingChanges.messages.length > 0 ||
      this.data.pendingChanges.settings.length > 0 ||
      this.data.pendingChanges.activities.length > 0 ||
      this.data.pendingChanges.memory.length > 0
    );
  }

  // Get last sync time
  getLastSyncTime(): number {
    return this.data.lastSyncTime;
  }

  // Clear all offline data
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.loadFromStorage();
  }
}

export const offlineStorage = new OfflineStorage();