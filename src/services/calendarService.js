import { gapi } from 'gapi-script';
import { FAMILY_CALENDAR_ID } from '../firebase';

export const calendarService = {
  // Hämta händelser
  async listEvents(timeMin, timeMax, maxResults = 100) {
    const response = await gapi.client.calendar.events.list({
      calendarId: FAMILY_CALENDAR_ID,
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax,
      showDeleted: false,
      singleEvents: true,
      maxResults: maxResults,
      orderBy: 'startTime',
    });
    return response.result.items || [];
  },

  // Hämta en specifik händelse
  async getEvent(eventId) {
    const response = await gapi.client.calendar.events.get({
      calendarId: FAMILY_CALENDAR_ID,
      eventId: eventId,
    });
    return response.result;
  },

  // Skapa ny händelse
  async createEvent(event) {
    const resource = {
      summary: event.title,
      description: event.description || '',
      start: event.allDay
        ? { date: event.startDate }
        : { dateTime: event.startDateTime, timeZone: 'Europe/Stockholm' },
      end: event.allDay
        ? { date: event.endDate }
        : { dateTime: event.endDateTime, timeZone: 'Europe/Stockholm' },
    };

    const response = await gapi.client.calendar.events.insert({
      calendarId: FAMILY_CALENDAR_ID,
      resource: resource,
    });
    return response.result;
  },

  // Uppdatera händelse
  async updateEvent(eventId, updates) {
    const resource = {};

    if (updates.title !== undefined) resource.summary = updates.title;
    if (updates.description !== undefined) resource.description = updates.description;

    if (updates.allDay) {
      if (updates.startDate) resource.start = { date: updates.startDate };
      if (updates.endDate) resource.end = { date: updates.endDate };
    } else {
      if (updates.startDateTime) {
        resource.start = { dateTime: updates.startDateTime, timeZone: 'Europe/Stockholm' };
      }
      if (updates.endDateTime) {
        resource.end = { dateTime: updates.endDateTime, timeZone: 'Europe/Stockholm' };
      }
    }

    const response = await gapi.client.calendar.events.patch({
      calendarId: FAMILY_CALENDAR_ID,
      eventId: eventId,
      resource: resource,
    });
    return response.result;
  },

  // Ta bort händelse
  async deleteEvent(eventId) {
    await gapi.client.calendar.events.delete({
      calendarId: FAMILY_CALENDAR_ID,
      eventId: eventId,
    });
    return true;
  },
};
