import { useEffect, useState } from 'react';
import { fetchMe, syncServices, generateWeeklyPlan, triageInbox, createStudyBlocks } from '../services/api';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Load persisted state from localStorage
    const [plan, setPlan] = useState<any>(() => {
        const saved = localStorage.getItem('focusOS_plan');
        return saved ? JSON.parse(saved) : null;
    });
    const [triage, setTriage] = useState<any[]>(() => {
        const saved = localStorage.getItem('focusOS_triage');
        return saved ? JSON.parse(saved) : [];
    });
    const [proposedBlocks, setProposedBlocks] = useState<any[]>(() => {
        const saved = localStorage.getItem('focusOS_blocks');
        return saved ? JSON.parse(saved) : [];
    });
    const [showSpam, setShowSpam] = useState(false);

    // Persist state changes to localStorage
    useEffect(() => {
        if (plan) localStorage.setItem('focusOS_plan', JSON.stringify(plan));
    }, [plan]);

    useEffect(() => {
        if (triage.length > 0) localStorage.setItem('focusOS_triage', JSON.stringify(triage));
    }, [triage]);

    useEffect(() => {
        if (proposedBlocks.length > 0) localStorage.setItem('focusOS_blocks', JSON.stringify(proposedBlocks));
    }, [proposedBlocks]);

    useEffect(() => {
        fetchMe().then(data => {
            setUser(data.user);
            if (!data.isConnected) navigate('/login');
        }).catch(() => navigate('/login'))
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleSync = async (type: 'gmail' | 'calendar' | 'all') => {
        setLoading(true);
        await syncServices(type);
        setLoading(false);
        alert(`Synced ${type}!`);
    };

    const handlePlan = async () => {
        setLoading(true);
        const res = await generateWeeklyPlan(new Date().toISOString());
        setPlan(res);
        if (res.studyBlocks) setProposedBlocks(res.studyBlocks);
        setLoading(false);
    };

    const handleTriage = async () => {
        setLoading(true);
        const res = await triageInbox();
        setTriage(res);
        setLoading(false);
    };

    const handleCreateBlocks = async () => {
        if (proposedBlocks.length === 0) return;
        setLoading(true);
        try {
            await createStudyBlocks(proposedBlocks, true);
            alert('Study blocks created in Calendar!');
            setProposedBlocks([]);
        } catch (e: any) {
            alert('Error: ' + e.message);
        }
        setLoading(false);
    };

    if (loading && !user) return <div>Loading...</div>;

    return (
        <div className="container">
            <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <h1>FocusOS Dashboard</h1>
                <div className="flex items-center">
                    <span>Welcome, {user?.name}</span>
                    <button onClick={() => navigate('/learning')} style={{ marginLeft: '1rem' }}>Learning Mode</button>
                    <button onClick={() => { fetch('/api/auth/logout', { method: 'POST' }); navigate('/login'); }} style={{ marginLeft: '1rem', background: '#ccc' }}>Logout</button>
                </div>
            </header>

            <div className="card">
                <h2>Sync Status</h2>
                <div className="flex">
                    <button onClick={() => handleSync('gmail')}>Sync Gmail</button>
                    <button onClick={() => handleSync('calendar')}>Sync Calendar</button>
                    <button onClick={() => handleSync('all')}>Sync All</button>
                </div>
            </div>

            <div className="flex row" style={{ alignItems: 'flex-start' }}>
                <div className="card" style={{ flex: 1 }}>
                    <h2>Weekly Plan</h2>
                    <button onClick={handlePlan} disabled={loading}>{loading ? 'Generating...' : 'Generate Plan'}</button>
                    {plan && (
                        <div>
                            <pre style={{ background: '#f4f4f4', padding: '1rem', overflow: 'auto' }}>
                                {JSON.stringify(plan, null, 2)}
                            </pre>
                            <button
                                onClick={async () => {
                                    if (!plan) return;
                                    setLoading(true);
                                    try {
                                        await import('../services/api').then(m => m.saveWeeklyPlan(plan));
                                        alert('Plan saved to DB!');
                                    } catch (e: any) {
                                        alert('Save failed: ' + e.message);
                                    }
                                    setLoading(false);
                                }}
                                style={{ marginTop: '1rem', background: '#4CAF50' }}
                            >
                                Save Plan to DB
                            </button>
                        </div>
                    )}
                </div>

                <div className="card" style={{ flex: 1 }}>
                    <h2>Inbox Triage</h2>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <button onClick={handleTriage} disabled={loading}>Triage Unread</button>
                        {triage.filter(i => i.classification === 'SPAM').length > 0 && (
                            <button
                                onClick={() => setShowSpam(!showSpam)}
                                style={{ background: '#888', fontSize: '0.85rem' }}
                            >
                                {showSpam ? 'Hide' : 'Show'} Spam ({triage.filter(i => i.classification === 'SPAM').length})
                            </button>
                        )}
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        {/* Non-spam emails */}
                        {triage.filter(item => item.classification !== 'SPAM').map((item, i) => (
                            <div key={i} style={{ borderBottom: '1px solid #ddd', padding: '0.5rem 0' }}>
                                <strong>[{item.classification}]</strong> {item.subject}
                                <br />
                                <button
                                    onClick={() => navigate('/email/reply', { state: item })}
                                    style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
                                >
                                    Reply
                                </button>
                                <br />
                                <small style={{ color: '#666' }}>{item.reason}</small>
                            </div>
                        ))}

                        {/* Spam emails (when toggled on) */}
                        {showSpam && triage.filter(item => item.classification === 'SPAM').map((item, i) => (
                            <div key={`spam-${i}`} style={{ borderBottom: '1px solid #ddd', padding: '0.5rem 0', background: '#f9f9f9' }}>
                                <strong style={{ color: '#999' }}>[SPAM]</strong> {item.subject}
                                <br />
                                <button
                                    onClick={() => navigate('/email/reply', { state: item })}
                                    style={{ marginTop: '0.5rem', fontSize: '0.8rem', background: '#999' }}
                                >
                                    Reply
                                </button>
                                <br />
                                <small style={{ color: '#999' }}>{item.reason}</small>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {proposedBlocks.length > 0 && (
                <div className="card" style={{ border: '2px solid #535bf2' }}>
                    <h2>Proposed Study Blocks</h2>
                    <p>Review and confirm these blocks to add them to your Google Calendar.</p>
                    <ul>
                        {proposedBlocks.map((b, i) => (
                            <li key={i}>{b.title} ({new Date(b.start).toLocaleTimeString()} - {new Date(b.end).toLocaleTimeString()})</li>
                        ))}
                    </ul>
                    <button onClick={handleCreateBlocks}>Confirm & Create Events</button>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
