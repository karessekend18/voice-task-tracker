// src/components/TaskFilters.tsx
import { TaskStatus, TaskPriority, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types/task';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface TaskFiltersProps {
  search: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  viewMode: 'board' | 'list';

  onSearchChange: (value: string) => void;
  onStatusChange: (value?: TaskStatus) => void;
  onPriorityChange: (value?: TaskPriority) => void;
  onViewModeChange: (mode: 'board' | 'list') => void;
  onClearFilters: () => void;

  // NEW for due date filtering
  dueDateFrom?: Date;
  dueDateTo?: Date;
  onDueDateRangeChange: (from?: Date, to?: Date) => void;
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
  dueDateFrom,
  dueDateTo,
  onDueDateRangeChange,
}: TaskFiltersProps) {
  const currentRange: DateRange = {
    from: dueDateFrom,
    to: dueDateTo,
  };

  const hasDateFilter = !!dueDateFrom || !!dueDateTo;

  const dateLabel = (() => {
    if (dueDateFrom && dueDateTo) {
      return `${format(dueDateFrom, 'MMM d, yyyy')} – ${format(
        dueDateTo,
        'MMM d, yyyy'
      )}`;
    }
    if (dueDateFrom) {
      return `From ${format(dueDateFrom, 'MMM d, yyyy')}`;
    }
    if (dueDateTo) {
      return `Until ${format(dueDateTo, 'MMM d, yyyy')}`;
    }
    return 'Any due date';
  })();

  const handleDateSelect = (range: DateRange | undefined) => {
    const from = range?.from;
    const to = range?.to;
    onDueDateRangeChange(from ?? undefined, to ?? undefined);
  };

  const handleClearDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDueDateRangeChange(undefined, undefined);
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {/* Left: Search + basic filters */}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Search by title or description..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full max-w-xs bg-secondary/50"
        />

        <Select
          value={status ?? '__all__'}
          onValueChange={(val) => {
            if (val === '__all__') {
              onStatusChange(undefined);
            } else {
              onStatusChange(val as TaskStatus);
            }
          }}
        >
          <SelectTrigger className="w-[130px] bg-secondary/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>


        <Select
          value={priority ?? '__all__'}
          onValueChange={(val) => {
            if (val === '__all__') {
              onPriorityChange(undefined);
            } else {
              onPriorityChange(val as TaskPriority);
            }
          }}
        >
          <SelectTrigger className="w-[130px] bg-secondary/50">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All priorities</SelectItem>
            {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>


        {/* NEW: Due date range filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start bg-secondary/50 text-left text-sm font-normal',
                hasDateFilter ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span className="truncate max-w-[180px]">{dateLabel}</span>
              {hasDateFilter && (
                <X
                  className="ml-2 h-3 w-3 text-muted-foreground hover:text-foreground"
                  onClick={handleClearDates}
                />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={currentRange}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Right: view toggle + clear */}
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-md border border-border bg-background/60 p-0.5">
          <Button
            type="button"
            variant={viewMode === 'board' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-3"
            onClick={() => onViewModeChange('board')}
          >
            Board
          </Button>
          <Button
            type="button"
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-3"
            onClick={() => onViewModeChange('list')}
          >
            List
          </Button>
        </div>

        <Button type="button" variant="ghost" size="sm" onClick={onClearFilters}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}
