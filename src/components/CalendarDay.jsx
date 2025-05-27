
import React from 'react';
import { useDrop } from 'react-dnd';
import { format, isSameDay, isSameMonth, isBefore, startOfDay } from 'date-fns';
import EventItem from './EventItem';

const CalendarDay = ({ 
  date, 
  events, 
  currentDate, 
  onDateClick, 
  onEventClick, 
  onEventDrop, 
  onEventDelete,
  maxVisibleEvents = 3 
}) => {
  const today = new Date();
  const isToday = isSameDay(date, today);
  const isCurrentMonth = isSameMonth(date, currentDate);
  const isPastDate = isBefore(startOfDay(date), startOfDay(today));
  
  const dayEvents = events.filter(event => 
    event.date === format(date, 'yyyy-MM-dd')
  );

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'event',
    drop: (item) => {
      const newDate = format(date, 'yyyy-MM-dd');
      if (item.originalDate !== newDate) {
        onEventDrop(item.id, date);
      }
    },
    canDrop: () => !isPastDate,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const handleDateClick = () => {
    if (!isPastDate) {
      onDateClick(date);
    }
  };

  const getDayClasses = () => {
    let classes = 'calendar-day';
    
    if (isToday) classes += ' today';
    if (!isCurrentMonth) classes += ' other-month';
    if (isPastDate) classes += ' past-date';
    if (isOver && canDrop) classes += ' drag-over';
    if (isOver && !canDrop) classes += ' drag-invalid';
    
    return classes;
  };

  const visibleEvents = dayEvents.slice(0, maxVisibleEvents);
  const hiddenEventsCount = dayEvents.length - maxVisibleEvents;

  return (
    <div
      ref={drop}
      className={getDayClasses()}
      onClick={handleDateClick}
    >
      <div className="day-number">
        {format(date, 'd')}
      </div>
      
      <div className="events-container">
        {visibleEvents.map((event, index) => (
          <EventItem
            key={event.id}
            event={event}
            onEdit={onEventClick}
            onDelete={onEventDelete}
            index={index}
          />
        ))}
        
        {hiddenEventsCount > 0 && (
          <div className="more-events">
            +{hiddenEventsCount} more
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarDay;
