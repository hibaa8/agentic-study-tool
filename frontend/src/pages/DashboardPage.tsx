import { useEffect, useState } from 'react';
import { fetchMe, syncServices, generateWeeklyPlan, triageInbox, createStudyBlocks, getTasks, addTask, toggleTask, clearTasks, getCalendarActivities, addCalendarActivity } from '../services/api';
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

    // New state for saved tasks and synced blocks
    const [savedTasks, setSavedTasks] = useState<any[]>([]);
    const [addedBlockIds, setAddedBlockIds] = useState<Set<string>>(new Set());
    const [showSpam, setShowSpam] = useState(false);

    // Load saved tasks and activities on mount
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [tasks, activities] = await Promise.all([
                    getTasks(),
                    getCalendarActivities()
                ]);
                setSavedTasks(tasks);

                // Track already added blocks
                const added = new Set<string>();
                activities.forEach((act: any) => added.add(`${act.title}-${act.start}`));
                setAddedBlockIds(added);
            } catch (error) {
                console.error('Failed to load initial data:', error);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        fetchMe().then(data => {
            setUser(data.user);
            if (!data.isConnected) navigate('/login');
        }).catch(() => navigate('/login'))
            .finally(() => setLoading(false));
    }, [navigate]);

    // Persist state to localStorage
    useEffect(() => {
        if (plan) localStorage.setItem('focusOS_plan', JSON.stringify(plan));
    }, [plan]);

    useEffect(() => {
        if (triage.length > 0) localStorage.setItem('focusOS_triage', JSON.stringify(triage));
    }, [triage]);

    useEffect(() => {
        if (proposedBlocks.length > 0) localStorage.setItem('focusOS_blocks', JSON.stringify(proposedBlocks));
    }, [proposedBlocks]);

    const handleSync = async (type: 'gmail' | 'calendar' | 'all') => {
        setLoading(true);
        await syncServices(type);
        setLoading(false);
        alert(`Synced ${type}!`);
    };

    const handleGeneratePlan = async () => {
        setLoading(true);
        const res = await generateWeeklyPlan(new Date().toISOString());
        setPlan(res);
        if (res.studyBlocks) setProposedBlocks(res.studyBlocks);
        setLoading(false);
    };

    const handleSaveChecklist = async () => {
        if (!plan?.tasks || plan.tasks.length === 0) return;

        setLoading(true);
        try {
            // Clear existing tasks first
            await clearTasks();

            // Save each task from the plan to the database
            for (const task of plan.tasks) {
                const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await addTask(taskId, task.title, `${task.estMins} mins • ${task.priority} priority`);
            }

            // Reload saved tasks
            const tasks = await getTasks();
            setSavedTasks(tasks);
            alert('Checklist saved!');
        } catch (e: any) {
            alert('Save failed: ' + e.message);
        }
        setLoading(false);
    };

    const handleToggleTask = async (taskId: string) => {
        try {
            await toggleTask(taskId);
            // Reload tasks to reflect the change
            const tasks = await getTasks();
            setSavedTasks(tasks);
        } catch (e: any) {
            console.error('Toggle failed:', e);
            alert('Failed to toggle task. See console for details.');
        }
    };

    const handleTriage = async () => {
        setLoading(true);
        const res = await triageInbox();
        setTriage(res);
        setLoading(false);
    };

    const handleCreateBlocks = async (blocksToCreate?: any[]) => {
        const targetBlocks = blocksToCreate || proposedBlocks;
        if (targetBlocks.length === 0) return;

        setLoading(true);
        try {
            await createStudyBlocks(targetBlocks, true);
            alert('Study blocks created in Calendar!');

            // Track which blocks were added to hide buttons
            if (blocksToCreate) {
                const newAdded = new Set(addedBlockIds);
                for (const b of blocksToCreate) {
                    newAdded.add(`${b.title}-${b.start}`);
                    // Save to backend calendar activity log
                    try {
                        await addCalendarActivity(
                            `block_${Date.now()}_${Math.random()}`,
                            b.title,
                            b.start,
                            b.end
                        );
                    } catch (e) {
                        console.warn('Failed to log calendar activity:', e);
                    }
                }
                setAddedBlockIds(newAdded);
            }

            if (!blocksToCreate) setProposedBlocks([]);
        } catch (e: any) {
            alert('Error: ' + e.message);
        }
        setLoading(false);
    };

    if (loading && !user) return <div>Loading...</div>;

    return (
        <div className="container">
            <header className="flex justify-between items-center" style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#535bf2' }}>FocusOS</h1>
                <div className="flex items-center" style={{ gap: '1.5rem' }}>
                    <span style={{ fontWeight: 500 }}>Hello, {user?.name || 'User'}</span>
                    <button
                        onClick={() => navigate('/learning')}
                        style={{ background: '#6366f1', color: 'white' }}
                    >
                        📚 Learning Resources
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        style={{ background: 'transparent', color: '#666', border: '1px solid #ccc', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="flex row" style={{ alignItems: 'flex-start', justifyContent: 'center', gap: '2rem' }}>
                {/* Column 1: Sync then Weekly Plan */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <h2>Sync Services</h2>
                        <div className="flex row" style={{ gap: '0.5rem' }}>
                            <button onClick={() => handleSync('gmail')} disabled={loading}>Sync Gmail</button>
                            <button onClick={() => handleSync('calendar')} disabled={loading}>Sync Calendar</button>
                            <button onClick={() => handleSync('all')} disabled={loading}>Sync All</button>
                        </div>
                    </div>

                    {/* Weekly Plan */}
                    <div className="card">
                        <h2>Weekly Plan</h2>
                        <button onClick={handleGeneratePlan} disabled={loading} style={{ width: '100%' }}>
                            {loading ? 'Generating...' : 'Generate New Plan'}
                        </button>

                        {/* Main Task Checklist (Shows saved tasks if present, otherwise plan preview) */}
                        {((plan && plan.tasks) || (savedTasks.length > 0)) && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3>📋 Task Checklist</h3>
                                    {plan && plan.tasks && plan.tasks.length > 0 && (
                                        <button
                                            onClick={handleSaveChecklist}
                                            disabled={loading}
                                            style={{ background: '#f59e0b', color: 'white', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                        >
                                            💾 Save New Checklist
                                        </button>
                                    )}
                                </div>

                                <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                                    {(plan?.tasks || savedTasks).map((task: any, i: number) => {
                                        // Find if this task is already in our saved database
                                        const savedItem = savedTasks.find(st =>
                                            st.title.trim().toLowerCase() === task.title.trim().toLowerCase()
                                        );
                                        const isSaved = !!savedItem;
                                        const isCompleted = savedItem?.completed || false;
                                        const taskId = savedItem?._id || savedItem?.id || savedItem?.taskId;

                                        return (
                                            <div key={taskId || `preview_${i}`} style={{
                                                padding: '0.75rem',
                                                marginBottom: '0.5rem',
                                                background: '#f9f9f9',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                textDecoration: isCompleted ? 'line-through' : 'none',
                                                opacity: isCompleted ? 0.6 : 1
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isCompleted}
                                                    disabled={!isSaved}
                                                    onChange={() => taskId && handleToggleTask(taskId)}
                                                    style={{
                                                        width: '18px',
                                                        height: '18px',
                                                        cursor: isSaved ? 'pointer' : 'not-allowed',
                                                        opacity: isSaved ? 1 : 0.5
                                                    }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <strong style={{ color: '#000' }}>{task.title}</strong>
                                                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                                                        {task.description || (task.estMins ? `${task.estMins} mins • ${task.priority} priority` : '')}
                                                    </div>
                                                </div>
                                                {!isSaved && (
                                                    <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 'bold', padding: '2px 4px', border: '1px solid #f59e0b', borderRadius: '3px' }}>PREVIEW</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {plan && (
                            <div style={{ marginTop: '1rem' }}>
                                {/* Study Blocks */}
                                {plan.studyBlocks && plan.studyBlocks.length > 0 && (
                                    <div>
                                        <h3>📅 Proposed Study Blocks</h3>
                                        <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                                            {plan.studyBlocks.map((block: any, i: number) => (
                                                <div key={i} style={{
                                                    padding: '1rem',
                                                    marginBottom: '0.75rem',
                                                    background: '#f0f9ff',
                                                    borderRadius: '4px',
                                                    borderLeft: '4px solid #535bf2'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <strong style={{ color: '#000', fontSize: '1rem' }}>{block.title}</strong>
                                                            <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                                                                {new Date(block.start).toLocaleString()} → {new Date(block.end).toLocaleTimeString()}
                                                            </div>
                                                        </div>
                                                        {!addedBlockIds.has(`${block.title}-${block.start}`) && (
                                                            <button
                                                                onClick={() => handleCreateBlocks([block])}
                                                                disabled={loading}
                                                                style={{ background: '#10b981', color: 'white', padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
                                                            >
                                                                ➕ Add to Calendar
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 2: Inbox Triage */}
                <div className="card" style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                        <h2 style={{ margin: 0 }}>Inbox Triage</h2>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={showSpam} onChange={e => setShowSpam(e.target.checked)} />
                            Show Spam
                        </label>
                    </div>

                    <button onClick={handleTriage} disabled={loading} style={{ width: '100%', marginBottom: '1rem' }}>
                        {loading ? 'Triaging...' : 'Fetch & Triage Inbox'}
                    </button>

                    {triage.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                            {triage
                                .filter(item => showSpam || item.classification !== 'SPAM')
                                .map((item: any, i: number) => (
                                    <div key={i} style={{
                                        marginBottom: '1rem',
                                        padding: '1rem',
                                        background: item.classification === 'SPAM' ? '#fff1f2' : '#f9f9f9',
                                        borderRadius: '4px',
                                        borderLeft: item.classification === 'ACTION' ? '4px solid #10b981' : 'none',
                                        opacity: item.classification === 'SPAM' ? 0.8 : 1
                                    }}>
                                        <strong>{item.from}</strong>: {item.subject}
                                        <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                                            Status: <span style={{
                                                fontWeight: 'bold',
                                                color: item.classification === 'SPAM' ? 'red' : item.classification === 'ACTION' ? 'green' : '#666'
                                            }}>
                                                {item.classification}
                                            </span>
                                        </div>
                                        {item.classification !== 'SPAM' && (
                                            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'white', borderRadius: '4px' }}>
                                                {item.draftReply && (
                                                    <em style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>
                                                        Draft: {item.draftReply.substring(0, 100)}...
                                                    </em>
                                                )}
                                                <button
                                                    onClick={() => navigate('/email-reply', {
                                                        state: {
                                                            from: item.from,
                                                            subject: item.subject,
                                                            draftReply: item.draftReply,
                                                            gmailId: item.gmailId
                                                        }
                                                    })}
                                                    style={{ background: '#6366f1', color: 'white', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                                >
                                                    Reply
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            {triage.filter(item => showSpam || item.classification !== 'SPAM').length === 0 && (
                                <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No active emails found.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
