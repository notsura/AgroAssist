import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserX, UserCheck, Shield, Mail, Sprout, User as UserIcon } from 'lucide-react';
import { api } from '../services/api';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        try {
            const data = await api.get('/admin/users');
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleStatus = async (userId) => {
        try {
            await api.post(`/admin/users/${userId}/toggle-status`, {});
            fetchUsers();
        } catch (err) {
            alert('Failed to update user status');
        }
    };

    const filteredUsers = users.filter(u =>
        (u.fullname?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (u.email?.toLowerCase() || '').includes(search.toLowerCase())
    );

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>User Management</h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Monitor and moderate AgroAssist members.</p>
                </div>
                <div style={{ position: 'relative', width: '350px' }}>
                    <Search style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.75rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'white', fontWeight: 600, fontSize: '0.95rem' }}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: '0', borderRadius: '28px', overflow: 'hidden', border: 'none', background: 'white', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1.5rem', fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Farmer</th>
                                <th style={{ padding: '1.5rem', fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</th>
                                <th style={{ padding: '1.5rem', fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                                <th style={{ padding: '1.5rem', fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                <th style={{ padding: '1.5rem', fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 700, fontSize: '1.1rem' }}>Fetching secure user records...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 700, fontSize: '1.1rem' }}>No users found matching your search.</td></tr>
                            ) : filteredUsers.map(user => (
                                <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s ease' }} className="table-row-hover">
                                    <td style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '44px', height: '44px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 900 }}>
                                                {user.fullname?.[0] || 'U'}
                                            </div>
                                            <div style={{ fontWeight: 800, fontSize: '1rem' }}>{user.fullname}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                                            <Mail size={14} /> {user.email}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '10px',
                                            fontSize: '0.8rem',
                                            fontWeight: 800,
                                            background: user.role === 'admin' ? '#ebf5ff' : '#f0fdf4',
                                            color: user.role === 'admin' ? '#2563eb' : 'var(--primary)'
                                        }}>
                                            {user.role === 'admin' ? <Shield size={14} /> : <Sprout size={14} />}
                                            {user.role?.toUpperCase()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <div style={{
                                            display: 'inline-flex',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '10px',
                                            fontSize: '0.8rem',
                                            fontWeight: 800,
                                            background: user.status === 'blocked' ? '#fee2e2' : '#f0fdf4',
                                            color: user.status === 'blocked' ? '#ef4444' : 'var(--primary)'
                                        }}>
                                            {user.status?.toUpperCase() || 'ACTIVE'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => toggleStatus(user._id)}
                                                style={{
                                                    border: 'none',
                                                    background: user.status === 'blocked' ? 'var(--primary)' : '#ef4444',
                                                    color: 'white',
                                                    padding: '0.7rem 1.25rem',
                                                    borderRadius: '12px',
                                                    fontWeight: 800,
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.6rem',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                                }}
                                            >
                                                {user.status === 'blocked' ? <UserCheck size={18} /> : <UserX size={18} />}
                                                {user.status === 'blocked' ? 'Activate' : 'Block'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
