import React, { useState } from 'react';
import './Login.css';

function Login({ onAuthenticate }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validate Bentley email format
        if (!email.endsWith('@falcon.bentley.edu')) {
            setError('Please use your Bentley University email (@falcon.bentley.edu)');
            setIsLoading(false);
            return;
        }

        try {
            // In a real application, this would be a call to your authentication API
            // For demo purposes, we'll simulate an authentication success
            setTimeout(() => {
                const userData = {
                    email: email,
                    name: email.split('@')[0],
                    // Additional user data would be retrieved from a backend
                };

                onAuthenticate(userData);
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            setError('Authentication failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Bentley Social</h1>
                    <p>Connect with the Bentley community</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="email">Bentley Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="username.falcon.bentley.edu"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Connecting...' : 'Login with Bentley Email'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        By logging in, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
                    </p>
                    <p>
                        This platform is built on blockchain technology and integrates with your Bentley University account.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;