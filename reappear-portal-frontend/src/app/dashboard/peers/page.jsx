"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import './Peers.css';

export default function Peers() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('All');
    const [selectedSemester, setSelectedSemester] = useState('All');
    const [selectedSubject, setSelectedSubject] = useState('All');

    // State for backend data
    const [peersData, setPeersData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch from Node.js Backend
    useEffect(() => {
        const fetchPeers = async () => {
            try {
                // Backend controller updated logic automatically filters 
                // based on the logged-in user's token
                const response = await api.get('/peers');
                setPeersData(response.data);
            } catch (error) {
                console.error("Failed to fetch peers...", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPeers();
    }, []);

    // Extract unique filter options dynamically from the fetched data
    const branches = ['All', ...new Set(peersData.map(p => p.branch))];
    const allSubjects = new Set();

    peersData.forEach(peer => {
        peer.reappears.forEach(r => {
            allSubjects.add(r.subject);
        });
    });

    const semesters = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];
    const subjects = ['All', ...Array.from(allSubjects).sort()];

    // Complex Filter Logic
    const filteredPeers = peersData.filter(peer => {
        const matchesBranch = selectedBranch === 'All' || peer.branch === selectedBranch;
        const nameMatchesSearch = peer.name.toLowerCase().includes(searchTerm.toLowerCase());

        const hasValidReappear = peer.reappears.some(r => {
            const matchesSem = selectedSemester === 'All' || String(r.semester) === selectedSemester;
            const matchesSub = selectedSubject === 'All' || r.subject === selectedSubject;
            const subjectMatchesSearch = r.subject.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesSem && matchesSub && (nameMatchesSearch || subjectMatchesSearch);
        });

        return matchesBranch && hasValidReappear;
    });

    return (
        <ProtectedRoute>
        <div className="page-container" style={{ marginTop: '100px' }}>
            <div className="page-header" style={{ textAlign: 'center' }}>
                <h1 className="page-title">Connect Peers</h1>
                <p>Find classmates preparing for the same reappear exams.</p>
            </div>

            {/* Top Controls */}
            <div className="controls-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by student or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select className="filter-select" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                    {branches.map((branch, index) => (
                        <option key={index} value={branch}>{branch === 'All' ? 'All Branches' : branch}</option>
                    ))}
                </select>

                <select className="filter-select" value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                    {semesters.map((sem, index) => (
                        <option key={index} value={sem}>{sem === 'All' ? 'All Semesters' : `Semester ${sem}`}</option>
                    ))}
                </select>

                <select className="filter-select" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                    {subjects.map((subject, index) => (
                        <option key={index} value={subject}>{subject === 'All' ? 'All Subjects' : subject}</option>
                    ))}
                </select>
            </div>

            {/* Peers Cards Grid */}
            <div className="students-wrapper-box">
                {loading ? (
                    <p style={{ textAlign: 'center' }}>Loading peers...</p>
                ) : (
                    <div className="peers-grid">
                        {filteredPeers.length > 0 ? (
                            filteredPeers.map(peer => (
                                <div key={peer.id} className="peer-card">
                                    <div className="peer-avatar-wrapper">
                                        {peer.profileImage ? (
                                            <img src={`http://localhost:5001${peer.profileImage}`} alt={peer.name} className="peer-avatar-img" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                            <span className="peer-avatar-emoji">🎓</span>
                                        )}
                                    </div>

                                    <h3 className="peer-name">{peer.name}</h3>

                                    <div className="peer-details">
                                        <span className="detail-row"><strong>Roll No:</strong> {peer.rollNo}</span>
                                        <span className="detail-row"><strong>Branch:</strong> {peer.branch}</span>
                                    </div>

                                    <div className="reappear-list">
                                        <p className="reappear-list-title">Pending Reappears:</p>
                                        {peer.reappears.map((r, i) => (
                                            <span key={i} className="reappear-tag">
                                                <span className="tag-sem">Sem {r.semester}</span>
                                                <span className="tag-sub" title={`${r.subjectName} (${r.subject})`}>{r.subjectName} ({r.subject})</span>
                                            </span>
                                        ))}
                                    </div>

                                    <button
                                        className="message-peer-btn"
                                        onClick={() => {
                                            const query = new URLSearchParams({
                                                name: peer.name, 
                                                type: 'student',
                                                avatar: peer.profileImage || '👨‍🎓'
                                            }).toString();
                                            router.push(`/dashboard/messages?${query}`);
                                        }}
                                        style={{ width: '100%', padding: '12px', background: '#1a1a1a', color: 'white', borderRadius: '10px', marginTop: '15px', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        Message Peer
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="no-results">
                                <span className="empty-icon">📭</span>
                                <h2>No Students Found</h2>
                                <p>There are no students matching this specific branch, semester, and subject combination.</p>
                                <button
                                    className="theme-btn clear-btn"
                                    onClick={() => {
                                        setSearchTerm(''); setSelectedBranch('All'); setSelectedSemester('All'); setSelectedSubject('All');
                                    }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
        </ProtectedRoute>
    );
}