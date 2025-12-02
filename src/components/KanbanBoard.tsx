import { useState } from 'react';
import { Task, TaskStatus, STATUS_CONFIG } from '@/types/task';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: (status: TaskStatus) => void;
}

const COLUMNS: TaskStatus[] = ['todo', 'in-progress', 'done'];

export function KanbanBoard({ tasks, onEditTask, onDeleteTask, onMoveTask, onAddTask }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };
  
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };
  
  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };
  
  const handleDragLeave = () => {
    setDragOverColumn(null);
  };
  
  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      onMoveTask(draggedTask.id, status);
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      {COLUMNS.map((status) => {
        const config = STATUS_CONFIG[status];
        const columnTasks = getTasksByStatus(status);
        const isDragOver = dragOverColumn === status;
        
        return (
          <div
            key={status}
            className={cn(
              "flex flex-col rounded-xl bg-secondary/30 border border-border/50 transition-all duration-200",
              isDragOver && "border-primary/50 bg-primary/5"
            )}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  status === 'todo' && "bg-status-todo",
                  status === 'in-progress' && "bg-status-progress",
                  status === 'done' && "bg-status-done"
                )} />
                <h3 className="font-semibold text-foreground">{config.label}</h3>
                <span className="text-sm text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                  {columnTasks.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="iconSm"
                onClick={() => onAddTask(status)}
                className="opacity-60 hover:opacity-100"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Tasks */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
              {columnTasks.length === 0 ? (
                <div className={cn(
                  "flex items-center justify-center h-32 rounded-lg border-2 border-dashed border-border/50 text-muted-foreground text-sm",
                  isDragOver && "border-primary/50 bg-primary/5"
                )}>
                  {isDragOver ? 'Drop here' : 'No tasks'}
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                  >
                    <TaskCard
                      task={task}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      isDragging={draggedTask?.id === task.id}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
