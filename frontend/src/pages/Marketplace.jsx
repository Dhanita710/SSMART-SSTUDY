import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaArrowLeft, FaShoppingCart, FaSearch, FaStar, FaDownload, FaUpload } from 'react-icons/fa';

const Marketplace = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [sortBy, setSortBy] = useState('recent');

    useEffect(() => {
        fetchResources();
    }, [selectedSubject, sortBy]);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedSubject) params.append('subject', selectedSubject);
            if (sortBy) params.append('sort_by', sortBy);
            if (searchTerm) params.append('search', searchTerm);

            const res = await api.get(`/api/marketplace/resources?${params.toString()}`);
            setResources(res.data);
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchResources();
    };

    return (
        <div style={{ minHeight: '100vh', padding: '2rem', background: 'linear-gradient(to bottom, #fef3c7 0%, #fde68a 50%, #ffffff 100%)' }}>
            <div className="container">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <Link to="/dashboard" className="btn btn-outline mb-3">
                            <FaArrowLeft /> Back
                        </Link>
                        <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                            <FaShoppingCart style={{ display: 'inline', marginRight: '1rem' }} />
                            Resource Marketplace
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                            Buy and sell study notes • Unit 1 always FREE
                        </p>
                    </div>
                    <Link to="/upload-resource" className="btn btn-primary">
                        <FaUpload /> Upload Resource
                    </Link>
                </div>

                {/* Search and Filters */}
                <div className="glass-card mb-4">
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1', minWidth: '200px' }}>
                            <input
                                type="text"
                                className="input"
                                placeholder="Search resources..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="input"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            style={{ minWidth: '150px' }}
                        >
                            <option value="">All Subjects</option>
                            <option value="Data Structures">Data Structures</option>
                            <option value="Operating Systems">Operating Systems</option>
                            <option value="Database Management">Database Management</option>
                            <option value="Computer Networks">Computer Networks</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Physics">Physics</option>
                        </select>
                        <select
                            className="input"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ minWidth: '150px' }}
                        >
                            <option value="recent">Most Recent</option>
                            <option value="popular">Most Popular</option>
                            <option value="rating">Highest Rated</option>
                        </select>
                        <button type="submit" className="btn btn-primary">
                            <FaSearch /> Search
                        </button>
                    </form>
                </div>

                {/* Resources Grid */}
                {loading ? (
                    <div className="text-center" style={{ padding: '3rem' }}>
                        <div className="spinner"></div>
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading resources...</p>
                    </div>
                ) : resources.length === 0 ? (
                    <div className="glass-card text-center" style={{ padding: '3rem' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No resources found</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Be the first to upload study notes!
                        </p>
                        <Link to="/upload-resource" className="btn btn-primary">
                            <FaUpload /> Upload Resource
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {resources.map((resource) => (
                            <Link
                                key={resource.id}
                                to={`/marketplace/${resource.id}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div
                                    className="glass-card hover-lift"
                                    style={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {/* Thumbnail */}
                                    <div
                                        style={{
                                            height: '150px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '3rem',
                                            fontWeight: '800'
                                        }}
                                    >
                                        📚
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: '1.5rem', flex: '1', display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                            {resource.title}
                                        </h3>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', flex: '1' }}>
                                            {resource.description?.substring(0, 100)}...
                                        </p>

                                        {/* Metadata */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                            <span className="badge" style={{ background: 'var(--primary)', color: 'white' }}>
                                                {resource.subject}
                                            </span>
                                            {resource.category && (
                                                <span className="badge" style={{ background: 'var(--accent)', color: 'white' }}>
                                                    {resource.category}
                                                </span>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FaStar style={{ color: '#fbbf24' }} />
                                                <span style={{ fontWeight: '600' }}>{resource.average_rating.toFixed(1)}</span>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                                    ({resource.total_reviews})
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                                                <FaDownload />
                                                <span>{resource.total_downloads}</span>
                                            </div>
                                        </div>

                                        {/* FREE Badge */}
                                        <div style={{ marginTop: '1rem' }}>
                                            <span
                                                style={{
                                                    display: 'inline-block',
                                                    background: '#10b981',
                                                    color: 'white',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: 'var(--radius-md)',
                                                    fontWeight: '700',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                Unit 1 FREE
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Marketplace;
