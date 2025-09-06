import React, { useState } from "react";
import { X, Settings, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showScores: boolean;
  onToggleScores: (show: boolean) => void;
}

export default function SettingsModal({ isOpen, onClose, showScores, onToggleScores }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" data-testid="modal-settings">
      <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Settings className="h-4 w-4 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Settings</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-close-settings"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
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
            <Button
              variant={showScores ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleScores(!showScores)}
              className={showScores ? "bg-accent hover:bg-accent/90" : ""}
              data-testid="toggle-scores-visibility"
            >
              {showScores ? "ON" : "OFF"}
            </Button>
          </div>

          {/* Help Section */}
          <div className="border-t border-border pt-6">
            <h4 className="font-medium text-foreground mb-3">How StreakMind Works</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong className="text-foreground">Log activities:</strong> Just chat naturally - "Did 30 min meditation" or "Went to gym"</p>
              <p>• <strong className="text-foreground">Create new habits:</strong> Say "I want to track reading" to add new activities</p>
              <p>• <strong className="text-foreground">AI personality:</strong> I adapt as therapist, friend, trainer, or father based on your needs</p>
              <p>• <strong className="text-foreground">Gamification:</strong> Toggle points and badges on/off to match your motivation style</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} data-testid="button-close-settings-footer">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}