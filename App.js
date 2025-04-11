// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import components
import Login from './components/Login';
import MainFeed from './components/MainFeed';
import CommunityView from './components/CommunityView';
import Profile from './components/Profile';
import Marketplace from './components/Marketplace';
import EventsPage from './components/EventsPage';
import CreatePost from './components/CreatePost';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

// Import mock data
import {
    mockUserProfile,
    mockCommunities,
    mockPosts,
    mockMarketplaceItems,
    mockEvents,
    simulateBlockchainDelay
} from './mockData';

function App() {
    // State variables
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [account, setAccount] = useState('0x742d35Cc6634C0532925a3b844Bc454e4438f44e'); // Mock account address

    // Mock contract objects with method simulations
    const falCoinContract = {
        methods: {
            balanceOf: (address) => ({
                call: () => simulateBlockchainDelay(() => mockUserProfile.balance)
            }),
            transfer: (to, amount) => ({
                send: ({ from }) => simulateBlockchainDelay(() => true)
            }),
            approve: (address, amount) => ({
                send: ({ from }) => simulateBlockchainDelay(() => true)
            })
        }
    };

    const postManagerContract = {
        methods: {
            // Community methods
            communities: (id) => ({
                call: () => simulateBlockchainDelay(() => mockCommunities.find(c => c.id === parseInt(id)) || null)
            }),
            communityCount: () => ({
                call: () => simulateBlockchainDelay(() => mockCommunities.length)
            }),
            createCommunity: (name, description) => ({
                send: ({ from }) => simulateBlockchainDelay(() => {
                    const newId = mockCommunities.length + 1;
                    mockCommunities.push({
                        id: newId,
                        name,
                        description,
                        creator: from,
                        memberCount: 1,
                        isActive: true
                    });
                    return true;
                })
            }),

            // Post methods
            posts: (id) => ({
                call: () => simulateBlockchainDelay(() => mockPosts.find(p => p.id === parseInt(id)) || null)
            }),
            postCount: () => ({
                call: () => simulateBlockchainDelay(() => mockPosts.length)
            }),
            createPost: (content, mediaHash, communityId) => ({
                send: ({ from }) => simulateBlockchainDelay(() => {
                    const newId = mockPosts.length + 1;
                    mockPosts.push({
                        id: newId,
                        author: from,
                        content,
                        mediaHash,
                        communityId: parseInt(communityId),
                        timestamp: Math.floor(Date.now() / 1000),
                        upvotes: 0,
                        downvotes: 0,
                        isActive: true
                    });
                    return true;
                })
            }),
            voteOnPost: (postId, isUpvote) => ({
                send: ({ from }) => simulateBlockchainDelay(() => {
                    const post = mockPosts.find(p => p.id === parseInt(postId));
                    if (post) {
                        if (isUpvote) {
                            post.upvotes++;
                        } else {
                            post.downvotes++;
                            // Auto-remove post if downvote threshold is reached
                            if (post.downvotes >= post.upvotes * 3 && post.downvotes > 5) {
                                post.isActive = false;
                            }
                        }
                        return true;
                    }
                    return false;
                })
            }),

            // Marketplace methods
            marketplaceItems: (id) => ({
                call: () => simulateBlockchainDelay(() => mockMarketplaceItems.find(m => m.id === parseInt(id)) || null)
            }),
            marketplaceItemCount: () => ({
                call: () => simulateBlockchainDelay(() => mockMarketplaceItems.length)
            }),
            createMarketplaceItem: (itemType, quantity, price) => ({
                send: ({ from }) => simulateBlockchainDelay(() => {
                    const newId = mockMarketplaceItems.length + 1;
                    mockMarketplaceItems.push({
                        id: newId,
                        seller: from,
                        itemType,
                        quantity: parseInt(quantity),
                        price,
                        isActive: true
                    });
                    return true;
                })
            }),

            // User verification
            verifyBentleyUser: (user) => ({
                send: ({ from }) => simulateBlockchainDelay(() => true)
            })
        },
        _address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' // Mock contract address
    };

    // Auto-login for development
    useEffect(() => {
        const savedAuth = localStorage.getItem('isAuthenticated');
        if (savedAuth === 'true') {
            setIsAuthenticated(true);
            setUserProfile({
                name: "Ava Radford",
                email: "aradford.falcon.bentley.edu",
                ...mockUserProfile
            });
        }
    }, []);

    // Handle user authentication
    const handleAuthentication = (userData) => {
        // In a real app, this would verify the Bentley email
        if (userData && userData.email.endsWith('.bentley.edu')) {
            setIsAuthenticated(true);
            setUserProfile({
                ...userData,
                ...mockUserProfile
            });

            // Save auth state to localStorage for persistence
            localStorage.setItem('isAuthenticated', 'true');

            // Simulate blockchain verification
            postManagerContract.methods.verifyBentleyUser(account).send({ from: account })
                .then(() => console.log('User verified on blockchain'))
                .catch(error => console.error('Verification error:', error));
        } else {
            alert('Please use your Bentley University email to login.');
        }
    };

    return (
        <Router>
            <div className="app">
                {isAuthenticated ? (
                    <>
                        <Navigation userProfile={userProfile} />
                        <div className="content-area">
                            <Routes>
                                <Route path="/" element={<MainFeed
                                    account={account}
                                    postManagerContract={postManagerContract}
                                />} />
                                <Route path="/community/:communityId" element={<CommunityView
                                    account={account}
                                    postManagerContract={postManagerContract}
                                />} />
                                <Route path="/profile" element={<Profile
                                    account={account}
                                    userProfile={userProfile}
                                    falCoinContract={falCoinContract}
                                />} />
                                <Route path="/marketplace" element={<Marketplace
                                    account={account}
                                    falCoinContract={falCoinContract}
                                    postManagerContract={postManagerContract}
                                />} />
                                <Route path="/events" element={<EventsPage
                                    account={account}
                                />} />
                                <Route path="/create-post" element={<CreatePost
                                    account={account}
                                    postManagerContract={postManagerContract}
                                />} />
                            </Routes>
                        </div>
                        <Footer />
                    </>
                ) : (
                    <Login onAuthenticate={handleAuthentication} />
                )}
            </div>
        </Router>
    );
}

export default App;