import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaArrowLeft, FaStar, FaDownload, FaLock, FaUnlock, FaShoppingCart } from 'react-icons/fa';

const ResourceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);
    const [units, setUnits] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        fetchResourceDetails();
    }, [id]);

    const fetchResourceDetails = async () => {
        try {
            setLoading(true);
            const [resourceRes, unitsRes, reviewsRes] = await Promise.all([
                api.get(`/api/marketplace/resources/${id}`),
                api.get(`/api/marketplace/resources/${id}/units`),
                api.get(`/api/marketplace/resources/${id}/reviews`)
            ]);
            setResource(resourceRes.data);
            setUnits(unitsRes.data);
            setReviews(reviewsRes.data);
        } catch (error) {
            console.error('Error fetching resource details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (unitId, isFree) => {
        try {
            const response = await api.get(`/api/marketplace/resources/${id}/units/${unitId}/download`, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `unit_${unitId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Download failed. ' + (error.response?.data?.detail || 'Please try again.'));
        }
    };

    const handlePurchase = async (unitId) => {
        if (!window.confirm('Purchase this unit? (Demo mode - no real payment)')) {
            return;
        }

        try {
            setPurchasing(true);
            await api.post('/api/marketplace/purchases', {
                resource_unit_id: unitId,
                payment_method: 'stripe'
            });
            alert('Purchase successful! You can now download this unit.');
            fetchResourceDetails(); // Refresh to update access
        } catch (error) {
            alert('Purchase failed: ' + (error.response?.data?.detail || 'Please try again.'));
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', padding: '2rem', background: 'linear-gradient(to bottom, #fef3c7 0%, #fde68a 50%, #ffffff 100%)' }}>
                <div className="container text-center" style={{ paddingTop: '3rem' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading resource...</p>
                </div>
            </div>
        );
    }

    if (!resource) {
        return (
            <div style={{ minHeight: '100vh', padding: '2rem', background: 'linear-gradient(to bottom, #fef3c7 0%, #fde68a 50%, #ffffff 100%)' }}>
                <div className="container text-center" style={{ paddingTop: '3rem' }}>
                    <h2>Resource not found</h2>
                    <Link to="/marketplace" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        Back to Marketplace
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '2rem', background: 'linear-gradient(to bottom, #fef3c7 0%, #fde68a 50%, #ffffff 100%)' }}>
            <div className="container">
                <Link to="/marketplace" className="btn btn-outline mb-3">
                    <FaArrowLeft /> Back to Marketplace
                </Link>

                {/* Resource Header */}
                <div className="glass-card mb-4">
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>
                        {resource.title}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                        {resource.description}
                    </p>

                    {/* Metadata */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                        <span className="badge" style={{ background: 'var(--primary)', color: 'white', fontSize: '1rem', padding: '0.5rem 1rem' }}>
                            {resource.subject}
                        </span>
                        {resource.category && (
                            <span className="badge" style={{ background: 'var(--accent)', color: 'white', fontSize: '1rem', padding: '0.5rem 1rem' }}>
                                {resource.category}
                            </span>
                        )}
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaStar style={{ color: '#fbbf24', fontSize: '1.5rem' }} />
                            <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>{resource.average_rating.toFixed(1)}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>({resource.total_reviews} reviews)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                            <FaDownload style={{ fontSize: '1.5rem' }} />
                            <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>{resource.total_downloads}</span>
                            <span>downloads</span>
                        </div>
                    </div>
                </div>

                {/* Units */}
                <div className="glass-card mb-4">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                        📦 Available Units
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {units.map((unit) => (
                            <div
                                key={unit.id}
                                style={{
                                    padding: '1.5rem',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: 'var(--radius-md)',
                                    border: unit.is_free ? '2px solid #10b981' : '1px solid var(--border-color)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ flex: '1' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                            {unit.is_free && <FaUnlock style={{ color: '#10b981', marginRight: '0.5rem' }} />}
                                            {!unit.is_free && <FaLock style={{ color: '#6b7280', marginRight: '0.5rem' }} />}
                                            {unit.title}
                                        </h3>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                            {unit.description || 'No description available'}
                                        </p>
                                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            <span>📄 {unit.file_type.toUpperCase()}</span>
                                            <span>💾 {(unit.file_size / 1024).toFixed(0)} KB</span>
                                            <span>⬇️ {unit.download_count} downloads</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                        {unit.is_free ? (
                                            <>
                                                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>FREE</span>
                                                <button
                                                    onClick={() => handleDownload(unit.id, true)}
                                                    className="btn btn-primary"
                                                >
                                                    <FaDownload /> Download
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                                                    ${parseFloat(unit.price).toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => handlePurchase(unit.id)}
                                                    className="btn btn-primary"
                                                    disabled={purchasing}
                                                >
                                                    <FaShoppingCart /> {purchasing ? 'Processing...' : 'Purchase'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviews */}
                {reviews.length > 0 && (
                    <div className="glass-card">
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                            💬 Reviews ({reviews.length})
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {reviews.map((review) => (
                                <div
                                    key={review.id}
                                    style={{
                                        padding: '1rem',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: 'var(--radius-md)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        {'⭐'.repeat(review.rating)}
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {review.comment && (
                                        <p style={{ color: 'var(--text-secondary)' }}>{review.comment}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourceDetails;
