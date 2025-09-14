import React, { useState, useEffect } from "react";
import { X, Settings, Eye, EyeOff, Brain, Heart, Dumbbell, Users, Bell, BellOff, RefreshCw, Trash2, Database } from "lucide-react";
import { useSettings, useUpdateSettings, useResetSettings } from "../hooks/use-settings";
import { useMemory, useClearMemory } from "../hooks/use-memory";
import { Button } from "./ui/button";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ 
  isOpen, 
  onClose
}: SettingsModalProps) {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const resetSettings = useResetSettings();
  const { data: memory, isLoading: memoryLoading } = useMemory();
  const clearMemory = useClearMemory();

  const [localPersonalities, setLocalPersonalities] = useState({
    therapist: true,
    friend: true,
    trainer: true,
  });

  useEffect(() => {
    if (settings?.enabledPersonalities) {
      setLocalPersonalities(settings.enabledPersonalities);
    }
  }, [settings]);
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-200" 
      data-testid="modal-settings"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-4 fade-in-0 zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Settings className="h-4 w-4 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-2 rounded"
            data-testid="button-close-settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading settings...</div>
            </div>
          )}

          {/* Settings Content */}
          {settings && !isLoading && (
            <>
              {/* Scores Visibility Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {settings.showScores ? (
                      <Eye className="h-4 w-4 text-accent" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium text-foreground">Show Scores & Gamification</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {settings.showScores 
                      ? "Points, badges, and detailed progress tracking are visible" 
                      : "Focus mode - only basic habit tracking without points"}
                  </p>
                </div>
                <button
                  onClick={() => updateSettings.mutate({ showScores: !settings.showScores })}
                  disabled={updateSettings.isPending}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                settings.showScores 
                  ? "bg-accent text-accent-foreground hover:bg-accent/90" 
                  : "border border-border text-foreground hover:bg-muted"
              }`}
              data-testid="toggle-scores-visibility"
            >
              {updateSettings.isPending ? "..." : (settings.showScores ? "ON" : "OFF")}
            </button>
          </div>

          {/* Personality Toggles */}
          <div className="border-t border-border pt-6">
            <h4 className="font-medium text-foreground mb-3">AI Personality Modes</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Choose which personality modes your AI companion can use when responding
            </p>
            <div className="space-y-3">
              {[
                { key: 'therapist', label: 'Therapist', icon: Heart, description: 'Warm, empathetic support' },
                { key: 'friend', label: 'Friend', icon: Users, description: 'Casual, friendly encouragement' },
                { key: 'trainer', label: 'Trainer', icon: Dumbbell, description: 'High-energy motivation' },
              ].map(({ key, label, icon: Icon, description }, index) => (
                <div 
                  key={key} 
                  className="flex items-center justify-between py-2 animate-in slide-in-from-left-4 fade-in-0 duration-200"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-accent" />
                    <div>
                      <div className="font-medium text-sm">{label}</div>
                      <div className="text-xs text-muted-foreground">{description}</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPersonalities[key as keyof typeof localPersonalities]}
                      onChange={(e) => {
                        const updated = {
                          ...localPersonalities,
                          [key]: e.target.checked
                        };
                        setLocalPersonalities(updated);
                        updateSettings.mutate({ enabledPersonalities: updated });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Memory Management */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-4 w-4 text-accent" />
              <h4 className="font-medium text-foreground">Memory Management</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage what StreakMind remembers about you
            </p>

            {memoryLoading && (
              <div className="text-center py-4">
                <div className="text-sm text-muted-foreground">Loading memory...</div>
              </div>
            )}

            {memory && !memoryLoading && (
              <div className="space-y-4">
                {/* Memory Summary */}
                <div className="bg-muted/30 rounded-lg p-3 space-y-2 text-sm">
                  {memory.name && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{memory.name}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Goals:</span>
                    <span className="font-medium">{memory.personalContext.goals.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Challenges:</span>
                    <span className="font-medium">{memory.personalContext.challenges.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Achievements:</span>
                    <span className="font-medium">{memory.personalContext.achievements.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Preferred Activities:</span>
                    <span className="font-medium">{memory.preferences.preferredActivities.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">
                      {new Date(memory.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Memory Actions */}
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearMemory.mutate(['name'])}
                    disabled={clearMemory.isPending || !memory.name}
                    className="justify-start text-sm"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Clear Name
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearMemory.mutate(['goals', 'challenges', 'achievements'])}
                    disabled={clearMemory.isPending}
                    className="justify-start text-sm"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Clear Personal Context
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearMemory.mutate(['commonTopics', 'strugglingWith', 'celebrating'])}
                    disabled={clearMemory.isPending}
                    className="justify-start text-sm"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Clear Conversation History
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearMemory.mutate(['all'])}
                    disabled={clearMemory.isPending}
                    className="justify-start text-sm text-destructive border-destructive/20 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    {clearMemory.isPending ? "Clearing..." : "Clear All Memory"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="border-t border-border pt-6">
            <h4 className="font-medium text-foreground mb-3">How StreakMind Works</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong className="text-foreground">Log activities:</strong> Just chat naturally - "Did 30 min meditation" or "Went to gym"</p>
              <p>• <strong className="text-foreground">Create new habits:</strong> Say "I want to track reading" to add new activities</p>
              <p>• <strong className="text-foreground">CRUD commands:</strong> "Delete meditation", "Rename gym to workout", "Set reading points to 15"</p>
              <p>• <strong className="text-foreground">AI personality:</strong> I adapt based on enabled personality modes</p>
              <p>• <strong className="text-foreground">General chat:</strong> Ask me anything! I can help with non-tracking questions too</p>
            </div>
          </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-all duration-200 hover:scale-105 active:scale-95"
            data-testid="button-close-settings-footer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}