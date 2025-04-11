// src/components/MainFeed.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MainFeed.css';

function MainFeed({ account, postManagerContract, falCoinContract }) {
    const [posts, setPosts] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [userVotes, setUserVotes] = useState({});

    useEffect(() => {
        const loadData = async () => {
            if (postManagerContract) {
                await Promise.all([
                    loadPosts(),
                    loadCommunities()
                ]);
                setLoading(false);
            }
        };

        loadData();
    }, [postManagerContract]);

    const loadPosts = async () => {
        try {
            const postCount = await postManagerContract.methods.postCount().call();
            let postsArray = [];

            for (let i = 1; i <= postCount; i++) {
                const post = await postManagerContract.methods.posts(i).call();
                if (post.isActive) {
                    postsArray.push(post);
                }
            }

            // Sort by timestamp (newest first)
            postsArray.sort((a, b) => b.timestamp - a.timestamp);
            setPosts(postsArray);
        } catch (error) {
            console.error("Error loading posts:", error);
        }
    };

    const loadCommunities = async () => {
        try {
            const communityCount = await postManagerContract.methods.communityCount().call();
            let communitiesArray = [];

            for (let i = 1; i <= communityCount; i++) {
                const community = await postManagerContract.methods.communities(i).call();
                if (community.isActive) {
                    communitiesArray.push(community);
                }
            }

            setCommunities(communitiesArray);
        } catch (error) {
            console.error("Error loading communities:", error);
        }
    };

    const handleVote = async (postId, isUpvote) => {
        try {
            // Track user's vote locally to prevent multiple voting
            setUserVotes({ ...userVotes, [postId]: isUpvote ? 'up' : 'down' });

            // Apply vote immediately for a responsive UI
            const updatedPosts = posts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        upvotes: isUpvote ? parseInt(post.upvotes) + 1 : post.upvotes,
                        downvotes: !isUpvote ? parseInt(post.downvotes) + 1 : post.downvotes
                    };
                }
                return post;
            });

            setPosts(updatedPosts);

            // Send vote to blockchain
            await postManagerContract.methods.voteOnPost(postId, isUpvote).send({ from: account });

            // Check if post should be removed (if downvotes exceed threshold)
            const updatedPost = updatedPosts.find(p => p.id === postId);
            if (updatedPost && updatedPost.downvotes >= updatedPost.upvotes * 3 && updatedPost.downvotes > 5) {
                // Remove post from display
                setPosts(updatedPosts.filter(p => p.id !== postId));
            }
        } catch (error) {
            console.error("Error voting on post:", error);
            // Revert the local vote
            setUserVotes({ ...userVotes, [postId]: null });
            // Reload posts to get accurate state
            await loadPosts();
        }
    };

    const handlePurchaseNFT = async (postId, price) => {
        try {
            // In a real implementation, this would call the smart contract
            // Here we're just simulating the purchase

            // First check if user has enough FalCoins
            const balance = await falCoinContract.methods.balanceOf(account).call();
            if (balance < price) {
                alert('Insufficient FalCoin balance. Please add more FalCoins to purchase this NFT.');
                return;
            }

            // Simulate successful purchase
            setTimeout(() => {
                alert('NFT purchased successfully! 70% of payment went to the creator, 30% to platform developers.');

                // In a real implementation, we would update the blockchain state and reload posts
                // For now, just simulate the ownership change by modifying the posts array
                const updatedPosts = posts.map(p => {
                    if (p.id === postId) {
                        return {...p, owned: true};
                    }
                    return p;
                });

                setPosts(updatedPosts);
            }, 2000);

        } catch (error) {
            console.error("Error purchasing NFT:", error);
            alert('Failed to purchase NFT. Please try again.');
        }
    };

    const filterPosts = (filter) => {
        setActiveFilter(filter);
    };

    const getVoteStatus = (post) => {
        const score = parseInt(post.upvotes) - parseInt(post.downvotes);
        if (score > 5) return 'high-score';
        if (score < 0) return 'low-score';
        return 'neutral-score';
    };

    const getDownvoteRatio = (post) => {
        const upvotes = parseInt(post.upvotes);
        const downvotes = parseInt(post.downvotes);
        if (upvotes === 0) return downvotes > 0 ? 100 : 0;
        return Math.round((downvotes / upvotes) * 100);
    };

    const isAtRiskOfRemoval = (post) => {
        return getDownvoteRatio(post) >= 200 && parseInt(post.downvotes) > 3;
    };

    const formatAddress = (address) => {
        return address ? `${address.substring(0, 6)}...${address.substring(38)}` : '';
    };

    const getCommunityName = (communityId) => {
        const community = communities.find(c => c.id === communityId);
        return community ? community.name : 'Unknown Community';
    };

    if (loading) {
        return <div className="loading">Loading feed...</div>;
    }

    return (
        <div className="main-feed">
            <div className="feed-header">
                <h1>Bentley Social</h1>
                <p className="feed-description">
                    Anonymous, community-driven content for Bentley University students.
                </p>
                <div className="filter-tabs">
                    <button
                        className={activeFilter === 'all' ? 'active' : ''}
                        onClick={() => filterPosts('all')}
                    >
                        All
                    </button>
                    <button
                        className={activeFilter === 'trending' ? 'active' : ''}
                        onClick={() => filterPosts('trending')}
                    >
                        Trending
                    </button>
                    <button
                        className={activeFilter === 'new' ? 'active' : ''}
                        onClick={() => filterPosts('new')}
                    >
                        New
                    </button>
                    <button
                        className={activeFilter === 'nft' ? 'active' : ''}
                        onClick={() => filterPosts('nft')}
                    >
                        NFTs
                    </button>
                </div>
            </div>

            <div className="feed-content">
                <div className="posts-container">
                    <div className="create-post-prompt">
                        <Link to="/create-post" className="create-button">Create Post</Link>
                        <p>Share your thoughts anonymously with the Bentley community.</p>
                    </div>

                    {posts.length === 0 ? (
                        <div className="no-posts">
                            <h3>No posts yet</h3>
                            <p>Be the first to share something with the community!</p>
                            <Link to="/create-post" className="create-button">Create First Post</Link>
                        </div>
                    ) : (
                        posts
                            .filter(post => activeFilter !== 'nft' || post.isNFT)
                            .map(post => {
                                const voteStatus = getVoteStatus(post);
                                const downvoteRatio = getDownvoteRatio(post);
                                const atRisk = isAtRiskOfRemoval(post);

                                return (
                                    <div className={`post-card ${voteStatus} ${atRisk ? 'at-risk' : ''}`} key={post.id}>
                                        <div className="vote-buttons">
                                            <button
                                                onClick={() => handleVote(post.id, true)}
                                                disabled={userVotes[post.id] === 'up'}
                                                className={userVotes[post.id] === 'up' ? 'voted' : ''}
                                            >
                                                <span className="vote-icon">↑</span>
                                            </button>
                                            <span className="vote-score">{parseInt(post.upvotes) - parseInt(post.downvotes)}</span>
                                            <button
                                                onClick={() => handleVote(post.id, false)}
                                                disabled={userVotes[post.id] === 'down'}
                                                className={userVotes[post.id] === 'down' ? 'voted' : ''}
                                            >
                                                <span className="vote-icon">↓</span>
                                            </button>
                                        </div>

                                        <div className="post-content">
                                            <div className="post-header">
                                                <Link to={`/community/${post.communityId}`} className="community-tag">
                                                    {getCommunityName(post.communityId)}
                                                </Link>
                                                <span className="post-author">Anonymous ({formatAddress(post.author)})</span>
                                                <span className="post-time">{new Date(post.timestamp * 1000).toLocaleString()}</span>
                                            </div>

                                            {/* NFT Badge */}
                                            {post.isNFT && (
                                                <div className={`nft-badge ${post.owned ? 'owned' : ''}`}>
                                                    <span>{post.owned ? 'NFT Owned' : 'NFT'}</span>

                                                    {!post.owned && (
                                                        <>
                                                            <button
                                                                className="purchase-nft-button"
                                                                onClick={() => handlePurchaseNFT(post.id, post.nftPrice)}
                                                            >
                                                                Purchase for {post.nftPrice / (10 ** 18)} FAL
                                                            </button>
                                                            <small>70% to creator, 30% to platform</small>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            <div className="post-body">
                                                <p>{post.content}</p>
                                                {post.mediaHash && (
                                                    <div className="post-media">
                                                        <img src={`https://ipfs.io/ipfs/${post.mediaHash}`} alt="Post media" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="post-footer">
                                                <div className="post-stats">
                                                    <span className="upvotes">{post.upvotes} upvotes</span>
                                                    <span className="downvotes">{post.downvotes} downvotes</span>
                                                    {atRisk && (
                                                        <span className="removal-warning">
                              This post is at risk of removal ({downvoteRatio}% downvote ratio)
                            </span>
                                                    )}
                                                </div>
                                                <div className="post-actions">
                                                    <Link to={`/post/${post.id}`} className="comment-button">Comments</Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                    )}
                </div>

                <div className="communities-sidebar">
                    <h3>Communities</h3>
                    <ul>
                        {communities.map(community => (
                            <li key={community.id}>
                                <Link to={`/community/${community.id}`}>{community.name}</Link>
                                <span className="member-count">{community.memberCount} members</span>
                            </li>
                        ))}
                    </ul>
                    <Link to="/create-community" className="create-button">Create Community</Link>
                </div>
            </div>
        </div>
    );
}

export default MainFeed;