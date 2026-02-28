import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Send,
    ThumbsUp,
    MessageCircle,
    Share2,
    User,
    Image as ImageIcon,
    MoreHorizontal,
    Sparkles,
    Activity,
    ChevronRight,
    Droplets,
    Leaf,
    Flame,
    X,
    Camera,
    Link,
    XCircle,
    UploadCloud
} from 'lucide-react';
import { api } from '../services/api';

const CommunityHub = () => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [imageUrl, setImageUrl] = useState(''); // Photo URL
    const [showImageModal, setShowImageModal] = useState(false);
    const [tempUrl, setTempUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [topic, setTopic] = useState('General');
    const [filterTopic, setFilterTopic] = useState('All');
    const [isLoading, setIsLoading] = useState(false);
    const [activeComments, setActiveComments] = useState(null); // ID of post being commented on
    const [commentText, setCommentText] = useState('');
    const user = JSON.parse(localStorage.getItem('agro_user'));

    const topics = [
        { name: 'General', icon: <MessageSquare size={18} /> },
        { name: 'Pest Control', icon: <Droplets size={18} /> },
        { name: 'Soil Health', icon: <Leaf size={18} /> },
        { name: 'Market Trends', icon: <Sparkles size={18} /> },
        { name: 'Success', icon: <ThumbsUp size={18} /> }
    ];

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const data = await api.get('/posts');
            setPosts(data || []);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePost = async () => {
        if (!newPost.trim() || !user) return;
        const post = {
            author: user.fullname,
            content: newPost,
            topic: topic,
            image_url: imageUrl,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        try {
            await api.post('/posts', post);
            setNewPost('');
            setImageUrl('');
            fetchPosts();
        } catch (error) {
            console.error("Failed to create post", error);
        }
    };

    const handleLike = async (postId) => {
        if (!user) return;
        try {
            const data = await api.post(`/posts/${postId}/like`, {});
            setPosts(posts.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
        } catch (error) {
            console.error("Like failed", error);
        }
    };

    const handleComment = async (postId) => {
        if (!commentText.trim() || !user) return;
        try {
            const data = await api.post(`/posts/${postId}/comment`, { content: commentText });
            setPosts(posts.map(p => p._id === postId ? { ...p, comments: [...(p.comments || []), data] } : p));
            setCommentText('');
        } catch (error) {
            console.error("Comment failed", error);
        }
    };

    const processFile = (file) => {
        setUploadError('');
        if (!file) return;

        // Validation
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setUploadError('Please upload a JPG or PNG image.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('File size must be less than 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setTempUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        processFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        processFile(file);
    };

    const filteredPosts = posts.filter(p => filterTopic === 'All' || p.topic === filterTopic);

    return (
        <div className="main-container section-padding">
            <header style={{ marginBottom: 'var(--space-7)', textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ background: 'var(--primary-light)', padding: '0.6rem', borderRadius: '12px' }}>
                            <MessageSquare color="var(--primary)" size={32} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '3rem' }}>Farmer Community <span className="serif" style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Hub</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Share protocols, ask questions, and grow together.</p>
                </motion.div>
            </header>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {user ? (
                    <motion.div
                        className="card"
                        style={{ marginBottom: 'var(--space-7)', padding: '2rem', boxShadow: 'var(--shadow-lg)' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User color="var(--primary)" size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <textarea
                                    placeholder={`What's on your mind, ${user.fullname.split(' ')[0]}?`}
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '100px',
                                        border: '2px solid #f1f5f9',
                                        background: '#f8fafc',
                                        borderRadius: '16px',
                                        padding: '1.25rem',
                                        fontSize: '1.05rem',
                                        resize: 'none',
                                        transition: 'var(--transition)',
                                        marginBottom: '1rem'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = '#f1f5f9'}
                                />
                                {imageUrl && (
                                    <div style={{ position: 'relative', marginBottom: '1rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                        <img src={imageUrl} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />
                                        <button
                                            onClick={() => setImageUrl('')}
                                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {topics.map(t => (
                                        <button
                                            key={t.name}
                                            onClick={() => setTopic(t.name)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '100px',
                                                border: '1px solid',
                                                borderColor: topic === t.name ? 'var(--primary)' : 'var(--border)',
                                                background: topic === t.name ? 'var(--primary-light)' : 'white',
                                                color: topic === t.name ? 'var(--primary)' : 'var(--text-muted)',
                                                fontSize: '0.8rem',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {t.icon} {t.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex-between">
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    className="btn btn-secondary"
                                    style={{ padding: '0.6rem 1rem', borderRadius: '12px', fontSize: '0.9rem' }}
                                    onClick={() => setShowImageModal(true)}
                                >
                                    <ImageIcon size={20} /> Photo
                                </button>
                                <button className="btn btn-secondary" style={{ padding: '0.6rem 1rem', borderRadius: '12px', fontSize: '0.9rem' }}>
                                    <Sparkles size={20} /> Tip
                                </button>
                            </div>
                            <button
                                className="btn btn-primary"
                                style={{ padding: '0.8rem 2.5rem', borderRadius: '14px', fontWeight: 800 }}
                                onClick={handlePost}
                            >
                                Post Hub <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="card" style={{ marginBottom: 'var(--space-7)', padding: '2.5rem', textAlign: 'center', background: 'var(--primary-light)', border: '1px dashed var(--primary)' }}>
                        <h4 style={{ marginBottom: '0.5rem' }}>Join the Conversation</h4>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Login to share your farming experiences with the community.</p>
                        <button onClick={() => window.location.hash = '#auth'} className="btn btn-primary">Sign In to Post</button>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '0.75rem' }}>
                    {[{ name: 'All', icon: <MessageCircle size={16} /> }, ...topics].map(t => (
                        <motion.div
                            key={t.name}
                            whileHover={{ y: -3 }}
                            onClick={() => setFilterTopic(t.name)}
                            style={{
                                padding: '0.6rem 1.1rem',
                                borderRadius: '100px',
                                background: filterTopic === t.name ? 'white' : 'transparent',
                                color: filterTopic === t.name ? 'var(--primary)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                border: '1px solid',
                                borderColor: filterTopic === t.name ? 'var(--primary)' : 'transparent',
                                boxShadow: filterTopic === t.name ? 'var(--shadow-sm)' : 'none',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <div style={{ color: filterTopic === t.name ? 'var(--primary)' : 'inherit' }}>{t.icon}</div>
                            {t.name}
                        </motion.div>
                    ))}
                </div>

                <div className="posts-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <AnimatePresence>
                        {filteredPosts.map((post, i) => (
                            <motion.div
                                key={post._id || i}
                                className="card"
                                style={{ padding: '2rem', background: 'white', borderRadius: 'var(--radius-lg)' }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -5, boxShadow: 'var(--shadow-md)' }}
                            >
                                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '48px', height: '48px', overflow: 'hidden', borderRadius: '14px', border: '2px solid var(--primary-light)' }}>
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`}
                                                alt="Avatar"
                                                style={{ width: '100%', height: '100%' }}
                                            />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{post.author}</div>
                                                {((post.likes?.length || 0) + (post.comments?.length || 0) * 2) >= 5 && (
                                                    <span style={{
                                                        background: 'linear-gradient(45deg, #FF4B2B, #FF416C)',
                                                        color: 'white',
                                                        padding: '0.2rem 0.6rem',
                                                        borderRadius: '100px',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 900,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.2rem',
                                                        boxShadow: '0 2px 10px rgba(255, 75, 43, 0.3)'
                                                    }}>
                                                        <Flame size={12} fill="white" /> TRENDING
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{post.timestamp} • Verified Farmer</div>
                                        </div>
                                    </div>
                                    <button className="btn btn-secondary" style={{ border: 'none', padding: '0.5rem' }}><MoreHorizontal size={20} color="var(--text-muted)" /></button>
                                </div>
                                <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text)', lineHeight: 1.7 }}>{post.content}</p>

                                {post.image_url && (
                                    <div style={{ marginBottom: '1.5rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                        <img src={post.image_url} alt="Post Attachment" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                    <span
                                        onClick={() => handleLike(post._id)}
                                        style={{
                                            color: post.likes?.includes(user?.id) ? 'var(--primary)' : 'var(--text-muted)',
                                            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                        }}
                                        className="hover-primary"
                                    >
                                        <ThumbsUp size={18} /> {post.likes?.length || 0} Likes
                                    </span>
                                    <span
                                        onClick={() => setActiveComments(activeComments === post._id ? null : post._id)}
                                        style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                        className="hover-primary"
                                    >
                                        <MessageCircle size={18} /> {post.comments?.length || 0} Comments
                                    </span>
                                    <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="hover-primary">
                                        <Share2 size={18} /> Share
                                    </span>
                                </div>

                                <AnimatePresence>
                                    {activeComments === post._id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: 'hidden', marginTop: '1.5rem', background: '#f8fafc', borderRadius: '16px', padding: '1.5rem' }}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                                                {(post.comments || []).map((c, idx) => (
                                                    <div key={idx} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>{c.author}</div>
                                                        <div style={{ fontSize: '0.95rem' }}>{c.content}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Add a comment..."
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    style={{ flex: 1, padding: '0.75rem 1.25rem', borderRadius: '100px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
                                                />
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ padding: '0.5rem 1.5rem', borderRadius: '100px' }}
                                                    onClick={() => handleComment(post._id)}
                                                >
                                                    Reply
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <footer style={{ marginTop: 'var(--space-8)', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                <p>© 2026 AgroAssist Hub. Cultivating Knowledge Together.</p>
            </footer>

            <AnimatePresence>
                {showImageModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setShowImageModal(false);
                                setUploadError('');
                                setTempUrl('');
                            }}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{
                                position: 'relative',
                                background: 'white',
                                width: '100%',
                                maxWidth: '550px',
                                borderRadius: '32px',
                                padding: '2.5rem',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                                zIndex: 1001,
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ background: 'var(--primary-light)', padding: '0.6rem', borderRadius: '12px' }}>
                                        <Camera size={22} color="var(--primary)" />
                                    </div>
                                    Add <span style={{ color: 'var(--primary)' }}>Media</span>
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowImageModal(false);
                                        setUploadError('');
                                        setTempUrl('');
                                    }}
                                    style={{ background: '#f8fafc', border: 'none', padding: '0.6rem', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                                    onMouseLeave={(e) => e.target.style.background = '#f8fafc'}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Section 1: File Upload */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                style={{
                                    border: `2px dashed ${isDragging ? 'var(--primary)' : '#e2e8f0'}`,
                                    borderRadius: '20px',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    background: isDragging ? 'var(--primary-light)' : '#f8fafc',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    marginBottom: '1.5rem',
                                    position: 'relative'
                                }}
                                onClick={() => document.getElementById('fileInput').click()}
                            >
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
                                <div style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                                    <UploadCloud size={48} strokeWidth={1.5} />
                                </div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Drop your image here</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                    or <span style={{ color: 'var(--primary)', fontWeight: 800 }}>browse files</span> (Max 5MB)
                                </p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>OR</span>
                                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                            </div>

                            {/* Section 2: URL Input */}
                            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }}>
                                    <Link size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Paste image URL here..."
                                    value={tempUrl && !tempUrl.startsWith('data:') ? tempUrl : ''}
                                    onChange={(e) => {
                                        setTempUrl(e.target.value);
                                        setUploadError('');
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '1.1rem 1.1rem 1.1rem 3rem',
                                        borderRadius: '16px',
                                        border: '2px solid #f1f5f9',
                                        background: '#f8fafc',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        fontWeight: 500
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = '#f1f5f9'}
                                />
                            </div>

                            {/* Section 3: Validation Error */}
                            {uploadError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        background: '#fff5f5',
                                        color: '#ef4444',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '1.5rem',
                                        border: '1px solid #feb2b2'
                                    }}
                                >
                                    <XCircle size={16} /> {uploadError}
                                </motion.div>
                            )}

                            {/* Section 4: Preview Card */}
                            {tempUrl && !uploadError && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{
                                        marginBottom: '2rem',
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        border: '1px solid var(--border)',
                                        background: '#f8fafc',
                                        height: '220px',
                                        position: 'relative',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                    }}
                                >
                                    <img
                                        src={tempUrl}
                                        alt="Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={() => {
                                            setUploadError('Unable to load image. Please check the URL.');
                                        }}
                                    />
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => { setTempUrl(''); setUploadError(''); }}
                                            style={{ background: 'rgba(255,255,255,0.9)', color: '#ef4444', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'var(--primary)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {tempUrl.startsWith('data:') ? 'Local File' : 'Remote URL'}
                                    </div>
                                </motion.div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <button
                                    className="btn btn-secondary"
                                    style={{ width: '100%', padding: '1rem', borderRadius: '14px', fontWeight: 800, fontSize: '1rem' }}
                                    onClick={() => {
                                        setTempUrl('');
                                        setShowImageModal(false);
                                        setUploadError('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '1rem', borderRadius: '14px', fontWeight: 800, fontSize: '1rem' }}
                                    onClick={() => {
                                        setImageUrl(tempUrl);
                                        setTempUrl('');
                                        setShowImageModal(false);
                                        setUploadError('');
                                    }}
                                    disabled={!tempUrl || !!uploadError}
                                >
                                    Apply Photo
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .hover-primary:hover { color: var(--primary) !important; }
            `}</style>
        </div>
    );
};

export default CommunityHub;
