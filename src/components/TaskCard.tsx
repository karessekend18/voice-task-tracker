import { Task, PRIORITY_CONFIG, STATUS_CONFIG } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Pencil, Trash2, GripVertical } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function TaskCard({ task, onEdit, onDelete, isDragging, dragHandleProps }: TaskCardProps) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  
  const formatDueDate = (date: Date) => {
    const d = new Date(date);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'MMM d');
  };
  
  const isDueDatePast = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
  
  const priorityVariant = task.priority as 'urgent' | 'high' | 'medium' | 'low';
  
  return (
    <div
      className={cn(
        "group glass rounded-lg p-4 cursor-pointer transition-all duration-200",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        isDragging && "opacity-50 shadow-2xl rotate-2",
        "animate-scale-in"
      )}
      onClick={() => onEdit(task)}
    >
      <div className="flex items-start gap-3">
        <div
          {...dragHandleProps}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing mt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-medium text-foreground truncate">{task.title}</h3>
            <Badge variant={priorityVariant} className="shrink-0">
              {priorityConfig.label}
            </Badge>
          </div>
          
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {task.dueDate && (
                <div className={cn(
                  "flex items-center gap-1.5 text-xs",
                  isDueDatePast ? "text-destructive" : "text-muted-foreground"
                )}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDueDate(task.dueDate)}</span>
                </div>
              )}
              {task.dueDate && (
                <div className={cn(
                  "flex items-center gap-1.5 text-xs",
                  isDueDatePast ? "text-destructive" : "text-muted-foreground"
                )}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{format(new Date(task.dueDate), 'h:mm a')}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="iconSm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="h-7 w-7"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="iconSm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
