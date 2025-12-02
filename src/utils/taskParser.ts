import { ParsedTaskData, TaskPriority, TaskStatus } from '@/types/task';

// Priority keywords mapping
const PRIORITY_KEYWORDS: Record<string, TaskPriority> = {
  'urgent': 'urgent',
  'urgently': 'urgent',
  'asap': 'urgent',
  'critical': 'urgent',
  'emergency': 'urgent',
  'high priority': 'high',
  'high': 'high',
  'important': 'high',
  'medium priority': 'medium',
  'medium': 'medium',
  'normal': 'medium',
  'low priority': 'low',
  'low': 'low',
  'whenever': 'low',
  'not urgent': 'low',
};

// Status keywords mapping
const STATUS_KEYWORDS: Record<string, TaskStatus> = {
  'to do': 'todo',
  'todo': 'todo',
  'pending': 'todo',
  'not started': 'todo',
  'in progress': 'in-progress',
  'working on': 'in-progress',
  'started': 'in-progress',
  'ongoing': 'in-progress',
  'done': 'done',
  'completed': 'done',
  'finished': 'done',
  'complete': 'done',
};

// Date parsing patterns
const DATE_PATTERNS = [
  { regex: /today/i, offset: 0 },
  { regex: /tomorrow/i, offset: 1 },
  { regex: /day after tomorrow/i, offset: 2 },
  { regex: /next week/i, offset: 7 },
  { regex: /in (\d+) days?/i, offsetMultiplier: 1 },
  { regex: /in (\d+) weeks?/i, offsetMultiplier: 7 },
  { regex: /by (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, dayOfWeek: true },
  { regex: /next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, dayOfWeek: true, nextWeek: true },
  { regex: /this (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, dayOfWeek: true },
];

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Time patterns
const TIME_PATTERNS = [
  { regex: /(\d{1,2}):(\d{2})\s*(am|pm)/i },
  { regex: /(\d{1,2})\s*(am|pm)/i },
  { regex: /morning/i, hour: 9 },
  { regex: /afternoon/i, hour: 14 },
  { regex: /evening/i, hour: 18 },
  { regex: /night/i, hour: 21 },
  { regex: /noon/i, hour: 12 },
  { regex: /midnight/i, hour: 0 },
  { regex: /end of day/i, hour: 17 },
  { regex: /eod/i, hour: 17 },
];

function parseDate(text: string): Date | undefined {
  const now = new Date();
  let targetDate: Date | undefined;
  
  // Check each date pattern
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern.regex);
    if (match) {
      targetDate = new Date(now);
      
      if (pattern.offset !== undefined) {
        targetDate.setDate(now.getDate() + pattern.offset);
      } else if (pattern.offsetMultiplier !== undefined) {
        const days = parseInt(match[1]) * pattern.offsetMultiplier;
        targetDate.setDate(now.getDate() + days);
      } else if (pattern.dayOfWeek) {
        const dayName = match[1].toLowerCase();
        const targetDay = DAY_NAMES.indexOf(dayName);
        if (targetDay !== -1) {
          let daysUntil = targetDay - now.getDay();
          if (daysUntil <= 0 || pattern.nextWeek) {
            daysUntil += 7;
          }
          targetDate.setDate(now.getDate() + daysUntil);
        }
      }
      break;
    }
  }
  
  // If no specific date found, check for relative terms
  if (!targetDate) {
    // Check for specific date formats
    const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
    if (dateMatch) {
      const month = parseInt(dateMatch[1]) - 1;
      const day = parseInt(dateMatch[2]);
      const year = dateMatch[3] ? parseInt(dateMatch[3]) : now.getFullYear();
      targetDate = new Date(year < 100 ? 2000 + year : year, month, day);
    }
  }
  
  // Parse time if date was found
  if (targetDate) {
    let timeSet = false;
    
    for (const timePattern of TIME_PATTERNS) {
      const timeMatch = text.match(timePattern.regex);
      if (timeMatch) {
        if (timePattern.hour !== undefined) {
          targetDate.setHours(timePattern.hour, 0, 0, 0);
          timeSet = true;
        } else if (timeMatch[1]) {
          let hours = parseInt(timeMatch[1]);
          const minutes = timeMatch[2] && !isNaN(parseInt(timeMatch[2])) ? parseInt(timeMatch[2]) : 0;
          const ampm = timeMatch[3] || timeMatch[2];
          
          if (ampm && ampm.toLowerCase() === 'pm' && hours < 12) {
            hours += 12;
          } else if (ampm && ampm.toLowerCase() === 'am' && hours === 12) {
            hours = 0;
          }
          
          targetDate.setHours(hours, minutes, 0, 0);
          timeSet = true;
        }
        break;
      }
    }
    
    // Default to end of day if no time specified
    if (!timeSet) {
      targetDate.setHours(17, 0, 0, 0);
    }
  }
  
  return targetDate;
}

function parsePriority(text: string): TaskPriority | undefined {
  const lowerText = text.toLowerCase();
  
  // Check for explicit priority mentions
  for (const [keyword, priority] of Object.entries(PRIORITY_KEYWORDS)) {
    if (lowerText.includes(keyword)) {
      return priority;
    }
  }
  
  return undefined;
}

function parseStatus(text: string): TaskStatus {
  const lowerText = text.toLowerCase();
  
  for (const [keyword, status] of Object.entries(STATUS_KEYWORDS)) {
    if (lowerText.includes(keyword)) {
      return status;
    }
  }
  
  return 'todo';
}

function extractTitle(text: string): string {
  let title = text;
  
  // Remove common prefixes
  const prefixes = [
    /^(create|add|make|set up|setup|new|remind me to|i need to|i have to|i want to|please|can you)\s+/i,
    /^(a )?(task|reminder|todo|to-do|item)\s+(to|for|about)?\s*/i,
  ];
  
  for (const prefix of prefixes) {
    title = title.replace(prefix, '');
  }
  
  // Remove date/time references
  const dateTimePatterns = [
    /\b(by|before|until|due|on|at)\s+(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|this week|\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?|\d{1,2}(?::\d{2})?\s*(?:am|pm)?|morning|afternoon|evening|night|noon|midnight|end of day|eod)\b/gi,
    /\b(in\s+\d+\s+(?:days?|weeks?))\b/gi,
    /\b(it'?s?\s+)?(urgent|high priority|medium priority|low priority|high|medium|low|important|critical|asap)\b/gi,
    /\b(with\s+)?(priority|status)\s*:?\s*(urgent|high|medium|low|todo|in progress|done)?\b/gi,
  ];
  
  for (const pattern of dateTimePatterns) {
    title = title.replace(pattern, '');
  }
  
  // Clean up extra whitespace and punctuation
  title = title
    .replace(/\s+/g, ' ')
    .replace(/^[\s,.\-]+|[\s,.\-]+$/g, '')
    .trim();
  
  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }
  
  return title || 'Untitled Task';
}

export function parseTaskFromTranscript(transcript: string): ParsedTaskData {
  const trimmedTranscript = transcript.trim();
  
  return {
    title: extractTitle(trimmedTranscript),
    priority: parsePriority(trimmedTranscript),
    status: parseStatus(trimmedTranscript),
    dueDate: parseDate(trimmedTranscript),
    rawTranscript: trimmedTranscript,
  };
}
