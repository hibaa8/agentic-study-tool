import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Alias BrowserRouter as Router
import AuthPage from './pages/AuthPage'; // It was AuthPage, allow it to remain AuthPage or rename file. Let's use AuthPage as it exists.
import DashboardPage from './pages/DashboardPage';
import LearningPage from './pages/LearningPage';
import EmailReplyPage from './pages/EmailReplyPage';
import FilesPage from './pages/FilesPage';

import './index.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<AuthPage />} />
                <Route path="/learning" element={<LearningPage />} />
                <Route path="/email-reply" element={<EmailReplyPage />} />
                <Route path="/files" element={<FilesPage />} />
                <Route path="/" element={<DashboardPage />} />
            </Routes>
        </Router>
    );
}

export default App;
