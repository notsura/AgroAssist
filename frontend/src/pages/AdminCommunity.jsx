import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Trash2,
    User,
    Clock,
    Filter,
    Search,
    MessageCircle,
    X,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';

const AdminCommunity = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTopic, setFilterTopic] = useState('All');
    const [expandedPost, setExpandedPost] = useState(null);
    const [notification, setNotification] = useState(null);
    const [adminCommentText, setAdminCommentText] = useState('');

    const topics = ['General', 'Pest Control', 'Soil Health', 'Market Trends', 'Success'];
    const user = JSON.parse(localStorage.getItem('agro_user'));

    useEffect(() => {
        fetchAdminPosts();
    }, []);

    const fetchAdminPosts = async () => {
        setIsLoading(true);
        try {
            const data = await api.get('/admin/posts');
            setPosts(data || []);
        } catch (error) {
            showNotification('Failed to fetch posts', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddComment = async (postId) => {
        if (!adminCommentText.trim()) return;

        try {
            const data = await api.post(`/posts/${postId}/comment`, { content: adminCommentText });
            setPosts(posts.map(p => {
                if (p._id === postId) {
                    return { ...p, comments: [...(p.comments || []), data] };
                }
                return p;
            }));
            setAdminCommentText('');
            showNotification('Comment added as Administrator', 'success');
        } catch (error) {
            showNotification('Failed to add comment', 'error');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to permanently delete this post?')) return;

        try {
            await api.delete(`/admin/posts/${postId}`);
            setPosts(posts.filter(p => p._id !== postId));
            showNotification('Post deleted successfully', 'success');
        } catch (error) {
            showNotification('Failed to delete post', 'error');
        }
    };

    const handleDeleteComment = async (postId, commentIndex) => {
        if (!window.confirm('Delete this comment?')) return;

        try {
            await api.delete(`/admin/posts/${postId}/comments/${commentIndex}`);
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    const newComments = [...post.comments];
                    newComments.splice(commentIndex, 1);
                    return { ...post, comments: newComments };
                }
                return post;
            }));
            showNotification('Comment removed', 'success');
        } catch (error) {
            showNotification('Failed to remove comment', 'error');
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = (post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.author?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesTopic = filterTopic === 'All' || post.topic === filterTopic;
        return matchesSearch && matchesTopic;
    });

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header Section */}
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ShieldAlert color="var(--primary)" size={32} />
                        Community <span style={{ color: 'var(--primary)' }}>Moderation</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Monitor and manage community interactions to ensure a healthy environment.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', textAlign: 'center', minWidth: '140px' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Posts</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>{posts.length}</div>
                    </div>
                </div>
            </header>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                    <input
                        type="text"
                        placeholder="Search by content or author..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem 1rem 1rem 3.5rem',
                            borderRadius: '16px',
                            border: '1px solid var(--border)',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'all 0.2s',
                            background: 'white'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Filter size={20} color="var(--text-muted)" />
                    <select
                        value={filterTopic}
                        onChange={(e) => setFilterTopic(e.target.value)}
                        style={{
                            padding: '1rem 1.5rem',
                            borderRadius: '16px',
                            border: '1px solid var(--border)',
                            background: 'white',
                            fontSize: '1rem',
                            fontWeight: 600,
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="All">All Topics</option>
                        {topics.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            {/* Post Table / List */}
            <div style={{ background: 'white', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                {isLoading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading posts...</div>
                ) : filteredPosts.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            <Search size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>No posts found matching your criteria.</p>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {filteredPosts.map((post) => (
                            <motion.div
                                key={post._id}
                                layout
                                style={{
                                    borderBottom: '1px solid var(--border)',
                                    padding: '1.5rem 2rem',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem' }}>
                                                <div style={{ width: '32px', height: '32px', background: 'var(--primary-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <User size={16} color="var(--primary)" />
                                                </div>
                                                {post.author}
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <Clock size={14} /> {post.timestamp}
                                            </span>
                                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: '#f1f5f9', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                                {post.topic}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{post.content}</p>

                                        {post.image_url && (
                                            <div style={{ marginTop: '1rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', maxWidth: '200px' }}>
                                                <img src={post.image_url} alt="Attachment" style={{ width: '100%', height: 'auto' }} />
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem' }}>
                                            <button
                                                onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)}
                                                style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                                            >
                                                <MessageCircle size={18} /> {post.comments?.length || 0} Comments
                                                {expandedPost === post._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDeletePost(post._id)}
                                        style={{
                                            background: '#fff1f2',
                                            color: '#e11d48',
                                            border: 'none',
                                            padding: '0.75rem',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="Delete Post"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                {/* Comments Section */}
                                <AnimatePresence>
                                    {expandedPost === post._id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div style={{ marginTop: '1.5rem', background: '#f8fafc', borderRadius: '16px', padding: '1.5rem' }}>
                                                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Managing Comments</h4>

                                                {/* Add Admin Comment Input */}
                                                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Write an official response..."
                                                        value={adminCommentText}
                                                        onChange={(e) => setAdminCommentText(e.target.value)}
                                                        style={{ flex: 1, padding: '0.75rem 1.25rem', borderRadius: '100px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none' }}
                                                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                                    />
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ padding: '0.5rem 1.5rem', borderRadius: '100px', fontSize: '0.85rem' }}
                                                        onClick={() => handleAddComment(post._id)}
                                                    >
                                                        Post Response
                                                    </button>
                                                </div>

                                                {post.comments?.length === 0 ? (
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No comments on this post yet.</p>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        {post.comments.map((comment, idx) => (
                                                            <div key={idx} style={{ background: 'white', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <div>
                                                                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.1rem' }}>{comment.author}</div>
                                                                    <div style={{ fontSize: '0.9rem' }}>{comment.content}</div>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleDeleteComment(post._id, idx)}
                                                                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.5rem' }}
                                                                    className="hover-red"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Notifications */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        style={{
                            position: 'fixed',
                            bottom: '2rem',
                            right: '2rem',
                            padding: '1rem 1.5rem',
                            background: notification.type === 'success' ? '#059669' : '#e11d48',
                            color: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontWeight: 700,
                            zIndex: 1000
                        }}
                    >
                        {notification.type === 'success' ? <ShieldAlert size={20} /> : <AlertCircle size={20} />}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .hover-red:hover { color: #e11d48 !important; }
            `}</style>
        </div>
    );
};

export default AdminCommunity;
