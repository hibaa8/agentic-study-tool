import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { sendEmail as apiSendEmail } from '../services/api';

const EmailReplyPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    // State for form fields
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);

    // Load initial data from navigation state (if passed)
    useEffect(() => {
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
        <div className="container" style={{ maxWidth: '800px' }}>
            <button onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>&larr; Back to Dashboard</button>
            <h1>Reply to Email</h1>

            <div className="card">
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>To:</label>
                    <input
                        type="email"
                        value={to}
                        onChange={e => setTo(e.target.value)}
                        placeholder="recipient@example.com"
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>Subject:</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>Message (AI Draft):</label>
                    <textarea
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        rows={15}
                        style={{ width: '100%', padding: '0.5rem', fontFamily: 'monospace' }}
                    />
                </div>

                <div className="flex" style={{ gap: '1rem' }}>
                    <button
                        onClick={handleSend}
                        disabled={sending}
                        style={{ background: '#4CAF50', color: 'white' }}
                    >
                        {sending ? 'Sending...' : 'Send Reply'}
                    </button>
                    <button onClick={() => navigate('/')} style={{ background: '#ccc' }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailReplyPage;
