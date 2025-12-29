import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { gapi } from 'gapi-script';

// Lista över tillåtna e-postadresser (din familj)
// Lägg till familjemedlemmarnas Google-adresser här
const ALLOWED_EMAILS = [
  'toja1200@gmail.com',
  'familjemedlem1@gmail.com',
  'familjemedlem2@gmail.com',
  // Lägg till fler här...
];

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calendarAccessToken, setCalendarAccessToken] = useState(null);
  const [gapiReady, setGapiReady] = useState(false);

  // Initiera gapi när komponenten laddas
  useEffect(() => {
    const initGapi = async () => {
      try {
        await new Promise((resolve) => gapi.load('client', resolve));
        await gapi.client.init({
          discoveryDocs: [DISCOVERY_DOC],
        });
        setGapiReady(true);
      } catch (err) {
        console.error('Failed to initialize gapi:', err);
      }
    };
    initGapi();
  }, []);

  // Sätt gapi token när vi har en access token
  useEffect(() => {
    if (gapiReady && calendarAccessToken) {
      gapi.client.setToken({ access_token: calendarAccessToken });
    }
  }, [gapiReady, calendarAccessToken]);

  // Kolla om användaren är tillåten
  const isAllowedUser = (email) => {
    return ALLOWED_EMAILS.some(allowed =>
      allowed.toLowerCase() === email.toLowerCase()
    );
  };

  // Logga in med Google
  const loginWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Kontrollera om e-postadressen är tillåten
      if (!isAllowedUser(result.user.email)) {
        await signOut(auth);
        setError('Endast familjemedlemmar har tillgång till denna sida.');
        return false;
      }

      // Hämta access token för Calendar API
      const credential = GoogleAuthProvider.credentialFromResult(result);

      // Debug: Kontrollera vilka scopes token faktiskt har
      if (credential?.accessToken) {
        // Anropa Google för att se token-info
        try {
          const tokenInfoResponse = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?access_token=${credential.accessToken}`
          );
          const tokenInfo = await tokenInfoResponse.json();
          console.log('=== TOKEN SCOPES ===');
          console.log('Granted scopes:', tokenInfo.scope);
          console.log('Full token info:', tokenInfo);
          console.log('====================');
        } catch (e) {
          console.error('Could not fetch token info:', e);
        }

        setCalendarAccessToken(credential.accessToken);
      }

      return true;
    } catch (err) {
      setError('Något gick fel vid inloggning. Försök igen.');
      console.error('Login error:', err);
      return false;
    }
  };

  // Förnya calendar access token
  const refreshCalendarToken = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setCalendarAccessToken(credential.accessToken);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to refresh token:', err);
      return false;
    }
  };

  // Logga ut
  const logout = async () => {
    try {
      await signOut(auth);
      setCalendarAccessToken(null);
      if (gapiReady) {
        gapi.client.setToken(null);
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Lyssna på auth-ändringar
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && isAllowedUser(currentUser.email)) {
        setUser(currentUser);
      } else {
        setUser(null);
        setCalendarAccessToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    error,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user,
    calendarAccessToken,
    gapiReady,
    refreshCalendarToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
