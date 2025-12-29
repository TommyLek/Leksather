# Familjens Webbsida 🏠

En privat webbsida för familjen med Google-inloggning via Firebase.

## Kom igång

### 1. Skapa ett Firebase-projekt

1. Gå till [Firebase Console](https://console.firebase.google.com/)
2. Klicka "Skapa projekt" (eller "Add project")
3. Ge projektet ett namn, t.ex. "familjesida"
4. Följ guiden (du kan stänga av Google Analytics om du vill)

### 2. Aktivera Google-inloggning

1. I Firebase Console, gå till **Authentication** i sidomenyn
2. Klicka på fliken **Sign-in method**
3. Klicka på **Google** i listan
4. Aktivera det med reglaget
5. Fyll i projektets offentliga namn (visas för användare)
6. Välj en support-email
7. Klicka **Spara**

### 3. Lägg till en webbapp

1. Gå till projektinställningar (kugghjulet uppe till vänster)
2. Scrolla ner till "Your apps" och klicka på webb-ikonen (`</>`)
3. Ge appen ett namn, t.ex. "Familjens Sida"
4. Klicka **Register app**
5. Kopiera konfigurationen som visas

### 4. Uppdatera Firebase-konfigurationen

Öppna `src/firebase.js` och ersätt värdena med dina egna:

```javascript
const firebaseConfig = {
  apiKey: "din-api-key-här",
  authDomain: "ditt-projekt.firebaseapp.com",
  projectId: "ditt-projekt",
  storageBucket: "ditt-projekt.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 5. Lägg till familjemedlemmarnas e-postadresser

Öppna `src/AuthContext.jsx` och uppdatera listan:

```javascript
const ALLOWED_EMAILS = [
  'tommy@gmail.com',
  'partner@gmail.com',
  'barn1@gmail.com',
  // etc...
];
```

### 6. Installera och kör

```bash
npm install
npm run dev
```

Öppna http://localhost:5173 i webbläsaren.

## Projektstruktur

```
src/
├── firebase.js        # Firebase-konfiguration
├── AuthContext.jsx    # Autentiseringslogik + allowlist
├── ProtectedRoute.jsx # Skyddar sidor från oinloggade
├── LoginPage.jsx      # Inloggningssidan
├── HomePage.jsx       # Startsidan (efter inloggning)
├── App.jsx            # Huvudkomponent med routing
├── main.jsx           # Entry point
└── styles.css         # Styling
```

## Deploya till produktion

### Alternativ 1: Firebase Hosting (rekommenderas)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Alternativ 2: Vercel

```bash
npm install -g vercel
npm run build
vercel
```

### Alternativ 3: Netlify

Anslut ditt GitHub-repo till Netlify och ställ in:
- Build command: `npm run build`
- Publish directory: `dist`

## Nästa steg

När grundstrukturen fungerar kan du bygga vidare med:

- **Firestore** - för att spara data (anteckningar, händelser)
- **Firebase Storage** - för att ladda upp bilder
- **React Context** - för att dela data mellan komponenter
- **Fler sidor** - kalender, fotoalbum, etc.

## Felsökning

**"Endast familjemedlemmar har tillgång"**
→ Kontrollera att e-postadressen finns i ALLOWED_EMAILS (skiftlägesokänsligt)

**Popup blockeras**
→ Tillåt popups för localhost i webbläsaren

**Firebase-fel**
→ Dubbelkolla att konfigurationen i firebase.js är korrekt
