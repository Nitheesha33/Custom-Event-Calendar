
import { parseISO, isSameDay } from 'date-fns';

export const checkEventConflicts = (newEvent, existingEvents) => {
  const conflicts = [];
  const newEventDate = parseISO(newEvent.date);
  
  existingEvents.forEach(event => {
    // Skip if different date
    if (!isSameDay(parseISO(event.date), newEventDate)) {
      return;
    }
    
    // If either event has no time, check for all-day conflicts
    if (!newEvent.startTime || !newEvent.endTime || !event.startTime || !event.endTime) {
      // All-day event conflict
      conflicts.push(event);
      return;
    }
    
    const newStartTime = new Date(`${newEvent.date}T${newEvent.startTime}`);
    const newEndTime = new Date(`${newEvent.date}T${newEvent.endTime}`);
    const existingStartTime = new Date(`${event.date}T${event.startTime}`);
    const existingEndTime = new Date(`${event.date}T${event.endTime}`);
    
    // Check for time overlap
    const hasOverlap = (
      (newStartTime >= existingStartTime && newStartTime < existingEndTime) ||
      (newEndTime > existingStartTime && newEndTime <= existingEndTime) ||
      (newStartTime <= existingStartTime && newEndTime >= existingEndTime)
    );
    
    if (hasOverlap) {
      conflicts.push(event);
    }
  });
  
  return conflicts;
};

export const getConflictMessage = (conflicts) => {
  if (conflicts.length === 0) {
    return '';
  }
  
  if (conflicts.length === 1) {
    return `Conflicts with: ${conflicts[0].title}`;
  }
  
  return `Conflicts with ${conflicts.length} events`;
};
