
import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addWeeks, addMonths, subMonths, subWeeks, subDays } from 'date-fns';
import CalendarDay from './CalendarDay';

const Calendar = ({ 
  events, 
  onDateClick, 
  onEventClick, 
  onEventDrop, 
  onEventDelete, 
  currentView = 'month' 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    setViewDate(currentDate);
  }, [currentDate]);

  const navigateDate = (direction) => {
    const increment = currentView === 'month' ? 
      (direction === 'next' ? addMonths : subMonths) :
      currentView === 'week' ? 
      (direction === 'next' ? addWeeks : subWeeks) :
      (direction === 'next' ? addDays : subDays);

    setCurrentDate(increment(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;

    // Header row with weekdays
    const weekdays = [];
    for (let i = 0; i < 7; i++) {
      weekdays.push(
        <div key={i} className="weekday-header">
          {format(addDays(startDate, i), 'EEE')}
        </div>
      );
    }

    // Calendar days
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        days.push(
          <CalendarDay
            key={day}
            date={day}
            events={events}
            currentDate={currentDate}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
            onEventDrop={onEventDrop}
            onEventDelete={onEventDelete}
          />
        );
        day = addDays(day, 1);
      }
      rows.push(days);
      days = [];
    }

    return (
      <div className="calendar-grid">
        {weekdays}
        {rows}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekdays = [];
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      weekdays.push(
        <div key={i} className="weekday-header">
          {format(day, 'EEE d')}
        </div>
      );
      days.push(
        <CalendarDay
          key={day}
          date={day}
          events={events}
          currentDate={currentDate}
          onDateClick={onDateClick}
          onEventClick={onEventClick}
          onEventDrop={onEventDrop}
          onEventDelete={onEventDelete}
          maxVisibleEvents={10}
        />
      );
    }

    return (
      <div className="week-view">
        <div className="calendar-grid">
          {weekdays}
          {days}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = events.filter(event => 
      event.date === format(currentDate, 'yyyy-MM-dd')
    );

    return (
      <div className="day-view">
        <h3>{format(currentDate, 'EEEE, MMMM d, yyyy')}</h3>
        <div className="events-container">
          {dayEvents.length === 0 ? (
            <p>No events for this day</p>
          ) : (
            dayEvents.map(event => (
              <div
                key={event.id}
                className="event-item day-view-event"
                onClick={() => onEventClick(event)}
                style={{
                  backgroundColor: event.color || '#84A59D',
                  color: ['#F6BD60', '#F7EDE2', '#F5CAC3'].includes(event.color) ? '#333' : 'white'
                }}
              >
                <div className="event-content">
                  <h4>{event.title}</h4>
                  {event.startTime && (
                    <p className="event-time">
                      {event.startTime} {event.endTime && `- ${event.endTime}`}
                    </p>
                  )}
                  {event.description && (
                    <p className="event-description">{event.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'day':
        return format(currentDate, 'MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button 
          className="nav-button"
          onClick={() => navigateDate('prev')}
          aria-label="Previous"
        >
          &#8249;
        </button>
        
        <div className="header-center">
          <h2>{getViewTitle()}</h2>
          <button 
            className="today-btn"
            onClick={goToToday}
          >
            Today
          </button>
        </div>
        
        <button 
          className="nav-button"
          onClick={() => navigateDate('next')}
          aria-label="Next"
        >
          &#8250;
        </button>
      </div>

      {currentView === 'month' && renderMonthView()}
      {currentView === 'week' && renderWeekView()}
      {currentView === 'day' && renderDayView()}
    </div>
  );
};

export default Calendar;
