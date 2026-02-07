import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaPlay, FaPause, FaStop, FaVolumeUp, FaFire, FaClock, FaBook, FaCoffee, FaCloudRain, FaTree } from 'react-icons/fa';

const AmbientStudy = () => {
    // Timer state
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [sessions, setSessions] = useState(0);

    // Study tracking
    const [streak, setStreak] = useState(0);
    const [totalTime, setTotalTime] = useState(0);

    // Sound state
    const [selectedSound, setSelectedSound] = useState('library');
    const [volume, setVolume] = useState(50);
    const [isPlaying, setIsPlaying] = useState(false);

    const audioRef = useRef(null);
    const timerRef = useRef(null);

    const sounds = [
        {
            id: 'library',
            name: 'Library',
            icon: <FaBook />,
            color: '#667eea',
            description: 'Quiet study ambience',
            // Using YouTube embed for ambient sound
            youtubeId: 'jfKfPfyJRdk' // Library ambience
        },
        {
            id: 'cafe',
            name: 'Café',
            icon: <FaCoffee />,
            color: '#f093fb',
            description: 'Coffee shop vibes',
            youtubeId: '5qap5aO4i9A' // Café ambience
        },
        {
            id: 'rain',
            name: 'Rain',
            icon: <FaCloudRain />,
            color: '#4facfe',
            description: 'Gentle rainfall',
            youtubeId: 'q76bMs-NwRk' // Rain sounds
        },
        {
            id: 'nature',
            name: 'Nature',
            icon: <FaTree />,
            color: '#43e97b',
            description: 'Forest sounds',
            youtubeId: 'eKFTSSKCzWA' // Nature sounds
        }
    ];

    // Timer logic
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleTimerComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRunning, timeLeft]);

    const handleTimerComplete = () => {
        setIsRunning(false);

        if (!isBreak) {
            setSessions(prev => prev + 1);
            setStreak(prev => prev + 1);
            setTotalTime(prev => prev + 25);
            setIsBreak(true);
            setTimeLeft(5 * 60);

            if (Notification.permission === 'granted') {
                new Notification('Work session complete! 🎉', {
                    body: 'Time for a 5-minute break!',
                });
            }
        } else {
            setIsBreak(false);
            setTimeLeft(25 * 60);

            if (Notification.permission === 'granted') {
                new Notification('Break complete! 💪', {
                    body: 'Ready for another study session?',
                });
            }
        }
    };

    const toggleTimer = () => {
        if (!isRunning && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setIsBreak(false);
        setTimeLeft(25 * 60);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatTotalTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}.${Math.floor(mins / 6)}h`;
    };

    const progress = isBreak
        ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
        : ((25 * 60 - timeLeft) / (25 * 60)) * 100;

    const handleSoundSelect = (soundId) => {
        setSelectedSound(soundId);
        setIsPlaying(true);
    };

    const toggleSound = () => {
        setIsPlaying(!isPlaying);
    };

    // Get current sound
    const currentSound = sounds.find(s => s.id === selectedSound);

    // Rain animation component
    const RainAnimation = () => (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
            overflow: 'hidden'
        }}>
            {[...Array(100)].map((_, i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: `${Math.random() * 100}%`,
                        top: `-${Math.random() * 100}px`,
                        width: '2px',
                        height: `${20 + Math.random() * 30}px`,
                        background: 'linear-gradient(to bottom, transparent, rgba(174, 194, 224, 0.5))',
                        animation: `fall ${2 + Math.random() * 3}s linear infinite`,
                        animationDelay: `${Math.random() * 5}s`
                    }}
                />
            ))}
            <style>{`
                @keyframes fall {
                    to {
                        transform: translateY(100vh);
                    }
                }
            `}</style>
        </div>
    );

    // Get background based on selected sound
    const getBackground = () => {
        switch (selectedSound) {
            case 'rain':
                return 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)';
            case 'cafe':
                return 'linear-gradient(to bottom, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)';
            case 'nature':
                return 'linear-gradient(to bottom, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%)';
            default: // library
                return 'linear-gradient(to bottom, #f0f9ff 0%, #e0f2fe 50%, #ffffff 100%)';
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            padding: '2rem',
            background: getBackground(),
            position: 'relative',
            transition: 'background 0.5s ease'
        }}>
            {/* Rain animation for rain environment */}
            {selectedSound === 'rain' && <RainAnimation />}

            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
                <Link to="/dashboard" className="btn btn-outline mb-3">
                    <FaArrowLeft /> Back
                </Link>

                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    marginBottom: '1rem',
                    background: selectedSound === 'rain' ? 'white' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Ambient Study Environment
                </h1>
                <p style={{
                    color: selectedSound === 'rain' ? '#e2e8f0' : '#64748b',
                    marginBottom: '2rem',
                    fontSize: '1.1rem'
                }}>
                    Focus better with Pomodoro timer and ambient sounds
                </p>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        textAlign: 'center'
                    }}>
                        <FaFire style={{ fontSize: '3rem', color: '#f59e0b', marginBottom: '1rem' }} />
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: '#1e293b' }}>{streak}</div>
                        <div style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>Day Streak</div>
                    </div>

                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        textAlign: 'center'
                    }}>
                        <FaClock style={{ fontSize: '3rem', color: '#14b8a6', marginBottom: '1rem' }} />
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: '#1e293b' }}>{formatTotalTime(totalTime)}</div>
                        <div style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>Total Time</div>
                    </div>

                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: '#1e293b' }}>{sessions}</div>
                        <div style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>Sessions Today</div>
                    </div>
                </div>

                {/* Pomodoro Timer */}
                <div style={{
                    background: 'white',
                    padding: '3rem',
                    borderRadius: '20px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    marginBottom: '2rem',
                    textAlign: 'center'
                }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#1e293b',
                        marginBottom: '2rem'
                    }}>
                        {isBreak ? '☕ Break Time' : '📚 Focus Time'}
                    </h2>

                    {/* Circular Progress */}
                    <div style={{ position: 'relative', width: '300px', height: '300px', margin: '0 auto 2rem' }}>
                        <svg width="300" height="300" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="150" cy="150" r="140" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                            <circle
                                cx="150" cy="150" r="140" fill="none"
                                stroke={isBreak ? '#14b8a6' : '#667eea'}
                                strokeWidth="12"
                                strokeDasharray={`${2 * Math.PI * 140}`}
                                strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 1s linear' }}
                            />
                        </svg>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '4rem', fontWeight: '800', color: '#1e293b' }}>
                                {formatTime(timeLeft)}
                            </div>
                            <div style={{ fontSize: '1.2rem', color: '#64748b', marginTop: '0.5rem' }}>
                                {isBreak ? 'Break' : 'Focus'}
                            </div>
                        </div>
                    </div>

                    {/* Timer Controls */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={toggleTimer}
                            style={{
                                padding: '1rem 2.5rem',
                                background: isRunning
                                    ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                        >
                            {isRunning ? <><FaPause /> Pause</> : <><FaPlay /> Start</>}
                        </button>
                        <button
                            onClick={resetTimer}
                            style={{
                                padding: '1rem 2.5rem',
                                background: 'white',
                                color: '#64748b',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FaStop /> Reset
                        </button>
                    </div>
                </div>

                {/* Ambient Sounds with YouTube Embed */}
                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '20px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '1.5rem' }}>
                        🎵 Select Study Environment
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        {sounds.map(sound => (
                            <button
                                key={sound.id}
                                onClick={() => handleSoundSelect(sound.id)}
                                style={{
                                    padding: '1.5rem',
                                    background: selectedSound === sound.id
                                        ? `linear-gradient(135deg, ${sound.color} 0%, ${sound.color}dd 100%)`
                                        : 'white',
                                    color: selectedSound === sound.id ? 'white' : '#1e293b',
                                    border: selectedSound === sound.id ? 'none' : '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.3s ease',
                                    boxShadow: selectedSound === sound.id ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                                }}
                            >
                                <div style={{ fontSize: '2rem' }}>{sound.icon}</div>
                                <div>{sound.name}</div>
                                <div style={{
                                    fontSize: '0.85rem',
                                    opacity: 0.8,
                                    color: selectedSound === sound.id ? 'white' : '#64748b'
                                }}>
                                    {sound.description}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* YouTube Audio Player */}
                    {isPlaying && currentSound && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <iframe
                                width="100%"
                                height="200"
                                src={`https://www.youtube.com/embed/${currentSound.youtubeId}?autoplay=1&loop=1&playlist=${currentSound.youtubeId}&volume=${volume}`}
                                title={`${currentSound.name} Ambient Sound`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ borderRadius: '12px' }}
                            />
                        </div>
                    )}

                    {/* Volume Control */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                        <FaVolumeUp style={{ color: '#667eea', fontSize: '1.5rem' }} />
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => setVolume(e.target.value)}
                            style={{
                                flex: 1,
                                height: '8px',
                                borderRadius: '4px',
                                outline: 'none',
                                background: `linear-gradient(to right, #667eea 0%, #667eea ${volume}%, #e2e8f0 ${volume}%, #e2e8f0 100%)`
                            }}
                        />
                        <span style={{ color: '#64748b', fontWeight: '600', minWidth: '45px' }}>{volume}%</span>
                    </div>

                    <p style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: '#f0f9ff',
                        borderRadius: '8px',
                        color: '#64748b',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        🎧 Real ambient sounds from YouTube! Adjust volume and enjoy your study session.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AmbientStudy;
