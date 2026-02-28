import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    BellRing,
    CheckCircle2,
    Trash2,
    Plus,
    Activity,
    ThermometerSun,
    Droplets,
    Wind,
    Send
} from 'lucide-react';
import { api } from '../services/api';

const AdminAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [automatedSuggestions, setAutomatedSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        crop: '',
        region: '',
        state: '',
        severity: 'Medium',
        message: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [alertsRes, autoRes] = await Promise.all([
                api.get('/admin/alerts'),
                api.get('/admin/alerts/automated')
            ]);
            setAlerts(alertsRes || []);
            setAutomatedSuggestions(autoRes || []);
        } catch (error) {
            console.error("Failed to fetch alerts data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAlert = async (e) => {
        e?.preventDefault();
        try {
            const newAlert = await api.post('/admin/alerts', formData);
            setAlerts([newAlert, ...alerts]);
            setIsFormOpen(false);
            setFormData({ title: '', crop: '', region: '', state: '', severity: 'Medium', message: '' });
        } catch (error) {
            console.error("Failed to create alert", error);
        }
    };

    const handleDeploySuggestion = async (suggestion) => {
        try {
            const newAlert = await api.post('/admin/alerts', suggestion);
            setAlerts([newAlert, ...alerts]);
            // Remove from suggestions
            setAutomatedSuggestions(prev => prev.filter(s => s.title !== suggestion.title || s.region !== suggestion.region));
        } catch (error) {
            console.error("Failed to deploy suggested alert", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this alert?')) return;
        try {
            await api.delete(`/admin/alerts/${id}`);
            setAlerts(alerts.filter(a => a._id !== id));
        } catch (error) {
            console.error("Failed to delete alert", error);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'high':
            case 'critical':
                return { bg: '#fee2e2', text: '#ef4444', icon: <AlertTriangle size={16} /> };
            case 'medium':
                return { bg: '#fef3c7', text: '#f59e0b', icon: <BellRing size={16} /> };
            default:
                return { bg: '#e0f2fe', text: '#0ea5e9', icon: <Activity size={16} /> };
        }
    };

    if (isLoading) {
        return (
            <div className="flex-center" style={{ minHeight: '400px' }}>
                <Activity className="animate-spin" size={32} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div style={{ padding: '0 2rem' }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Smart Alerts & Broadcasting</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage automated risk warnings and deploy manual regional alerts.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setIsFormOpen(true)}
                >
                    <Plus size={18} /> New Manual Alert
                </button>
            </div>

            {/* Automated Intelligence Section */}
            <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.5rem', background: '#f5f3ff', color: '#8b5cf6', borderRadius: '10px' }}>
                        <ThermometerSun size={20} />
                    </div>
                    <h3 style={{ fontSize: '1.4rem' }}>Automated Risk Suggestions</h3>
                </div>

                {automatedSuggestions.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
                        {automatedSuggestions.map((suggestion, idx) => {
                            const colors = getSeverityColor(suggestion.severity);
                            return (
                                <div key={idx} className="card" style={{ minWidth: '350px', background: 'white', border: `1px solid ${colors.text}40` }}>
                                    <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                        <span className="badge" style={{ background: colors.bg, color: colors.text, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            {colors.icon} {suggestion.severity} Risk
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{suggestion.region}</span>
                                    </div>
                                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{suggestion.title}</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                                        {suggestion.message}
                                    </p>
                                    <div className="flex-between" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                                            Target: {suggestion.crop}
                                        </div>
                                        <button
                                            className="btn"
                                            style={{ background: colors.text, color: 'white', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                            onClick={() => handleDeploySuggestion(suggestion)}
                                        >
                                            <Send size={14} style={{ marginRight: '0.4rem' }} /> Deploy
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ padding: '2rem', background: 'white', borderRadius: '16px', border: '1px dashed var(--border)', textAlign: 'center' }}>
                        <CheckCircle2 size={32} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
                        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No active automated risks detected in monitored regions.</p>
                    </div>
                )}
            </div>

            {/* Active Broadcasts */}
            <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Active Broadcasts</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {alerts.map(alert => {
                        const colors = getSeverityColor(alert.severity);
                        return (
                            <div key={alert._id} className="card" style={{ borderLeft: `4px solid ${colors.text}` }}>
                                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                    <span className="badge" style={{ background: colors.bg, color: colors.text }}>
                                        {alert.severity}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(alert._id)}
                                        style={{ background: 'transparent', border: 'none', color: '#ff7675', cursor: 'pointer', padding: '0.2rem' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <h4 style={{ marginBottom: '0.5rem' }}>{alert.title}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    {alert.message}
                                </p>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        🎯 {alert.crop || 'All Crops'}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        📍 {alert.region || alert.state || 'All Regions'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {alerts.length === 0 && (
                        <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>No active broadcasts.</p>
                    )}
                </div>
            </div>

            {/* Manual Alert Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="card"
                            style={{ width: '100%', maxWidth: '500px', margin: '2rem', background: 'white' }}
                        >
                            <h3 style={{ marginBottom: '1.5rem' }}>Create Regional Broadcast</h3>
                            <form onSubmit={handleCreateAlert}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="form-input"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Unseasonal Rain Warning"
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Target Crop (Optional)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                            value={formData.crop}
                                            onChange={e => setFormData({ ...formData, crop: e.target.value })}
                                            placeholder="e.g. Wheat"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Target Region (District)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                            value={formData.region}
                                            onChange={e => setFormData({ ...formData, region: e.target.value })}
                                            placeholder="e.g. Pune"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Target State</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                            value={formData.state}
                                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                                            placeholder="e.g. Maharashtra"
                                        />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Severity</label>
                                    <select
                                        className="form-input"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                        value={formData.severity}
                                        onChange={e => setFormData({ ...formData, severity: e.target.value })}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Message</label>
                                    <textarea
                                        required
                                        rows="4"
                                        className="form-input"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', resize: 'vertical' }}
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Enter the alert message..."
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setIsFormOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        Deploy Broadcast
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminAlerts;
