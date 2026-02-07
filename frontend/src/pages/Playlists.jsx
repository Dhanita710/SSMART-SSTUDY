import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaArrowLeft, FaMusic, FaHeart, FaPlay } from 'react-icons/fa';

const Playlists = () => {
    const [playlists, setPlaylists] = useState([]);
    const [generating, setGenerating] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        time_of_day: 'morning',
        mood: 'focused',
    });

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            const res = await api.get('/api/playlist/my-playlists');
            setPlaylists(res.data);
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    };

    const generatePlaylist = async () => {
        setGenerating(true);
        try {
            await api.post('/api/playlist/generate', formData);
            fetchPlaylists();
        } catch (error) {
            console.error('Error generating playlist:', error);
        } finally {
            setGenerating(false);
        }
    };

    const toggleFavorite = async (playlistId) => {
        try {
            await api.put(`/api/playlist/${playlistId}/favorite`);
            fetchPlaylists();
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    return (
        <div style={{ minHeight: '100vh', padding: '2rem', background: 'linear-gradient(to bottom, #f0f9ff 0%, #e0f2fe 50%, #ffffff 100%)' }}>
            <div className="container">
                <Link to="/dashboard" className="btn btn-outline mb-3">
                    <FaArrowLeft /> Back
                </Link>

                <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
                    <FaMusic style={{ display: 'inline', marginRight: '1rem' }} />
                    AI Playlist Generator
                </h1>

                {/* Generator Form */}
                <div className="glass-card mb-4">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                        Generate New Playlist
                    </h3>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="form-group">
                            <label className="form-label">Subject</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., Math"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Time of Day</label>
                            <select
                                className="input"
                                value={formData.time_of_day}
                                onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
                            >
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="evening">Evening</option>
                                <option value="night">Night</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mood</label>
                            <select
                                className="input"
                                value={formData.mood}
                                onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                            >
                                <option value="focused">Focused</option>
                                <option value="relaxed">Relaxed</option>
                                <option value="energetic">Energetic</option>
                                <option value="calm">Calm</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={generatePlaylist} className="btn btn-primary" disabled={generating}>
                        {generating ? 'Generating...' : '🎵 Generate Playlist'}
                    </button>
                </div>

                {/* Playlists */}
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                    Your Playlists
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {playlists.map((playlist) => (
                        <div key={playlist.id} className="glass-card fade-in">
                            <div className="flex justify-between items-center mb-2">
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{playlist.name}</h3>
                                <button
                                    onClick={() => toggleFavorite(playlist.id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '1.5rem',
                                    }}
                                >
                                    <FaHeart color={playlist.is_favorite ? 'var(--error)' : 'var(--text-muted)'} />
                                </button>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                {playlist.subject && (
                                    <span
                                        style={{
                                            padding: '0.25rem 0.75rem',
                                            background: 'var(--primary)',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.875rem',
                                            marginRight: '0.5rem',
                                        }}
                                    >
                                        {playlist.subject}
                                    </span>
                                )}
                                {playlist.mood && (
                                    <span
                                        style={{
                                            padding: '0.25rem 0.75rem',
                                            background: 'var(--secondary)',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        {playlist.mood}
                                    </span>
                                )}
                            </div>

                            {playlist.spotify_url && (
                                <a
                                    href={playlist.spotify_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                    style={{ width: '100%', textDecoration: 'none' }}
                                >
                                    <FaPlay /> Play on Spotify
                                </a>
                            )}
                        </div>
                    ))}

                    {playlists.length === 0 && (
                        <div className="glass-card text-center" style={{ gridColumn: '1 / -1' }}>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                No playlists yet. Generate your first AI-powered study playlist!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Playlists;
