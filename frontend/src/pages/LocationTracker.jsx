import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaArrowLeft, FaMapMarkerAlt, FaPlus } from 'react-icons/fa';

const LocationTracker = () => {
    const [analytics, setAnalytics] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        location_name: '',
        subject: '',
        duration: '',
        productivity_rating: 3,
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/api/location/analytics');
            setAnalytics(res.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/location/log', {
                ...formData,
                duration: parseFloat(formData.duration),
            });
            setShowForm(false);
            setFormData({ location_name: '', subject: '', duration: '', productivity_rating: 3 });
            fetchAnalytics();
        } catch (error) {
            console.error('Error logging location:', error);
        }
    };

    return (
        <div style={{ minHeight: '100vh', padding: '2rem', background: 'linear-gradient(to bottom, #f0f9ff 0%, #e0f2fe 50%, #ffffff 100%)' }}>
            <div className="container">
                <Link to="/dashboard" className="btn btn-outline mb-3">
                    <FaArrowLeft /> Back
                </Link>

                <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
                    <FaMapMarkerAlt style={{ display: 'inline', marginRight: '1rem' }} />
                    Study Location Tracker
                </h1>

                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary mb-4">
                    <FaPlus /> Log New Location
                </button>

                {/* Log Form */}
                {showForm && (
                    <div className="glass-card mb-4 fade-in">
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                            Log Study Session
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., Library, Home, Café"
                                    value={formData.location_name}
                                    onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Subject</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., Mathematics"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Duration (minutes)</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="60"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Productivity (1-5)</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={formData.productivity_rating}
                                    onChange={(e) => setFormData({ ...formData, productivity_rating: parseInt(e.target.value) })}
                                    style={{ width: '100%' }}
                                />
                                <div className="text-center" style={{ fontSize: '2rem' }}>
                                    {'⭐'.repeat(formData.productivity_rating)}
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                Save Log
                            </button>
                        </form>
                    </div>
                )}

                {/* Analytics */}
                {analytics && (
                    <div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="glass-card text-center">
                                <h3 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
                                    {analytics.total_sessions}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Total Sessions</p>
                            </div>
                            <div className="glass-card text-center">
                                <h3 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent)' }}>
                                    {analytics.total_hours}h
                                </h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Total Hours</p>
                            </div>
                        </div>

                        <div className="glass-card mb-4">
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                                Top Locations
                            </h3>
                            {analytics.locations.map((loc, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: '1rem',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: '0.5rem',
                                    }}
                                >
                                    <div className="flex justify-between">
                                        <strong>{loc.name}</strong>
                                        <span>{'⭐'.repeat(Math.round(loc.avg_productivity))}</span>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                        {loc.sessions} sessions • {loc.total_hours}h
                                    </p>
                                </div>
                            ))}
                        </div>

                        {Object.keys(analytics.by_subject).length > 0 && (
                            <div className="glass-card">
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                                    Best Locations by Subject
                                </h3>
                                {Object.entries(analytics.by_subject).map(([subject, data], idx) => (
                                    <div key={idx} style={{ marginBottom: '0.5rem' }}>
                                        <strong>{subject}:</strong> {data.best_location} (⭐{data.avg_productivity.toFixed(1)})
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationTracker;
