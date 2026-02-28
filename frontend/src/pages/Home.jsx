import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, ShieldCheck, Zap, HeartHandshake, MousePointer2, Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Home = () => {
    const { t } = useTranslation();
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
    };

    return (
        <div>
            {/* Hero Section */}
            <section className="section-padding" style={{ background: 'linear-gradient(to bottom, #ffffff, #f1f8f4)' }}>
                <div className="main-container">
                    <div className="hero-section" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-8)', alignItems: 'center' }}>
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                        >
                            <motion.div variants={itemVariants} className="hero-badge" style={{ marginBottom: 'var(--space-6)' }}>
                                <span style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', display: 'inline-block' }}></span>
                                <span style={{ marginLeft: '0.5rem', fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {t('home.hero_badge')}
                                </span>
                            </motion.div>

                            <motion.h1 variants={itemVariants} style={{ fontSize: '5rem', marginBottom: 'var(--space-5)', letterSpacing: '-0.02em' }}>
                                {t('home.hero_title_1')} <br />
                                <span className="serif" style={{ color: 'var(--primary)', fontStyle: 'italic' }}>{t('home.hero_title_2')}</span> {t('home.hero_title_3')}
                            </motion.h1>

                            <motion.p variants={itemVariants} style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: 'var(--space-7)', lineHeight: 1.6, maxWidth: '580px' }}>
                                {t('home.hero_desc')}
                            </motion.p>

                            <motion.div variants={itemVariants} className="hero-cta" style={{ display: 'flex', gap: 'var(--space-5)' }}>
                                <button
                                    className="btn btn-primary"
                                    style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem', borderRadius: 'var(--radius-md)' }}
                                    onClick={() => window.location.hash = '#advisor'}
                                >
                                    {t('home.btn_get_started')} <ArrowRight size={22} />
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    style={{ padding: '1.20rem 2.5rem', fontSize: '1.1rem', borderRadius: 'var(--radius-md)' }}
                                    onClick={() => window.location.hash = '#crops'}
                                >
                                    {t('home.btn_explore')}
                                </button>
                            </motion.div>

                            <motion.div variants={itemVariants} style={{ marginTop: 'var(--space-8)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                <div style={{ display: 'flex', marginLeft: '0.5rem' }}>
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid white', background: '#ddd', marginLeft: '-15px' }}></div>
                                    ))}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <span style={{ fontWeight: 800, color: 'var(--text)' }}>12,000+</span> {t('home.farmers_joined')}
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            style={{ position: 'relative' }}
                        >
                            <img
                                src="/smart_farming_hero_sample.png"
                                alt="AgroAssist Hero"
                                style={{ width: '100%', borderRadius: 'var(--radius-xl)', boxShadow: '0 40px 100px rgba(0,0,0,0.1)' }}
                                onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=2670'}
                            />
                            <motion.div
                                style={{ position: 'absolute', top: '-40px', right: '-40px', background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.2 }}
                            >
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '14px' }}>
                                        <Zap size={24} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{t('home.ai_powered')}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('home.instant_diag')}</div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Feature Section */}
            <section className="section-padding" style={{ background: 'white' }}>
                <div className="main-container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                        <h2 style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>{t('home.features_title')}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>{t('home.features_desc')}</p>
                    </div>

                    <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        {[
                            { title: t('home.f_advisor_title'), desc: t('home.f_advisor_desc'), icon: <Zap size={32} />, path: '#advisor', color: 'var(--primary)', bg: 'var(--primary-light)' },
                            { title: t('home.f_library_title'), desc: t('home.f_library_desc'), icon: <Leaf size={32} />, path: '#crops', color: '#0984e3', bg: '#e1f5ff' },
                            { title: t('home.f_ai_title'), desc: t('home.f_ai_desc'), icon: <Bot size={32} />, path: '#chat', color: '#00d2ff', bg: '#e6fbff' },
                            { title: t('home.f_market_title'), desc: t('home.f_market_desc'), icon: <ShieldCheck size={32} />, path: '#market', color: '#e84393', bg: '#fce4ec' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                className="card"
                                onClick={() => window.location.hash = stat.path}
                                style={{
                                    textAlign: 'center',
                                    padding: '3.5rem 2rem',
                                    cursor: 'pointer',
                                    border: '2px solid transparent',
                                    borderRadius: '32px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                                    background: 'white'
                                }}
                                whileHover={{
                                    y: -15,
                                    borderColor: stat.color,
                                    boxShadow: `0 30px 60px ${stat.color}20`
                                }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div style={{
                                    background: stat.bg,
                                    color: stat.color,
                                    padding: '1.5rem',
                                    borderRadius: '24px',
                                    display: 'flex',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>{stat.icon}</div>
                                <div>
                                    <h3 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', fontWeight: 800 }}>{stat.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.05rem', fontWeight: 500 }}>{stat.desc}</p>
                                </div>
                                <div style={{ color: stat.color, fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                                    {t('home.launch_module')} <ArrowRight size={18} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: 'white', padding: 'var(--space-8) 0', borderTop: '1px solid var(--border)' }}>
                <div className="main-container" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: 'var(--space-6)' }}>
                        <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '10px' }}><Leaf size={20} /></div>
                        <h3 style={{ fontSize: '1.5rem' }}>AgroAssist</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 'var(--space-7)' }}>© 2026 AgroAssist Platform. {t('home.footer_slogan')}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', fontWeight: 600, color: 'var(--text)' }}>
                        <span style={{ cursor: 'pointer' }}>{t('home.footer_privacy')}</span>
                        <span style={{ cursor: 'pointer' }}>{t('home.footer_terms')}</span>
                        <span style={{ cursor: 'pointer' }}>{t('home.footer_contact')}</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
