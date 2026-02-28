import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    Save,
    X,
    Info,
    AlertTriangle,
    Sprout,
    CheckCircle2,
    Store,
    Upload,
    ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

const AdminMarketplace = () => {
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Form State
    const [formData, setFormData] = useState({
        product: '',
        category: 'Seeds',
        suitable_crops: '',
        usage_stage: '',
        price_range: '',
        guidance: '',
        availability: 'In Stock',
        desc: '',
        product_image: '',
        product_link: ''
    });

    const categories = ['All', 'Seeds', 'Fertilizers', 'Equipment', 'Commodities', 'Pesticides'];

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setIsLoading(true);
        try {
            const data = await api.get('/resources');
            setResources(data || []);
        } catch (error) {
            console.error("Failed to fetch resources", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (resource = null) => {
        if (resource) {
            setEditingResource(resource);
            setFormData({
                product: resource.product || '',
                category: resource.category || 'Seeds',
                suitable_crops: Array.isArray(resource.suitable_crops) ? resource.suitable_crops.join(', ') : '',
                usage_stage: resource.usage_stage || '',
                price_range: resource.price_range || '',
                guidance: resource.guidance || '',
                availability: resource.availability || 'In Stock',
                desc: resource.desc || '',
                product_image: resource.product_image || '',
                product_link: resource.product_link || ''
            });
        } else {
            setEditingResource(null);
            setFormData({
                product: '',
                category: 'Seeds',
                suitable_crops: '',
                usage_stage: '',
                price_range: '',
                guidance: '',
                availability: 'In Stock',
                desc: '',
                product_image: '',
                product_link: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingResource(null);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            const response = await api.post('/admin/resources/upload', uploadData);
            setFormData({ ...formData, product_image: response.url });
        } catch (error) {
            console.error("Failed to upload image", error);
            alert("Image upload failed");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            suitable_crops: formData.suitable_crops.split(',').map(s => s.trim()).filter(s => s)
        };

        try {
            if (editingResource) {
                await api.put(`/admin/resources/${editingResource._id}`, payload);
            } else {
                await api.post('/admin/resources', payload);
            }
            fetchResources();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save resource", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this resource?')) {
            try {
                await api.delete(`/admin/resources/${id}`);
                fetchResources();
            } catch (error) {
                console.error("Failed to delete resource", error);
            }
        }
    };

    const filteredResources = resources.filter(res => {
        const matchesSearch = res.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
            res.desc.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || res.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div style={{ padding: '0 1rem' }}>
            <div className="flex-between" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Marketplace Inventory</h2>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Manage agricultural commodities, inputs, and equipment.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary"
                    style={{ padding: '1rem 1.5rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                >
                    <Plus size={20} /> Add Resource
                </button>
            </div>

            {/* Filters Bar */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem', background: 'white', borderRadius: '18px', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search products, descriptions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '12px', border: '1px solid var(--border)', width: '100%', fontSize: '0.95rem' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                padding: '0.6rem 1.2rem',
                                borderRadius: '10px',
                                border: '1px solid var(--border)',
                                background: selectedCategory === cat ? 'var(--primary-light)' : 'white',
                                color: selectedCategory === cat ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Resources Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-md)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#fcfcfc', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1.25rem 2rem', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Product</th>
                            <th style={{ padding: '1.25rem 2rem', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</th>
                            <th style={{ padding: '1.25rem 2rem', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pricing</th>
                            <th style={{ padding: '1.25rem 2rem', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '1.25rem 2rem', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '4rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                        <div className="animate-spin"><Store size={32} color="var(--primary)" /></div>
                                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Syncing Inventory...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredResources.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No resources found matching the criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredResources.map((res) => (
                                <tr key={res._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        <div style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '0.25rem' }}>{res.product}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.desc}</div>
                                    </td>
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        <span style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800 }}>
                                            {res.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.5rem 2rem', fontWeight: 700, fontSize: '0.9rem' }}>{res.price_range}</td>
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 800, color: res.availability?.includes('Stock') ? 'var(--primary)' : '#ef4444' }}>
                                            {res.availability?.includes('Stock') ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                                            {res.availability}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleOpenModal(res)}
                                                className="btn btn-secondary"
                                                style={{ padding: '0.5rem', borderRadius: '8px' }}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(res._id)}
                                                className="btn btn-secondary"
                                                style={{ padding: '0.5rem', borderRadius: '8px', color: '#ef4444' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
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
                            padding: '2rem'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="card"
                            style={{
                                width: '100%',
                                maxWidth: '700px',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                padding: '2.5rem',
                                border: 'none',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                            }}
                        >
                            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.5rem' }}>{editingResource ? 'Edit Resource' : 'Add New Resource'}</h3>
                                <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>Product Name</label>
                                    <input
                                        type="text"
                                        value={formData.product}
                                        onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                                        required
                                        className="form-control"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)' }}
                                    >
                                        {categories.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>Pricing/Unit</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ₹400 - ₹500 per kg"
                                        value={formData.price_range}
                                        onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>Suitable Crops</label>
                                    <input
                                        type="text"
                                        placeholder="Comma separated: Rice, Wheat..."
                                        value={formData.suitable_crops}
                                        onChange={(e) => setFormData({ ...formData, suitable_crops: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>Availability Status</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. In Stock, Out of Stock"
                                        value={formData.availability}
                                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>Usage Stage</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Sowing, Flowering, All Stages"
                                        value={formData.usage_stage}
                                        onChange={(e) => setFormData({ ...formData, usage_stage: e.target.value })}
                                        className="form-control"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)' }}
                                    />
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>Product Purchase Link (URL)</label>
                                    <div style={{ position: 'relative' }}>
                                        <ExternalLink size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="url"
                                            placeholder="https://example.com/buy"
                                            value={formData.product_link}
                                            onChange={(e) => setFormData({ ...formData, product_link: e.target.value })}
                                            className="form-control"
                                            style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.8rem', borderRadius: '10px', border: '1px solid var(--border)' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>Product Image</label>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                borderRadius: '16px',
                                                background: '#f8fafc',
                                                border: '2px dashed var(--border)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {formData.product_image ? (
                                                <img src={formData.product_image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <Store size={32} color="var(--border)" />
                                            )}
                                        </div>
                                        <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Upload size={18} /> Upload Image
                                            <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                    </div>
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>Usage Guidance</label>
                                    <textarea
                                        value={formData.guidance}
                                        onChange={(e) => setFormData({ ...formData, guidance: e.target.value })}
                                        rows="2"
                                        className="form-control"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', resize: 'none' }}
                                    />
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>Brief Description</label>
                                    <textarea
                                        value={formData.desc}
                                        onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                                        rows="3"
                                        className="form-control"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', resize: 'none' }}
                                    />
                                </div>

                                <div style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        style={{ flex: 1, padding: '1rem', borderRadius: '12px' }}
                                    >
                                        <Save size={18} style={{ marginRight: '0.5rem' }} /> {editingResource ? 'Update Product' : 'Confirm & Add Resource'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="btn btn-secondary"
                                        style={{ flex: 1, padding: '1rem', borderRadius: '12px' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminMarketplace;
