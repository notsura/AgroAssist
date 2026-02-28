import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    Cloud,
    Wind,
    Droplets,
    TrendingUp,
    CalendarClock,
    AlertTriangle,
    ChevronRight,
    Sun,
    CloudRain,
    CloudSun,
    MessageSquare,
    Activity,
    TrendingDown,
    CheckCircle2,
    Calendar,
    Sparkles,
    Timer,
    ArrowRight,
    MapPin,
    ChevronDown,
    ChevronUp,
    Leaf,
    Trophy,
    Archive,
    RotateCcw,
    Users,
    BookOpen,
    Sprout,
    Bot
} from 'lucide-react';
import { api } from '../services/api';

const Dashboard = () => {
    const { t } = useTranslation();
    const [status, setStatus] = useState(null);
    const [weather, setWeather] = useState(null);
    const [marketItems, setMarketItems] = useState([]);
    const [selectedStepIndex, setSelectedStepIndex] = useState(0); // Track selected timeline node
    const [dailyCompletedTasks, setDailyCompletedTasks] = useState(() => {
        const saved = localStorage.getItem('agro_daily_tasks');
        return saved ? JSON.parse(saved) : [];
    }); // Persistent state for daily snapshot ticks
    const [isLoading, setIsLoading] = useState(true);
    const [alerts, setAlerts] = useState([]);
    const [activePopupAlert, setActivePopupAlert] = useState(null);
    const user = JSON.parse(localStorage.getItem('agro_user'));

    useEffect(() => {
        fetchActiveStatus();
        fetchWeather();
        fetchMarketIndex();
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const data = await api.get('/user/alerts');
            setAlerts(data || []);
            console.log("ALERTS_FETCHED:", data);

            // Logic for triggering the real-time popup
            if (data && data.length > 0) {
                const hiddenAlerts = JSON.parse(localStorage.getItem('agro_hidden_alerts') || '[]');
                const snoozedAlerts = JSON.parse(localStorage.getItem('agro_snoozed_alerts') || '{}');
                const lastNotifiedId = sessionStorage.getItem('agro_last_notified_alert_id');

                console.log("DEBUG_POPUP_STATE:", {
                    hiddenAlerts,
                    snoozedAlerts,
                    lastNotifiedId,
                    totalAlerts: data.length
                });

                const now = Date.now();

                // Find the first alert that isn't hidden or currently snoozed
                const alertToPop = data.find(a => {
                    const isHidden = hiddenAlerts.includes(a._id);
                    const isSnoozed = snoozedAlerts[a._id] && snoozedAlerts[a._id] > now;
                    console.log(`Checking alert ${a._id}: hidden=${isHidden}, snoozed=${isSnoozed}`);
                    if (isHidden) return false;
                    if (isSnoozed) return false;
                    return true;
                });

                console.log("ALERT_TO_POP_RESULT:", alertToPop);

                if (alertToPop && alertToPop._id !== lastNotifiedId) {
                    console.log("TRIGGERING_MODAL_FOR:", alertToPop._id);
                    setActivePopupAlert(alertToPop);
                } else if (alertToPop) {
                    console.log("SUPPRESSED: Alert already notified in this session.", lastNotifiedId);
                }
            }
        } catch (error) {
            console.error("Failed to fetch alerts", error);
        }
    };

    const handleSnooze = (id) => {
        const snoozedAlerts = JSON.parse(localStorage.getItem('agro_snoozed_alerts') || '{}');
        const sixHours = 6 * 60 * 60 * 1000;
        snoozedAlerts[id] = Date.now() + sixHours;
        localStorage.setItem('agro_snoozed_alerts', JSON.stringify(snoozedAlerts));
        setActivePopupAlert(null);
    };

    const handleDontShowAgain = (id) => {
        const hiddenAlerts = JSON.parse(localStorage.getItem('agro_hidden_alerts') || '[]');
        if (!hiddenAlerts.includes(id)) {
            hiddenAlerts.push(id);
        }
        localStorage.setItem('agro_hidden_alerts', JSON.stringify(hiddenAlerts));
        setActivePopupAlert(null);
    };

    const handleDismiss = () => {
        if (activePopupAlert) {
            sessionStorage.setItem('agro_last_notified_alert_id', activePopupAlert._id);
        }
        setActivePopupAlert(null);
    };

    useEffect(() => {
        localStorage.setItem('agro_daily_tasks', JSON.stringify(dailyCompletedTasks));
    }, [dailyCompletedTasks]);

    const fetchMarketIndex = async () => {
        try {
            const data = await api.get('/market');
            setMarketItems(data || []);
        } catch (error) {
            console.error("Failed to fetch market index", error);
        }
    };

    const fetchWeather = async () => {
        const getWeatherData = async (params = '') => {
            try {
                const data = await api.get(`/weather${params}`);
                setWeather(data);
            } catch (error) {
                console.error("Failed to fetch weather", error);
            }
        };

        // Priority 1: Browser GPS
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude: lat, longitude: lon } = position.coords;
                    await getWeatherData(`?lat=${lat}&lon=${lon}`);
                },
                async (error) => {
                    console.warn("Geolocation denied or error:", error.message);
                    // Priority 2: User District
                    if (user && user.district) {
                        await getWeatherData(`?district=${encodeURIComponent(user.district)}`);
                    } else {
                        // Priority 3: Default Fallback (handled by backend if no params)
                        await getWeatherData();
                    }
                },
                { timeout: 10000 }
            );
        } else {
            // Fallback for browsers without geolocation
            if (user && user.district) {
                await getWeatherData(`?district=${encodeURIComponent(user.district)}`);
            } else {
                await getWeatherData();
            }
        }
    };

    const fetchActiveStatus = async () => {
        setIsLoading(true);
        try {
            const data = await api.get(`/user/active-status?t=${Date.now()}`);
            console.log("DASHBOARD_FETCH_STATUS:", data);
            setStatus(data);
            if (data.active && data.routine) {
                // Initialize selectedStepIndex to the current active step based on days_since_sowing
                const activeStepIdx = data.routine?.findIndex(s => data.days_since_sowing >= s.start_day && data.days_since_sowing <= s.end_day);
                setSelectedStepIndex(activeStepIdx !== -1 && activeStepIdx !== undefined ? activeStepIdx : 0);
            }
        } catch (error) {
            console.error("Failed to fetch active status", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTask = async (taskTitle) => {
        try {
            const data = await api.post('/user/toggle-task', { task_title: taskTitle });
            setStatus(prev => ({ ...prev, completed_tasks: data.completed_tasks }));
        } catch (error) {
            console.error("Failed to toggle task", error);
        }
    };

    const handleCompleteJourney = async () => {
        try {
            await api.post('/user/complete-journey');
            fetchActiveStatus();
            window.location.hash = '#history';
        } catch (error) {
            console.error("Failed to complete journey", error);
        }
    };

    const getWeatherIcon = (condition) => {
        const c = condition?.toLowerCase();
        if (c?.includes('clear')) return <Sun size={20} color="#f1c40f" />;
        if (c?.includes('cloud')) return <CloudSun size={20} color="#f39c12" />;
        if (c?.includes('rain') || c?.includes('drizzle')) return <CloudRain size={20} color="#3498db" />;
        if (c?.includes('thunder')) return <Cloud size={20} color="#95a5a6" />;
        return <Cloud size={20} color="#bdc3c7" />;
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
    };

    const renderHarvestCompletion = () => {
        if (!status || !status.active || !status.routine || status.routine.length === 0) return null;
        const lastStep = status.routine[status.routine.length - 1];
        const isHarvestCompleted = status.days_since_sowing > (lastStep?.end_day || 0);

        if (!isHarvestCompleted) return null;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card"
                style={{
                    padding: '4rem 2rem',
                    background: 'white',
                    borderRadius: '32px',
                    border: '2px solid var(--primary)',
                    textAlign: 'center',
                    boxShadow: '0 20px 50px rgba(26, 178, 100, 0.1)',
                    marginBottom: '3rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Celebration Decorations */}
                <div style={{ position: 'absolute', top: -20, left: -20, opacity: 0.05, transform: 'rotate(-15deg)' }}>
                    <Trophy size={200} color="var(--primary)" />
                </div>
                <div style={{ position: 'absolute', bottom: -20, right: -20, opacity: 0.05, transform: 'rotate(15deg)' }}>
                    <Sparkles size={200} color="var(--primary)" />
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ background: 'var(--primary-light)', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 10px 25px rgba(26, 178, 100, 0.2)' }}>
                        <Trophy size={50} color="var(--primary)" />
                    </div>

                    <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Harvest <span style={{ color: 'var(--primary)' }}>Complete!</span></h2>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                        Congratulations! You've successfully completed the {status.crop_name} cultivation journey in {status.days_since_sowing} days.
                    </p>

                    <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', textAlign: 'left', marginBottom: '3rem' }}>
                        <div className="card" style={{ padding: '2rem', background: '#f8fafc' }}>
                            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                <div style={{ background: 'white', padding: '0.6rem', borderRadius: '12px' }}>
                                    <Sparkles color="var(--primary)" size={24} />
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>POST-HARVEST GUIDE</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <h5 style={{ fontWeight: 800, marginBottom: '0.25rem', fontSize: '0.9rem' }}>📦 Storage Suggestions</h5>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{status.post_harvest?.storage || "Ensure dry and ventilated storage conditions to maintain yield quality."}</p>
                                </div>
                                <div>
                                    <h5 style={{ fontWeight: 800, marginBottom: '0.25rem', fontSize: '0.9rem' }}>🧹 Field Cleaning</h5>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{status.post_harvest?.cleaning || "Clear all crop residue to prevent pest carryover for the next season."}</p>
                                </div>
                                <div>
                                    <h5 style={{ fontWeight: 800, marginBottom: '0.25rem', fontSize: '0.9rem' }}>🌱 Soil Preparation</h5>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{status.post_harvest?.soil_prep || "Rest and enrich the soil with organic compost before the next sowing."}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '2rem', background: '#f8fafc' }}>
                            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                <div style={{ background: 'white', padding: '0.6rem', borderRadius: '12px' }}>
                                    <Activity color="var(--primary)" size={24} />
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>NEXT ACTIONS</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <button onClick={() => window.location.hash = '#advisor'} className="btn btn-primary" style={{ width: '100%', justifyContent: 'flex-start', padding: '1rem', borderRadius: '12px' }}>
                                    <Sprout size={18} style={{ marginRight: '0.75rem' }} /> Start New Journey
                                </button>
                                <button onClick={() => window.location.hash = '#crops'} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '1rem', borderRadius: '12px' }}>
                                    <BookOpen size={18} style={{ marginRight: '0.75rem' }} /> Explore Crop Library
                                </button>
                                <button onClick={() => window.location.hash = '#community'} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '1rem', borderRadius: '12px' }}>
                                    <Users size={18} style={{ marginRight: '0.75rem' }} /> Visit Community Hub
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleCompleteJourney}
                        className="btn btn-primary"
                        style={{ padding: '1.25rem 4rem', borderRadius: '100px', fontSize: '1.1rem', fontWeight: 800, boxShadow: 'var(--shadow-primary)' }}
                    >
                        Archive Journey & Close
                    </button>
                    <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Archiving will move this journey to your <b>Farming History</b>.
                    </p>
                </div>
            </motion.div>
        );
    };

    if (isLoading) {
        return (
            <div className="main-container section-padding" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '600px' }}>
                <Activity className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div className="main-container section-padding">
            <motion.header
                style={{ marginBottom: 'var(--space-7)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.5rem', background: 'var(--primary-light)', borderRadius: '10px' }}>
                            <Activity color="var(--primary)" size={20} />
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>{t('dashboard.command_center')}</span>
                    </div>
                    <h2 style={{ fontSize: '2.5rem' }}>{t('dashboard.greeting')} <span className="serif" style={{ color: 'var(--primary)', fontStyle: 'italic' }}>{user?.fullname || 'Farmer'}</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{status?.active ? t('dashboard.journey_active', { crop: status.crop_name }) : t('dashboard.journey_ready')}</p>
                    {status?.error && (
                        <p style={{ color: '#ff7675', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 600 }}>⚠️ Backend Alert: {status.error}</p>
                    )}
                </div>

                {weather && (
                    <div style={{ textAlign: 'right', paddingBottom: '0.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <MapPin size={14} color="var(--primary)" /> {weather.location}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '0.25rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)' }}>{weather.current.temp}</div>
                            <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '12px' }}>
                                {getWeatherIcon(weather.current.condition)}
                            </div>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>{weather.current.condition} • {weather.current.wind} Wind</div>
                    </div>
                )}
            </motion.header>

            <div className="dashboard-grid">
                <div className="main-col">
                    {/* Alerts Panel */}
                    <AnimatePresence>
                        {alerts.length > 0 && (
                            <div id="alerts-section" style={{ marginBottom: '2.5rem' }}>
                                {alerts.map(a => {
                                    const isCritical = a.severity?.toLowerCase() === 'critical' || a.severity?.toLowerCase() === 'high';
                                    const bg = isCritical ? '#fee2e2' : '#fef3c7';
                                    const color = isCritical ? '#ef4444' : '#d97706';
                                    return (
                                        <motion.div
                                            key={a._id}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="card"
                                            style={{ background: bg, border: `1px solid ${color}40`, padding: '1.5rem', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', borderLeft: `4px solid ${color}` }}
                                        >
                                            <div style={{ background: 'white', padding: '0.5rem', borderRadius: '50%', color: color, display: 'flex', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                                <AlertTriangle size={24} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div className="flex-between" style={{ marginBottom: '0.4rem' }}>
                                                    <h4 style={{ color: color, fontSize: '1.1rem', margin: 0 }}>{a.title}</h4>
                                                    <span className="badge" style={{ background: 'white', color: color, fontSize: '0.75rem', fontWeight: 800 }}>{a.severity} Risk</span>
                                                </div>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
                                                    {a.message}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </AnimatePresence>

                    {renderHarvestCompletion()}
                    {status?.active ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="card"
                            style={{ background: 'linear-gradient(135deg, #1ab264, #158f50)', color: 'white', border: 'none', padding: '3rem', position: 'relative', overflow: 'hidden', marginBottom: '2.5rem' }}
                        >
                            <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}>
                                <Activity size={240} />
                            </div>

                            <div className="flex-between" style={{ position: 'relative', zIndex: 1, marginBottom: '2rem' }}>
                                <div>
                                    <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1.25rem' }}>{t('dashboard.active_journey_badge')}</span>
                                    <h3 style={{ fontSize: '3rem', color: 'white', marginTop: '1rem' }}>{status.crop_name}</h3>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>{t('dashboard.growth_day')}</div>
                                    <div style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1 }}>{status.days_since_sowing}</div>
                                </div>
                            </div>

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div className="flex-between" style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>
                                    <span>{t('dashboard.harvest_progress')}</span>
                                    <span>{Math.min(100, Math.round((status.days_since_sowing / 120) * 100))}%</span>
                                </div>
                                <div style={{ height: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: '100px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (status.days_since_sowing / 120) * 100)}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        style={{ height: '100%', background: 'white', borderRadius: '100px', boxShadow: '0 0 20px rgba(255,255,255,0.5)' }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="card"
                            style={{ background: 'white', border: '1px dashed var(--primary)', padding: '3rem', textAlign: 'center', marginBottom: '2.5rem' }}
                        >
                            <div style={{ background: 'var(--primary-light)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Sparkles size={40} color="var(--primary)" />
                            </div>
                            <h3 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>{t('dashboard.no_journey_title')}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>{t('dashboard.no_journey_desc')}</p>

                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                                <button onClick={() => window.location.hash = '#advisor'} className="btn btn-primary" style={{ padding: '0.8rem 2rem', borderRadius: '100px' }}>
                                    {t('dashboard.btn_launch_advisor')}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {status?.active && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                            <motion.div className="card" whileHover={{ y: -5 }} style={{ border: '2px solid var(--primary)', padding: '2rem' }}>
                                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ background: 'var(--primary-light)', padding: '0.6rem', borderRadius: '12px' }}>
                                        <CheckCircle2 color="var(--primary)" size={24} />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>{t('dashboard.todays_missions')}</span>
                                </div>
                                {status.current_task ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div
                                            key={status.current_task.title}
                                            onClick={() => toggleTask(status.current_task.title)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '1rem',
                                                cursor: 'pointer',
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                background: status.completed_tasks?.includes(status.current_task.title) ? 'var(--primary-light)' : 'transparent',
                                                transition: 'all 0.2s ease',
                                                border: '1px solid transparent',
                                                borderColor: status.completed_tasks?.includes(status.current_task.title) ? 'var(--primary)' : 'transparent'
                                            }}
                                        >
                                            <div style={{
                                                minWidth: '24px',
                                                height: '24px',
                                                borderRadius: '6px',
                                                border: '2px solid var(--primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: status.completed_tasks?.includes(status.current_task.title) ? 'var(--primary)' : 'white'
                                            }}>
                                                {status.completed_tasks?.includes(status.current_task.title) && <CheckCircle2 size={16} color="white" />}
                                            </div>
                                            <div>
                                                <h4 style={{
                                                    fontSize: '1.1rem',
                                                    marginBottom: '0.25rem',
                                                    textDecoration: status.completed_tasks?.includes(status.current_task.title) ? 'line-through' : 'none',
                                                    color: status.completed_tasks?.includes(status.current_task.title) ? 'var(--text-muted)' : 'var(--text)'
                                                }}>{status.current_task.title}</h4>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{status.current_task.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h4 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Growth Phase</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>Continue regular monitoring and water management.</p>
                                    </>
                                )}
                            </motion.div>

                            <motion.div className="card" whileHover={{ y: -5 }} style={{ padding: '2rem' }}>
                                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ background: '#fef3c7', padding: '0.6rem', borderRadius: '12px' }}>
                                        <Timer color="#d97706" size={24} />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706' }}>{t('dashboard.upcoming_milestone')}</span>
                                </div>
                                {status.next_task ? (
                                    <>
                                        <h4 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{status.next_task.title}</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>Estimated in {status.next_task.start_day - status.days_since_sowing} days.</p>
                                    </>
                                ) : (
                                    <>
                                        <h4 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Final Stretch</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>Preparing for the harvest phase.</p>
                                    </>
                                )}
                            </motion.div>
                        </div>
                    )}

                    <div className="flex-between" style={{ marginBottom: 'var(--space-5)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem' }}>
                            <Calendar size={24} color="var(--primary)" /> {t('dashboard.growth_roadmap')}
                        </h3>
                    </div>

                    <div className="card" style={{ padding: '2.5rem', marginBottom: '3rem', background: '#f8fafc', border: '1px solid var(--border)' }}>
                        {status?.active ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                {/* Horizontal Scroll Timeline */}
                                <div style={{
                                    display: 'flex',
                                    gap: '4rem',
                                    overflowX: 'auto',
                                    padding: '2rem 1rem',
                                    scrollSnapType: 'x mandatory',
                                    scrollbarWidth: 'none',
                                    position: 'relative'
                                }}>
                                    {/* Timeline Connector Line (Background) */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '4rem',
                                        right: '4rem',
                                        height: '4px',
                                        background: 'var(--border)',
                                        zIndex: 0,
                                        transform: 'translateY(-50%)',
                                        borderRadius: '100px'
                                    }} />

                                    {/* Timeline Connector Line (Progress) */}
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: (() => {
                                                const totalSteps = status.routine?.length || 0;
                                                if (totalSteps <= 1) return '0%';

                                                // Find the last completed step
                                                const lastCompletedIdx = (status.routine || []).findIndex(s => status.days_since_sowing < s.start_day) - 1;

                                                if (lastCompletedIdx === -2) return '100%'; // All steps completed
                                                if (lastCompletedIdx === -1) {
                                                    // In the first step or before it
                                                    const firstStep = status.routine[0];
                                                    if (status.days_since_sowing < firstStep.start_day) return '0%';
                                                    // Progress within the node itself? No, the line starts AFTER the first node.
                                                    // Let's stay at 0% until first node is passed.
                                                    return '0%';
                                                }

                                                // Calculate progress between nodes
                                                const currentStep = status.routine[lastCompletedIdx];
                                                const nextStep = status.routine[lastCompletedIdx + 1];

                                                // Interpolate between current node and next node
                                                // Progress starts at start_day of current step and ends at start_day of next step
                                                const segmentStartDay = currentStep.start_day;
                                                const segmentEndDay = nextStep.start_day;

                                                let segmentProgress = 0;
                                                if (status.days_since_sowing >= segmentEndDay) {
                                                    segmentProgress = 1;
                                                } else if (status.days_since_sowing > segmentStartDay) {
                                                    segmentProgress = (status.days_since_sowing - segmentStartDay) / (segmentEndDay - segmentStartDay);
                                                }

                                                const totalProgress = ((lastCompletedIdx + segmentProgress) / (totalSteps - 1)) * 100;
                                                return `${Math.min(100, Math.max(0, totalProgress))}%`;
                                            })()
                                        }}
                                        transition={{ duration: 1.5, ease: "easeInOut" }}
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '4rem',
                                            height: '4px',
                                            background: 'var(--primary)',
                                            zIndex: 0,
                                            transform: 'translateY(-50%)',
                                            borderRadius: '100px',
                                            boxShadow: '0 0 10px rgba(26, 178, 100, 0.4)'
                                        }}
                                    />

                                    {(status.routine || []).map((step, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setSelectedStepIndex(idx)}
                                            style={{
                                                flex: '0 0 auto',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                zIndex: 1,
                                                scrollSnapAlign: 'center',
                                                opacity: (status.days_since_sowing && step.end_day && status.days_since_sowing > step.end_day) ? 0.6 : 1,
                                                transition: 'all 0.3s ease',
                                                transform: selectedStepIndex === idx ? 'scale(1.1)' : 'scale(1)'
                                            }}
                                        >
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '50%',
                                                background: selectedStepIndex === idx ? 'var(--primary)' : (status.days_since_sowing >= step.start_day ? 'var(--primary-light)' : 'white'),
                                                border: '3px solid var(--primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: selectedStepIndex === idx ? '0 0 20px rgba(26, 178, 100, 0.4)' : 'none',
                                                transition: 'all 0.3s ease'
                                            }}>
                                                {(status.days_since_sowing && step.end_day && status.days_since_sowing > step.end_day) ? (
                                                    <CheckCircle2 size={24} color={selectedStepIndex === idx ? "white" : "var(--primary)"} />
                                                ) : (
                                                    <Leaf size={24} color={selectedStepIndex === idx ? "white" : "var(--primary)"} />
                                                )}
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Day {step.start_day}</div>
                                                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: selectedStepIndex === idx ? 'var(--primary)' : 'var(--text)', whiteSpace: 'nowrap' }}>{step.title}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Dynamic Detail Card */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`${status.crop_name}-${selectedStepIndex}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        style={{
                                            background: 'white',
                                            padding: '2rem',
                                            borderRadius: '24px',
                                            boxShadow: 'var(--shadow-md)',
                                            border: '1px solid var(--border)'
                                        }}
                                    >
                                        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                            <div>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Phase Analysis</span>
                                                <h4 style={{ fontSize: '1.8rem', marginTop: '0.25rem' }}>{status.routine?.[selectedStepIndex]?.title || 'Phase Overview'}</h4>
                                            </div>
                                            <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.6rem 1.2rem', borderRadius: '100px', fontWeight: 800, fontSize: '0.9rem' }}>
                                                Day {status.routine?.[selectedStepIndex]?.start_day || 1} - {status.routine?.[selectedStepIndex]?.end_day || '?'}
                                            </div>
                                        </div>

                                        <p style={{ fontSize: '1.1rem', color: 'var(--text)', lineHeight: 1.7, marginBottom: '2rem' }}>
                                            {status.routine?.[selectedStepIndex]?.desc || 'Growth intelligence is being calibrated for this crop variety.'}
                                        </p>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                            {/* Farming Protocol Section */}
                                            <div style={{
                                                background: '#f8fafc',
                                                padding: '1.5rem',
                                                borderRadius: '16px',
                                                display: 'flex',
                                                gap: '1.25rem',
                                                alignItems: 'flex-start',
                                                borderLeft: '4px solid var(--primary)'
                                            }}>
                                                <Sparkles size={24} color="var(--primary)" style={{ marginTop: '0.2rem' }} />
                                                <div>
                                                    <h5 style={{ fontWeight: 800, marginBottom: '0.4rem', fontSize: '1rem' }}>Farming Protocol</h5>
                                                    <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                                        {status.routine?.[selectedStepIndex]?.protocol || "Follow standard protocol for irrigation and nutrient management to maintain healthy growth."}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Risk Alert Section */}
                                            {status.routine[selectedStepIndex]?.risk && (
                                                <div style={{
                                                    background: '#fff5f5',
                                                    padding: '1.5rem',
                                                    borderRadius: '16px',
                                                    display: 'flex',
                                                    gap: '1.25rem',
                                                    alignItems: 'flex-start',
                                                    borderLeft: '4px solid #ff7675'
                                                }}>
                                                    <AlertTriangle size={24} color="#ff7675" style={{ marginTop: '0.2rem' }} />
                                                    <div>
                                                        <h5 style={{ fontWeight: 800, marginBottom: '0.4rem', fontSize: '1rem', color: '#d63031' }}>⚠ Common Risks</h5>
                                                        <div style={{ fontSize: '0.95rem', color: '#ff7675', lineHeight: 1.5, fontWeight: 600 }}>
                                                            • {status.routine?.[selectedStepIndex]?.risk}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>No roadmap available yet. Start a journey!</p>
                        )}
                    </div>
                </div>

                <div className="sidebar-col">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex-between" style={{ marginBottom: 'var(--space-6)' }}>
                            <h3 style={{ fontSize: '1.5rem' }}>{t('dashboard.market_index')}</h3>
                            <button onClick={() => window.location.hash = '#market'} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>{t('dashboard.view_market')}</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-7)' }}>
                            {marketItems && marketItems.length > 0 ? (
                                (() => {
                                    // Prioritize the active crop if it exists in market items
                                    const activeCropItem = marketItems.find(m => status?.crop_name && m.product?.toLowerCase().includes(status.crop_name.toLowerCase()));
                                    const others = marketItems.filter(m => m !== activeCropItem && m.category === 'Commodities').slice(0, activeCropItem ? 1 : 2);
                                    const displayItems = activeCropItem ? [activeCropItem, ...others] : others;

                                    return displayItems.map((m, idx) => (
                                        <div key={idx} className="card" style={{ padding: '1.25rem', border: (status?.active && m.product?.toLowerCase().includes(status.crop_name.toLowerCase())) ? '1px solid var(--primary)' : '1px solid var(--border)' }}>
                                            <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '10px' }}>
                                                        <TrendingUp size={18} color="var(--primary)" />
                                                    </div>
                                                    <span style={{ fontWeight: 800 }}>{m.product}</span>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem',
                                                    color: m.trend === 'Bullish' ? 'var(--primary)' : m.trend === 'Bearish' ? '#ff7675' : 'var(--text-muted)',
                                                    fontWeight: 800,
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {m.trend === 'Bullish' ? <TrendingUp size={16} /> : (m.trend === 'Bearish' ? <TrendingDown size={16} /> : <Activity size={16} />)}
                                                    {m.trend || 'Stable'}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                                                {m.price?.split('/')[0] || 'N/A'}
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                                                    / {m.price?.split('/')[1] || 'unit'}
                                                </span>
                                            </div>
                                            {status?.active && m.product?.toLowerCase().includes(status.crop_name.toLowerCase()) && (
                                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.5rem', textTransform: 'uppercase' }}>Targeted Insight</div>
                                            )}
                                        </div>
                                    ));
                                })()
                            ) : (
                                <div style={{
                                    padding: '2rem',
                                    textAlign: 'center',
                                    background: '#f8fafc',
                                    borderRadius: '16px',
                                    border: '1px dashed var(--border)'
                                }}>
                                    <Activity size={24} color="var(--primary)" className="spinning" style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                        Syncing live market feeds...
                                    </p>
                                </div>
                            )}
                        </div>

                        {status?.active && status.current_task?.daily_routine && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="card"
                                style={{
                                    padding: '2rem',
                                    marginBottom: 'var(--space-7)',
                                    background: 'var(--primary-light)',
                                    border: '1px solid var(--primary)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05, transform: 'rotate(-20deg)' }}>
                                    <Activity size={100} color="var(--primary)" />
                                </div>
                                <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                                    <div style={{ background: 'white', padding: '0.6rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(26, 178, 100, 0.1)' }}>
                                        <Activity color="var(--primary)" size={18} />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('dashboard.daily_snapshot')}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    {(status.current_task?.daily_routine || []).map((task, idx) => {
                                        const isDone = dailyCompletedTasks.includes(task);
                                        return (
                                            <div
                                                key={idx}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    cursor: 'pointer',
                                                    padding: '0.4rem',
                                                    borderRadius: '8px',
                                                    transition: 'all 0.2s ease',
                                                    background: isDone ? 'rgba(26, 178, 100, 0.05)' : 'transparent'
                                                }}
                                                onClick={() => {
                                                    setDailyCompletedTasks(prev =>
                                                        prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task]
                                                    );
                                                }}
                                            >
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: isDone ? 'var(--primary)' : 'white',
                                                    border: `1px solid ${isDone ? 'var(--primary)' : 'var(--border)'}`,
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    boxShadow: isDone ? '0 4px 10px rgba(26, 178, 100, 0.2)' : 'none'
                                                }}>
                                                    <CheckCircle2 color={isDone ? "white" : "#cbd5e1"} size={14} />
                                                </div>
                                                <span style={{
                                                    fontSize: '0.9rem',
                                                    color: isDone ? 'var(--text-muted)' : 'var(--text)',
                                                    fontWeight: 600,
                                                    textDecoration: isDone ? 'line-through' : 'none',
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                    {task}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        <div className="flex-between" style={{ marginBottom: 'var(--space-6)' }}>
                            <h3 style={{ fontSize: '1.5rem' }}>{t('dashboard.local_weather')}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <MapPin size={14} /> {weather?.location || 'Saharanpur'}
                            </div>
                        </div>

                        {weather?.forecast ? (
                            <div className="forecast-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '2.5rem' }}>
                                {weather.forecast.map((f, i) => (
                                    <div key={i} style={{ textAlign: 'center', padding: '0.5rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>{f.day}</div>
                                        <div style={{ margin: '0.4rem 0' }}>{getWeatherIcon(f.condition)}</div>
                                        <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{f.temp}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="card" style={{ padding: '1rem', textAlign: 'center', marginBottom: '2.5rem', color: 'var(--text-muted)' }}>
                                {weather?.error ? 'Weather unavailable' : 'Loading forecast...'}
                            </div>
                        )}

                        <motion.div
                            className="card"
                            style={{ textAlign: 'center', background: 'linear-gradient(135deg, #2c3e50, #000000)', color: 'white', border: 'none', padding: '2.5rem' }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div style={{ background: 'rgba(255,255,255,0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <Bot size={32} color="#00d2ff" />
                            </div>
                            <h4 style={{ fontSize: '1.4rem', color: 'white', marginBottom: '0.75rem' }}>{t('dashboard.ai_advisor_title')}</h4>
                            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                                {t('dashboard.ai_advisor_desc')}
                            </p>
                            <button
                                className="btn"
                                style={{ width: '100%', background: 'white', color: '#2c3e50', fontWeight: 800, padding: '1rem', borderRadius: '12px' }}
                                onClick={() => {
                                    if (!localStorage.getItem('agro_token')) {
                                        window.location.hash = '#login';
                                    } else {
                                        window.location.hash = '#chat';
                                    }
                                }}
                            >
                                {t('dashboard.btn_start_chat')}
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
            {/* Active Alert Popup Modal */}
            <AnimatePresence>
                {activePopupAlert && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="card"
                            style={{
                                width: '100%',
                                maxWidth: '500px',
                                background: 'white',
                                padding: 0,
                                overflow: 'hidden',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                            }}
                        >
                            <div style={{
                                background: activePopupAlert.severity?.toLowerCase() === 'critical' ? '#ef4444' : (activePopupAlert.severity?.toLowerCase() === 'high' ? '#f97316' : '#f59e0b'),
                                padding: '1.5rem',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <AlertTriangle size={32} />
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'white' }}>{activePopupAlert.severity} Alert</h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Urgent Agricultural Update</p>
                                </div>
                            </div>

                            <div style={{ padding: '2rem' }}>
                                <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{activePopupAlert.title}</h4>
                                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
                                    {activePopupAlert.message}
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Region</div>
                                        <div style={{ fontWeight: 700 }}>{activePopupAlert.region || activePopupAlert.state || 'All Regions'}</div>
                                    </div>
                                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Crop</div>
                                        <div style={{ fontWeight: 700 }}>{activePopupAlert.crop || 'All Crops'}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    <button
                                        className="btn btn-primary"
                                        style={{ flex: 1, minWidth: '150px' }}
                                        onClick={() => {
                                            setActivePopupAlert(null);
                                            const el = document.getElementById('alerts-section');
                                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        View Details
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ flex: 1, minWidth: '150px' }}
                                        onClick={() => handleSnooze(activePopupAlert._id)}
                                    >
                                        Snooze (6h)
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.85rem' }}
                                        onClick={() => handleDontShowAgain(activePopupAlert._id)}
                                    >
                                        Don't show again for this alert
                                    </button>
                                    <button
                                        onClick={handleDismiss}
                                        style={{ width: '100%', border: 'none', background: 'transparent', color: '#ff7675', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
