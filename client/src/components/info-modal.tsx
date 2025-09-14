import { Info, MessageSquare, Brain, Edit, Zap, Target, Settings, Database, Trash2, Palette, Save } from "lucide-react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 modal-backdrop animate-in fade-in-0 duration-200" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-card border border-border rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 fade-in-0 zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Info className="h-4 w-4 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">StreakMind v2 - Complete Guide</h3>
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
          <div className="animate-in slide-in-from-left-2 fade-in-0 duration-300">
            <h3 className="font-semibold text-lg mb-3">🤖 What is StreakMind v2?</h3>
            <p className="text-muted-foreground">
              StreakMind v2 is your enhanced personal AI companion for habit tracking with **persistent memory**, 
              **advanced chat management**, **comprehensive data persistence**, and **smooth animations**. 
              Chat naturally to log activities, get personalized motivation, and track your progress with 
              enhanced gamification features that save across all sessions.
            </p>
          </div>

          {/* New StreakMind v2 Features */}
          <div className="bg-gradient-to-r from-accent/10 to-transparent border border-accent/20 rounded-lg p-4 mb-6 animate-in slide-in-from-bottom-2 fade-in-0 duration-500">
            <h3 className="font-semibold text-lg mb-4 text-accent flex items-center gap-2">
              ✨ New in StreakMind v2
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground">
                  <Brain className="h-4 w-4 text-accent" />
                  <strong>Bot Memory System</strong>
                </div>
                <div className="text-muted-foreground ml-6">I now remember your preferences, habits, and context across sessions for truly personalized interactions!</div>
                
                <div className="flex items-center gap-2 text-foreground">
                  <Trash2 className="h-4 w-4 text-accent" />
                  <strong>Advanced Chat Management</strong>
                </div>
                <div className="text-muted-foreground ml-6">Multi-select delete, bulk operations, and persistent chat history that survives page refreshes.</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground">
                  <Save className="h-4 w-4 text-accent" />
                  <strong>Settings Persistence</strong>
                </div>
                <div className="text-muted-foreground ml-6">All your preferences are now saved across sessions - dark mode, personality settings, and more!</div>
                
                <div className="flex items-center gap-2 text-foreground">
                  <Palette className="h-4 w-4 text-accent" />
                  <strong>Enhanced Animations</strong>
                </div>
                <div className="text-muted-foreground ml-6">Smooth, modern animations throughout the app for a delightful user experience.</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="animate-in slide-in-from-left-3 fade-in-0 duration-400" style={{ animationDelay: "100ms" }}>
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

            <div className="animate-in slide-in-from-right-3 fade-in-0 duration-400" style={{ animationDelay: "400ms" }}>
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                AI Personality System
              </h4>
              <p className="text-muted-foreground mb-2 text-sm">I adapt my responses as (toggle in settings):</p>
              <div className="space-y-1 text-muted-foreground ml-4 text-sm">
                <div>• ❤️ <strong>Therapist:</strong> Empathetic & supportive</div>
                <div>• 👥 <strong>Friend:</strong> Casual & encouraging</div>
                <div>• 💪 <strong>Trainer:</strong> High-energy motivation</div>
                <div className="text-xs text-accent/60 mt-2">Note: Father Mode permanently removed in v2</div>
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

            <div className="animate-in slide-in-from-left-3 fade-in-0 duration-400" style={{ animationDelay: "600ms" }}>
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Database className="h-4 w-4 text-accent" />
                Data Persistence & Management
              </h4>
              <p className="text-muted-foreground mb-2 text-sm">Everything saves automatically:</p>
              <div className="space-y-1 text-muted-foreground ml-4 text-sm">
                <div>• 🧠 Bot memory (memory.json)</div>
                <div>• 💬 Chat history (chatData.json)</div>
                <div>• 📊 Activity data (data.json)</div>
                <div>• ⚙️ Settings (settings.json)</div>
                <div>• 🗑️ Multi-select message deletion</div>
                <div>• 🔄 Dashboard visualization persistence</div>
                <div>• 📱 Cross-session continuity</div>
                <div>• 🎨 Smooth UI animations throughout</div>
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
            className="px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-all duration-200 button-scale"
            data-testid="button-close-info-footer"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}