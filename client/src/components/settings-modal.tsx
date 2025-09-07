import React, { useState } from "react";
import { X, Settings, Eye, EyeOff, Brain, Heart, Dumbbell, Users } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showScores: boolean;
  onToggleScores: (show: boolean) => void;
  enabledPersonalities?: {
    therapist: boolean;
    friend: boolean;
    trainer: boolean;
  };
  onUpdatePersonalities?: (personalities: {
    therapist: boolean;
    friend: boolean;
    trainer: boolean;
  }) => void;
}

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  showScores, 
  onToggleScores,
  enabledPersonalities = {
    therapist: true,
    friend: true,
    trainer: true,
  },
  onUpdatePersonalities
}: SettingsModalProps) {
  const [localPersonalities, setLocalPersonalities] = useState(enabledPersonalities);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" data-testid="modal-settings">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
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
          {/* Scores Visibility Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {showScores ? (
                  <Eye className="h-4 w-4 text-accent" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium text-foreground">Show Scores & Gamification</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {showScores 
                  ? "Points, badges, and detailed progress tracking are visible" 
                  : "Focus mode - only basic habit tracking without points"}
              </p>
            </div>
            <button
              onClick={() => onToggleScores(!showScores)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                showScores 
                  ? "bg-accent text-accent-foreground hover:bg-accent/90" 
                  : "border border-border text-foreground hover:bg-muted"
              }`}
              data-testid="toggle-scores-visibility"
            >
              {showScores ? "ON" : "OFF"}
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
              ].map(({ key, label, icon: Icon, description }) => (
                <div key={key} className="flex items-center justify-between py-2">
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
                        onUpdatePersonalities?.(updated);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
              ))}
            </div>
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
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors"
            data-testid="button-close-settings-footer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}