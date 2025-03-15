import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <span className="header-icon">🏠</span>
          <h1>Real Estate <span>Analytics</span></h1>
        </div>
      </div>
    </header>
  );
};

export default Header; 