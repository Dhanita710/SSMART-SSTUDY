import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaArrowLeft, FaUpload, FaPlus, FaTrash } from 'react-icons/fa';

const UploadResource = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [resourceId, setResourceId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        category: ''
    });
    const [units, setUnits] = useState([
        { unit_number: 1, title: 'Unit 1: Introduction', description: '', price: 0, file: null }
    ]);
    const [uploading, setUploading] = useState(false);

    const handleResourceSubmit = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            const res = await api.post('/api/marketplace/resources', formData);
            setResourceId(res.data.id);
            setStep(2);
        } catch (error) {
            alert('Error creating resource: ' + (error.response?.data?.detail || 'Please try again'));
        } finally {
            setUploading(false);
        }
    };

    const handleAddUnit = () => {
        const nextUnitNumber = units.length + 1;
        setUnits([...units, {
            unit_number: nextUnitNumber,
            title: `Unit ${nextUnitNumber}`,
            description: '',
            price: 0,
            file: null
        }]);
    };

    const handleRemoveUnit = (index) => {
        if (index === 0) {
            alert('Cannot remove Unit 1');
            return;
        }
        const newUnits = units.filter((_, i) => i !== index);
        setUnits(newUnits);
    };

    const handleUnitChange = (index, field, value) => {
        const newUnits = [...units];
        newUnits[index][field] = value;
        setUnits(newUnits);
    };

    const handleFileChange = (index, file) => {
        const newUnits = [...units];
        newUnits[index].file = file;
        setUnits(newUnits);
    };

    const handleUnitsSubmit = async (e) => {
        e.preventDefault();

        try {
            setUploading(true);

            // Upload each unit
            for (const unit of units) {
                if (!unit.file) {
                    alert(`Please select a file for ${unit.title}`);
                    setUploading(false);
                    return;
                }

                const formData = new FormData();
                formData.append('unit_number', unit.unit_number);
                formData.append('title', unit.title);
                formData.append('description', unit.description || '');
                formData.append('price', unit.unit_number === 1 ? 0 : unit.price);
                formData.append('file', unit.file);

                await api.post(`/api/marketplace/resources/${resourceId}/units`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            alert('Resource uploaded successfully!');
            navigate(`/marketplace/${resourceId}`);
        } catch (error) {
            alert('Error uploading units: ' + (error.response?.data?.detail || 'Please try again'));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', padding: '2rem', background: 'linear-gradient(to bottom, #fef3c7 0%, #fde68a 50%, #ffffff 100%)' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <Link to="/marketplace" className="btn btn-outline mb-3">
                    <FaArrowLeft /> Back to Marketplace
                </Link>

                <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
                    <FaUpload style={{ display: 'inline', marginRight: '1rem' }} />
                    Upload Resource
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                    Share your study notes and earn money • Unit 1 is always FREE
                </p>

                {/* Progress Steps */}
                <div className="glass-card mb-4" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: step >= 1 ? 'var(--primary)' : 'var(--bg-secondary)',
                                color: step >= 1 ? 'white' : 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                margin: '0 auto 0.5rem'
                            }}>
                                1
                            </div>
                            <span style={{ fontSize: '0.875rem', color: step >= 1 ? 'var(--primary)' : 'var(--text-secondary)' }}>
                                Basic Info
                            </span>
                        </div>
                        <div style={{ flex: '1', height: '2px', background: step >= 2 ? 'var(--primary)' : 'var(--border-color)', margin: '0 1rem' }}></div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: step >= 2 ? 'var(--primary)' : 'var(--bg-secondary)',
                                color: step >= 2 ? 'white' : 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                margin: '0 auto 0.5rem'
                            }}>
                                2
                            </div>
                            <span style={{ fontSize: '0.875rem', color: step >= 2 ? 'var(--primary)' : 'var(--text-secondary)' }}>
                                Upload Units
                            </span>
                        </div>
                    </div>
                </div>

                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <div className="glass-card">
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                            Step 1: Basic Information
                        </h2>
                        <form onSubmit={handleResourceSubmit}>
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., Complete Data Structures Notes"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="input"
                                    rows="4"
                                    placeholder="Describe your resource..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Subject *</label>
                                <select
                                    className="input"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    required
                                >
                                    <option value="">Select subject</option>
                                    <option value="Data Structures">Data Structures</option>
                                    <option value="Operating Systems">Operating Systems</option>
                                    <option value="Database Management">Database Management</option>
                                    <option value="Computer Networks">Computer Networks</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="Physics">Physics</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="input"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="">Select category</option>
                                    <option value="Class Notes">Class Notes</option>
                                    <option value="Assignments">Assignments</option>
                                    <option value="Summaries">Summaries</option>
                                    <option value="Practice Problems">Practice Problems</option>
                                    <option value="Exam Prep">Exam Prep</option>
                                </select>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={uploading}>
                                {uploading ? 'Creating...' : 'Next: Upload Units →'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Step 2: Upload Units */}
                {step === 2 && (
                    <div className="glass-card">
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                            Step 2: Upload Units
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            💡 Unit 1 is always FREE to attract buyers. Set prices for additional units.
                        </p>

                        <form onSubmit={handleUnitsSubmit}>
                            {units.map((unit, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '1.5rem',
                                        background: unit.unit_number === 1 ? '#ecfdf5' : 'var(--bg-secondary)',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: '1rem',
                                        border: unit.unit_number === 1 ? '2px solid #10b981' : '1px solid var(--border-color)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                                            Unit {unit.unit_number}
                                            {unit.unit_number === 1 && (
                                                <span style={{ marginLeft: '0.5rem', color: '#10b981', fontSize: '0.875rem' }}>
                                                    (FREE)
                                                </span>
                                            )}
                                        </h3>
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveUnit(index)}
                                                className="btn btn-outline"
                                                style={{ padding: '0.5rem' }}
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Title *</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={unit.title}
                                            onChange={(e) => handleUnitChange(index, 'title', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Brief description of this unit"
                                            value={unit.description}
                                            onChange={(e) => handleUnitChange(index, 'description', e.target.value)}
                                        />
                                    </div>

                                    {unit.unit_number > 1 && (
                                        <div className="form-group">
                                            <label className="form-label">Price (USD) *</label>
                                            <input
                                                type="number"
                                                className="input"
                                                min="0"
                                                step="0.01"
                                                placeholder="e.g., 2.99"
                                                value={unit.price}
                                                onChange={(e) => handleUnitChange(index, 'price', parseFloat(e.target.value))}
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label className="form-label">File (PDF, DOCX, PPT) *</label>
                                        <input
                                            type="file"
                                            className="input"
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                                            onChange={(e) => handleFileChange(index, e.target.files[0])}
                                            required
                                        />
                                        {unit.file && (
                                            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                Selected: {unit.file.name} ({(unit.file.size / 1024).toFixed(0)} KB)
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={handleAddUnit}
                                className="btn btn-outline"
                                style={{ width: '100%', marginBottom: '1rem' }}
                            >
                                <FaPlus /> Add Another Unit
                            </button>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={uploading}>
                                {uploading ? 'Uploading...' : '✨ Publish Resource'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadResource;
