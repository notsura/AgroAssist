import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Bug,
    X,
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    Info,
    Activity,
    Upload,
    Image as ImageIcon,
    Sprout,
    Shield
} from 'lucide-react';
import { api } from '../services/api';

const AdminPests = () => {
    const [pests, setPests] = useState([]);
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingPest, setEditingPest] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fetchData = async () => {
        try {
            const [pestsData, cropsData] = await Promise.all([
                api.get('/admin/pests'),
                api.get('/crops')
            ]);
            setPests(pestsData);
            setCrops(cropsData);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Delete this pest record? All links to crops will be removed.')) {
            try {
                await api.delete(`/admin/pests/${id}`);
                fetchData();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        try {
            if (editingPest._id) {
                await api.put(`/admin/pests/${editingPest._id}`, editingPest);
            } else {
                await api.post('/admin/pests', editingPest);
            }
            setIsFormOpen(false);
            fetchData();
            alert('Pest intelligence saved!');
        } catch (err) {
            alert('Save failed: ' + err.message);
        }
    };

    const handleFileUpload = async (file) => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.url) {
                setEditingPest({ ...editingPest, image: data.url });
            }
        } catch (err) {
            alert('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const toggleCropAssignment = (cropId) => {
        const current = [...(editingPest.affected_crops || [])];
        if (current.includes(cropId)) {
            setEditingPest({ ...editingPest, affected_crops: current.filter(id => id !== cropId) });
        } else {
            setEditingPest({ ...editingPest, affected_crops: [...current, cropId] });
        }
    };

    const openForm = (pest = null) => {
        setEditingPest(pest || {
            name: '',
            type: 'Insect',
            risk_level: 'Low',
            description: '',
            symptoms: '',
            causes: '',
            risk_stage: '',
            prevention: '',
            treatment: '',
            image: '',
            affected_crops: []
        });
        setIsFormOpen(true);
    };

    const filteredPests = pests.filter(p => (p.name || '').toLowerCase().includes(search.toLowerCase()));

    const stats = {
        total: pests.length,
        highRisk: pests.filter(p => p.risk_level === 'High').length,
        critical: pests.filter(p => p.risk_level === 'Critical').length
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Biological Threat Intelligence</h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Manage pests, diseases, and deficiency protocols.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                        <input
                            type="text"
                            placeholder="Search pest database..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.75rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'white', fontWeight: 600, fontSize: '0.95rem' }}
                        />
                    </div>
                    <button onClick={() => openForm()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1.75rem' }}>
                        <Plus size={20} /> Register Pest
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[
                    { label: 'Total Biological Risks', value: stats.total, color: 'var(--primary)', icon: Bug },
                    { label: 'High Risk Threats', value: stats.highRisk, color: '#f59e0b', icon: AlertTriangle },
                    { label: 'Critical Outbreaks', value: stats.critical, color: '#ef4444', icon: Activity }
                ].map((stat, i) => (
                    <div key={i} style={{ background: 'white', padding: '1.5rem 2rem', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{loading ? '--' : stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Listing */}
            <div className="card" style={{ padding: 0, borderRadius: '24px', overflow: 'hidden', background: 'white', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                        <tr>
                            <th style={{ padding: '1.25rem 2rem', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)' }}>THREAT</th>
                            <th style={{ padding: '1.25rem 2rem', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)' }}>CLASSIFICATION</th>
                            <th style={{ padding: '1.25rem 2rem', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)' }}>RISK LEVEL</th>
                            <th style={{ padding: '1.25rem 2rem', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)' }}>AFFECTED CROPS</th>
                            <th style={{ padding: '1.25rem 2rem', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: '4rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)' }}>Analyzing biological records...</td></tr>
                        ) : filteredPests.map(pest => (
                            <tr key={pest._id} style={{ borderBottom: '1px solid #f8fafc', transition: '0.2s' }}>
                                <td style={{ padding: '1.5rem 2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#f1f5f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {pest.image ? <img src={pest.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Bug size={24} color="#94a3b8" />}
                                        </div>
                                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>{pest.name}</div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem 2rem' }}>
                                    <span style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: '#f1f5f9', fontSize: '0.75rem', fontWeight: 800 }}>{pest.type}</span>
                                </td>
                                <td style={{ padding: '1.5rem 2rem' }}>
                                    <span style={{
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '8px',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        background: pest.risk_level === 'Critical' ? '#fee2e2' : pest.risk_level === 'High' ? '#ffedd5' : '#f0fdf4',
                                        color: pest.risk_level === 'Critical' ? '#ef4444' : pest.risk_level === 'High' ? '#f59e0b' : 'var(--primary)'
                                    }}>{pest.risk_level}</span>
                                </td>
                                <td style={{ padding: '1.5rem 2rem' }}>
                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                        {pest.affected_crops?.map(cid => {
                                            const crop = crops.find(c => c._id === cid);
                                            return crop ? (
                                                <span key={cid} style={{ padding: '0.3rem 0.6rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>{crop.name}</span>
                                            ) : null;
                                        })}
                                        {(!pest.affected_crops || pest.affected_crops.length === 0) && <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Universal / None</span>}
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem 2rem' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button onClick={() => openForm(pest)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}><Edit2 size={18} /></button>
                                        <button onClick={() => handleDelete(pest._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {isFormOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            style={{ background: 'white', borderRadius: '32px', width: '100%', maxWidth: '900px', height: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
                        >
                            {/* Modal Header */}
                            <div style={{ padding: '2rem 3rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Shield size={32} color="var(--primary)" />
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{editingPest._id ? `Update ${editingPest.name}` : 'Register New Biological Risk'}</h2>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button onClick={handleSave} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontWeight: 900, borderRadius: '12px' }}>Save Intelligence</button>
                                    <button onClick={() => setIsFormOpen(false)} style={{ background: '#f8fafc', border: 'none', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer' }}><X size={24} /></button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '3rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div className="input-group">
                                            <label style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Pest / Disease Name</label>
                                            <input type="text" value={editingPest.name} onChange={e => setEditingPest({ ...editingPest, name: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #eee' }} />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div className="input-group">
                                                <label style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Type</label>
                                                <select value={editingPest.type} onChange={e => setEditingPest({ ...editingPest, type: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #eee' }}>
                                                    <option>Insect</option>
                                                    <option>Fungal</option>
                                                    <option>Bacterial</option>
                                                    <option>Viral</option>
                                                    <option>Nutrient Deficiency</option>
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Risk Level</label>
                                                <select value={editingPest.risk_level} onChange={e => setEditingPest({ ...editingPest, risk_level: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #eee' }}>
                                                    <option>Low</option>
                                                    <option>Medium</option>
                                                    <option>High</option>
                                                    <option>Critical</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="input-group">
                                            <label style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>General Description</label>
                                            <textarea rows="3" value={editingPest.description} onChange={e => setEditingPest({ ...editingPest, description: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #eee' }} />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div className="input-group">
                                                <label style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Symptoms</label>
                                                <textarea rows="3" value={editingPest.symptoms} onChange={e => setEditingPest({ ...editingPest, symptoms: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #eee' }} />
                                            </div>
                                            <div className="input-group">
                                                <label style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Causes / Pathogens</label>
                                                <textarea rows="3" value={editingPest.causes} onChange={e => setEditingPest({ ...editingPest, causes: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #eee' }} />
                                            </div>
                                        </div>

                                        <div className="input-group">
                                            <label style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Critical Risk Stage</label>
                                            <input type="text" placeholder="e.g. Flowering stage" value={editingPest.risk_stage} onChange={e => setEditingPest({ ...editingPest, risk_stage: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #eee' }} />
                                        </div>

                                        <div className="input-group">
                                            <label style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Prevention Protocol</label>
                                            <textarea rows="3" value={editingPest.prevention} onChange={e => setEditingPest({ ...editingPest, prevention: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #eee' }} />
                                        </div>

                                        <div className="input-group">
                                            <label style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Treatment Strategy</label>
                                            <textarea rows="3" value={editingPest.treatment} onChange={e => setEditingPest({ ...editingPest, treatment: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #eee' }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        <div className="input-group">
                                            <label style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.8rem', display: 'block' }}>Threat Image</label>
                                            <div
                                                onClick={() => document.getElementById('pest-img-upload').click()}
                                                style={{
                                                    width: '100%', height: '220px', borderRadius: '24px', border: '2px dashed #eee', background: '#fcfcfc',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                    overflow: 'hidden', position: 'relative'
                                                }}
                                            >
                                                <input id="pest-img-upload" type="file" hidden accept="image/*" onChange={e => handleFileUpload(e.target.files[0])} />
                                                {uploading ? (
                                                    <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                                ) : editingPest.image ? (
                                                    <img src={editingPest.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <>
                                                        <ImageIcon size={40} color="#cbd5e1" />
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginTop: '1rem' }}>Click to upload asset</div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="input-group">
                                            <label style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '1rem', display: 'block' }}>Affected Crop Varieties</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
                                                {crops.map(crop => (
                                                    <button
                                                        key={crop._id}
                                                        type="button"
                                                        onClick={() => toggleCropAssignment(crop._id)}
                                                        style={{
                                                            padding: '0.75rem',
                                                            borderRadius: '12px',
                                                            border: '2px solid',
                                                            borderColor: editingPest.affected_crops?.includes(crop._id) ? 'var(--primary)' : '#eee',
                                                            background: editingPest.affected_crops?.includes(crop._id) ? 'var(--primary-light)' : 'white',
                                                            color: editingPest.affected_crops?.includes(crop._id) ? 'var(--primary)' : 'var(--text-muted)',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 800,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            textAlign: 'left'
                                                        }}
                                                    >
                                                        <Sprout size={14} />
                                                        {crop.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPests;
