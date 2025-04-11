import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './CommunityView.css';

function CommunityView({ account, postManagerContract }) {
    const { communityId } = useParams();
    const [community, setCommunity] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);
    const [newPost, setNewPost] = useState({
        content: '',
        mediaHash: ''
    });

    useEffect(() => {
        const loadData = async () => {
            if (postManagerContract && communityId) {
                try {
                    await Promise.all([
                        loadCommunity(),
                        loadCommunityPosts()
                    ]);
                    // In a real app, you would check if the user is a member
                    setIsMember(Math.random() > 0.5); // Randomly set for demo
                    setLoading(false);
                } catch (error) {
                    console.error("Error loading community data:", error);
                }
            }
        };

        loadData();
    }, [postManagerContract, communityId]);

    const loadCommunity = async () => {
        try {
            const communityData = await postManagerContract.methods.communities(communityId).call();
            setCommunity(communityData);
        } catch (error) {
            console.error("Error loading community:", error);
        }
    };

    const loadCommunityPosts = async () => {
        try {
            const postCount = await postManagerContract.methods.postCount().call();
            let communityPosts = [];

            for (let i = 1; i <= postCount; i++) {
                const post = await postManagerContract.methods.posts(i).call();
                if (post.isActive && post.communityId.toString() === communityId) {
                    communityPosts.push(post);
                }
            }

            // Sort by timestamp (newest first)
            communityPosts.sort((a, b) => b.timestamp - a.timestamp);
            setPosts(communityPosts);
        } catch (error) {
            console.error("Error loading community posts:", error);
        }
    };

    const handleJoinCommunity = async () => {
        // In a real app, this would call a smart contract function
        setIsMember(true);
    };

    const handleVote = async (postId, isUpvote) => {
        try {
            await postManagerContract.methods.voteOnPost(postId, isUpvote).send({ from: account });
            // Reload posts after voting
            await loadCommunityPosts();
        } catch (error) {
            console.error("Error voting on post:", error);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            await postManagerContract.methods.createPost(
                newPost.content,
                newPost.mediaHash,
                communityId
            ).send({ from: account });

            // Reset form and reload posts
            setNewPost({
                content: '',
                mediaHash: ''
            });
            await loadCommunityPosts();
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    if (loading) {
        return <div className="loading">Loading community...</div>;
    }

    if (!community || !community.isActive) {
        return <div className="error">Community not found or inactive.</div>;
    }

    return (
        <div className="community-view">
            <div className="community-header">
                <h1>{community.name}</h1>
                <p className="community-description">{community.description}</p>
                <div className="community-stats">
                    <span>👥 {community.memberCount} members</span>
                    <span>📝 {posts.length} posts</span>
                </div>

                {!isMember && (
                    <button className="join-button" onClick={handleJoinCommunity}>
                        Join Community
                    </button>
                )}

                {isMember && (
                    <div className="member-badge">
                        You're a member
                    </div>
                )}
            </div>

            <div className="community-content">
                <div className="create-post-area">
                    <h3>Create New Post</h3>
                    <form onSubmit={handleCreatePost}>
            <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                placeholder={`Share something with the ${community.name} community...`}
                required
            />

                        <div className="form-group">
                            <label>Media Hash (IPFS)</label>
                            <input
                                type="text"
                                value={newPost.mediaHash}
                                onChange={(e) => setNewPost({...newPost, mediaHash: e.target.value})}
                                placeholder="Optional: Add IPFS hash for images or videos"
                            />
                        </div>

                        <button type="submit" className="post-button">Post to Community</button>
                    </form>
                </div>

                <div className="community-posts">
                    <h3>Recent Posts</h3>

                    {posts.length === 0 ? (
                        <div className="no-posts">No posts in this community yet. Be the first to post!</div>
                    ) : (
                        posts.map(post => (
                            <div className="post-card" key={post.id}>
                                <div className="vote-buttons">
                                    <button onClick={() => handleVote(post.id, true)}>↑</button>
                                    <span>{post.upvotes - post.downvotes}</span>
                                    <button onClick={() => handleVote(post.id, false)}>↓</button>
                                </div>

                                <div className="post-content">
                                    <div className="post-header">
                                        <span className="post-author">Posted by: {post.author.substring(0, 6)}...{post.author.substring(38)}</span>
                                        <span className="post-time">{new Date(post.timestamp * 1000).toLocaleString()}</span>
                                    </div>

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
                                            <span>{post.upvotes} upvotes</span>
                                            <span>{post.downvotes} downvotes</span>
                                        </div>
                                        <Link to={`/post/${post.id}`} className="comment-button">Comments</Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default CommunityView;