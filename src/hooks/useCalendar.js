import { useState, useCallback } from 'react';
import { calendarService } from '../services/calendarService';
import { useAuth } from '../AuthContext';

export function useCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { calendarAccessToken, gapiReady, refreshCalendarToken } = useAuth();

  const isReady = !!(calendarAccessToken && gapiReady);

  // Wrapper för att hantera token-fel
  const withTokenRefresh = async (apiCall) => {
    try {
      return await apiCall();
    } catch (err) {
      if (err.status === 401 || err.result?.error?.code === 401) {
        // Token har gått ut - försök förnya
        const refreshed = await refreshCalendarToken();
        if (refreshed) {
          return await apiCall();
        }
        throw new Error('Kunde inte förnya inloggningen. Logga in igen.');
      }
      throw err;
    }
  };

  // Hämta händelser för en period
  const fetchEvents = useCallback(async (startDate, endDate) => {
    if (!isReady) {
      setError('Kalendern är inte redo. Logga in igen för att få tillgång.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const items = await withTokenRefresh(() =>
        calendarService.listEvents(
          startDate?.toISOString(),
          endDate?.toISOString()
        )
      );
      setEvents(items);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError(err.message || 'Kunde inte hämta händelser');
    } finally {
      setLoading(false);
    }
  }, [isReady]);

  // Skapa ny händelse
  const createEvent = useCallback(async (event) => {
    if (!isReady) throw new Error('Kalendern är inte redo');

    const newEvent = await withTokenRefresh(() =>
      calendarService.createEvent(event)
    );
    setEvents(prev => [...prev, newEvent].sort((a, b) => {
      const aStart = a.start.dateTime || a.start.date;
      const bStart = b.start.dateTime || b.start.date;
      return new Date(aStart) - new Date(bStart);
    }));
    return newEvent;
  }, [isReady]);

  // Uppdatera händelse
  const updateEvent = useCallback(async (eventId, updates) => {
    if (!isReady) throw new Error('Kalendern är inte redo');

    const updated = await withTokenRefresh(() =>
      calendarService.updateEvent(eventId, updates)
    );
    setEvents(prev => prev.map(e => e.id === eventId ? updated : e));
    return updated;
  }, [isReady]);

  // Ta bort händelse
  const deleteEvent = useCallback(async (eventId) => {
    if (!isReady) throw new Error('Kalendern är inte redo');

    await withTokenRefresh(() => calendarService.deleteEvent(eventId));
    setEvents(prev => prev.filter(e => e.id !== eventId));
  }, [isReady]);

  return {
    events,
    loading,
    error,
    isReady,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
