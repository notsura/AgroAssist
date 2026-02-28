import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    History,
    ChevronRight,
    Trophy,
    Leaf,
    Clock,
    ArrowLeft,
    Box,
    CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

const FarmingHistory = ({ onBack }) => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const data = await api.get('/user/history');
            setHistory(data || []);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setIsLoading(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
    };

    if (isLoading) {
        return (
            <div className="main-container section-padding" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '600px' }}>
                <Clock className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div className="main-container section-padding">
            <motion.header
                style={{ marginBottom: '4rem' }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => window.location.hash = '#dashboard'}
                        className="btn btn-secondary"
                        style={{ padding: '0.6rem 1rem', borderRadius: '12px' }}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ background: 'var(--primary-light)', padding: '0.6rem', borderRadius: '12px' }}>
                            <History color="var(--primary)" size={24} />
                        </div>
                        <h2 style={{ fontSize: '2.5rem' }}>Farming <span className="serif" style={{ color: 'var(--primary)', fontStyle: 'italic' }}>History</span></h2>
                    </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px' }}>
                    A chronological archive of your successful cultivation journeys and agricultural milestones.
                </p>
            </motion.header>

            {history.length > 0 ? (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}
                >
                    {history.map((entry, idx) => (
                        <motion.div
                            key={entry._id || idx}
                            variants={item}
                            className="card"
                            style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}
                        >
                            <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.05 }}>
                                <Trophy size={150} color="var(--primary)" />
                            </div>

                            <div className="flex-between" style={{ marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Leaf color="var(--primary)" size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem' }}>{entry.crop_name}</h3>
                                        <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.7rem' }}>Rank: Gold Farmer</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800 }}>STATUS</div>
                                    <div style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '0.9rem' }}>{entry.status.toUpperCase()}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                        <Calendar size={14} /> SOWN ON
                                    </div>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{new Date(entry.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                        <CheckCircle2 size={14} /> DURATION
                                    </div>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{entry.duration} Days</div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', position: 'relative', zIndex: 1 }}>
                                <div className="flex-between" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Box size={14} /> Completed on {new Date(entry.completion_date).toLocaleDateString()}
                                    </div>
                                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>View Log</button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card"
                    style={{ padding: '5rem', textAlign: 'center', border: '1px dashed var(--border)' }}
                >
                    <div style={{ background: '#f8fafc', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <History size={48} color="var(--border)" />
                    </div>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--text)', marginBottom: '1rem' }}>No History Yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>
                        Your completed crop cycles will appear here automatically after harvest celebration.
                    </p>
                    <button onClick={() => window.location.hash = '#dashboard'} className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '100px' }}>
                        Back to Dashboard
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default FarmingHistory;
