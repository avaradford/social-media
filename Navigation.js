// src/components/Navigation.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation({ userProfile }) {
    const location = useLocation();
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav className="main-navigation">
            <div className="nav-container">
                <div className="nav-logo">
                    <Link to="/">
                        {/* Text-based logo instead of image */}
                        <div className="bentley-logo-text">B</div>
                        <span className="site-name">BentleySocial</span>
                    </Link>
                </div>

                <button
                    className="mobile-menu-toggle"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    aria-label="Toggle mobile menu"
                >
                    {showMobileMenu ? '✕' : '☰'}
                </button>

                <div className={`nav-links ${showMobileMenu ? 'mobile-active' : ''}`}>
                    <Link to="/" className={isActive('/')}>
                        <span className="nav-icon">🏠</span>
                        <span className="nav-text">Home</span>
                    </Link>

                    <Link to="/marketplace" className={isActive('/marketplace')}>
                        <span className="nav-icon">🛒</span>
                        <span className="nav-text">Marketplace</span>
                    </Link>

                    <Link to="/events" className={isActive('/events')}>
                        <span className="nav-icon">📅</span>
                        <span className="nav-text">Events</span>
                    </Link>

                    <Link to="/create-post" className="create-post-link">
                        <span className="nav-icon">✏️</span>
                        <span className="nav-text">Create Post</span>
                    </Link>
                </div>

                <div className="nav-profile">
                    <Link to="/profile" className={`profile-link ${isActive('/profile')}`}>
                        <div className="profile-avatar">
                            {userProfile && userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <span className="profile-name">
              {userProfile && userProfile.name ? userProfile.name : 'Account'}
            </span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navigation;