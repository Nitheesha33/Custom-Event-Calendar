
// Mock functions for when Google Calendar is not configured
let gapi = null;
let isInitialized = false;

const CLIENT_ID = '885565081459-rqgg727pog9bkavb2l75em9o8p5jmfpp.apps.googleusercontent.com'; // Replace with actual client ID
const API_KEY = 'AIzaSyDaNtqop6dknEF2DP-gki8ns9BdxJpBa-4'; // Replace with actual API key
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar';

export const initializeGoogleCalendar = async () => {
  try {
    console.log('Google Calendar integration requires API keys configuration');
    // Return false for now since the API keys need to be properly configured
    // The current keys in the code are not configured for this domain
    return false;
    
    // Uncomment and configure when you have proper API keys:
    /*
    if (!window.gapi) {
      await loadGoogleAPI();
    }
    
    gapi = window.gapi;
    
    await new Promise((resolve, reject) => {
      gapi.load('auth2', {
        callback: resolve,
        onerror: reject
      });
    });

    await gapi.auth2.init({
      client_id: CLIENT_ID,
    });

    await new Promise((resolve, reject) => {
      gapi.load('client', {
        callback: resolve,
        onerror: reject
      });
    });

    await gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: [DISCOVERY_DOC],
      scope: SCOPES
    });

    isInitialized = true;
    console.log('Google Calendar API initialized successfully');
    return true;
    */
  } catch (error) {
    console.error('Failed to initialize Google Calendar:', error);
    return false;
  }
};

const loadGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export const signIn = async () => {
  if (!isInitialized || !gapi) {
    console.warn('Google Calendar not initialized');
    return false;
  }

  try {
    const authInstance = gapi.auth2.getAuthInstance();
    await authInstance.signIn();
    return true;
  } catch (error) {
    console.error('Google sign-in failed:', error);
    return false;
  }
};

export const signOut = async () => {
  if (!isInitialized || !gapi) {
    console.warn('Google Calendar not initialized');
    return;
  }

  try {
    const authInstance = gapi.auth2.getAuthInstance();
    await authInstance.signOut();
  } catch (error) {
    console.error('Google sign-out failed:', error);
  }
};

export const isSignedIn = () => {
  if (!isInitialized || !gapi) {
    return false;
  }

  const authInstance = gapi.auth2.getAuthInstance();
  return authInstance.isSignedIn.get();
};

export const getGoogleCalendarEvents = async (timeMin, timeMax) => {
  if (!isInitialized || !gapi || !isSignedIn()) {
    console.warn('Google Calendar not available or user not signed in');
    return [];
  }

  try {
    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin,
      timeMax: timeMax,
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime'
    });

    return response.result.items || [];
  } catch (error) {
    console.error('Failed to fetch Google Calendar events:', error);
    return [];
  }
};

export const createGoogleCalendarEvent = async (eventData) => {
  if (!isInitialized || !gapi || !isSignedIn()) {
    console.warn('Google Calendar not available or user not signed in');
    return null;
  }

  try {
    const event = {
      summary: eventData.title,
      description: eventData.description,
      start: {
        dateTime: eventData.startTime ? 
          `${eventData.date}T${eventData.startTime}:00` : 
          null,
        date: eventData.startTime ? null : eventData.date,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: eventData.endTime ? 
          `${eventData.date}T${eventData.endTime}:00` : 
          null,
        date: eventData.endTime ? null : eventData.date,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });

    return response.result;
  } catch (error) {
    console.error('Failed to create Google Calendar event:', error);
    return null;
  }
};
