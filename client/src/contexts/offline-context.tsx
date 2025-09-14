import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { offlineStorage } from "../lib/offline-storage";

interface OfflineContextType {
  isOnline: boolean;
  isPending: boolean;
  hasPendingChanges: boolean;
  syncData: () => Promise<void>;
  lastSyncTime: number;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error("useOffline must be used within an OfflineProvider");
  }
  return context;
}

interface OfflineProviderProps {
  children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isPending, setIsPending] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(
    offlineStorage.hasPendingChanges()
  );
  const [lastSyncTime, setLastSyncTime] = useState(
    offlineStorage.getLastSyncTime()
  );
  const queryClient = useQueryClient();

  // Update pending changes status
  const updatePendingStatus = () => {
    setHasPendingChanges(offlineStorage.hasPendingChanges());
    setLastSyncTime(offlineStorage.getLastSyncTime());
  };

  // Sync pending changes to server
  const syncData = useCallback(async () => {
    if (!isOnline || isPending) return;

    setIsPending(true);
    try {
      const pendingChanges = offlineStorage.getPendingChanges();

      // Sync messages
      for (const change of pendingChanges.messages) {
        if (change.action === 'add') {
          await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(change.data),
            credentials: 'include'
          });
        }
      }

      // Sync settings
      for (const change of pendingChanges.settings) {
        if (change.action === 'update') {
          await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(change.data),
            credentials: 'include'
          });
        }
      }

      // Sync activities
      for (const change of pendingChanges.activities) {
        if (change.action === 'add') {
          await fetch('/api/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(change.data),
            credentials: 'include'
          });
        } else if (change.action === 'update') {
          await fetch(`/api/activities/${change.data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(change.data),
            credentials: 'include'
          });
        } else if (change.action === 'delete') {
          await fetch(`/api/activities/${change.data.id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
        }
      }

      // Sync memory
      for (const change of pendingChanges.memory) {
        if (change.action === 'add') {
          await fetch('/api/memory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(change.data),
            credentials: 'include'
          });
        } else if (change.action === 'delete') {
          await fetch(`/api/memory/${change.data.id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
        }
      }

      // Clear pending changes after successful sync
      offlineStorage.clearPendingChanges();
      
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ predicate: () => true });

      updatePendingStatus();
      
      console.log('Offline sync completed successfully');
    } catch (error) {
      console.error('Failed to sync offline changes:', error);
    } finally {
      setIsPending(false);
    }
  }, [isOnline, isPending, queryClient]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      if (offlineStorage.hasPendingChanges()) {
        syncData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncData]);

  const contextValue: OfflineContextType = {
    isOnline,
    isPending,
    hasPendingChanges,
    syncData,
    lastSyncTime
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
}