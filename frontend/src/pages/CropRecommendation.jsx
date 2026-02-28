import React, { useState } from 'react';
import { api } from '../services/api';

const CropRecommendation = () => {
    const [inputs, setInputs] = useState({ soil: 'Alluvial', season: 'Summer', climate: 'Hot' });
    const [results, setResults] = useState(null);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleRecommend = async () => {
        setLoading(true);
        try {
            const crops = await api.post('/recommend', inputs);
            setResults(crops);
            setSelectedCrop(null);
        } catch (error) {
            console.error("Failed to fetch recommendations", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.75rem' }}>Crop Planner</h2>
                <p style={{ color: 'var(--text-muted)' }}>Input your farm details for expert advice</p>
            </div>

            <div className="card">
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Soil Type</label>
                <select value={inputs.soil} onChange={(e) => setInputs({ ...inputs, soil: e.target.value })}>
                    <option>Alluvial</option>
                    <option>Red</option>
                    <option>Black</option>
                </select>

                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Season</label>
                <select value={inputs.season} onChange={(e) => setInputs({ ...inputs, season: e.target.value })}>
                    <option>Summer</option>
                    <option>Winter</option>
                </select>

                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Climate</label>
                <select value={inputs.climate} onChange={(e) => setInputs({ ...inputs, climate: e.target.value })}>
                    <option>Hot</option>
                    <option>Moderate</option>
                    <option>Cool</option>
                </select>

                <button onClick={handleRecommend} style={{ width: '100%', marginTop: '0.5rem' }}>
                    {loading ? 'Analyzing...' : 'Get Recommendations'}
                </button>
            </div>

            {results && (
                <>
                    <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Recommended Crops</h3>
                    <div className="feature-grid">
                        {results.map((crop, idx) => (
                            <div key={idx} className="feature-tile" onClick={() => setSelectedCrop(crop)} style={{ border: selectedCrop?.name === crop.name ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
                                <div className="feature-icon" style={{ fontSize: '1.5rem' }}>🌾</div>
                                <span style={{ fontWeight: 600 }}>{crop.name}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {selectedCrop && (
                <div className="card" style={{ marginTop: '2rem', borderLeft: '4px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: '1.25rem' }}>Expert Guidance: {selectedCrop.name}</h3>

                    <div style={{ display: 'grid', gap: '1.25rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span style={{ color: 'var(--primary)' }}>💧</span>
                                <strong style={{ fontSize: '0.9rem' }}>Irrigation</strong>
                            </div>
                            <p style={{ fontSize: '0.95rem' }}>{selectedCrop.irrigation}</p>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span style={{ color: 'var(--primary)' }}>🧪</span>
                                <strong style={{ fontSize: '0.9rem' }}>Fertilizer</strong>
                            </div>
                            <p style={{ fontSize: '0.95rem' }}>{selectedCrop.fertilizer}</p>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span style={{ color: 'var(--primary)' }}>🛡️</span>
                                <strong style={{ fontSize: '0.9rem' }}>Pest Control</strong>
                            </div>
                            <p style={{ fontSize: '0.95rem' }}>{selectedCrop.pests}</p>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span style={{ color: 'var(--primary)' }}>🚜</span>
                                <strong style={{ fontSize: '0.9rem' }}>Harvesting</strong>
                            </div>
                            <p style={{ fontSize: '0.95rem' }}>{selectedCrop.harvest}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CropRecommendation;
