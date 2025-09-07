import { Info, MessageSquare, Brain, Edit, Zap, Target, Settings } from "lucide-react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 modal-backdrop">
      <div className="bg-card border border-border rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Info className="h-4 w-4 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">StreakMind - Complete Guide</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-2 rounded"
            data-testid="button-close-info"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">🤖 What is StreakMind?</h3>
            <p className="text-muted-foreground">
              StreakMind is your personal AI companion for habit tracking. Chat naturally to log activities, 
              get personalized motivation, and track your progress with advanced gamification features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-accent" />
                Natural Language Logging
              </h4>
              <p className="text-muted-foreground mb-2 text-sm">Just chat naturally - I understand context:</p>
              <div className="space-y-1 text-muted-foreground ml-4 text-sm">
                <div>• "Did 2 LeetCode questions"</div>
                <div>• "Went to gym for 45 minutes"</div>
                <div>• "Slept 8 hours"</div>
                <div>• "Read 20 pages yesterday"</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4 text-accent" />
                Dynamic Activity Creation
              </h4>
              <p className="text-muted-foreground mb-2 text-sm">Create new habits instantly:</p>
              <div className="space-y-1 text-muted-foreground ml-4 text-sm">
                <div>• "I want to track reading books"</div>
                <div>• "Add meditation to my habits"</div>
                <div>• "Start tracking piano practice"</div>
                <div>• Click the + tile to add manually</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Edit className="h-4 w-4 text-accent" />
                Full CRUD Operations
              </h4>
              <p className="text-muted-foreground mb-2 text-sm">Manage activities via chat or dashboard:</p>
              <div className="space-y-1 text-muted-foreground ml-4 text-sm">
                <div>• "Delete meditation habit"</div>
                <div>• "Rename gym to workout"</div>
                <div>• "Set reading points to 15"</div>
                <div>• Hover over tiles for quick edit/delete</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                AI Personality System
              </h4>
              <p className="text-muted-foreground mb-2 text-sm">I adapt my responses as (toggle in settings):</p>
              <div className="space-y-1 text-muted-foreground ml-4 text-sm">
                <div>• ❤️ <strong>Therapist:</strong> Empathetic & supportive</div>
                <div>• 👥 <strong>Friend:</strong> Casual & encouraging</div>
                <div>• 💪 <strong>Trainer:</strong> High-energy motivation</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" />
                Custom Points System
              </h4>
              <p className="text-muted-foreground mb-2 text-sm">Personalize your scoring:</p>
              <div className="space-y-1 text-muted-foreground ml-4 text-sm">
                <div>• Default points auto-assigned per activity</div>
                <div>• Override with custom values</div>
                <div>• "Set meditation points to 20"</div>
                <div>• Edit in activity tile quick menu</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4 text-accent" />
                Advanced Features
              </h4>
              <p className="text-muted-foreground mb-2 text-sm">Full control over your experience:</p>
              <div className="space-y-1 text-muted-foreground ml-4 text-sm">
                <div>• Toggle scores & badges ON/OFF</div>
                <div>• Enable/disable personality modes</div>
                <div>• Responsive, scrollable settings panel</div>
                <div>• Persistent chat storage (chatData.json)</div>
                <div>• Activity file storage (data.json)</div>
                <div>• Delete individual chat messages</div>
                <div>• Clear all chat history</div>
                <div>• Smooth UI animations throughout</div>
                <div>• General AI chat for any questions</div>
                <div>• Modern tile-based dashboard</div>
                <div>• Activity quick-edit with visualization types</div>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="border-t border-border pt-6">
            <h4 className="font-medium text-foreground mb-3">💡 Pro Tips</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="space-y-1">
                <div>• Use "yesterday" to log for previous day</div>
                <div>• Activities auto-appear in your dashboard</div>
                <div>• Streaks build with daily consistency</div>
              </div>
              <div className="space-y-1">
                <div>• Ask me anything - I'm here to help!</div>
                <div>• Hover tiles to see edit/delete options</div>
                <div>• Customize points to match your motivation</div>
              </div>
            </div>
          </div>

          {/* Example Commands */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-3">📝 Example Commands</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-foreground">Logging:</strong>
                <div className="text-muted-foreground mt-1 space-y-1">
                  <div>"Did 30 minutes of meditation"</div>
                  <div>"Completed 5 coding challenges"</div>
                  <div>"Went for a 2 mile run"</div>
                </div>
              </div>
              <div>
                <strong className="text-foreground">Management:</strong>
                <div className="text-muted-foreground mt-1 space-y-1">
                  <div>"Add journaling to my habits"</div>
                  <div>"Delete old workout habit"</div>
                  <div>"Set yoga points to 25"</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors"
            data-testid="button-close-info-footer"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}