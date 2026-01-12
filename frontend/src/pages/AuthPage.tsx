

const AuthPage = () => {
    const handleLogin = () => {
        window.location.href = 'http://localhost:5001/auth/google';
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <h1>FocusOS</h1>
            <p>Your agentic study companion.</p>
            <button onClick={handleLogin}>Connect Google Account</button>
        </div>
    );
};

export default AuthPage;
