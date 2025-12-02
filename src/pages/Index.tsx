import { useState } from 'react';
import { Header } from '@/components/Header';
import { TaskFilters } from '@/components/TaskFilters';
import { KanbanBoard } from '@/components/KanbanBoard';
import { ListView } from '@/components/ListView';
import { TaskForm } from '@/components/TaskForm';
import { VoiceInput } from '@/components/VoiceInput';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { useTaskStore } from '@/store/taskStore';
import { Task, TaskStatus, ParsedTaskData } from '@/types/task';
import { DEMO_TASKS } from '@/utils/demoTasks';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const {
    tasks,
    filters,
    viewMode,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    setFilters,
    clearFilters,
    setViewMode,
    getFilteredTasks,
  } = useTaskStore();
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; taskId: string | null; taskTitle?: string }>({
    open: false,
    taskId: null,
  });
  const [initialStatus, setInitialStatus] = useState<TaskStatus>('todo');
  
  const filteredTasks = getFilteredTasks();
  
  const handleAddTask = (status?: TaskStatus) => {
    setInitialStatus(status || 'todo');
    setEditingTask(null);
    setShowTaskForm(true);
  };
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };
  
  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    setDeleteConfirm({ open: true, taskId, taskTitle: task?.title });
  };
  
  const confirmDelete = () => {
    if (deleteConfirm.taskId) {
      deleteTask(deleteConfirm.taskId);
      toast.success('Task deleted');
    }
    setDeleteConfirm({ open: false, taskId: null });
  };
  
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      toast.success('Task updated');
    } else {
      addTask(taskData);
      toast.success('Task created');
    }
  };
  
  const handleVoiceTaskCreated = (taskData: Omit<ParsedTaskData, 'rawTranscript'>) => {
    addTask({
      title: taskData.title || 'Untitled Task',
      description: taskData.description,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate,
    });
  };
  
  const handleLoadDemo = () => {
    DEMO_TASKS.forEach((task) => addTask(task));
    toast.success('Demo tasks loaded!');
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
      </div>
      
      <Header />
      
      <main className="container py-8 relative">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Your Tasks</h2>
              <p className="text-muted-foreground">
                {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} 
                {filters.search || filters.status || filters.priority ? ' (filtered)' : ''}
              </p>
            </div>
            <Button onClick={() => handleAddTask()} className="shadow-lg">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <TaskFilters
            search={filters.search}
            status={filters.status}
            priority={filters.priority}
            viewMode={viewMode}
            onSearchChange={(value) => setFilters({ search: value })}
            onStatusChange={(value) => setFilters({ status: value })}
            onPriorityChange={(value) => setFilters({ priority: value })}
            onViewModeChange={setViewMode}
            onClearFilters={clearFilters}
          />
        </div>
        
        <div className="min-h-[400px]">
          {tasks.length === 0 ? (
            <EmptyState onAddTask={() => handleAddTask()} onLoadDemo={handleLoadDemo} />
          ) : viewMode === 'board' ? (
            <KanbanBoard
              tasks={filteredTasks}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onMoveTask={moveTask}
              onAddTask={handleAddTask}
            />
          ) : (
            <ListView tasks={filteredTasks} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} />
          )}
        </div>
      </main>
      
      <div className="fixed bottom-8 right-8 z-50">
        <VoiceInput onTaskCreated={handleVoiceTaskCreated} />
      </div>
      
      <TaskForm
        task={editingTask}
        initialData={editingTask ? undefined : { status: initialStatus }}
        open={showTaskForm}
        onClose={() => { setShowTaskForm(false); setEditingTask(null); }}
        onSave={handleSaveTask}
      />
      
      <DeleteConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, taskId: null })}
        onConfirm={confirmDelete}
        taskTitle={deleteConfirm.taskTitle}
      />
    </div>
  );
};

export default Index;
