import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLearningSessions, getSavedPlans } from '../services/api';

const FilesPage = () => {
    const navigate = useNavigate();
    const [learningSessions, setLearningSessions] = useState<any[]>([]);
    const [savedPlans, setSavedPlans] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'learning' | 'plans'>('learning');
    const [loading, setLoading] = useState(true);
    const [expandedSession, setExpandedSession] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [sessions, plans] = await Promise.all([
                getLearningSessions(),
                getSavedPlans()
            ]);
            setLearningSessions(sessions);
            setSavedPlans(plans);
        } catch (err: any) {
            alert('Failed to load data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString();
    };

    return (
        <div className="container">
            <button onClick={() => navigate('/')}>&larr; Back to Dashboard</button>
            <h1>Your Files</h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button
                    onClick={() => setActiveTab('learning')}
                    style={{ opacity: activeTab === 'learning' ? 1 : 0.6 }}
                >
                    Learning Sessions ({learningSessions.length})
                </button>
                <button
                    onClick={() => setActiveTab('plans')}
                    style={{ opacity: activeTab === 'plans' ? 1 : 0.6 }}
                >
                    Weekly Plans ({savedPlans.length})
                </button>
            </div>

            <div className="card" style={{ minHeight: '400px' }}>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        {activeTab === 'learning' && (
                            <div>
                                <h3>Saved Learning Sessions</h3>
                                {learningSessions.length === 0 ? (
                                    <p style={{ color: '#999' }}>No saved sessions yet. Upload and save documents in the Learning page.</p>
                                ) : (
                                    <div>
                                        {learningSessions.map((session) => (
                                            <div
                                                key={session._id}
                                                style={{
                                                    marginBottom: '1rem',
                                                    padding: '1rem',
                                                    background: '#f9f9f9',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ddd'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <strong>{session.filename}</strong>
                                                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                                                            Saved: {formatDate(session.savedAt)}
                                                        </p>
                                                        <div style={{ marginTop: '0.5rem' }}>
                                                            {session.summary && <span style={{ marginRight: '1rem', fontSize: '0.85rem', background: '#e7f3ff', padding: '0.25rem 0.5rem', borderRadius: '3px' }}>📄 Summary</span>}
                                                            {session.graph && <span style={{ marginRight: '1rem', fontSize: '0.85rem', background: '#d4edda', padding: '0.25rem 0.5rem', borderRadius: '3px' }}>🕸️ Graph</span>}
                                                            {session.quiz && <span style={{ fontSize: '0.85rem', background: '#fff3cd', padding: '0.25rem 0.5rem', borderRadius: '3px' }}>❓ Quiz</span>}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setExpandedSession(expandedSession === session._id ? null : session._id)}
                                                        style={{ background: '#535bf2', fontSize: '0.85rem' }}
                                                    >
                                                        {expandedSession === session._id ? 'Hide' : 'View'}
                                                    </button>
                                                </div>

                                                {expandedSession === session._id && (
                                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
                                                        {session.summary && (
                                                            <div style={{ marginBottom: '1rem' }}>
                                                                <h4>Summary</h4>
                                                                {session.summary.title && <p><strong>{session.summary.title}</strong></p>}
                                                                {session.summary.overview && <p>{session.summary.overview}</p>}
                                                            </div>
                                                        )}
                                                        {session.quiz && (
                                                            <div>
                                                                <h4>Quiz ({session.quiz.length} questions)</h4>
                                                                <p style={{ fontSize: '0.9rem', color: '#666' }}>Quiz questions are saved and ready to review.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'plans' && (
                            <div>
                                <h3>Saved Weekly Plans</h3>
                                {savedPlans.length === 0 ? (
                                    <p style={{ color: '#999' }}>No saved plans yet. Generate and save plans from the Dashboard.</p>
                                ) : (
                                    <div>
                                        {savedPlans.map((plan) => (
                                            <div
                                                key={plan._id}
                                                style={{
                                                    marginBottom: '1rem',
                                                    padding: '1rem',
                                                    background: '#f9f9f9',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ddd'
                                                }}
                                            >
                                                <strong>Week of {new Date(plan.weekStartDate).toLocaleDateString()}</strong>
                                                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                                                    Saved: {formatDate(plan.createdAt)}
                                                </p>
                                                <details style={{ marginTop: '0.5rem' }}>
                                                    <summary style={{ cursor: 'pointer', color: '#535bf2' }}>View Plan</summary>
                                                    <pre style={{ background: '#fff', padding: '1rem', marginTop: '0.5rem', overflow: 'auto', fontSize: '0.85rem' }}>
                                                        {JSON.stringify(JSON.parse(plan.planJson), null, 2)}
                                                    </pre>
                                                </details>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FilesPage;
