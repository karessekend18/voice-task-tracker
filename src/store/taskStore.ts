import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as tasksApi from '@/api/tasks';
import { Task, TaskStatus, TaskPriority } from '@/types/task';

const toError = (err: unknown, fallback: string) => {
  if (err instanceof Error) return err;
  if (typeof err === 'string') return new Error(err);
  try {
    const str = JSON.stringify(err);
    return new Error(str || fallback);
  } catch {
    return new Error(fallback);
  }
};

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

  // Actions (all async where they hit the backend)
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task | void>;
  deleteTask: (id: string) => Promise<boolean>;
  moveTask: (id: string, newStatus: TaskStatus) => Promise<void | Task>;
  fetchTasks: (page?: number, limit?: number) => Promise<Task[]>;

  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  setViewMode: (mode: 'board' | 'list') => void;

  // Getters
  getFilteredTasks: () => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
}

// Optional local id generator (for fallback / offline, if you ever want it)
const generateId = () =>
  `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper to normalise API response into your Task type
const mapApiTaskToTask = (apiTask: any): Task => {
  if (!apiTask) {
    // defensive fallback
    return {
      id: generateId(),
      title: 'Untitled',
      description: '',
      status: 'todo',
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Task;
  }

  const id = apiTask.id || apiTask._id || generateId();

  return {
    ...(apiTask as Task),
    id,
    createdAt: apiTask.createdAt ? new Date(apiTask.createdAt) : new Date(),
    updatedAt: apiTask.updatedAt ? new Date(apiTask.updatedAt) : new Date(),
  };
};

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      filters: { search: '' },
      viewMode: 'board',

      // CREATE
      addTask: async (
        taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
      ) => {
        try {
          const payload: any = {
            title: taskData.title,
            description: taskData.description,
            status: taskData.status || 'todo',
            priority: taskData.priority || 'medium',
            dueDate: taskData.dueDate ?? null,
            transcription: (taskData as any).transcription,
          };

          const created: any = await tasksApi.createTask(payload);
          const createdRaw = created?.data ?? created;
          const newTask = mapApiTaskToTask(createdRaw);

          set((state) => ({
            tasks: [...state.tasks, newTask],
          }));

          return newTask;
        } catch (err) {
          console.error('addTask API error', err);
          throw toError(err, 'Failed to create task');
        }
      },

      // UPDATE
      updateTask: async (id: string, updates: Partial<Task>) => {
        try {
          const payload: any = {
            ...updates,
            id: undefined, // don't send id in body
          };

          const updated: any = await tasksApi.updateTask(id, payload);
          const updatedRaw = updated?.data ?? updated;
          const updatedTask = mapApiTaskToTask(updatedRaw);

          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id || (task as any)._id === id ? updatedTask : task
            ),
          }));

          return updatedTask;
        } catch (err) {
          console.error('updateTask API error', err);
          throw toError(err, 'Failed to update task');
        }
      },

      // DELETE
      deleteTask: async (id: string) => {
        try {
          await tasksApi.deleteTask(id);

          set((state) => ({
            tasks: state.tasks.filter(
              (task) => task.id !== id && (task as any)._id !== id
            ),
          }));

          return true;
        } catch (err) {
          console.error('deleteTask API error', err);
          throw toError(err, 'Failed to delete task');
        }
      },

      // MOVE (status change)
      moveTask: async (id: string, newStatus: TaskStatus) => {
        try {
          const updated = await get().updateTask(id, { status: newStatus });
          return updated;
        } catch (err) {
          console.error('moveTask API error', err);

          // fallback: update local state only if API fails
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id || (task as any)._id === id
                ? { ...task, status: newStatus, updatedAt: new Date() }
                : task
            ),
          }));

          throw toError(err, 'Failed to move task');
        }
      },

      // FETCH ALL
      fetchTasks: async (page = 1, limit = 100) => {
        try {
          const res: any = await tasksApi.getTasks(page, limit);

          const rawTasks =
            Array.isArray(res) ? res : res?.data ?? res?.tasks ?? [];

          const mappedTasks = rawTasks.map((t: any) => mapApiTaskToTask(t));

          set({ tasks: mappedTasks });

          return mappedTasks;
        } catch (err) {
          console.error(
            'fetchTasks API error',
            toError(err, 'Failed to load tasks')
          );
          return [];
        }
      },

      // FILTERS
      setFilters: (newFilters: Partial<TaskFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      clearFilters: () => {
        set({ filters: { search: '' } });
      },

      setViewMode: (mode: 'board' | 'list') => {
        set({ viewMode: mode });
      },

      // SELECTORS
      getFilteredTasks: () => {
        const { tasks, filters } = get();

        return tasks.filter((task) => {
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch =
              task.title.toLowerCase().includes(searchLower) ||
              task.description?.toLowerCase().includes(searchLower);
            if (!matchesSearch) return false;
          }

          if (filters.status && task.status !== filters.status) {
            return false;
          }

          if (filters.priority && task.priority !== filters.priority) {
            return false;
          }

          if (filters.dueDateFrom && task.dueDate) {
            if (new Date(task.dueDate) < filters.dueDateFrom) return false;
          }
          if (filters.dueDateTo && task.dueDate) {
            if (new Date(task.dueDate) > filters.dueDateTo) return false;
          }

          return true;
        });
      },

      getTasksByStatus: (status: TaskStatus) => {
        return get()
          .getFilteredTasks()
          .filter((task) => task.status === status);
      },
    }),
    {
      name: 'voice-task-tracker-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        viewMode: state.viewMode,
      }),
    }
  )
);
