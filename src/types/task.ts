export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  rawTranscript: string;
}

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  'todo': { label: 'To Do', color: 'status-todo' },
  'in-progress': { label: 'In Progress', color: 'status-progress' },
  'done': { label: 'Done', color: 'status-done' },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; order: number }> = {
  'urgent': { label: 'Urgent', color: 'priority-urgent', order: 0 },
  'high': { label: 'High', color: 'priority-high', order: 1 },
  'medium': { label: 'Medium', color: 'priority-medium', order: 2 },
  'low': { label: 'Low', color: 'priority-low', order: 3 },
};
