
import { addDays, addWeeks, addMonths, format, isBefore, parseISO, isAfter } from 'date-fns';

export const generateRecurringEvents = (eventData) => {
  const events = [];
  const startDate = parseISO(eventData.date);
  const endDate = eventData.recurrenceEnd ? parseISO(eventData.recurrenceEnd) : addDays(startDate, 365);

  let currentDate = startDate;
  let eventId = 1;
  const maxEvents = 365;

  while ((isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) && eventId <= maxEvents) {
    const shouldCreateEvent = shouldCreateEventForDate(currentDate, startDate, eventData.recurrenceType, eventData.customDays);

    if (shouldCreateEvent) {
      events.push({
        ...eventData,
        id: `${eventData.title.replace(/\s+/g, '-').toLowerCase()}-${eventId}`,
        date: format(currentDate, 'yyyy-MM-dd'),
        isRecurring: true,
        originalId: eventData.id || 'recurring-parent'
      });
      eventId++;
    }

    // Move to next date based on recurrence type
    switch (eventData.recurrenceType) {
      case 'daily':
        currentDate = addDays(currentDate, 1);
        break;
      case 'weekly':
        currentDate = addWeeks(currentDate, 1);
        break;
      case 'monthly':
        currentDate = addMonths(currentDate, 1);
        break;
      case 'custom':
        currentDate = addDays(currentDate, 1);
        break;
      default:
        currentDate = addDays(currentDate, 1);
    }
  }

  return events;
};

const shouldCreateEventForDate = (currentDate, startDate, recurrenceType, customDays) => {
  switch (recurrenceType) {
    case 'daily':
      return true;

    case 'weekly':
      return currentDate.getDay() === startDate.getDay();

    case 'monthly':
      return currentDate.getDate() === startDate.getDate();

    case 'custom':
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const currentDayName = dayNames[currentDate.getDay()];
      return customDays && customDays.includes(currentDayName);

    default:
      return false;
  }
};

export const isRecurringEvent = (event) => {
  return event.isRecurring === true;
};

export const getRecurringEventInstances = (events, originalId) => {
  return events.filter(event => event.originalId === originalId);
};
