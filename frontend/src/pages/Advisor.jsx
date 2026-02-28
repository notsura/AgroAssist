import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Download,
    Save,
    Calendar,
    CheckCircle2,
    Info,
    Droplets,
    ThermometerSun,
    Mountain,
    MapPin,
    ChevronRight,
    ArrowRight,
    Leaf,
    FileText,
    Sprout,
    Sparkles,
    Loader2,
    AlertTriangle,
    Filter
} from 'lucide-react';
import { api } from '../services/api';


const getSeasonByMonth = () => {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 6 && month <= 9) return 'Kharif (Monsoon)';
    if (month >= 3 && month <= 5) return 'Zaid (Summer)';
    return 'Rabi (Winter)'; // October to February
};

const Advisor = ({ user }) => {
    const [step, setStep] = useState('input'); // 'input', 'result', or 'routine'
    const [showSeasonGrid, setShowSeasonGrid] = useState(false);
    const [inputs, setInputs] = useState({
        soil: 'Alluvial',
        water: 'Moderate Climate',
        season: getSeasonByMonth(),
        category: 'All',
        crop: ''
    });
    const [allCrops, setAllCrops] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [loading, setLoading] = useState(false);
    const [journeyLoading, setJourneyLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [activeJourney, setActiveJourney] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    React.useEffect(() => {
        fetchActiveStatus();
        fetchAllCrops();
    }, []);

    const fetchAllCrops = async () => {
        try {
            const data = await api.get('/crops');
            setAllCrops(data || []);
        } catch (err) {
            console.error("Failed to fetch all crops", err);
        }
    };

    const fetchActiveStatus = async () => {
        try {
            const data = await api.get(`/user/active-status?t=${Date.now()}`);
            if (data.active) {
                setActiveJourney(data);
            } else {
                setActiveJourney(null);
            }
        } catch (err) {
            console.error("Failed to fetch active status in Advisor", err);
        }
    };

    const handleStartJourney = async (cropName, force = false) => {
        if (activeJourney && !force) {
            setShowConfirmModal(true);
            return;
        }
        setJourneyLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            await api.post('/user/start-followup', {
                crop_name: cropName,
                sowing_date: today
            });
            setShowConfirmModal(false);
            setSuccessMessage(`Journey for ${cropName} successfully activated! Redirecting to Dashboard...`);
            setTimeout(() => {
                window.location.hash = '#dashboard';
            }, 2000);
        } catch (err) {
            setError('Failed to start growth journey.');
        } finally {
            setJourneyLoading(false);
        }
    };

    const handleAnalyze = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.post('/recommend', inputs);
            setRecommendations(data || []);
            setStep('result');
        } catch (err) {
            setError('Failed to calibrate diagnostics. Please check your connection.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const pageTransition = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95 }
    };

    return (
        <div className="main-container section-padding">
            <AnimatePresence mode="wait">
                {step === 'routine' && selectedCrop ? (
                    <motion.div
                        key="routine"
                        variants={pageTransition}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ padding: '0.6rem', background: 'var(--primary-light)', borderRadius: '12px' }}>
                                    <Leaf color="var(--primary)" size={32} />
                                </div>
                            </div>
                            <h2 style={{ fontSize: '3.5rem' }}>Precision Crop Roadmap</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '650px', margin: '0.5rem auto 0' }}>Tailored Growth Blueprint for <strong>{selectedCrop.name}</strong> based on your unique farm parameters.</p>
                        </div>

                        <div style={{ maxWidth: '950px', margin: '0 auto' }}>
                            <div className="flex-between" style={{ marginBottom: 'var(--space-6)' }}>
                                <button
                                    onClick={() => setStep(recommendations.length > 1 ? 'result' : 'input')}
                                    className="btn btn-secondary"
                                    style={{ borderRadius: '100px', padding: '0.8rem 1.8rem', fontWeight: 700 }}
                                >
                                    <ArrowLeft size={20} /> {recommendations.length > 1 ? 'View Recommendations' : 'Adjust Coordinates'}
                                </button>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1.25rem', borderRadius: '100px', border: '1px solid var(--border)', fontSize: '0.85rem', fontWeight: 700 }}>
                                        <MapPin size={16} color="var(--primary)" /> {inputs.soil}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1.25rem', borderRadius: '100px', border: '1px solid var(--border)', fontSize: '0.85rem', fontWeight: 700 }}>
                                        <ThermometerSun size={16} color="#0984e3" /> {inputs.water}
                                    </div>
                                </div>
                            </div>

                            <motion.div
                                className="card"
                                style={{ background: 'linear-gradient(135deg, #fff9f2, #fffcf9)', border: '1px solid #ffe8cc', marginBottom: 'var(--space-7)', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', padding: '2rem' }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div style={{ background: '#ff922b', color: 'white', padding: '0.75rem', borderRadius: '12px', display: 'flex', boxShadow: '0 4px 12px rgba(255, 146, 43, 0.2)' }}>
                                    <Info size={28} />
                                </div>
                                <div>
                                    <h4 style={{ color: '#d9480f', fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 800 }}>Agronomist Feedback</h4>
                                    <p style={{ fontSize: '1rem', color: '#862e08', lineHeight: 1.7 }}>This High-Yield Protocol is optimized for <strong>{inputs.season}</strong>. Our models suggest a 15% increase in efficiency if irrigation is maintained strictly during the critical growth phases identified below.</p>
                                </div>
                            </motion.div>

                            <motion.div
                                className="card"
                                style={{ padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: 'none' }}
                            >
                                <div className="flex-between" style={{ padding: '2.5rem', background: '#fcfdfa', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                        <div style={{ background: 'var(--primary)', color: 'white', padding: '0.8rem', borderRadius: '16px', display: 'flex', boxShadow: 'var(--shadow-primary)' }}>
                                            <Calendar size={32} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.75rem' }}>Cultivation Cycle: {selectedCrop.name}</h3>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Match Accuracy: <span style={{ color: selectedCrop.suitability_percent > 80 ? 'var(--primary)' : '#f39c12' }}>{selectedCrop.suitability_percent}%</span> • Source: AI Diagnostics</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1.25rem' }}>
                                        <button className="btn btn-secondary" style={{ padding: '0.8rem', borderRadius: '14px' }} title="Save Routine"><Save size={24} /></button>
                                        <button className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '14px', fontSize: '0.95rem' }}>
                                            <Download size={20} /> Export Guide
                                        </button>
                                    </div>
                                </div>

                                <div className="routine-list">
                                    {(selectedCrop.routine || []).map((s, i) => (
                                        <motion.div
                                            key={i}
                                            className="routine-step"
                                            initial={{ opacity: 0, x: -30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + (i * 0.1) }}
                                            style={{ padding: '2.5rem', display: 'flex', gap: '2.5rem', borderBottom: i === selectedCrop.routine.length - 1 ? 'none' : '1px solid var(--border)', background: 'white' }}
                                            whileHover={{ x: 10, background: 'var(--primary-light)' }}
                                        >
                                            <div className="step-number" style={{ width: '60px', height: '60px', fontSize: '1.4rem', border: '2px solid rgba(26, 178, 100, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px', fontWeight: 800, color: 'var(--primary)' }}>{i + 1}</div>
                                            <div style={{ flex: 1 }}>
                                                <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                                                    <h4 style={{ color: 'var(--primary)', fontSize: '1.4rem', fontWeight: 800 }}>{s.period}</h4>
                                                    <div style={{ color: 'var(--primary)', opacity: 0.4 }}><Sparkles size={20} /></div>
                                                </div>
                                                <p style={{ color: 'var(--text)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>{s.title}</p>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '600px' }}>{s.desc}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {successMessage && (
                                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center', fontWeight: 700 }}>{successMessage}</div>
                            )}

                            <div style={{ display: 'flex', transition: 'var(--transition)', gap: '1.5rem', justifyContent: 'center', marginTop: 'var(--space-7)' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleStartJourney(selectedCrop.name)}
                                    disabled={journeyLoading}
                                    style={{ padding: '1rem 2.5rem', borderRadius: '100px', fontSize: '1.1rem', fontWeight: 800, boxShadow: 'var(--shadow-primary)' }}
                                >
                                    {journeyLoading ? 'Activating...' : 'Start This Growth Journey'} <Sparkles size={20} />
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setStep(recommendations.length > 1 ? 'result' : 'input')}
                                    style={{ padding: '1rem 2.5rem', borderRadius: '100px', fontSize: '1.1rem', fontWeight: 800 }}
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : step === 'result' ? (
                    <motion.div
                        key="result"
                        variants={pageTransition}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.5 }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: 'var(--space-7)' }}>
                            <h2 style={{ fontSize: '3.5rem' }}>Optimal Crop <span className="serif" style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Recommendations</span></h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>Based on your land's biological identity and seasonal context.</p>
                        </div>

                        <div className="crop-grid" style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            {!user && (
                                <motion.div
                                    className="card"
                                    style={{
                                        gridColumn: '1 / -1',
                                        background: 'linear-gradient(135deg, #e3fcf0, #f0fff4)',
                                        border: '2px dashed var(--primary)',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        marginBottom: '1rem'
                                    }}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <div style={{ background: 'var(--primary)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                        <Sparkles size={20} />
                                    </div>
                                    <h4 style={{ color: 'var(--text)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Premium Agronomy Intelligence</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                                        Registered farmers get exclusive access to <strong>Step-by-Step Cultivation Roadmaps</strong> and expert-verified growth protocols.
                                    </p>
                                    <button
                                        onClick={() => window.location.hash = '#auth'}
                                        className="btn btn-secondary"
                                        style={{ background: 'white', borderRadius: '100px', fontWeight: 800 }}
                                    >
                                        Create Free Account to Unlock
                                    </button>
                                </motion.div>
                            )}
                            {recommendations.map((rec, i) => (
                                <motion.div
                                    key={rec.name}
                                    className="card"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -10 }}
                                    style={{
                                        padding: '2.5rem',
                                        borderRadius: '24px',
                                        position: 'relative',
                                        border: rec.is_recommended ? '1px solid var(--border)' : '1px solid #fee2e2',
                                        background: rec.is_recommended ? 'white' : 'linear-gradient(to bottom right, #fff5f5, #ffffff)',
                                        textAlign: 'center'
                                    }}
                                >
                                    {rec.warning && (
                                        <div style={{
                                            background: '#ef4444',
                                            color: 'white',
                                            padding: '0.6rem 1rem',
                                            borderRadius: '12px',
                                            marginBottom: '1.5rem',
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.6rem',
                                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                                        }}>
                                            <Info size={18} /> {rec.warning}
                                        </div>
                                    )}

                                    <div style={{ background: rec.is_recommended ? 'var(--primary-light)' : '#fee2e2', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                        <Sprout size={32} color={rec.is_recommended ? 'var(--primary)' : '#ef4444'} />
                                    </div>

                                    <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{rec.name}</h3>

                                    <div style={{ marginBottom: '2rem' }}>
                                        <div className="flex-between" style={{ marginBottom: '0.6rem' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>Match Accuracy</span>
                                            <span style={{
                                                fontSize: '1.1rem',
                                                fontWeight: 900,
                                                color: rec.suitability_percent > 80 ? 'var(--primary)' : (rec.suitability_percent > 50 ? '#f39c12' : '#ef4444')
                                            }}>
                                                {rec.suitability_percent}%
                                            </span>
                                        </div>
                                        <div style={{ width: '100%', height: '10px', background: '#f1f2f6', borderRadius: '10px', overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${rec.suitability_percent}%` }}
                                                transition={{ duration: 1.2, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                                                style={{
                                                    height: '100%',
                                                    background: rec.suitability_percent > 80 ? 'linear-gradient(90deg, var(--primary), #51cf66)' : (rec.suitability_percent > 50 ? 'linear-gradient(90deg, #f39c12, #ffcc33)' : 'linear-gradient(90deg, #ef4444, #ff7675)'),
                                                    borderRadius: '10px'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (!user) {
                                                setError('🔒 Authentication Required: Please log in to unlock routines.');
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                return;
                                            }
                                            setSelectedCrop(rec);
                                            setStep('routine');
                                        }}
                                        className="btn btn-primary"
                                        style={{ width: '100%', borderRadius: '14px' }}
                                    >
                                        Unlock Full Roadmap <ChevronRight size={18} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
                            <button onClick={() => setStep('input')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}>
                                Reset Calibration
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="input"
                        variants={pageTransition}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.5 }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                            <h2 style={{ fontSize: '4rem', marginBottom: '1rem' }}>Smart Crop Advisor</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.3rem', maxWidth: '750px', margin: '0 auto' }}>Generate scientifically-backed cultivation plans calibrated to your specific land health metrics.</p>
                        </div>

                        <motion.div
                            className="card"
                            style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem', boxShadow: '0 30px 60px rgba(0,0,0,0.12)', border: 'none', borderRadius: 'var(--radius-xl)', background: 'white' }}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
                                <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '14px', display: 'flex', boxShadow: 'var(--shadow-sm)' }}>
                                    <MapPin size={32} color="var(--primary)" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.75rem' }}>Cultivation Diagnostics</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>Calibrating the engine for your land parameters.</p>
                                </div>
                            </div>

                            {error && (
                                <div style={{ background: '#fff5f5', color: '#ff7675', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center', fontWeight: 700 }}>{error}</div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem' }}>
                                {/* Left Column: Soils and Climate */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                    {/* Soil Type Selection */}
                                    <div>
                                        <label style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Mountain size={18} color="var(--primary)" /> Type of Soil
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                                            {['Alluvial', 'Red', 'Black Soil', 'Clay'].map(soil => (
                                                <motion.div
                                                    key={soil}
                                                    whileHover={{ y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setInputs({ ...inputs, soil })}
                                                    style={{
                                                        padding: '0.75rem',
                                                        borderRadius: '14px',
                                                        border: inputs.soil === soil ? '2.5px solid var(--primary)' : '1px solid var(--border)',
                                                        background: inputs.soil === soil ? 'var(--primary-light)' : 'white',
                                                        cursor: 'pointer',
                                                        textAlign: 'center',
                                                        transition: 'all 0.2s ease',
                                                        boxShadow: inputs.soil === soil ? 'var(--shadow-sm)' : 'none'
                                                    }}
                                                >
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: inputs.soil === soil ? 'var(--primary)' : 'var(--text)' }}>{soil}</div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Climate Selection */}
                                    <div>
                                        <label style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <ThermometerSun size={18} color="#0984e3" /> Climate or Rainfall
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                                            {['Moderate Climate', 'High Rainfall', 'Arid / Dry'].map(climate => (
                                                <motion.div
                                                    key={climate}
                                                    whileHover={{ y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setInputs({ ...inputs, water: climate })}
                                                    style={{
                                                        padding: '0.75rem',
                                                        borderRadius: '14px',
                                                        border: inputs.water === climate ? '2.5px solid #0984e3' : '1px solid var(--border)',
                                                        background: inputs.water === climate ? '#e1f5ff' : 'white',
                                                        cursor: 'pointer',
                                                        textAlign: 'center',
                                                        transition: 'all 0.2s ease',
                                                        boxShadow: inputs.water === climate ? 'var(--shadow-sm)' : 'none'
                                                    }}
                                                >
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: inputs.water === climate ? '#0984e3' : 'var(--text)' }}>{climate.split(' ')[0]}</div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Season and Target Crop */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                    {/* Season Selection */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <label style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                                <Calendar size={18} color="var(--primary)" /> Growth Season
                                            </label>
                                            {!showSeasonGrid && (
                                                <button
                                                    onClick={() => setShowSeasonGrid(true)}
                                                    style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                                                >
                                                    Change Season
                                                </button>
                                            )}
                                        </div>

                                        {!showSeasonGrid ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                style={{
                                                    padding: '1.25rem',
                                                    background: '#f8fafc',
                                                    borderRadius: '16px',
                                                    border: '1px solid var(--border)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem'
                                                }}
                                            >
                                                <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '10px' }}>
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>{inputs.season.split(' ')[0]}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>AUTO-DETECTED FOR {new Date().toLocaleString('default', { month: 'long' }).toUpperCase()}</div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}
                                            >
                                                {['Kharif (Monsoon)', 'Rabi (Winter)', 'Zaid (Summer)'].map(season => (
                                                    <motion.div
                                                        key={season}
                                                        whileHover={{ y: -2 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setInputs({ ...inputs, season })}
                                                        style={{
                                                            padding: '0.75rem',
                                                            borderRadius: '14px',
                                                            border: inputs.season === season ? '2.5px solid var(--primary)' : '1px solid var(--border)',
                                                            background: inputs.season === season ? 'var(--primary-light)' : 'white',
                                                            cursor: 'pointer',
                                                            textAlign: 'center',
                                                            transition: 'all 0.2s ease',
                                                            boxShadow: inputs.season === season ? 'var(--shadow-sm)' : 'none'
                                                        }}
                                                    >
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: inputs.season === season ? 'var(--primary)' : 'var(--text)' }}>{season.split(' ')[0]}</div>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Category Selection */}
                                    <div>
                                        <label style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Filter size={18} color="var(--primary)" /> Preferred Crop Type
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                                            {['All', 'Grain', 'Fruit', 'Vegetable', 'Commercial'].map(cat => (
                                                <motion.div
                                                    key={cat}
                                                    whileHover={{ y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setInputs({ ...inputs, category: cat })}
                                                    style={{
                                                        padding: '0.75rem',
                                                        borderRadius: '14px',
                                                        border: inputs.category === cat ? '2.5px solid var(--primary)' : '1px solid var(--border)',
                                                        background: inputs.category === cat ? 'var(--primary-light)' : 'white',
                                                        cursor: 'pointer',
                                                        textAlign: 'center',
                                                        transition: 'all 0.2s ease',
                                                        boxShadow: inputs.category === cat ? 'var(--shadow-sm)' : 'none'
                                                    }}
                                                >
                                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: inputs.category === cat ? 'var(--primary)' : 'var(--text)' }}>{cat}</div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Targeted Crop */}
                                    <div>
                                        <label style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Sprout size={18} color="var(--primary)" /> Targeted Crop
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                list="crop-suggestions"
                                                value={inputs.crop}
                                                onChange={(e) => setInputs({ ...inputs, crop: e.target.value })}
                                                placeholder="Search crop..."
                                                style={{
                                                    padding: '1rem',
                                                    fontSize: '1rem',
                                                    borderRadius: '14px',
                                                    border: '1px solid var(--border)',
                                                    background: 'white',
                                                    width: '100%',
                                                    fontWeight: 600,
                                                    transition: 'var(--transition)'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                            />
                                            <datalist id="crop-suggestions">
                                                {allCrops
                                                    .filter(c => inputs.category === 'All' || c.category === inputs.category)
                                                    .map(c => <option key={c.name} value={c.name} />)}
                                            </datalist>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '3.5rem', textAlign: 'center' }}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleAnalyze}
                                    disabled={loading}
                                    className="btn btn-primary"
                                    style={{
                                        padding: '1.25rem 4rem',
                                        fontSize: '1.2rem',
                                        borderRadius: '100px',
                                        fontWeight: 900,
                                        boxShadow: '0 20px 40px rgba(26, 178, 100, 0.3)',
                                        border: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '1rem'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={24} /> Calibrating...
                                        </>
                                    ) : (
                                        <>
                                            Analyze Land Potential <ArrowRight size={24} />
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <footer style={{ marginTop: 'var(--space-8)', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-7)' }}>
                <p>© 2026 AgroAssist Intel. Comprehensive Agronomic Intelligence.</p>
            </footer>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spinning { animation: spin 1.5s linear infinite; }
            `}</style>
            {/* Journey Conflict Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '1.5rem'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="card"
                            style={{
                                maxWidth: '500px',
                                width: '100%',
                                padding: '2.5rem',
                                textAlign: 'center',
                                border: '2px solid #ff7675',
                                background: 'white',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: '#fff5f5',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                <AlertTriangle size={40} color="#ff7675" />
                            </div>

                            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Active Journey Detected</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                                You are already following a growth journey for <strong>{activeJourney?.crop_name}</strong>. Starting a new journey will permanently replace your current one.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <button
                                    onClick={() => handleStartJourney(selectedCrop.name, true)}
                                    className="btn btn-primary"
                                    style={{ background: '#ff7675', border: 'none', padding: '1rem' }}
                                    disabled={journeyLoading}
                                >
                                    {journeyLoading ? <Loader2 className="animate-spin" size={20} /> : 'Yes, Replace & Start New'}
                                </button>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="btn btn-secondary"
                                    style={{ padding: '1rem' }}
                                >
                                    No, Keep My Current Journey
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Advisor;
