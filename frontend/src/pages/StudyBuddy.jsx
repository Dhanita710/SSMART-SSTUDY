import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaArrowLeft, FaUsers, FaCheck, FaTimes } from 'react-icons/fa';

const StudyBuddy = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({ subjects: [], strengths: [], weaknesses: [] });

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const res = await api.get('/api/buddy/matches');
            setMatches(res.data);
        } catch (error) {
            console.error('Error fetching matches:', error);
        }
    };

    const findMatches = async () => {
        setLoading(true);
        try {
            const res = await api.post('/api/buddy/find-matches');
            setMatches(res.data);
        } catch (error) {
            console.error('Error finding matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (matchId, action) => {
        try {
            await api.put(`/api/buddy/matches/${matchId}/${action}`);
            fetchMatches();
        } catch (error) {
            console.error('Error updating match:', error);
        }
    };

    return (
        <div style={{ minHeight: '100vh', padding: '2rem', background: 'linear-gradient(to bottom, #f0f9ff 0%, #e0f2fe 50%, #ffffff 100%)' }}>
            <div className="container">
                <Link to="/dashboard" className="btn btn-outline mb-3">
                    <FaArrowLeft /> Back to Dashboard
                </Link>

                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    <FaUsers style={{ display: 'inline', marginRight: '1rem', color: '#667eea' }} />
                    Study Buddy Matching
                </h1>
                <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.1rem' }}>
                    AI-powered matching to find your perfect study partners
                </p>

                <button onClick={findMatches} className="btn btn-primary mb-4" disabled={loading}>
                    {loading ? 'Finding Matches...' : 'Find New Matches'}
                </button>

                <div className="grid grid-cols-2 gap-3">
                    {matches.map((match) => (
                        <div key={match.id} className="glass-card fade-in">
                            <div className="flex justify-between items-center mb-2">
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Match #{match.id}</h3>
                                <span
                                    style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: 'var(--radius-full)',
                                        background: 'var(--primary)',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    {(match.compatibility_score * 100).toFixed(0)}% Match
                                </span>
                            </div>

                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                {match.match_explanation}
                            </p>

                            {match.shared_subjects && match.shared_subjects.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong>Shared Subjects:</strong>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                        {match.shared_subjects.map((subject, idx) => (
                                            <span
                                                key={idx}
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: 'var(--bg-tertiary)',
                                                    borderRadius: 'var(--radius-full)',
                                                    fontSize: '0.875rem',
                                                }}
                                            >
                                                {subject}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {match.status === 'pending' && (
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => handleAction(match.id, 'accept')}
                                        className="btn btn-primary"
                                        style={{ flex: 1 }}
                                    >
                                        <FaCheck /> Accept
                                    </button>
                                    <button
                                        onClick={() => handleAction(match.id, 'decline')}
                                        className="btn btn-outline"
                                        style={{ flex: 1 }}
                                    >
                                        <FaTimes /> Decline
                                    </button>
                                </div>
                            )}

                            {match.status === 'accepted' && (
                                <div className="success-message">✓ Match Accepted</div>
                            )}
                        </div>
                    ))}

                    {matches.length === 0 && (
                        <div className="glass-card text-center" style={{ gridColumn: '1 / -1' }}>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                No matches yet. Click "Find New Matches" to get started!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudyBuddy;
