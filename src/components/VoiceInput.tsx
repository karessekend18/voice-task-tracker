import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Mic,
  MicOff,
  Wand2,
  CalendarIcon,
  Clock,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { parseTaskFromTranscript } from '@/utils/taskParser';
import {
  ParsedTaskData,
  TaskStatus,
  TaskPriority,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
} from '@/types/task';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VoiceInputProps {
  // we now want the full ParsedTaskData including rawTranscript
  onTaskCreated: (taskData: ParsedTaskData) => void;
}

export function VoiceInput({ onTaskCreated }: VoiceInputProps) {
  const {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  } = useVoiceRecognition();

  const [showPreview, setShowPreview] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedTaskData | null>(null);
  const [editedData, setEditedData] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    dueDate: undefined as Date | undefined,
    dueTime: '17:00',
  });
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleVoiceButtonClick = () => {
    if (!isSupported) {
      toast.error(
        'Speech recognition is not supported in your browser. Please use Chrome or Edge.'
      );
      return;
    }

    if (isListening) {
      stopListening();
      if (transcript.trim()) {
        setIsParsing(true);
        // Simulate AI parsing delay
        setTimeout(() => {
          const parsed = parseTaskFromTranscript(transcript);
          setParsedData(parsed);
          setEditedData({
            title: parsed.title || '',
            description: parsed.description || '',
            status: parsed.status || 'todo',
            priority: parsed.priority || 'medium',
            dueDate: parsed.dueDate,
            dueTime: parsed.dueDate
              ? format(parsed.dueDate, 'HH:mm')
              : '17:00',
          });
          setShowPreview(true);
          setIsParsing(false);
        }, 500);
      }
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleCreateTask = () => {
    let finalDueDate = editedData.dueDate;
    if (finalDueDate && editedData.dueTime) {
      const [hours, minutes] = editedData.dueTime.split(':').map(Number);
      finalDueDate = new Date(finalDueDate);
      finalDueDate.setHours(hours, minutes, 0, 0);
    }

    onTaskCreated({
      title: editedData.title,
      description: editedData.description || undefined,
      status: editedData.status,
      priority: editedData.priority,
      dueDate: finalDueDate,
      // make sure the backend can see original voice input
      rawTranscript: parsedData?.rawTranscript || transcript,
    });

    setShowPreview(false);
    setParsedData(null);
    resetTranscript();
    toast.success('Task created successfully!');
  };

  const handleClose = () => {
    setShowPreview(false);
    setParsedData(null);
    resetTranscript();
  };

  const wasFieldAutoDetected = (field: keyof ParsedTaskData) =>
    !!parsedData && !!parsedData[field];

  return (
    <>
      {/* Mic button + helper examples */}
      <div className="flex flex-col items-end gap-2">
        <div className="max-w-xs text-xs text-muted-foreground text-right hidden sm:block">
          <div className="flex items-center justify-end gap-1 mb-1">
            <Info className="w-3 h-3" />
            <span className="uppercase tracking-wide">Try saying:</span>
          </div>
          <ul className="space-y-0.5">
            <li>“High priority finish backend by tomorrow evening”</li>
            <li>“Low priority cleanup task next Monday”</li>
          </ul>
        </div>

        <div className="relative">
          <Button
            variant={isListening ? 'voice' : 'voiceIdle'}
            size="iconXl"
            onClick={handleVoiceButtonClick}
            disabled={isParsing}
            className="shadow-lg"
          >
            {isParsing ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : isListening ? (
              <MicOff className="w-7 h-7" />
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </Button>

          {isListening && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs text-muted-foreground animate-pulse">
                Listening...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Live transcript display */}
      {isListening && transcript && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 max-w-lg w-full mx-4 glass rounded-xl p-4 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse mt-2" />
            <p className="text-sm text-foreground">{transcript}</p>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[550px] glass border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
              <Wand2 className="w-5 h-5 text-primary" />
              Review Parsed Task
            </DialogTitle>
          </DialogHeader>

          {parsedData && (
            <div className="space-y-5">
              {/* Raw Transcript */}
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                  Voice Transcript
                </Label>
                <div className="bg-secondary/50 rounded-lg p-3 text-sm text-muted-foreground">
                  "{parsedData.rawTranscript}"
                </div>

                {/* Detection summary badges */}
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  <Badge
                    variant={wasFieldAutoDetected('title') ? 'default' : 'outline'}
                  >
                    Title:{' '}
                    {wasFieldAutoDetected('title') ? 'Detected' : 'Not detected'}
                  </Badge>
                  <Badge
                    variant={wasFieldAutoDetected('status') ? 'default' : 'outline'}
                  >
                    Status:{' '}
                    {parsedData.status ? parsedData.status : 'Not detected'}
                  </Badge>
                  <Badge
                    variant={
                      wasFieldAutoDetected('priority') ? 'default' : 'outline'
                    }
                  >
                    Priority:{' '}
                    {parsedData.priority ? parsedData.priority : 'Not detected'}
                  </Badge>
                  <Badge
                    variant={
                      wasFieldAutoDetected('dueDate') ? 'default' : 'outline'
                    }
                  >
                    Due Date:{' '}
                    {parsedData.dueDate
                      ? format(parsedData.dueDate, 'PPP')
                      : 'Not detected'}
                  </Badge>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Parsed Fields */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Parsed Fields (editable)
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voice-title">Title</Label>
                  <Input
                    id="voice-title"
                    value={editedData.title}
                    onChange={(e) =>
                      setEditedData({ ...editedData, title: e.target.value })
                    }
                    className="bg-secondary/50"
                    required
                  />
                  {!parsedData.title && (
                    <p className="text-xs text-muted-foreground">
                      We couldn&apos;t detect a title automatically. You can type one
                      here, e.g. “Finish status report”.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voice-description">Description</Label>
                  <Input
                    id="voice-description"
                    value={editedData.description}
                    onChange={(e) =>
                      setEditedData({ ...editedData, description: e.target.value })
                    }
                    className="bg-secondary/50"
                    placeholder="Optional details or notes"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editedData.status}
                      onValueChange={(value: TaskStatus) =>
                        setEditedData({ ...editedData, status: value })
                      }
                    >
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!parsedData.status && (
                      <p className="text-xs text-muted-foreground">
                        No status detected. Defaulted to{' '}
                        <span className="font-medium">To Do</span>. You can change it
                        here.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={editedData.priority}
                      onValueChange={(value: TaskPriority) =>
                        setEditedData({ ...editedData, priority: value })
                      }
                    >
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!parsedData.priority && (
                      <p className="text-xs text-muted-foreground">
                        No priority detected. Defaulted to{' '}
                        <span className="font-medium">Medium</span>. Try saying “high
                        priority” or “low priority” next time.
                      </p>
                    )}
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
                            !editedData.dueDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editedData.dueDate
                            ? format(editedData.dueDate, 'PPP')
                            : 'No date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editedData.dueDate}
                          onSelect={(date) =>
                            setEditedData({ ...editedData, dueDate: date || undefined })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {!parsedData.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        No due date detected. You can pick one, or try phrases like
                        “tomorrow” or “next Monday” next time.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Due Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={editedData.dueTime}
                        onChange={(e) =>
                          setEditedData({ ...editedData, dueTime: e.target.value })
                        }
                        className="pl-10 bg-secondary/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={!editedData.title.trim()}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
