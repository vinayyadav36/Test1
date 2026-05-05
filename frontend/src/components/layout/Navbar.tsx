import React from 'react';

const Navbar: React.FC = () => {
  const userId = localStorage.getItem('demoUserId');
  return (
    <nav className="navbar">
      <div className="navbar-brand">SME Sync Platform</div>
      <div className="navbar-user">
        {userId ? `Demo User: ${userId.slice(0, 8)}…` : 'Not logged in'}
      </div>
    </nav>
  );
};

export default Navbar;
