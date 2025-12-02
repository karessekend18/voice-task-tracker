import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TaskStatus, TaskPriority } from '@/types/task';

interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  search: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
}

interface TaskStore {
  tasks: Task[];
  filters: TaskFilters;
  viewMode: 'board' | 'list';
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStatus: TaskStatus) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  setViewMode: (mode: 'board' | 'list') => void;
  
  // Getters
  getFilteredTasks: () => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
}

const generateId = () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      filters: { search: '' },
      viewMode: 'board',
      
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
        return newTask;
      },
      
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        }));
      },
      
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },
      
      moveTask: (id, newStatus) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, status: newStatus, updatedAt: new Date() }
              : task
          ),
        }));
      },
      
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },
      
      clearFilters: () => {
        set({ filters: { search: '' } });
      },
      
      setViewMode: (mode) => {
        set({ viewMode: mode });
      },
      
      getFilteredTasks: () => {
        const { tasks, filters } = get();
        
        return tasks.filter((task) => {
          // Search filter
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch =
              task.title.toLowerCase().includes(searchLower) ||
              task.description?.toLowerCase().includes(searchLower);
            if (!matchesSearch) return false;
          }
          
          // Status filter
          if (filters.status && task.status !== filters.status) {
            return false;
          }
          
          // Priority filter
          if (filters.priority && task.priority !== filters.priority) {
            return false;
          }
          
          // Due date range filter
          if (filters.dueDateFrom && task.dueDate) {
            if (new Date(task.dueDate) < filters.dueDateFrom) return false;
          }
          if (filters.dueDateTo && task.dueDate) {
            if (new Date(task.dueDate) > filters.dueDateTo) return false;
          }
          
          return true;
        });
      },
      
      getTasksByStatus: (status) => {
        return get().getFilteredTasks().filter((task) => task.status === status);
      },
    }),
    {
      name: 'voice-task-tracker-storage',
      partialize: (state) => ({ tasks: state.tasks, viewMode: state.viewMode }),
    }
  )
);
