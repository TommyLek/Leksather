import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="home-container">
      <header className="header">
        <h1>🏠 Leksäther, Lyegatan 40</h1>
        <div className="user-info">
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt="Profilbild" 
              className="avatar"
            />
          )}
          <span>{user.displayName}</span>
          <button onClick={logout} className="logout-btn">
            Logga ut
          </button>
        </div>
      </header>

      <main className="main-content">
        <h2>Välkommen, {user.displayName?.split(' ')[0]}! 👋</h2>
        
        <div className="card-grid">
          <Link to="/calendar" className="card">
            <h3>📅 Familjekalender</h3>
            <p>Kommande händelser och aktiviteter</p>
          </Link>
          
          <div className="card">
            <h3>📸 Fotoalbum</h3>
            <p>Delade bilder och minnen</p>
          </div>
          
          <div className="card">
            <h3>📝 Anteckningar</h3>
            <p>Gemensamma listor och noteringar</p>
          </div>
          
          <div className="card">
            <h3>💬 Meddelanden</h3>
            <p>Familjechatten</p>
          </div>
        </div>
      </main>
    </div>
  );
}
