import React, { useState, useEffect } from 'react';
import { format, isBefore, startOfDay } from 'date-fns';
import { generateRecurringEvents } from '../utils/recurring';
import { checkEventConflicts } from '../utils/conflict';

const EventModal = ({ event, selectedDate, onSave, onDelete, onClose, events }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    category: 'Personal',
    color: '#F6BD60',
    isRecurring: false,
    recurrenceType: 'daily',
    recurrenceEnd: '',
    recurrenceCount: 1,
    customDays: []
  });

  const [errors, setErrors] = useState({});

  // Predefined color palette
  const colorPalette = [
    '#F6BD60',
    '#F7EDE2', 
    '#F5CAC3',
    '#84A59D',
    '#F28482'
  ];

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        isRecurring: false,
        recurrenceType: 'daily',
        recurrenceEnd: '',
        recurrenceCount: 1,
        customDays: []
      });
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: format(selectedDate, 'yyyy-MM-dd')
      }));
    }
  }, [event, selectedDate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = startOfDay(new Date());

      if (isBefore(startOfDay(selectedDate), today)) {
        newErrors.date = 'Cannot create events for past dates';
      }
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.time = 'End time must be after start time';
    }

    if (formData.isRecurring && !formData.recurrenceEnd) {
      newErrors.recurrence = 'Recurrence end date is required';
    }

    if (formData.recurrenceType === 'custom' && formData.customDays.length === 0) {
      newErrors.customDays = 'Please select at least one day for custom recurrence';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (formData.isRecurring && !event) {
      const recurringEvents = generateRecurringEvents(formData);

      // Check for conflicts with recurring events
      const conflicts = [];
      recurringEvents.forEach(recurEvent => {
        const eventConflicts = checkEventConflicts(recurEvent, events);
        conflicts.push(...eventConflicts);
      });

      if (conflicts.length > 0) {
        const confirmCreate = window.confirm(
          `Creating these recurring events will conflict with ${conflicts.length} existing event(s). Continue anyway?`
        );
        if (!confirmCreate) return;
      }

      // Save all recurring events
      recurringEvents.forEach(recurEvent => {
        onSave(recurEvent);
      });
    } else {
      // Check for conflicts with single event
      const conflicts = checkEventConflicts(formData, events.filter(e => e.id !== event?.id));

      if (conflicts.length > 0) {
        const confirmCreate = window.confirm(
          `This event conflicts with ${conflicts.length} existing event(s). Continue anyway?`
        );
        if (!confirmCreate) return;
      }

      onSave(formData);
    }
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      customDays: prev.customDays.includes(day)
        ? prev.customDays.filter(d => d !== day)
        : [...prev.customDays, day]
    }));
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'Add New Event'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={errors.title ? 'error' : ''}
              required
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className={errors.date ? 'error' : ''}
                required
              />
              {errors.date && <span className="error-text">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="Social">Social</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => {
                  const newEndTime = e.target.value;
                  setFormData(prev => ({ 
                    ...prev, 
                    endTime: newEndTime,
                    // Auto-set start time if end time is set but start time isn't
                    startTime: prev.startTime || (newEndTime ? '09:00' : '')
                  }));
                }}
                min={formData.startTime || undefined}
              />
            </div>
          </div>

          {errors.time && <span className="error-text">{errors.time}</span>}

          <div className="form-group">
            <label>Event Color</label>
            <div className="color-palette">
              {colorPalette.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  title={color}
                />
              ))}
            </div>
          </div>

          {!event && (
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                />
                Recurring Event
              </label>
            </div>
          )}

          {formData.isRecurring && !event && (
            <div className="recurring-options">
              <div className="form-row">
                <div className="form-group">
                  <label>Repeat</label>
                  <select
                    value={formData.recurrenceType}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrenceType: e.target.value }))}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom Days</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Until Date</label>
                  <input
                    type="date"
                    value={formData.recurrenceEnd}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEnd: e.target.value }))}
                    min={formData.date}
                    className={errors.recurrence ? 'error' : ''}
                  />
                </div>
              </div>

              {formData.recurrenceType === 'custom' && (
                <div className="form-group">
                  <label>Select Days</label>
                  <div className="day-buttons">
                    {weekdays.map(day => (
                      <button
                        key={day}
                        type="button"
                        className={`day-button ${formData.customDays.includes(day) ? 'selected' : ''}`}
                        onClick={() => handleDayToggle(day)}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  {errors.customDays && <span className="error-text">{errors.customDays}</span>}
                </div>
              )}

              {errors.recurrence && <span className="error-text">{errors.recurrence}</span>}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            {event && onDelete && (
              <button
                type="button"
                className="delete-btn"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this event?')) {
                    onDelete(event.id);
                  }
                }}
              >
                Delete
              </button>
            )}
            <button type="submit" className="save-btn">
              {event ? 'Update' : 'Save'} Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;