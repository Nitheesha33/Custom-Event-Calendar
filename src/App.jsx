
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { format, isBefore, startOfDay } from 'date-fns';
import Calendar from './components/Calendar';
import EventModal from './components/EventModal';
import { ErrorBoundary } from 'react-error-boundary';
import { initDB, getAllEvents, addEvent, updateEvent, deleteEvent, clearAllEvents } from './utils/indexedDB';
import { 
  initializeGoogleCalendar, 
  signIn, 
  signOut, 
  isSignedIn,
  getGoogleCalendarEvents,
  createGoogleCalendarEvent 
} from './utils/googleCalendar';
import { checkEventConflicts } from './utils/conflict';
import './App.css';

function App() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentView, setCurrentView] = useState('month');
  const [googleCalendarEnabled, setGoogleCalendarEnabled] = useState(false);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);

  useEffect(() => {
    initializeDB();
    initializeGoogleCalendar().then(success => {
      setGoogleCalendarEnabled(success);
      if (success) {
        setIsGoogleSignedIn(isSignedIn());
      }
    });
  }, []);

  const initializeDB = async () => {
    try {
      await initDB();
      const allEvents = await getAllEvents();
      setEvents(allEvents);
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  };

  const handleResetCalendar = async () => {
    const confirmReset = window.confirm(
      'Are you sure you want to reset the calendar? This will delete all events and cannot be undone.'
    );
    
    if (confirmReset) {
      try {
        await clearAllEvents();
        setEvents([]);
        setSelectedDate(null);
        setSelectedEvent(null);
        setShowModal(false);
        setSearchTerm('');
        setFilterCategory('all');
        alert('Calendar has been reset successfully!');
      } catch (error) {
        console.error('Failed to reset calendar:', error);
        alert('Failed to reset calendar. Please try again.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const success = await signIn();
      if (success) {
        setIsGoogleSignedIn(true);
        await syncGoogleCalendarEvents();
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOut();
      setIsGoogleSignedIn(false);
    } catch (error) {
      console.error('Google sign-out failed:', error);
    }
  };

  const syncGoogleCalendarEvents = async () => {
    try {
      const now = new Date();
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

      const googleEvents = await getGoogleCalendarEvents(
        now.toISOString(),
        oneYearFromNow.toISOString()
      );

      const convertedEvents = googleEvents.map(gEvent => ({
        id: `google-${gEvent.id}`,
        title: gEvent.summary || 'Untitled Event',
        description: gEvent.description || '',
        date: gEvent.start.date || gEvent.start.dateTime?.split('T')[0],
        startTime: gEvent.start.dateTime ? 
          new Date(gEvent.start.dateTime).toTimeString().slice(0, 5) : '',
        endTime: gEvent.end.dateTime ? 
          new Date(gEvent.end.dateTime).toTimeString().slice(0, 5) : '',
        category: 'Google Calendar',
        color: '#4285f4',
        isGoogleEvent: true
      }));

      setEvents(prev => [
        ...prev.filter(e => !e.isGoogleEvent),
        ...convertedEvents
      ]);
    } catch (error) {
      console.error('Failed to sync Google Calendar events:', error);
    }
  };

  const handleAddEvent = async (eventData) => {
    try {
      const newEvent = await addEvent(eventData);
      setEvents(prev => [...prev, newEvent]);

      if (isGoogleSignedIn && !eventData.isGoogleEvent) {
        try {
          await createGoogleCalendarEvent(eventData);
        } catch (error) {
          console.error('Failed to sync with Google Calendar:', error);
        }
      }

      setShowModal(false);
      setSelectedDate(null);
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  };

  const handleUpdateEvent = async (eventData) => {
    try {
      const updatedEvent = await updateEvent(eventData);
      setEvents(prev => prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      ));
      setShowModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setShowModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleDateClick = useCallback((date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setShowModal(true);
  }, []);

  const handleEventClick = useCallback((event) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setShowModal(true);
  }, []);

  const handleEventDrop = async (eventId, newDate) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) {
        console.error('Event not found:', eventId);
        return;
      }

      const newDateStr = format(newDate, 'yyyy-MM-dd');
      
      // Don't move if it's the same date
      if (event.date === newDateStr) {
        return;
      }

      // Check if trying to move to a past date
      if (isBefore(startOfDay(newDate), startOfDay(new Date()))) {
        alert('Cannot move events to past dates.');
        return;
      }

      // Check for conflicts
      const conflicts = checkEventConflicts(
        { ...event, date: newDateStr },
        events.filter(e => e.id !== eventId)
      );

      if (conflicts.length > 0) {
        const conflictDetails = conflicts.map(c => 
          `• ${c.title}${c.startTime ? ` (${c.startTime})` : ''}`
        ).join('\n');
        
        const confirmMove = window.confirm(
          `Moving "${event.title}" to ${format(newDate, 'MMM d, yyyy')} will conflict with:\n\n${conflictDetails}\n\nContinue anyway?`
        );
        if (!confirmMove) return;
      }

      const updatedEvent = {
        ...event,
        date: newDateStr
      };
      
      await handleUpdateEvent(updatedEvent);
      
      // Show success message
      const successMsg = `"${event.title}" moved to ${format(newDate, 'MMM d, yyyy')}`;
      console.log(successMsg);
      
    } catch (error) {
      console.error('Failed to move event:', error);
      alert('Failed to move event. Please try again.');
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [events, searchTerm, filterCategory]);

  const categories = useMemo(() => {
    return [...new Set(events.map(event => event.category).filter(Boolean))];
  }, [events]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <header className="app-header">
          <div className="header-left">
            <h1>📅 Event Calendar</h1>
            <div className="event-count">
              <span className="count-label">Total Events:</span>
              <span className="count-number">{events.length}</span>
            </div>
          </div>

          <div className="controls">
            <input
              type="text"
              placeholder="🔍 Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="filter-container">
              <span className="filter-icon">🔽</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="header-right">
            {googleCalendarEnabled && (
              <button 
                onClick={isGoogleSignedIn ? handleGoogleSignOut : handleGoogleSignIn}
                className="sync-btn"
              >
                {isGoogleSignedIn ? '🔄 Signed In' : '📱 Connect Google'}
              </button>
            )}
            <button 
              onClick={handleResetCalendar}
              className="reset-btn"
              title="Reset Calendar"
            >
              🔄 Reset
            </button>
            <button 
              onClick={() => {
                setSelectedDate(new Date());
                setSelectedEvent(null);
                setShowModal(true);
              }}
              className="add-event-btn"
            >
              ➕ Add Event
            </button>
          </div>
        </header>

        <div className="view-controls">
          <button 
            className={`view-btn ${currentView === 'day' ? 'active' : ''}`}
            onClick={() => setCurrentView('day')}
          >
            📅 Day
          </button>
          <button 
            className={`view-btn ${currentView === 'week' ? 'active' : ''}`}
            onClick={() => setCurrentView('week')}
          >
            📊 Week
          </button>
          <button 
            className={`view-btn ${currentView === 'month' ? 'active' : ''}`}
            onClick={() => setCurrentView('month')}
          >
            🗓️ Month
          </button>
        </div>

        <ErrorBoundary
          fallback={
            <div className="error-boundary">
              <h3>Something went wrong with the calendar</h3>
              <button onClick={() => window.location.reload()}>Reload Page</button>
            </div>
          }
        >
          <Calendar
            events={filteredEvents}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onEventDrop={handleEventDrop}
            onEventDelete={handleDeleteEvent}
            currentView={currentView}
          />
        </ErrorBoundary>

        {showModal && (
          <EventModal
            event={selectedEvent}
            selectedDate={selectedDate}
            onSave={selectedEvent ? handleUpdateEvent : handleAddEvent}
            onDelete={selectedEvent ? handleDeleteEvent : null}
            onClose={handleModalClose}
            events={events}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default App;
