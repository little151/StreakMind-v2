import React, { useState, useEffect } from "react";
import { X, Settings, Eye, EyeOff, Brain, Heart, Dumbbell, Users, Bell, BellOff, RefreshCw, Trash2, Database, ChevronDown, ChevronRight } from "lucide-react";
import { useSettings, useUpdateSettings, useResetSettings } from "../hooks/use-settings";
import { useMemory, useClearMemory, useRemoveMemoryItem } from "../hooks/use-memory";
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
  const removeMemoryItem = useRemoveMemoryItem();

  const [localPersonalities, setLocalPersonalities] = useState({
    therapist: true,
    friend: true,
    trainer: true,
  });

  const [expandedMemorySection, setExpandedMemorySection] = useState<string | null>(null);

  useEffect(() => {
    if (settings?.enabledPersonalities) {
      setLocalPersonalities(settings.enabledPersonalities);
    }
  }, [settings]);

  const handleDeleteMemoryItem = (category: string, item: string) => {
    removeMemoryItem.mutate({ category, item });
  };

  const toggleMemorySection = (section: string) => {
    setExpandedMemorySection(expandedMemorySection === section ? null : section);
  };
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

          {/* Memory Management - ChatGPT Style */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-4 w-4 text-accent" />
              <h4 className="font-medium text-foreground">Memory</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              What StreakMind remembers about you - delete any memory you no longer want stored
            </p>

            {memoryLoading && (
              <div className="text-center py-4">
                <div className="text-sm text-muted-foreground">Loading memory...</div>
              </div>
            )}

            {memory && !memoryLoading && (
              <div className="space-y-4">
                {/* Memory Items - ChatGPT Style List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {/* Name */}
                  {memory.name && (
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors">
                      <div className="text-sm text-foreground">Your name is {memory.name}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearMemory.mutate(['name'])}
                        disabled={clearMemory.isPending}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid="button-delete-memory-name"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {/* Goals */}
                  {memory.personalContext.goals.map((goal, index) => (
                    <div key={`goal-${index}`} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors">
                      <div className="text-sm text-foreground">You want to {goal}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMemoryItem('goals', goal)}
                        disabled={removeMemoryItem.isPending}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-delete-memory-goal-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {/* Challenges */}
                  {memory.personalContext.challenges.map((challenge, index) => (
                    <div key={`challenge-${index}`} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors">
                      <div className="text-sm text-foreground">You're working on {challenge}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMemoryItem('challenges', challenge)}
                        disabled={removeMemoryItem.isPending}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-delete-memory-challenge-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {/* Achievements */}
                  {memory.personalContext.achievements.map((achievement, index) => (
                    <div key={`achievement-${index}`} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors">
                      <div className="text-sm text-foreground">You've achieved {achievement}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMemoryItem('achievements', achievement)}
                        disabled={removeMemoryItem.isPending}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-delete-memory-achievement-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {/* Preferred Activities */}
                  {memory.preferences.preferredActivities.map((activity, index) => (
                    <div key={`activity-${index}`} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors">
                      <div className="text-sm text-foreground">You enjoy {activity}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMemoryItem('preferredActivities', activity)}
                        disabled={removeMemoryItem.isPending}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-delete-memory-activity-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {/* Common Topics */}
                  {memory.conversationContext.commonTopics.map((topic, index) => (
                    <div key={`topic-${index}`} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors">
                      <div className="text-sm text-foreground">You often discuss {topic}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMemoryItem('commonTopics', topic)}
                        disabled={removeMemoryItem.isPending}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-delete-memory-topic-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {/* Struggling With */}
                  {memory.conversationContext.strugglingWith.map((struggle, index) => (
                    <div key={`struggle-${index}`} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors">
                      <div className="text-sm text-foreground">You're struggling with {struggle}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMemoryItem('strugglingWith', struggle)}
                        disabled={removeMemoryItem.isPending}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-delete-memory-struggle-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {/* Celebrating */}
                  {memory.conversationContext.celebrating.map((celebration, index) => (
                    <div key={`celebration-${index}`} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors">
                      <div className="text-sm text-foreground">You're celebrating {celebration}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMemoryItem('celebrating', celebration)}
                        disabled={removeMemoryItem.isPending}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-delete-memory-celebration-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {/* Empty State */}
                  {!memory.name && 
                   memory.personalContext.goals.length === 0 && 
                   memory.personalContext.challenges.length === 0 && 
                   memory.personalContext.achievements.length === 0 && 
                   memory.preferences.preferredActivities.length === 0 && 
                   memory.conversationContext.commonTopics.length === 0 && 
                   memory.conversationContext.strugglingWith.length === 0 && 
                   memory.conversationContext.celebrating.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-sm text-muted-foreground">No memories stored yet</div>
                      <div className="text-xs text-muted-foreground mt-1">Start chatting to build your memory profile!</div>
                    </div>
                  )}
                </div>

                {/* Clear All Action */}
                <div className="border-t border-border pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearMemory.mutate(['all'])}
                    disabled={clearMemory.isPending}
                    className="w-full justify-center text-sm text-destructive border-destructive/20 hover:bg-destructive/10"
                    data-testid="button-clear-all-memory"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    {clearMemory.isPending ? "Clearing..." : "Clear All Memory"}
                  </Button>
                  <div className="text-xs text-muted-foreground text-center mt-2">
                    Last updated: {new Date(memory.updatedAt).toLocaleDateString()}
                  </div>
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