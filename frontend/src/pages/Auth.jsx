import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, ArrowRight, Leaf, ShieldCheck, Eye, EyeOff, MapPin, Map } from 'lucide-react';
import { api } from '../services/api';

const Auth = ({ onAuthSuccess, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode);

    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);
    const [formData, setFormData] = useState({ email: '', password: '', fullname: '', state: '', district: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup';
            const data = await api.post(endpoint, {
                email: formData.email,
                password: formData.password,
                fullname: mode === 'signup' ? formData.fullname : undefined,
                state: mode === 'signup' ? formData.state : undefined,
                district: mode === 'signup' ? formData.district : undefined
            });

            if (mode === 'login') {
                localStorage.setItem('agro_token', data.token);
                localStorage.setItem('agro_user', JSON.stringify(data.user));
                if (onAuthSuccess) onAuthSuccess(data.user);

                // Unified Role-Based Redirection
                if (data.user.role === 'admin') {
                    window.location.hash = '#admin-dashboard';
                } else {
                    window.location.hash = '#dashboard';
                }
            } else {
                setMode('login');
                setError('Registration successful! Please login with your account.');
            }
        } catch (err) {
            setError(err.message || 'Operation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-container section-padding flex-center" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
                className="card"
                style={{ maxWidth: '500px', width: '100%', padding: '3.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: 'none', background: 'white' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '16px', display: 'inline-flex', marginBottom: '1.5rem', boxShadow: 'var(--shadow-primary)' }}>
                        <Leaf size={32} />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{mode === 'login' ? 'Welcome Back' : 'Get Started'}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{mode === 'login' ? 'Continue to your farm management command center.' : 'Join 10,000+ farmers using precision intelligence.'}</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ background: error.includes('successful') ? 'var(--primary-light)' : '#fff5f5', color: error.includes('successful') ? 'var(--primary)' : '#ff7675', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center', border: `1px solid ${error.includes('successful') ? 'var(--primary)' : '#ff7675'}33` }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {mode === 'signup' && (
                        <>
                            <div className="input-group">
                                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <UserIcon size={16} color="var(--primary)" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Farmer name"
                                    value={formData.fullname}
                                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                                    required
                                    style={{ padding: '1rem 1.25rem', fontSize: '1rem', borderRadius: '14px', border: '2px solid #f1f5f9', background: '#f8fafc', width: '100%' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Map size={16} color="var(--primary)" /> State
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Uttar Pradesh"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        required
                                        style={{ padding: '1rem 1.25rem', fontSize: '1rem', borderRadius: '14px', border: '2px solid #f1f5f9', background: '#f8fafc', width: '100%' }}
                                    />
                                </div>
                                <div className="input-group">
                                    <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <MapPin size={16} color="var(--primary)" /> District
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Saharanpur"
                                        value={formData.district}
                                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                        required
                                        style={{ padding: '1rem 1.25rem', fontSize: '1rem', borderRadius: '14px', border: '2px solid #f1f5f9', background: '#f8fafc', width: '100%' }}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="input-group">
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={16} color="var(--primary)" /> Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="name@farm.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            style={{ padding: '1rem 1.25rem', fontSize: '1rem', borderRadius: '14px', border: '2px solid #f1f5f9', background: '#f8fafc', width: '100%' }}
                        />
                    </div>

                    <div className="input-group">
                        <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Lock size={16} color="var(--primary)" /> Password
                            </label>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                style={{ padding: '1rem 3.5rem 1rem 1.25rem', fontSize: '1rem', borderRadius: '14px', border: '2px solid #f1f5f9', background: '#f8fafc', width: '100%' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '1.25rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0.25rem'
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ padding: '1.25rem', fontSize: '1.1rem', fontWeight: 800, marginTop: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                    >
                        {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                        {mode === 'login' ? 'New to AgroAssist?' : 'Already have an account?'}
                        <span
                            style={{ color: 'var(--primary)', fontWeight: 800, cursor: 'pointer', marginLeft: '0.5rem' }}
                            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                        >
                            {mode === 'login' ? 'Create Account' : 'Sign In'}
                        </span>
                    </p>
                </div>

                <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <ShieldCheck size={16} color="var(--primary)" /> Secure Agro-Verification Enabled
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
