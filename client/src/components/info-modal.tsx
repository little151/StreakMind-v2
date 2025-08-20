import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function InfoModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8" data-testid="button-info">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>StreakMind - MVP Guide</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">What is StreakMind?</h3>
            <p className="text-muted-foreground">
              StreakMind is a chat-based habit tracker that uses natural language processing to understand your habit logs. 
              Simply tell it what you did, and it will automatically track your progress!
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-3">How to Log Habits</h3>
            <p className="text-muted-foreground mb-3">
              Type your habit updates in natural language. The AI understands various formats:
            </p>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <div><strong>Coding:</strong> "Did 3 coding questions today" or "Coded for 2 hours"</div>
              <div><strong>Fitness:</strong> "Went to gym for 1 hour" or "Did 30 min workout"</div>
              <div><strong>Sleep:</strong> "Slept 8 hours last night" or "Got good sleep"</div>
              <div><strong>Learning:</strong> "Read for 45 minutes" or "Studied 3 chapters"</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Supported Categories</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/50 rounded p-3">
                <strong>🚀 Coding</strong><br/>
                Programming, problem solving, development work
              </div>
              <div className="bg-muted/50 rounded p-3">
                <strong>💪 Fitness</strong><br/>
                Gym, workouts, exercise, sports activities
              </div>
              <div className="bg-muted/50 rounded p-3">
                <strong>😴 Sleep</strong><br/>
                Sleep tracking, rest, recovery time
              </div>
              <div className="bg-muted/50 rounded p-3">
                <strong>📚 Learning</strong><br/>
                Reading, studying, courses, skill development
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Points & Streaks</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>• <strong>Coding:</strong> 20 points per log</div>
              <div>• <strong>Fitness:</strong> 30 points per log</div>
              <div>• <strong>Sleep:</strong> 10 points per log</div>
              <div>• <strong>Learning:</strong> 15 points per log</div>
              <div>• <strong>Streaks:</strong> Count consecutive days (once per day max)</div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ MVP Notice</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              This is an unstable MVP build. For best results, use simple, clear language when logging habits. 
              The AI is learning and improving with each interaction!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}