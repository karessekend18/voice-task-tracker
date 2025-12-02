import { TaskStatus, TaskPriority, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskFiltersProps {
  search: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  viewMode: 'board' | 'list';
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TaskStatus | undefined) => void;
  onPriorityChange: (value: TaskPriority | undefined) => void;
  onViewModeChange: (mode: 'board' | 'list') => void;
  onClearFilters: () => void;
}

export function TaskFilters({
  search,
  status,
  priority,
  viewMode,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onViewModeChange,
  onClearFilters,
}: TaskFiltersProps) {
  const hasActiveFilters = search || status || priority;
  
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="pl-10 bg-secondary/50"
        />
        {search && (
          <Button
            variant="ghost"
            size="iconSm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => onSearchChange('')}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
      
      {/* Status Filter */}
      <Select
        value={status || 'all'}
        onValueChange={(value) => onStatusChange(value === 'all' ? undefined : value as TaskStatus)}
      >
        <SelectTrigger className="w-full sm:w-[140px] bg-secondary/50">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Priority Filter */}
      <Select
        value={priority || 'all'}
        onValueChange={(value) => onPriorityChange(value === 'all' ? undefined : value as TaskPriority)}
      >
        <SelectTrigger className="w-full sm:w-[140px] bg-secondary/50">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
      
      {/* View Toggle */}
      <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
        <Button
          variant={viewMode === 'board' ? 'secondary' : 'ghost'}
          size="iconSm"
          onClick={() => onViewModeChange('board')}
          className={cn(viewMode === 'board' && 'bg-card shadow-sm')}
        >
          <LayoutGrid className="w-4 h-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'secondary' : 'ghost'}
          size="iconSm"
          onClick={() => onViewModeChange('list')}
          className={cn(viewMode === 'list' && 'bg-card shadow-sm')}
        >
          <List className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
