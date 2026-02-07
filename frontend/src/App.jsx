import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import Login from './pages/Login';
import StudyBuddy from './pages/StudyBuddy';
import VoiceNotes from './pages/VoiceNotes';
import AmbientStudy from './pages/AmbientStudy';
import LocationTracker from './pages/LocationTracker';
import Playlists from './pages/Playlists';
import Marketplace from './pages/Marketplace';
import ResourceDetails from './pages/ResourceDetails';
import UploadResource from './pages/UploadResource';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/study-buddy" element={
                        <ProtectedRoute>
                            <StudyBuddy />
                        </ProtectedRoute>
                    } />
                    <Route path="/voice-notes" element={
                        <ProtectedRoute>
                            <VoiceNotes />
                        </ProtectedRoute>
                    } />
                    <Route path="/ambient-study" element={
                        <ProtectedRoute>
                            <AmbientStudy />
                        </ProtectedRoute>
                    } />
                    <Route path="/location-tracker" element={
                        <ProtectedRoute>
                            <LocationTracker />
                        </ProtectedRoute>
                    } />
                    <Route path="/playlists" element={
                        <ProtectedRoute>
                            <Playlists />
                        </ProtectedRoute>
                    } />

                    {/* Marketplace Routes */}
                    <Route path="/marketplace" element={
                        <ProtectedRoute>
                            <Marketplace />
                        </ProtectedRoute>
                    } />
                    <Route path="/marketplace/:id" element={
                        <ProtectedRoute>
                            <ResourceDetails />
                        </ProtectedRoute>
                    } />
                    <Route path="/upload-resource" element={
                        <ProtectedRoute>
                            <UploadResource />
                        </ProtectedRoute>
                    } />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
