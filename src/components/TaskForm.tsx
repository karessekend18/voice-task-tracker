import { useState, useEffect } from 'react';
import {
  Task,
  TaskStatus,
  TaskPriority,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
} from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskFormProps {
  task?: Task | null;
  initialData?: Partial<Task>;
  open: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  title?: string;
}

type FormState = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  dueTime: string;
};

type FormErrors = {
  title?: string;
  dueDate?: string;
};

export function TaskForm({
  task,
  initialData,
  open,
  onClose,
  onSave,
  title,
}: TaskFormProps) {
  const [formData, setFormData] = useState<FormState>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: undefined,
    dueTime: '17:00',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        dueTime: task.dueDate
          ? format(new Date(task.dueDate), 'HH:mm')
          : '17:00',
      });
    } else if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'todo',
        priority: initialData.priority || 'medium',
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate)
          : undefined,
        dueTime: initialData.dueDate
          ? format(new Date(initialData.dueDate), 'HH:mm')
          : '17:00',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: undefined,
        dueTime: '17:00',
      });
    }

    // reset errors when dialog opens / changes context
    setErrors({});
  }, [task, initialData, open]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Hard validation: title must be present
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required.';
    }

    // Soft validation: warn about past due date, but don't block
    if (formData.dueDate) {
      const d = new Date(formData.dueDate);

      if (isPast(d) && !isToday(d) && formData.status !== 'done') {
        newErrors.dueDate =
          'Due date is in the past. This task will be marked as overdue.';
      }
    }

    setErrors(newErrors);

    // Only treat "title" as blocking
    return !newErrors.title;
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    let finalDueDate = formData.dueDate;
    if (finalDueDate && formData.dueTime) {
      const [hours, minutes] = formData.dueTime.split(':').map(Number);
      finalDueDate = new Date(finalDueDate);
      finalDueDate.setHours(hours, minutes, 0, 0);
    }

    onSave({
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      dueDate: finalDueDate,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px] glass border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {title || (task ? 'Edit Task' : 'Create New Task')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="What needs to be done?"
              className={cn(
                'bg-secondary/50',
                errors.title && 'border-destructive focus-visible:ring-destructive'
              )}
            />
            {errors.title && (
              <p className="text-xs text-destructive mt-1">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Add more details..."
              rows={3}
              className="bg-secondary/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TaskStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full',
                            `bg-${config.color}`
                          )}
                        />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: TaskPriority) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full',
                            `bg-${config.color}`
                          )}
                        />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal bg-secondary/50',
                      !formData.dueDate && 'text-muted-foreground',
                      errors.dueDate &&
                        'border-destructive text-destructive hover:text-destructive'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate
                      ? format(formData.dueDate, 'PPP')
                      : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) =>
                      setFormData({ ...formData, dueDate: date || undefined })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dueDate && (
                <p className="text-xs text-destructive mt-1">
                  {errors.dueDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Due Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) =>
                    setFormData({ ...formData, dueTime: e.target.value })
                  }
                  className="pl-10 bg-secondary/50"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title.trim()}>
              {task ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
