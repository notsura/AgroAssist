import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Home as HomeIcon,
  LayoutDashboard,
  Sprout,
  UserRound,
  Store,
  MessageSquare,
  BookOpen,
  CloudSun,
  Leaf,
  History,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Advisor from './pages/Advisor';
import CropLibrary from './pages/CropLibrary';
import CropIntelligence from './pages/CropIntelligence';
import CommunityHub from './pages/CommunityHub';
import ExpertChat from './pages/ExpertChat';
import MockMarket from './pages/MockMarket';
import Auth from './pages/Auth';
import FarmingHistory from './pages/FarmingHistory';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminCrops from './pages/AdminCrops';
import AdminPests from './pages/AdminPests';
import AdminMarketplace from './pages/AdminMarketplace';
import AdminCommunity from './pages/AdminCommunity';
import AdminAlerts from './pages/AdminAlerts';

function App() {
  const { t, i18n } = useTranslation();
  const [route, setRoute] = useState(window.location.hash || '#home');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('agro_user');
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed;
    } catch (e) {
      console.error('Failed to parse user state:', e);
      return null;
    }
  });
  const [selectedIntelCrop, setSelectedIntelCrop] = useState(null);
  const [isProfileHovered, setIsProfileHovered] = useState(false);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('agro_token');
    localStorage.removeItem('agro_user');
    setUser(null);
    window.location.hash = '#home';
  };

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#home');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 }
  };

  const renderPage = () => {
    // Admin Route Branching
    if (route.startsWith('#admin')) {
      if (!user || user.role !== 'admin') {
        window.location.hash = '#home';
        return <Home />;
      }

      const getAdminComponent = () => {
        switch (route) {
          case '#admin-dashboard': return <AdminDashboard />;
          case '#admin-users': return <AdminUsers />;
          case '#admin-crops': return <AdminCrops />;
          case '#admin-pests': return <AdminPests />;
          case '#admin-market': return <AdminMarketplace />;
          case '#admin-community': return <AdminCommunity />;
          case '#admin-alerts': return <AdminAlerts />;
          default: return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Coming Soon</h2>
              <p style={{ color: 'var(--text-muted)' }}>The {route.split('-')[1]} management module is under construction.</p>
            </div>
          );
        }
      };

      return (
        <AdminLayout activeTab={route} user={user} onLogout={handleLogout}>
          <AnimatePresence mode="wait">
            <motion.div
              key={route}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              {getAdminComponent()}
            </motion.div>
          </AnimatePresence>
        </AdminLayout>
      );
    }

    const getComponent = () => {
      switch (route) {
        case '#dashboard':
          if (!user) {
            window.location.hash = '#login';
            return <Auth onAuthSuccess={handleAuthSuccess} initialMode="login" />;
          }
          // If admin tries to access user dashboard, redirect to admin dashboard
          if (user.role === 'admin') {
            window.location.hash = '#admin-dashboard';
            return <AdminDashboard />;
          }
          return <Dashboard />;
        case '#advisor': return <Advisor user={user} />;
        case '#crops': return <CropLibrary user={user} onSelectCrop={(crop) => {
          setSelectedIntelCrop(crop);
          window.location.hash = '#crop-intel';
        }} />;
        case '#crop-intel':
          return <CropIntelligence crop={selectedIntelCrop} user={user} onBack={() => window.location.hash = '#crops'} />;
        case '#community': return <CommunityHub />;
        case '#chat': return <ExpertChat />;
        case '#market': return <MockMarket />;
        case '#auth':
        case '#login': return <Auth onAuthSuccess={handleAuthSuccess} initialMode="login" />;
        case '#signup': return <Auth onAuthSuccess={handleAuthSuccess} initialMode="signup" />;
        case '#history':
          if (!user) {
            window.location.hash = '#login';
            return <Auth onAuthSuccess={handleAuthSuccess} initialMode="login" />;
          }
          return <FarmingHistory onBack={() => window.location.hash = '#dashboard'} />;
        case '#profile':
          if (!user) {
            window.location.hash = '#login';
            return <Auth onAuthSuccess={handleAuthSuccess} initialMode="login" />;
          }
          // Redirecting to dashboard for now as profile page is not yet implemented
          window.location.hash = '#dashboard';
          return <Dashboard />;
        default: return <Home />;
      }
    };

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={route}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {getComponent()}
        </motion.div>
      </AnimatePresence>
    );
  };

  const navItems = [
    { id: '#home', label: t('nav.home', 'Home'), icon: HomeIcon },
    ...(user ? [{ id: '#dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard }] : []),
    { id: '#crops', label: t('nav.crops', 'Crop Library'), icon: Sprout },
    { id: '#advisor', label: t('nav.advisor', 'Advisor'), icon: CloudSun },
    { id: '#market', label: t('nav.market', 'Market'), icon: Store },
    { id: '#community', label: t('nav.community', 'Community'), icon: MessageSquare },
  ];

  const isAdminRoute = route.startsWith('#admin');

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      {/* Premium Sticky Header - Hide on Admin Routes */}
      {!isAdminRoute && (
        <header style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div className="main-container">
            <nav className="top-nav">
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                <motion.div
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                  onClick={() => window.location.hash = '#home'}
                  whileHover={{ scale: 1.02 }}
                >
                  <div style={{ background: 'var(--primary)', color: 'white', padding: '0.6rem', borderRadius: '14px', display: 'flex', boxShadow: 'var(--shadow-primary)' }}>
                    <Leaf size={24} />
                  </div>
                  <h1 style={{ fontSize: '1.6rem', margin: 0 }}>Agro<span style={{ color: 'var(--primary)' }}>Assist</span></h1>
                </motion.div>
              </div>

              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div className="nav-links">
                  {navItems.map(item => (
                    <a
                      key={item.id}
                      href={item.id}
                      className={`nav-link ${route === item.id ? 'nav-pill-active' : ''}`}
                    >
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en')}
                  style={{
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                  title="Toggle Language"
                >
                  {i18n.language === 'en' ? 'A|अ' : 'अ|A'}
                </button>
                {!user ? (
                  <>
                    <button onClick={() => window.location.hash = '#login'} className="btn btn-secondary" style={{ padding: '0.6rem 1rem' }}>Login</button>
                    <button onClick={() => window.location.hash = '#signup'} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>Sign Up</button>
                  </>
                ) : (
                  <>
                    <div
                      style={{ position: 'relative' }}
                      onMouseEnter={() => setIsProfileHovered(true)}
                      onMouseLeave={() => setIsProfileHovered(false)}
                    >
                      <motion.div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          cursor: 'pointer',
                          padding: '0.5rem 1rem',
                          borderRadius: '14px',
                          background: isProfileHovered ? 'var(--primary-light)' : 'transparent',
                          transition: 'background 0.3s ease'
                        }}
                      >
                        <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-primary)' }}>
                          <User size={20} color="white" />
                        </div>
                        <div style={{ display: 'none', md: 'block' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1 }}>Farmer</div>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {user.fullname.split(' ')[0]} <ChevronDown size={14} />
                          </div>
                        </div>
                      </motion.div>

                      <AnimatePresence>
                        {isProfileHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            style={{
                              position: 'absolute',
                              top: '100%',
                              right: 0,
                              width: '240px',
                              background: 'white',
                              borderRadius: '20px',
                              boxShadow: '0 15px 40px rgba(0,0,0,0.12)',
                              border: '1px solid var(--border)',
                              padding: '0.75rem',
                              marginTop: '0.5rem',
                              zIndex: 1000
                            }}
                          >
                            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>SIGNED IN AS</span>
                              <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1rem', marginTop: '0.1rem' }}>{user.fullname}</div>
                            </div>

                            <a
                              href="#profile"
                              className="nav-link"
                              style={{ margin: '0.2rem 0', padding: '0.8rem 1rem', borderRadius: '12px', width: '100%', display: 'flex', justifyContent: 'flex-start' }}
                              onClick={() => setIsProfileHovered(false)}
                            >
                              <UserRound size={18} />
                              <span>My Profile</span>
                            </a>

                            <a
                              href="#history"
                              className="nav-link"
                              style={{ margin: '0.2rem 0', padding: '0.8rem 1rem', borderRadius: '12px', width: '100%', display: 'flex', justifyContent: 'flex-start' }}
                              onClick={() => setIsProfileHovered(false)}
                            >
                              <History size={18} />
                              <span>Farming History</span>
                            </a>

                            <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }}></div>

                            <button
                              onClick={() => {
                                setIsProfileHovered(false);
                                handleLogout();
                              }}
                              className="nav-link"
                              style={{ margin: '0.2rem 0', padding: '0.8rem 1rem', borderRadius: '12px', width: '100%', display: 'flex', justifyContent: 'flex-start', color: '#ff7675', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                              <LogOut size={18} />
                              <span>Logout</span>
                            </button>

                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </div>
            </nav>
          </div>
        </header>
      )}

      <main>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
