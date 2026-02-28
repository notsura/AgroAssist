import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Store,
    ArrowRight,
    Filter,
    Search,
    Info,
    BellRing,
    Sprout,
    Wheat,
    FlaskConical,
    Truck,
    Cpu,
    Cloud,
    Pickaxe,
    Package,
    Activity,
    ChevronRight,
    Droplets,
    Leaf,
    X,
    ExternalLink,
    ShieldCheck,
    Hammer,
    MapPin,
    CalendarDays,
    ShieldAlert
} from 'lucide-react';
import { api, imageUrl } from '../services/api';

const MockMarket = () => {
    const [marketData, setMarketData] = useState([]);
    const [category, setCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [activeCrop, setActiveCrop] = useState(null);
    const [marketMode, setMarketMode] = useState('crop'); // 'crop' or 'resource'
    const [resourceData, setResourceData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const categories = marketMode === 'crop' ? [
        { name: 'All', icon: <Package size={18} /> },
        { name: 'Commodities', icon: <TrendingUp size={18} /> },
        { name: 'Vegetables', icon: <Activity size={18} /> },
        { name: 'Fruits', icon: <Leaf size={18} /> },
        { name: 'Grains', icon: <Package size={18} /> }
    ] : [
        { name: 'All', icon: <Package size={18} /> },
        { name: 'Seeds', icon: <Leaf size={18} /> },
        { name: 'Fertilizers', icon: <Droplets size={18} /> },
        { name: 'Pesticides', icon: <ShieldAlert size={18} /> },
        { name: 'Equipment', icon: <Hammer size={18} /> }
    ];

    useEffect(() => {
        const fetchMarket = async () => {
            setIsLoading(true);
            try {
                const data = await api.get('/market');
                setMarketData(data || []);
            } catch (error) {
                console.error("Failed to fetch market data", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchActiveCrop = async () => {
            try {
                const data = await api.get('/user/active-status');
                if (data && data.active) {
                    setActiveCrop(data.crop_name);
                }
            } catch (error) {
                console.error("Failed to fetch active crop", error);
            }
        };

        const fetchResources = async () => {
            try {
                const data = await api.get('/resources');
                setResourceData(data || []);
            } catch (error) {
                console.error("Failed to fetch resources", error);
            }
        };

        fetchMarket();
        fetchActiveCrop();
        fetchResources();
    }, []);

    const getProductIcon = (product, category, size = 24, color = "var(--primary)") => {
        const prod = product?.toLowerCase();
        const cat = category?.toLowerCase();

        if (cat === 'seeds') return <Sprout size={size} color={color} />;
        if (cat === 'fertilizers') return <FlaskConical size={size} color={color} />;
        if (cat === 'equipments') return <Truck size={size} color={color} />;

        if (prod.includes('rice')) return <Wheat size={size} color={color} />;
        if (prod.includes('wheat')) return <Wheat size={size} color={color} />;
        if (prod.includes('cotton')) return <Cloud size={size} color={color} />;
        if (prod.includes('maize')) return <Cpu size={size} color={color} />;

        return <Package size={size} color={color} />;
    };

    const filteredMarket = marketData.filter(item => {
        const prodMatch = (item.product || "").toLowerCase().includes(searchTerm.toLowerCase());
        const mandiMatch = (item.mandi || "").toLowerCase().includes(searchTerm.toLowerCase());
        return prodMatch || mandiMatch;
    });

    return (
        <div className="main-container section-padding">
            <header style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'var(--primary-light)', padding: '0.8rem', borderRadius: '16px' }}>
                            <Store color="var(--primary)" size={32} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '3.5rem' }}>Live Market <span className="serif" style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Insights</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '650px', margin: '0.75rem auto 2.5rem' }}>Real-time Mandi indexing and predictive price modeling for your region.</p>

                    <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.6 }} size={20} />
                        <input
                            type="text"
                            placeholder={marketMode === 'crop' ? "Search mandis or commodities..." : "Search resources..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1.25rem 1.5rem 1.25rem 4rem',
                                borderRadius: '100px',
                                border: '1px solid var(--border)',
                                fontSize: '1.1rem',
                                boxShadow: 'var(--shadow-sm)',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    </div>

                    {/* Dual Mode Switch */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                        <div style={{
                            background: '#f1f5f9',
                            padding: '0.4rem',
                            borderRadius: '100px',
                            display: 'flex',
                            gap: '0.5rem',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            {['Crop Market', 'Resource Marketplace'].map((mode) => {
                                const modeKey = mode === 'Crop Market' ? 'crop' : 'resource';
                                const isActive = marketMode === modeKey;
                                return (
                                    <motion.button
                                        key={mode}
                                        onClick={() => {
                                            setMarketMode(modeKey);
                                            setCategory('All');
                                        }}
                                        style={{
                                            padding: '0.8rem 2rem',
                                            borderRadius: '100px',
                                            border: 'none',
                                            background: isActive ? 'white' : 'transparent',
                                            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                            fontWeight: 800,
                                            fontSize: '0.95rem',
                                            cursor: 'pointer',
                                            boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                                            position: 'relative'
                                        }}
                                        whileHover={!isActive ? { background: 'rgba(255,255,255,0.5)' } : {}}
                                    >
                                        <span style={{ position: 'relative', zIndex: 1 }}>{mode}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeModeHighlight"
                                                style={{ position: 'absolute', inset: 0, borderRadius: '100px', background: 'white', zIndex: 0 }}
                                            />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {marketMode === 'resource' && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginTop: '3rem', marginBottom: '1rem', overflowX: 'auto', padding: '1rem 0' }}>
                        {categories.map(cat => (
                            <motion.div
                                key={cat.name}
                                whileHover={{ y: -5, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setCategory(cat.name)}
                                style={{
                                    padding: '1.25rem 2rem',
                                    borderRadius: '24px',
                                    background: category === cat.name ? 'var(--primary)' : 'white',
                                    color: category === cat.name ? 'white' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    fontWeight: 800,
                                    border: '1px solid',
                                    borderColor: category === cat.name ? 'var(--primary)' : 'var(--border)',
                                    boxShadow: category === cat.name ? 'var(--shadow-primary)' : 'var(--shadow-sm)',
                                    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <div style={{ color: category === cat.name ? 'white' : 'var(--primary)' }}>{cat.icon}</div>
                                {cat.name}
                            </motion.div>
                        ))}
                    </div>
                )}
            </header>

            <AnimatePresence mode="wait">
                {marketMode === 'crop' ? (
                    <motion.div
                        key="crop-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        {/* Active Crop Highlight Card */}
                        {activeCrop && marketData.find(item => item.product.includes(activeCrop)) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card"
                                style={{
                                    maxWidth: '900px',
                                    margin: '0 auto 3.5rem',
                                    padding: '2.5rem',
                                    background: 'linear-gradient(135deg, var(--primary), #10b981)',
                                    color: 'white',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setSelectedItem(marketData.find(item => item.product.includes(activeCrop)))}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                    <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {getProductIcon(activeCrop, 'Commodities', 40, "white")}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8, marginBottom: '0.5rem' }}>Your Active Crop Market</div>
                                        <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{activeCrop} Highlights</h3>
                                        <p style={{ opacity: 0.9, fontWeight: 500 }}>Live monitoring for your current cultivation</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 900 }}>
                                        {marketData.find(item => item.product.includes(activeCrop)).price.split('/')[0]}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', fontWeight: 800, marginTop: '0.25rem' }}>
                                        {marketData.find(item => item.product.includes(activeCrop)).trend}
                                        <TrendingUp size={20} />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-7)', alignItems: 'start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Activity size={24} color="var(--primary)" /> {category === 'All' ? 'Commodities Board' : `${category} Catalogue`}
                                    </h3>
                                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.85rem' }}>
                                        <Filter size={16} /> Filters
                                    </button>
                                </div>

                                <AnimatePresence mode="popLayout">
                                    {filteredMarket.length > 0 ? (
                                        filteredMarket.map((item, i) => (
                                            <motion.div
                                                key={`${item.product}-${item.mandi}-${i}`}
                                                className="card"
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '80px 1fr 140px 140px 120px',
                                                    padding: '1.5rem 2.5rem',
                                                    alignItems: 'center',
                                                    gap: '2rem',
                                                    borderRadius: 'var(--radius-lg)',
                                                    cursor: 'pointer'
                                                }}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ delay: i * 0.05 }}
                                                whileHover={{ x: 10, borderColor: 'var(--primary)', boxShadow: 'var(--shadow-md)' }}
                                                onClick={() => setSelectedItem(item)}
                                            >
                                                <div style={{ width: '64px', height: '64px', background: 'var(--primary-light)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {getProductIcon(item.product, item.category, 28)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        {item.product}
                                                        {item.is_live && (
                                                            <span style={{
                                                                fontSize: '0.55rem',
                                                                background: '#ebfbee',
                                                                color: '#12b886',
                                                                padding: '0.2rem 0.5rem',
                                                                borderRadius: '4px',
                                                                fontWeight: 900,
                                                                textTransform: 'uppercase',
                                                                border: '1px solid #c3fae8'
                                                            }}>LIVE MANDI</span>
                                                        )}
                                                        {activeCrop && item.product.includes(activeCrop) && (
                                                            <span style={{
                                                                fontSize: '0.65rem',
                                                                background: 'var(--primary-light)',
                                                                color: 'var(--primary)',
                                                                padding: '0.2rem 0.6rem',
                                                                borderRadius: '100px',
                                                                border: '1px solid var(--primary)',
                                                                fontWeight: 800,
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px'
                                                            }}>Active Journey</span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        {item.is_live ? (
                                                            <><MapPin size={14} /> {item.mandi}, {item.state}</>
                                                        ) : (
                                                            <><Package size={14} /> Total Stock: {item.stock}</>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>CURRENT PRICE</div>
                                                    <div style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--text)' }}>
                                                        {item.price?.split('/')[0] || 'N/A'}
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                                                            / {item.price?.split('/')[1] || 'unit'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                                                    <svg width="120" height="30" style={{ opacity: 0.6 }}>
                                                        <path
                                                            d={item.trend?.startsWith('+') ? "M0 25 L20 20 L40 22 L60 10 L80 15 L100 5 L120 8" : "M0 5 L20 15 L40 10 L60 22 L80 18 L100 25 L120 23"}
                                                            fill="none"
                                                            stroke={item.trend?.startsWith('+') ? "#00b894" : "#ff7675"}
                                                            strokeWidth="3"
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                </div>

                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '100px',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 800,
                                                        background: item.trend === 'Bullish' ? '#e6fcf5' : (item.trend === 'Bearish' ? '#fff5f5' : '#f8fafc'),
                                                        color: item.trend === 'Bullish' ? '#00b894' : (item.trend === 'Bearish' ? '#ff7675' : 'var(--text-muted)')
                                                    }}>
                                                        {item.trend === 'Bullish' ? <TrendingUp size={16} /> : (item.trend === 'Bearish' ? <TrendingDown size={16} /> : <Activity size={16} />)}
                                                        {item.trend || 'Stable'}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '5rem', background: '#f8fafc', borderRadius: '32px' }}>
                                            <Search size={48} color="var(--primary)" style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                            <p style={{ fontWeight: 800, color: 'var(--text-muted)' }}>No commodities found matching your criteria</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div className="card" style={{ padding: '2rem', border: '1px dashed var(--primary)', background: 'rgba(26, 178, 100, 0.02)' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <Activity size={18} color="var(--primary)" /> Market Sentiment
                                    </h4>
                                    <div style={{ height: '8px', background: '#edf2f7', borderRadius: '100px', position: 'relative', marginBottom: '0.75rem' }}>
                                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '72%', background: 'linear-gradient(to right, #00b894, #55efc4)', borderRadius: '100px' }} />
                                    </div>
                                    <div className="flex-between" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                        <span>Bearish</span>
                                        <span style={{ color: 'var(--primary)' }}>72% Bullish</span>
                                    </div>
                                </div>

                                <div className="card" style={{ padding: '2rem' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem' }}>🚀 Market Alerts</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <div style={{ borderLeft: '3px solid #ff7675', padding: '0.5rem 1rem' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#ff7675', textTransform: 'uppercase' }}>Price Volatility</div>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 500, marginTop: '0.25rem' }}>Onion prices surging in Maharashtra hubs.</p>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="resource-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}>
                            {resourceData
                                .filter(r => (category === 'All' || r.category === category) &&
                                    (r.product || "").toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((res, i) => (
                                    <motion.div
                                        key={res._id || res.product}
                                        className="card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ y: -10, boxShadow: 'var(--shadow-lg)', borderColor: 'var(--primary)' }}
                                        style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                                        onClick={() => setSelectedItem(res)}
                                    >
                                        <div style={{
                                            background: res.product_image ? `url(${imageUrl(res.product_image)})` : 'var(--primary-light)',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            padding: res.product_image ? '0' : '3rem',
                                            height: '240px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderBottom: '1px solid var(--border)',
                                            position: 'relative'
                                        }}>
                                            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 2 }}>
                                                <ShieldCheck size={20} color={res.product_image ? 'white' : 'var(--primary)'} style={{ filter: res.product_image ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none' }} />
                                            </div>
                                            {!res.product_image && getProductIcon(res.product, res.category, 64)}
                                        </div>
                                        <div style={{ padding: '2.5rem', flexGrow: 1 }}>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: 900,
                                                    color: 'var(--primary)',
                                                    textTransform: 'uppercase',
                                                    background: 'rgba(26, 178, 100, 0.1)',
                                                    padding: '0.3rem 0.8rem',
                                                    borderRadius: '100px',
                                                    marginBottom: '0.75rem',
                                                    display: 'inline-block',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    {res.category}
                                                </span>
                                                <h4 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.5px' }}>{res.product}</h4>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                    <Leaf size={16} color="var(--primary)" />
                                                    <span style={{ fontWeight: 800, color: 'var(--text)' }}>Suitable Crops:</span> {res.suitable_crops.join(', ')}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                    <CalendarDays size={16} color="#3498db" />
                                                    <span style={{ fontWeight: 800, color: 'var(--text)' }}>Usage Stage:</span> {res.usage_stage}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                    <TrendingUp size={16} color="#f39c12" />
                                                    <span style={{ fontWeight: 800, color: 'var(--text)' }}>Price Range:</span> {res.price_range}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                    <MapPin size={16} color="#e74c3c" />
                                                    <span style={{ fontWeight: 800, color: 'var(--text)' }}>Availability:</span> {res.availability}
                                                </div>
                                            </div>

                                            <div style={{
                                                background: '#f8fafc',
                                                padding: '1.25rem',
                                                borderRadius: '16px',
                                                fontSize: '0.9rem',
                                                lineHeight: '1.6',
                                                borderLeft: '4px solid var(--primary)',
                                                color: 'var(--text-muted)'
                                            }}>
                                                <strong style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>Farming Guidance</strong>
                                                {res.guidance}
                                            </div>
                                        </div>
                                        <div style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>View Information Sheet</span>
                                            <ArrowRight size={18} color="var(--primary)" />
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <footer style={{ marginTop: 'var(--space-8)', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-7)' }}>
                <p>© 2026 AgroAssist Intel. Market data provided by National Mandi Board.</p>
            </footer>

            {/* Product Detail Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedItem(null)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)' }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{
                                position: 'relative',
                                background: 'white',
                                width: '100%',
                                maxWidth: '640px',
                                borderRadius: '32px',
                                padding: '2.5rem',
                                boxShadow: '0 40px 80px -12px rgba(0,0,0,0.3)',
                                overflow: 'hidden'
                            }}
                        >
                            <button
                                onClick={() => setSelectedItem(null)}
                                style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: '#f8fafc', border: 'none', padding: '0.8rem', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                                onMouseLeave={(e) => e.target.style.background = '#f8fafc'}
                            >
                                <X size={20} />
                            </button>

                            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem' }}>
                                <div style={{
                                    width: '140px',
                                    height: '140px',
                                    background: selectedItem.product_image ? `url(${imageUrl(selectedItem.product_image)})` : 'var(--primary-light)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderRadius: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                }}>
                                    {!selectedItem.product_image && getProductIcon(selectedItem.product, selectedItem.category, 60)}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem', display: 'block' }}>{selectedItem.category}</span>
                                    <h3 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 0.75rem', letterSpacing: '-1px', lineHeight: 1 }}>{selectedItem.product}</h3>

                                    {selectedItem.price && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)' }}>
                                                {selectedItem.price.split('/')[0]} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ {selectedItem.price.split('/')[1]}</span>
                                            </div>
                                            {selectedItem.trend && (
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '100px',
                                                    fontSize: '0.95rem',
                                                    fontWeight: 800,
                                                    background: selectedItem.trend.startsWith('+') ? '#e6fcf5' : '#fff5f5',
                                                    color: selectedItem.trend.startsWith('+') ? '#00b894' : '#ff7675'
                                                }}>
                                                    {selectedItem.trend} {selectedItem.trend.startsWith('+') ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedItem.is_live && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                                            <div style={{ background: 'var(--primary-light)', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <MapPin size={14} /> {selectedItem.mandi}, {selectedItem.state}
                                            </div>
                                            <div style={{ background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <CalendarDays size={14} /> Updated: {selectedItem.arrival_date}
                                            </div>
                                        </div>
                                    )}

                                    {selectedItem.price_range && (
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>
                                            {selectedItem.price_range}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '2.5rem', borderRadius: '32px', marginBottom: selectedItem.product_link ? '3rem' : '0' }}>
                                <h4 style={{ fontWeight: 900, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem' }}>
                                    <Info size={22} color="var(--primary)" /> Product Intelligence
                                </h4>
                                <div style={{ lineHeight: 1.8, color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
                                    {selectedItem.is_live ? (
                                        <>
                                            <p>Live market data retrieved from AGMARKNET.</p>
                                            <p>Detailed agronomic intelligence is not available for this commodity.</p>
                                        </>
                                    ) : (
                                        selectedItem.desc || 'No detailed description available for this item.'
                                    )}
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: selectedItem.is_live ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)',
                                    gap: '1.5rem',
                                    marginTop: '2.5rem'
                                }}>
                                    {!selectedItem.is_live && (
                                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                                                {selectedItem.availability ? 'AVAILABILITY' : 'CURRENT STOCK'}
                                            </div>
                                            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>
                                                {selectedItem.availability || selectedItem.stock}
                                            </div>
                                        </div>
                                    )}
                                    <div style={{ background: 'white', padding: '1.25rem', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>SUITABILITY</div>
                                        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>High Quality</div>
                                    </div>
                                </div>
                            </div>

                            {selectedItem.product_link && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                    <button
                                        onClick={() => window.open(selectedItem.product_link, '_blank')}
                                        className="btn btn-primary"
                                        style={{ padding: '1.5rem', borderRadius: '24px', fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', boxShadow: 'var(--shadow-primary)' }}
                                    >
                                        Buy Product <ExternalLink size={24} />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MockMarket;
