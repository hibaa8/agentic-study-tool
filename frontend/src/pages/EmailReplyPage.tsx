import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { sendEmail as apiSendEmail, fetchMe } from '../services/api';

const EmailReplyPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    // State for form fields
    const [to, setTo] = useState('');
    const [from, setFrom] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);

    // Load initial data from navigation state (if passed)
    useEffect(() => {
        const loadUser = async () => {
            try {
                const user = await fetchMe();
                setFrom(user.email);
            } catch (e) {
                console.error('Failed to fetch user:', e);
            }
        };
        loadUser();

        if (state) {
            // Extract email from "From" field (format: "Name <email@domain.com>" or just "email@domain.com")
            let senderEmail = state.from || '';
            const emailMatch = senderEmail.match(/<(.+?)>/);
            if (emailMatch) {
                senderEmail = emailMatch[1]; // Extract email from angle brackets
            }

            setTo(senderEmail);
            setSubject(state.subject ? `Re: ${state.subject}` : '');
            setBody(state.draftReply || ''); // Use the AI-generated draft
        }
    }, [state]);

    const handleSend = async () => {
        if (!to || !subject || !body) {
            alert('Please fill in all fields.');
            return;
        }

        setSending(true);
        try {
            await apiSendEmail(to, subject, body);
            alert('Email sent successfully!');
            navigate('/');
        } catch (error: any) {
            alert('Failed to send: ' + error.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '900px', margin: '2rem auto' }}>
            <button
                onClick={() => navigate('/')}
                style={{
                    marginBottom: '1.5rem',
                    background: 'transparent',
                    color: '#666',
                    border: '1px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                <span>&larr;</span> Back to Dashboard
            </button>

            <h1 style={{ marginBottom: '1.5rem', fontSize: '1.8rem' }}>Compose Reply</h1>

            <div className="card" style={{ padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <label style={{ fontWeight: 'bold', color: '#666' }}>From:</label>
                    <div style={{
                        padding: '0.6rem 0.8rem',
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        color: '#374151',
                        fontWeight: 500
                    }}>
                        {from || 'hibaaltaf98@gmail.com'}
                    </div>

                    <label style={{ fontWeight: 'bold', color: '#666' }}>To:</label>
                    <input
                        type="email"
                        value={to}
                        onChange={e => setTo(e.target.value)}
                        placeholder="recipient@example.com"
                        style={{
                            padding: '0.6rem 0.8rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '1rem'
                        }}
                    />

                    <label style={{ fontWeight: 'bold', color: '#666' }}>Subject:</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        style={{
                            padding: '0.6rem 0.8rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '1rem',
                            fontWeight: 500
                        }}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', color: '#666', marginBottom: '0.5rem' }}>Message:</label>
                    <textarea
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        rows={18}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '1rem',
                            lineHeight: '1.6',
                            resize: 'vertical'
                        }}
                    />
                </div>

                <div className="flex" style={{ gap: '1.2rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                    <button
                        onClick={handleSend}
                        disabled={sending}
                        style={{
                            background: '#535bf2',
                            color: 'white',
                            padding: '0.8rem 2rem',
                            fontSize: '1rem',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(83, 91, 242, 0.2)'
                        }}
                    >
                        {sending ? '🚀 Sending...' : 'Send Email'}
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'white',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            padding: '0.8rem 1.5rem',
                            borderRadius: '8px'
                        }}
                    >
                        Discard Draft
                    </button>
                </div>
            </div>
        </div>
    );
};


export default EmailReplyPage;
