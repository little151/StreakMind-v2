import { useOffline } from "../contexts/offline-context";
import { Wifi, WifiOff, RefreshCw, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { format } from "date-fns";

export function OfflineIndicator() {
  const { isOnline, isPending, hasPendingChanges, syncData, lastSyncTime } = useOffline();

  if (isOnline && !hasPendingChanges) {
    return null; // Don't show anything when online and synced
  }

  return (
    <div className="fixed top-3 right-3 z-50">
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border shadow-lg
        ${!isOnline 
          ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          : hasPendingChanges 
            ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300'
            : 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
        }
      `}>
        
        {/* Status Icon */}
        <div className="flex-shrink-0">
          {!isOnline ? (
            <WifiOff className="h-4 w-4" />
          ) : isPending ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Wifi className="h-4 w-4" />
          )}
        </div>

        {/* Status Text */}
        <div className="flex-1 min-w-0">
          {!isOnline ? (
            <span className="text-sm font-medium">Offline Mode</span>
          ) : isPending ? (
            <span className="text-sm font-medium">Syncing...</span>
          ) : hasPendingChanges ? (
            <span className="text-sm font-medium">Changes pending</span>
          ) : (
            <span className="text-sm font-medium">Online</span>
          )}
          
          {/* Last sync time */}
          {lastSyncTime > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              <span className="text-xs opacity-75">
                Last sync: {format(new Date(lastSyncTime), 'HH:mm')}
              </span>
            </div>
          )}
        </div>

        {/* Sync Button */}
        {isOnline && hasPendingChanges && !isPending && (
          <Button
            size="sm"
            variant="ghost"
            onClick={syncData}
            className="ml-2 p-1 h-auto"
            data-testid="button-sync-offline"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}