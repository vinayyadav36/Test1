import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

export function Navbar() {
  const { unseenNotifications, userId } = useAppContext();

  return (
    <header className="topbar">
      <div className="topbar-brand">
        SME Ops
        <small>Operations Platform</small>
      </div>
      <nav className="topbar-actions">
        <Link to="/notifications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 4 }}>
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unseenNotifications > 0 ? `Notifications (${unseenNotifications})` : 'Notifications'}
        </Link>
        <span className="session-chip">{userId ? userId.slice(0, 8) + '...' : 'Not signed in'}</span>
      </nav>
    </header>
  );
}