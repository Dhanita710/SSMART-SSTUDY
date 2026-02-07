import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaArrowLeft, FaMicrophone, FaUpload, FaSearch, FaStop, FaPlay, FaPause } from 'react-icons/fa';

const VoiceNotes = () => {
    const [notes, setNotes] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        fetchNotes();
    }, []);

    useEffect(() => {
        // Timer for recording
        if (isRecording && !isPaused) {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
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
    }, [isRecording, isPaused]);

    const fetchNotes = async () => {
        try {
            const res = await api.get('/api/voice/library');
            setNotes(res.data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(audioBlob);
                stream.getTracks().forEach(track => track.stop());
                // Auto-upload after recording
                uploadRecording(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone. Please grant permission and try again.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            if (isPaused) {
                mediaRecorderRef.current.resume();
                setIsPaused(false);
            } else {
                mediaRecorderRef.current.pause();
                setIsPaused(true);
            }
        }
    };

    const uploadRecording = async (blob) => {
        // Check if blob has data
        if (!blob || blob.size === 0) {
            alert('Recording is empty. Please try recording again and speak into the microphone.');
            setUploading(false);
            return;
        }

        setUploading(true);
        const formData = new FormData();
        const filename = `recording_${Date.now()}.webm`;
        formData.append('file', blob, filename);

        try {
            console.log('Uploading recording...', filename);
            console.log('Blob size:', blob.size, 'bytes');
            console.log('Blob type:', blob.type);

            const response = await api.post('/api/voice/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            });

            console.log('Upload successful:', response.data);
            setAudioBlob(null);
            await fetchNotes();
            alert('✅ Recording uploaded and transcribed successfully!');
        } catch (error) {
            console.error('Error uploading recording:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            let errorMessage = 'Failed to upload recording';

            if (error.code === 'ERR_NETWORK') {
                errorMessage = 'Cannot connect to server. Please ensure:\n1. Backend server is running on port 8000\n2. No firewall blocking the connection';
            } else if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.message) {
                errorMessage = error.message;
            }

            alert(`❌ Upload failed: ${errorMessage}\n\nTroubleshooting:\n• Check browser console (F12) for details\n• Ensure microphone permission is granted\n• Try recording for at least 2-3 seconds\n• Make sure you speak clearly into the mic`);
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await api.post('/api/voice/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSelectedFile(null);
            fetchNotes();
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const filteredNotes = notes.filter(
        (note) =>
            note.transcription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', padding: '2rem', background: 'linear-gradient(to bottom, #f0f9ff 0%, #e0f2fe 50%, #ffffff 100%)' }}>
            <div className="container">
                <Link to="/dashboard" className="btn btn-outline mb-3">
                    <FaArrowLeft /> Back
                </Link>

                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    <FaMicrophone style={{ display: 'inline', marginRight: '1rem', color: '#667eea' }} />
                    Voice Note Summarizer
                </h1>
                <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.1rem' }}>
                    Record audio or upload files for AI-powered transcription and summarization
                </p>

                {/* Recording Section */}
                <div className="glass-card mb-4" style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1e293b' }}>
                        🎤 Record from Microphone
                    </h3>

                    {!isRecording && !uploading && (
                        <button
                            onClick={startRecording}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1.1rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FaMicrophone size={20} /> Start Recording
                        </button>
                    )}

                    {isRecording && (
                        <div>
                            <div style={{
                                textAlign: 'center',
                                marginBottom: '1.5rem',
                                padding: '1rem',
                                background: '#fef2f2',
                                borderRadius: '12px'
                            }}>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: '700',
                                    color: '#dc2626',
                                    marginBottom: '0.5rem'
                                }}>
                                    {isPaused ? '⏸️ Paused' : '🔴 Recording'}
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b' }}>
                                    {formatTime(recordingTime)}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={pauseRecording}
                                    className="btn btn-outline"
                                    style={{ flex: 1, padding: '0.75rem', fontSize: '1rem' }}
                                >
                                    {isPaused ? <><FaPlay /> Resume</> : <><FaPause /> Pause</>}
                                </button>
                                <button
                                    onClick={stopRecording}
                                    className="btn"
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        fontSize: '1rem',
                                        background: '#dc2626',
                                        color: 'white',
                                        border: 'none'
                                    }}
                                >
                                    <FaStop /> Stop & Upload
                                </button>
                            </div>
                        </div>
                    )}

                    {uploading && (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                            <p style={{ color: '#667eea', fontWeight: '600', fontSize: '1.1rem' }}>
                                Processing your recording... This may take a moment.
                            </p>
                        </div>
                    )}
                </div>

                {/* Upload Section */}
                <div className="glass-card mb-4" style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
                        📁 Upload Audio File
                    </h3>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={handleFileChange}
                            className="input"
                            style={{ flex: 1 }}
                        />
                        <button
                            onClick={handleUpload}
                            className="btn btn-primary"
                            disabled={!selectedFile || uploading}
                        >
                            <FaUpload /> {uploading ? 'Processing...' : 'Upload'}
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="form-group mb-4">
                    <div style={{ position: 'relative' }}>
                        <FaSearch
                            style={{
                                position: 'absolute',
                                left: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8',
                            }}
                        />
                        <input
                            type="text"
                            className="input"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '3rem', background: 'white' }}
                        />
                    </div>
                </div>

                {/* Notes Library */}
                <div className="grid gap-3">
                    {filteredNotes.map((note) => (
                        <div key={note.id} className="glass-card fade-in" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>
                                {note.filename}
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                {new Date(note.created_at).toLocaleDateString()}
                            </p>

                            {note.summary && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong style={{ color: '#1e293b' }}>Summary:</strong>
                                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>{note.summary}</p>
                                </div>
                            )}

                            {note.key_points && note.key_points.length > 0 && (
                                <div>
                                    <strong style={{ color: '#1e293b' }}>Key Points:</strong>
                                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', color: '#64748b' }}>
                                        {note.key_points.map((point, idx) => (
                                            <li key={idx}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredNotes.length === 0 && (
                        <div className="glass-card text-center" style={{ background: 'white', padding: '3rem', borderRadius: '12px' }}>
                            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
                                No voice notes yet. Record or upload your first one!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoiceNotes;
