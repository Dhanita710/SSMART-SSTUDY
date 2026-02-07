import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUsers, FaMicrophone, FaMapMarkerAlt, FaMusic, FaClock, FaChevronLeft, FaChevronRight, FaRocket, FaBrain, FaChartLine, FaSignOutAlt, FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const { currentUser, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const slides = [
        {
            image: '/images/hero1.png',
            title: 'Welcome to SMART STUDY',
            subtitle: 'Your AI-powered companion for smarter, more effective learning'
        },
        {
            image: '/images/hero2.png',
            title: 'Study Smarter with AI',
            subtitle: 'Leverage cutting-edge technology to transform your study experience'
        },
        {
            image: '/images/hero3.png',
            title: 'Achieve Your Goals',
            subtitle: 'Connect, collaborate, and excel with SMART STUDY'
        }
    ];

    const features = [
        {
            title: 'Study Buddy Matching',
            description: 'Find compatible study partners with AI-powered matching',
            icon: <FaUsers size={40} />,
            link: '/study-buddy',
            color: '#4F46E5',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            title: 'Voice Notes Summarizer',
            description: 'Record lectures and get AI-generated summaries instantly',
            icon: <FaMicrophone size={40} />,
            link: '/voice-notes',
            color: '#EC4899',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
            title: 'Ambient Study Rooms',
            description: 'Virtual study spaces with focus tracking and timers',
            icon: <FaClock size={40} />,
            link: '/ambient-study',
            color: '#14B8A6',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        {
            title: 'Location Tracker',
            description: 'Find and track the best study locations near you',
            icon: <FaMapMarkerAlt size={40} />,
            link: '/location-tracker',
            color: '#F59E0B',
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        },
        {
            title: 'AI Study Playlists',
            description: 'Generate personalized music playlists for focused studying',
            icon: <FaMusic size={40} />,
            link: '/playlists',
            color: '#10B981',
            gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
        },
        {
            title: 'Resource Marketplace',
            description: 'Buy and sell study notes • Unit 1 always FREE',
            icon: <FaShoppingCart size={40} />,
            link: '/marketplace',
            color: '#F97316',
            gradient: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)'
        }
    ];

    const stats = [
        { icon: <FaRocket size={32} />, number: '10K+', label: 'Active Students', color: '#4F46E5' },
        { icon: <FaBrain size={32} />, number: '50K+', label: 'AI Sessions', color: '#EC4899' },
        { icon: <FaChartLine size={32} />, number: '95%', label: 'Success Rate', color: '#10B981' }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f0f9ff 0%, #e0f2fe 50%, #ffffff 100%)' }}>
            {/* Navigation Header */}
            <nav style={{
                background: 'white',
                padding: '1rem 2rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0
                    }}>
                        SMART STUDY
                    </h1>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <Link to="/dashboard" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>Home</Link>
                        <a href="#features" style={{ color: '#64748b', textDecoration: 'none', fontWeight: '500' }}>Features</a>
                        {isAuthenticated ? (
                            <>
                                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                    {currentUser?.email}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        padding: '0.5rem 1.5rem',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <FaSignOutAlt /> Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/login" style={{
                                padding: '0.5rem 1.5rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                fontWeight: '600'
                            }}>
                                Get Started
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section with Slider */}
            < div style={{ position: 'relative', height: '600px', overflow: 'hidden', background: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                {
                    slides.map((slide, index) => (
                        <div
                            key={index}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: currentSlide === index ? 1 : 0,
                                transition: 'opacity 1s ease-in-out',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2rem'
                            }}
                        >
                            <div style={{ maxWidth: '1200px', width: '100%', display: 'flex', alignItems: 'center', gap: '4rem' }}>
                                <div style={{ flex: 1 }}>
                                    <h1 style={{
                                        fontSize: '3.5rem',
                                        fontWeight: '800',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        marginBottom: '1.5rem',
                                        lineHeight: '1.2'
                                    }}>
                                        {slide.title}
                                    </h1>
                                    <p style={{ fontSize: '1.5rem', color: '#64748b', marginBottom: '2rem' }}>
                                        {slide.subtitle}
                                    </p>
                                    <Link
                                        to="/study-buddy"
                                        style={{
                                            display: 'inline-block',
                                            padding: '1rem 2.5rem',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            borderRadius: '50px',
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            textDecoration: 'none',
                                            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.5)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
                                        }}
                                    >
                                        Get Started Free
                                    </Link>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <img
                                        src={slide.image}
                                        alt={slide.title}
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            borderRadius: '20px',
                                            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                }

                {/* Slider Controls */}
                <button
                    onClick={prevSlide}
                    style={{
                        position: 'absolute',
                        left: '2rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transition: 'all 0.3s ease',
                        zIndex: 10
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-50%) scale(1.1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(-50%) scale(1)'}
                >
                    <FaChevronLeft size={20} color="#667eea" />
                </button>
                <button
                    onClick={nextSlide}
                    style={{
                        position: 'absolute',
                        right: '2rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transition: 'all 0.3s ease',
                        zIndex: 10
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-50%) scale(1.1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(-50%) scale(1)'}
                >
                    <FaChevronRight size={20} color="#667eea" />
                </button>

                {/* Slider Dots */}
                <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            style={{
                                width: currentSlide === index ? '40px' : '12px',
                                height: '12px',
                                borderRadius: '6px',
                                border: 'none',
                                background: currentSlide === index ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#cbd5e1',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    ))}
                </div>
            </div >

            {/* Stats Section */}
            < div style={{ padding: '4rem 2rem', background: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                    {stats.map((stat, index) => (
                        <div key={index} style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '20px', transition: 'transform 0.3s ease' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ color: stat.color, marginBottom: '1rem' }}>{stat.icon}</div>
                            <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>{stat.number}</h3>
                            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div >

            {/* Features Section */}
            < div style={{ padding: '4rem 2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        textAlign: 'center',
                        marginBottom: '1rem',
                        color: '#1e293b'
                    }}>
                        AI-Powered Study Features
                    </h2>
                    <p style={{ textAlign: 'center', fontSize: '1.25rem', color: '#64748b', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                        Everything you need to study smarter, not harder
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {features.map((feature, index) => (
                            <Link
                                key={index}
                                to={feature.link}
                                style={{
                                    textDecoration: 'none',
                                    background: 'white',
                                    padding: '2.5rem',
                                    borderRadius: '20px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    transition: 'all 0.3s ease',
                                    border: '2px solid transparent'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                                    e.currentTarget.style.borderColor = feature.color;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                                    e.currentTarget.style.borderColor = 'transparent';
                                }}
                            >
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '20px',
                                    background: feature.gradient,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1.5rem',
                                    color: 'white'
                                }}>
                                    {feature.icon}
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>
                                    {feature.title}
                                </h3>
                                <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '1rem' }}>
                                    {feature.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div >

            {/* CTA Section */}
            < div style={{
                padding: '5rem 2rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '3rem', fontWeight: '800', color: 'white', marginBottom: '1.5rem' }}>
                    Ready to Transform Your Study Experience?
                </h2>
                <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                    Join thousands of students already studying smarter with AI
                </p>
                <Link
                    to="/study-buddy"
                    style={{
                        display: 'inline-block',
                        padding: '1.25rem 3rem',
                        background: 'white',
                        color: '#667eea',
                        borderRadius: '50px',
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        textDecoration: 'none',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                    }}
                >
                    Start Learning Now
                </Link>
            </div >
        </div >
    );
};

export default Dashboard;
