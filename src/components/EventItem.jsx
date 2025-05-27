
import React from 'react';
import { useDrag } from 'react-dnd';

const EventItem = ({ event, onEdit, onDelete, index }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'event',
    item: { 
      id: event.id, 
      type: 'event',
      originalDate: event.date 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(event);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete(event.id);
    }
  };

  const timeDisplay = event.startTime ? 
    (event.endTime ? `${event.startTime}-${event.endTime}` : event.startTime) : 
    '';

  return (
    <div
      ref={drag}
      className={`event-item ${isDragging ? 'dragging' : ''}`}
      onClick={handleEdit}
      data-color={event.color}
      style={{
        backgroundColor: event.color || '#84A59D',
        color: ['#F6BD60', '#F7EDE2', '#F5CAC3'].includes(event.color) ? '#333' : 'white'
      }}
      title={`${event.title}${event.description ? ' - ' + event.description : ''}`}
    >
      <div className="event-content">
        {timeDisplay && <span className="event-time">{timeDisplay}</span>}
        <span className="event-title">{event.title}</span>
      </div>
      <button
        className="event-delete"
        onClick={handleDelete}
        title="Delete event"
      >
        ×
      </button>
    </div>
  );
};

export default EventItem;
