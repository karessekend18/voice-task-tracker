import { Mic, Plus, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddTask: () => void;
  onLoadDemo?: () => void;
}

export function EmptyState({ onAddTask, onLoadDemo }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center animate-float">
          <Mic className="w-10 h-10 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-foreground mb-3 text-center">
        Start with Your First Task
      </h3>
      
      <p className="text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
        Create tasks manually or use <span className="text-primary font-medium">voice input</span> to speak naturally.
        <br />
        Try saying: "Review the design document by tomorrow, high priority"
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Button onClick={onAddTask} size="lg" className="shadow-lg">
          <Plus className="w-5 h-5" />
          Create Task
        </Button>
        
        {onLoadDemo && (
          <>
            <span className="text-muted-foreground text-sm">or</span>
            <Button onClick={onLoadDemo} variant="outline" size="lg">
              <Zap className="w-5 h-5" />
              Load Demo Tasks
            </Button>
          </>
        )}
      </div>
      
      <div className="mt-6 flex items-center gap-2 text-muted-foreground text-sm">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <Mic className="w-5 h-5" />
        </div>
        <span>Click the mic button in the corner to speak</span>
      </div>
      
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">🎤</div>
          <h4 className="font-medium text-sm text-foreground mb-1">Voice Input</h4>
          <p className="text-xs text-muted-foreground">Speak naturally to create tasks</p>
        </div>
        
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">📋</div>
          <h4 className="font-medium text-sm text-foreground mb-1">Kanban Board</h4>
          <p className="text-xs text-muted-foreground">Drag and drop between columns</p>
        </div>
        
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">🎯</div>
          <h4 className="font-medium text-sm text-foreground mb-1">Smart Parsing</h4>
          <p className="text-xs text-muted-foreground">AI extracts title, date & priority</p>
        </div>
      </div>
    </div>
  );
}
