import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { addDays, subDays, setHours } from 'date-fns';

const generateId = () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const now = new Date();

export const DEMO_TASKS: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Review pull request for authentication module',
    description: 'Check the new OAuth implementation and provide feedback on security measures.',
    status: 'todo',
    priority: 'high',
    dueDate: setHours(addDays(now, 1), 17),
  },
  {
    title: 'Update API documentation',
    description: 'Add examples for new endpoints and update response schemas.',
    status: 'todo',
    priority: 'medium',
    dueDate: setHours(addDays(now, 3), 14),
  },
  {
    title: 'Fix navigation bug on mobile',
    description: 'The hamburger menu doesn\'t close after selecting an item on iOS devices.',
    status: 'in-progress',
    priority: 'urgent',
    dueDate: setHours(now, 18),
  },
  {
    title: 'Design system updates',
    description: 'Implement new color palette and typography changes across components.',
    status: 'in-progress',
    priority: 'medium',
    dueDate: setHours(addDays(now, 2), 12),
  },
  {
    title: 'Optimize database queries',
    description: 'Profile slow queries and add proper indexes.',
    status: 'todo',
    priority: 'high',
    dueDate: setHours(addDays(now, 4), 17),
  },
  {
    title: 'Write unit tests for user service',
    description: 'Achieve 80% code coverage for the user authentication service.',
    status: 'done',
    priority: 'medium',
    dueDate: setHours(subDays(now, 1), 17),
  },
  {
    title: 'Deploy staging environment',
    status: 'done',
    priority: 'low',
    dueDate: setHours(subDays(now, 2), 15),
  },
  {
    title: 'Team standup meeting notes',
    description: 'Document action items from today\'s standup.',
    status: 'todo',
    priority: 'low',
    dueDate: setHours(addDays(now, 1), 10),
  },
];

export function createDemoTasks(): Task[] {
  return DEMO_TASKS.map((taskData, index) => ({
    ...taskData,
    id: generateId() + index,
    createdAt: subDays(now, Math.floor(Math.random() * 7)),
    updatedAt: new Date(),
  }));
}
