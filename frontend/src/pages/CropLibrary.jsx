import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    ExternalLink,
    MapPin,
    Clock,
    Droplets,
    ArrowRight,
    Leaf,
    Sparkles,
    Loader2,
    Calendar,
    ChevronRight,
    Sprout,
    X,
    Info,
    ArrowLeft
} from 'lucide-react';
import { api, imageUrl } from '../services/api';

const CropLibrary = ({ user, onSelectCrop }) => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');

    useEffect(() => {
        fetchCrops();
    }, []);

    const fetchCrops = async () => {
        try {
            const data = await api.get('/crops');
            setCrops(data || []);
        } catch (err) {
            console.error('Failed to fetch crops:', err);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { name: 'All', icon: <Sparkles size={18} /> },
        { name: 'Grain', icon: <Sprout size={18} /> },
        { name: 'Fruit', icon: <Leaf size={18} /> },
        { name: 'Vegetable', icon: <Droplets size={18} /> },
        { name: 'Commercial', icon: <Calendar size={18} /> }
    ];

    const filteredCrops = crops.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'All' || c.category === category;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="main-container section-padding">
            <header style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'var(--primary-light)', padding: '0.8rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                            <Leaf color="var(--primary)" size={32} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '3.5rem', letterSpacing: '-0.02em' }}>Crop Intelligence <span className="serif" style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Library</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '650px', margin: '0.75rem auto 0' }}>Surgical-grade database of global cultivation protocols and high-resolution crop diagnostics.</p>
                </motion.div>

                <motion.div
                    style={{ maxWidth: '800px', margin: '3.5rem auto 0' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7 }}
                >
                    <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
                        <Search size={22} style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search by crop, variety, or scientific identification..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                margin: 0,
                                padding: '1.4rem 1.5rem 1.4rem 4.5rem',
                                borderRadius: '100px',
                                border: '2px solid transparent',
                                background: 'white',
                                boxShadow: 'var(--shadow-lg)',
                                fontSize: '1.1rem',
                                width: '100%',
                                transition: 'var(--transition)'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
                        {categories.map(cat => (
                            <motion.div
                                key={cat.name}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCategory(cat.name)}
                                style={{
                                    padding: '0.8rem 1.5rem',
                                    borderRadius: '100px',
                                    background: category === cat.name ? 'var(--primary)' : 'white',
                                    color: category === cat.name ? 'white' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    fontWeight: 700,
                                    fontSize: '0.95rem',
                                    boxShadow: category === cat.name ? 'var(--shadow-primary)' : 'var(--shadow-sm)',
                                    border: '1px solid',
                                    borderColor: category === cat.name ? 'var(--primary)' : 'var(--border)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {cat.icon}
                                {cat.name}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </header>

            {loading ? (
                <div className="flex-center" style={{ padding: '5rem' }}>
                    <Loader2 className="spinning" size={48} color="var(--primary)" />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
                    <AnimatePresence>
                        {filteredCrops.map((c, i) => (
                            <motion.div
                                key={c._id || c.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -10 }}
                                onClick={() => onSelectCrop(c)}
                                style={{
                                    background: 'white',
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    border: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            >
                                <div style={{
                                    height: '240px',
                                    backgroundImage: `url(${imageUrl(c.image) || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800'})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }} />
                                <div style={{ padding: '2rem' }}>
                                    <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                        <h3 style={{ fontSize: '1.75rem' }}>{c.name}</h3>
                                        <div style={{ padding: '0.4rem 0.8rem', background: 'var(--primary-light)', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                                            {c.category || 'Other'}
                                        </div>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                        Precision protocol with {c.routine?.length || 0} critical phases.
                                    </p>
                                    <div className="flex-between" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            Open Intelligence Hub <ArrowRight size={16} />
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <footer style={{ marginTop: 'var(--space-8)', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-7)' }}>
                <p>© 2026 AgroAssist Intel. Comprehensive Agronomic Intelligence.</p>
            </footer>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spinning { animation: spin 1.5s linear infinite; }
            `}</style>
        </div>
    );
};

export default CropLibrary;
