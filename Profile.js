import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';

function Profile({ account, userProfile, falCoinContract }) {
    const [falCoinBalance, setFalCoinBalance] = useState(0);
    const [userPosts, setUserPosts] = useState([]);
    const [userEvents, setUserEvents] = useState([]);
    const [userTransactions, setUserTransactions] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (account && falCoinContract) {
                try {
                    await loadFalCoinBalance();
                    // In a real app, you would fetch user's posts, events, and transactions from the blockchain
                    // For this demo, we'll use mock data
                    loadMockData();
                    setLoading(false);
                } catch (error) {
                    console.error("Error loading profile data:", error);
                }
            }
        };

        loadData();
    }, [account, falCoinContract]);

    const loadFalCoinBalance = async () => {
        try {
            const balance = await falCoinContract.methods.balanceOf(account).call();
            setFalCoinBalance(balance / (10 ** 18)); // Convert from wei
        } catch (error) {
            console.error("Error loading FalCoin balance:", error);
        }
    };

    const loadMockData = () => {
        // Mock user posts
        setUserPosts([
            {
                id: 1,
                content: "Just finished my blockchain assignment! Looking for feedback from CS majors.",
                communityName: "Computer Science",
                timestamp: Date.now() - 86400000, // 1 day ago
                upvotes: 12,
                downvotes: 2
            },
            {
                id: 2,
                content: "Anyone interested in forming a study group for the DeFi midterm?",
                communityName: "Blockchain and DeFi",
                timestamp: Date.now() - 172800000, // 2 days ago
                upvotes: 8,
                downvotes: 0
            }
        ]);

        // Mock user events
        setUserEvents([
            {
                id: 1,
                title: "Crypto Trading Workshop",
                date: "2025-04-08",
                startTime: "16:00",
                isOrganizer: true,
                attendees: 28
            },
            {
                id: 2,
                title: "Falcon Fest Spring 2025",
                date: "2025-04-15",
                startTime: "12:00",
                isOrganizer: false,
                attendees: 214
            }
        ]);

        // Mock user transactions
        setUserTransactions([
            {
                id: 1,
                type: "Meal Swipe Sold",
                amount: 5,
                price: 2.5,
                timestamp: Date.now() - 43200000, // 12 hours ago
                status: "completed"
            },
            {
                id: 2,
                type: "FalCoin Received",
                amount: 10,
                price: 1,
                timestamp: Date.now() - 129600000, // 1.5 days ago
                status: "completed"
            },
            {
                id: 3,
                type: "Textbook Purchase",
                amount: 1,
                price: 15,
                timestamp: Date.now() - 259200000, // 3 days ago
                status: "completed"
            }
        ]);
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return <div className="loading">Loading profile...</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar">
                    {userProfile.name.charAt(0).toUpperCase()}
                </div>

                <div className="profile-info">
                    <h1>{userProfile.name}</h1>
                    <p className="profile-email">{userProfile.email}</p>
                    <div className="wallet-info">
                        <div className="wallet-address">
                            <span>Wallet: {account.substring(0, 6)}...{account.substring(38)}</span>
                        </div>
                        <div className="wallet-balance">
                            <span>FalCoin Balance: {falCoinBalance.toFixed(2)} FAL</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-tabs">
                <button
                    className={activeTab === 'posts' ? 'active' : ''}
                    onClick={() => setActiveTab('posts')}
                >
                    My Posts
                </button>
                <button
                    className={activeTab === 'events' ? 'active' : ''}
                    onClick={() => setActiveTab('events')}
                >
                    My Events
                </button>
                <button
                    className={activeTab === 'transactions' ? 'active' : ''}
                    onClick={() => setActiveTab('transactions')}
                >
                    Transactions
                </button>
            </div>

            <div className="profile-content">
                {/* My Posts Tab */}
                {activeTab === 'posts' && (
                    <div className="profile-posts">
                        <h2>My Posts</h2>

                        {userPosts.length === 0 ? (
                            <div className="no-data">You haven't created any posts yet.</div>
                        ) : (
                            userPosts.map(post => (
                                <div className="profile-post-card" key={post.id}>
                                    <div className="post-meta">
                                        <Link to={`/community/${post.communityId}`} className="community-tag">
                                            {post.communityName}
                                        </Link>
                                        <span className="post-date">
                      {formatDate(post.timestamp)} at {formatTime(post.timestamp)}
                    </span>
                                    </div>

                                    <p className="post-content">{post.content}</p>

                                    <div className="post-stats">
                    <span className="vote-stats">
                      {post.upvotes} upvotes · {post.downvotes} downvotes
                    </span>
                                        <Link to={`/post/${post.id}`} className="view-post-link">
                                            View Post
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* My Events Tab */}
                {activeTab === 'events' && (
                    <div className="profile-events">
                        <h2>My Events</h2>

                        {userEvents.length === 0 ? (
                            <div className="no-data">You're not attending any events.</div>
                        ) : (
                            userEvents.map(event => (
                                <div className="profile-event-card" key={event.id}>
                                    <div className="event-role">
                                        {event.isOrganizer ? '🎭 Organizer' : '👤 Attendee'}
                                    </div>

                                    <div className="event-info">
                                        <h3>{event.title}</h3>
                                        <p className="event-date">
                                            {new Date(`${event.date}T${event.startTime}`).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                        <p className="event-attendees">
                                            {event.attendees} people attending
                                        </p>
                                    </div>

                                    <Link to={`/event/${event.id}`} className="view-event-link">
                                        View Event
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                    <div className="profile-transactions">
                        <h2>Transaction History</h2>

                        {userTransactions.length === 0 ? (
                            <div className="no-data">No transactions found.</div>
                        ) : (
                            <table className="transactions-table">
                                <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Price (FAL)</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {userTransactions.map(tx => (
                                    <tr key={tx.id}>
                                        <td>{tx.type}</td>
                                        <td>{tx.amount}</td>
                                        <td>{tx.price} FAL</td>
                                        <td>{formatDate(tx.timestamp)}</td>
                                        <td>
                        <span className={`status-${tx.status}`}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;