import React from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Sprout,
    Bug,
    Store,
    Users,
    MessageSquare,
    UserPlus,
    Bell,
    LogOut,
    Leaf,
    ChevronRight
} from 'lucide-react';

const AdminLayout = ({ children, activeTab, user, onLogout }) => {
    const menuItems = [
        { id: '#admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: '#admin-crops', label: 'Crops', icon: Sprout },
        { id: '#admin-pests', label: 'Pests & Diseases', icon: Bug },
        { id: '#admin-market', label: 'Marketplace', icon: Store },
        { id: '#admin-users', label: 'Users', icon: Users },
        { id: '#admin-community', label: 'Moderation', icon: MessageSquare },
        { id: '#admin-alerts', label: 'Alerts', icon: Bell },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                background: 'white',
                borderRight: '1px solid var(--border)',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', padding: '0 0.5rem', cursor: 'pointer' }} onClick={() => window.location.hash = '#admin-dashboard'}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '12px' }}>
                        <Leaf size={24} />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800 }}>Agro<span style={{ color: 'var(--primary)' }}>Admin</span></h2>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {menuItems.map(item => (
                        <a
                            key={item.id}
                            href={item.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '1rem 1.25rem',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                color: activeTab === item.id ? 'var(--primary)' : 'var(--text-muted)',
                                background: activeTab === item.id ? 'var(--primary-light)' : 'transparent',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                            {activeTab === item.id && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
                        </a>
                    ))}
                </nav>

                <button
                    onClick={onLogout}
                    style={{
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem 1.25rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        fontWeight: 800,
                        cursor: 'pointer',
                        textAlign: 'left'
                    }}
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content Area */}
            <main style={{ marginLeft: '280px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <header style={{
                    background: 'white',
                    borderBottom: '1px solid var(--border)',
                    padding: '1rem 3rem',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{user?.fullname || 'Admin'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>SYSTEM CONTROLLER</div>
                        </div>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'var(--primary)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 800
                        }}>
                            {user?.fullname?.[0] || 'A'}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div style={{ padding: '3rem' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
