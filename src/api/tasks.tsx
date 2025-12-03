// src/api/tasks.ts
import { TaskStatus, TaskPriority } from '@/types/task';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export type ApiTask = {
  _id?: string;      // backend id (Mongo)
  id?: string;       // frontend/id mapping (we map _id -> id)
  title: string;
  description?: string;
  status?: TaskStatus;     // ⬅️ add this
  priority?: TaskPriority; // ⬅️ and this
  completed?: boolean;     // optional, if you still use it
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  voiceNote?: string | null;
  transcription?: string | null;
};

async function handleRes(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text}`);
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function getTasks(page = 1, limit = 100) {
  const res = await fetch(`${BASE}/tasks?page=${page}&limit=${limit}`);
  return handleRes(res);
}

export async function getTask(id: string) {
  const res = await fetch(`${BASE}/tasks/${id}`);
  return handleRes(res);
}

export async function createTask(payload: Partial<ApiTask>) {
  const res = await fetch(`${BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function updateTask(id: string, updates: Partial<ApiTask>) {
  const res = await fetch(`${BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return handleRes(res);
}

export async function deleteTask(id: string) {
  const res = await fetch(`${BASE}/tasks/${id}`, { method: 'DELETE' });
  return handleRes(res);
}

// Upload voice file (multipart/form-data) - `file` should be a File
export async function uploadVoice(
  file: File,
  extra: { taskId?: string; title?: string; description?: string } = {}
) {
  const form = new FormData();
  form.append('voice', file);
  if (extra.title) form.append('title', extra.title);
  if (extra.description) form.append('description', extra.description);
  if (extra.taskId) form.append('taskId', extra.taskId);

  const res = await fetch(`${BASE}/tasks/upload`, {
    method: 'POST',
    body: form,
  });
  return handleRes(res);
}
