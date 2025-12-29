import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCalendar } from './hooks/useCalendar';
import { useAuth } from './AuthContext';

export default function CalendarPage() {
  const { user } = useAuth();
  const { events, loading, error, isReady, fetchEvents, createEvent, updateEvent, deleteEvent } = useCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    allDay: false,
  });

  // Hämta händelser för aktuell månad
  useEffect(() => {
    if (isReady) {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
      fetchEvents(start, end);
    }
  }, [isReady, currentDate, fetchEvents]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Måndag = 0

  const monthNames = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
    'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
  const dayNames = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventsForDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => {
      const eventStart = event.start.dateTime || event.start.date;
      return eventStart.startsWith(dateStr);
    });
  };

  const openCreateModal = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      startDate: dateStr,
      startTime: '12:00',
      endDate: dateStr,
      endTime: '13:00',
      allDay: false,
    });
    setShowModal(true);
  };

  const openEditModal = (event) => {
    const startDateTime = event.start.dateTime || event.start.date;
    const endDateTime = event.end.dateTime || event.end.date;
    const isAllDay = !event.start.dateTime;

    setEditingEvent(event);
    setFormData({
      title: event.summary || '',
      description: event.description || '',
      startDate: startDateTime.split('T')[0],
      startTime: isAllDay ? '12:00' : startDateTime.split('T')[1]?.substring(0, 5) || '12:00',
      endDate: endDateTime.split('T')[0],
      endTime: isAllDay ? '13:00' : endDateTime.split('T')[1]?.substring(0, 5) || '13:00',
      allDay: isAllDay,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const eventData = {
      title: formData.title,
      description: formData.description,
      allDay: formData.allDay,
    };

    if (formData.allDay) {
      eventData.startDate = formData.startDate;
      // Google Calendar kräver att end date är dagen efter för heldagshändelser
      const endDate = new Date(formData.endDate);
      endDate.setDate(endDate.getDate() + 1);
      eventData.endDate = endDate.toISOString().split('T')[0];
    } else {
      eventData.startDateTime = `${formData.startDate}T${formData.startTime}:00`;
      eventData.endDateTime = `${formData.endDate}T${formData.endTime}:00`;
    }

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
      } else {
        await createEvent(eventData);
      }
      setShowModal(false);
      // Uppdatera listan
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
      fetchEvents(start, end);
    } catch (err) {
      console.error('Failed to save event:', err);
      alert('Kunde inte spara händelsen: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    if (!confirm('Är du säker på att du vill ta bort denna händelse?')) return;

    try {
      await deleteEvent(editingEvent.id);
      setShowModal(false);
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert('Kunde inte ta bort händelsen: ' + err.message);
    }
  };

  const today = new Date();
  const isToday = (day) =>
    today.getDate() === day &&
    today.getMonth() === currentDate.getMonth() &&
    today.getFullYear() === currentDate.getFullYear();

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <Link to="/" className="back-link">← Tillbaka</Link>
        <h1>Familjekalender</h1>
        <div className="user-info-small">
          {user.photoURL && <img src={user.photoURL} alt="" className="avatar-small" />}
        </div>
      </header>

      {!isReady && (
        <div className="calendar-notice">
          <p>Logga in igen för att få tillgång till kalendern.</p>
        </div>
      )}

      {error && <div className="calendar-error">{error}</div>}

      <div className="calendar-nav">
        <button onClick={prevMonth} className="nav-btn">←</button>
        <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <button onClick={nextMonth} className="nav-btn">→</button>
      </div>

      {loading ? (
        <div className="calendar-loading">Laddar händelser...</div>
      ) : (
        <div className="calendar-grid">
          {dayNames.map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}

          {Array.from({ length: adjustedFirstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty"></div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            return (
              <div
                key={day}
                className={`calendar-day ${isToday(day) ? 'today' : ''}`}
                onClick={() => openCreateModal(day)}
              >
                <span className="day-number">{day}</span>
                <div className="day-events">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className="event-dot"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(event);
                      }}
                      title={event.summary}
                    >
                      {event.summary}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="event-more">+{dayEvents.length - 3} till</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingEvent ? 'Redigera händelse' : 'Ny händelse'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Titel</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Beskrivning</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.allDay}
                    onChange={e => setFormData({ ...formData, allDay: e.target.checked })}
                  />
                  Heldag
                </label>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Startdatum</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                {!formData.allDay && (
                  <div className="form-group">
                    <label>Starttid</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Slutdatum</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
                {!formData.allDay && (
                  <div className="form-group">
                    <label>Sluttid</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="modal-actions">
                {editingEvent && (
                  <button type="button" onClick={handleDelete} className="btn-delete">
                    Ta bort
                  </button>
                )}
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Avbryt
                </button>
                <button type="submit" className="btn-save">
                  {editingEvent ? 'Spara' : 'Skapa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
