import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Sprout,
    X,
    AlertTriangle,
    Clock,
    CheckCircle2,
    ChevronRight,
    Info,
    BookOpen,
    Bug,
    Bell,
    Package,
    Calendar,
    Layers,
    Activity,
    Upload,
    Image as ImageIcon
} from 'lucide-react';
import { api, imageUrl } from '../services/api';

const AdminCrops = () => {
    const [crops, setCrops] = useState([]);
    const [allPests, setAllPests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingCrop, setEditingCrop] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [uploading, setUploading] = useState(false);

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: Info },
        { id: 'cultivation', label: 'Cultivation Guide', icon: BookOpen },
        { id: 'pests', label: 'Pests & Diseases', icon: Bug },
        { id: 'routine', label: 'Growth Routine', icon: Calendar },
        { id: 'alerts', label: 'Alerts', icon: Bell },
        { id: 'postharvest', label: 'Post Harvest', icon: Package },
    ];

    const fetchData = async () => {
        try {
            const [cropsData, pestsData] = await Promise.all([
                api.get('/crops'),
                api.get('/admin/pests')
            ]);
            setCrops(cropsData);
            setAllPests(pestsData);
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
        if (window.confirm('Are you sure you want to delete this crop? This action cannot be undone.')) {
            try {
                await api.delete(`/admin/crops/${id}`);
                fetchData();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        try {
            if (editingCrop._id) {
                await api.put(`/admin/crops/${editingCrop._id}`, editingCrop);
            } else {
                await api.post('/admin/crops', editingCrop);
            }
            setIsFormOpen(false);
            fetchData();
            alert('Crop data saved successfully!');
        } catch (err) {
            alert('Save failed: ' + err.message);
        }
    };

    const filteredCrops = crops.filter(c => (c.name || '').toLowerCase().includes(search.toLowerCase()));

    const openForm = (crop = null) => {
        setEditingCrop(crop || {
            name: '',
            category: 'Grain',
            growing_season: 'Kharif',
            avg_duration: '',
            soil_preference: '',
            water_requirement: 'Moderate',
            image: '',
            cultivation_guide: {
                soil_preparation: '',
                irrigation_guidance: '',
                fertilizer_practices: '',
                seasonal_tips: ''
            },
            pests_diseases: [],
            routine: [],
            active_alerts: [],
            post_harvest: {
                storage: '',
                cleaning: '',
                soil_prep: '',
                residue: ''
            }
        });
        setActiveTab('basic');
        setIsFormOpen(true);
    };

    const updateNested = (path, value) => {
        const newData = { ...editingCrop };
        const keys = path.split('.');
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setEditingCrop(newData);
    };

    const handleFileUpload = async (file) => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const data = await api.post('/upload', formData);
            if (data.url) {
                setEditingCrop({ ...editingCrop, image: data.url });
            }
        } catch (err) {
            alert('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    // Stable Render Functions for Tabs
    const renderTabBasic = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div className="input-group">
                    <label style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.8rem', display: 'block' }}>Variety Name</label>
                    <input
                        type="text"
                        value={editingCrop.name}
                        onChange={(e) => setEditingCrop({ ...editingCrop, name: e.target.value })}
                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #eee', background: '#fcfcfc', fontWeight: 600 }}
                    />
                </div>
                <div className="input-group">
                    <label style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.8rem', display: 'block' }}>Classification</label>
                    <select
                        value={editingCrop.category}
                        onChange={(e) => setEditingCrop({ ...editingCrop, category: e.target.value })}
                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #eee', background: '#fcfcfc', fontWeight: 600 }}
                    >
                        <option>Grain</option>
                        <option>Vegetable</option>
                        <option>Fruit</option>
                        <option>Commercial</option>
                        <option>Oilseed</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div className="input-group">
                    <label style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.8rem', display: 'block' }}>Season</label>
                    <input type="text" value={editingCrop.growing_season} onChange={(e) => setEditingCrop({ ...editingCrop, growing_season: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #eee' }} />
                </div>
                <div className="input-group">
                    <label style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.8rem', display: 'block' }}>Duration</label>
                    <input type="text" value={editingCrop.avg_duration} onChange={(e) => setEditingCrop({ ...editingCrop, avg_duration: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #eee' }} />
                </div>
                <div className="input-group">
                    <label style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.8rem', display: 'block' }}>Water Requirement</label>
                    <input type="text" value={editingCrop.water_requirement} onChange={(e) => setEditingCrop({ ...editingCrop, water_requirement: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #eee' }} />
                </div>
            </div>

            <div className="input-group">
                <label style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.8rem', display: 'block' }}>Crop Presentation Image</label>
                <div
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleFileUpload(e.dataTransfer.files[0]);
                        }
                    }}
                    style={{
                        width: '100%',
                        padding: '3rem',
                        borderRadius: '24px',
                        border: '2px dashed #e2e8f0',
                        background: '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onClick={() => document.getElementById('crop-image-upload').click()}
                >
                    <input
                        id="crop-image-upload"
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                handleFileUpload(e.target.files[0]);
                            }
                        }}
                    />

                    {uploading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Processing Image...</span>
                        </div>
                    ) : editingCrop.image ? (
                        <div style={{ position: 'relative', width: '200px', height: '140px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
                            <img src={imageUrl(editingCrop.image)} alt="Crop Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.3s' }} className="hover-overlay">
                                <Upload color="white" size={24} />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                <ImageIcon size={32} color="var(--primary)" />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem' }}>Drop cultivation image here</p>
                                <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>or <span style={{ color: 'var(--primary)' }}>click to browse</span> folder</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    const renderTabCultivation = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
                { id: 'soil_preparation', label: 'Soil Preparation' },
                { id: 'irrigation_guidance', label: 'Irrigation Guidance' },
                { id: 'fertilizer_practices', label: 'Fertilizer Practices' },
                { id: 'seasonal_tips', label: 'Seasonal Tips' }
            ].map(field => (
                <div key={field.id} className="input-group">
                    <label style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.8rem', display: 'block' }}>{field.label}</label>
                    <textarea
                        rows="4"
                        value={editingCrop.cultivation_guide?.[field.id] || ''}
                        onChange={(e) => updateNested(`cultivation_guide.${field.id}`, e.target.value)}
                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #eee', background: '#fcfcfc', fontSize: '0.95rem', lineHeight: '1.5' }}
                    />
                </div>
            ))}
        </div>
    );

    const renderTabPests = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Biological Threat Assignment</h3>
                <div style={{ padding: '0.4rem 0.8rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800 }}>
                    {editingCrop.pests_diseases?.length || 0} Linked Threats
                </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Select all biological threats that affect this variety. These are managed in the <a href="#admin-pests" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 800 }}>Pest Intelligence Hub</a>.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {allPests.map(pest => {
                    const isSelected = editingCrop.pests_diseases?.includes(pest._id);
                    return (
                        <div
                            key={pest._id}
                            onClick={() => {
                                const current = [...(editingCrop.pests_diseases || [])];
                                const next = isSelected
                                    ? current.filter(id => id !== pest._id)
                                    : [...current, pest._id];
                                setEditingCrop({ ...editingCrop, pests_diseases: next });
                            }}
                            style={{
                                padding: '1.25rem',
                                borderRadius: '24px',
                                border: '2.5px solid',
                                borderColor: isSelected ? 'var(--primary)' : '#f1f5f9',
                                background: isSelected ? 'var(--primary-light)' : 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                boxShadow: isSelected ? '0 10px 20px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: isSelected ? 'white' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {pest.image ? <img src={imageUrl(pest.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Bug size={24} color={isSelected ? 'var(--primary)' : '#94a3b8'} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isSelected ? 'var(--primary)' : 'var(--text)' }}>{pest.name}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isSelected ? 'var(--primary)' : '#94a3b8' }}>{pest.type} • {pest.risk_level}</div>
                            </div>
                            {isSelected && (
                                <div style={{ color: 'var(--primary)' }}>
                                    <CheckCircle2 size={20} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {allPests.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Bug size={32} color="#94a3b8" />
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No biological intelligence records.</div>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: '1.5rem' }}>Initialize the pest database to start linking threats to crops.</p>
                    <a href="#admin-pests" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>Go to Pest Hub <ChevronRight size={18} /></a>
                </div>
            )}
        </div>
    );

    const renderTabRoutine = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Growth Stages</h3>
                <button
                    type="button"
                    onClick={() => {
                        const routine = [...(editingCrop.routine || [])];
                        routine.push({ start_day: '', end_day: '', title: '', desc: '', protocol: '', risk: '', daily_routine: [] });
                        setEditingCrop({ ...editingCrop, routine });
                    }}
                    style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                    <Plus size={18} /> Add Stage
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', borderLeft: '2px solid #f1f5f9', paddingLeft: '2.5rem', marginLeft: '1rem' }}>
                {editingCrop.routine?.map((stage, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-3.25rem', top: '0', width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: 'var(--primary)', border: '4px solid white', boxShadow: '0 0 0 2px var(--primary-light)' }} />

                        <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #eee', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.4rem 0.75rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem' }}>
                                        <Clock size={14} /> Day {stage.start_day} - {stage.end_day}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Stage Title"
                                        value={stage.title}
                                        onChange={(e) => {
                                            const r = [...editingCrop.routine];
                                            r[idx].title = e.target.value;
                                            setEditingCrop({ ...editingCrop, routine: r });
                                        }}
                                        style={{ border: 'none', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', outline: 'none' }}
                                    />
                                </div>
                                <button type="button" onClick={() => {
                                    const r = editingCrop.routine.filter((_, i) => i !== idx);
                                    setEditingCrop({ ...editingCrop, routine: r });
                                }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ fontWeight: 800, fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>Start Day</label>
                                    <input type="number" value={stage.start_day} onChange={(e) => {
                                        const r = [...editingCrop.routine];
                                        r[idx].start_day = e.target.value;
                                        setEditingCrop({ ...editingCrop, routine: r });
                                    }} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #ddd' }} />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 800, fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>End Day</label>
                                    <input type="number" value={stage.end_day} onChange={(e) => {
                                        const r = [...editingCrop.routine];
                                        r[idx].end_day = e.target.value;
                                        setEditingCrop({ ...editingCrop, routine: r });
                                    }} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #ddd' }} />
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ fontWeight: 800, fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>Protocol</label>
                                <textarea rows="2" value={stage.protocol} onChange={(e) => {
                                    const r = [...editingCrop.routine];
                                    r[idx].protocol = e.target.value;
                                    setEditingCrop({ ...editingCrop, routine: r });
                                }} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #ddd' }} />
                            </div>

                            <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '16px', border: '1px solid #dcfce7' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Activity size={16} /> Daily Checklist
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const r = [...editingCrop.routine];
                                            if (!r[idx].daily_routine) r[idx].daily_routine = [];
                                            r[idx].daily_routine.push('');
                                            setEditingCrop({ ...editingCrop, routine: r });
                                        }}
                                        style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                                    > Add Task </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {stage.daily_routine?.map((task, tidx) => (
                                        <div key={tidx} style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input
                                                type="text"
                                                value={task}
                                                placeholder="Enter daily task..."
                                                onChange={(e) => {
                                                    const r = [...editingCrop.routine];
                                                    r[idx].daily_routine[tidx] = e.target.value;
                                                    setEditingCrop({ ...editingCrop, routine: r });
                                                }}
                                                style={{ flex: 1, padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #bbf7d0', outline: 'none' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const r = [...editingCrop.routine];
                                                    r[idx].daily_routine = r[idx].daily_routine.filter((_, i) => i !== tidx);
                                                    setEditingCrop({ ...editingCrop, routine: r });
                                                }}
                                                style={{ background: 'none', border: 'none', color: '#ffbaba' }}
                                            ><X size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTabAlerts = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>System Alerts</h3>
                <button
                    type="button"
                    onClick={() => {
                        const alerts = [...(editingCrop.active_alerts || [])];
                        alerts.push({ type: 'Weather', title: '', msg: '' });
                        setEditingCrop({ ...editingCrop, active_alerts: alerts });
                    }}
                    style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                    <Plus size={18} /> Add Alert
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {editingCrop.active_alerts?.map((alert, idx) => (
                    <div key={idx} style={{ padding: '1.5rem', borderRadius: '20px', background: 'white', border: '1px solid #fee2e2', position: 'relative' }}>
                        <button type="button" onClick={() => {
                            const a = editingCrop.active_alerts.filter((_, i) => i !== idx);
                            setEditingCrop({ ...editingCrop, active_alerts: a });
                        }} style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#ef4444', border: 'none', background: 'none' }}><Trash2 size={16} /></button>

                        <div style={{ marginBottom: '1rem' }}>
                            <select value={alert.type} onChange={(e) => {
                                const a = [...editingCrop.active_alerts];
                                a[idx].type = e.target.value;
                                setEditingCrop({ ...editingCrop, active_alerts: a });
                            }} style={{ fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', background: '#fef2f2', color: '#ef4444', padding: '0.3rem 0.6rem', border: 'none', borderRadius: '6px' }}>
                                <option>Weather</option>
                                <option>Biological</option>
                                <option>Educational</option>
                                <option>Market</option>
                            </select>
                        </div>
                        <input
                            type="text"
                            placeholder="Alert Title"
                            value={alert.title}
                            onChange={(e) => {
                                const a = [...editingCrop.active_alerts];
                                a[idx].title = e.target.value;
                                setEditingCrop({ ...editingCrop, active_alerts: a });
                            }}
                            style={{ width: '100%', border: 'none', fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', outline: 'none' }}
                        />
                        <textarea
                            rows="3"
                            placeholder="Message body..."
                            value={alert.msg}
                            onChange={(e) => {
                                const a = [...editingCrop.active_alerts];
                                a[idx].msg = e.target.value;
                                setEditingCrop({ ...editingCrop, active_alerts: a });
                            }}
                            style={{ width: '100%', border: 'none', fontSize: '0.9rem', color: 'var(--text-muted)', outline: 'none', lineHeight: '1.4' }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTabPostHarvest = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
                { id: 'storage', label: 'Storage Practices' },
                { id: 'cleaning', label: 'Field Cleaning' },
                { id: 'soil_prep', label: 'Off-Season Soil Preparation' },
                { id: 'residue', label: 'Residue Management' }
            ].map(field => (
                <div key={field.id} className="input-group">
                    <label style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.8rem', display: 'block' }}>{field.label}</label>
                    <textarea
                        rows="4"
                        value={editingCrop.post_harvest?.[field.id] || ''}
                        onChange={(e) => updateNested(`post_harvest.${field.id}`, e.target.value)}
                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #eee', background: '#fcfcfc', fontSize: '0.95rem', lineHeight: '1.5' }}
                    />
                </div>
            ))}
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'basic': return renderTabBasic();
            case 'cultivation': return renderTabCultivation();
            case 'pests': return renderTabPests();
            case 'routine': return renderTabRoutine();
            case 'alerts': return renderTabAlerts();
            case 'postharvest': return renderTabPostHarvest();
            default: return renderTabBasic();
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Crop Library Management</h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Update roadmaps, tips, and cultivation parameters.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                        <input
                            type="text"
                            placeholder="Search knowledge base..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.75rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'white', fontWeight: 600, fontSize: '0.95rem' }}
                        />
                    </div>
                    <button onClick={() => openForm()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1.75rem' }}>
                        <Plus size={20} /> New Crop
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.75rem' }}>
                {loading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '6rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '1.1rem' }}>Synchronizing agricultural records...</div>
                ) : filteredCrops.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '6rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '1.1rem' }}>No crops found. Try a different search.</div>
                ) : filteredCrops.map(crop => (
                    <motion.div
                        key={crop._id}
                        className="card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ padding: '2rem', borderRadius: '28px', position: 'relative', background: 'white', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}
                    >
                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '18px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9' }}>
                                {crop.image ? <img src={imageUrl(crop.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Sprout size={32} color="var(--primary)" />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{crop.category}</div>
                                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', fontWeight: 800 }}>{crop.name}</h3>
                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'var(--primary-light)', padding: '0.3rem 0.6rem', borderRadius: '6px', color: 'var(--primary)' }}>{crop.growing_season}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Pests</div>
                                <div style={{ fontSize: '1rem', fontWeight: 800 }}>{crop.pests_diseases?.length || 0}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Stages</div>
                                <div style={{ fontSize: '1rem', fontWeight: 800 }}>{crop.routine?.length || 0}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Alerts</div>
                                <div style={{ fontSize: '1rem', fontWeight: 800 }}>{crop.active_alerts?.length || 0}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => openForm(crop)}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                            >
                                <Edit2 size={16} /> Manage
                            </button>
                            <button
                                onClick={() => handleDelete(crop._id)}
                                style={{ padding: '0.75rem', width: '44px', borderRadius: '10px', border: 'none', background: '#fee2e2', color: '#ef4444', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal Form Overlay */}
            <AnimatePresence>
                {isFormOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            style={{ background: 'white', borderRadius: '32px', width: '100%', maxWidth: '1000px', height: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
                        >
                            {/* Modal Header */}
                            <div style={{ padding: '2.5rem 3.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <Sprout size={32} color="var(--primary)" />
                                        {editingCrop._id ? `Editing ${editingCrop.name}` : 'Create New Crop Intel'}
                                    </h2>
                                    <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Full lifecycle management for {editingCrop.name || 'variety'}.</p>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={handleSave}
                                        className="btn btn-primary"
                                        style={{ padding: '0.8rem 2rem', fontWeight: 900, borderRadius: '14px', boxShadow: 'var(--shadow-primary)' }}
                                    >
                                        Save All Changes
                                    </button>
                                    <button onClick={() => setIsFormOpen(false)} style={{ border: 'none', background: '#f8fafc', cursor: 'pointer', color: 'var(--text-muted)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body with Sidebar Tabs */}
                            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                                {/* Tab Navigation */}
                                <div style={{ width: '250px', borderRight: '1px solid #f1f5f9', background: '#fcfcfc', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '1rem 1.25rem',
                                                borderRadius: '12px',
                                                border: 'none',
                                                background: activeTab === tab.id ? 'var(--primary-light)' : 'transparent',
                                                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                                                fontWeight: 800,
                                                fontSize: '0.9rem',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <tab.icon size={20} />
                                            {tab.label}
                                            {activeTab === tab.id && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
                                        </button>
                                    ))}
                                </div>

                                {/* Content Area */}
                                <div style={{ flex: 1, overflowY: 'auto', padding: '3rem 4rem', background: '#fff' }}>
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {renderTabContent()}
                                    </motion.div>

                                    <div style={{ height: '5rem' }} /> {/* Spacer */}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCrops;
