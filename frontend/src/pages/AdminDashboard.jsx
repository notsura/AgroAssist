import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Sprout,
    MessageSquare,
    TrendingUp,
    Store,
    ArrowUpRight,
    Clock,
    Plus,
    Bell
} from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        journeys: 0,
        posts: 0,
        marketplace: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking stats for initial build, will connect to API later
        const timer = setTimeout(() => {
            setStats({
                users: 1248,
                journeys: 452,
                posts: 89,
                marketplace: 34
            });
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const cards = [
        { label: 'Total Farmers', value: stats.users, icon: Users, color: '#3498db', trend: '+12%' },
        { label: 'Active Journeys', value: stats.journeys, icon: Sprout, color: 'var(--primary)', trend: '+5%' },
        { label: 'Community Posts', value: stats.posts, icon: MessageSquare, color: '#9b59b6', trend: '+18%' },
        { label: 'Market Items', value: stats.marketplace, icon: Store, color: '#e67e22', trend: 'Stable' },
    ];

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Control Center</h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Real-time overview of the AgroAssist ecosystem.</p>
                </div>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem' }}>
                    <Plus size={20} /> System Report
                </button>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        className="card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{ padding: '2rem', borderRadius: '24px', position: 'relative', overflow: 'hidden', border: 'none', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            padding: '1.25rem',
                            background: `${card.color}10`,
                            borderRadius: '0 0 0 24px',
                            color: card.color
                        }}>
                            <card.icon size={28} />
                        </div>
                        <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.75rem', color: 'var(--text)' }}>
                            {loading ? '...' : card.value.toLocaleString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 800, color: card.trend.includes('+') ? 'var(--primary)' : 'var(--text-muted)' }}>
                            <TrendingUp size={14} /> {card.trend} increase this month
                        </div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Recent Activity */}
                <div className="card" style={{ padding: '2.5rem', borderRadius: '28px', border: 'none', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 800 }}>
                        <Clock size={24} color="var(--primary)" /> Recent System Activity
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {[
                            { user: 'Amit Kumar', action: 'registered as a new farmer', time: '2 mins ago', icon: Users, color: '#3498db' },
                            { user: 'Maize Cultivation', action: 'added to knowledge library', time: '15 mins ago', icon: Sprout, color: 'var(--primary)' },
                            { user: 'System Alert', action: 'dispatched: Monsoon Care tips', time: '1 hour ago', icon: Bell, color: '#e67e22' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                <div style={{ background: `${item.color}15`, color: item.color, padding: '0.8rem', borderRadius: '14px' }}>
                                    <item.icon size={22} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>
                                        <span style={{ color: 'var(--primary)' }}>{item.user}</span> {item.action}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 600 }}>{item.time}</div>
                                </div>
                                <ArrowUpRight size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="card" style={{ padding: '2.5rem', borderRadius: '28px', background: 'linear-gradient(135deg, var(--primary), #27ae60)', color: 'white', border: 'none', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '2rem', fontWeight: 800 }}>Global Commands</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <button style={{ width: '100%', padding: '1.25rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 800, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                            <Sprout size={20} /> Add New Crop Data
                        </button>
                        <button style={{ width: '100%', padding: '1.25rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 800, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                            <Bell size={20} /> Deploy Regional Alert
                        </button>
                        <button style={{ width: '100%', padding: '1.25rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 800, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                            <MessageSquare size={20} /> Review Flags
                        </button>
                        <button style={{ width: '100%', padding: '1.25rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 800, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                            <Users size={20} /> System Audit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
