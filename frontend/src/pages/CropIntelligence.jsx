import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    Droplets,
    Leaf,
    Sprout,
    ShieldCheck,
    AlertTriangle,
    Info,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Activity,
    Wind,
    Zap,
    Bug,
    Microscope,
    Stethoscope,
    BookOpen,
    Clock,
    Lock,
    Search
} from 'lucide-react';
import { api } from '../services/api';

const CropIntelligence = ({ crop, user, onBack }) => {
    const [activeTab, setActiveTab] = useState('Roadmap');
    const [expandedAccordion, setExpandedAccordion] = useState('Soil Preparation');
    const [selectedPhase, setSelectedPhase] = useState(0);
    const [resolvedPests, setResolvedPests] = useState([]);
    const [loadingPests, setLoadingPests] = useState(false);

    useEffect(() => {
        const fetchPests = async () => {
            if (crop?.pests_diseases?.length > 0) {
                setLoadingPests(true);
                try {
                    const allPests = await api.get('/pests');
                    // Handle both cases: pest_diseases might be objects (legacy) or IDs (new)
                    const filtered = allPests.filter(p => {
                        return crop.pests_diseases.some(cp => (cp._id || cp) === p._id);
                    });
                    setResolvedPests(filtered);
                } catch (err) {
                    console.error('Failed to resolve biological threats:', err);
                } finally {
                    setLoadingPests(false);
                }
            } else {
                setResolvedPests([]);
            }
        };
        fetchPests();
    }, [crop]);

    if (!crop) {
        return (
            <div className="main-container section-padding flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ background: 'var(--primary-light)', padding: '2rem', borderRadius: '50%' }}>
                    <Leaf size={64} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '2rem' }}>No Crop Selected</h3>
                <button onClick={onBack} className="btn btn-primary">Back to Library</button>
            </div>
        );
    }

    const tabs = [
        { id: 'Roadmap', label: 'Growth Roadmap', icon: <Activity size={18} /> },
        { id: 'Guide', label: 'Cultivation Guide', icon: <BookOpen size={18} /> },
        { id: 'Pests', label: 'Pest & Disease Guide', icon: <Bug size={18} /> },
        { id: 'Alerts', label: 'Alerts & Prevention', icon: <AlertTriangle size={18} /> }
    ];

    const GuestLock = ({ title }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                padding: '4rem 2rem',
                background: 'white',
                borderRadius: '32px',
                border: '1px solid var(--border)',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                maxWidth: '600px',
                margin: '0 auto'
            }}
        >
            <div style={{ background: 'var(--primary-light)', padding: '1.5rem', borderRadius: '50%' }}>
                <ShieldCheck size={48} color="var(--primary)" />
            </div>
            <div>
                <h4 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{title} is Locked</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>Join the AgroAssist community to unlock premium agronomic intelligence, detailed roadmaps, and expert guides.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                    onClick={() => window.location.hash = '#auth'}
                    className="btn btn-primary"
                    style={{ padding: '0.8rem 2.5rem', borderRadius: '100px' }}
                >
                    Register Now
                </button>
                <button
                    onClick={() => window.location.hash = '#auth'}
                    className="btn btn-secondary"
                    style={{ padding: '0.8rem 2.5rem', borderRadius: '100px' }}
                >
                    Login
                </button>
            </div>
        </motion.div>
    );

    const renderRoadmap = () => {
        if (!user) return <GuestLock title="Growth Roadmap" />;
        const steps = crop.routine || [];
        const currentData = steps[selectedPhase];

        return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderRight: '1px solid var(--border)', paddingRight: '2rem' }}>
                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ x: 5 }}
                            onClick={() => setSelectedPhase(idx)}
                            style={{
                                padding: '1.5rem',
                                borderRadius: '16px',
                                background: selectedPhase === idx ? 'var(--primary)' : 'white',
                                color: selectedPhase === idx ? 'white' : 'var(--text)',
                                border: '1px solid var(--border)',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                position: 'relative',
                                boxShadow: selectedPhase === idx ? 'var(--shadow-primary)' : 'var(--shadow-sm)'
                            }}
                        >
                            <div style={{
                                position: 'absolute', left: '-10px', top: '50%', transform: 'translateY(-50%)',
                                width: '20px', height: '20px', borderRadius: '50%',
                                background: selectedPhase === idx ? 'white' : 'var(--primary)',
                                border: `4px solid ${selectedPhase === idx ? 'var(--primary)' : 'white'}`,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }} />
                            <div style={{
                                fontWeight: 800,
                                color: selectedPhase === idx ? 'rgba(255,255,255,0.9)' : 'var(--primary)',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                marginBottom: '0.4rem'
                            }}>
                                Phase {idx + 1} • {step.period || `Day ${step.start_day}-${step.end_day}`}
                            </div>
                            <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>{step.title}</div>
                        </motion.div>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <AnimatePresence mode="wait">
                        {currentData && (
                            <motion.div
                                key={selectedPhase}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="card"
                                style={{ padding: '2.5rem', background: '#fcfdfa', borderLeft: '6px solid var(--primary)', margin: 0 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{currentData.title} Details</h4>
                                    <span style={{ background: 'var(--primary-light)', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                                        Duration: {currentData.start_day}-{currentData.end_day} Days
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>{currentData.desc}</p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                                            <CheckCircle2 size={20} /> <span style={{ fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase' }}>Critical Tasks</span>
                                        </div>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                            {(currentData.daily_routine || [currentData.protocol]).map((task, i) => (
                                                <li key={i} style={{ fontSize: '0.95rem', color: 'var(--text)', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                                                    <div style={{ marginTop: '0.4rem', minWidth: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                                                    {task}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div style={{ background: '#fff9f9', padding: '1.5rem', borderRadius: '20px', border: '1px solid #fee2e2' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#ef4444' }}>
                                            <AlertTriangle size={20} /> <span style={{ fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase' }}>Risk Monitoring</span>
                                        </div>
                                        <p style={{ fontSize: '0.95rem', color: '#991b1b', lineHeight: 1.6 }}>{currentData.risk}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    };

    const renderCultivation = () => {
        if (!user) return <GuestLock title="Cultivation Guide" />;
        const guide = crop.cultivation_guide || {
            soil_preparation: "Placeholder guide for soil preparation.",
            irrigation_guidance: "Placeholder guide for irrigation.",
            fertilizer_practices: "Placeholder guide for fertilizer application.",
            seasonal_tips: "Placeholder seasonal management tips."
        };

        const sections = [
            { id: 'Soil Preparation', title: 'Soil Preparation', content: guide.soil_preparation, icon: <Sprout size={24} /> },
            { id: 'Irrigation', title: 'Irrigation Guidance', content: guide.irrigation_guidance, icon: <Droplets size={24} /> },
            { id: 'Fertilizer', title: 'Fertilizer Practices', content: guide.fertilizer_practices, icon: <Zap size={24} /> },
            { id: 'Seasonal', title: 'Seasonal Tips', content: guide.seasonal_tips, icon: <Wind size={24} /> }
        ];

        return (
            <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {sections.map(section => (
                    <motion.div
                        key={section.id}
                        className="card"
                        style={{ padding: 0, overflow: 'hidden', border: expandedAccordion === section.id ? '2px solid var(--primary)' : '1px solid var(--border)' }}
                    >
                        <div
                            onClick={() => setExpandedAccordion(expandedAccordion === section.id ? null : section.id)}
                            style={{
                                padding: '1.75rem 2.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                background: expandedAccordion === section.id ? 'var(--primary-light)' : 'white',
                                transition: 'all 0.3s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ color: 'var(--primary)' }}>{section.icon}</div>
                                <h4 style={{ fontSize: '1.3rem', fontWeight: 900 }}>{section.title}</h4>
                            </div>
                            {expandedAccordion === section.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                        </div>
                        <AnimatePresence>
                            {expandedAccordion === section.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    style={{ borderTop: '1px solid var(--border)' }}
                                >
                                    <div style={{ padding: '2.5rem', color: 'var(--text)', fontSize: '1.1rem', lineHeight: 1.8 }}>
                                        {section.content}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        );
    };

    const renderPests = () => {
        if (!user) return <GuestLock title="Pest & Disease Hub" />;

        if (loadingPests) {
            return (
                <div style={{ textAlign: 'center', padding: '6rem' }}>
                    <div className="spinner" style={{ margin: '0 auto 1.5rem', width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <p style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Resolving biological intelligence...</p>
                </div>
            );
        }

        const displayItems = resolvedPests.length > 0 ? resolvedPests : (Array.isArray(crop.pests_diseases) && typeof crop.pests_diseases[0] === 'object' ? crop.pests_diseases : []);

        if (displayItems.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '6rem', background: 'white', borderRadius: '32px', border: '1px solid var(--border)' }}>
                    <ShieldCheck size={48} color="var(--primary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                    <h4 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Pest-Free Variety</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No major biological threats are currently registered for this variety.</p>
                </div>
            );
        }

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2.5rem' }}>
                {displayItems.map((item, idx) => (
                    <motion.div
                        key={idx}
                        className="card"
                        whileHover={{ y: -10 }}
                        style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden', background: 'white', border: 'none', boxShadow: 'var(--shadow-md)' }}
                    >
                        <div style={{
                            position: 'absolute', top: 0, right: 0, padding: '0.75rem 1.5rem',
                            background: item.risk_level === 'Critical' ? '#ef4444' : item.risk_level === 'High' ? '#f59e0b' : '#3b82f6',
                            color: 'white', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase',
                            borderRadius: '0 0 0 20px', zIndex: 1
                        }}>
                            Risk: {item.risk_level}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '16px', overflow: 'hidden', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {item.image ? (
                                    <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    item.name.toLowerCase().includes('bacteria') || item.name.toLowerCase().includes('virus') ? <Microscope size={28} color="var(--primary)" /> : <Bug size={28} color="var(--primary)" />
                                )}
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>{item.name}</h4>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>{item.type}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ color: 'var(--primary)', marginTop: '0.2rem' }}><Activity size={18} /></div>
                                <div>
                                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Symptoms</span>
                                    <p style={{ fontSize: '1rem', marginTop: '0.25rem', lineHeight: 1.5 }}>{item.symptoms}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ color: 'var(--primary)', marginTop: '0.2rem' }}><Clock size={18} /></div>
                                <div>
                                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Risk Stage</span>
                                    <p style={{ fontSize: '1rem', marginTop: '0.25rem', lineHeight: 1.5 }}>{item.risk_stage}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ color: 'var(--primary)', marginTop: '0.2rem' }}><ShieldCheck size={18} /></div>
                                <div>
                                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prevention</span>
                                    <p style={{ fontSize: '1rem', marginTop: '0.25rem', lineHeight: 1.5 }}>{item.prevention}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', background: 'var(--primary-light)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-light)' }}>
                                <div style={{ color: 'var(--primary)', marginTop: '0.2rem' }}><Stethoscope size={20} /></div>
                                <div>
                                    <span style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Treatment Strategy</span>
                                    <p style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.25rem', lineHeight: 1.5 }}>{item.treatment}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    };

    const renderAlerts = () => {
        if (!user) return <GuestLock title="Alert Intelligence" />;
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {(crop.active_alerts || []).map((alert, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                            padding: '2rem',
                            borderRadius: '24px',
                            background: alert.type === 'Weather' ? '#eef2ff' : '#fff7ed',
                            border: `1px solid ${alert.type === 'Weather' ? '#c3dafe' : '#ffedd5'}`,
                            display: 'flex',
                            gap: '2rem',
                            alignItems: 'center'
                        }}
                    >
                        <div style={{
                            background: 'white', padding: '1.25rem', borderRadius: '16px',
                            color: alert.type === 'Weather' ? '#3b82f6' : '#f97316',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                            {alert.type === 'Weather' ? <Wind size={32} /> : <Bug size={32} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <span style={{
                                    fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase',
                                    padding: '0.25rem 0.75rem', borderRadius: '100px',
                                    background: alert.type === 'Weather' ? '#3b82f6' : '#f97316',
                                    color: 'white'
                                }}>
                                    {alert.type} Alert
                                </span>
                                <h5 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>{alert.title}</h5>
                            </div>
                            <p style={{ fontSize: '1.05rem', color: 'var(--text)', margin: 0, lineHeight: 1.6 }}>{alert.msg}</p>
                        </div>
                    </motion.div>
                ))}

                <div style={{ marginTop: '2rem', padding: '2.5rem', background: '#f8fafc', borderRadius: '32px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                    <h4 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '0.75rem' }}>System-Wide Prevention Protocol</h4>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Automated alerts are generated based on real-time sensor data and local agronomic forecasts.</p>
                    <button className="btn btn-secondary" style={{ borderRadius: '100px' }}>Configure Alert Notifications</button>
                </div>
            </div>
        );
    };

    return (
        <div className="main-container section-padding">
            <button
                onClick={onBack}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'none', border: 'none',
                    color: 'var(--text-muted)', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                    marginBottom: '2.5rem', padding: '0.5rem 0'
                }}
            >
                <ArrowLeft size={18} /> Back to Library
            </button>

            <header style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', gap: '4rem', alignItems: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            width: '350px', height: '280px', borderRadius: '40px', overflow: 'hidden',
                            boxShadow: 'var(--shadow-lg)', border: '6px solid white'
                        }}
                    >
                        <img
                            src={crop.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800'}
                            alt={crop.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </motion.div>

                    <div style={{ flex: 1 }}>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>{crop.category}</div>
                                <div style={{ background: '#fef3c7', color: '#d97706', padding: '0.4rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>Expert Tier</div>
                            </div>
                            <h2 style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{crop.name} <span className="serif" style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Intelligence</span></h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2.5rem' }}>Complete lifecycle guidance, disease prevention, and best practices.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                                {[
                                    { label: 'Season', value: crop.growing_season || 'Summer', icon: <Calendar color="#e67e22" /> },
                                    { label: 'Duration', value: crop.avg_duration || '120 Days', icon: <Clock color="#3498db" /> },
                                    { label: 'Soil', value: crop.soil_preference || 'Alluvial', icon: <Sprout color="#27ae60" /> },
                                    { label: 'Water', value: crop.water_requirement || 'High', icon: <Droplets color="#0984e3" /> }
                                ].map((item, i) => (
                                    <div key={i} style={{ background: 'white', padding: '1.25rem', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                                        <div style={{ marginBottom: '0.5rem' }}>{item.icon}</div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 900 }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div style={{
                display: 'flex', background: 'white', padding: '0.5rem', borderRadius: '100px',
                width: 'fit-content', margin: '0 auto 4rem', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '0.8rem 2rem', borderRadius: '100px', border: 'none',
                            background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                            color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                            fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                        {!user && <Lock size={12} style={{ marginLeft: '0.5rem', opacity: 0.6 }} />}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {activeTab === 'Roadmap' && renderRoadmap()}
                {activeTab === 'Guide' && renderCultivation()}
                {activeTab === 'Pests' && renderPests()}
                {activeTab === 'Alerts' && renderAlerts()}
            </motion.div>
        </div>
    );
};

export default CropIntelligence;
