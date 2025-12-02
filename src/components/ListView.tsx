import { Task, PRIORITY_CONFIG, STATUS_CONFIG } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

interface ListViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function ListView({ tasks, onEditTask, onDeleteTask }: ListViewProps) {
  const formatDueDate = (date: Date) => {
    const d = new Date(date);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'MMM d');
  };
  
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <ChevronRight className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No tasks found</h3>
        <p className="text-muted-foreground text-sm">
          Create your first task or adjust your filters
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-muted-foreground uppercase tracking-wider border-b border-border/50">
        <div className="col-span-5">Task</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Priority</div>
        <div className="col-span-2">Due Date</div>
        <div className="col-span-1">Actions</div>
      </div>
      
      {/* Tasks */}
      {tasks.map((task) => {
        const priorityConfig = PRIORITY_CONFIG[task.priority];
        const statusConfig = STATUS_CONFIG[task.status];
        const isDueDatePast = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
        const priorityVariant = task.priority as 'urgent' | 'high' | 'medium' | 'low';
        const statusVariant = task.status === 'in-progress' ? 'progress' : task.status === 'todo' ? 'todo' : 'done';
        
        return (
          <div
            key={task.id}
            className="group grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors animate-slide-up"
            onClick={() => onEditTask(task)}
          >
            {/* Title & Description */}
            <div className="col-span-5">
              <h3 className="font-medium text-foreground truncate">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  {task.description}
                </p>
              )}
            </div>
            
            {/* Status */}
            <div className="col-span-2">
              <Badge variant={statusVariant}>
                {statusConfig.label}
              </Badge>
            </div>
            
            {/* Priority */}
            <div className="col-span-2">
              <Badge variant={priorityVariant}>
                {priorityConfig.label}
              </Badge>
            </div>
            
            {/* Due Date */}
            <div className="col-span-2">
              {task.dueDate ? (
                <div className={cn(
                  "flex items-center gap-2 text-sm",
                  isDueDatePast ? "text-destructive" : "text-muted-foreground"
                )}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDueDate(task.dueDate)}</span>
                  <span className="text-xs">
                    {format(new Date(task.dueDate), 'h:mm a')}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">No date</span>
              )}
            </div>
            
            {/* Actions */}
            <div className="col-span-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="iconSm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTask(task);
                }}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="iconSm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask(task.id);
                }}
                className="hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
