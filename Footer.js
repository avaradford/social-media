// src/components/Footer.js
import React from 'react';
import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-logo">
                    <span>BentleySocial</span>
                    <small>© 2025 Blockchain & DeFi Project</small>
                </div>
                <div className="footer-links">
                    <a href="https://www.bentley.edu/" target="_blank" rel="noopener noreferrer">Bentley University</a>
                    <span className="separator">•</span>
                    <a href="https://www.bentley.edu/about/terms-of-use" target="_blank" rel="noopener noreferrer">Terms</a>
                    <span className="separator">•</span>
                    <a href="https://www.bentley.edu/about/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy</a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;